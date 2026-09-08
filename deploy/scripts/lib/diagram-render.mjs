/**
 * The house style for the diagrams that illustrate blog articles.
 *
 * Every article carries the same diagram in three languages, and Spanish and
 * Portuguese run roughly a fifth longer than the English they translate. Hand-
 * placed coordinates cannot survive that: a label that fits its box in English
 * overflows it in Portuguese, and nothing in an SVG complains -- the text
 * simply runs out of the card and over the border, which is exactly the sort of
 * detail that makes a diagram look homemade.
 *
 * So the layouts here take content and compute geometry, and the text measurer
 * below is what makes that possible. It carries Helvetica's advance widths,
 * which is close enough to the sans stack these files ask for, and every layout
 * wraps against a real width rather than a guessed character count. A word that
 * cannot fit the box it was given raises rather than overflowing it, so a label
 * that is too long fails `npm run diagrams` instead of shipping.
 *
 * The palette and the card treatment come from assets/css/blog.css, so a
 * diagram sits inside an article rather than on top of it.
 */

/** Matches the --ink/--mint/--mint-dark/--coral family in assets/css/blog.css. */
export const PALETTE = {
  ink: '#071c2c',
  inkSoft: '#31505c',
  teal: '#0a7568',
  mint: '#62e6bd',
  blue: '#095b73',
  coral: '#ec6d57',
  cardFill: '#f8fafc',
  cardLine: '#dfe3e7',
  white: '#ffffff',
};

/**
 * The accent applied to consecutive items. Four hues in a fixed order, so the
 * first card of every diagram on the site is the same dark navy and the reader
 * is not asked to learn a new colour code per article.
 */
const ACCENTS = [PALETTE.ink, PALETTE.teal, PALETTE.blue, PALETTE.coral];
export const accentFor = (index) => ACCENTS[index % ACCENTS.length];

const FONT_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Canvas geometry every layout shares, so the diagrams line up with each other. */
export const CANVAS = { width: 720, margin: 24, top: 48 };
const INNER = CANVAS.width - CANVAS.margin * 2;

/**
 * Helvetica advance widths in 1/1000 em for the printable ASCII range. The sans
 * stack resolves to system-ui on most machines, which is a little narrower than
 * this, so measuring against Helvetica errs towards wrapping early -- the safe
 * direction, since a short line looks intentional and a long one does not.
 */
const ASCII_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

/** Punctuation the copy actually uses that sits outside the ASCII table. */
const EXTRA_WIDTHS = {
  '—': 1000, '–': 556, '·': 278, '…': 1000, '×': 584, '→': 1000,
  '“': 333, '”': 333, '‘': 191, '’': 191, '¿': 611, '¡': 278, 'º': 365, 'ª': 370, '%': 889,
};

/**
 * An accented letter advances like the letter it is built from, so decomposing
 * and dropping the combining marks covers every diacritic the three languages
 * use without a table entry per character.
 */
const advance = (character) => {
  const code = character.codePointAt(0);
  if (code >= 32 && code <= 126) return ASCII_WIDTHS[code - 32];
  if (EXTRA_WIDTHS[character]) return EXTRA_WIDTHS[character];
  const stripped = character.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const base = stripped.codePointAt(0);
  return base >= 32 && base <= 126 ? ASCII_WIDTHS[base - 32] : 556;
};

/** Bold is wider than regular at the same size; 7% is the average over a line of prose. */
const weightFactor = (weight) => (weight >= 600 ? 1.07 : weight >= 500 ? 1.04 : 1);

/**
 * Headroom for the font the reader actually gets.
 *
 * The stack above resolves to SF Pro, Segoe UI or Roboto on the platforms most
 * readers are on, and all three are narrower than the Helvetica metrics below.
 * But a Linux visitor without any of them, or a rasterizer generating a social
 * preview, falls all the way back to DejaVu Sans, which renders about 13%
 * wider -- enough to push a full-width line out past the card border. Budgeting
 * for the widest substitution costs a slightly early wrap on the common fonts,
 * which nobody notices, and buys a layout that holds together on all of them.
 */
const SUBSTITUTION_HEADROOM = 1.14;

/** Rendered width of a string, in the units the viewBox is expressed in. */
export const measure = (text, size, { weight = 400, tracking = 0 } = {}) => {
  const glyphs = [...text];
  const em = glyphs.reduce((total, character) => total + advance(character), 0) / 1000;
  return (
    em * size * weightFactor(weight) * SUBSTITUTION_HEADROOM +
    tracking * Math.max(glyphs.length - 1, 0)
  );
};

/**
 * Greedy word wrap against a real width.
 *
 * A single word longer than the box is not something this can solve by
 * wrapping, so it raises: the fix belongs in the content, either a shorter term
 * or a wider layout, and both are decisions for whoever is writing the diagram.
 */
export const wrap = (text, maxWidth, size, options = {}) => {
  const lines = [];
  let current = '';

  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measure(candidate, size, options) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (measure(current, size, options) > maxWidth) {
      throw new Error(
        `"${current}" does not fit ${Math.round(maxWidth)}px at ${size}px. Shorten the label.`
      );
    }
  }

  if (current) lines.push(current);
  return lines;
};

/**
 * Asserts a string the layout draws on one fixed line actually fits it.
 *
 * Kickers, titles and axis labels are not wrapped by design -- a two-line
 * kicker would break the rhythm of the cards -- so they need the same check
 * wrapping gives the body copy, or a long translation silently runs over the
 * card border.
 */
const fit = (value, maxWidth, size, options = {}) => {
  const width = measure(value, size, options);
  if (width > maxWidth) {
    throw new Error(
      `"${value}" is ${Math.round(width)}px at ${size}px and has to fit ` +
        `${Math.round(maxWidth)}px on one line. Shorten it.`
    );
  }
  return value;
};

/** Wraps, then refuses to silently drop a line the layout has no room for. */
const wrapExactly = (text, maxWidth, size, allowed, options = {}) => {
  const lines = wrap(text, maxWidth, size, options);
  if (lines.length > allowed) {
    throw new Error(
      `"${text}" needs ${lines.length} lines at ${size}px in ${Math.round(maxWidth)}px, ` +
        `and the layout allows ${allowed}. Shorten it.`
    );
  }
  return lines;
};

const escapeXml = (value) =>
  String(value).replace(/[&<>"]/g, (character) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[character]};`);

const attributes = (map) =>
  Object.entries(map)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
    .join('');

const text = (x, y, content, { size, weight, fill, tracking, anchor, transform } = {}) =>
  `<text${attributes({
    x,
    y,
    'font-size': size,
    'font-weight': weight === 400 ? undefined : weight,
    fill,
    'letter-spacing': tracking,
    'text-anchor': anchor,
    transform,
  })}>${escapeXml(content)}</text>`;

const rect = (x, y, width, height, { fill, stroke, radius } = {}) =>
  `<rect${attributes({ x, y, width, height, rx: radius, fill, stroke })}/>`;

/** A run of wrapped lines, top line first, on a fixed leading. */
const lineStack = (x, firstBaseline, lines, { size, leading, fill, anchor, weight }) =>
  lines.map((line, index) =>
    text(x, firstBaseline + index * leading, line, { size, fill, anchor, weight })
  );

/** Uppercase eyebrow above the diagram, naming what the reader is looking at. */
const eyebrow = (label) =>
  text(CANVAS.margin, 24, fit(label, INNER, 10.5, { weight: 700, tracking: 1.6 }), {
    size: 10.5,
    weight: 700,
    tracking: 1.6,
    fill: PALETTE.teal,
  });

const MARKERS = `  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="${PALETTE.inkSoft}"/>
    </marker>
    <marker id="arrow-loop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="${PALETTE.teal}"/>
    </marker>
  </defs>`;

/**
 * Wraps a layout's body in the SVG envelope.
 *
 * role="img" with a title and a description is what a screen reader announces:
 * the title is the short name, the description is the sentence a sighted reader
 * gets from the picture. The viewBox is what scripts/lib/media.mjs reads to put
 * width and height on the <img>, which is why every layout returns a height
 * rather than padding to a fixed one.
 */
const envelope = ({ title, description, height, body }) =>
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.width}" height="${height}" ` +
      `viewBox="0 0 ${CANVAS.width} ${height}" role="img" aria-labelledby="title desc" ` +
      `font-family="${FONT_STACK}">`,
    `  <title id="title">${escapeXml(title)}</title>`,
    `  <desc id="desc">${escapeXml(description)}</desc>`,
    '',
    MARKERS,
    '',
    ...body.map((node) => `  ${node}`),
    '</svg>',
    '',
  ].join('\n');

// ---------------------------------------------------------------------------
// Layouts. Each takes the diagram's content and returns { height, body }.
// ---------------------------------------------------------------------------

/**
 * Full-width cards in a vertical sequence, joined by arrows: the shape for
 * anything that is a chain of accountability or an ordered set of steps.
 *
 * `loop` reserves a gutter down the left for a dashed return path -- the
 * escalation route in the data quality diagram, and the same idea wherever the
 * last item feeds back into an earlier one.
 */
const stack = ({ items, loop }) => {
  const x = loop ? 96 : CANVAS.margin;
  const cardWidth = CANVAS.width - x - CANVAS.margin;
  const textX = x + 24;
  const textWidth = cardWidth - 48;
  const body = [];
  const centres = [];
  let y = CANVAS.top;

  items.forEach((item, index) => {
    const lines = wrapExactly(item.body, textWidth, 12.5, 2);
    const height = 26 + 24 + 22 + (lines.length - 1) * 17 + 15;
    const accent = item.accent ?? accentFor(index);

    body.push(
      `<!-- ${item.title} -->`,
      rect(x, y, cardWidth, height, { fill: PALETTE.cardFill, stroke: PALETTE.cardLine, radius: 5 }),
      rect(x, y, 4, height, { fill: accent }),
      text(textX, y + 26, fit(item.kicker, textWidth, 10, { weight: 700, tracking: 1.4 }), {
        size: 10,
        weight: 700,
        tracking: 1.4,
        fill: accent,
      }),
      text(textX, y + 50, fit(item.title, textWidth, 17, { weight: 600 }), {
        size: 17,
        weight: 600,
        fill: PALETTE.ink,
      }),
      ...lineStack(textX, y + 72, lines, { size: 12.5, leading: 17, fill: PALETTE.inkSoft })
    );

    centres.push({ top: y, bottom: y + height, mid: y + height / 2 });
    y += height;

    if (index < items.length - 1) {
      body.push(
        `<line x1="${x + cardWidth / 2}" y1="${y + 2}" x2="${x + cardWidth / 2}" y2="${y + 26}" ` +
          `stroke="${PALETTE.inkSoft}" stroke-width="1.5" marker-end="url(#arrow)"/>`
      );
      y += 28;
    }
  });

  if (loop) {
    const from = centres[centres.length - 1];
    const to = centres[1];
    const gutter = 62;
    body.push(
      `<!-- ${loop.label}: the path that closes the loop. -->`,
      `<path d="M ${x} ${from.top + 60} H ${gutter} V ${to.top + 52} H ${x - 4}" fill="none" ` +
        `stroke="${PALETTE.teal}" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arrow-loop)"/>`,
      text(gutter - 10, (from.top + to.top) / 2 + 30, loop.label, {
        size: 10,
        weight: 700,
        tracking: 1.2,
        fill: PALETTE.teal,
        anchor: 'middle',
        transform: `rotate(-90 ${gutter - 10} ${(from.top + to.top) / 2 + 30})`,
      })
    );
  }

  return { height: y + 22, body };
};

/**
 * A two-column grid of equal cards: the shape for a set whose members are
 * peers, where the reader is meant to scan rather than follow an order.
 */
const cards = ({ items }) => {
  const gap = 20;
  const cardWidth = (INNER - gap) / 2;
  const textWidth = cardWidth - 44;
  const wrapped = items.map((item) => wrapExactly(item.body, textWidth, 11.8, 3));
  const rows = Math.max(...wrapped.map((lines) => lines.length));
  const cardHeight = 65 + (rows - 1) * 16 + 16;
  const body = [];

  items.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = CANVAS.margin + column * (cardWidth + gap);
    const y = CANVAS.top + row * (cardHeight + gap);
    const accent = item.accent ?? accentFor(index);
    const textX = x + 20;

    body.push(
      `<!-- ${item.title} -->`,
      rect(x, y, cardWidth, cardHeight, {
        fill: PALETTE.cardFill,
        stroke: PALETTE.cardLine,
        radius: 5,
      }),
      rect(x, y, 4, cardHeight, { fill: accent }),
      text(textX, y + 24, fit(item.kicker, textWidth, 9.5, { weight: 700, tracking: 1.3 }), {
        size: 9.5,
        weight: 700,
        tracking: 1.3,
        fill: accent,
      }),
      text(textX, y + 45, fit(item.title, textWidth, 15, { weight: 600 }), {
        size: 15,
        weight: 600,
        fill: PALETTE.ink,
      }),
      ...lineStack(textX, y + 65, wrapped[index], {
        size: 11.8,
        leading: 16,
        fill: PALETTE.inkSoft,
      })
    );
  });

  const rowCount = Math.ceil(items.length / 2);
  return { height: CANVAS.top + rowCount * cardHeight + (rowCount - 1) * gap + 22, body };
};

/**
 * Boxes left to right with arrows between them, each with a caption below: the
 * shape for a pipeline, where the point is that the stages happen in order and
 * something specific has to be true at each one.
 */
const flow = ({ stages, axis, loop }) => {
  const gap = stages.length <= 3 ? 22 : 16;
  const boxWidth = (INNER - gap * (stages.length - 1)) / stages.length;
  const boxHeight = 56;
  const body = [];
  const captions = stages.map((stage) => wrapExactly(stage.body, boxWidth - 8, 11, 5));
  const captionRows = Math.max(...captions.map((lines) => lines.length));

  stages.forEach((stage, index) => {
    const x = CANVAS.margin + index * (boxWidth + gap);
    const centre = x + boxWidth / 2;
    const accent = stage.accent ?? accentFor(index);
    const titleLines = wrapExactly(stage.title, boxWidth - 16, 13, 2, { weight: 600 });
    const firstBaseline = CANVAS.top + (titleLines.length === 1 ? 36 : 28);

    body.push(
      `<!-- ${stage.title} -->`,
      rect(x, CANVAS.top, boxWidth, boxHeight, {
        fill: PALETTE.cardFill,
        stroke: PALETTE.cardLine,
        radius: 5,
      }),
      rect(x, CANVAS.top, boxWidth, 4, { fill: accent }),
      ...lineStack(centre, firstBaseline, titleLines, {
        size: 13,
        leading: 16,
        weight: 600,
        fill: PALETTE.ink,
        anchor: 'middle',
      }),
      ...lineStack(centre, CANVAS.top + boxHeight + 24, captions[index], {
        size: 11,
        leading: 15,
        fill: PALETTE.inkSoft,
        anchor: 'middle',
      })
    );

    if (index < stages.length - 1) {
      const midY = CANVAS.top + boxHeight / 2;
      body.push(
        `<line x1="${x + boxWidth + 4}" y1="${midY}" x2="${x + boxWidth + gap - 4}" y2="${midY}" ` +
          `stroke="${PALETTE.inkSoft}" stroke-width="1.5" marker-end="url(#arrow)"/>`
      );
    }
  });

  let bottom = CANVAS.top + boxHeight + 24 + (captionRows - 1) * 15 + 12;

  if (loop) {
    const left = CANVAS.margin + boxWidth / 2;
    const right = CANVAS.width - CANVAS.margin - boxWidth / 2;
    const lane = bottom + 30;
    body.push(
      `<!-- ${loop.label}: what sends the reader back to the first stage. -->`,
      `<path d="M ${right} ${bottom + 4} V ${lane} H ${left} V ${bottom + 8}" fill="none" ` +
        `stroke="${PALETTE.teal}" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arrow-loop)"/>`,
      rect(CANVAS.width / 2 - measure(loop.label, 10, { weight: 700, tracking: 1.2 }) / 2 - 10, lane - 9, measure(loop.label, 10, { weight: 700, tracking: 1.2 }) + 20, 18, { fill: PALETTE.white }),
      text(CANVAS.width / 2, lane + 3.5, loop.label, {
        size: 10,
        weight: 700,
        tracking: 1.2,
        fill: PALETTE.teal,
        anchor: 'middle',
      })
    );
    bottom = lane + 20;
  }

  if (axis) {
    const y = bottom + 16;
    body.push(
      `<line x1="${CANVAS.margin}" y1="${y}" x2="${CANVAS.width - CANVAS.margin}" y2="${y}" ` +
        `stroke="${PALETTE.cardLine}" stroke-width="1.5" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`,
      text(CANVAS.margin, y + 18, axis.from, { size: 10, weight: 700, tracking: 1.2, fill: PALETTE.inkSoft }),
      text(CANVAS.width - CANVAS.margin, y + 18, axis.to, {
        size: 10,
        weight: 700,
        tracking: 1.2,
        fill: PALETTE.inkSoft,
        anchor: 'end',
      })
    );
    bottom = y + 26;
  }

  return { height: bottom + 12, body };
};

/**
 * Two disciplines with a shared column between them: the shape for the things
 * that belong to both sides, where the argument is about which half of each
 * artifact each side owns.
 */
const bridge = ({ left, right, middle, rows }) => {
  const gap = 12;
  const columnWidth = (INNER - gap * 2) / 3;
  const columns = [CANVAS.margin, CANVAS.margin + columnWidth + gap, CANVAS.margin + (columnWidth + gap) * 2];
  const headerHeight = 34;
  const body = [];

  [
    { label: left, fill: PALETTE.ink },
    { label: middle, fill: PALETTE.coral },
    { label: right, fill: PALETTE.blue },
  ].forEach((header, index) => {
    body.push(
      rect(columns[index], CANVAS.top, columnWidth, headerHeight, { fill: header.fill, radius: 5 }),
      text(columns[index] + columnWidth / 2, CANVAS.top + 22, fit(header.label, columnWidth - 16, 10.5, { weight: 700, tracking: 1.3 }), {
        size: 10.5,
        weight: 700,
        tracking: 1.3,
        fill: PALETTE.white,
        anchor: 'middle',
      })
    );
  });

  const cellWidth = columnWidth - 28;
  const wrapped = rows.map((row) => ({
    artifact: wrapExactly(row.artifact, cellWidth, 14, 2, { weight: 600 }),
    left: wrapExactly(row.left, cellWidth, 11.4, 4),
    right: wrapExactly(row.right, cellWidth, 11.4, 4),
  }));
  const rowHeight = 26 + Math.max(...wrapped.map((row) => Math.max(row.left.length, row.right.length))) * 16;
  let y = CANVAS.top + headerHeight + 10;

  // Rows are all as tall as the tallest cell, so shorter cells need centring
  // rather than the top alignment that would leave them floating.
  const cellBaseline = (top, count, leading) =>
    top + rowHeight / 2 - ((count - 1) * leading) / 2 + 5;

  wrapped.forEach((row, index) => {
    body.push(`<!-- ${rows[index].artifact} -->`);
    [
      { column: 0, lines: row.left, accent: PALETTE.ink },
      { column: 2, lines: row.right, accent: PALETTE.blue },
    ].forEach(({ column, lines, accent }) => {
      body.push(
        rect(columns[column], y, columnWidth, rowHeight, {
          fill: PALETTE.cardFill,
          stroke: PALETTE.cardLine,
          radius: 5,
        }),
        rect(columns[column], y, 4, rowHeight, { fill: accent }),
        ...lineStack(columns[column] + 18, cellBaseline(y, lines.length, 16), lines, {
          size: 11.4,
          leading: 16,
          fill: PALETTE.inkSoft,
        })
      );
    });

    body.push(
      rect(columns[1], y, columnWidth, rowHeight, {
        fill: PALETTE.white,
        stroke: PALETTE.coral,
        radius: 5,
      }),
      ...lineStack(columns[1] + columnWidth / 2, cellBaseline(y, row.artifact.length, 17), row.artifact, {
        size: 14,
        leading: 17,
        weight: 600,
        fill: PALETTE.ink,
        anchor: 'middle',
      }),
      `<line x1="${columns[0] + columnWidth + 1}" y1="${y + rowHeight / 2}" x2="${columns[1] - 3}" ` +
        `y2="${y + rowHeight / 2}" stroke="${PALETTE.inkSoft}" stroke-width="1.2" marker-end="url(#arrow)"/>`,
      `<line x1="${columns[2] - 1}" y1="${y + rowHeight / 2}" x2="${columns[1] + columnWidth + 3}" ` +
        `y2="${y + rowHeight / 2}" stroke="${PALETTE.inkSoft}" stroke-width="1.2" marker-end="url(#arrow)"/>`
    );

    y += rowHeight + 10;
  });

  return { height: y + 12, body };
};

/**
 * Four quadrants. With axes it is a positioning grid -- two variables crossed,
 * and the reader finds the square they are standing in. Without them it is a
 * model whose four parts have to hold at once, which is the same picture read a
 * different way.
 */
const matrix = ({ quadrants, axisX, axisY }) => {
  const gap = 20;
  const gutter = axisY ? 54 : 0;
  const quadrantWidth = (INNER - gutter - gap) / 2;
  const originX = CANVAS.margin + gutter;
  const body = [];
  const wrapped = quadrants.map((quadrant) =>
    wrapExactly(quadrant.body, quadrantWidth - 44, 11.8, 4)
  );
  const quadrantHeight = 68 + Math.max(...wrapped.map((lines) => lines.length)) * 16 + 12;

  quadrants.forEach((quadrant, index) => {
    const x = originX + (index % 2) * (quadrantWidth + gap);
    const y = CANVAS.top + Math.floor(index / 2) * (quadrantHeight + gap);
    const accent = quadrant.accent ?? accentFor(index);

    body.push(
      `<!-- ${quadrant.title} -->`,
      rect(x, y, quadrantWidth, quadrantHeight, {
        fill: PALETTE.cardFill,
        stroke: PALETTE.cardLine,
        radius: 5,
      }),
      rect(x, y, quadrantWidth, 4, { fill: accent }),
      text(x + 20, y + 28, fit(quadrant.kicker, quadrantWidth - 40, 9.5, { weight: 700, tracking: 1.3 }), {
        size: 9.5,
        weight: 700,
        tracking: 1.3,
        fill: accent,
      }),
      text(x + 20, y + 50, fit(quadrant.title, quadrantWidth - 40, 16, { weight: 600 }), {
        size: 16,
        weight: 600,
        fill: PALETTE.ink,
      }),
      ...lineStack(x + 20, y + 70, wrapped[index], {
        size: 11.8,
        leading: 16,
        fill: PALETTE.inkSoft,
      })
    );
  });

  const gridBottom = CANVAS.top + quadrantHeight * 2 + gap;
  let height = gridBottom + 14;

  if (axisY) {
    const midY = CANVAS.top + quadrantHeight + gap / 2;
    body.push(
      `<line x1="${CANVAS.margin + 34}" y1="${gridBottom}" x2="${CANVAS.margin + 34}" y2="${CANVAS.top}" ` +
        `stroke="${PALETTE.cardLine}" stroke-width="1.5" marker-end="url(#arrow)"/>`,
      text(CANVAS.margin + 26, midY, axisY, {
        size: 10,
        weight: 700,
        tracking: 1.2,
        fill: PALETTE.inkSoft,
        anchor: 'middle',
        transform: `rotate(-90 ${CANVAS.margin + 26} ${midY})`,
      })
    );
  }

  if (axisX) {
    const y = gridBottom + 18;
    body.push(
      `<line x1="${originX}" y1="${y}" x2="${CANVAS.width - CANVAS.margin}" y2="${y}" ` +
        `stroke="${PALETTE.cardLine}" stroke-width="1.5" marker-end="url(#arrow)"/>`,
      text(originX + (INNER - gutter) / 2, y + 18, axisX, {
        size: 10,
        weight: 700,
        tracking: 1.2,
        fill: PALETTE.inkSoft,
        anchor: 'middle',
      })
    );
    height = y + 28;
  }

  return { height, body };
};

/**
 * A centre with a ring around it: the shape for one thing that governs several
 * others, which is the claim the DMBOK wheel makes about governance.
 *
 * Six positions at sixty degrees, because that is what fits a 720-wide canvas
 * without the left and right pills leaving the page.
 */
const hub = ({ centre, centreNote, spokes }) => {
  const cx = CANVAS.width / 2;
  const cy = 300;
  const radius = 96;
  const pillWidth = 188;
  const pillHeight = 40;
  const ringX = 214;
  const ringY = 196;
  const body = [];

  const angles = [-90, -30, 30, 90, 150, 210];
  const positions = angles.map((angle) => ({
    x: cx + ringX * Math.cos((angle * Math.PI) / 180),
    y: cy + ringY * Math.sin((angle * Math.PI) / 180),
  }));

  // The rim, drawn first: the pills sit on top of it, so what stays visible is
  // the six arcs between them. That reads as a wheel, where individual spokes
  // would not -- a pill is only about twenty pixels clear of the hub at its
  // nearest corner, so a spoke to it is a stub rather than a line.
  body.push(
    `<ellipse cx="${cx}" cy="${cy}" rx="${ringX}" ry="${ringY}" fill="none" ` +
      `stroke="${PALETTE.cardLine}" stroke-width="1.5"/>`
  );

  positions.forEach((position, index) => {
    const spoke = spokes[index];
    const accent = accentFor(index);
    const x = position.x - pillWidth / 2;
    const y = position.y - pillHeight / 2;
    const nameLines = wrapExactly(spoke.title, pillWidth - 24, 12.5, 1, { weight: 600 });
    const supplyLines = wrapExactly(spoke.body, pillWidth, 10.5, 2);
    const below = position.y > cy;

    body.push(
      `<!-- ${spoke.title} -->`,
      rect(x, y, pillWidth, pillHeight, {
        fill: PALETTE.cardFill,
        stroke: PALETTE.cardLine,
        radius: 20,
      }),
      rect(x, y + pillHeight / 2 - 9, 4, 18, { fill: accent }),
      ...lineStack(position.x, y + 25, nameLines, {
        size: 12.5,
        weight: 600,
        leading: 15,
        fill: PALETTE.ink,
        anchor: 'middle',
      }),
      ...lineStack(position.x, below ? y + pillHeight + 17 : y - 21 - (supplyLines.length - 1) * 14, supplyLines, {
        size: 10.5,
        leading: 14,
        fill: PALETTE.inkSoft,
        anchor: 'middle',
      })
    );
  });

  const dashedRadius = radius - 9;
  const centreLines = wrapExactly(centre, dashedRadius * 1.8, 18, 2, { weight: 600 });
  const noteOffset = 26 + (centreLines.length - 1) * 11;
  // The note sits below the middle of the hub, where the dashed ring has already
  // started closing in, so the width it has to fit is that ring's chord and not
  // the circle's diameter.
  const noteWidth = 2 * Math.sqrt(dashedRadius ** 2 - noteOffset ** 2) - 8;

  body.push(
    `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${PALETTE.ink}"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${dashedRadius}" fill="none" stroke="${PALETTE.teal}" stroke-width="1.5" stroke-dasharray="4 5"/>`,
    ...lineStack(cx, cy - (centreLines.length - 1) * 11 + 2, centreLines, {
      size: 18,
      leading: 22,
      weight: 600,
      fill: PALETTE.white,
      anchor: 'middle',
    }),
    text(cx, cy + noteOffset, fit(centreNote, noteWidth, 9, { weight: 700, tracking: 1 }), {
      size: 9,
      weight: 700,
      tracking: 1,
      fill: PALETTE.mint,
      anchor: 'middle',
    })
  );

  return { height: 560, body };
};

const LAYOUTS = { stack, cards, flow, bridge, matrix, hub };

/** Renders one diagram in one language to SVG source. */
export const renderDiagram = (spec) => {
  const layout = LAYOUTS[spec.layout];
  if (!layout) throw new Error(`Unknown diagram layout: ${spec.layout}`);
  const { height, body } = layout(spec);
  return envelope({
    title: spec.title,
    description: spec.description,
    height,
    body: [eyebrow(spec.eyebrow), '', ...body],
  });
};
