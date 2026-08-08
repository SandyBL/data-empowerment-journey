/**
 * Minimal Markdown renderer covering the subset used by the blog content:
 * headings, paragraphs, bold/italic/inline-code, links, ordered and unordered
 * lists, blockquotes, pipe tables, and horizontal rules.
 *
 * It exists so articles can be rendered to static HTML at build time instead of
 * being assembled in the browser, which is what makes them indexable.
 */

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const renderInline = (text) =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) =>
      /^(https?:|\/|#|mailto:)/.test(href) ? `<a href="${href}">${label}</a>` : label
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');

const parseFrontMatter = (source) => {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { attributes: {}, body: source };

  const unquote = (value) =>
    (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))
      ? value.slice(1, -1)
      : value;

  const attributes = {};
  let currentKey = '';
  for (const line of match[1].split('\n')) {
    // Sequence entries collect under the key above them, which YAML leaves
    // empty (`redirect_from:` followed by `  - old-slug`). Requiring that empty
    // value keeps a wrapped text line starting with a dash a string, not a list.
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && currentKey && (attributes[currentKey] === '' || Array.isArray(attributes[currentKey]))) {
      if (!Array.isArray(attributes[currentKey])) attributes[currentKey] = [];
      attributes[currentKey].push(unquote(item[1].trim()));
      continue;
    }

    const separator = line.indexOf(':');
    // Indented continuation lines belong to the previous key (folded YAML scalars).
    if (separator < 0 || (/^\s+/.test(line) && currentKey && !/^\s*[\w-]+\s*:/.test(line))) {
      if (currentKey && /^\s+/.test(line)) attributes[currentKey] = `${attributes[currentKey]} ${line.trim()}`;
      continue;
    }
    currentKey = line.slice(0, separator).trim();
    attributes[currentKey] = unquote(line.slice(separator + 1).trim());
  }
  return { attributes, body: match[2] };
};

const renderTable = (rows) => {
  const cells = (row) =>
    row
      .replace(/^\s*\|/, '')
      .replace(/\|\s*$/, '')
      .split('|')
      .map((cell) => cell.trim());

  const header = cells(rows[0]);
  const bodyRows = rows.slice(2).map(cells);
  const headerHtml = header.map((cell) => `<th>${renderInline(cell)}</th>`).join('');
  const bodyHtml = bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
};

/** Renders Markdown to HTML and returns the generated heading outline. */
export const renderMarkdown = (markdown) => {
  const lines = markdown.split('\n');
  const html = [];
  const headings = [];
  const usedIds = new Set();
  let index = 0;

  const uniqueId = (text) => {
    const base = slugify(text) || 'section';
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    return id;
  };

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      html.push('<hr>');
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = uniqueId(text);
      if (level === 2 || level === 3) headings.push({ id, level, text });
      html.push(`<h${level} id="${id}">${renderInline(text)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[index + 1] || '')) {
      const rows = [];
      while (index < lines.length && /^\s*\|/.test(lines[index])) rows.push(lines[index++]);
      html.push(renderTable(rows));
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoted = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quoted.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }
      // Blockquotes can hold their own blocks (lists, headings), so recurse.
      html.push(`<blockquote>${renderMarkdown(quoted.join('\n')).html}</blockquote>`);
      continue;
    }

    const listMatch = line.match(/^\s*([*-]|\d+\.)\s+/);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[1]);
      const pattern = ordered ? /^\s*\d+\.\s+/ : /^\s*[*-]\s+/;
      const items = [];
      while (index < lines.length && pattern.test(lines[index])) {
        let item = lines[index].replace(pattern, '');
        index += 1;
        // Absorb wrapped continuation lines that are not a new list item.
        while (index < lines.length && lines[index].trim() && !/^\s*([*-]|\d+\.|#|>|\|)/.test(lines[index])) {
          item += ` ${lines[index].trim()}`;
          index += 1;
        }
        items.push(`<li>${renderInline(item.trim())}</li>`);
      }
      html.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !/^\s*(#{1,6}\s|>|\||[*-]\s|\d+\.\s|---\s*$)/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    if (paragraph.length) html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    else index += 1;
  }

  return { html: html.join('\n'), headings };
};

export const readingTimeMinutes = (body) => Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 210));

export { escapeHtml, parseFrontMatter };
