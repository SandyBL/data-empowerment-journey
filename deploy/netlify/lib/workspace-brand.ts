/**
 * The colours a private space's single accent implies.
 *
 * A space carries exactly one client-chosen colour (`accentColor` on
 * `workspaces`, always `#rrggbb` -- see cleanAccent). Until now that colour was
 * only ever used as a detail on a background we had chosen ourselves, so nothing
 * had to reason about it: a 2px rule or a small pill is legible whatever the
 * client picked.
 *
 * Painting a whole header and a printed masthead in it is a different problem.
 * The colour is now behind text, and a client's brand colour is as likely to be
 * pale yellow as it is to be navy -- so "white text on their colour" is a
 * promise this code cannot keep. Two decisions come out of here instead:
 *
 *   * which ink reads on that colour, white or the near-black the rest of the
 *     space already uses, chosen by measured contrast rather than by a
 *     brightness guess; and
 *   * a band colour that is the client's, nudged toward black or white only as
 *     far as it takes for small text on it to clear `TARGET`.
 *
 * The nudge is the part worth being explicit about. It keeps the hue and only
 * moves lightness, in 6% steps, and for most brand colours it does not run at
 * all -- a navy, a deep red, a bright cyan all clear the target on the first
 * check. It exists for the mid-tones where neither white nor black is
 * comfortable, which are exactly the colours that would otherwise ship a header
 * a client's own staff cannot read.
 *
 * Derived here rather than in the browser because two unrelated scripts need the
 * same answer -- assets/js/workspace-context.js paints the simulator header,
 * assets/js/workspace-hub.js paints the printed report masthead -- and one is a
 * classic script and the other a module, so there is no single file both could
 * have imported. The space endpoints already tell the browser what its space
 * looks like; this makes that answer complete instead of making each page work
 * it out again.
 */

type Rgb = readonly [number, number, number];

/** White, and the ink the rest of the space uses (--workspace-ink). */
const WHITE: Rgb = [255, 255, 255];
const NEAR_BLACK: Rgb = [15, 23, 42];

/**
 * Contrast the band has to reach against its ink.
 *
 * 4.5:1 is the WCAG AA floor for body text, and the band carries text smaller
 * than that floor was written for -- a 10px uppercase eyebrow, a 13px date --
 * some of it at reduced opacity. The extra half-point is the room those cost.
 */
const TARGET = 5;
const STEP = 0.06;
const MAX_STEPS = 14;

/** sRGB channel to linear light (WCAG 2.x relative luminance). */
const linear = (value: number) => {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};

const luminance = (rgb: Rgb) => 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);

const contrast = (one: number, other: number) =>
  (Math.max(one, other) + 0.05) / (Math.min(one, other) + 0.05);

/** `amount` of the way from `from` to `to`, per channel. */
const mix = (from: Rgb, to: Rgb, amount: number): Rgb => [
  from[0] + (to[0] - from[0]) * amount,
  from[1] + (to[1] - from[1]) * amount,
  from[2] + (to[2] - from[2]) * amount,
];

const toHex = (rgb: Rgb) =>
  `#${rgb
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
    .join("")}`;

/** `#rrggbb` to channels. Null for anything cleanAccent would have refused. */
const parseHex = (value: unknown): Rgb | null => {
  if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value.trim())) return null;
  const hex = value.trim().slice(1);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
};

/**
 * What the browser should paint a space's own chrome with, or null when the
 * space has no accent and therefore keeps the shipped navy.
 *
 * `background` is the band. `inkRgb` is space-separated channels rather than a
 * hex string so a stylesheet can build both the solid ink and every wash off it
 * -- `rgb(var(--workspace-brand-ink-rgb) / 0.16)` -- from the one value.
 */
export const spaceTheme = (accentColor: string | null | undefined) => {
  const accent = parseHex(accentColor);
  if (!accent) return null;

  let background = accent;
  let backgroundLuminance = luminance(background);
  const ink =
    contrast(backgroundLuminance, luminance(WHITE)) >= contrast(backgroundLuminance, luminance(NEAR_BLACK))
      ? WHITE
      : NEAR_BLACK;
  const inkLuminance = luminance(ink);
  const away = ink === WHITE ? ([0, 0, 0] as Rgb) : WHITE;

  for (let step = 0; step < MAX_STEPS && contrast(backgroundLuminance, inkLuminance) < TARGET; step += 1) {
    background = mix(background, away, STEP);
    backgroundLuminance = luminance(background);
  }

  const inkRgb = ink.join(" ");

  return {
    /** The client's colour as they entered it, for the details that already use it. */
    accent: toHex(accent),
    background: toHex(background),
    inkRgb,
    /** The hairline under the band: the ink, faint enough to read as a rule. */
    line: `rgb(${inkRgb} / 0.32)`,
  };
};
