/**
 * The image assets every template and schema graph points at.
 *
 * These used to be spelled out per file, and all of them named the same 5.4 MB,
 * 2112x2048 logo master — as the favicon, as the 40px blog nav mark, and as the
 * social card. Social scrapers reject an image that size and browsers paid for
 * it on every page, so the master now lives unserved in src/brand/ and the
 * published assets are purpose-built: a 400x388 mark, a 32px icon, and a real
 * 1200x630 card. One definition here keeps them from drifting apart again.
 */

export const SITE_ORIGIN = 'https://datagovjourney.com';

/** 1200x630, the aspect ratio summary_large_image and LinkedIn both expect. */
export const OG_IMAGE = {
  url: '/assets/images/og-default.png',
  width: 1200,
  height: 630,
  alt: 'Data Governance Journey',
};

/** The published logo mark: 400x388, rendered at 200x194 and 40x40. */
export const LOGO = {
  url: '/assets/images/dg-logo.png',
  width: 400,
  height: 388,
};

/** Sandy Bradbury's portrait, rendered at 192 on the homepage and 96 in article bylines. */
export const PORTRAIT = { url: '/assets/images/sandy-bradbury.png', width: 384, height: 384 };

/**
 * Builds a Netlify Image CDN URL.
 *
 * The CDN negotiates AVIF/WebP from the request's Accept header, so a single
 * source PNG is delivered as the smallest format the browser accepts without
 * keeping one file per format in the repo.
 *
 * @param url    project-relative path to the source image
 * @param width  intended width in CSS pixels (pass the 2x value for crispness)
 * @param height optional height; omit to preserve the aspect ratio
 * @param fit    resize mode, only meaningful alongside a height
 */
export const imageCdn = (url, width, height, fit) => {
  const parameters = [`url=${encodeURIComponent(url)}`, `w=${width}`];
  if (height) parameters.push(`h=${height}`);
  if (fit) parameters.push(`fit=${fit}`);
  return `/.netlify/images?${parameters.join('&amp;')}`;
};

/**
 * The site's own inbox.
 *
 * Every contact route on this site used to be a form, and the one published
 * address anywhere was a personal Gmail account baked into the calculator's PDF
 * report. A form is fine for a first enquiry and useless for everything else: a
 * reader whose submission failed, a visitor who wants a confession taken down,
 * a journalist checking a claim, and a search engine looking for an
 * organization's contact point all need an address they can write to from
 * wherever they already are.
 *
 * Declared once here, beside SITE_ORIGIN, because it is now rendered into the
 * footer of every generated page, three Markdown page families, the structured
 * data graph, llms.txt, and the downloadable report templates. A second copy is
 * a second thing to forget the day the address changes.
 */
export const CONTACT_EMAIL = 'datagovjourney@gmail.com';

/** `mailto:` form of CONTACT_EMAIL, for href attributes. */
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
