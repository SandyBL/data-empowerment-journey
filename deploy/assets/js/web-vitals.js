/**
 * Core Web Vitals, measured on real visits.
 *
 * Written against the browser's own PerformanceObserver rather than pulling in
 * Google's web-vitals library: the whole point of the supply-chain work
 * elsewhere in this repository is that every byte the site executes is either
 * ours or pinned and hashed, and a metrics collector is a poor reason to add a
 * fourth-party script to every page.
 *
 * Everything here is defensive. Each observer is feature-detected and wrapped,
 * so a browser that does not support one metric still reports the others, and a
 * browser that supports none reports nothing and breaks nothing. The beacon
 * cannot block navigation: it is sent with sendBeacon, which the browser
 * delivers after the page is gone.
 *
 * Nothing identifying is collected — no address, no user agent, no identifier
 * that joins two page views into a person. See db/schema.ts.
 */

// A quarter of page views is a large enough sample to move a 75th percentile
// within days at this site's traffic, and keeps the write volume — and the
// row count someone eventually has to pay for — to a quarter of what it
// would otherwise be.
const SAMPLE_RATE = 0.25;

// Google's own thresholds, so a rating here can never disagree with what
// Search Console reports for the same visit.
const THRESHOLDS = {
    LCP: [2500, 4000],
    INP: [200, 500],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
};

const rate = (metric, value) => {
    const [good, poor] = THRESHOLDS[metric];
    if (value <= good) return 'good';
    return value <= poor ? 'needs-improvement' : 'poor';
};

const supported = typeof PerformanceObserver === 'function'
    && typeof navigator?.sendBeacon === 'function'
    && Array.isArray(PerformanceObserver.supportedEntryTypes);

if (supported && Math.random() < SAMPLE_RATE) {
    const measurements = new Map();

    const record = (metric, value) => {
        if (!Number.isFinite(value) || value < 0) return;
        measurements.set(metric, value);
    };

    /**
     * Starts an observer only if the browser knows the entry type.
     *
     * Subscribing to an unknown type throws in some browsers and silently does
     * nothing in others, and neither should cost us the metrics that do work.
     */
    const observe = (type, callback, options = {}) => {
        if (!PerformanceObserver.supportedEntryTypes.includes(type)) return;
        try {
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) callback(entry);
            }).observe({ type, buffered: true, ...options });
        } catch {
            // An observer that will not start is simply one metric missing.
        }
    };

    // Time to first byte: how long the server and the network took before the
    // browser had anything at all to work with.
    try {
        const [navigation] = performance.getEntriesByType('navigation');
        if (navigation) record('TTFB', navigation.responseStart);
    } catch {
        // Not available on this browser; the other four still are.
    }

    observe('paint', (entry) => {
        if (entry.name === 'first-contentful-paint') record('FCP', entry.startTime);
    });

    // Largest contentful paint keeps being revised upward as bigger elements
    // arrive, so the last value before the visitor leaves is the real one.
    observe('largest-contentful-paint', (entry) => record('LCP', entry.startTime));

    // Layout shift is scored in session windows: a burst of movement within
    // five seconds is one bad moment, not many, and the worst single burst is
    // what the visitor actually experienced.
    let clsValue = 0;
    let windowValue = 0;
    let windowStart = 0;
    let windowLast = 0;
    observe('layout-shift', (entry) => {
        // A shift the visitor caused by tapping or typing is not a defect.
        if (entry.hadRecentInput) return;
        if (windowValue && entry.startTime - windowLast < 1000 && entry.startTime - windowStart < 5000) {
            windowValue += entry.value;
        } else {
            windowValue = entry.value;
            windowStart = entry.startTime;
        }
        windowLast = entry.startTime;
        if (windowValue > clsValue) {
            clsValue = windowValue;
            record('CLS', Number(clsValue.toFixed(4)));
        }
    });

    // Interaction to next paint: the slowest the page ever felt to touch.
    let inpValue = 0;
    observe('event', (entry) => {
        if (entry.interactionId && entry.duration > inpValue) {
            inpValue = entry.duration;
            record('INP', inpValue);
        }
    }, { durationThreshold: 40 });

    let sent = false;

    const send = () => {
        if (sent || !measurements.size) return;
        sent = true;

        const metrics = [...measurements].map(([metric, value]) => ({
            metric,
            value,
            rating: rate(metric, value),
        }));

        const body = JSON.stringify({
            // Pathname only. A query string can carry anything, including
            // things a visitor typed, and none of it belongs in this table.
            path: window.location.pathname.slice(0, 256),
            locale: document.documentElement.lang?.slice(0, 2).toLowerCase() || null,
            // Derived from the viewport rather than sniffed from the user
            // agent: it is the measurement that matters and it is not a
            // fingerprint.
            formFactor: window.innerWidth < 768 ? 'mobile' : 'desktop',
            metrics,
        });

        try {
            navigator.sendBeacon('/api/vitals', new Blob([body], { type: 'application/json' }));
        } catch {
            // The measurements are gone with the page. Nothing to recover.
        }
    };

    // visibilitychange rather than unload: it is the only signal that fires
    // reliably when a mobile browser is backgrounded and then killed, which is
    // how most mobile sessions actually end. pagehide covers the desktop tab
    // close that visibilitychange occasionally misses.
    addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') send();
    }, { once: false });
    addEventListener('pagehide', send, { once: true });
}
