/**
 * The image files Markdown points at, checked and measured against what the
 * repository actually publishes.
 *
 * An article written in the Blog Content Studio carries its images as ordinary
 * Markdown -- `![alt](/assets/images/blog/diagram.svg)` -- and the editor
 * commits the uploaded file alongside the article that references it. Two
 * things still have to be true for the image to reach a reader intact, and
 * neither is visible from the Markdown on its own:
 *
 *  1. A file has to exist at the path the article names -- and the path an
 *     article names is not always the path the studio uploaded to. A draft
 *     written outside the editor carries whatever path its author typed
 *     (`/images/diagram.svg` is the common one), and uploading the picture
 *     through the + button does not rewrite a reference that was already in
 *     the body. So a reference that resolves to nothing is matched against the
 *     upload folder by filename first: uploads all land in one flat directory,
 *     so a name that matches there is that file and the <img> is pointed at
 *     where it really lives. Only a name with no upload behind it at all fails
 *     the build, rather than publishing an article with a broken image in the
 *     middle of it. Netlify then keeps the previous deploy live and names the
 *     file in the log, which is the same bargain the rest of this build makes
 *     with a missing author or an unknown category.
 *  2. The <img> has to say how big the image is, so the browser can reserve the
 *     space before the bytes arrive. Nothing in the Markdown says, so the size
 *     is read off the file: the viewBox of an SVG, the header of a PNG or JPEG.
 *
 * Formats beyond those three still render; they simply render without a
 * reserved box, which is worth knowing before uploading a WebP hero.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageSources } from './markdown.mjs';

/** The published directory, which is also the repository root of this site. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Where the studio's media library uploads land, as a public URL. */
export const MEDIA_PUBLIC_FOLDER = '/assets/images/blog';

/** The same directory on disk, which is what the name lookup below reads. */
const MEDIA_DIRECTORY = path.join(ROOT, MEDIA_PUBLIC_FOLDER.slice(1));

/**
 * Every uploaded filename, keyed by its lowercase form, read at most once per
 * build and only when something has already failed to resolve.
 *
 * Lowercase because the studio keeps whatever case the file had on the author's
 * machine and a reference typed by hand rarely reproduces it -- a mismatch that
 * is invisible on macOS and a 404 on the Linux box that serves the site. The
 * value is the real entry, so the path written into the page is the one Netlify
 * will answer on.
 */
let uploads;
const mediaLibrary = async () => {
  uploads ??= new Map(
    (await readdir(MEDIA_DIRECTORY).catch(() => [])).map((name) => [name.toLowerCase(), name])
  );
  return uploads;
};

/**
 * The filename an image source ends in, which is the name the studio would
 * have uploaded it under. The query string and fragment go first, and the
 * percent-encoding a path with a space in it carries is undone, so the name
 * compares equal to a directory entry.
 */
const uploadName = (source) => {
  const withoutQuery = source.split(/[?#]/)[0];
  try {
    return path.posix.basename(decodeURIComponent(withoutQuery));
  } catch {
    return path.posix.basename(withoutQuery);
  }
};

/**
 * An SVG states its size as width/height, as a viewBox, or as both. The
 * attributes win when they are plain pixel numbers; a percentage or an em is a
 * size relative to a box the file does not know about, so those fall through to
 * the viewBox, which is the only intrinsic ratio a scalable file really has.
 */
const svgSize = (source) => {
  const tag = source.match(/<svg\b[^>]*>/i)?.[0];
  if (!tag) return null;

  const attribute = (name) => new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(tag)?.[1] ?? '';
  const pixels = (value) => (/^\s*\d+(\.\d+)?(px)?\s*$/.test(value) ? Number.parseFloat(value) : 0);

  const width = pixels(attribute('width'));
  const height = pixels(attribute('height'));
  if (width > 0 && height > 0) return { width: Math.round(width), height: Math.round(height) };

  const box = attribute('viewBox').trim().split(/[\s,]+/).map(Number);
  if (box.length === 4 && box[2] > 0 && box[3] > 0) {
    return { width: Math.round(box[2]), height: Math.round(box[3]) };
  }
  return null;
};

/**
 * Rewrites an SVG that cannot size itself inside an <img>.
 *
 * An SVG authored for a web page is usually told to fill its container --
 * `width="100%" height="100%"`, with the backdrop painted by a CSS
 * `background-color` on the root element. Both are reasonable in a page and
 * both break the moment the same file is referenced by an <img>, which is how
 * every picture in an article is published.
 *
 * A percentage resolves against a containing block, and an image referenced by
 * <img> has none, so the file reports no intrinsic width or height at all. The
 * article stylesheet then asks for `height: auto`
 * (assets/css/blog.css:154) and the browser has nothing to compute it from, so
 * the figure collapses to no height and the picture is simply absent from the
 * page -- while the file itself answers 200 and opens perfectly in a new tab,
 * which is what makes this look like anything other than a sizing bug.
 *
 * The same reasoning covers the backdrop: a CSS background belongs to the
 * element, and an <img> paints the image, not the element's own background, so
 * the fill has to become a real shape inside the document.
 *
 * So both are corrected here, in the one place every image on the site passes
 * through. The viewBox is the fix for the first -- it is the intrinsic size a
 * scalable file really has -- and a <rect> under the artwork is the fix for the
 * second. The three change-management diagrams were repaired by hand in
 * September 2026 and the next article published with a hand-made SVG arrived
 * broken in exactly the same way, which is the argument for doing it here
 * rather than a fourth time: the pattern comes from whatever tool draws the
 * picture, so it will keep arriving.
 *
 * Returns the corrected markup, or null when the file already sizes itself.
 */
const normalizeSvgForImg = (text) => {
  const tag = text.match(/<svg\b[^>]*>/i)?.[0];
  if (!tag) return null;

  // Quote-aware: a style attribute routinely carries single-quoted font names
  // inside its double quotes (`style="font-family: 'Segoe UI', Arial"`), and a
  // reader that stops at the first quote of either kind truncates the value and
  // corrupts the tag when it writes it back.
  const attributePattern = (name) => new RegExp(`\\b${name}\\s*=\\s*(["'])((?:(?!\\1)[\\s\\S])*)\\1`, 'i');
  const attribute = (name) => attributePattern(name).exec(tag)?.[2] ?? '';
  const isPixels = (value) => /^\s*\d+(\.\d+)?(px)?\s*$/.test(value);

  // The size to adopt. Only the viewBox can supply it: a file that needs this
  // treatment is precisely one whose width and height are not readable lengths.
  const box = attribute('viewBox').trim().split(/[\s,]+/).map(Number);
  if (box.length !== 4 || !(box[2] > 0) || !(box[3] > 0)) return null;
  const width = Math.round(box[2]);
  const height = Math.round(box[3]);

  const needsSize = !isPixels(attribute('width')) || !isPixels(attribute('height'));

  // A background declaration on the root element, which an <img> never paints.
  const style = attribute('style');
  const background = /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();

  if (!needsSize && !background) return null;

  let rewritten = tag;

  if (needsSize) {
    // Drop whatever unusable width/height the file carries, then state the real
    // one. Written immediately after "<svg" so the size is the first thing in
    // the tag, which is where every other diagram in this repository has it.
    rewritten = rewritten
      .replace(new RegExp(`\\s+${attributePattern('width').source}`, 'i'), '')
      .replace(new RegExp(`\\s+${attributePattern('height').source}`, 'i'), '')
      .replace(/^<svg\b/i, `<svg width="${width}" height="${height}"`);
  }

  if (background) {
    // The background moves out of the style attribute so it cannot be mistaken
    // for a live declaration; anything else in there (a font stack, usually) is
    // left exactly as it was.
    const remaining = style
      .split(';')
      .filter((declaration) => !/^\s*background(-color)?\s*:/i.test(declaration))
      .join(';')
      .replace(/^;+|;+$/g, '')
      .trim();
    rewritten = remaining
      ? rewritten.replace(attributePattern('style'), `style="${remaining}"`)
      : rewritten.replace(new RegExp(`\\s+${attributePattern('style').source}`, 'i'), '');
  }

  let output = text.replace(tag, rewritten);
  if (background) {
    // First child, so it sits under the artwork rather than over it.
    output = output.replace(
      rewritten,
      `${rewritten}\n  <rect width="${width}" height="${height}" fill="${background}"/>`
    );
  }
  return output === text ? null : output;
};

/** Every PNG opens with the IHDR chunk, and its first two fields are the size. */
const pngSize = (bytes) =>
  bytes.length >= 24 && bytes.toString('ascii', 12, 16) === 'IHDR'
    ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
    : null;

/**
 * A JPEG is a chain of length-prefixed segments; the size lives in the frame
 * header, whichever of the several frame markers this particular file uses.
 * 0xc4, 0xc8 and 0xcc share that range without being frames.
 */
const jpegSize = (bytes) => {
  let offset = 2;
  while (offset + 9 < bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  return null;
};

const intrinsicSize = (file, bytes) => {
  const extension = path.extname(file).toLowerCase();
  if (extension === '.svg') return svgSize(bytes.toString('utf8'));
  if (extension === '.png') return pngSize(bytes);
  if (extension === '.jpg' || extension === '.jpeg') return jpegSize(bytes);
  return null;
};

/**
 * Turns an image source into the file it refers to, or null when the source
 * points outside the published directory. The site is served from the
 * repository root, so a root-relative path is a repository path -- but only
 * while it stays inside, which is what the containment check enforces.
 */
const resolveFile = (source) => {
  const withoutQuery = source.split(/[?#]/)[0];
  let decoded;
  try {
    decoded = decodeURIComponent(withoutQuery);
  } catch {
    return null;
  }
  const file = path.resolve(ROOT, `.${decoded}`);
  return file === ROOT || file.startsWith(`${ROOT}${path.sep}`) ? file : null;
};

/**
 * Reads every image a document references and returns the lookup
 * renderMarkdown wants: given the source written in the Markdown it answers
 * with the path to publish and, when the format is one of the three measured
 * above, the intrinsic size to reserve.
 *
 * Throws on the first name this repository has no file for -- neither at the
 * path given nor in the upload folder -- naming the document that referenced it
 * and where uploads go.
 *
 * @param markdown  the document body
 * @param where     the content path to name if something is missing
 */
export const resolveImageSizes = async (markdown, where) => {
  const resolved = new Map();

  for (const source of imageSources(markdown)) {
    // An https:// image is hosted by somebody else: there is no file to read,
    // and no size to promise on their behalf.
    if (!source.startsWith('/') || resolved.has(source)) continue;

    let src = source;
    let file = resolveFile(src);
    let bytes = file ? await readFile(file).catch(() => null) : null;

    // Nothing at the path the article names. Before giving up, look for an
    // upload of the same name: that is the picture the author placed through
    // the editor, sitting where the media library put it rather than where the
    // draft said it would be.
    if (!bytes) {
      const library = await mediaLibrary();
      const name = uploadName(src);
      // The name as written, then the same name with its extension doubled or
      // de-doubled. A picture saved as "diagram.svg" and uploaded by a studio
      // that appends the type again lands as "diagram.svg.svg", and the
      // reference and the file then disagree by one extension in whichever
      // direction the author corrected first.
      const extension = path.posix.extname(name);
      const candidates = [name];
      if (extension) {
        candidates.push(`${name}${extension}`);
        if (name.toLowerCase().endsWith(`${extension}${extension}`.toLowerCase())) {
          candidates.push(name.slice(0, -extension.length));
        }
      }

      for (const candidate of candidates) {
        const upload = library.get(candidate.toLowerCase());
        if (!upload) continue;
        src = `${MEDIA_PUBLIC_FOLDER}/${upload}`;
        file = path.join(MEDIA_DIRECTORY, upload);
        bytes = await readFile(file).catch(() => null);
        if (bytes) break;
      }
    }

    if (!bytes) {
      throw new Error(
        `${where} references an image this site does not have: ${source}\n` +
          `    Upload it in the Blog Content Studio (the + button in the editor, then Image) ` +
          `or correct the path. Uploads are served from ${MEDIA_PUBLIC_FOLDER}/.`
      );
    }

    // An SVG drawn for a page rather than for an <img> is corrected on disk,
    // once, before it is measured -- so the bytes the browser fetches are the
    // corrected ones and the size read below is the size it will actually
    // report. Idempotent: a file that already states a pixel size is left
    // untouched, so this is a no-op on every build after the first.
    if (path.extname(file).toLowerCase() === '.svg') {
      const normalized = normalizeSvgForImg(bytes.toString('utf8'));
      if (normalized) {
        await writeFile(file, normalized, 'utf8');
        bytes = Buffer.from(normalized, 'utf8');
        console.log(`  Sized ${src} for <img> from its viewBox (was unsized, so it rendered as an empty box).`);
      }
    }

    resolved.set(source, { src, ...intrinsicSize(file, bytes) });
  }

  return (source) => resolved.get(source) ?? null;
};
