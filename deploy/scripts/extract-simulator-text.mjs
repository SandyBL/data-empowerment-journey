#!/usr/bin/env node

/**
 * Reads the standard wording out of the nine simulator pages.
 *
 * The admin console lets one company's copy of a simulator be reworded, and to
 * do that it has to show what the wording currently *is*: a blank field next to
 * "Scenario 4, Option B" is unusable, because the operator is rewriting a
 * sentence rather than inventing one. The scenarios live where they belong --
 * inline in each page, which is why a simulator loads and plays with no
 * database, no API and no build step -- so this script lifts a read-only copy of
 * their text out at build time into one small JSON file per page.
 *
 * The direction matters: this only ever reads. The page stays the single source
 * of the scenarios; the extracted file is a copy the console displays and
 * compares against, and deleting the whole output directory costs nothing but
 * the next build. Nothing at runtime on a simulator page reads these files, so a
 * missing or stale one cannot affect a participant mid-exercise -- it can only
 * make the console show an out-of-date "standard" next to an operator's rewrite.
 *
 * Only whitelisted fields are extracted, from netlify/lib/scenario-fields.mjs,
 * so what the console can display is exactly what the console can edit and what
 * the save endpoint will accept. The impact numbers and the correct answers are
 * not in the output at all, which is worth having on its own: these files are
 * public under /assets/, and a curious participant who fetches one finds the
 * questions they are about to be asked and none of the answers.
 *
 * Run by `npm run build`. Add `--out <dir>` to write somewhere else, which is
 * how it gets checked without touching the served asset directory.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SCENARIO_COUNTS,
  SCENARIO_LOCALES,
  SCENARIO_SIMULATORS,
  fieldsFor,
  readPath,
} from "../netlify/lib/scenario-fields.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * What the scenario array might be called, in preference order.
 *
 * Both spellings are tried for every page rather than one being pinned per
 * simulator, because the nine pages were written at different times and do not
 * agree: the English Data Ownership page says `SCENARIOS` where the Spanish and
 * Portuguese ones say `scenarios`. Trying both is a two-line loop; renaming a
 * variable in nine shipped pages to please a build script is not.
 */
const ARRAY_NAMES = ["SCENARIOS", "scenarios"];

/** The first of those names that this page actually declares an array under. */
const findScenarioArray = (source) => {
  for (const name of ARRAY_NAMES) {
    try {
      return parseScenarios(sliceLiteral(source, name));
    } catch {
      continue;
    }
  }
  throw new Error("no scenario array found under any known name");
};

/**
 * Checks that the browser is refusing exactly what the server is refusing.
 *
 * assets/js/scenario-text.js carries its own copy of the whitelist, because a
 * page about to draw its first scenario should not be waiting on a request to
 * find out which of its own sentences are sentences. That copy is the second of
 * the two places a scoring field is stopped -- Data Literacy's right answer is
 * the string "A", so "only replace strings" would rewrite it -- and a stale copy
 * would be a hole that no test on either side would notice.
 *
 * Hence this: the two lists are compared on every build, and a disagreement
 * fails it. The server's list stays the only one anybody edits by hand.
 */
const verifyClientWhitelist = async () => {
  const path = join(ROOT, "assets/js/scenario-text.js");
  const source = await readFile(path, "utf8");
  const shipped = evaluate(sliceLiteral(source, "PATHS", "{", "}"));
  const variants = evaluate(sliceLiteral(source, "VARIANT_PATHS", "{", "}"));

  const problems = [];

  for (const locale of SCENARIO_LOCALES) {
    for (const simulator of SCENARIO_SIMULATORS) {
      const expected = fieldsFor(simulator, locale).map((field) => field.path);
      const actual = variants[simulator]?.[locale] || shipped[simulator] || [];

      if (expected.join("|") !== actual.join("|")) {
        problems.push(
          `${locale}/${simulator}: assets/js/scenario-text.js allows ${actual.length} paths, ` +
            `netlify/lib/scenario-fields.mjs allows ${expected.length}`,
        );
      }
    }
  }

  return problems;
};

/**
 * The source text of a literal assigned to `variableName`, from its bracket on.
 *
 * Bracket matching rather than a regular expression, because the scenarios
 * contain both kinds of quote, apostrophes in prose, and `[` inside strings.
 * String literals and comments are skipped so a bracket inside either does not
 * end the literal early. `open`/`close` are parameters so the same walk reads
 * both the scenario arrays and the two whitelist objects in
 * assets/js/scenario-text.js.
 */
const sliceLiteral = (source, variableName, open = "[", close = "]") => {
  const declaration = new RegExp(
    `(?:const|let|var)\\s+${variableName}\\s*=\\s*\\${open}`,
  ).exec(source);
  if (!declaration) throw new Error(`no "${variableName} = ${open}" in this file`);

  const start = declaration.index + declaration[0].length - 1;
  let depth = 0;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (char === '"' || char === "'" || char === "`") {
      index += 1;
      while (index < source.length && source[index] !== char) {
        if (source[index] === "\\") index += 1;
        index += 1;
      }
      continue;
    }

    if (char === "/" && source[index + 1] === "/") {
      index = source.indexOf("\n", index);
      if (index < 0) break;
      continue;
    }

    if (char === "/" && source[index + 1] === "*") {
      index = source.indexOf("*/", index) + 1;
      if (index < 1) break;
      continue;
    }

    if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }

  throw new Error(`the "${variableName}" literal is not closed`);
};

/**
 * A literal from one of our own files, evaluated.
 *
 * `new Function` over a slice of our own source, at build time, with no
 * arguments and nothing in scope -- the same trust already placed in every other
 * line of the page. Reimplementing an object-literal parser to avoid it would be
 * more code and more ways to disagree with what the browser actually loads.
 */
const evaluate = (literal) => new Function(`"use strict"; return (${literal});`)();

const parseScenarios = (literal) => {
  const value = evaluate(literal);
  if (!Array.isArray(value)) throw new Error("the scenarios are not an array");
  return value;
};

/**
 * One page reduced to its editable wording.
 *
 * Scenarios are keyed by their own `id` where they have one and by their
 * position where they do not -- the Portuguese Data Governance page has no ids.
 * assets/js/scenario-text.js derives the key exactly the same way, which is what
 * makes an override written against this file land on the right scenario.
 */
const extract = (scenarios, simulator, locale) =>
  scenarios.map((scenario, index) => {
    const id = Number.isInteger(scenario?.id) ? scenario.id : index + 1;
    const fields = {};

    for (const field of fieldsFor(simulator, locale)) {
      const value = readPath(scenario, field.path);
      // A field that is absent from a scenario is left out rather than written
      // as an empty string, so the console shows the operator nothing to rewrite
      // where the page itself has nothing.
      if (typeof value === "string" && value.trim()) fields[field.path] = value.trim();
    }

    return { id, fields };
  });

const outFlag = process.argv.indexOf("--out");
const outDir = outFlag > -1 ? resolve(process.argv[outFlag + 1]) : join(ROOT, "assets/data/simulator-text");

let written = 0;
const problems = await verifyClientWhitelist();

for (const locale of SCENARIO_LOCALES) {
  for (const simulator of SCENARIO_SIMULATORS) {
    const page = join(ROOT, "simulators", locale, simulator, "index.html");

    try {
      const source = await readFile(page, "utf8");
      const scenarios = findScenarioArray(source);
      const expected = SCENARIO_COUNTS[simulator];

      if (scenarios.length !== expected) {
        problems.push(`${locale}/${simulator}: ${scenarios.length} scenarios, expected ${expected}`);
        continue;
      }

      const target = join(outDir, locale, `${simulator}.json`);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(
        target,
        `${JSON.stringify(
          {
            simulator,
            locale,
            count: scenarios.length,
            fields: fieldsFor(simulator, locale).map(({ path, label, max, html, long }) => ({
              path,
              label,
              max,
              ...(html ? { html: true } : {}),
              ...(long ? { long: true } : {}),
            })),
            scenarios: extract(scenarios, simulator, locale),
          },
          null,
          2,
        )}\n`,
      );
      written += 1;
    } catch (error) {
      problems.push(`${locale}/${simulator}: ${error.message}`);
    }
  }
}

if (problems.length) {
  // Loud and fatal. A wrong or unreadable extraction means the console would
  // show an operator the wrong "standard wording" to rewrite, and finding that
  // out during a client workshop is far more expensive than a failed build.
  console.error("Simulator text extraction failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`Extracted standard simulator wording: ${written} sets.`);
