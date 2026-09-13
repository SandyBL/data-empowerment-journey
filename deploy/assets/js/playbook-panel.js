/**
 * Opens the post-download panel once a playbook is already downloading.
 *
 * The thing this file must never do is interfere with the download. The three
 * anchors it listens to are real `<a href="…pdf" download>` links: nothing here
 * calls preventDefault, nothing here is asked for before the file leaves, and
 * with this script blocked or broken the page behaves exactly as it did before
 * it existed. That is the whole design -- see scripts/lib/playbook-panel.mjs
 * for why the alternative was rejected.
 *
 * The panel is a native <dialog>, so focus containment, Esc to close and the
 * inertness of the page behind it are the browser's job rather than this
 * file's. What is left is three small decisions: which playbook was taken, when
 * to show the panel, and how often.
 */

/**
 * Once per session, not once per download.
 *
 * A reader who takes all three PDFs has already been shown the simulators and
 * the scorecard by the time they reach the second one, and a panel that
 * reappears on every click stops being an invitation.
 */
const SESSION_KEY = 'dgj:playbook-panel';

// Storage access throws rather than returning null when the browser is set to
// block it, which would take the download handler down with it.
const seenThisSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

const rememberShown = () => {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* A reader whose storage is blocked sees the panel again next time. */
  }
};

const panel = document.querySelector('[data-playbook-panel]');
const anchors = document.querySelectorAll('a[data-playbook-download]');

// showModal is the only API this depends on. A browser without it gets the
// downloads and no panel, which is the same deal a reader without JavaScript
// gets.
if (panel && typeof panel.showModal === 'function' && anchors.length > 0) {
  const source = panel.querySelector('[data-playbook-source]');

  // A dialog paints its own backdrop, so a click that lands on the element
  // itself rather than on anything inside it is a click outside the panel.
  panel.addEventListener('click', (event) => {
    if (event.target === panel) panel.close();
  });

  for (const anchor of anchors) {
    anchor.addEventListener('click', () => {
      if (seenThisSession()) return;
      // Recorded before the timer rather than after it, so a double click
      // cannot queue two panels.
      rememberShown();

      // Which playbook earned the address, for the `source` field the
      // newsletter form already carries. Both copies of that form post to the
      // same Netlify form, and this is what tells them apart in the export.
      if (source) source.value = `playbook-panel:${anchor.dataset.playbookDownload}`;

      // Let the download actually start -- and let the browser show whatever it
      // shows for one -- before a dialog covers the page. The panel then reads
      // as a consequence of the click instead of something that interrupted it.
      setTimeout(() => {
        if (!panel.open) panel.showModal();
      }, 500);
    });
  }
}
