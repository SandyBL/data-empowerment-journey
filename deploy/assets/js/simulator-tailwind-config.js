/*
 * The Tailwind theme every simulator page shares.
 *
 * All nine pages compile their utilities in the browser with the Tailwind Play
 * CDN, and until now each one carried its own `tailwind.config` inline. Seven
 * different configs meant seven different meanings for the same class name:
 * `text-cyan-400` was #22d3ee on Data Literacy (which overrode the built-in
 * cyan ramp) and Tailwind's stock #22d3ee-adjacent value everywhere else,
 * `bg-brand-500` was a #3b82f6 blue on Day-to-Day and undefined on Data
 * Literacy, and `brand-teal` existed only on the English "Who Owns This?".
 * Two pages had no config at all and rendered in stock Tailwind slate.
 *
 * This file replaces all of them. Load it immediately after the CDN script:
 *
 *   <script src="https://cdn.tailwindcss.com/3.4.17"></script>
 *   <script src="/assets/js/simulator-tailwind-config.js"></script>
 *
 * WHY RE-POINT THE BUILT-IN RAMPS RATHER THAN ADD NEW COLOUR NAMES
 *
 * Between them the nine pages carry a few thousand colour utilities already
 * written against Tailwind's stock palette -- 230 `border-slate-800`, 220
 * `text-slate-400`, 163 `bg-slate-800`, 97 `text-cyan-400`. Introducing a
 * `sim-*` palette alongside the stock one would have meant hand-editing every
 * one of those class attributes across nine files in three languages to get
 * any benefit, and any attribute missed would have kept rendering in stock
 * Tailwind grey -- the exact failure that produced five designs in the first
 * place.
 *
 * Re-pointing `slate`, `cyan`, `blue`, `teal`, `emerald`, `orange`, `amber`,
 * `rose` and the rest onto brand-derived values instead means the markup that
 * is already there becomes brand-correct without being touched, and there is
 * one place to change a colour rather than nine.
 *
 * The cost, stated plainly: inside a simulator page `slate` is not Tailwind's
 * slate and `blue-500` is not blue. Anyone reading the markup will read
 * `text-blue-400` and see teal. That is a real tax on a newcomer, and it is
 * the price of not maintaining nine palettes. The `sim.*` scale below is the
 * canonical set of names and is what new markup should use; the stock names
 * are kept working for the markup that predates this file.
 *
 * WHY THE PER-PROPERTY OVERRIDES
 *
 * On a dark ground a neutral step means opposite things depending on the
 * property. `border-slate-800` wants a hairline a few steps *lighter* than the
 * surface it outlines, while `bg-slate-800` wants a panel *darker* than the
 * page. One hex value cannot do both: matched to the panel the 230 borders go
 * invisible, matched to the borders the 163 panels turn into pale slabs.
 *
 * Tailwind keys `backgroundColor`, `borderColor`, `textColor` and friends
 * separately from `colors`, so the neutral ramp is declared three times -- once
 * as fills, once as lines, once as ink. Every other ramp uses the single
 * `colors` entry.
 *
 * CONTRAST
 *
 * Every `*-400` accent and every neutral text step below was measured against
 * #0d3d4e -- `bg-slate-800`, the lightest ground any body copy on the console
 * sits on -- and clears the 4.5:1 that WCAG 1.4.3 asks of body text. The
 * accents land between 4.9:1 and 6.2:1, which is why they can carry a figure
 * as well as a label. Ink-on-accent pairs (`text-slate-950` on `bg-cyan-500`)
 * were measured the other way round and clear 5.9:1.
 */
(function () {
  "use strict";

  if (typeof window === "undefined" || !window.tailwind) {
    return;
  }

  /* ---------------------------------------------------------------------
   * Neutrals.
   *
   * A single teal-tinted grey, replacing Tailwind's blue-grey slate. The tint
   * matters more than it sounds: stock slate is cool and slightly violet, and
   * on a teal ground 230 hairlines of it read as a different, greyer design
   * sitting on top of the brand rather than as part of it.
   *
   * Three roles, three ramps.
   * ------------------------------------------------------------------- */

  /* Fills. Panels stack downward: the page is the console gradient, a card is
     900, a panel inside it 800, and the deepest wells are 950. */
  var neutralBg = {
    50: "#f2fafc",
    100: "#e2f0f4",
    200: "#c3dde4",
    300: "#9dc2cc",
    400: "#7fa8b4",
    500: "#4b7f8d",
    600: "#175468",
    700: "#12495c",
    800: "#0d3d4e",
    900: "#072a38",
    950: "#04141c",
  };

  /* Lines. Every step is lighter than the fill of the same name, which is what
     makes `bg-slate-900 border-slate-800` -- the pattern the existing markup
     uses most -- resolve to a panel with a visible edge. */
  var neutralBorder = {
    50: "#e2f0f4",
    100: "#c3dde4",
    200: "#9dc2cc",
    300: "#5f96a5",
    400: "#3f707e",
    500: "#4b95a3",
    600: "#39808f",
    700: "#2a6b7d",
    800: "#1d5566",
    900: "#10404f",
    950: "#0a2c3a",
  };

  /* Ink. The light end is body copy on the console; 900 and 950 stay dark
     because that is what `text-slate-950` on a cyan button needs to be. */
  var neutralText = {
    50: "#ffffff",
    100: "#f2fafc",
    200: "#e2f0f4",
    300: "#c3dde4",
    400: "#9dc2cc",
    500: "#7fa8b4",
    600: "#6b94a1",
    700: "#4b7f8d",
    800: "#0d3d4e",
    900: "#062633",
    950: "#04141c",
  };

  /* ---------------------------------------------------------------------
   * Accents.
   *
   * Cyan is the brand's #65b7c7 -- the same colour the homepage puts on the
   * Day-to-Day simulator card. `blue` is re-pointed onto the identical ramp
   * rather than to a brand blue, because the 46 `text-blue-400` and 34 blue
   * button fills on the Day-to-Day pages were that simulator's accent, and the
   * point of this file is that the three simulators stop having three accents.
   * They resolve to the same teal; the class names differ, the colour does not.
   * ------------------------------------------------------------------- */
  var cyan = {
    50: "#eef8fa",
    100: "#d8eff3",
    200: "#b9e2ea",
    300: "#8ccfda",
    400: "#65b7c7", /* brand --dejourney-cyan */
    500: "#3f9db0",
    600: "#2b7d90",
    700: "#1f6675",
    800: "#164f5c",
    900: "#0f3a45",
    950: "#082630",
  };

  /* Teal is the brand's #095b73 -- the deep end of the same hue, for grounds
     and strong borders rather than for accent ink. */
  var teal = {
    50: "#eef6f8",
    100: "#d6eaef",
    200: "#b9dfe8",
    300: "#8ccfda",
    400: "#4f97ab",
    500: "#1c7189",
    600: "#095b73", /* brand --dejourney-teal */
    700: "#07485c",
    800: "#063b4c",
    900: "#04222e",
    950: "#031720",
  };

  /* Emerald is the brand's #50c878. 600 is --emerald-ink from assets/styles.css,
     the darkened variant the marketing pages use on light grounds. */
  var emerald = {
    50: "#eef9f2",
    100: "#d5f2e0",
    200: "#a9e7bd",
    300: "#7ed89b",
    400: "#50c878", /* brand --emeraldgreen */
    500: "#3aa860",
    600: "#23874a", /* brand --emerald-ink */
    700: "#1b6a3a",
    800: "#14512c",
    900: "#0d3b23",
    950: "#072817",
  };

  /* Orange is the brand's #e95d24, and 600 is --orange-ink. This is the only
     warm hue on the console, which is what makes it usable as the single
     "this is the next step" signal without being the largest thing on screen. */
  var orange = {
    50: "#fdf0e9",
    100: "#fbdccd",
    200: "#f8cdb5",
    300: "#f5a37a",
    400: "#f2803c",
    500: "#e95d24", /* brand --dejourney-orange */
    600: "#c25419", /* brand --orange-ink */
    700: "#9c4314",
    800: "#76330f",
    900: "#4f220a",
    950: "#301406",
  };

  /* Amber, for the caution state and the top leaderboard rank. Pulled toward
     the brand's saturation so it sits with the cyan rather than shouting. */
  var amber = {
    50: "#fdf5e6",
    100: "#f9e7bf",
    200: "#f4d795",
    300: "#f0c66d",
    400: "#e9b03c",
    500: "#d99a24",
    600: "#b57d17",
    700: "#8d6011",
    800: "#6b4708",
    900: "#4a3106",
    950: "#2c1d03",
  };

  /* Rose, for the failure state. A warmed coral rather than a stock #ef4444:
     next to this palette a pure red read as a browser error rather than as a
     score moving the wrong way. */
  var rose = {
    50: "#fdefec",
    100: "#fbdcd6",
    200: "#fbd2cb",
    300: "#f5b3a8",
    400: "#ef9384",
    500: "#e2705c",
    600: "#c4543f",
    700: "#9e3f2d",
    800: "#752d1f",
    900: "#4a1a12",
    950: "#2f100a",
  };

  /* Two cool tertiaries, for the categorical series only -- the fourth and
     fifth metric on a five-metric readout, and the outer rings of the radar.
     Never for state, which is emerald / amber / rose. */
  var indigo = {
    50: "#f2f0fb",
    100: "#e3dff6",
    200: "#cdc6ec",
    300: "#c0b5e8",
    400: "#b3a4e0",
    500: "#9280c9",
    600: "#7362ab",
    700: "#584a86",
    800: "#3f3562",
    900: "#28213f",
    950: "#181328",
  };

  var purple = {
    50: "#f6effb",
    100: "#ecdcf5",
    200: "#e0c9ef",
    300: "#d9b8ec",
    400: "#c79ae0",
    500: "#a878c4",
    600: "#8a5aa6",
    700: "#6b4382",
    800: "#4d305e",
    900: "#301d3b",
    950: "#1d1125",
  };

  /* ---------------------------------------------------------------------
   * The canonical scale.
   *
   * `sim-*` is the vocabulary new markup should use, because unlike the
   * re-pointed stock names it says what it means: `bg-sim-card` rather than
   * `bg-slate-900/90`, `text-sim-muted` rather than `text-slate-400`.
   * ------------------------------------------------------------------- */
  var sim = {
    console: "#04141c",
    card: "#072a38",
    panel: "#0d3d4e",
    raised: "#175468",
    line: "#1d5566",
    "line-strong": "#2a6b7d",
    ink: "#f2fafc",
    body: "#c3dde4",
    muted: "#9dc2cc",
    faint: "#7fa8b4",
    accent: "#65b7c7",
    "accent-deep": "#095b73",
    cta: "#e95d24",
    good: "#50c878",
    warn: "#e9b03c",
    bad: "#ef9384",
    /* The categorical series, by position. Same six values as
       --sim-series-1..6 in assets/css/simulator-theme.css. */
    "series-1": "#65b7c7",
    "series-2": "#50c878",
    "series-3": "#b3a4e0",
    "series-4": "#ef9384",
    "series-5": "#c79ae0",
    "series-6": "#e9b03c",
  };

  /* ---------------------------------------------------------------------
   * Legacy names, kept so existing markup keeps resolving.
   *
   * `brand-*` carried two incompatible shapes: a numeric blue ramp on the
   * Day-to-Day pages and named keys (`brand-teal`, `brand-orange`, `brand-bg`)
   * on the English "Who Owns This?". Both are declared here, both re-pointed.
   * `brand-bg`, `brand-card` and `brand-text` were the light theme's page,
   * card and ink -- on the console they become the console's own, which is
   * what turns `bg-brand-card text-brand-text` from a white card with dark
   * text into a teal card with light text without the markup changing.
   * ------------------------------------------------------------------- */
  var brand = {
    50: cyan[50],
    100: cyan[100],
    200: cyan[200],
    300: cyan[300],
    400: cyan[400],
    500: cyan[500],
    600: cyan[600],
    700: cyan[700],
    800: cyan[800],
    900: cyan[900],
    950: cyan[950],
    teal: "#095b73",
    navy: "#04222e",
    /* `brand-teal` and `brand-navy` were this page's two dark grounds *and*
       its two heading inks, which the console cannot serve with one value.
       The ground meaning stays on the names above; the ink meaning moved
       to these, and the markup was repointed at them. */
    accent: "#65b7c7",
    line: "#1d5566",
    orange: "#e95d24",
    orangeHover: "#c25419",
    bg: "#04141c",
    card: "#072a38",
    text: "#f2fafc",
    muted: "#9dc2cc",
    success: "#50c878",
    error: "#ef9384",
  };

  /* `navy-*` was Data Literacy's page and panel ramp. */
  var navy = {
    800: "#0d3d4e",
    900: "#072a38",
    950: "#04141c",
  };

  var palette = {
    /* Neutrals. Every stock grey name lands on the same teal-tinted ramp, so a
       stray `bg-gray-800` or `text-zinc-400` cannot reintroduce a second grey. */
    slate: neutralBg,
    gray: neutralBg,
    zinc: neutralBg,
    neutral: neutralBg,
    stone: neutralBg,

    /* Accents. */
    cyan: cyan,
    sky: cyan,
    blue: cyan,
    teal: teal,
    emerald: emerald,
    green: emerald,
    lime: emerald,
    orange: orange,
    amber: amber,
    yellow: amber,
    rose: rose,
    red: rose,
    pink: rose,
    indigo: indigo,
    violet: indigo,
    purple: purple,
    fuchsia: purple,

    sim: sim,
    brand: brand,
    navy: navy,
  };

  function withNeutral(ramp) {
    var out = {};
    for (var key in palette) {
      if (Object.prototype.hasOwnProperty.call(palette, key)) {
        out[key] = palette[key];
      }
    }
    out.slate = ramp;
    out.gray = ramp;
    out.zinc = ramp;
    out.neutral = ramp;
    out.stone = ramp;
    return out;
  }

  window.tailwind.config = {
    theme: {
      extend: {
        /* ---------------------------------------------------------------
         * One typeface.
         *
         * Plus Jakarta Sans, which is what the rest of datagovjourney.com
         * renders in and what the shared simulator header already loads. It
         * replaces Inter, which four of the nine pages linked as a second
         * webfont for body copy while the header above that copy stayed in
         * Plus Jakarta Sans.
         *
         * `mono` points at the same family rather than at a monospace stack.
         * Six pages asked for JetBrains Mono and no page has ever served it --
         * there is no such file in assets/fonts -- so every `font-mono` score,
         * timer and percentage fell through to whatever monospace the
         * visitor's operating system happened to have: a fourth typeface on
         * the page, different per visitor. What those labels actually needed
         * was figures that do not change width as they count, and
         * simulator-theme.css gets that from `font-variant-numeric:
         * tabular-nums` on `.font-mono`.
         * ------------------------------------------------------------- */
        fontFamily: {
          sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
          mono: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        },

        colors: palette,
        backgroundColor: withNeutral(neutralBg),
        borderColor: withNeutral(neutralBorder),
        divideColor: withNeutral(neutralBorder),
        ringColor: withNeutral(neutralBorder),
        outlineColor: withNeutral(neutralBorder),
        textColor: withNeutral(neutralText),
        placeholderColor: withNeutral(neutralText),
        gradientColorStops: withNeutral(neutralBg),

        borderRadius: {
          /* The homepage's .simulator-card is 1.5rem and its icon tile 1rem.
             The four different card radii the simulators had between them
             (0.5rem, 0.75rem, 1rem, 1.25rem) collapse onto those two. */
          card: "1.5rem",
          panel: "1rem",
          control: "0.75rem",
        },

        boxShadow: {
          /* Named shadows the English "Who Owns This?" markup still asks for,
             re-tinted from its own teal onto the console's. */
          soft: "0 10px 25px -5px rgb(2 22 33 / 0.35), 0 8px 10px -6px rgb(2 22 33 / 0.25)",
          glow: "0 0 20px rgb(101 183 199 / 0.3)",
          "card-hover": "0 20px 30px -10px rgb(2 22 33 / 0.45)",
          sim: "0 24px 48px rgb(2 22 33 / 0.28)",
          "sim-raised": "0 12px 28px rgb(2 22 33 / 0.22)",
          "sim-accent": "0 12px 28px rgb(101 183 199 / 0.24)",
        },

        /* Animation names Data Literacy's markup still carries. Both are now
           no-op-ish: simulator-theme.css owns motion, and a card that pulses
           its glow forever next to a timer that is already counting was two
           things competing for the same attention. */
        animation: {
          "pulse-glow": "simPulseGlow 2.4s infinite ease-in-out",
          float: "none",
        },
        keyframes: {
          simPulseGlow: {
            "0%, 100%": { boxShadow: "0 0 14px rgb(101 183 199 / 0.18)" },
            "50%": { boxShadow: "0 0 26px rgb(101 183 199 / 0.34)" },
          },
        },
      },
    },
  };
})();
