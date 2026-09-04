/*
 * simulator-footer-reveal.js -- keeps the site footer out of the way except
 * while the visitor is moving around the page.
 *
 * Every simulator lays its page out as a full-height flex column: html and body
 * are 100% tall, the game area grows to fill what is left, and the footer nav
 * lands exactly on the bottom edge of the viewport. The effect is a footer that
 * looks fixed and never goes away, spending a strip of a phone screen on
 * cross-language links while someone is halfway through a scenario. Two of the
 * three simulators go further and set overflow:hidden on the body, so on those
 * the footer is not merely at the bottom -- it cannot be scrolled past. The
 * ownership simulator scrolls as a document instead, and its footer sticks to
 * the bottom edge once shown, so the behaviour here is the same on all three.
 *
 * So the footer stays collapsed until the visitor does something that means
 * "further down", and goes away again a few seconds after they stop. Several
 * things about that are deliberate:
 *
 *  - The collapse is applied from here, not from the markup. Without
 *    JavaScript, or to anything reading the page without running it, the footer
 *    is just a footer. Navigation may only be hidden by the same code that can
 *    be relied on to bring it back.
 *
 *  - Coming and going is tied to movement, not to time alone. It appears on the
 *    first hint of scrolling and leaves once scrolling has stopped, so the
 *    screen space goes back to the game between moves rather than during them.
 *    Nothing shifts under a thumb that is in the middle of a swipe.
 *
 *  - It will not disappear out from under a hand or a keyboard: while the
 *    pointer is over the footer, or focus is inside it, the countdown keeps
 *    restarting. Somebody who went looking for a language link gets to use it.
 *
 *  - Gestures count, not just scroll position. On a page that is exactly one
 *    viewport tall -- which is the normal state of two of these simulators --
 *    no scroll event will ever fire, so a scroll listener alone would hide the
 *    footer permanently. A swipe or a wheel turn that the page cannot act on
 *    still says where the visitor wants to go, and that is enough.
 *
 *  - Tab reveals it too. display:none takes the footer links out of the tab
 *    order, so a keyboard visitor has no gesture and no focus event to offer.
 *    Any Tab press brings the footer back, which costs a touch visitor nothing
 *    and is the difference between hidden and unreachable.
 */
(function () {
  "use strict";

  /* A scroll needs no threshold at all: any page that has moved off its top
   * edge is a page somebody is moving around in, and that is the moment the
   * footer is wanted. The old distance thresholds existed because the reveal
   * used to be permanent, so showing the footer early meant showing it for the
   * rest of the session; now that it leaves on its own a few seconds later, the
   * cost of being eager is a bottom strip for three seconds. Being reluctant,
   * on the other hand, reads as broken -- a short page, or a single wheel notch
   * on a long one, could move without ever passing the threshold.
   *
   * A gesture still needs a budget, because a wheel turn or a swipe that the
   * page cannot act on has no position to check: about a flick of a finger,
   * which is far enough that a stray nudge is not read as intent. */
  var GESTURE_REVEAL_PX = 48;

  /* How long after the last movement the footer goes away.
   *
   * Three seconds, which is where auto-hiding chrome has settled across mobile
   * browser toolbars and video controls, and it holds up here for two reasons.
   * Below about two seconds it starts closing during the pauses that are part
   * of reading -- a swipe, a glance at the new scenario, another swipe -- so it
   * flickers, and flicker near the bottom edge of the screen pulls the eye away
   * from the game. Above about five seconds it is no longer really auto-hiding:
   * a visitor who scrolls every few seconds while thinking never sees the space
   * come back, which is the whole point of taking it away. Three seconds also
   * comfortably outlasts the momentum of a fling, so the countdown starts when
   * the page actually stops rather than when the finger lifts, and it is long
   * enough to notice a language link and reach for it -- and reaching for it
   * stops the clock anyway. */
  var HIDE_AFTER_IDLE_MS = 3000;

  /* Matches the opacity transition in assets/css/simulator-header.css: the
   * footer fades before it is taken out of the layout, so the page does not
   * jump while it is still visible. */
  var FADE_MS = 220;

  /* On the two simulators where the footer is part of the layout, taking it out
   * again gives its space back to the scroller -- and a visitor who was at the
   * end of that scroller gets their position clamped by the browser, which
   * fires a scroll event that would otherwise read as "show me the footer" and
   * put it straight back. Reveal triggers are ignored for a moment afterwards;
   * by then the visitor has been still for three seconds, so there is nothing
   * of theirs to miss. (The ownership footer is fixed rather than in the flow,
   * so nothing moves there at all.) */
  var HIDE_QUIET_MS = 400;

  /* Keys that mean "further down the page", plus Tab, which is the only signal
   * a keyboard visitor can give while the footer is out of the tab order. */
  var REVEAL_KEYS = {
    Tab: true,
    ArrowDown: true,
    PageDown: true,
    End: true,
    " ": true,
    Spacebar: true
  };

  /* --collapsed is out of the layout, --fading is laid out but transparent.
   * The same pair of classes runs the fade in both directions. */
  function classFor(element, suffix) {
    var base = element.tagName === "NAV" ? "simulator-locale-nav" : "simulator-site-footer";
    return base + suffix;
  }

  function isViewportScroller(node) {
    return node === document || node === document.documentElement || node === document.body;
  }

  function init() {
    var candidates = document.querySelectorAll("footer.simulator-site-footer, nav.simulator-locale-nav");
    var targets = [];

    for (var i = 0; i < candidates.length; i++) {
      /* The locale nav normally sits inside the site footer, and collapsing both
       * would be harmless but pointless. On one page the nav is a sibling of the
       * footer rather than a child, which is why both selectors are needed. */
      var enclosing = candidates[i].closest("footer.simulator-site-footer");
      if (!enclosing || enclosing === candidates[i]) targets.push(candidates[i]);
    }

    if (!targets.length) return;

    var shown = false;
    var gestured = 0;
    var hideTimer = null;
    var fadeTimer = null;
    var quietUntil = 0;
    var pointerInside = false;

    function mark(suffix, method) {
      for (var i = 0; i < targets.length; i++) {
        targets[i].classList[method](classFor(targets[i], suffix));
      }
    }

    function quiet() {
      return Date.now() < quietUntil;
    }

    /* Not while the welcome dialog is up. Scrolling inside the dialog is the
     * visitor reading it rather than asking for the page's footer, and the
     * footer is behind a backdrop anyway -- revealing it there would buy
     * nothing except a shift of the page as the run starts. */
    function overlayOpen() {
      return document.documentElement.classList.contains("sim-welcome-open");
    }

    /* Two reasons not to take the footer away on schedule: the pointer moved
     * onto it, or the keyboard is in it. Either way somebody is about to use a
     * link, and the countdown simply starts over.
     *
     * Deliberately mouseenter and not a :hover test. A cursor that was already
     * parked wherever the footer appears -- the bottom strip of the screen,
     * which on these pages is over the game -- never moved onto anything and is
     * not reaching for a link, and a :hover test would have held the footer
     * open for as long as that cursor sat still. Browsers fire mouseenter when
     * the pointer moves in, which is the signal that was actually wanted. */
    function inUse() {
      if (pointerInside) return true;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].contains(document.activeElement)) return true;
      }
      return false;
    }

    function armHide() {
      if (!shown) return;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        if (inUse()) {
          armHide();
          return;
        }
        hide();
      }, HIDE_AFTER_IDLE_MS);
    }

    function reveal() {
      if (shown) return;
      shown = true;
      gestured = 0;
      clearTimeout(fadeTimer);

      mark("--collapsed", "remove");
      mark("--fading", "add");

      /* Two frames: one for the browser to lay the footer out at opacity 0, one
       * so that dropping the class is a transition rather than a jump. */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          mark("--fading", "remove");
        });
      });

      armHide();
    }

    function hide() {
      if (!shown) return;
      shown = false;
      gestured = 0;
      pointerInside = false;
      clearTimeout(hideTimer);

      mark("--fading", "add");
      fadeTimer = setTimeout(function () {
        quietUntil = Date.now() + HIDE_QUIET_MS;
        mark("--collapsed", "add");
        mark("--fading", "remove");
      }, FADE_MS);
    }

    /* Off the top edge, by any amount. The one position worth ignoring is zero:
     * a page sitting at its top has either not been scrolled or has been sent
     * back there by the simulator itself -- every run starts with a scroll to
     * the top -- and neither is somebody asking for the footer. */
    function scrolledOffTheTop(node) {
      if (!node) return false;

      var top = isViewportScroller(node)
        ? window.pageYOffset || document.documentElement.scrollTop || 0
        : node.scrollTop;

      return top > 0;
    }

    /* Capture phase, so a scroll inside a nested pane counts. The Portuguese
     * day-to-day board scrolls its own columns and never the window. */
    function onScroll(event) {
      if (shown) {
        armHide();
        return;
      }
      if (quiet() || overlayOpen()) return;
      if (scrolledOffTheTop(event.target)) reveal();
    }

    function addGesture(distance) {
      if (shown) {
        /* Direction does not matter once the footer is up: any wheel turn or
         * swipe is the visitor still moving, and the countdown waits. */
        armHide();
        return;
      }
      if (distance <= 0 || quiet() || overlayOpen()) return;
      gestured += distance;
      if (gestured >= GESTURE_REVEAL_PX) reveal();
    }

    function onWheel(event) {
      addGesture(event.deltaY);
    }

    var touchY = null;

    function onTouchStart(event) {
      touchY = event.touches && event.touches.length ? event.touches[0].clientY : null;
      if (shown) armHide();
    }

    function onTouchMove(event) {
      if (touchY === null || !event.touches || !event.touches.length) return;
      var y = event.touches[0].clientY;
      /* Finger moving up the screen pulls the page down, which is the direction
       * that means "show me what is below". */
      addGesture(touchY - y);
      touchY = y;
    }

    function onKeyDown(event) {
      if (!REVEAL_KEYS[event.key]) return;
      if (shown) {
        armHide();
        return;
      }
      if (quiet() || overlayOpen()) return;
      reveal();
    }

    /* Leaving the footer with the pointer or the keyboard restarts the
     * countdown, so a footer that was held open does not sit there for good. */
    function onRelease() {
      pointerInside = false;
      if (shown) armHide();
    }

    function onEnter() {
      pointerInside = true;
    }

    mark("--collapsed", "add");

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("wheel", onWheel, { capture: true, passive: true });
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: true });
    window.addEventListener("keydown", onKeyDown, true);

    for (var k = 0; k < targets.length; k++) {
      targets[k].addEventListener("mouseenter", onEnter);
      targets[k].addEventListener("mouseleave", onRelease);
      targets[k].addEventListener("focusout", onRelease);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
