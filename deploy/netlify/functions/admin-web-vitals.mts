import { getUser } from "@netlify/identity";
import type { Config } from "@netlify/functions";
import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";

// Reads back what assets/js/web-vitals.js collected, as the only number that
// matters: the 75th percentile. An average hides the slow quarter of visits,
// and the slow quarter is what Google grades.
//
// Gated by Netlify Identity for the same reason as the moderation queue — an
// authorized account is the whole authorization model for this site. Keep in
// step with netlify/functions/admin-confessions.mts.

export default async (request: Request) => {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const requestedDays = Number(new URL(request.url).searchParams.get("days"));
  const days = Number.isFinite(requestedDays) ? Math.min(Math.max(Math.trunc(requestedDays), 1), 90) : 28;

  try {
    // 28 days by default, matching the window Search Console reports on, so the
    // two can be compared without arithmetic.
    const rows = await db.execute(sql`
      select
        metric,
        count(*)::int as samples,
        round(percentile_cont(0.75) within group (order by value)::numeric, 2) as p75,
        round((count(*) filter (where rating = 'good'))::numeric * 100 / count(*), 1) as good_percent
      from web_vitals
      where created_at > now() - make_interval(days => ${days})
      group by metric
      order by metric
    `);

    const worst = await db.execute(sql`
      select
        path,
        count(*)::int as samples,
        round(percentile_cont(0.75) within group (order by value)::numeric, 2) as p75
      from web_vitals
      where metric = 'LCP' and created_at > now() - make_interval(days => ${days})
      group by path
      having count(*) >= 5
      order by p75 desc
      limit 20
    `);

    return Response.json({
      days,
      metrics: rows.rows ?? rows,
      slowestPages: worst.rows ?? worst,
    });
  } catch (error) {
    console.error("Web vitals report failed", error);
    return Response.json({ error: "Unable to build the report" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin/vitals",
  method: ["GET"],
};
