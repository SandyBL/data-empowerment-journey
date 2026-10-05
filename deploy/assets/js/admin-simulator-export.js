/**
 * The questions-and-answers export of the private-spaces console.
 *
 * Builds one Markdown file with every scenario of the chosen simulators, each
 * option, and which option is the right one, so a consultant can hand it to an
 * AI together with the client's context and get back suggestions for rewording.
 * The suggestions are then typed into the "Scenario wording" panel, which is
 * the only place wording is changed -- this file never writes anything.
 *
 * Two sources, on purpose:
 *
 *   * the wording comes from /assets/data/simulator-text/, the same extraction
 *     the wording editor shows, so every field in the export carries the exact
 *     label the editor uses and a suggestion can be pasted into the right box;
 *   * the answer key is read out of the simulator page itself. The extracted
 *     files deliberately carry no answers, and the page is the one place the
 *     answer is defined, so a scenario fixed in the page is fixed here too.
 *
 * The answer key is read with a pattern per simulator and checked against the
 * scenario count. A page that stops matching produces an export that says the
 * answers are missing, never one with answers attached to the wrong scenario.
 *
 * CDMP Exam Practice is left out, for the reason given in
 * netlify/lib/scenario-fields.mjs: its questions are certification practice,
 * and its wording cannot be changed for a space.
 */

import { ROLE_LABELS } from "/assets/js/simulator-analysis.mjs";

const STANDARD_TEXT = "/assets/data/simulator-text";

/** The ownership page's internal role names, to the keys of ROLE_LABELS. */
const ROLE_KEYS = { "Business Owner": "business", "Data Steward": "steward", "IT / Tech": "it" };

/** An ownership answer as the page in this language shows it. */
const roleName = (role, locale) => (ROLE_LABELS[locale] || ROLE_LABELS.en)[ROLE_KEYS[role]] || role;

/** The three simulators whose wording a space can change. */
export const EXPORTABLE = ["data-governance-day-to-day", "data-literacy", "data-ownership-conflict"];

const NAMES = {
  "data-governance-day-to-day": "Data Governance Day-to-Day",
  "data-literacy": "Data Literacy",
  "data-ownership-conflict": "Data Ownership Conflict",
  "cdmp-exam-practice": "CDMP Exam Practice",
};

const LANGUAGE_NAMES = { en: "English", es: "Spanish", pt: "Portuguese" };

/**
 * How each simulator states its right answer.
 *
 * Day-to-Day has no per-scenario answer field: its pages carry BEST_PATH, one
 * letter per scenario, which is the path that scores highest. Literacy marks
 * each scenario with optimalChoice. Ownership names the accountable role, and
 * its three options are the three roles.
 */
const ANSWER_READERS = {
  "data-governance-day-to-day": (source) => {
    const match = /const\s+BEST_PATH\s*=\s*['"]([ABC]+)['"]/.exec(source);
    return match ? match[1].split("") : [];
  },
  "data-literacy": (source) => [...source.matchAll(/optimalChoice\s*:\s*["']([ABC])["']/g)].map((match) => match[1]),
  "data-ownership-conflict": (source) =>
    [...source.matchAll(/correctRole\s*:\s*["']([^"']+)["']/g)].map((match) => match[1]),
};

const cache = new Map();

async function fetchOnce(url, as) {
  if (cache.has(url)) return cache.get(url);
  const promise = fetch(url, { credentials: "same-origin" }).then((response) => {
    if (!response.ok) throw new Error(`Could not read ${url} (HTTP ${response.status}). Deploy the site and try again.`);
    return as === "json" ? response.json() : response.text();
  });
  cache.set(url, promise);
  promise.catch(() => cache.delete(url));
  return promise;
}

/** HTML fields keep a few tags; the export shows them as plain text. */
function plain(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** One field as a Markdown line, labelled exactly as the wording editor labels it. */
function fieldLine(spec, text) {
  return `- **${spec.label}** \`${spec.path}\`${spec.html ? " (HTML allowed: <strong>, <em>)" : ""}: ${plain(text)}`;
}

function optionLetter(path) {
  const match = /^option([ABC])\./.exec(path);
  return match ? match[1] : null;
}

/**
 * One simulator as a Markdown section.
 *
 * `overrides` is the space's own rewrite of this set, when there is one: the
 * export then shows the wording the space actually plays, which is what an AI
 * asked to improve it has to start from.
 */
async function simulatorSection(simulator, locale, overrides) {
  const [standard, page] = await Promise.all([
    fetchOnce(`${STANDARD_TEXT}/${locale}/${simulator}.json`, "json"),
    fetchOnce(`/simulators/${locale}/${simulator}/`, "text"),
  ]);

  const answers = ANSWER_READERS[simulator](page);
  const answersOk = answers.length === standard.count;
  const lines = [`## ${NAMES[simulator]}`, ""];

  if (simulator === "data-governance-day-to-day") {
    lines.push(
      "Each scenario has three options (A, B, C). Every option moves five governance indicators and the budget; the **best answer** is the option on the highest-scoring path through the quarter. The scoring numbers are fixed and not shown here.",
    );
  } else if (simulator === "data-literacy") {
    lines.push("Each scenario has three options (A, B, C). The **correct answer** is the optimal choice the score counts.");
  } else {
    const roles = [...new Set(answers)].map((role) => roleName(role, locale));
    lines.push(
      `Each scenario is a task. The player chooses who owns it from three fixed roles${roles.length ? ` (${roles.join(", ")})` : ""}. The **correct answer** is the accountable role. Only the task, its category label and the explanation can be reworded; the roles cannot.`,
    );
  }
  if (!answersOk) {
    lines.push("", "> The answer key could not be read from this simulator's page, so it is not included. Check the answers in the simulator itself.");
  }
  lines.push("");

  standard.scenarios.forEach((scenario, index) => {
    const saved = (overrides && overrides[String(scenario.id)]) || {};
    const text = (spec) => saved[spec.path] || scenario.fields[spec.path];
    const answer = answersOk ? answers[index] : null;

    lines.push(`### Scenario ${index + 1}`, "");

    const general = standard.fields.filter((spec) => !optionLetter(spec.path) && text(spec));
    for (const spec of general) lines.push(fieldLine(spec, text(spec)));

    for (const letter of ["A", "B", "C"]) {
      const specs = standard.fields.filter((spec) => optionLetter(spec.path) === letter && text(spec));
      if (!specs.length) continue;
      const mark = answer === letter ? (simulator === "data-governance-day-to-day" ? " ✅ best answer" : " ✅ correct answer") : "";
      lines.push("", `**Option ${letter}${mark}**`);
      for (const spec of specs) lines.push(fieldLine(spec, text(spec)));
    }

    if (answer) {
      lines.push(
        "",
        simulator === "data-ownership-conflict"
          ? `**Correct answer (must not change):** ${roleName(answer, locale)}`
          : `**${simulator === "data-governance-day-to-day" ? "Best" : "Correct"} answer (must not change):** Option ${answer}`,
      );
    }
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * The whole file.
 *
 * `options.overrides` is `{ "<simulator>": { "<scenario id>": { "<path>": text } } }`
 * for an existing space, or absent for the standard wording.
 */
export async function buildQuestionsMarkdown({ simulators, locale, company, overrides = {} }) {
  const chosen = EXPORTABLE.filter((slug) => simulators.includes(slug));
  const skipped = simulators.filter((slug) => !EXPORTABLE.includes(slug));

  const header = [
    `# Simulator questions and answers${company ? ` — ${company}` : ""}`,
    "",
    `Language: ${LANGUAGE_NAMES[locale] || locale}. Generated ${new Date().toISOString().slice(0, 10)}.`,
    "",
    "Field names in `code` are the exact fields of the scenario wording editor. Any suggested rewording must keep every correct answer correct and every other option as it is in meaning.",
  ];
  if (skipped.includes("cdmp-exam-practice")) {
    header.push("", "CDMP Exam Practice is not included: its questions follow the certification syllabus and are not reworded per client.");
  }
  if (!chosen.length) {
    header.push("", "None of the chosen simulators can be reworded, so there is nothing to review.");
    return `${header.join("\n")}\n`;
  }

  const sections = [];
  for (const simulator of chosen) sections.push(await simulatorSection(simulator, locale, overrides[simulator]));
  return `${header.join("\n")}\n\n${sections.join("\n")}\n`;
}

/**
 * The prompt the console offers to copy next to the export.
 *
 * Short on purpose: the file carries the scenarios and the answer key, and the
 * prompt carries only the rules an AI would otherwise get wrong -- the answer
 * cannot move, nothing has to change, and the output has to name the field so
 * it can be pasted into the editor.
 */
export function aiPrompt({ company, locale }) {
  const language = LANGUAGE_NAMES[locale] || "the same language as the file";
  return [
    `I run data governance simulators in a workshop for ${company || "[client name]"}. The attached file lists every scenario, its options and the correct answer.`,
    "",
    "Client context: [industry, size, main systems, team names, recent data issues]",
    "",
    "Review each scenario and suggest rewording only where it would make it feel like this client's reality.",
    "Rules:",
    "1. The correct answer must stay correct, and the other options must stay wrong or weaker in the same way. Do not change meaning, difficulty or which option is best.",
    "2. Do not force changes. If a scenario already fits, answer \"Scenario N: keep as is\".",
    "3. Do not add, remove or reorder scenarios or options. Keep a similar length per field.",
    `4. Write in ${language}, plain text (fields marked HTML may keep <strong>/<em>).`,
    "",
    "Output, per scenario: either \"Scenario N: keep as is\", or the scenario number, then each field you change by its exact field name from the file, the new text, and one line on why.",
  ].join("\n");
}

/** Saves text as a file, without a server round trip. */
export function downloadText(filename, text, type = "text/markdown;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
