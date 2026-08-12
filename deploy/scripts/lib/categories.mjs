/**
 * The blog's category taxonomy, as language-neutral keys with a label per
 * language.
 *
 * Categories used to be stored as display text, which meant the same taxonomy
 * existed under several names at once: an editor picking from the CMS dropdown
 * got the English "Data Governance" on a Spanish article, while a hand-edited
 * one said "Gobierno de Datos". The archive filter builds its options from the
 * text on the cards, so the Spanish blog offered both as separate choices and a
 * Spanish page shipped an English label in its chip, its `article:section` meta
 * tag and its JSON-LD `articleSection`.
 *
 * The standard is therefore: articles store the key, every reader-facing
 * surface renders the label for the page's own language. One localized page
 * stays in one language — which is what Google's multilingual guidance asks for
 * and what keeps `articleSection` and the on-page chip agreeing with the rest
 * of the copy — while the key keeps the three translations of an article in the
 * same bucket for related-article matching and any future category page.
 *
 * Spanish uses "Gobierno de Datos" rather than the equally common "Gobernanza
 * de Datos" because that is the term the Spanish blog index title, the homepage
 * and its FAQ schema already target; a category chip that disagreed with them
 * would split the site's own keyword signal.
 */
export const CATEGORY_LABELS = {
  'data-governance': { en: 'Data Governance', es: 'Gobierno de Datos', pt: 'Governança de Dados' },
  'data-culture': { en: 'Data Culture', es: 'Cultura de Datos', pt: 'Cultura de Dados' },
  'data-literacy': { en: 'Data Literacy', es: 'Alfabetización de Datos', pt: 'Alfabetização de Dados' },
  'ai-governance': { en: 'AI Governance', es: 'Gobierno de IA', pt: 'Governança de IA' },
  'data-quality': { en: 'Data Quality', es: 'Calidad de Datos', pt: 'Qualidade de Dados' },
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

const normalize = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Display names that also resolve to a key, so an article written before the
 * keys existed — or pasted from another language's front matter — still builds
 * instead of failing on a value that is only spelled differently.
 */
const ALIASES = new Map();
for (const [key, labels] of Object.entries(CATEGORY_LABELS)) {
  ALIASES.set(key, key);
  for (const label of Object.values(labels)) ALIASES.set(normalize(label), key);
}
// Synonyms no language column uses but editors and older articles do.
for (const [alias, key] of [
  ['gobernanza de datos', 'data-governance'],
  ['governanca de dados', 'data-governance'],
  ['gobernanza de ia', 'ai-governance'],
  ['alfabetizacion en datos', 'data-literacy'],
  ['alfabetizacao em dados', 'data-literacy'],
]) {
  ALIASES.set(normalize(alias), key);
}

/**
 * Resolves a front-matter category to its key and the label for `lang`.
 *
 * An unrecognised value fails the build rather than passing through: a typo
 * that reaches the page reintroduces exactly the split taxonomy this module
 * exists to prevent, and it does it silently — the card still renders, it just
 * carries a category nothing else shares.
 */
export function resolveCategory(value, lang, source) {
  if (!value) return { key: '', label: '' };

  const key = ALIASES.get(normalize(value));
  if (!key) {
    throw new Error(
      `Unknown category "${value}" in ${source}. Use one of: ${CATEGORY_KEYS.join(', ')}.`
    );
  }

  const label = CATEGORY_LABELS[key][lang];
  if (!label) throw new Error(`Category "${key}" has no ${lang} label (${source}).`);
  return { key, label };
}
