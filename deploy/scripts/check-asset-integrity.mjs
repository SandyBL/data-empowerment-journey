#!/usr/bin/env node
/**
 * Asset integrity check.
 *
 * Every file this site loads from somebody else's server is a file somebody
 * else can change. Subresource Integrity closes that hole -- the browser
 * refuses a script whose bytes do not match the recorded hash -- but SRI only
 * protects the tags that actually carry a hash, and nothing stops the next
 * person from pasting a copy-and-paste snippet from a CDN's "quick start" page
 * that carries neither a hash nor a version.
 *
 * This script is that stop. It holds the one list of third-party URLs the site
 * is allowed to load and the exact hash each must be pinned to, and it fails
 * the build when the markup or the JavaScript disagrees. Adding a dependency,
 * or bumping one, therefore becomes a deliberate two-step act: compute the
 * hash, record it here.
 *
 * It also fails the build on two smaller regressions that are easy to
 * reintroduce and invisible once shipped: a new tab opened without
 * rel="noopener", and a third-party URL smuggled in through JavaScript rather
 * than a tag.
 *
 * Run standalone (`node scripts/check-asset-integrity.mjs`) or as part of the
 * build, which calls it after the pages are generated so it inspects exactly
 * what gets published.
 *
 * To add or update a pin:
 *   curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The complete set of third-party URLs the site may load, and the sha384 each
 * must carry. Every entry is a specific version: a floating range or a
 * "latest" URL cannot be hashed, because the bytes behind it change without
 * notice -- which is the whole problem.
 */
const PINNED = new Map([
  [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0',
  ],
  [
    'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js',
    'sha384-c6Uo4N9c3SOEigMVzP6IshUG1wQ5uMp3xeoQFiHWAQ86joWdgyajkvopySyKy/Z6',
  ],
  [
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H',
  ],
  [
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk',
  ],
  [
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
    'sha384-HAH79XdRvHr6axVGh4xQWVCp14kcd32bNk4Xu0sHDHtFQ42n6BAM8ykvB47dGz6D',
  ],
  [
    'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.js',
    'sha384-hfkuqrKeWFmnTMWN31VWyoe8xgdTADD11kgxmdpx2uyE6j5Az5uZq6u6AKYYmAOw',
  ],
  [
    'https://unpkg.com/lucide@1.31.0/dist/umd/lucide.min.js',
    'sha384-/ApD3KXMqTmTxEJjuldaZDgdJj7/Hox2LRuKqV3rC7Bu/wE4obLaJRjF1rLHNP57',
  ],
]);

/**
 * Exact URLs that are version-pinned but must NOT carry integrity or
 * crossorigin, because the origin serving them sends no CORS headers.
 *
 * Subresource Integrity is only defined for a response the browser is allowed
 * to read. Adding `integrity` and `crossorigin="anonymous"` to a script from an
 * origin that answers without `Access-Control-Allow-Origin` turns the response
 * opaque, the hash can never be compared, and the browser blocks the script
 * outright -- a correct hash makes no difference. Tailwind's Play CDN is such an
 * origin, and it compiles the stylesheet for seven simulator pages in the
 * browser, so blocking it strips those pages of every rule they have and leaves
 * a wall of unstyled text.
 *
 * The version in the URL is the guarantee here: cdn.tailwindcss.com/3.4.17
 * resolves to one immutable build. Removing the version, not removing the hash,
 * is what would weaken this.
 *
 * The real fix is to stop compiling Tailwind in the browser and ship a built
 * stylesheet, which also removes the origin from the page's script-src.
 */
const CORS_INCAPABLE = new Map([
  [
    'https://cdn.tailwindcss.com/3.4.17',
    'cdn.tailwindcss.com sends no Access-Control-Allow-Origin, so an integrity attribute would block the script instead of verifying it.',
  ],
]);

/**
 * URLs that genuinely cannot be pinned, with the reason. Anything not on this
 * list and not in PINNED fails.
 */
const UNPINNABLE = new Map([
  [
    'https://fonts.googleapis.com/',
    'Google Fonts serves different CSS per browser, so no single hash is correct for every visitor. The font files it points at are immutable and versioned by URL.',
  ],
  [
    'https://unpkg.com/decap-cms@',
    'Decap CMS is loaded behind a semver range so security patches reach the editor without a deploy. It runs only on /admin/, behind Netlify Identity, and touches no visitor-facing page.',
  ],
]);

/** Hosts we treat as code delivery, i.e. worth policing when a URL appears in JavaScript. */
const CDN_HOSTS = [
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdn.tailwindcss.com',
  'esm.sh',
  'esm.run',
  'skypack.dev',
  'ga.jspm.io',
];

const SCAN_HTML_SKIP = new Set(['node_modules', '.git', '.netlify', '.vscode']);
const SCAN_JS_DIRS = ['assets/js', 'assets/js/vendor'];

const collectHtml = async (dir, found = []) => {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (SCAN_HTML_SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await collectHtml(full, found);
    else if (entry.name.endsWith('.html')) found.push(full);
  }
  return found;
};

const unpinnableReason = (url) => {
  for (const [prefix, reason] of UNPINNABLE) {
    if (url.startsWith(prefix)) return reason;
  }
  return null;
};

const attribute = (tag, name) =>
  new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(tag)?.[1] ?? null;

/** Cross-origin <script src> and <link rel="stylesheet"> tags, hash checked. */
const checkTags = (html, relative, problems) => {
  for (const match of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
    const tag = match[0];
    const isLink = /^<link/i.test(tag);
    if (isLink && !/rel=["']stylesheet["']/i.test(tag)) continue;

    const url = attribute(tag, isLink ? 'href' : 'src');
    if (!url || !/^https?:\/\//i.test(url)) continue;

    const line = html.slice(0, match.index).split('\n').length;
    const at = `${relative}:${line}`;

    if (unpinnableReason(url)) continue;

    // A pinned-but-CORS-incapable asset is the inverse check: the tag is wrong
    // if it *has* the attributes, because they stop the browser loading it.
    if (CORS_INCAPABLE.has(url)) {
      if (attribute(tag, 'integrity') || attribute(tag, 'crossorigin')) {
        problems.push(
          `${at}  integrity/crossorigin on a CDN that sends no CORS headers blocks the asset: ${url}\n      ${CORS_INCAPABLE.get(url)}`
        );
      }
      continue;
    }

    const expected = PINNED.get(url);
    if (!expected) {
      problems.push(`${at}  third-party URL is not in the pinned list: ${url}`);
      continue;
    }

    const integrity = attribute(tag, 'integrity');
    if (!integrity) {
      problems.push(`${at}  missing integrity for ${url}`);
    } else if (integrity !== expected) {
      problems.push(`${at}  integrity does not match the pinned hash for ${url}`);
    }

    // Without crossorigin the response is opaque and the browser cannot check
    // the hash it was given, so the integrity attribute silently does nothing.
    if (!attribute(tag, 'crossorigin')) {
      problems.push(`${at}  missing crossorigin, which makes integrity unenforceable: ${url}`);
    }
  }
};

/** target="_blank" hands the new page a handle on this one unless rel says otherwise. */
const checkBlankTargets = (html, relative, problems) => {
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/target\s*=\s*["']_blank["']/i.test(tag)) continue;
    if (/\brel\s*=\s*["'][^"']*\bnoopener\b/i.test(tag)) continue;
    const line = html.slice(0, match.index).split('\n').length;
    problems.push(`${relative}:${line}  target="_blank" without rel="noopener"`);
  }
};

/** A CDN URL in JavaScript loads code just as a tag does, and carries no hash of its own. */
const checkScriptSources = (source, relative, problems) => {
  for (const match of source.matchAll(/https?:\/\/[^\s'"`)]+/g)) {
    const url = match[0].replace(/[.,;]+$/, '');
    let host;
    try {
      host = new URL(url).host;
    } catch {
      continue;
    }
    if (!CDN_HOSTS.includes(host)) continue;
    if (unpinnableReason(url) || PINNED.has(url) || CORS_INCAPABLE.has(url)) continue;
    const line = source.slice(0, match.index).split('\n').length;
    problems.push(`${relative}:${line}  third-party URL is not in the pinned list: ${url}`);
  }
};

export const checkAssetIntegrity = async () => {
  const problems = [];

  for (const file of await collectHtml(ROOT)) {
    const relative = path.relative(ROOT, file);
    const html = await readFile(file, 'utf8');
    checkTags(html, relative, problems);
    checkBlankTargets(html, relative, problems);
  }

  for (const dir of SCAN_JS_DIRS) {
    const entries = await readdir(path.join(ROOT, dir), { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
      const relative = path.join(dir, entry.name);
      checkScriptSources(await readFile(path.join(ROOT, dir, entry.name), 'utf8'), relative, problems);
    }
  }

  return problems;
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const problems = await checkAssetIntegrity();
  if (problems.length) {
    console.error(`asset integrity: ${problems.length} problem(s)`);
    for (const problem of problems) console.error(`    ${problem}`);
    process.exit(1);
  }
  console.log(
    `asset integrity: ${PINNED.size} hashed third-party assets, ` +
      `${CORS_INCAPABLE.size} version-pinned without a hash (no CORS), every new tab safe`
  );
}
