/**
 * Language switching that keeps the visitor where they were.
 *
 * Every language on this site has its own URL, so switching language is an
 * ordinary navigation to another document: the browser loads it at the top.
 * On a homepage that is nine sections long, or halfway down an article, that
 * means the switch throws away the visitor's place and asks them to find it
 * again — which is the one thing a language switcher should never cost.
 *
 * This restores the place. It stores where the visitor was reading just before
 * the switch, and re-applies it once the destination has loaded:
 *
 *   1. By anchor, when the reader was inside a section whose id exists on the
 *      destination too. The homepage, the confession wall and the simulators
 *      are built from one template per language, so their section ids are
 *      identical across all three and this is exact.
 *   2. By proportion of the document otherwise. An article's heading ids are
 *      slugs of translated text ("#start-with-decisions" has no Spanish twin),
 *      so there is nothing to anchor to; translations of the same piece are
 *      close enough in length that the same fraction of the way down lands the
 *      reader in the same passage.
 *
 * It also records the language the visitor picked. An explicit choice is the
 * strongest signal there is about which language somebody wants, and it is the
 * signal netlify/edge-functions/language-negotiation.ts checks first — before
 * it falls back to guessing from Accept-Language — so a visitor who has ever
 * chosen a language is never sent anywhere else again.
 *
 * The position is kept in sessionStorage rather than in the URL: a "#framework"
 * appended to the destination would do the same job, but it would also rewrite
 * a shareable address and leave the fragment behind in every link the visitor
 * later copies. Nothing here is required for the switch to work — the anchors
 * are plain links, and a browser with storage disabled simply lands at the top,
 * as it does today.
 *
 * Loaded as a module, like identity.js and confession-wall.js: this file goes on
 * every layout the site has, including nine simulator pages carrying a thousand
 * lines of inline script each, and a classic script's top-level names share one
 * scope with all of them. A module keeps its own.
 */

const LANGUAGES = ['en', 'es', 'pt'];

const POSITION_KEY = 'languageSwitchPosition';
const PREFERENCE_KEY = 'preferredLanguage';

/*
 * A stored position belongs to one navigation. Without an expiry, a switch that
 * the visitor abandoned — they clicked, changed their mind, went somewhere else
 * — would sit in sessionStorage and hijack the next arrival at that same path,
 * however much later it came.
 */
const POSITION_MAX_AGE_MS = 60_000;

/*
 * Every page here has a sticky header roughly this tall, so this is the line
 * where the visible page actually starts. It decides which section counts as
 * "the one being read"; it is not used for positioning, because the sections
 * carry their own scroll-margin-top and scrollIntoView honours it.
 */
const READING_LINE_PX = 88;

/*
 * Below this the visitor is still at the top of the page and there is nothing
 * to preserve — restoring would only fight the natural arrival position.
 */
const MIN_SCROLL_PX = 160;

/** The language switcher in each of the four page layouts this site ships. */
const SWITCHER_LINKS = [
  '.language-switcher a[href]', // homepage
  '.language-nav a[href]', // blog index, category hubs, articles
  '.wall-language-nav a[href]', // confession wall
  '.simulator-locale-nav-languages a[href]', // simulators
].join(', ');

/*
 * Elements a position can be pinned to. Deliberately structural: a section, a
 * heading or a landmark is something a translation also has, whereas a form
 * field or a button is not somewhere anybody is reading.
 */
const ANCHOR_SELECTOR = 'main[id], section[id], article[id], aside[id], nav[id], footer[id], h1[id], h2[id], h3[id], div[id]';

const readSession = (key) => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeSession = (key, value) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* Private windows and blocked storage: the switch still works, unrestored. */
  }
};

const clearSession = (key) => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* As above. */
  }
};

/** Trailing slashes vary between the link and the address it resolves to. */
const normalizePath = (pathname) => (pathname.endsWith('/') ? pathname : `${pathname}/`);

/**
 * Which language a switcher link points at.
 *
 * hreflang is the authoritative answer and most of these links carry it. The
 * path is the fallback, and has to cope with both shapes this site uses:
 * "/en/blog/" and "/simulators/en/data-literacy/", plus Spanish at the root.
 */
const languageOf = (link) => {
  const declared = link.getAttribute('hreflang')?.toLowerCase().split('-')[0];
  if (LANGUAGES.includes(declared)) return declared;

  const segments = new URL(link.href, window.location.href).pathname.split('/').filter(Boolean);
  if (!segments.length) return 'es';
  if (LANGUAGES.includes(segments[0])) return segments[0];
  if (segments[0] === 'simulators' && LANGUAGES.includes(segments[1])) return segments[1];
  return null;
};

/** The last structural element that starts at or above the reading line. */
const currentAnchorId = () => {
  let anchor = '';
  for (const element of document.querySelectorAll(ANCHOR_SELECTOR)) {
    // offsetParent is null for anything display:none — the mobile drawer, the
    // sign-in modal — which is on the page but not where anyone is reading.
    if (!element.id || element.offsetParent === null) continue;
    const box = element.getBoundingClientRect();
    if (box.height > 0 && box.top <= READING_LINE_PX) anchor = element.id;
  }
  return anchor;
};

const scrollableHeight = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

/**
 * Records where the visitor is, keyed by where they are going.
 *
 * Runs on the click rather than on unload: pagehide fires too late to read
 * layout reliably, and a click is the only moment we know a language switch is
 * what is happening.
 */
const rememberPosition = (link) => {
  const scrolled = window.scrollY || document.documentElement.scrollTop || 0;
  if (scrolled < MIN_SCROLL_PX) {
    clearSession(POSITION_KEY);
    return;
  }

  const height = scrollableHeight();
  writeSession(
    POSITION_KEY,
    JSON.stringify({
      to: normalizePath(new URL(link.href, window.location.href).pathname),
      anchor: currentAnchorId(),
      ratio: height > 0 ? Math.min(1, scrolled / height) : 0,
      at: Date.now(),
    }),
  );
};

/**
 * Persists the choice for the edge function that routes "/".
 *
 * The cookie is what the server reads; the localStorage copy is what
 * thank-you.html reads to decide which language to confirm the form in. A year
 * is long enough that a returning visitor never has to choose twice, and Lax
 * keeps the cookie off cross-site requests, which have no business asking about
 * somebody's reading language.
 */
const rememberChoice = (language) => {
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${PREFERENCE_KEY}=${language}; path=/; max-age=31536000; samesite=lax${secure}`;
  try {
    window.localStorage.setItem(PREFERENCE_KEY, language);
  } catch {
    /* The cookie above is the one that matters; this copy is a convenience. */
  }
};

/**
 * Re-applies a stored position, if this page is the one it was stored for.
 *
 * Returns the scroll offset it settled on, or null when it did nothing, so the
 * caller can tell a second, post-layout attempt from a page it should leave
 * alone.
 */
const applyPosition = (position) => {
  const anchored = position.anchor && document.getElementById(position.anchor);
  if (anchored) {
    // scrollIntoView, not a computed offset: the sections carry scroll-mt-20
    // and article headings carry scroll-margin-top, so the browser already
    // knows how far to clear the sticky header.
    anchored.scrollIntoView({ behavior: 'instant', block: 'start' });
    return Math.round(window.scrollY);
  }

  const height = scrollableHeight();
  if (!position.ratio || height <= 0) return null;
  const target = Math.round(position.ratio * height);
  window.scrollTo({ top: target, behavior: 'instant' });
  return Math.round(window.scrollY);
};

const restorePosition = () => {
  // An address that names its own destination wins: someone arriving at
  // "/en/#scorecard" asked for that section, whatever we stored.
  if (window.location.hash) {
    clearSession(POSITION_KEY);
    return;
  }

  const stored = readSession(POSITION_KEY);
  if (!stored) return;
  clearSession(POSITION_KEY);

  let position;
  try {
    position = JSON.parse(stored);
  } catch {
    return;
  }
  if (!position || typeof position !== 'object') return;
  if (position.to !== normalizePath(window.location.pathname)) return;
  if (!Number.isFinite(position.at) || Date.now() - position.at > POSITION_MAX_AGE_MS) return;

  const settled = applyPosition(position);
  if (settled === null) return;

  // Images and webfonts finish after this script runs and move everything below
  // them, so the offset that was right a moment ago is not right any more. The
  // second pass only happens if the visitor has not scrolled since — their own
  // scrolling outranks anything we restored.
  window.addEventListener(
    'load',
    () => {
      if (Math.abs(window.scrollY - settled) > 4) return;
      applyPosition(position);
    },
    { once: true },
  );
};

const listenForSwitches = () => {
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest?.(SWITCHER_LINKS);
      if (!link) return;

      const language = languageOf(link);
      if (language) rememberChoice(language);
      rememberPosition(link);
    },
    // Capture, so the record is written even if something downstream stops the
    // event; passive, so it can never delay the navigation it observes.
    { capture: true, passive: true },
  );
};

listenForSwitches();
restorePosition();
