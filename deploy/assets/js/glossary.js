/**
 * Opens the glossary term a fragment asks for.
 *
 * Every definition on /en/glossary/ is a <details> whose id is the last segment
 * of the URL that definition used to have, so /es/glosario/propietario-de-datos/
 * can 301 to /es/glosario/#propietario-de-datos and land on the same words. The
 * browser will scroll to that element on its own; what it will not reliably do
 * is open it. Fragment navigation expands the <details> an anchor sits *inside*
 * in current Chrome and Safari, but here the anchor *is* the <details>, and a
 * reader arriving from a search result or an old bookmark would otherwise see a
 * collapsed row and have to click the thing they already clicked.
 *
 * Everything this file does is recoverable by hand. With it switched off the
 * page is still a complete glossary: the fragment still scrolls, the summary
 * still shows the one-line definition, and the toggle still works. That is the
 * reason the markup is <details> and not a div with a click handler.
 */

/** The <details> for a term id, or null for the section ids and for junk. */
const termFor = (hash) => {
  if (!hash || hash.length < 2) return null;
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // A malformed escape is not an id we published. Fall through with the raw
    // text rather than throwing out of a load handler.
  }
  const target = document.getElementById(id);
  return target && target.tagName === 'DETAILS' ? target : null;
};

/**
 * The scroll is why this runs after opening rather than relying on the browser's
 * own jump: the browser scrolls to the collapsed row first, and opening it then
 * pushes the body of the definition, and often the heading too, off the bottom
 * of the screen. Re-aligning afterwards is what puts the term at the top.
 *
 * Instant, not smooth. A smooth scroll from the top of a 47-term page is a long
 * animation past everything the reader did not ask for, and this is the arrival
 * at a URL rather than a click.
 */
const reveal = (term) => {
  if (!term) return;
  term.open = true;
  term.scrollIntoView({ block: 'start', behavior: 'instant' });
};

/**
 * Keeps the address bar on the open term, so copying the URL shares the
 * definition rather than the top of the glossary.
 *
 * replaceState, not a hash assignment: writing location.hash pushes a history
 * entry, and a reader who opened six terms while browsing would need six Back
 * presses to leave the page.
 */
const remember = (term) => {
  if (!window.history?.replaceState) return;
  const next = term ? `#${term.id}` : window.location.pathname + window.location.search;
  window.history.replaceState(null, '', next);
};

const init = () => {
  const terms = document.querySelectorAll('details.glossary-term');
  if (!terms.length) return;

  reveal(termFor(window.location.hash));

  window.addEventListener('hashchange', () => {
    reveal(termFor(window.location.hash));
  });

  for (const term of terms) {
    term.addEventListener('toggle', () => {
      // Only the term being opened owns the address; closing it clears the
      // fragment, and closing some other one leaves it alone.
      if (term.open) remember(term);
      else if (window.location.hash === `#${term.id}`) remember(null);
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
