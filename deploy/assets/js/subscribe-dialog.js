/**
 * Opens the newsletter signup as a pop-up instead of sending the reader to the
 * newsletter page.
 *
 * Every "Subscribe" link in the header, the drawer and the footer carries
 * `data-subscribe-dialog-open` and points at the homepage's #newsletter
 * section, so a reader without JavaScript, or one who opens it in a new tab,
 * still reaches a signup form.
 * The <dialog> itself is rendered beside the drawer by scripts/lib/site-nav.mjs
 * and submitted by newsletter.js, the same code every other signup form uses.
 */

import './newsletter.js';

const initialiseSubscribeDialog = () => {
  const dialog = document.querySelector('[data-subscribe-dialog]');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const form = dialog.querySelector('form');
  const status = dialog.querySelector('[data-newsletter-status]');

  // Which page the reader subscribed from, the same question `source` answers
  // for the inline forms.
  const source = dialog.querySelector('[data-subscribe-dialog-source]');
  if (source) source.value = `subscribe-dialog:${window.location.pathname}`.slice(0, 120);

  const open = () => {
    if (dialog.open) return;
    // A previous signup's confirmation should not greet the next visit.
    if (status) {
      status.textContent = '';
      delete status.dataset.state;
    }
    dialog.showModal();
    dialog.querySelector('input:not([type="hidden"]):not([tabindex="-1"])')?.focus();
  };

  document.querySelectorAll('[data-subscribe-dialog-open]').forEach((link) => {
    link.addEventListener('click', (event) => {
      // Let modified clicks open the page in a new tab as they always did.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open();
    });
  });

  dialog.querySelector('[data-subscribe-dialog-close]')?.addEventListener('click', () => dialog.close());

  // The dialog element is the backdrop around its panel, so a click that lands
  // on it rather than on the panel is a click outside.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  form?.addEventListener('reset', () => {
    // newsletter.js resets the form after a successful signup; keep the
    // confirmation in view and move focus to it so it is announced.
    status?.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => status?.focus());
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiseSubscribeDialog, { once: true });
} else {
  initialiseSubscribeDialog();
}
