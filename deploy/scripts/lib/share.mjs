/**
 * The share row that appears on every article.
 *
 * Built at generate time, not in the browser. A share button assembled by
 * JavaScript is invisible to a reader with a blocked script and to every crawler
 * that does not run one, and it is one more thing that can be forgotten when a
 * new page type is added. Because this is called from renderArticlePage, an
 * article published tomorrow gets the row without anybody doing anything: the
 * only inputs are the canonical URL and the title, which every article has.
 *
 * There is deliberately no per-article image. The card every platform renders
 * comes from the site's og:image — one purpose-built 1200x630 branded card,
 * declared in scripts/lib/brand.mjs and already in the head of every page. What
 * a platform will not do is generate a screenshot of the page for you: omit
 * og:image and LinkedIn shows a bare text link. So the branded card is what
 * makes a shared link look like something, and it needs no work per article.
 *
 * Only the copy-link and native-share buttons need script. Both degrade to
 * nothing visible when they cannot work: the copy button is progressively
 * enhanced by assets/js/share.js, and the native one is hidden until the script
 * confirms navigator.share exists.
 */

const COPY = {
  en: {
    label: 'Share this article',
    linkedin: 'Share on LinkedIn',
    x: 'Share on X',
    whatsapp: 'Share on WhatsApp',
    email: 'Share by email',
    copy: 'Copy link',
    copied: 'Link copied',
    native: 'Share',
  },
  es: {
    label: 'Comparte este artículo',
    linkedin: 'Compartir en LinkedIn',
    x: 'Compartir en X',
    whatsapp: 'Compartir por WhatsApp',
    email: 'Compartir por correo',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    native: 'Compartir',
  },
  pt: {
    label: 'Compartilhe este artigo',
    linkedin: 'Compartilhar no LinkedIn',
    x: 'Compartilhar no X',
    whatsapp: 'Compartilhar no WhatsApp',
    email: 'Compartilhar por e-mail',
    copy: 'Copiar link',
    copied: 'Link copiado',
    native: 'Compartilhar',
  },
};

const escapeAttribute = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The four networks people actually share professional writing on, plus email.
 *
 * LinkedIn is first because it is where this audience is and where the site's
 * existing newsletter lives. Each entry gets the canonical absolute URL — a
 * relative one would be shared as the sharing platform's own domain.
 */
const NETWORKS = [
  {
    key: 'linkedin',
    icon: 'fa-brands fa-linkedin-in',
    href: ({ url }) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: 'x',
    icon: 'fa-brands fa-x-twitter',
    href: ({ url, title }) =>
      `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    key: 'whatsapp',
    icon: 'fa-brands fa-whatsapp',
    href: ({ url, title }) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    key: 'email',
    icon: 'fa-solid fa-envelope',
    // No target="_blank": a mail client is not a new tab, and forcing one leaves
    // the reader on a blank page when the handler opens an external app.
    newTab: false,
    href: ({ url, title }) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}`)}`,
  },
];

export const renderShareBar = (lang, { url, title }) => {
  const copy = COPY[lang] || COPY.en;
  const context = { url, title };

  const buttons = NETWORKS.map((network) => {
    const label = copy[network.key];
    const tab = network.newTab === false ? '' : ' target="_blank" rel="noopener noreferrer"';
    return `<a class="share-button share-button--${network.key}" href="${escapeAttribute(
      network.href(context)
    )}"${tab} aria-label="${escapeAttribute(label)}" title="${escapeAttribute(label)}"><i class="${
      network.icon
    }" aria-hidden="true"></i><span>${escapeAttribute(label)}</span></a>`;
  }).join('');

  return `<aside class="share-bar" data-share aria-labelledby="share-heading">
      <h2 class="share-bar__label" id="share-heading"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i>${escapeAttribute(
        copy.label
      )}</h2>
      <div class="share-bar__buttons">${buttons}<button class="share-button share-button--copy" type="button" data-share-copy data-share-url="${escapeAttribute(
        url
      )}" data-share-copied="${escapeAttribute(copy.copied)}" aria-label="${escapeAttribute(
        copy.copy
      )}"><i class="fa-solid fa-link" aria-hidden="true"></i><span>${escapeAttribute(
        copy.copy
      )}</span></button><button class="share-button share-button--native" type="button" hidden data-share-native data-share-url="${escapeAttribute(
        url
      )}" data-share-title="${escapeAttribute(title)}" aria-label="${escapeAttribute(
        copy.native
      )}"><i class="fa-solid fa-ellipsis" aria-hidden="true"></i><span>${escapeAttribute(copy.native)}</span></button></div>
      <p class="share-bar__status" role="status" aria-live="polite" data-share-status></p>
    </aside>`;
};
