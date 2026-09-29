/**
 * Google Ads tag for the course page.
 *
 * Loaded only by /pt/curso-governanca-de-dados/, next to gtag.js, and
 * configured from the data-* attributes scripts/lib/course.mjs writes on this
 * tag, so the account, the checkout host and the price live in one place.
 *
 * The purchase conversion is not fired here. The payment happens on Hotmart's
 * checkout, and Hotmart's Google Ads pixel reports the sale once it is
 * approved. This file does the two things only the site can do:
 *
 *  - the linker decorates links to the checkout host with the ad click, so the
 *    conversion Hotmart fires is credited to the ad that brought the visitor;
 *  - a click on a checkout button is sent as `begin_checkout`, which can be
 *    imported into Google Ads as a secondary conversion to see where the funnel
 *    leaks between the page and the payment.
 *
 * A classic script rather than a module, so it runs before gtag.js arrives and
 * the commands queue in dataLayer in order.
 */
(() => {
    const tag = document.currentScript;
    if (!tag) return;

    const { adsId, checkoutHost, value, currency } = tag.dataset;
    if (!adsId || !checkoutHost) return;

    window.dataLayer = window.dataLayer || [];
    // gtag.js reads the arguments object itself, not an array, so this has to
    // stay a plain function that pushes `arguments`.
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', adsId, {
        linker: { domains: [checkoutHost] },
    });

    // Delegated, so it covers all three buttons on the page and any added later.
    // The checkout opens in a new tab, so this page stays alive long enough for
    // the hit to go out; beacon transport covers the browsers that open it in
    // the same tab anyway.
    document.addEventListener('click', (event) => {
        const link = event.target.closest && event.target.closest('a[href]');
        if (!link) return;
        let host;
        try {
            host = new URL(link.href).host;
        } catch {
            return;
        }
        if (host !== checkoutHost) return;
        gtag('event', 'begin_checkout', {
            send_to: adsId,
            value: Number(value) || undefined,
            currency: currency || undefined,
            transport_type: 'beacon',
        });
    });
})();
