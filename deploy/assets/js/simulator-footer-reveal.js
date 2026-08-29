/*
 * simulator-footer-reveal.js -- keeps the site footer out of the way until the
 * visitor asks to move down the page.
 *
 * Every simulator lays its page out as a full-height flex column: html and body
 * are 100% tall, the game area grows to fill what is left, and the footer nav
 * lands exactly on the bottom edge of the viewport. The effect is a footer that
 * looks fixed and never goes away, spending a strip of a phone screen on
 * cross-language links while someone is halfway through a scenario. Two of the
 * three simulators go further and set overflow:hidden on the body, so on those
 * the footer is not merely at the bottom -- it cannot be scrolled past.
 *
 * So the footer starts collapsed and is revealed, for good, the first time the
 * visitor does something that means "further down". Several things about that
 * are deliberate:
 *
 *  - The collapse is applied from here, not from the markup. Without
 *    JavaScript, or to anything reading the page without running it, the footer
 *    is just a footer. Navigation may only be hidden by the same code that can
 *    be relied on to bring it back.
 *
 *  - The reveal is one-way. A footer that slides in and out as the visitor
 *    moves up and down draws far more attention than the footer is worth, and
 *    it shifts the content under their thumb while they are reading.
 *
 *  - Gestures count, not just scroll position. On a page that is exactly one
 *    viewport tall -- which is the normal state of these simulators, and the
 *    whole reason the footer looked fixed -- no scroll event will ever fire, so
 *    a scroll listener alone would hide the footer permanently. A swipe or a
 *    wheel turn that the page cannot act on still says where the visitor wants
 *    to go, and that is enough.
 *
 *  - Tab reveals it too. display:none takes the footer links out of the tab
 *    order, so a keyboard visitor has no gesture and no focus event to offer.
 *    Any Tab press brings the footer back, which costs a touch visitor nothing
 *    and is the difference between hidden and unreachable.
 */
(function () {
  "use strict";

  /* Roughly a thumb's worth of movement: far enough that an accidental nudge,
   * or a browser restoring a scroll position by a few pixels, is not read as
   * intent; close enough that anyone actually looking for the footer finds it on
   * their first swipe. */
  var REVEAL_AFTER_PX = 120;

  /* How near the end of a scroller counts as "at the bottom". A page can be
   * scrollable by less than REVEAL_AFTER_PX in total, and on one of those the
   * visitor would otherwise reach the end with the footer still hidden. */
  var BOTTOM_SLACK_PX = 48;

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

  function collapseClass(element) {
    return element.tagName === "NAV"
      ? "simulator-locale-nav--collapsed"
      : "simulator-site-footer--collapsed";
  }

  function revealingClass(element) {
    return element.tagName === "NAV"
      ? "simulator-locale-nav--revealing"
      : "simulator-site-footer--revealing";
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

    var revealed = false;
    var gestured = 0;

    function reveal() {
      if (revealed) return;
      revealed = true;

      var i;
      for (i = 0; i < targets.length; i++) {
        targets[i].classList.remove(collapseClass(targets[i]));
        targets[i].classList.add(revealingClass(targets[i]));
      }

      /* Two frames: one for the browser to lay the footer out at opacity 0, one
       * so that dropping the class is a transition rather than a jump. */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          for (var j = 0; j < targets.length; j++) {
            targets[j].classList.remove(revealingClass(targets[j]));
          }
        });
      });

      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("keydown", onKeyDown, true);
    }

    function scrolledEnough(node) {
      if (!node) return false;

      var viewport = isViewportScroller(node);
      var top = viewport
        ? window.pageYOffset || document.documentElement.scrollTop || 0
        : node.scrollTop;

      if (top >= REVEAL_AFTER_PX) return true;

      var height = viewport ? document.documentElement.scrollHeight : node.scrollHeight;
      var visible = viewport ? window.innerHeight : node.clientHeight;

      return top > 0 && top + visible >= height - BOTTOM_SLACK_PX;
    }

    /* Capture phase, so a scroll inside a nested pane counts. The Portuguese
     * day-to-day board scrolls its own columns and never the window. */
    function onScroll(event) {
      if (scrolledEnough(event.target)) reveal();
    }

    function addGesture(distance) {
      if (distance <= 0) return;
      gestured += distance;
      if (gestured >= REVEAL_AFTER_PX) reveal();
    }

    function onWheel(event) {
      addGesture(event.deltaY);
    }

    var touchY = null;

    function onTouchStart(event) {
      touchY = event.touches && event.touches.length ? event.touches[0].clientY : null;
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
      if (REVEAL_KEYS[event.key]) reveal();
    }

    for (var k = 0; k < targets.length; k++) {
      targets[k].classList.add(collapseClass(targets[k]));
    }

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("wheel", onWheel, { capture: true, passive: true });
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: true });
    window.addEventListener("keydown", onKeyDown, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
