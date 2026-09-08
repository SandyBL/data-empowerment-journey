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
 *  1. A file has to exist at the path the article names. A path with nothing
 *     behind it fails the build here rather than publishing an article with a
 *     broken image in the middle of it. Netlify then keeps the previous deploy
 *     live and names the file in the log, which is the same bargain the rest of
 *     this build makes with a missing author or an unknown category.
 *  2. The <img> has to say how big the image is, so the browser can reserve the
 *     space before the bytes arrive. Nothing in the Markdown says, so the size
 *     is read off the file: the viewBox of an SVG, the header of a PNG or JPEG.
 *
 * Formats beyond those three still render; they simply render without a
 * reserved box, which is worth knowing before uploading a WebP hero.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageSources } from './markdown.mjs';

/** The published directory, which is also the repository root of this site. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Where the studio's media library uploads land, for the error message below. */
export const MEDIA_PUBLIC_FOLDER = '/assets/images/blog';

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
 * Reads every image a document references and returns the size lookup
 * renderMarkdown wants. Throws on the first path this repository cannot serve,
 * naming the file that referenced it and where uploads go.
 *
 * @param markdown  the document body
 * @param where     the content path to name if something is missing
 */
export const resolveImageSizes = async (markdown, where) => {
  const sizes = new Map();

  for (const source of imageSources(markdown)) {
    // An https:// image is hosted by somebody else: there is no file to read,
    // and no size to promise on their behalf.
    if (!source.startsWith('/') || sizes.has(source)) continue;

    const file = resolveFile(source);
    const bytes = file ? await readFile(file).catch(() => null) : null;
    if (!bytes) {
      throw new Error(
        `${where} references an image this site does not have: ${source}\n` +
          `    Upload it in the Blog Content Studio (the + button in the editor, then Image) ` +
          `or correct the path. Uploads are served from ${MEDIA_PUBLIC_FOLDER}/.`
      );
    }
    sizes.set(source, intrinsicSize(file, bytes));
  }

  return (source) => sizes.get(source) ?? null;
};
