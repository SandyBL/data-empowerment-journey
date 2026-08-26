/**
 * Chooses the language for a visitor arriving at the bare domain.
 *
 * This site publishes three languages at three addresses — "/" in Spanish,
 * "/en/" and "/pt/" — and until now the bare domain always answered in Spanish,
 * whoever asked. Someone typing datagovjourney.com from an English or
 * Portuguese browser landed on a page they could not read and had to find a flag
 * in the header to fix it, even if they had already chosen their language on a
 * previous visit.
 *
 * "/" is the only address this runs on, and that is deliberate. It is the
 * language-neutral entry point: nobody types it meaning "the Spanish one". Every
 * other URL on the site states its language in the path, so a visitor who
 * followed a link to "/en/blog/" or came in from a search result asked for that
 * language specifically, and redirecting them somewhere else would be overriding
 * an explicit request with a guess — the failure mode Google's localised-page
 * guidance warns about, and the reason automatic redirects have such a bad name.
 *
 * The order of preference, strongest signal first:
 *
 *   1. The preferredLanguage cookie — a language the visitor picked from the
 *      switcher themselves (see assets/js/language-switch.js). An explicit
 *      choice always beats an inferred one, and it is what makes the choice
 *      stick on the next visit.
 *   2. Accept-Language, honouring q-values, matched on the primary subtag so
 *      pt-BR and pt-PT both find Portuguese.
 *   3. Spanish, which is where "/" already goes.
 *
 * Crawlers are exempt. "/" is the canonical Spanish homepage — its own
 * canonical tag and the hreflang cluster in scripts/lib/home-pages.mjs say so —
 * and a bot redirected off it would index the Spanish page nowhere. Search
 * engines reach every language through hreflang, which is the mechanism built
 * for this, so they get the page as published while people get their language.
 */

import type { Config, Context } from '@netlify/edge-functions';

const LANGUAGES = ['en', 'es', 'pt'];

/** Where each language's homepage lives. Spanish keeps the root. */
const HOME_PATH: Record<string, string> = { en: '/en/', es: '/', pt: '/pt/' };

/*
 * Spanish is the fallback rather than a fourth option: "/" already serves it, so
 * choosing it means doing nothing at all.
 */
const DEFAULT_LANGUAGE = 'es';

const PREFERENCE_COOKIE = 'preferredLanguage';

/*
 * Search engines, AI assistants and link unfurlers. This list is for deciding
 * who not to redirect, not for access control, so a user agent it misses only
 * means that client is treated as a person — the safe direction to be wrong in.
 */
const CRAWLER = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|pinterest|whatsapp|telegram|skypeuripreview|applebot|duckduckbot|yandex|baiduspider|ia_archiver|lighthouse|headlesschrome|gptbot|claudebot|perplexity|anthropic-ai|ccbot|google-inspectiontool|googleother/i;

const normalize = (value: string | undefined | null) => {
  const language = value?.trim().toLowerCase().split('-')[0];
  return language && LANGUAGES.includes(language) ? language : null;
};

/**
 * The best-matching language in an Accept-Language header, or null when the
 * header expresses no preference this site can serve.
 *
 * Quality values are what make this a negotiation rather than a guess at the
 * first tag: a browser configured for French first and English second sends
 * "fr,en;q=0.8", and the answer has to be English rather than the default.
 */
const negotiate = (header: string | null) => {
  if (!header) return null;

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...parameters] = part.trim().split(';');
      const quality = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith('q='));
      const weight = quality ? Number.parseFloat(quality.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), weight: Number.isFinite(weight) ? weight : 0 };
    })
    // q=0 means "explicitly not this one".
    .filter((entry) => entry.tag && entry.weight > 0)
    // Array.prototype.sort is stable, so tags of equal quality keep the order
    // the visitor listed them in — which is the order they meant.
    .sort((first, second) => second.weight - first.weight);

  for (const { tag } of ranked) {
    // "*" accepts anything, so it is the end of the preferences, not a match.
    if (tag === '*') return null;
    const language = normalize(tag);
    if (language) return language;
  }
  return null;
};

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  // The legacy "?lang=" homepage addresses are 301'd to their own pages by the
  // redirect engine (see scripts/generate-blog-index.mjs). Returning a response
  // here would suppress those rules, so this hands the request straight back.
  if (url.searchParams.has('lang')) return;

  // Sec-Fetch-Mode is absent on older clients, so its absence cannot disqualify
  // a request; when it is present, anything other than a navigation is a fetch,
  // a prefetch or a subresource, and moving those would break the caller.
  const fetchMode = request.headers.get('sec-fetch-mode');
  if (fetchMode && fetchMode !== 'navigate') return;

  const accepts = request.headers.get('accept') ?? '';
  if (accepts && !accepts.includes('text/html') && !accepts.includes('*/*')) return;

  if (CRAWLER.test(request.headers.get('user-agent') ?? '')) return;

  const language =
    normalize(context.cookies.get(PREFERENCE_COOKIE)) ??
    negotiate(request.headers.get('accept-language')) ??
    DEFAULT_LANGUAGE;

  // Spanish is already what "/" serves. Passing through is both the cheapest
  // answer and the one that keeps the redirect engine and the static file in
  // play, rather than reproducing them here.
  if (language === DEFAULT_LANGUAGE) return;

  return new Response(null, {
    status: 302,
    headers: {
      Location: HOME_PATH[language] + url.search,
      // 302 and no-store together: the decision belongs to this visitor and
      // this request. A cached 301 would pin one language onto a shared browser,
      // a proxy or a household, and outlive the preference that produced it.
      'Cache-Control': 'no-store',
      Vary: 'Accept-Language, Cookie',
    },
  });
};

/*
 * GET only. Netlify's manifest schema accepts GET, POST, PUT, PATCH, DELETE and
 * OPTIONS — HEAD is not one of them, and declaring it fails the deploy at
 * bundling time rather than at runtime. Nothing is lost by leaving it out: a
 * HEAD request is never a person navigating to the homepage, so the pass-through
 * checks above would have declined to redirect it anyway.
 */
export const config: Config = {
  path: '/',
  method: 'GET',
};
