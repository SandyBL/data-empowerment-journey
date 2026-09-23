/**
 * Minimal Markdown renderer covering the subset used by the blog content:
 * headings, paragraphs, bold/italic/inline-code, links, images, ordered and
 * unordered lists, blockquotes, pipe tables, fenced code blocks, ASCII
 * diagrams, flows of steps typed as text, and horizontal rules.
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
 * A heading with its inline Markdown notation removed.
 *
 * A heading is not only a line of prose: the same string becomes the anchor id,
 * the table-of-contents row, and -- when it ends in a question mark -- the
 * `name` of an FAQ entry in the article's structured data. All three want the
 * words, not the notation. A linked heading such as
 * `### The [Data Owner](/en/glossary/data-owner/) (Strategic Accountability)`
 * was producing the id `the-data-owner-en-glossary-data-owner-strategic-...`
 * and a contents row that read the URL out loud, so the notation is stripped
 * once, here, before anything is derived from it.
 */
export const plainText = (markdown) =>
  markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(ESCAPABLE_PUNCTUATION, '$1')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * A horizontal rule, in every spelling Markdown allows for one: three or more
 * dashes, asterisks or underscores, with or without spaces between them.
 *
 * The spaces are the reason this is a named pattern rather than `---`. The Blog
 * Content Studio's rich-text editor serialises every rule the author inserts as
 * `- - -`, and a rule written that way used to match the bullet-list pattern
 * before anything recognised it as a rule: each one published as a stray
 * one-item list reading "- -", and a rule that followed a real list was
 * swallowed into it as an extra bullet. So an article was fine until somebody
 * opened it in the editor and saved it, which is the worst version of this bug
 * — the corruption arrived with a save that changed nothing else.
 */
const THEMATIC_BREAK = /^\s*(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/;

/**
 * A fenced code block's delimiter: three or more backticks or tildes, with an
 * optional language name after the opening one.
 *
 * Nothing recognised a fence before this, so both the delimiters and the lines
 * between them were read as prose. The three backticks reached the page as
 * literal text and the content they were protecting was re-wrapped into a
 * paragraph, which collapses every run of spaces -- so anything whose meaning
 * is in its alignment arrived as a run-on sentence.
 */
const FENCE = /^\s*(`{3,}|~{3,})\s*([^`~\s]*)\s*$/;

/**
 * The parts of ASCII box art, which is how an author who writes in Markdown
 * draws a diagram: a border line of dashes between two plus signs, a row of
 * text between two pipes, and the arrows that join one box to the next.
 *
 * The leading pipe is optionally escaped because the rich-text editor escapes
 * it on the way out -- a line it saved reads `\| STRATEGIC ACCOUNTABILITY ... |`
 * -- and the table pattern further down would otherwise be the only thing in
 * this renderer that recognised the character at all.
 */
const ASCII_BORDER = /^\s*\+[-=+\s]*[-=]{3,}[-=+\s]*\+\s*$/;
const ASCII_ROW = /^\s*\|(.*)\|\s*$/;
const ASCII_JOINT = /^[\s\u2502\u2503\u2506\u250a\u2500\u2501\u2550\u25b2\u25bc\u25c4\u25ba\u2190\u2191\u2192\u2193^vV<>|+=\\/-]*$/;
/** A pipe table's second row, which is the one thing that is never box art. */
const TABLE_DELIMITER = /^\s*\|[\s:|-]+\|\s*$/;

/**
 * ASCII box art, re-assembled from what the editor left of it.
 *
 * A diagram drawn in characters is the one kind of content whose meaning is
 * entirely in its whitespace, and it is also the kind the Blog Content Studio
 * damages worst. Saving an article puts a blank line between every pair of
 * lines, so each row of the drawing becomes a separate Markdown paragraph;
 * escapes the pipes that draw the sides; and wraps the indented arrow lines in
 * code fences of its own invention. The author sees the drawing intact in the
 * editor and a column of stray paragraphs on the published page, each one
 * re-wrapped and its padding collapsed -- which is the bug this fixes.
 *
 * So a run of box-art lines is collected as one drawing, the blank lines and
 * the invented fences are dropped, and the escapes are undone.
 *
 * The geometry is then rebuilt, but only for a drawing whose rows each hold a
 * single cell -- boxes stacked one above the next, which is the shape the
 * editor mangles and the shape whose widths no longer agree with each other by
 * the time they arrive. Every border becomes as wide as the widest row, every
 * row is padded to meet it, and every arrow is centred under the box above it.
 * A row with an interior pipe is a column in a wider drawing, and there is no
 * way to widen one column without moving every other one, so those are kept
 * exactly as the author aligned them.
 *
 * A run has to contain at least two borders and one row to be a drawing at all,
 * which is what keeps prose, thematic breaks and pipe tables out of it: a table
 * has no border line, so a table falls through to the table branch as before.
 *
 * Returns the finished block and the line to resume at, or null when the run is
 * not box art.
 */
const asciiDiagram = (lines, start, labels) => {
  const parts = [];
  let index = start;
  let borders = 0;
  let rows = 0;

  while (index < lines.length) {
    const line = lines[index];
    // Blank lines and stray fences are the editor's punctuation, not the
    // author's drawing, so neither survives into the rebuilt block.
    if (!line.trim() || FENCE.test(line)) {
      index += 1;
      continue;
    }

    const bare = line.replace(/\\([|+])/g, '$1').trimEnd();
    if (ASCII_BORDER.test(bare)) {
      parts.push({ kind: 'border', text: bare.trimStart() });
      borders += 1;
      index += 1;
      continue;
    }

    // A row whose next line is a table's delimiter is a table header, so the
    // drawing stops short of it rather than swallowing the table behind it.
    const row = bare.match(ASCII_ROW);
    if (row && !TABLE_DELIMITER.test(lines[index + 1] ?? '')) {
      parts.push({ kind: 'row', text: row[1].trim(), cells: row[1].includes('|'), raw: bare });
      rows += 1;
      index += 1;
      continue;
    }

    if (ASCII_JOINT.test(bare)) {
      parts.push({ kind: 'joint', text: bare.trim(), raw: bare });
      index += 1;
      continue;
    }

    break;
  }

  if (borders < 2 || rows < 1) return null;

  const stacked = parts.every((part) => part.kind !== 'row' || !part.cells);
  if (!stacked) {
    const kept = parts.map((part) => part.raw ?? part.text);
    return { block: renderCodeBlock(kept.join('\n'), '', labels.diagram), next: index };
  }

  const width = Math.max(...parts.filter((part) => part.kind === 'row').map((part) => part.text.length));
  const border = `+${'-'.repeat(width + 2)}+`;
  const drawing = parts
    .filter((part) => part.kind !== 'joint' || part.text)
    .map((part) => {
      if (part.kind === 'border') return border;
      if (part.kind === 'row') return `| ${part.text.padEnd(width)} |`;
      const lead = Math.max(0, Math.round((width + 4 - part.text.length) / 2));
      return `${' '.repeat(lead)}${part.text}`;
    });

  return { block: renderCodeBlock(drawing.join('\n'), '', labels.diagram), next: index };
};

/**
 * The arrow an author types between two steps of a flow: a run of dashes or
 * equals signs ending in `>` (each character optionally backslash-escaped, the
 * way the rich-text editor saves them), an em or en dash standing in for the
 * dashes after a typographic replacement, or one of the arrow characters.
 */
const FLOW_ARROW = String.raw`(?:(?:\\?[-=–—])+\\?>|[→⟶⇒➔➜])`;
const FLOW_ARROW_CELL = new RegExp(`^${FLOW_ARROW}$`);
/** One step in the bracket spelling, `[ Employee ]`, optionally escaped as `\[`. */
const FLOW_NODE = String.raw`\\?\[[^\]\n]+\]`;
/** A whole line of them: `[ Employee ] ---> [ Public LLM ] ---> [ Fines ]`. */
const BRACKET_FLOW = new RegExp(`^\\s*${FLOW_NODE}(?:\\s*${FLOW_ARROW}\\s*${FLOW_NODE})+\\s*$`);
const FLOW_NODE_TEXT = /\\?\[\s*([^\]\n]+?)\s*\]/g;

/** A line that begins some other kind of block, and so is never a flow's title or caption. */
const BLOCK_START = /^\s*(#{1,6}\s|>|\\?\||\\?\+|[*-]\s|\d+\.\s|!\[)/;

/** The cells of a pipe row, with the editor's escaped pipes undone. */
const pipeCells = (line) => {
  const row = line.replace(/\\([|+])/g, '$1').match(ASCII_ROW);
  return row ? row[1].split('|').map((cell) => cell.trim()) : null;
};

/**
 * The steps of a pipe row that reads as a flow -- `| Ingestion | ---> |
 * Transformation | ---> | Storage |` -- or null. The cells have to alternate
 * strictly between a step and an arrow, which is what keeps an ordinary table
 * row out: no table puts an arrow in every other column.
 */
const pipeFlowSteps = (cells) => {
  if (!cells || cells.length < 3 || cells.length % 2 === 0) return null;
  const steps = cells.filter((cell, position) => position % 2 === 0);
  const arrows = cells.filter((cell, position) => position % 2 === 1);
  if (steps.some((cell) => !cell || FLOW_ARROW_CELL.test(cell))) return null;
  if (!arrows.every((cell) => FLOW_ARROW_CELL.test(cell))) return null;
  return steps.map((label) => ({ label, notes: [] }));
};

/**
 * A flow of steps typed as text, starting at `start`, or null.
 *
 * Authors draw a process the only way plain text allows, and articles pasted in
 * from elsewhere arrive with the drawing intact but the meaning lost: the
 * bracket spelling was published as a paragraph of brackets and dashes, the
 * pipe spelling was dropped altogether (it starts with a pipe, so the paragraph
 * branch refused it, and it has no delimiter row, so the table branch did too),
 * and the boxed spelling was published as a scrolling monospace block. All
 * three are read here into the same list of steps, so they can be drawn as a
 * diagram in the site's own style instead.
 *
 * Two spellings are understood:
 *
 *   [ Business User ] ---> [ Ticket Queue ] ---> [ Delayed Insight ]
 *
 *   +-----------------+      +----------------+
 *   | Ingestion Phase | ---> | Storage Phase  |
 *   | (Uncaught Nulls)|      | (Bad Tables)   |
 *   +-----------------+      +----------------+
 *
 * In the second, the borders are optional, the first row that alternates steps
 * and arrows names the steps, and every row after it with the same number of
 * cells adds a note under each one. A row of nothing but empty cells, and the
 * border lines, are the drawing's scaffolding and are dropped -- that is what a
 * bracket drawn under all the boxes looks like once it is read as cells. The
 * editor's habit of putting a blank line between every line is tolerated.
 *
 * Returns the steps and the line after the last one that belonged to the flow.
 */
const flowAt = (lines, start) => {
  const first = lines[start] ?? '';
  if (BRACKET_FLOW.test(first)) {
    const steps = [...first.matchAll(FLOW_NODE_TEXT)].map(([, label]) => ({ label, notes: [] }));
    return { steps, next: start + 1 };
  }

  const unescaped = (line) => line.replace(/\\([|+])/g, '$1');
  if (!ASCII_ROW.test(unescaped(first)) && !ASCII_BORDER.test(unescaped(first))) return null;

  let steps = null;
  let width = 0;
  let index = start;
  let next = start;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const bare = unescaped(line);
    if (ASCII_BORDER.test(bare)) {
      index += 1;
      next = index;
      continue;
    }
    const cells = pipeCells(line);
    if (!cells) break;
    if (!steps) {
      // A table's header row sits on top of its delimiter, and the table branch
      // is the one that should have it.
      if (TABLE_DELIMITER.test(lines[index + 1] ?? '')) return null;
      steps = pipeFlowSteps(cells);
      if (!steps) return null;
      width = cells.length;
    } else if (cells.every((cell) => !cell)) {
      // Scaffolding: the uprights of a bracket drawn under the boxes.
    } else if (cells.length === width && !TABLE_DELIMITER.test(bare)) {
      cells.forEach((cell, position) => {
        if (position % 2 === 0 && cell) steps[position / 2].notes.push(cell);
      });
    } else break;
    index += 1;
    next = index;
  }

  return steps ? { steps, next } : null;
};

/**
 * A one-line paragraph that ends in a colon and introduces the flow under it --
 * `Unliterate AI Usage (High Risk):` -- which becomes the flow's title.
 */
const isFlowTitle = (line) => {
  const text = line.trim();
  return text.length > 1 && text.length <= 140 && text.endsWith(':') && !BLOCK_START.test(text) && !BRACKET_FLOW.test(text);
};

/**
 * A short line straight after a diagram that names it rather than continuing
 * the prose -- `Silent Degradation Across the Value Chain` -- which becomes the
 * figure's caption. It has to stand alone as a paragraph, read as a label (a
 * dozen words at most, no closing punctuation), and not introduce a flow of its
 * own; anything longer or punctuated is a sentence and stays one.
 */
const isFlowCaption = (lines, index) => {
  const text = (lines[index] ?? '').trim();
  if (!text || (lines[index + 1] ?? '').trim()) return false;
  if (BLOCK_START.test(text) || THEMATIC_BREAK.test(text) || FENCE.test(text) || BRACKET_FLOW.test(text)) return false;
  if (/[.,;:!?]$/.test(text) || text.length > 90 || text.split(/\s+/).length > 12) return false;
  return true;
};

/**
 * Every flow in a run, with the title above each and the caption under the
 * last, starting at `start`; or null when no flow starts there.
 *
 * Flows are usually written in pairs -- the way it goes wrong, then the way it
 * should go -- each introduced by its own titled line, so consecutive flows are
 * gathered into one figure where they can be read against each other.
 */
const flowGroup = (lines, start) => {
  const rows = [];
  let index = start;

  while (index < lines.length) {
    let title = '';
    let cursor = index;
    if (isFlowTitle(lines[cursor] ?? '')) {
      title = lines[cursor].trim().replace(/:$/, '').trim();
      cursor = skipBlankLines(lines, cursor + 1);
    }
    const flow = flowAt(lines, cursor);
    if (!flow) break;
    rows.push({ title, steps: flow.steps });
    index = skipBlankLines(lines, flow.next);
  }

  if (!rows.length) return null;

  let caption = '';
  if (isFlowCaption(lines, index)) {
    caption = lines[index].trim();
    index += 1;
  }
  return { rows, caption, next: index };
};

/**
 * A flow group as a figure: each flow an ordered list of steps, because the
 * order is the content, with the arrows drawn by the stylesheet between the
 * items rather than typed into them, so a screen reader hears "list, 3 items"
 * instead of "dash dash dash greater than" between every step.
 */
const renderFlowGroup = ({ rows, caption }, imageSize) => {
  const flows = rows
    .map(({ title, steps }) => {
      const heading = title ? `<div class="flow-diagram-title">${renderInline(title, imageSize)}</div>` : '';
      const items = steps
        .map(({ label, notes }) => {
          const detail = notes
            .map((note) => `<span class="flow-diagram-note">${renderInline(note.replace(/^\((.*)\)$/, '$1'), imageSize)}</span>`)
            .join('');
          return `<li><span class="flow-diagram-label">${renderInline(label, imageSize)}</span>${detail}</li>`;
        })
        .join('');
      return `<div class="flow-diagram-row">${heading}<ol class="flow-diagram-steps">${items}</ol></div>`;
    })
    .join('');
  const figcaption = caption ? `<figcaption>${renderInline(caption, imageSize)}</figcaption>` : '';
  return `<figure class="flow-diagram">${flows}${figcaption}</figure>`;
};

/**
 * Accessible names for pre-formatted blocks.
 *
 * A `pre` here is focusable, so it is announced, and an announcement has to be
 * in the language of the page around it -- a Spanish article that reads out
 * "Code block" has told its reader nothing. `renderMarkdown` is given the
 * article's language by its caller and falls back to English for the pages
 * that have no language of their own.
 */
const PRE_LABELS = {
  en: { code: 'Code block', diagram: 'Diagram, scrollable' },
  es: { code: 'Bloque de código', diagram: 'Diagrama, desplazable' },
  pt: { code: 'Bloco de código', diagram: 'Diagrama, rolável' },
};

/**
 * One <pre>, holding text whose spacing is the point.
 *
 * The block does not wrap, so a drawing wider than the prose column scrolls
 * sideways. That makes it a scrollable region, and a scrollable region reachable
 * only by dragging is content a keyboard reader cannot get to at all -- hence
 * `tabindex="0"`, which puts the block in the tab order so the arrow keys can
 * pan it. The accessible name comes from `role="group"` plus the label, without
 * which a screen reader announces the stop as an unlabelled focusable blank.
 */
const renderCodeBlock = (content, language = '', label = 'Code block') => {
  const tag = language ? ` class="language-${slugify(language)}"` : '';
  return `<pre tabindex="0" role="group" aria-label="${escapeHtml(label)}"><code${tag}>${escapeHtml(content)}</code></pre>`;
};

/**
 * The standard Markdown image, with the optional title the Blog Content Studio
 * writes when the author fills in the caption field of its image component:
 * `![alt](/assets/images/blog/diagram.svg "Caption")`.
 *
 * The source is matched as a single token, so a path with a space in it is a
 * path this renderer declines rather than one it silently truncates.
 *
 * The token may be empty, which is how the studio serialises an image
 * component that was opened and saved without a file being chosen: `![]()`.
 * Matching it is what lets renderMarkdown drop it -- the pattern used to
 * require a source, so those two characters reached the page as the literal
 * text `![]()` at the foot of the article.
 */
const IMAGE_SOURCE = String.raw`!\[([^\]]*)\]\(\s*([^)\s]*)(?:\s+"([^"]*)")?\s*\)`;
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
 * `imageSize` is optional and comes from scripts/lib/media.mjs, which finds the
 * file behind a source and reads its intrinsic dimensions. Two things come back
 * from it. `src` is the path the file is actually served from, which is not
 * always the path written in the Markdown -- a draft that names
 * `/images/diagram.svg` for a picture the editor uploaded to
 * `/assets/images/blog/` is corrected here rather than published broken. And
 * width and height are carried when the format could be measured, because an
 * image that arrives without them is laid out twice -- once at no height, again
 * once it loads -- and that second pass is a layout shift on a page whose field
 * performance the studio reports.
 */
const renderImage = (alt, source, imageSize) => {
  const resolved = imageSize?.(source);
  const src = resolved?.src ?? source;
  const dimensions =
    resolved?.width && resolved?.height ? ` width="${resolved.width}" height="${resolved.height}"` : '';
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${dimensions} loading="lazy" decoding="async">`;
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
    // An image component saved without a file names no picture, so there is
    // nothing to render and no alt text worth keeping in its place either.
    if (!source) return '';
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

/**
 * A block scalar header -- the `|` or `>` that stands where a value would be
 * and says the value is the indented lines underneath it, optionally followed
 * by a chomping indicator (`-` drops the trailing blank lines, `+` keeps them
 * all) and an explicit indentation digit.
 *
 * The Blog Content Studio writes one for every text field long enough to wrap.
 * A Summary of more than about a line is saved as `summary: >-` with the words
 * on the lines below, and read as an ordinary scalar the header itself became
 * the value: the two characters `>-` were published at the front of the
 * summary, which is the deck under the headline, the meta description, and the
 * text every search result and social card quotes.
 */
const BLOCK_SCALAR_HEADER = /^([|>])(?:([-+]?)(\d*)|(\d*)([-+]?))$/;

const indentWidth = (line) => line.length - line.trimStart().length;

/**
 * The value of a block scalar: every following line indented deeper than the
 * key it belongs to, joined the way the header asks for.
 *
 * `|` keeps the line breaks. `>` folds each run of lines into a single line and
 * turns a blank line between two runs into the one newline that separates two
 * paragraphs. An explicit indentation digit is read but not honoured -- the
 * margin is taken from the first content line instead, which is the same answer
 * for every block the studio writes and for any hand-written one that is
 * indented consistently.
 *
 * Returns the value and the index of the first line that is not part of it.
 */
const readBlockScalar = (lines, start, keyIndent, style, chomp) => {
  let end = start;
  while (end < lines.length && (!lines[end].trim() || indentWidth(lines[end]) > keyIndent)) end += 1;

  const body = lines.slice(start, end);
  const margin = indentWidth(body.find((line) => line.trim()) ?? '');
  const text = body.map((line) => (line.trim() ? line.slice(margin) : ''));

  // Trailing blank lines are the chomping indicator's business, so they come
  // off here and go back on below according to it.
  let trailing = 0;
  while (text.length && !text[text.length - 1]) {
    text.pop();
    trailing += 1;
  }

  let value =
    style === '|'
      ? text.join('\n')
      : text.reduce((folded, line, position) => {
          if (position === 0) return line;
          if (!line) return `${folded}\n`;
          return folded.endsWith('\n') ? `${folded}${line}` : `${folded} ${line}`;
        }, '');

  if (chomp === '+') value += '\n'.repeat(trailing);
  else if (chomp !== '-' && value) value += '\n';

  return { value, next: end };
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
  const blocks = new Set();
  const lines = match[1].split('\n');
  let currentKey = '';
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    index += 1;

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
      if (currentKey && !blocks.has(currentKey) && /^\s+/.test(line)) {
        raw[currentKey] = `${raw[currentKey]} ${line.trim()}`;
      }
      continue;
    }
    currentKey = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    // A block scalar consumes its own lines, so the loop resumes past them
    // rather than letting the continuation branch above glue the header to the
    // text -- and rather than letting a line such as `  Author: Someone`, which
    // is prose inside the block, be mistaken for the next key.
    const header = value.match(BLOCK_SCALAR_HEADER);
    if (header) {
      const style = header[1];
      const chomp = header[2] || header[5] || '';
      const block = readBlockScalar(lines, index, indentWidth(line), style, chomp);
      raw[currentKey] = block.value;
      blocks.add(currentKey);
      index = block.next;
      continue;
    }

    raw[currentKey] = value;
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
export const renderMarkdown = (markdown, { imageSize, lang } = {}) => {
  const labels = PRE_LABELS[lang] ?? PRE_LABELS.en;
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

    // A flow typed as text, before anything else can claim its lines: the boxed
    // spelling starts with a border the box-art branch below would take, and
    // the pipe spelling with a pipe the table branch would test.
    const flows = flowGroup(lines, index);
    if (flows) {
      html.push(renderFlowGroup(flows, imageSize));
      index = flows.next;
      continue;
    }

    // Box art first: the run it belongs to can contain the code fences the
    // editor wrapped around parts of it, so the fence branch below must not get
    // to those lines first and cut the drawing in half.
    if (ASCII_BORDER.test(line.replace(/\\([|+])/g, '$1'))) {
      const diagram = asciiDiagram(lines, index, labels);
      if (diagram) {
        html.push(diagram.block);
        index = diagram.next;
        continue;
      }
    }

    const fence = line.match(FENCE);
    if (fence) {
      const [, delimiter, language] = fence;
      const closing = new RegExp(`^\\s*${delimiter[0]}{${delimiter.length},}\\s*$`);
      const content = [];
      index += 1;
      while (index < lines.length && !closing.test(lines[index])) content.push(lines[index++]);
      // An unclosed fence runs to the end of the document, which is what every
      // Markdown implementation does with one and what keeps a half-typed block
      // from silently dropping the rest of the article.
      if (index < lines.length) index += 1;
      html.push(renderCodeBlock(content.join('\n'), language, labels.code));
      continue;
    }

    if (THEMATIC_BREAK.test(line)) {
      html.push('<hr>');
      index += 1;
      continue;
    }

    // An image alone on its line becomes a figure rather than a paragraph with
    // an image in it: the caption then belongs to the image instead of floating
    // beside it, and the image escapes the prose spacing and the drop cap that
    // the article body applies to a <p>.
    const standaloneImage = line.match(IMAGE_ALONE);
    // Same as in renderInline: an image component with no file behind it is
    // dropped. It has to be caught here too, because otherwise the line falls
    // through to the paragraph branch below and publishes an empty <p>.
    if (standaloneImage && !standaloneImage[2]) {
      index += 1;
      continue;
    }
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
      const label = plainText(text);
      const id = uniqueId(label);
      if (level === 2 || level === 3) headings.push({ id, level, text: label });
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
        // A rule spelled `- - -` matches the bullet pattern below, so it is
        // ruled out here first: it ends the list rather than joining it.
        if (THEMATIC_BREAK.test(lines[index])) break;
        if (!pattern.test(lines[index])) {
          // Same reasoning as blockquotes: a blank line between bullets is a
          // loose list, which should still render as one list.
          const resumed = skipBlankLines(lines, index);
          if (resumed === index || !pattern.test(lines[resumed] || '')) break;
          if (THEMATIC_BREAK.test(lines[resumed])) break;
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
    while (
      index < lines.length &&
      lines[index].trim() &&
      !THEMATIC_BREAK.test(lines[index]) &&
      !FENCE.test(lines[index]) &&
      !BRACKET_FLOW.test(lines[index]) &&
      !/^\s*(#{1,6}\s|>|\||[*-]\s|\d+\.\s)/.test(lines[index])
    ) {
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
