/**
 * Which words of a simulator a client is allowed to have rewritten.
 *
 * A company that licenses a private space plays the same three simulators
 * everybody else plays, and the point of this file is that they keep playing the
 * *same* simulators: only the wording of a scenario can be replaced, never the
 * number of scenarios, the number of options, which option is the good one, or
 * any of the numbers a decision moves. That is what makes a private run
 * comparable to a public one -- the score means the same thing, the leaderboard
 * bounds in netlify/functions/simulator-score-submit.mts still hold, and the
 * facilitator report still aggregates on the same dimension keys -- while the
 * text can say "our ERP" instead of "SAP" and name the client's own teams.
 *
 * So the list below is a whitelist, and everything absent from it is
 * deliberately absent:
 *
 *   * `impact`, `optimalChoice`, `correctRole` -- the scoring. Editable text
 *     that changed the scoring would silently make one company's 800 a
 *     different achievement from another's.
 *   * `id`, `incidentId`, `icon` -- identity and iconography, not prose.
 *   * Data Literacy's `category` -- it is the key the per-dimension breakdown is
 *     stored under and the key the results screen groups on, so renaming it
 *     would rename a column of the facilitator report. Data Ownership's
 *     `category` and Data Governance's `damaArea` are display labels only,
 *     which is why those two are editable and this one is not.
 *   * Data Governance's `costLabel` -- present in the data and deliberately
 *     never rendered, so an editor typing into it would be typing into nothing.
 *
 * `html: true` marks the two fields the Data Literacy page injects with
 * innerHTML, where the existing copy uses <strong> to open a lesson. Those keep
 * a small tag subset; every other field is plain text and has its angle brackets
 * removed, because several pages interpolate these strings into template
 * literals and a stray "<" there is a broken layout rather than a character.
 *
 * Plain .mjs rather than TypeScript because it has two readers with nothing else
 * in common: netlify/lib/scenario-text.ts, which enforces it when the admin
 * console saves, and scripts/extract-simulator-text.mjs, which reads the
 * standard wording out of the nine simulator pages at build time so the console
 * has something to edit. One list, one place to change it.
 */

/**
 * @typedef {object} ScenarioField
 * @property {string} path Dot path inside one scenario object.
 * @property {string} label What the admin console calls it.
 * @property {number} max Characters accepted, after trimming.
 * @property {boolean} [html] True for the two fields rendered as HTML.
 * @property {boolean} [long] Hint to the console to use a textarea.
 */

/** The three options every scenario in the two multiple-choice simulators has. */
const OPTION_KEYS = ["optionA", "optionB", "optionC"];

/** Builds the same field for each of the three options. */
const perOption = (suffix, label, max, extra = {}) =>
  OPTION_KEYS.map((option, index) => ({
    path: `${option}.${suffix}`,
    label: `Option ${"ABC"[index]} — ${label}`,
    max,
    ...extra,
  }));

/** The same, for the pages that hold their three options in an array. */
const perIndexedOption = (suffix, label, max, extra = {}) =>
  [0, 1, 2].map((index) => ({
    path: `options.${index}.${suffix}`,
    label: `Option ${"ABC"[index]} — ${label}`,
    max,
    ...extra,
  }));

/** @type {Record<string, ScenarioField[]>} */
export const SCENARIO_FIELDS = {
  "data-governance-day-to-day": [
    { path: "damaArea", label: "DAMA area label", max: 80 },
    { path: "title", label: "Scenario title", max: 180 },
    { path: "description", label: "What is happening", max: 900, long: true },
    ...perOption("label", "choice", 180),
    ...perOption("text", "what it does", 500, { long: true }),
    ...perOption("damaLesson", "lesson", 600, { long: true }),
    ...perOption("insight", "insight", 600, { long: true }),
  ],
  "data-literacy": [
    { path: "topic", label: "Topic", max: 180 },
    { path: "text", label: "What is happening", max: 1000, long: true, html: true },
    ...perOption("title", "approach", 220),
    ...perOption("lesson", "literacy lesson", 800, { long: true, html: true }),
  ],
  "data-ownership-conflict": [
    { path: "category", label: "Category label", max: 120 },
    { path: "task", label: "The task", max: 500, long: true },
    { path: "explanation", label: "Why that owner", max: 800, long: true },
  ],
};

/**
 * The pages whose scenario objects are not shaped like their English original.
 *
 * The nine pages are nine hand-written files, and three of them diverged before
 * this feature existed: the Portuguese Data Governance page keeps its three
 * options in an `options` array with `title`/`desc`/`lesson` instead of
 * `optionA`/`optionB`/`optionC`, and both the Spanish and Portuguese Data
 * Ownership pages call the task `title` and have no category label at all.
 *
 * They are described here rather than made uniform. Rewriting three shipped
 * pages so a whitelist can be shorter would mean re-testing three simulators
 * against their scoring for no gain a participant or an operator would ever see,
 * and this feature only reads those objects. The cost is this map; the benefit is
 * that the console offers exactly the fields the page it is aimed at actually
 * has, in every language, instead of nine boxes that quietly do nothing in two
 * of them.
 *
 * Same exclusions as everywhere else in this file: `impact` and the Ownership
 * pages' `correct` are the scoring and are absent, and the Portuguese
 * Governance options' `label` is the letter "A", which is structure.
 *
 * @type {Record<string, Record<string, ScenarioField[]>>}
 */
export const SCENARIO_FIELD_VARIANTS = {
  "data-governance-day-to-day": {
    pt: [
      { path: "topic", label: "Topic label", max: 180 },
      { path: "text", label: "What is happening", max: 900, long: true },
      ...perIndexedOption("title", "choice", 220),
      ...perIndexedOption("desc", "what it does", 500, { long: true }),
      ...perIndexedOption("lesson", "lesson", 600, { long: true }),
    ],
  },
  "data-ownership-conflict": {
    es: [
      { path: "title", label: "The task", max: 500, long: true },
      { path: "explanation", label: "Why that owner", max: 800, long: true },
    ],
    pt: [
      { path: "title", label: "The task", max: 500, long: true },
      { path: "explanation", label: "Why that owner", max: 800, long: true },
    ],
  },
};

/** The three simulator slugs, in the order the console lists them. */
export const SCENARIO_SIMULATORS = Object.keys(SCENARIO_FIELDS);

/** The languages every simulator exists in, and therefore every override set. */
export const SCENARIO_LOCALES = ["en", "es", "pt"];

/**
 * How many scenarios each simulator has.
 *
 * Not used to build anything -- it is the assertion that keeps this feature
 * honest. The extractor fails the build if a page stops matching its number,
 * which is the moment somebody has added or removed a scenario and the score
 * bounds in simulator-score-submit.mts need looking at too.
 */
export const SCENARIO_COUNTS = {
  "data-governance-day-to-day": 10,
  "data-literacy": 15,
  "data-ownership-conflict": 10,
};

/**
 * The editable fields of one page, in one language.
 *
 * Every caller goes through here rather than reading SCENARIO_FIELDS directly,
 * so a page with a divergent shape is handled the same way by the save endpoint,
 * the extractor and the console -- there is one answer to "what can be reworded
 * here" and all three of them ask the same question.
 */
export const fieldsFor = (simulator, locale) =>
  SCENARIO_FIELD_VARIANTS[simulator]?.[locale] || SCENARIO_FIELDS[simulator] || [];

/** Every editable path for one page, as a Set for membership tests. */
export const fieldPaths = (simulator, locale) =>
  new Set(fieldsFor(simulator, locale).map((field) => field.path));

/** The spec for one path, or undefined when the path is not editable. */
export const fieldSpec = (simulator, locale, path) =>
  fieldsFor(simulator, locale).find((field) => field.path === path);

/** Reads a dot path out of a scenario object. */
export const readPath = (source, path) =>
  path.split(".").reduce((node, key) => (node && typeof node === "object" ? node[key] : undefined), source);
