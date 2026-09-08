/**
 * Minimal Markdown renderer covering the subset used by the blog content:
 * headings, paragraphs, bold/italic/inline-code, links, images, ordered and
 * unordered lists, blockquotes, pipe tables, and horizontal rules.
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

/**
 * Markdown punctuation a backslash can escape. Editors paste `\*` or `\[` when
 * they mean a literal character, so without this the backslash survives into the
 * published page and the character it protects is still read as formatting.
 */
const ESCAPABLE_PUNCTUATION = /\\([\\`*_{}[\]()#+\-.!<>|~"'$%&/:;=?@^])/g;

/**
 * The standard Markdown image, with the optional title the Blog Content Studio
 * writes when the author fills in the caption field of its image component:
 * `![alt](/assets/images/blog/diagram.svg "Caption")`.
 *
 * The source is matched as a single token, so a path with a space in it is a
 * path this renderer declines rather than one it silently truncates.
 */
const IMAGE_SOURCE = String.raw`!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)`;
const IMAGE_INLINE = new RegExp(IMAGE_SOURCE, 'g');
/** The same image alone on its line, which is what becomes a <figure> below. */
const IMAGE_ALONE = new RegExp(`^\\s*${IMAGE_SOURCE}\\s*$`);

/**
 * Sources an <img> may point at: a path this site serves, or an https URL.
 * Anything else -- a `javascript:` source, an inline `data:` payload, or a bare
 * filename that would resolve against whatever directory the page happens to
 * sit in -- renders as its alt text, which is how a link this renderer cannot
 * vouch for is already treated.
 */
const isServableImage = (source) => /^(https:\/\/|\/)\S*$/.test(source);

/** Every image source a document points at, for the build's existence check. */
export const imageSources = (markdown) =>
  [...markdown.matchAll(IMAGE_INLINE)].map(([, , source]) => source).filter(isServableImage);

/**
 * One <img>.
 *
 * `imageSize` is optional and comes from scripts/lib/media.mjs, which reads the
 * intrinsic dimensions off the file itself. When it answers, the tag carries
 * width and height, because an image that arrives without them is laid out
 * twice -- once at no height, again once it loads -- and that second pass is a
 * layout shift on a page whose field performance the studio reports.
 */
const renderImage = (alt, source, imageSize) => {
  const size = imageSize?.(source);
  const dimensions = size ? ` width="${size.width}" height="${size.height}"` : '';
  return `<img src="${escapeHtml(source)}" alt="${escapeHtml(alt)}"${dimensions} loading="lazy" decoding="async">`;
};

const renderInline = (text, imageSize) => {
  // Escaped characters are parked behind a marker no source text can contain, so
  // the formatting passes below cannot mistake them for syntax, then restored.
  const literals = [];
  const parked = text.replace(ESCAPABLE_PUNCTUATION, (match, character) => {
    literals.push(character);
    return `\u0000${literals.length - 1}\u0000`;
  });

  // Images are rendered here, ahead of the escaping pass, and parked behind a
  // marker of their own. Their alt text and source are attribute values, so
  // they are escaped once -- by renderImage -- and must not be escaped again as
  // part of the finished tag. Parking them is also what stops the link pass
  // below from reading `![alt](src)` as a link with a stray `!` in front of it,
  // which is exactly what it used to publish.
  const images = [];
  const withImages = parked.replace(IMAGE_INLINE, (match, alt, source) => {
    if (!isServableImage(source)) return alt;
    images.push(renderImage(alt, source, imageSize));
    return `\u0001${images.length - 1}\u0001`;
  });

  return escapeHtml(withImages)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) =>
      /^(https?:|\/|#|mailto:)/.test(href) ? `<a href="${href}">${label}</a>` : label
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Images before literals: a parked image can carry an escaped character in
    // its alt text, and restoring the literals last is what resolves it.
    .replace(/\u0001(\d+)\u0001/g, (match, position) => images[Number(position)])
    .replace(/\u0000(\d+)\u0000/g, (match, position) => escapeHtml(literals[Number(position)]));
};

const parseFrontMatter = (source) => {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { attributes: {}, body: source };

  const unquote = (value) =>
    (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))
      ? value.slice(1, -1)
      : value;

  // Scalars are assembled first and unquoted afterwards. A quoted title long
  // enough to wrap only closes its quote on the last line, so unquoting line by
  // line saw an opening quote with no closing one, left both in place, and put
  // them in the h1, the <title>, the share links and the schema headline.
  const raw = {};
  let currentKey = '';
  for (const line of match[1].split('\n')) {
    // Sequence entries collect under the key above them, which YAML leaves
    // empty (`redirect_from:` followed by `  - old-slug`). Requiring that empty
    // value keeps a wrapped text line starting with a dash a string, not a list.
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && currentKey && (raw[currentKey] === '' || Array.isArray(raw[currentKey]))) {
      if (!Array.isArray(raw[currentKey])) raw[currentKey] = [];
      raw[currentKey].push(unquote(item[1].trim()));
      continue;
    }

    const separator = line.indexOf(':');
    // Indented continuation lines belong to the previous key (folded YAML scalars).
    if (separator < 0 || (/^\s+/.test(line) && currentKey && !/^\s*[\w-]+\s*:/.test(line))) {
      if (currentKey && /^\s+/.test(line)) raw[currentKey] = `${raw[currentKey]} ${line.trim()}`;
      continue;
    }
    currentKey = line.slice(0, separator).trim();
    raw[currentKey] = line.slice(separator + 1).trim();
  }

  const attributes = {};
  for (const [key, value] of Object.entries(raw)) {
    attributes[key] = Array.isArray(value) ? value : unquote(value);
  }
  return { attributes, body: match[2] };
};

/** Advances past a run of blank lines and reports where content resumes. */
const skipBlankLines = (lines, index) => {
  let cursor = index;
  while (cursor < lines.length && !lines[cursor].trim()) cursor += 1;
  return cursor;
};

const renderTable = (rows, imageSize) => {
  const cells = (row) =>
    row
      .replace(/^\s*\|/, '')
      .replace(/\|\s*$/, '')
      .split('|')
      .map((cell) => cell.trim());

  const header = cells(rows[0]);
  const bodyRows = rows.slice(2).map(cells);
  const headerHtml = header.map((cell) => `<th>${renderInline(cell, imageSize)}</th>`).join('');
  const bodyHtml = bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell, imageSize)}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
};

/**
 * Renders Markdown to HTML and returns the generated heading outline.
 *
 * `imageSize` is the optional lookup described on renderImage: given an image
 * source it returns the intrinsic dimensions of the file behind it, or nothing.
 * Callers that have not read the files leave it out and the images render
 * without a reserved box.
 */
export const renderMarkdown = (markdown, { imageSize } = {}) => {
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

    // An image alone on its line becomes a figure rather than a paragraph with
    // an image in it: the caption then belongs to the image instead of floating
    // beside it, and the image escapes the prose spacing and the drop cap that
    // the article body applies to a <p>.
    const standaloneImage = line.match(IMAGE_ALONE);
    if (standaloneImage && isServableImage(standaloneImage[2])) {
      const [, alt, source, title] = standaloneImage;
      const caption = title ? `<figcaption>${renderInline(title, imageSize)}</figcaption>` : '';
      html.push(`<figure>${renderImage(alt, source, imageSize)}${caption}</figure>`);
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = uniqueId(text);
      if (level === 2 || level === 3) headings.push({ id, level, text });
      html.push(`<h${level} id="${id}">${renderInline(text, imageSize)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[index + 1] || '')) {
      const rows = [];
      while (index < lines.length && /^\s*\|/.test(lines[index])) rows.push(lines[index++]);
      html.push(renderTable(rows, imageSize));
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoted = [];
      while (index < lines.length) {
        if (/^\s*>\s?/.test(lines[index])) {
          quoted.push(lines[index].replace(/^\s*>\s?/, ''));
          index += 1;
          continue;
        }
        // A blank line between quoted lines is a paragraph break inside the
        // quote, not the end of it, so the quote survives loose formatting.
        const resumed = skipBlankLines(lines, index);
        if (resumed === index || !/^\s*>\s?/.test(lines[resumed] || '')) break;
        quoted.push('');
        index = resumed;
      }
      // Blockquotes can hold their own blocks (lists, headings), so recurse.
      html.push(`<blockquote>${renderMarkdown(quoted.join('\n'), { imageSize }).html}</blockquote>`);
      continue;
    }

    const listMatch = line.match(/^\s*([*-]|\d+\.)\s+/);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[1]);
      const pattern = ordered ? /^\s*\d+\.\s+/ : /^\s*[*-]\s+/;
      const items = [];
      while (index < lines.length) {
        if (!pattern.test(lines[index])) {
          // Same reasoning as blockquotes: a blank line between bullets is a
          // loose list, which should still render as one list.
          const resumed = skipBlankLines(lines, index);
          if (resumed === index || !pattern.test(lines[resumed] || '')) break;
          index = resumed;
        }
        let item = lines[index].replace(pattern, '');
        index += 1;
        // Absorb wrapped continuation lines that are not a new list item.
        while (index < lines.length && lines[index].trim() && !/^\s*([*-]|\d+\.|#|>|\|)/.test(lines[index])) {
          item += ` ${lines[index].trim()}`;
          index += 1;
        }
        items.push(`<li>${renderInline(item.trim(), imageSize)}</li>`);
      }
      html.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !/^\s*(#{1,6}\s|>|\||[*-]\s|\d+\.\s|---\s*$)/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    if (paragraph.length) html.push(`<p>${renderInline(paragraph.join(' '), imageSize)}</p>`);
    else index += 1;
  }

  return { html: html.join('\n'), headings };
};

export const readingTimeMinutes = (body) => Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 210));

export { escapeHtml, parseFrontMatter };
