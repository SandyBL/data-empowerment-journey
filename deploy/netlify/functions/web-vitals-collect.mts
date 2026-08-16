import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { webVitals } from "../../db/schema.js";

// Collects one Core Web Vitals measurement from a real visit.
//
// Lab scores answer "how fast is this page on my laptop". Search Console ranks
// on the 75th percentile of what actual visitors got, which is a different
// number and the only one that moves rankings — but it arrives weeks late and
// only for pages with enough traffic to clear Google's reporting threshold.
// This endpoint fills that gap for a site whose long tail of article pages will
// never reach it.
//
// Nothing identifying is stored. See db/schema.ts for what the row contains and
// assets/js/web-vitals.js for what the browser sends.

const METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);
const RATINGS = new Set(["good", "needs-improvement", "poor"]);
const FORM_FACTORS = new Set(["mobile", "desktop"]);
const LOCALES = new Set(["en", "es", "pt"]);

export default async (request: Request) => {
  try {
    const payload = await request.json();
    const samples = Array.isArray(payload?.metrics) ? payload.metrics.slice(0, 10) : [];
    const path = typeof payload?.path === "string" ? payload.path.slice(0, 256) : "";
    const locale = typeof payload?.locale === "string" ? payload.locale.toLowerCase() : "";
    const formFactor = typeof payload?.formFactor === "string" ? payload.formFactor : "";

    if (!samples.length || !path.startsWith("/")) {
      return new Response(null, { status: 400 });
    }

    const rows = [];
    for (const sample of samples) {
      const metric = typeof sample?.metric === "string" ? sample.metric : "";
      const rating = typeof sample?.rating === "string" ? sample.rating : "";
      const value = Number(sample?.value);

      // Skipped rather than clamped: a value outside these bounds is a broken
      // client or a forged beacon, and either way averaging it in would poison
      // the percentile this endpoint exists to produce.
      if (!METRICS.has(metric) || !RATINGS.has(rating) || !Number.isFinite(value) || value < 0 || value > 600000) {
        continue;
      }

      rows.push({
        metric,
        value,
        rating,
        path,
        locale: LOCALES.has(locale) ? locale : null,
        formFactor: FORM_FACTORS.has(formFactor) ? formFactor : null,
      });
    }

    if (!rows.length) {
      return new Response(null, { status: 400 });
    }

    await db.insert(webVitals).values(rows);

    // 204: the browser sends this with sendBeacon as the page goes away and has
    // nowhere to put a response body.
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Web vitals collection failed", error);
    return new Response(null, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/vitals",
  method: ["POST"],
  // One page view produces one request carrying every metric it measured, so
  // twenty a minute is a visitor moving quickly through the site and anything
  // beyond it is not a visitor.
  rateLimit: {
    windowSize: 60,
    windowLimit: 20,
    aggregateBy: "ip",
  },
};
