/**
 * Progressive enhancement for the share row rendered by scripts/lib/share.mjs.
 *
 * The four network buttons are plain links and need nothing from this file —
 * they work with JavaScript disabled, which is the point of building them at
 * generate time. Two buttons cannot work without script, and each fails in a way
 * the reader never sees:
 *
 *   copy    the button ships enabled because the Clipboard API is available in
 *           every browser this site supports over HTTPS; if the write is refused
 *           anyway the status line says so instead of silently doing nothing.
 *   native  ships with `hidden` and is revealed only where navigator.share
 *           exists, so a desktop browser never shows a button that opens nothing.
 */

const STATUS_TIMEOUT = 2600;

/** One status line per share row, announced through its existing aria-live. */
const announce = (row, message) => {
  const status = row.querySelector('[data-share-status]');
  if (!status) return;
  status.textContent = message;
  window.clearTimeout(status.dataset.timer);
  status.dataset.timer = String(
    window.setTimeout(() => {
      status.textContent = '';
    }, STATUS_TIMEOUT)
  );
};

/**
 * Clipboard write with a selection-based fallback.
 *
 * navigator.clipboard is undefined on a page served over plain HTTP and refused
 * outright by some in-app browsers, both of which a reader can arrive through.
 */
const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Clipboard unavailable');
};

const wireCopy = (row) => {
  const button = row.querySelector('[data-share-copy]');
  if (!button) return;
  button.addEventListener('click', async () => {
    try {
      await copyToClipboard(button.dataset.shareUrl || window.location.href);
      button.classList.add('is-copied');
      announce(row, button.dataset.shareCopied || 'Copied');
      window.setTimeout(() => button.classList.remove('is-copied'), STATUS_TIMEOUT);
    } catch {
      // Failing silently would look identical to succeeding, so say it plainly
      // and leave the URL visible in the address bar as the fallback.
      announce(row, button.dataset.shareUrl || window.location.href);
    }
  });
};

const wireNative = (row) => {
  const button = row.querySelector('[data-share-native]');
  if (!button || !navigator.share) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.share({
        title: button.dataset.shareTitle || document.title,
        url: button.dataset.shareUrl || window.location.href,
      });
    } catch {
      // AbortError is the common case: the reader opened the sheet and closed
      // it. Nothing went wrong and nothing needs saying.
    }
  });
};

for (const row of document.querySelectorAll('[data-share]')) {
  wireCopy(row);
  wireNative(row);
}
