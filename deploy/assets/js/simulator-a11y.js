/*
 * Keyboard and screen-reader behaviour shared by the simulator pages.
 *
 * Every simulator shows its feedback in an overlay that used to be a styled
 * <div> and nothing more: focus stayed on the answer button underneath it, so a
 * keyboard player who pressed Enter a second time answered the same question
 * twice. This file is the dialog behaviour those overlays were missing, plus the
 * number-key shortcuts the choice screens offer.
 *
 *   SimulatorA11y.openDialog(el, { initialFocus, labelledBy, onEscape })
 *     Marks el as a modal dialog, moves focus into it, keeps Tab inside it and
 *     makes the rest of the page inert while it is open. onEscape, when given,
 *     runs on Escape; without it Escape does nothing, because closing a
 *     feedback modal without pressing Next would leave the run stuck.
 *
 *   SimulatorA11y.closeDialog(el, { returnFocus })
 *     Undoes the above and puts focus on returnFocus (an element, or a function
 *     returning one), else back where it was before the dialog opened.
 *
 *   SimulatorA11y.bindChoiceKeys(handler, { keys, isActive })
 *     Calls handler(index) when one of keys (default "1","2","3") is pressed
 *     while no dialog is open, nothing editable has focus and isActive()
 *     returns true. Letters in keys are matched case-insensitively. Returns a
 *     function that removes the listener.
 *
 *   SimulatorA11y.isDialogOpen()
 *     Whether a dialog opened through this file is currently showing.
 */
(function () {
  "use strict";

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  var stack = [];

  function visible(el) {
    return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }

  function focusables(root) {
    var list = root.querySelectorAll(FOCUSABLE);
    var out = [];
    for (var i = 0; i < list.length; i++) if (visible(list[i])) out.push(list[i]);
    return out;
  }

  /* Siblings of the dialog's ancestors, i.e. everything else on the page. */
  function setBackgroundInert(dialog, on) {
    var node = dialog;
    while (node && node.parentElement && node !== document.body) {
      var parent = node.parentElement;
      for (var i = 0; i < parent.children.length; i++) {
        var sibling = parent.children[i];
        if (sibling === node || sibling.tagName === "SCRIPT" || sibling.tagName === "STYLE") continue;
        if (on) {
          if (!sibling.hasAttribute("inert")) {
            sibling.setAttribute("inert", "");
            sibling.setAttribute("data-sim-a11y-inert", "");
          }
        } else if (sibling.hasAttribute("data-sim-a11y-inert")) {
          sibling.removeAttribute("inert");
          sibling.removeAttribute("data-sim-a11y-inert");
        }
      }
      node = parent;
    }
  }

  function onKeydown(event) {
    var top = stack[stack.length - 1];
    if (!top) return;
    if (event.key === "Escape") {
      if (typeof top.onEscape === "function") {
        event.preventDefault();
        top.onEscape();
      }
      return;
    }
    if (event.key !== "Tab") return;
    var items = focusables(top.el);
    if (!items.length) {
      event.preventDefault();
      top.el.focus();
      return;
    }
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !top.el.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !top.el.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  function openDialog(el, options) {
    if (!el) return;
    options = options || {};
    for (var i = 0; i < stack.length; i++) if (stack[i].el === el) return;

    if (!el.hasAttribute("role")) el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    if (options.labelledBy) el.setAttribute("aria-labelledby", options.labelledBy);
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");

    stack.push({ el: el, previous: document.activeElement, onEscape: options.onEscape || null });
    if (stack.length === 1) document.addEventListener("keydown", onKeydown, true);
    setBackgroundInert(el, true);

    /* After the caller has removed `hidden`, so the target is focusable. */
    var target = options.initialFocus;
    window.requestAnimationFrame(function () {
      var node = typeof target === "function" ? target() : target;
      if (!node || !visible(node)) node = focusables(el)[0] || el;
      try { node.focus({ preventScroll: false }); } catch (e) { node.focus(); }
    });
  }

  function closeDialog(el, options) {
    options = options || {};
    var index = -1;
    for (var i = 0; i < stack.length; i++) if (stack[i].el === el) index = i;
    if (index === -1) return;
    var entry = stack.splice(index, 1)[0];
    setBackgroundInert(el, false);
    /* A dialog still open underneath keeps the page inert. */
    if (stack.length) setBackgroundInert(stack[stack.length - 1].el, true);
    else document.removeEventListener("keydown", onKeydown, true);

    var back = typeof options.returnFocus === "function" ? options.returnFocus() : options.returnFocus;
    if (!back || !visible(back)) back = entry.previous;
    if (back && visible(back) && typeof back.focus === "function") {
      try { back.focus({ preventScroll: true }); } catch (e) { back.focus(); }
    }
  }

  function isDialogOpen() {
    if (stack.length) return true;
    /* The shared welcome overlay manages its own focus. */
    var welcome = document.querySelector("[data-sim-welcome]");
    return !!(welcome && !welcome.hidden && visible(welcome));
  }

  function isEditable(node) {
    if (!node) return false;
    var tag = node.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || node.isContentEditable;
  }

  function bindChoiceKeys(handler, options) {
    options = options || {};
    var keys = (options.keys || ["1", "2", "3"]).map(function (k) { return String(k).toLowerCase(); });
    function listener(event) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (isDialogOpen() || isEditable(document.activeElement)) return;
      if (typeof options.isActive === "function" && !options.isActive()) return;
      var index = keys.indexOf(String(event.key).toLowerCase());
      if (index === -1) return;
      event.preventDefault();
      handler(index);
    }
    document.addEventListener("keydown", listener);
    return function () { document.removeEventListener("keydown", listener); };
  }

  window.SimulatorA11y = {
    openDialog: openDialog,
    closeDialog: closeDialog,
    bindChoiceKeys: bindChoiceKeys,
    isDialogOpen: isDialogOpen,
  };
})();
