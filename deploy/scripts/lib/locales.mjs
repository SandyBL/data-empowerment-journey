/**
 * How each language is named to a machine.
 *
 * These three tables were declared four times -- in page-shell.mjs,
 * home-pages.mjs, confession-wall.mjs and generate-blog-index.mjs -- with
 * identical values, which is four places to edit and three places to forget.
 * They are one table now because they are one fact about the site.
 *
 * `es_ES` is deliberate. This site's Spanish is written in Spain's Spanish by
 * an author from Spain -- "coste", not "costo"; "fichero", not "archivo" -- and
 * it is aimed at readers in both Spain and Latin America. The pairing that
 * serves that is a specific og:locale with an unqualified `hreflang="es"`:
 * og:locale describes the variety the page is written in, which is a fact, while
 * hreflang declares who it is *for*, and a bare "es" claims every Spanish
 * region rather than conceding Latin America to a page that does not exist.
 * Narrowing hreflang to es-ES would be the mistake here, not the es_ES.
 */

/** The `lang` attribute on <html>. */
export const HTML_LANG = { en: 'en', es: 'es', pt: 'pt-BR' };

/** Open Graph's locale, which wants a variety rather than a language. */
export const OG_LOCALE = { en: 'en_US', es: 'es_ES', pt: 'pt_BR' };

/** What Intl formats dates with, so a published date reads natively. */
export const DATE_LOCALE = { en: 'en-US', es: 'es-ES', pt: 'pt-BR' };

/**
 * The og:locale:alternate tags for every language but the page's own.
 *
 * Open Graph carries no equivalent of an hreflang cluster, so these are the
 * only signal in the head that the other translations exist. Article and
 * category pages were the two families emitting og:locale without them, which
 * made a shared article look monolingual to anything reading Open Graph alone.
 */
export const renderAlternateLocales = (lang, indent = '  ') =>
  Object.keys(OG_LOCALE)
    .filter((other) => other !== lang)
    .map((other) => `${indent}<meta property="og:locale:alternate" content="${OG_LOCALE[other]}">`)
    .join('\n');
