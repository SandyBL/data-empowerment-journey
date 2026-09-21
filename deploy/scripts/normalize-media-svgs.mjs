#!/usr/bin/env node
/**
 * Sizes hand-uploaded SVGs in the media library so they render inside an <img>.
 *
 * An SVG drawn by a design tool or a chat assistant almost always arrives as
 * `width="100%" height="100%"` with its backdrop set by a CSS
 * `background-color` on the root element. That is correct for an SVG dropped
 * into a page and wrong for one referenced by `<img src>`, which is how every
 * picture in an article is published: the percentages have no containing block
 * to resolve against, the file reports no intrinsic size, `height: auto`
 * computes to nothing, and the picture is absent from the article while the
 * file itself opens perfectly in its own tab.
 *
 * scripts/lib/media.mjs already corrects this while rendering, so the published
 * page has always been right. What it cannot fix is the copy in the repository:
 * it writes inside the build's checkout, and nothing commits that back. The
 * Blog Content Studio reads the repository through the git backend, so the
 * author previewing their new article in the editor is shown the uploaded,
 * unsized file -- an empty box -- and reasonably concludes the image is broken.
 *
 * This closes that gap by applying the same transform, from the same function,
 * to the files on disk. Run it after uploading artwork -- `npm run media:svg`
 * -- and `--check` proves nothing in the library is still unsized, which is
 * what `npm run check` calls.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSvgForImg } from './lib/media.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA_DIR = path.join(ROOT, 'assets/images');

/** Every .svg under assets/images, as repo-relative paths. */
const svgFiles = async (directory) => {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await svgFiles(full)));
    else if (entry.name.toLowerCase().endsWith('.svg')) found.push(full);
  }
  return found.sort();
};

const main = async () => {
  const check = process.argv.includes('--check');
  const unsized = [];
  let written = 0;

  for (const file of await svgFiles(MEDIA_DIR)) {
    const normalized = normalizeSvgForImg(await readFile(file, 'utf8'));
    // Null means the file already states a pixel size and paints its own
    // backdrop, so there is nothing to do -- which is the usual case, and why
    // this is safe to run over the whole library.
    if (!normalized) continue;

    const relative = path.relative(ROOT, file);
    if (check) {
      unsized.push(relative);
      continue;
    }
    await writeFile(file, normalized, 'utf8');
    written += 1;
    console.log(`  Sized ${relative} from its viewBox (was unsized, so it rendered as an empty box).`);
  }

  if (check) {
    if (unsized.length) {
      console.error(
        `${unsized.length} SVG(s) in assets/images cannot size themselves inside an <img>, ` +
          `so they render as an empty box in the Blog Content Studio:\n` +
          unsized.map((file) => `  ${file}`).join('\n') +
          `\nRun \`npm run media:svg\` to correct them.`
      );
      process.exitCode = 1;
      return;
    }
    console.log('Every SVG in assets/images states its own size.');
    return;
  }

  console.log(written ? `Sized ${written} SVG(s).` : 'Every SVG in assets/images already states its own size.');
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
