/**
 * The site navigation: four dropdown groups on the desktop bar, the same four
 * as accordions in the mobile drawer.
 *
 * Ported from the homepage's inline initializeNavigationMenus(), which was the
 * only working navigation on the site, and generalised from one "Resources"
 * dropdown to however many groups scripts/lib/site-nav.mjs renders. Every page
 * family loads this file, so the homepage no longer carries its own copy.
 *
 * Nothing here is decorative. The panels are visibility:hidden when closed, and
 * the drawer covers the page, so the class, the aria-expanded attribute, the
 * inert state of the rest of the document and the focus position all have to
 * move together -- which is exactly what the CSS-only version could not do.
 *
 * Labels come off data attributes rather than being written here, because the
 * page is one of three languages and this file is served to all of them.
 */

const DESKTOP_QUERY = '(min-width: 1180px)';

/*
 * Two headers render this navigation. Every generated page has `.site-header`,
 * whose bar appears at 1180px and whose drawer is the small-screen half of it.
 * The nine simulator pages have `.simulator-site-header` -- their own row of
 * brand, title and app controls -- and carry the drawer alone, at every width,
 * because there is no room in that row for a bar and no page to fall back on:
 * before this, a simulator opened from a search result had one home icon and
 * nothing else pointing anywhere.
 */
const initialiseSiteNav = () => {
  const header = document.querySelector('.site-header, .simulator-site-header');
  if (!header) return;

  const drawer = header.querySelector('.site-drawer');
  const toggle = header.querySelector('.site-nav__toggle');

  /* Everything the drawer covers, so it can be hidden from assistive
     technology and not merely from view. The header itself stays reachable. */
  const backgroundRegions = [...document.body.children].filter((element) => element !== header);

  /* ---------------------------------------------------------- desktop bar -- */

  const menus = [...header.querySelectorAll('.site-nav__menu')];

  const setMenu = (menu, isOpen) => {
    menu.classList.toggle('is-open', isOpen);
    menu.querySelector('.site-nav__trigger')?.setAttribute('aria-expanded', String(isOpen));
  };

  const closeAllMenus = (except) => {
    menus.forEach((menu) => {
      if (menu !== except) setMenu(menu, false);
    });
  };

  // Pointer users get hover-to-open, but only where the bar is rendered and
  // only on devices that genuinely hover -- a touch device reports a hover on
  // first tap, which would open a panel the visitor is trying to scroll past.
  const hoverCapable = window.matchMedia(`(hover: hover) and ${DESKTOP_QUERY}`);

  menus.forEach((menu) => {
    const trigger = menu.querySelector('.site-nav__trigger');

    trigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = menu.classList.contains('is-open');
      closeAllMenus(menu);
      setMenu(menu, !isOpen);
    });

    menu.addEventListener('mouseenter', () => {
      if (!hoverCapable.matches) return;
      closeAllMenus(menu);
      setMenu(menu, true);
    });

    menu.addEventListener('mouseleave', () => {
      if (hoverCapable.matches) setMenu(menu, false);
    });

    // The panel is visibility:hidden when closed, so its links are not
    // tabbable until focus reaching the trigger opens it.
    menu.addEventListener('focusin', () => {
      closeAllMenus(menu);
      setMenu(menu, true);
    });

    menu.addEventListener('focusout', (event) => {
      if (!menu.contains(event.relatedTarget)) setMenu(menu, false);
    });
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) closeAllMenus(null);
  });

  /* --------------------------------------------------------------- drawer -- */

  const focusableInDrawer = () =>
    [...(drawer?.querySelectorAll('a[href], button:not([disabled])') ?? [])].filter(
      (element) => element.offsetParent !== null
    );

  const setDrawer = (isOpen) => {
    if (!drawer || !toggle) return;
    drawer.hidden = !isOpen;
    toggle.setAttribute('aria-expanded', String(isOpen));
    const label = isOpen ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    if (label) toggle.setAttribute('aria-label', label);
    const icon = toggle.querySelector('i');
    icon?.classList.toggle('fa-bars', !isOpen);
    icon?.classList.toggle('fa-xmark', isOpen);
    document.body.classList.toggle('site-drawer-open', isOpen);

    backgroundRegions.forEach((region) => {
      region.inert = isOpen;
    });

    if (isOpen) {
      focusableInDrawer()[0]?.focus();
      return;
    }
    // Only reclaim focus if it is still inside the drawer that just closed;
    // following a link should let the destination keep it.
    if (drawer.contains(document.activeElement)) toggle.focus();
  };

  const closeDrawer = () => setDrawer(false);

  toggle?.addEventListener('click', () => setDrawer(Boolean(drawer?.hidden)));

  // Clicking the scrim, which is the drawer element itself behind its panel.
  drawer?.addEventListener('click', (event) => {
    if (event.target === drawer) closeDrawer();
  });

  // Accordions inside the drawer. Independent of each other: on a phone the
  // whole panel scrolls, so closing one group to open another only costs the
  // visitor the group they were reading.
  drawer?.querySelectorAll('.site-drawer__trigger').forEach((trigger) => {
    const links = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!links) return;
    trigger.addEventListener('click', () => {
      const isOpen = links.hidden;
      links.hidden = !isOpen;
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
  });

  header.querySelectorAll('.site-nav__dropdown a, .site-drawer a').forEach((link) => {
    link.addEventListener('click', () => {
      closeAllMenus(null);
      closeDrawer();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllMenus(null);
      closeDrawer();
      return;
    }

    // Keep Tab inside the open drawer: it covers the page, so tabbing out of it
    // would land on content the visitor cannot see.
    if (event.key !== 'Tab' || !drawer || drawer.hidden) return;
    const focusable = focusableInDrawer();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Growing past the breakpoint hides the toggle, which would otherwise leave
  // the drawer open with no control to close it and the page inert behind it.
  // Only where the toggle actually goes away, though: on a simulator page it
  // stays at every width, and closing the drawer there would be closing the
  // only navigation the page has because the window got wider.
  window.matchMedia(DESKTOP_QUERY).addEventListener('change', (event) => {
    if (event.matches && toggle && toggle.offsetParent === null) closeDrawer();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiseSiteNav, { once: true });
} else {
  initialiseSiteNav();
}
