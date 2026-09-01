/**
 * What a simulator run means, as data: pillar mapping, role mapping, labels.
 *
 * The facilitator report needs to say things the three simulators already know
 * how to say -- which DAMA pillar a dimension speaks to, which of the ten
 * ownership disputes belongs to which role, what a dimension is called in
 * Spanish -- and it needs to say them in two places at once: in the browser,
 * where the sponsor reads the report, and inside
 * netlify/functions/workspace-report.mts, where the CSV export is written and
 * there is no locale at all. So the tables live here, once, and both sides
 * import them: the report page as a module over HTTP, the function as a
 * relative import the bundler follows at build time.
 *
 * Plain .mjs with no browser globals and no side effects, for exactly that
 * reason. Importing this file must never depend on `window`, because half its
 * readers run on a server.
 *
 * One deliberate exception to the "once" rule: assets/js/simulator-bridge.js
 * keeps its own copy of PILLAR_WEIGHTS, OWNERSHIP_SCENARIO_PILLARS and
 * UNMEASURED. It is a classic <script> loaded by nine simulator pages and
 * cannot import an ES module without converting all nine, and its render() is
 * synchronous so a dynamic import would race the results screen. This file is
 * the canonical table; the bridge is the mirror, and its header says so.
 */

/** The three simulators, in the order the report lists them when tied. */
export const SIMULATOR_SLUGS = ["data-governance-day-to-day", "data-literacy", "data-ownership-conflict"];

/** The five DAMA Maturity Scorecard pillars, in reading order. */
export const PILLAR_ORDER = ["foundations", "metadata", "security", "quality", "culture"];

/**
 * Tie-break order when two pillars score the same.
 *
 * Foundations first because it is causally upstream of the other four and the
 * most honest thing to point at first. Data Security last on purpose: a low
 * security reading inferred from a ten-question exercise is the weakest claim
 * this file can make and the most alarmist, so it wins a tie only when nothing
 * else is available.
 */
export const TIEBREAK_ORDER = ["foundations", "quality", "metadata", "security", "culture"];

/**
 * Which pillar each simulator dimension reports on, and how much of it.
 *
 * Mapped by reading what actually moves each dimension rather than by matching
 * names, and weighted because the mapping is not one-to-one: the Day-to-Day
 * simulator has five axes and two of them speak to Foundations. Scoring the
 * PILLARS and picking the weakest of those is stable where picking the weakest
 * DIMENSION and looking up its pillar is not.
 *
 * Efficiency is the one honest compromise: it is moved by lifecycle governance,
 * FinOps and time-to-find-a-dataset, and the Scorecard has no FinOps pillar, so
 * it is split between Foundations and Metadata rather than pretending to a clean
 * home.
 */
export const PILLAR_WEIGHTS = {
  "data-governance-day-to-day": {
    efficiency: { foundations: 0.6, metadata: 0.4 },
    trust: { quality: 1 },
    accountability: { foundations: 1 },
    security: { security: 1 },
    context: { metadata: 1 },
  },
  "data-literacy": {
    governance: { foundations: 1 },
    analytics: { quality: 1 },
    ai: { security: 1 },
    bias: { culture: 1 },
    culture: { culture: 1 },
  },
};

/**
 * The ownership simulator scores pillars from per-scenario correctness, because
 * it has no dimensions.
 *
 * Keyed by scenario id and not by the `category` string, because only the
 * English page carries categories -- the Spanish and Portuguese pages dropped
 * the field -- while all three keep ids 1..10 with identical correct roles. The
 * id is the one identifier that means the same thing in all three.
 */
export const OWNERSHIP_SCENARIO_PILLARS = {
  1: "foundations",
  2: "quality",
  3: "quality",
  4: "security",
  5: "security",
  6: "quality",
  7: "foundations",
  8: "metadata",
  9: "foundations",
  10: "security",
};

/**
 * Who each of the ten disputes actually belongs to.
 *
 * The same table the scenarios themselves hold in `correctRole`, restated here
 * so the report can group ten bars into the one finding a sponsor can act on:
 * a room that scores 90% on the four IT scenarios and 40% on the three Business
 * Owner ones is not "weak at ownership", it defaults to IT for anything that
 * sounds technical. That sentence is worth more than the ten bars above it.
 *
 * Not editable per client, unlike the scenario wording: this is the scoring key,
 * which netlify/lib/scenario-fields.mjs keeps out of reach for the same reason.
 */
export const OWNERSHIP_SCENARIO_ROLES = {
  1: "business",
  2: "it",
  3: "steward",
  4: "it",
  5: "business",
  6: "steward",
  7: "it",
  8: "steward",
  9: "business",
  10: "it",
};

/** The three roles, weakest-first ordering handled by the caller. */
export const OWNERSHIP_ROLES = ["business", "steward", "it"];

/**
 * Pillars a given simulator cannot see at all.
 *
 * No single simulator covers all five, and for two of the three the blank one is
 * Data Culture -- the pillar that decides whether the other four survive contact
 * with real people. That sets a rule the report must not break: an unmeasured
 * pillar is reported as "not measured", never as "weak". Inferring a low Culture
 * score from a RACI exercise would be inventing a finding, and this audience
 * notices.
 */
export const UNMEASURED = {
  "data-ownership-conflict": ["culture"],
  "data-governance-day-to-day": ["culture"],
  "data-literacy": ["metadata"],
};

/**
 * Every dimension key a run can carry, as a person reads it, per language.
 *
 * Keyed by simulator first because `scenario-4` means one thing in the ownership
 * simulator and nothing anywhere else, and because the report renders a panel
 * per simulator and can therefore always say which one it is asking about.
 *
 * The ownership labels are the report's answer to a real complaint: ten bars
 * reading "Scenario 1 … Scenario 10" are unreadable to a sponsor who did not
 * play. Each label is the dispute in as few words as it survives, followed by
 * the role that should own it, because "who should have owned this" is the
 * finding and there is no room for a second line. Positional, like the keys
 * themselves -- scenario 4 is the firewall question in all three languages.
 */
export const DIMENSION_LABELS = {
  en: {
    "data-governance-day-to-day": {
      efficiency: "Efficiency",
      trust: "Trust",
      accountability: "Accountability",
      security: "Security",
      context: "Context",
    },
    "data-literacy": {
      governance: "Governance",
      bias: "Bias awareness",
      ai: "AI and automation",
      analytics: "Analytics",
      culture: "Data culture",
    },
    "data-ownership-conflict": {
      "scenario-1": "Metric definition — Business",
      "scenario-2": "SQL dedup pipeline — IT",
      "scenario-3": "Quality profiling rules — Steward",
      "scenario-4": "Firewall & access — IT",
      "scenario-5": "Third-party data sharing — Business",
      "scenario-6": "Missing postal codes — Steward",
      "scenario-7": "Warehouse purchase — IT",
      "scenario-8": "Catalog metadata — Steward",
      "scenario-9": "Budget approval — Business",
      "scenario-10": "Backups & recovery — IT",
    },
  },
  es: {
    "data-governance-day-to-day": {
      efficiency: "Eficiencia",
      trust: "Confianza",
      accountability: "Responsabilidad",
      security: "Seguridad",
      context: "Contexto",
    },
    "data-literacy": {
      governance: "Gobernanza",
      bias: "Conciencia del sesgo",
      ai: "IA y automatización",
      analytics: "Analítica",
      culture: "Cultura de datos",
    },
    "data-ownership-conflict": {
      "scenario-1": "Definición de métrica — Negocio",
      "scenario-2": "Pipeline SQL de duplicados — TI",
      "scenario-3": "Reglas de calidad — Steward",
      "scenario-4": "Firewall y accesos — TI",
      "scenario-5": "Compartir datos con terceros — Negocio",
      "scenario-6": "Códigos postales faltantes — Steward",
      "scenario-7": "Compra del data warehouse — TI",
      "scenario-8": "Metadatos del catálogo — Steward",
      "scenario-9": "Aprobación de presupuesto — Negocio",
      "scenario-10": "Backups y recuperación — TI",
    },
  },
  pt: {
    "data-governance-day-to-day": {
      efficiency: "Eficiência",
      trust: "Confiança",
      accountability: "Responsabilidade",
      security: "Segurança",
      context: "Contexto",
    },
    "data-literacy": {
      governance: "Governança",
      bias: "Consciência do viés",
      ai: "IA e automação",
      analytics: "Analítica",
      culture: "Cultura de dados",
    },
    "data-ownership-conflict": {
      "scenario-1": "Definição de métrica — Negócio",
      "scenario-2": "Pipeline SQL de duplicados — TI",
      "scenario-3": "Regras de qualidade — Steward",
      "scenario-4": "Firewall e acessos — TI",
      "scenario-5": "Partilha de dados com terceiros — Negócio",
      "scenario-6": "Códigos postais ausentes — Steward",
      "scenario-7": "Compra do data warehouse — TI",
      "scenario-8": "Metadados do catálogo — Steward",
      "scenario-9": "Aprovação de orçamento — Negócio",
      "scenario-10": "Backups e recuperação — TI",
    },
  },
};

/** The five pillars as the Scorecard names them. Same wording as the bridge. */
export const PILLAR_LABELS = {
  en: {
    foundations: "Foundations",
    metadata: "Metadata & Catalog",
    security: "Data Security",
    quality: "Data Quality",
    culture: "Data Culture",
  },
  es: {
    foundations: "Fundamentos",
    metadata: "Metadatos y Catálogo",
    security: "Seguridad de Datos",
    quality: "Calidad de Datos",
    culture: "Cultura de Datos",
  },
  pt: {
    foundations: "Fundamentos",
    metadata: "Metadados e Catálogo",
    security: "Segurança de Dados",
    quality: "Qualidade de Dados",
    culture: "Cultura de Dados",
  },
};

/** The three ownership roles, as the simulator's own buttons name them. */
export const ROLE_LABELS = {
  en: { business: "Business Owner", steward: "Data Steward / Product Owner", it: "IT / Data Team" },
  es: { business: "Dueño de Negocio", steward: "Data Steward / Product Owner", it: "TI / Equipo de Datos" },
  pt: { business: "Dono do Negócio", steward: "Data Steward / Product Owner", it: "TI / Equipa de Dados" },
};

/**
 * The profile each simulator's own results screen shows a player, per band key.
 *
 * The room report needs these because a sponsor band that reads "leader" is a
 * key, not a sentence, and because the CSV export has no locale and still has to
 * name the profile. Emoji are dropped: the ownership screen prefixes its tiers
 * with one, and the report is printed.
 *
 * Band keys are the ones each simulator page passes to the bridge, so a label
 * here can never disagree with the badge a participant already read.
 */
export const PROFILE_LABELS = {
  en: {
    "data-governance-day-to-day": {
      firefighter: "Siloed Firefighter",
      reactive: "Reactive Data Operator",
      leader: "Structured Governance Leader",
    },
    "data-literacy": {
      hoarder: "Siloed Data Hoarder",
      tactical: "Tactical Operational Manager",
      strategist: "Literate Data Strategist",
      champion: "Culture Champion & Executive Data Strategist",
    },
    "data-ownership-conflict": {
      rookie: "Ownership Rookie",
      practitioner: "Governance Practitioner",
      master: "Data Ownership Master",
    },
  },
  es: {
    "data-governance-day-to-day": {
      firefighter: "Bombero en Silos",
      reactive: "Operador de Datos Reactivo",
      leader: "Líder de Gobernanza Estructurado",
    },
    "data-literacy": {
      hoarder: "Acumulador Silado de Datos",
      tactical: "Gerente Operativo Táctico",
      strategist: "Estratega Alfabetizado de Datos",
      champion: "Líder de Cultura y Estratega Ejecutivo de Datos",
    },
    "data-ownership-conflict": {
      rookie: "Novato de la Propiedad",
      practitioner: "Practicante de Gobernanza",
      master: "Maestro en Propiedad de Datos",
    },
  },
  pt: {
    "data-governance-day-to-day": {
      firefighter: "Bombeiro em Silos",
      reactive: "Operador de Dados Reativo",
      leader: "Líder de Governança Estruturado",
    },
    "data-literacy": {
      hoarder: "Acumulador de Dados Silado",
      tactical: "Gestor Tático Operacional",
      strategist: "Estrategista de Dados Alfabetizado",
      champion: "Campeão de Cultura e Estrategista Executivo de Dados",
    },
    "data-ownership-conflict": {
      rookie: "Novato em Governança",
      practitioner: "Praticante de Governança",
      master: "Mestre em Governança de Dados",
    },
  },
};

/**
 * The four maturity bands the report distributes runs into, and the band the
 * cross-simulator index falls in.
 *
 * Not a simulator profile: these are comparable across all three, which is the
 * only reason a distribution histogram and one organisational index can exist at
 * all. The boundaries themselves live in the report function, since they are
 * arithmetic rather than wording.
 */
export const BAND_LABELS = {
  en: { developing: "Developing", competent: "Competent", strong: "Strong", leading: "Leading" },
  es: { developing: "En desarrollo", competent: "Competente", strong: "Sólido", leading: "Referente" },
  pt: { developing: "Em desenvolvimento", competent: "Competente", strong: "Sólido", leading: "Referência" },
};

/** A dimension key as a person reads it, or the key tidied up if it is unknown. */
export const dimensionLabel = (simulator, key, locale = "en") => {
  const byLocale = DIMENSION_LABELS[locale] || DIMENSION_LABELS.en;
  const known = (byLocale[simulator] || {})[key] || (DIMENSION_LABELS.en[simulator] || {})[key];
  if (known) return known;
  return String(key)
    .replace(/[-_]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
};

/**
 * One run's breakdown, expressed as pillar readings.
 *
 * Returns `{ <pillar>: { value, weight } }` where `value` is already multiplied
 * by its weight, so a caller aggregating many runs can sum both fields and
 * divide once at the end. A dimension with no mapping contributes nothing rather
 * than defaulting to a pillar: a wrong attribution is worse than a blank.
 */
export const pillarContributions = (simulator, breakdown) => {
  const contributions = {};

  const add = (pillar, value, weight) => {
    if (!pillar || !weight) return;
    const entry = contributions[pillar] || (contributions[pillar] = { value: 0, weight: 0 });
    entry.value += value * weight;
    entry.weight += weight;
  };

  if (!breakdown || typeof breakdown !== "object") return contributions;

  if (simulator === "data-ownership-conflict") {
    for (const [key, raw] of Object.entries(breakdown)) {
      const match = /^scenario-(\d+)$/.exec(key);
      const value = Number(raw);
      if (!match || !Number.isFinite(value)) continue;
      add(OWNERSHIP_SCENARIO_PILLARS[Number(match[1])], value, 1);
    }
    return contributions;
  }

  const weights = PILLAR_WEIGHTS[simulator];
  if (!weights) return contributions;

  for (const [key, raw] of Object.entries(breakdown)) {
    const value = Number(raw);
    const mapping = weights[key];
    if (!mapping || !Number.isFinite(value)) continue;
    for (const [pillar, weight] of Object.entries(mapping)) add(pillar, value, weight);
  }

  return contributions;
};

/**
 * Which simulators can produce a reading for each pillar.
 *
 * Derived from the two mappings above rather than typed out, so it cannot drift
 * from them. The report uses it to turn a blank pillar into an instruction: a
 * space with no Data Literacy runs has no Data Culture reading, and the useful
 * sentence is which exercise would produce one, not that the number is missing.
 */
export const PILLAR_SOURCES = (() => {
  const sources = {};

  const add = (pillar, slug) => {
    const list = sources[pillar] || (sources[pillar] = []);
    if (!list.includes(slug)) list.push(slug);
  };

  for (const [slug, dimensions] of Object.entries(PILLAR_WEIGHTS)) {
    for (const mapping of Object.values(dimensions)) {
      for (const pillar of Object.keys(mapping)) add(pillar, slug);
    }
  }

  for (const pillar of Object.values(OWNERSHIP_SCENARIO_PILLARS)) {
    add(pillar, "data-ownership-conflict");
  }

  return sources;
})();
