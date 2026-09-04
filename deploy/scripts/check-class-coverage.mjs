#!/usr/bin/env node
/**
 * Class coverage check.
 *
 * `assets/styles.css` is a hand-written Tailwind subset, not Tailwind itself: a
 * utility class only exists if somebody authored the rule. A typo or a class
 * copied from Tailwind docs therefore fails silently -- the markup looks right
 * and the layout is quietly wrong.
 *
 * This script diffs every class used in the hand-maintained HTML against every
 * class defined in the stylesheets that HTML actually links, and exits non-zero
 * when something is used but never defined.
 *
 * Run standalone (`node scripts/check-class-coverage.mjs`) or as part of the
 * build, which calls it before generating pages.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Source HTML that a human edits, checked strictly: an undefined class here
 * fails the build. Fully generated pages are regenerated on every build and are
 * not checked; the three blog indexes are, because only their marker regions
 * are generated and the rest is hand-maintained.
 */
const HTML_SOURCES = [
  'src/home.html',
  'thank-you.html',
  '404.html',
  'en/blog/index.html',
  'es/blog/index.html',
  'pt/blog/index.html',
  'admin/index.html',
  'admin/spaces/index.html',
  'workspace/index.html',
];

/**
 * Pages that are reported but never fail the build.
 *
 * All nine simulators load the Tailwind Play CDN, which compiles utility classes
 * in the browser from a config this script cannot evaluate, so `checkFile` skips
 * them outright rather than measuring their markup against the hand-written
 * subset and calling every Tailwind utility undefined. They stay on this list for
 * the day one of them stops loading the CDN: the run will start reporting real
 * findings for it, and it can be promoted into HTML_SOURCES once it reads clean.
 *
 * The Spanish and Portuguese "Who Owns This?" pages were the two exceptions --
 * CDN-free, and so checked strictly -- until they were rebuilt from the English
 * page they translate, which brought the CDN with it.
 */
const ADVISORY_SOURCES = [
  'simulators/en/data-governance-day-to-day/index.html',
  'simulators/en/data-literacy/index.html',
  'simulators/en/data-ownership-conflict/index.html',
  'simulators/es/data-governance-day-to-day/index.html',
  'simulators/es/data-literacy/index.html',
  'simulators/es/data-ownership-conflict/index.html',
  'simulators/pt/data-governance-day-to-day/index.html',
  'simulators/pt/data-literacy/index.html',
  'simulators/pt/data-ownership-conflict/index.html',
];

/** Directories scanned for class names referenced from JavaScript or generators. */
const HOOK_SOURCES = ['assets/js', 'scripts', 'scripts/lib'];

/** Class prefixes that come from a stylesheet we cannot read (CDN icon fonts). */
const EXTERNAL_PREFIXES = ['fa-'];

/**
 * FontAwesome's style-family classes. They live in the same CDN sheet as the
 * fa-* glyph names above but carry no hyphen, so the prefix test cannot see
 * them. Matched exactly rather than by prefix, so a real class that merely
 * begins with "fa" is still checked.
 */
const EXTERNAL_CLASSES = new Set(['fas', 'far', 'fab', 'fal', 'fad', 'fat', 'fa']);

/**
 * Semantic wrapper classes that intentionally carry no styling. They exist to
 * name a region for humans reading the markup. Listed explicitly so that a real
 * typo cannot hide behind "probably just a wrapper".
 */
const IGNORED_CLASSES = new Set([
  'header-actions',
  'framework-section',
  'resources-section',
  'mobile-resources-menu',
  'contact-consultant',
  'bad-data-field__control--currency',
  // Marker classes on data-es/data-en/data-pt anchors that localizeLinks()
  // rewrites by attribute rather than by class name.
  'language-resource-download',
  'language-scorecard-link',
]);

/** Files loaded from a CDN framework cannot be verified locally. */
const CDN_STYLESHEET = /^https?:\/\//i;
const CDN_FRAMEWORK = /cdn\.tailwindcss\.com|bootstrap|bulma/i;

const unescapeSelector = (value) => value.replace(/\\(.)/g, '$1');

/** Every class selector defined anywhere in a stylesheet. */
const definedClasses = (css) => {
  const found = new Set();
  // Strip comments and at-rule preludes are harmless; we only scan selectors.
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectorPattern = /\.((?:[a-zA-Z0-9_-]|\\[\s\S])+)/g;
  let match;
  while ((match = selectorPattern.exec(withoutComments)) !== null) {
    found.add(unescapeSelector(match[1]));
  }
  return found;
};

/** Every class token used in a chunk of HTML. */
const usedClasses = (html) => {
  const found = new Map();
  const attributePattern = /\bclass\s*=\s*"([^"]*)"/g;
  let match;
  while ((match = attributePattern.exec(html)) !== null) {
    // A class attribute assembled in JavaScript (`class="${ok ? 'a' : 'b'}"`)
    // is not markup; splitting it on whitespace yields quoted fragments and
    // ternary operators that no stylesheet will ever define.
    if (match[1].includes('${')) continue;
    const line = html.slice(0, match.index).split('\n').length;
    for (const token of match[1].split(/\s+/)) {
      if (!token) continue;
      if (token.includes('__LANG__') || token.includes('{')) continue; // build placeholder
      if (!found.has(token)) found.set(token, line);
    }
  }
  return found;
};

/**
 * Concatenated JavaScript that could reference a class as a behavioural hook:
 * a querySelector, a classList toggle, or a generator's link-rewrite regex.
 * A class named there is intentional even though no CSS rule matches it.
 */
const collectHookSource = async () => {
  const parts = [];
  for (const dir of HOOK_SOURCES) {
    const entries = await readdir(path.join(ROOT, dir), { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (!entry.isFile() || !/\.(mjs|js|cjs)$/.test(entry.name)) continue;
      parts.push(await readIfPresent(path.join(ROOT, dir, entry.name)));
    }
  }
  return parts.join('\n');
};

const isHook = (token, hookSource) =>
  new RegExp(`(?<![\\w-])${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(hookSource);

const isExternal = (token) =>
  EXTERNAL_CLASSES.has(token) || EXTERNAL_PREFIXES.some((prefix) => token.startsWith(prefix));

const resolveHref = (href, htmlFile) =>
  href.startsWith('/')
    ? path.join(ROOT, href.slice(1))
    : path.resolve(path.dirname(path.join(ROOT, htmlFile)), href);

const collectStylesheets = async (html, htmlFile) => {
  const sheets = [];
  let usesCdnFramework = false;
  const linkPattern = /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi;
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    const href = /href=["']([^"']+)["']/i.exec(match[0])?.[1];
    if (!href) continue;
    if (CDN_FRAMEWORK.test(href)) usesCdnFramework = true;
    if (CDN_STYLESHEET.test(href)) continue;
    sheets.push(resolveHref(href, htmlFile));
  }
  // Tailwind's Play CDN arrives as a <script>, not a stylesheet link. Looking
  // only at link tags meant a page built entirely on the Play CDN was measured
  // against the hand-written subset, and every Tailwind utility on it read as
  // an undefined class.
  const scriptPattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  while ((match = scriptPattern.exec(html)) !== null) {
    if (CDN_FRAMEWORK.test(match[1])) usesCdnFramework = true;
  }
  return { sheets, usesCdnFramework };
};

const inlineStyleBlocks = (html) =>
  [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join('\n');

const readIfPresent = async (file) => {
  try {
    if (!(await stat(file)).isFile()) return '';
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
};

/** Stylesheets that are injected by generators rather than linked in source HTML. */
const generatedStylesheets = async () => {
  const cssDir = path.join(ROOT, 'assets/css');
  const entries = await readdir(cssDir).catch(() => []);
  return entries.filter((entry) => entry.endsWith('.css')).map((entry) => path.join(cssDir, entry));
};

const checkFile = async (htmlFile, extraSheets, hookSource) => {
  const html = await readIfPresent(path.join(ROOT, htmlFile));
  if (!html) return { file: htmlFile, skipped: 'missing', missing: [] };

  const { sheets, usesCdnFramework } = await collectStylesheets(html, htmlFile);
  if (usesCdnFramework) return { file: htmlFile, skipped: 'cdn framework', missing: [] };

  const defined = new Set();
  for (const sheet of [...sheets, ...extraSheets]) {
    for (const name of definedClasses(await readIfPresent(sheet))) defined.add(name);
  }
  for (const name of definedClasses(inlineStyleBlocks(html))) defined.add(name);

  const missing = [];
  for (const [token, line] of usedClasses(html)) {
    if (defined.has(token)) continue;
    if (IGNORED_CLASSES.has(token)) continue;
    if (isExternal(token)) continue;
    if (isHook(token, hookSource)) continue;
    missing.push({ token, line });
  }
  return { file: htmlFile, missing };
};

/**
 * Everything a class name could plausibly be written in: hand-edited markup, the
 * generator templates that assemble the rest, the scripts that toggle classes at
 * runtime, and the article prose the CMS turns into HTML. Stylesheets are
 * excluded on purpose -- a class defined in a second stylesheet is still not a
 * class anybody uses.
 */
const USAGE_ROOTS = [
  'src', 'scripts', 'assets/js', 'assets/templates', 'admin', 'simulators', 'content',
  'netlify/functions', 'thank-you.html', '404.html',
  'en/blog/index.html', 'es/blog/index.html', 'pt/blog/index.html',
];
const USAGE_EXTENSIONS = /\.(html|js|mjs|cjs|mts|md|json|yml)$/i;

const collectUsageCorpus = async () => {
  const parts = [];
  const visit = async (target) => {
    const info = await stat(target).catch(() => null);
    if (!info) return;
    if (info.isFile()) {
      if (USAGE_EXTENSIONS.test(target)) parts.push(await readIfPresent(target));
      return;
    }
    for (const entry of await readdir(target).catch(() => [])) {
      if (entry === 'node_modules') continue;
      await visit(path.join(target, entry));
    }
  };
  for (const root of USAGE_ROOTS) await visit(path.join(ROOT, root));
  return parts.join('\n');
};

/**
 * The other direction: rules that exist in the hand-written Tailwind subset but
 * that nothing references any more.
 *
 * Checking only used-to-defined lets the stylesheet grow forever -- a class
 * survives every refactor that removed its last consumer, because nothing ever
 * asks the question. This is reported, never enforced: a rule can legitimately
 * be kept ahead of the markup that will use it, and no dead CSS is worth a
 * failed deploy.
 */
const unusedDefinitions = async () => {
  const stylesheet = await readIfPresent(path.join(ROOT, 'assets/styles.css'));
  const corpus = await collectUsageCorpus();
  const unused = [];
  for (const name of [...definedClasses(stylesheet)].sort()) {
    // `definedClasses` also matches the decimal part of values like `0.375rem`,
    // so anything that does not start like an identifier is not a class at all.
    if (!/^[a-zA-Z]/.test(name)) continue;
    if (isExternal(name)) continue;
    if (IGNORED_CLASSES.has(name)) continue;
    const token = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(?<![\\w-])${token}(?![\\w-])`).test(corpus)) continue;
    unused.push(name);
  }
  return unused;
};

export const checkClassCoverage = async () => {
  // Generated pages pull in blog.css / confession-wall.css without a link tag in
  // the source HTML, so treat every stylesheet under assets/css as available.
  const extraSheets = await generatedStylesheets();
  const hookSource = await collectHookSource();
  const enforced = [];
  for (const htmlFile of HTML_SOURCES) {
    enforced.push(await checkFile(htmlFile, extraSheets, hookSource));
  }
  const advisory = [];
  for (const htmlFile of ADVISORY_SOURCES) {
    advisory.push(await checkFile(htmlFile, extraSheets, hookSource));
  }
  return { enforced, advisory, unused: await unusedDefinitions() };
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const { enforced, advisory, unused } = await checkClassCoverage();

  const report = (result, { detailed }) => {
    if (result.skipped) {
      console.log(`- ${result.file}: skipped (${result.skipped})`);
      return 0;
    }
    if (result.missing.length === 0) {
      console.log(`- ${result.file}: ok`);
      return 0;
    }
    console.log(`- ${result.file}: ${result.missing.length} undefined class(es)`);
    if (detailed) {
      for (const { token, line } of result.missing) {
        console.log(`    ${result.file}:${line}  .${token}`);
      }
    }
    return result.missing.length;
  };

  let failures = 0;
  for (const result of enforced) failures += report(result, { detailed: true });

  const advisoryTotal = advisory.reduce((total, result) => total + report(result, { detailed: false }), 0);
  if (advisoryTotal > 0) {
    console.log(`\nadvisory: ${advisoryTotal} undefined class(es) on self-contained simulator pages (not enforced)`);
  }

  if (unused.length > 0) {
    console.log(`\nadvisory: ${unused.length} rule(s) in assets/styles.css that nothing references`);
    for (const name of unused) console.log(`    .${name}`);
  }

  if (failures > 0) {
    console.error(`\nclass coverage: ${failures} class(es) used in markup but never defined in CSS`);
    process.exit(1);
  }
  console.log('\nclass coverage: all classes resolve to a CSS rule');
}
