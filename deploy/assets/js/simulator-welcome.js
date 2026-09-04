/*
 * The shared welcome overlay for the simulator pages.
 *
 * The three simulators opened three different ways. "Who Owns This?" asked for
 * a name up front and refused to start without one. The Portuguese Day-to-Day
 * page showed a briefing screen with a Start button. The other five dropped the
 * visitor straight into a live dashboard, mid-scenario, and only asked who they
 * were at the very end, next to the leaderboard -- so the same product greeted
 * people in three different ways depending on which card they clicked and which
 * language they read.
 *
 * This gives the five pages that had no welcome the same opening as the four
 * that did: what the simulator is, what it measures, and a name field, over the
 * app rather than replacing it. Behaviour only -- the wording lives in each
 * page's markup so that it stays translated and stays visible to
 * scripts/extract-simulator-text.mjs.
 *
 * Markup contract:
 *
 *   <div class="sim-welcome" data-sim-welcome data-sim-welcome-target="#playerNameInput" hidden>
 *     <div class="sim-welcome__dialog" role="dialog" aria-modal="true" aria-labelledby="...">
 *       ...
 *       <input id="sim-welcome-name" class="sim-input">
 *       <button data-sim-welcome-start>...</button>
 *       <button data-sim-welcome-skip>...</button>
 *     </div>
 *   </div>
 *
 * The name is copied into the page's own leaderboard input rather than held
 * here, because every page already reads its score submission from that field
 * and nothing else needed to change. A page whose only name field is the one in
 * this dialog -- "Who Owns This?", which asks for a name nowhere else -- gives
 * that field the id its own script reads and marks it data-sim-welcome-name
 * instead, and leaves data-sim-welcome-target off: there is nothing to copy to.
 *
 * Dismissing the dialog, by any route, fires a `sim-welcome:dismissed` event on
 * document, and window.SimulatorWelcome exposes show() and dismiss(). Pages
 * that hold their first screen back until the dialog closes, or that reopen it
 * to start a second run, need both; the others can ignore them.
 */
(function () {
  'use strict';

  var overlay = document.querySelector('[data-sim-welcome]');
  if (!overlay) return;

  var dialog = overlay.querySelector('.sim-welcome__dialog');
  var nameInput = overlay.querySelector('#sim-welcome-name, [data-sim-welcome-name]');
  var startBtn = overlay.querySelector('[data-sim-welcome-start]');
  var skipBtn = overlay.querySelector('[data-sim-welcome-skip]');
  var targetSelector = overlay.getAttribute('data-sim-welcome-target');
  var lastFocus = null;

  /* A private space has the visitor's name already and the chrome-hiding rules
     strip the field, so there is nothing to ask for. */
  function nameFieldIsHidden() {
    if (!nameInput) return true;
    return !nameInput.offsetParent;
  }

  function dismiss() {
    if (overlay.hidden) return;
    if (nameInput && targetSelector) {
      var target = document.querySelector(targetSelector);
      var value = nameInput.value.trim();
      if (target && value && !target.value.trim()) {
        target.value = value;
      }
    }
    overlay.hidden = true;
    document.documentElement.classList.remove('sim-welcome-open');
    /* preventScroll on the way out as well as on the way in. Focusing an element
       taller than the viewport whose top edge is below the top of the page --
       which is what the main region is on a page with a header above it -- makes
       the browser align that top edge with the top of the viewport, so the page
       opened a header and a breadcrumb further down than the visitor left it.
       Focus is still moved; only the jump is dropped. */
    var main = document.getElementById('simulator-main') || document.getElementById('main-container');
    if (main && typeof main.focus === 'function') {
      main.focus({ preventScroll: true });
    } else if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
    }
    document.dispatchEvent(new CustomEvent('sim-welcome:dismissed'));
  }

  function show() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.classList.add('sim-welcome-open');
    /* preventScroll, because the dialog is fixed to the viewport and there is
       nothing to scroll to. A page that ever gets the overlay's positioning
       wrong would otherwise have the focus drag the document to wherever the
       dialog landed, which is how this last went wrong: the overlay laid itself
       out after the footer and focusing the name field jumped the visitor to
       the bottom of the page. */
    if (!nameFieldIsHidden()) {
      nameInput.focus({ preventScroll: true });
    } else if (startBtn) {
      startBtn.focus({ preventScroll: true });
    }
  }

  if (startBtn) startBtn.addEventListener('click', dismiss);
  if (skipBtn) skipBtn.addEventListener('click', dismiss);

  /* Enter in the name field starts, rather than submitting nothing. */
  if (nameInput) {
    nameInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        dismiss();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !overlay.hidden) dismiss();
  });

  /* Clicking the backdrop dismisses; clicking inside the dialog does not. */
  overlay.addEventListener('click', function (event) {
    if (dialog && !dialog.contains(event.target)) dismiss();
  });

  /* Keep focus inside the dialog while it is open. */
  overlay.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab' || !dialog) return;
    var focusable = dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.SimulatorWelcome = { show: show, dismiss: dismiss };

  show();
})();
