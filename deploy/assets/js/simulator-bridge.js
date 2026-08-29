/*
 * The bridge between a finished simulator run and the DAMA Maturity Scorecard.
 *
 * Every simulator ends with a number that describes THE PLAYER. The Scorecard
 * measures THE ORGANISATION. That distinction is the whole reason a visitor who
 * just scored 900/1000 should fill in another assessment, and it is what the
 * copy below is built around: the run is evidence that this person knows what
 * good looks like, and the Scorecard is the only thing that says whether their
 * employer agrees.
 *
 * Why this file exists at all, rather than nine blocks of markup:
 *
 * The nine simulator pages have already diverged -- different band thresholds,
 * different state variable names, three different CTA markups, and (see
 * netlify/functions/simulator-score-submit.mts) a streak bonus that once put a
 * perfect ownership run at 1900 against a server bound of 1000 because the
 * Spanish and Portuguese pages were edited and the English one was not. A
 * pillar mapping replicated nine times would drift the same way, and a drifted
 * mapping produces confidently wrong personalisation, which is worse for trust
 * than no personalisation at all. So the mapping, the copy, the markup and the
 * styling live here once and the pages pass in raw numbers.
 *
 * The pages own two things this file deliberately does not:
 *   - the band key, because each page displays its own profile label from its
 *     own thresholds (pt/data-governance-day-to-day uses 85/65 where en and es
 *     use 75/50) and the bridge must never contradict the sentence the visitor
 *     just read three inches higher up the screen;
 *   - the slot element, so a page that fails to load this script keeps whatever
 *     CTA it had before rather than rendering an empty gap.
 */
(function () {
  "use strict";

  /*
   * The Scorecard, per language, as the full form URL rather than the forms.gle
   * short link the homepage uses.
   *
   * This is not a cosmetic change. A forms.gle short link answers with a 302 to
   * the address below and drops every query parameter on the way, so campaign
   * tags and prefilled answers sent through the short link arrive as nothing at
   * all. Sending them requires the long form, which is why it is spelled out.
   */
  var SCORECARD_FORMS = {
    es: "https://docs.google.com/forms/d/e/1FAIpQLSeiDEJk4bDr6uCa1dvopYl0BgX3dDPX4u_wH-LMtOdUxHe0VQ/viewform",
    en: "https://docs.google.com/forms/d/e/1FAIpQLSe-NeCroDuveNEZ5q2qW06h0Tn140a9ug-8DHIKLot2rwD1WQ/viewform",
    pt: "https://docs.google.com/forms/d/e/1FAIpQLSezDs09NAYmiGQUkIETvr1BZikQeXEYurdfhd-x6-TqoeexPw/viewform"
  };

  /*
   * Prefill wiring for the Scorecard, switched off until the form has somewhere
   * to put the answers.
   *
   * Filling these in is what closes the loop: the Scorecard response arrives
   * already carrying which simulator sent the person, how they scored and which
   * pillar came out weakest, so the follow-up can open with "you came in from
   * the Day-to-Day simulator with Data Quality as your weakest pillar" instead
   * of asking. The response sheet then doubles as the conversion analytics --
   * which band and which pillar actually convert -- with no tracking endpoint.
   *
   * To enable, in each of the three forms add three short-answer questions --
   * "Source simulator", "Result band", "Weakest pillar" -- then open the form's
   * "Get pre-filled link", fill anything into those three, copy the generated
   * link and read the entry.NNNNNNN numbers out of it. Set them below. Until
   * then buildScorecardUrl sends campaign tags only, which is harmless.
   */
  var SCORECARD_ENTRY_IDS = {
    es: { simulator: null, band: null, pillar: null },
    en: { simulator: null, band: null, pillar: null },
    pt: { simulator: null, band: null, pillar: null }
  };

  /* Where the quiet secondary link goes. The homepage reads ?ctx= and prefills
   * the contact textarea from it; see initializeOfferPrefill in src/home.html. */
  var SITE_ROOT = "https://datagovjourney.com";
  var CONTACT_PATHS = { es: "/", en: "/en/", pt: "/pt/" };

  var PILLAR_ORDER = ["foundations", "metadata", "security", "quality", "culture"];

  /*
   * Tie-break order, used when two pillars score the same.
   *
   * Foundations first because it is causally upstream of the other four and the
   * most honest thing to point at first. Data Security last on purpose: a low
   * security reading inferred from a ten-question quiz is the weakest claim in
   * this file and the most alarmist thing it could say, so it wins a tie only
   * when nothing else is available.
   */
  var TIEBREAK_ORDER = ["foundations", "quality", "metadata", "security", "culture"];

  /*
   * Which pillar each simulator dimension reports on, and how much of it.
   *
   * Mapped by reading what actually moves each dimension rather than by matching
   * names. The weights exist because the mapping is not one-to-one -- the
   * Day-to-Day simulator has five axes and two of them speak to Foundations --
   * so picking the weakest DIMENSION and looking up its pillar gives unstable
   * answers. Scoring the PILLARS and picking the weakest of those does not.
   *
   * Efficiency is the one honest compromise here: it is moved by lifecycle
   * governance, FinOps and time-to-find-a-dataset, and the Scorecard has no
   * FinOps pillar, so it is split between Foundations and Metadata rather than
   * pretending to a clean home.
   */
  var PILLAR_WEIGHTS = {
    "data-governance-day-to-day": {
      efficiency: { foundations: 0.6, metadata: 0.4 },
      trust: { quality: 1 },
      accountability: { foundations: 1 },
      security: { security: 1 },
      context: { metadata: 1 }
    },
    "data-literacy": {
      governance: { foundations: 1 },
      analytics: { quality: 1 },
      ai: { security: 1 },
      bias: { culture: 1 },
      culture: { culture: 1 }
    }
  };

  /*
   * The ownership simulator scores pillars from per-scenario correctness rather
   * than from dimensions, because it has none.
   *
   * Keyed by scenario id and not by the `category` string, because only the
   * English page carries categories -- the Spanish and Portuguese pages dropped
   * the field -- while all three keep ids 1..10 with identical correct roles.
   * The id is the one identifier that means the same thing in all three.
   *
   *  1 Business metric definitions ....... Business Owner .. foundations
   *  2 Technical pipeline build .......... IT / Tech ....... quality
   *  3 Quality profiling rules ........... Data Steward .... quality
   *  4 Firewall and access permissions ... IT / Tech ....... security
   *  5 Third-party data sharing approval . Business Owner .. security
   *  6 Root-cause of missing postal codes  Data Steward .... quality
   *  7 Warehouse purchase and setup ...... IT / Tech ....... foundations
   *  8 Catalog metadata documentation .... Data Steward .... metadata
   *  9 Budget and P&L approval ........... Business Owner .. foundations
   * 10 Backups and disaster recovery ..... IT / Tech ....... security
   */
  var OWNERSHIP_SCENARIO_PILLARS = {
    1: "foundations", 2: "quality", 3: "quality", 4: "security", 5: "security",
    6: "quality", 7: "foundations", 8: "metadata", 9: "foundations", 10: "security"
  };

  /*
   * Pillars a given simulator cannot see at all.
   *
   * This is the most commercially useful thing the mapping turned up: no single
   * simulator covers all five pillars, and for two of the three the blank one is
   * Data Culture -- the pillar that decides whether the other four survive
   * contact with real people. That is a true statement, it is a better reason to
   * open the Scorecard than any tier badge, and an unfinished set of five is
   * harder to walk away from than a finished set of four.
   *
   * It also sets a rule the copy must not break: an unmeasured pillar is
   * reported as "not measured here", never as "weak". Inferring a low Culture
   * score from a RACI quiz would be inventing a finding, and this audience
   * notices.
   */
  var UNMEASURED = {
    "data-ownership-conflict": ["culture"],
    "data-governance-day-to-day": ["culture"],
    "data-literacy": ["metadata"]
  };

  /* Which headline a simulator leads with. "coverage" leads with the blank
   * pillar, "weakest" leads with the lowest measured one. */
  var HEADLINE_MODE = {
    "data-ownership-conflict": "coverage",
    "data-governance-day-to-day": "coverage",
    "data-literacy": "weakest"
  };

  /*
   * Simulator display names, per locale.
   *
   * The homepage contact form needs these to write "I just finished the Data
   * Ownership Conflict simulator", and they live here rather than in
   * src/home.html so there is one place to rename a simulator. Same reasoning as
   * the pillar names: a label duplicated across four files is a label that will
   * eventually disagree with itself.
   */
  var SIMULATOR_LABELS = {
    en: {
      "data-ownership-conflict": "Data Ownership Conflict",
      "data-governance-day-to-day": "Data Governance Day-to-Day",
      "data-literacy": "Data Literacy"
    },
    es: {
      "data-ownership-conflict": "Conflicto de Propiedad de Datos",
      "data-governance-day-to-day": "Gobernanza de Datos en el Día a Día",
      "data-literacy": "Alfabetización de Datos"
    },
    pt: {
      "data-ownership-conflict": "Conflito de Propriedade de Dados",
      "data-governance-day-to-day": "Governança de Dados no Dia a Dia",
      "data-literacy": "Letramento em Dados"
    }
  };

  /* Netlify Forms subject, kept in Spanish for every locale to match the
   * existing 'Espacio privado de simuladores' convention -- the field is read by
   * one person sorting their own inbox, not by the visitor. */
  var CONTACT_SUBJECT = "Resultado de simulador";

  var COVERAGE_KEY = "dgj.pillarCoverage";
  var LAST_RUN_KEY = "dgj.lastRun";
  var STYLE_ID = "sim-bridge-styles";

  /*
   * Copy, per language, written rather than templated.
   *
   * Two axes carry the personalisation and they are kept separate so the number
   * of blocks stays writable: `evidence` reacts to WHICH simulator and WHICH
   * band (it is the sentence that proves the page was paying attention), and
   * `coverage`/`weakest` react to WHICH pillar (it is the reason to act). One of
   * each is concatenated at render time.
   *
   * The line every block holds: a simulator score is about the player, a
   * Scorecard result is about the employer. High scorers are told the gap
   * between the two is the expensive part -- competence that the organisation
   * does not act on is a resignation risk, not a win. Low scorers are told the
   * score is a reading, not a verdict, and are never asked to feel bad before
   * being asked to click; shame closes tabs.
   *
   * No countdowns, no fake scarcity, no invented industry benchmark. This
   * audience is data governance practitioners and they will spot all three, and
   * spotting them costs more trust than the click is worth.
   */
  var COPY = {};

  COPY.en = {
    pillars: {
      foundations: "Foundations",
      metadata: "Metadata & Catalog",
      security: "Data Security",
      quality: "Data Quality",
      culture: "Data Culture"
    },
    status: {
      covered: "measured in this run",
      weak: "weakest measured pillar",
      blank: "not measured here",
      prior: "measured in an earlier run"
    },
    ui: {
      eyebrow: function (covered) {
        return covered + " of 5 Scorecard pillars showed up in this run";
      },
      eyebrowComplete: "5 of 5 Scorecard pillars measured across your runs",
      meterLabel: "Scorecard pillar coverage from this simulator",
      cta: "Measure all five pillars",
      note: "Free. A few minutes. You get your DAMA level 1 to 5, a five-pillar radar chart and three quick wins on your lowest pillar.",
      altPrefix: "Rather talk it through first?",
      altLink: "Send me your result and a question",
      returning: function (pillar) {
        return "You measured " + pillar + " in an earlier simulator, so you have now touched all five. The Scorecard is what turns those separate readings into one organisational baseline.";
      }
    },

    /* Leads with the pillar the simulator structurally cannot see. */
    coverage: {
      culture: {
        headline: "Four pillars answered. The fifth is the one that decides whether the other four hold.",
        body: "Foundations, Metadata &amp; Catalog, Data Quality and Data Security all moved while you played. Data Culture -- change management and literacy -- never came up, because no simulator can measure whether your colleagues would actually go along with the decisions you just made. That pillar is where most governance programmes quietly stall."
      },
      metadata: {
        headline: "Four pillars answered. The fifth is the one nobody notices until an audit.",
        body: "Foundations, Data Quality, Data Security and Data Culture all moved while you played. Metadata &amp; Catalog -- documentation and lineage -- never came up, and it is the pillar that decides whether anyone can answer where this number came from without a three-day investigation."
      }
    },

    /* Leads with the lowest-scoring measured pillar. */
    weakest: {
      foundations: {
        headline: "Your weakest pillar was Foundations: strategy, ownership and roles.",
        body: "Every other pillar is downstream of this one. Quality rules with no accountable owner get skipped, catalogs with no mandate go stale, and security controls with no decision rights turn into a queue. If Foundations is the soft spot in a simulator, it is usually louder in the real organisation."
      },
      metadata: {
        headline: "Your weakest pillar was Metadata &amp; Catalog: documentation and traceability.",
        body: "This is the pillar that answers where did this number come from. Without it every question becomes an investigation, onboarding takes months, and the same dataset gets rebuilt three times because nobody could find the first one."
      },
      security: {
        headline: "Your weakest pillar was Data Security: protection, privacy and compliance.",
        body: "This is the only pillar on the list whose failures are dated, public and expensive. It is also the one most often assumed to be somebody else problem -- usually IT -- right up until the access review asks who approved this."
      },
      quality: {
        headline: "Your weakest pillar was Data Quality: measurement, rules and monitoring.",
        body: "Quality is what people mean when they say they do not trust the dashboard. Untrusted data is not unused data -- it is data that gets quietly replaced by a spreadsheet, which is how the numbers in the board pack stop matching the numbers in the warehouse."
      },
      culture: {
        headline: "Your weakest pillar was Data Culture: change management and literacy.",
        body: "This is the pillar that decides whether the other four survive. Policies land as guidance nobody reads, tools get bought and not adopted, and the governance team turns into an approval queue. It is also the slowest to fix, which is why knowing your level now matters."
      }
    },

    /* The proof-of-attention sentence. Band keys come from each page so the
     * bridge always agrees with the profile label already on screen. */
    evidence: {
      "data-ownership-conflict": {
        master: function (c) {
          return "You closed at " + c.score + " points with " + c.correct + " of " + c.total + " correct: you can name the accountable role faster than most governance leads. Which makes the expensive question the other one -- whether your organisation actually assigns them that way.";
        },
        practitioner: function (c) {
          return "You closed at " + c.score + " points, " + c.correct + " of " + c.total + " correct. The pattern in the misses is the useful part: ownership calls are rarely wrong at random, they lean.";
        },
        rookie: function (c) {
          return "You closed at " + c.score + " points, " + c.correct + " of " + c.total + " correct. Worth knowing: these ten scenarios are the ones real organisations argue about in meetings, so a middling first run is a reading, not a verdict.";
        }
      },
      "data-governance-day-to-day": {
        leader: function (c) {
          return "You finished ten decisions at " + c.score + "% with the budget intact: you already govern like the structure exists. The gap that costs money is between how you decided here and what your organisation would let you do on Monday.";
        },
        reactive: function (c) {
          return "You finished ten decisions at " + c.score + "%. That is the profile of someone holding things together by hand -- which works, until it is the only thing holding them together.";
        },
        firefighter: function (c) {
          return "You finished ten decisions at " + c.score + "%. Every scenario in this simulator was taken from a real backlog, and firefighting is what the absence of structure feels like from the inside, not a personal failing.";
        }
      },
      "data-literacy": {
        champion: function (c) {
          return "You cleared " + c.score + " of " + c.total + " questions across bias, AI risk, analytics and culture. At that level your own literacy has stopped being the constraint, and the distance between you and the rest of the organisation has become it.";
        },
        strategist: function (c) {
          return "You cleared " + c.score + " of " + c.total + " questions. Strong across most competencies, with one or two that gave way under pressure -- and those are the ones that show up in real decisions.";
        },
        tactical: function (c) {
          return "You cleared " + c.score + " of " + c.total + " questions. Solid operational instincts; the misses clustered where data work stops being technical and starts being political.";
        },
        hoarder: function (c) {
          return "You cleared " + c.score + " of " + c.total + " questions. These items are deliberately built around the traps that catch experienced people, so treat this as a map of where to look, not a grade.";
        }
      }
    },

    /* Ownership only: the direction of the wrong answers, which is a sharper
     * finding than the count. Returns null when there is no lean. */
    misattribution: {
      it: "Your misses leaned one way: work that belongs to the business went to IT. That is the most common and most expensive ownership error there is -- it turns a technology team into the accountable party for decisions it was never given the authority to make.",
      business: "Your misses leaned one way: technical execution went to business owners. It reads as empowerment and lands as unfunded mandates on people without the tooling to deliver.",
      steward: "Your misses leaned one way: decisions went to the Data Steward that needed either business authority or technical ownership. Stewardship absorbing everything is how the role burns out.",
      generic: "Your misses were spread across all three roles rather than leaning one way, which usually means the accountability model itself has not been written down anywhere."
    },

    contactMessage: function (c) {
      var lines = [];
      lines.push("Hi Sandy, I just finished the " + c.simulatorLabel + " simulator" + (c.bandLabel ? " and came out as " + c.bandLabel : "") + ".");
      if (c.pillarLabel) {
        lines.push("The pillar it flagged for me was " + c.pillarLabel + ".");
      }
      lines.push("");
      lines.push("I would like to talk about what this looks like for my team. Some context about where we are:");
      lines.push("");
      return lines.join("\n");
    }
  };

  /* Spanish. Informal address throughout, matching the existing simulator and
   * homepage copy (tu empresa, tu organización) rather than switching to usted
   * halfway through the visit. */
  COPY.es = {
    pillars: {
      foundations: "Fundamentos",
      metadata: "Metadatos y Catálogo",
      security: "Seguridad de Datos",
      quality: "Calidad de Datos",
      culture: "Cultura de Datos"
    },
    status: {
      covered: "medido en esta partida",
      weak: "pilar más débil de los medidos",
      blank: "no se mide aquí",
      prior: "medido en una partida anterior"
    },
    ui: {
      eyebrow: function (covered) {
        return covered + " de los 5 pilares del Scorecard aparecieron en esta partida";
      },
      eyebrowComplete: "5 de 5 pilares del Scorecard medidos entre tus partidas",
      meterLabel: "Cobertura de los pilares del Scorecard en este simulador",
      cta: "Medir los cinco pilares",
      note: "Gratis. Unos minutos. Recibes tu nivel DAMA del 1 al 5, un gráfico radar de los cinco pilares y tres quick wins sobre tu pilar más bajo.",
      altPrefix: "¿Prefieres comentarlo antes?",
      altLink: "Envíame tu resultado y una pregunta",
      returning: function (pillar) {
        return "Ya mediste " + pillar + " en un simulador anterior, así que has tocado los cinco. El Scorecard es lo que convierte esas lecturas sueltas en una línea base de tu organización.";
      }
    },

    coverage: {
      culture: {
        headline: "Cuatro pilares respondidos. El quinto es el que decide si los otros cuatro se sostienen.",
        body: "Fundamentos, Metadatos y Catálogo, Calidad de Datos y Seguridad de Datos se movieron mientras jugabas. Cultura de Datos -- gestión del cambio y alfabetización -- no apareció, porque ningún simulador puede medir si tus colegas aceptarían de verdad las decisiones que acabas de tomar. Ese pilar es donde la mayoría de los programas de gobernanza se estancan en silencio."
      },
      metadata: {
        headline: "Cuatro pilares respondidos. El quinto es el que nadie nota hasta que llega una auditoría.",
        body: "Fundamentos, Calidad de Datos, Seguridad de Datos y Cultura de Datos se movieron mientras jugabas. Metadatos y Catálogo -- documentación y linaje -- no apareció, y es el pilar que decide si alguien puede responder de dónde salió este número sin abrir una investigación de tres días."
      }
    },

    weakest: {
      foundations: {
        headline: "Tu pilar más débil fue Fundamentos: estrategia, propiedad y roles.",
        body: "Todos los demás pilares dependen de este. Las reglas de calidad sin un responsable asignado se saltan, los catálogos sin mandato se quedan obsoletos y los controles de seguridad sin derechos de decisión se convierten en una cola de tickets. Si Fundamentos es el punto flojo en un simulador, en la organización real suele sonar más fuerte."
      },
      metadata: {
        headline: "Tu pilar más débil fue Metadatos y Catálogo: documentación y trazabilidad.",
        body: "Es el pilar que responde de dónde salió este número. Sin él cada pregunta se convierte en una investigación, la incorporación de gente nueva tarda meses y el mismo dataset se reconstruye tres veces porque nadie encontró el primero."
      },
      security: {
        headline: "Tu pilar más débil fue Seguridad de Datos: protección, privacidad y cumplimiento.",
        body: "Es el único pilar de la lista cuyos fallos tienen fecha, son públicos y salen caros. También es el que más se asume como problema de otro -- normalmente de IT -- hasta que la revisión de accesos pregunta quién aprobó esto."
      },
      quality: {
        headline: "Tu pilar más débil fue Calidad de Datos: medición, reglas y monitoreo.",
        body: "Calidad es a lo que se refiere la gente cuando dice que no confía en el dashboard. Los datos sin confianza no se dejan de usar: se reemplazan en silencio por una hoja de cálculo, y así es como los números del comité dejan de coincidir con los del warehouse."
      },
      culture: {
        headline: "Tu pilar más débil fue Cultura de Datos: gestión del cambio y alfabetización.",
        body: "Es el pilar que decide si los otros cuatro sobreviven. Las políticas aterrizan como recomendaciones que nadie lee, se compran herramientas que no se adoptan y el equipo de gobernanza acaba siendo una cola de aprobaciones. También es el más lento de arreglar, y por eso conocer tu nivel ahora importa."
      }
    },

    evidence: {
      "data-ownership-conflict": {
        master: function (c) {
          return "Cerraste con " + c.score + " puntos y " + c.correct + " de " + c.total + " aciertos: identificas al rol responsable más rápido que la mayoría de los líderes de gobernanza. Lo cual deja la pregunta cara en el otro lado -- si tu organización los asigna así de verdad.";
        },
        practitioner: function (c) {
          return "Cerraste con " + c.score + " puntos, " + c.correct + " de " + c.total + " aciertos. Lo útil está en el patrón de los fallos: las decisiones de propiedad casi nunca se equivocan al azar, se inclinan.";
        },
        rookie: function (c) {
          return "Cerraste con " + c.score + " puntos, " + c.correct + " de " + c.total + " aciertos. Vale saberlo: estos diez escenarios son justo los que las organizaciones reales discuten en reuniones, así que una primera partida intermedia es una lectura, no un veredicto.";
        }
      },
      "data-governance-day-to-day": {
        leader: function (c) {
          return "Terminaste diez decisiones con " + c.score + "% y el presupuesto intacto: ya gobiernas como si la estructura existiera. La brecha que cuesta dinero está entre cómo decidiste aquí y lo que tu organización te dejaría hacer el lunes.";
        },
        reactive: function (c) {
          return "Terminaste diez decisiones con " + c.score + "%. Ese es el perfil de quien sostiene las cosas a mano -- que funciona, hasta que es lo único que las sostiene.";
        },
        firefighter: function (c) {
          return "Terminaste diez decisiones con " + c.score + "%. Cada escenario de este simulador salió de un backlog real, y apagar incendios es lo que se siente por dentro cuando falta estructura, no un fallo personal.";
        }
      },
      "data-literacy": {
        champion: function (c) {
          return "Resolviste " + c.score + " de " + c.total + " preguntas entre sesgos, riesgo de IA, analítica y cultura. A ese nivel tu propia alfabetización dejó de ser la restricción, y la distancia entre tú y el resto de la organización pasó a serlo.";
        },
        strategist: function (c) {
          return "Resolviste " + c.score + " de " + c.total + " preguntas. Sólido en casi todas las competencias, con una o dos que cedieron bajo presión -- y son justo las que aparecen en las decisiones reales.";
        },
        tactical: function (c) {
          return "Resolviste " + c.score + " de " + c.total + " preguntas. Buen instinto operativo; los fallos se agruparon donde el trabajo con datos deja de ser técnico y empieza a ser político.";
        },
        hoarder: function (c) {
          return "Resolviste " + c.score + " de " + c.total + " preguntas. Estas preguntas están construidas a propósito sobre las trampas que atrapan a gente con experiencia, así que tómalo como un mapa de dónde mirar, no como una nota.";
        }
      }
    },

    misattribution: {
      it: "Tus fallos se inclinaron en una dirección: trabajo que le corresponde al negocio acabó en IT. Es el error de propiedad más común y más caro que existe -- convierte a un equipo técnico en el responsable de decisiones para las que nunca le dieron autoridad.",
      business: "Tus fallos se inclinaron en una dirección: la ejecución técnica acabó en los dueños de negocio. Se lee como empoderamiento y aterriza como mandatos sin financiación sobre gente que no tiene las herramientas para cumplirlos.",
      steward: "Tus fallos se inclinaron en una dirección: al Data Steward le llegaron decisiones que necesitaban autoridad de negocio o propiedad técnica. Que la mayordomía absorba todo es la forma en que ese rol se quema.",
      generic: "Tus fallos se repartieron entre los tres roles en lugar de inclinarse hacia uno, lo que normalmente significa que el modelo de responsabilidades no está escrito en ninguna parte."
    },

    contactMessage: function (c) {
      var lines = [];
      lines.push("Hola Sandy, acabo de terminar el simulador de " + c.simulatorLabel + (c.bandLabel ? " y salí como " + c.bandLabel : "") + ".");
      if (c.pillarLabel) {
        lines.push("El pilar que me señaló fue " + c.pillarLabel + ".");
      }
      lines.push("");
      lines.push("Me gustaría hablar de cómo se ve esto en mi equipo. Algo de contexto sobre dónde estamos:");
      lines.push("");
      return lines.join("\n");
    }
  };

  /* Portuguese (Brazilian), informal address to match the existing pages
   * (sua organização, seu framework). */
  COPY.pt = {
    pillars: {
      foundations: "Fundamentos",
      metadata: "Metadados e Catálogo",
      security: "Segurança de Dados",
      quality: "Qualidade de Dados",
      culture: "Cultura de Dados"
    },
    status: {
      covered: "medido nesta partida",
      weak: "pilar mais fraco entre os medidos",
      blank: "não é medido aqui",
      prior: "medido em uma partida anterior"
    },
    ui: {
      eyebrow: function (covered) {
        return covered + " dos 5 pilares do Scorecard apareceram nesta partida";
      },
      eyebrowComplete: "5 de 5 pilares do Scorecard medidos nas suas partidas",
      meterLabel: "Cobertura dos pilares do Scorecard neste simulador",
      cta: "Medir os cinco pilares",
      note: "Gratuito. Alguns minutos. Você recebe seu nível DAMA de 1 a 5, um gráfico radar dos cinco pilares e três quick wins sobre o seu pilar mais baixo.",
      altPrefix: "Prefere conversar antes?",
      altLink: "Me envie seu resultado e uma pergunta",
      returning: function (pillar) {
        return "Você já mediu " + pillar + " em um simulador anterior, então já passou pelos cinco. O Scorecard é o que transforma essas leituras separadas em uma linha de base da sua organização.";
      }
    },

    coverage: {
      culture: {
        headline: "Quatro pilares respondidos. O quinto é o que decide se os outros quatro se sustentam.",
        body: "Fundamentos, Metadados e Catálogo, Qualidade de Dados e Segurança de Dados se moveram enquanto você jogava. Cultura de Dados -- gestão da mudança e letramento -- não apareceu, porque nenhum simulador consegue medir se os seus colegas realmente aceitariam as decisões que você acabou de tomar. Esse pilar é onde a maioria dos programas de governança trava em silêncio."
      },
      metadata: {
        headline: "Quatro pilares respondidos. O quinto é o que ninguém nota até chegar uma auditoria.",
        body: "Fundamentos, Qualidade de Dados, Segurança de Dados e Cultura de Dados se moveram enquanto você jogava. Metadados e Catálogo -- documentação e linhagem -- não apareceu, e é o pilar que decide se alguém consegue responder de onde veio este número sem abrir uma investigação de três dias."
      }
    },

    weakest: {
      foundations: {
        headline: "Seu pilar mais fraco foi Fundamentos: estratégia, propriedade e papéis.",
        body: "Todos os outros pilares dependem deste. Regras de qualidade sem responsável definido são ignoradas, catálogos sem mandato ficam desatualizados e controles de segurança sem direitos de decisão viram fila de tickets. Se Fundamentos é o ponto fraco em um simulador, na organização real costuma soar mais alto."
      },
      metadata: {
        headline: "Seu pilar mais fraco foi Metadados e Catálogo: documentação e rastreabilidade.",
        body: "É o pilar que responde de onde veio este número. Sem ele cada pergunta vira uma investigação, a entrada de gente nova leva meses e o mesmo dataset é reconstruído três vezes porque ninguém achou o primeiro."
      },
      security: {
        headline: "Seu pilar mais fraco foi Segurança de Dados: proteção, privacidade e conformidade.",
        body: "É o único pilar da lista cujas falhas têm data, são públicas e custam caro. Também é o que mais se assume como problema de outro -- normalmente de TI -- até a revisão de acessos perguntar quem aprovou isso."
      },
      quality: {
        headline: "Seu pilar mais fraco foi Qualidade de Dados: medição, regras e monitoramento.",
        body: "Qualidade é do que as pessoas estão falando quando dizem que não confiam no dashboard. Dado sem confiança não deixa de ser usado: ele é silenciosamente substituído por uma planilha, e é assim que os números do comitê param de bater com os do warehouse."
      },
      culture: {
        headline: "Seu pilar mais fraco foi Cultura de Dados: gestão da mudança e letramento.",
        body: "É o pilar que decide se os outros quatro sobrevivem. Políticas chegam como recomendação que ninguém lê, ferramentas são compradas e não adotadas, e o time de governança acaba virando uma fila de aprovações. Também é o mais lento de corrigir, e é por isso que saber o seu nível agora importa."
      }
    },

    evidence: {
      "data-ownership-conflict": {
        master: function (c) {
          return "Você fechou com " + c.score + " pontos e " + c.correct + " de " + c.total + " acertos: identifica o papel responsável mais rápido que a maioria dos líderes de governança. O que deixa a pergunta cara do outro lado -- se a sua organização realmente atribui assim.";
        },
        practitioner: function (c) {
          return "Você fechou com " + c.score + " pontos, " + c.correct + " de " + c.total + " acertos. O que interessa está no padrão dos erros: decisões de propriedade quase nunca erram de forma aleatória, elas pendem para um lado.";
        },
        rookie: function (c) {
          return "Você fechou com " + c.score + " pontos, " + c.correct + " de " + c.total + " acertos. Vale saber: estes dez cenários são exatamente os que organizações reais discutem em reunião, então uma primeira partida intermediária é uma leitura, não um veredicto.";
        }
      },
      "data-governance-day-to-day": {
        leader: function (c) {
          return "Você terminou dez decisões com " + c.score + "% e o orçamento intacto: já governa como se a estrutura existisse. A lacuna que custa dinheiro está entre como você decidiu aqui e o que a sua organização deixaria você fazer na segunda-feira.";
        },
        reactive: function (c) {
          return "Você terminou dez decisões com " + c.score + "%. Esse é o perfil de quem sustenta as coisas na mão -- o que funciona, até ser a única coisa que as sustenta.";
        },
        firefighter: function (c) {
          return "Você terminou dez decisões com " + c.score + "%. Cada cenário deste simulador saiu de um backlog real, e apagar incêndio é como a falta de estrutura se sente por dentro, não uma falha pessoal.";
        }
      },
      "data-literacy": {
        champion: function (c) {
          return "Você acertou " + c.score + " de " + c.total + " perguntas entre vieses, risco de IA, analytics e cultura. Nesse nível o seu próprio letramento deixou de ser a restrição, e a distância entre você e o resto da organização passou a ser.";
        },
        strategist: function (c) {
          return "Você acertou " + c.score + " de " + c.total + " perguntas. Forte na maioria das competências, com uma ou duas que cederam sob pressão -- e são justamente as que aparecem nas decisões reais.";
        },
        tactical: function (c) {
          return "Você acertou " + c.score + " de " + c.total + " perguntas. Bom instinto operacional; os erros se concentraram onde o trabalho com dados deixa de ser técnico e passa a ser político.";
        },
        hoarder: function (c) {
          return "Você acertou " + c.score + " de " + c.total + " perguntas. Estas perguntas são construídas de propósito sobre as armadilhas que pegam gente experiente, então trate isso como um mapa de onde olhar, não como nota.";
        }
      }
    },

    misattribution: {
      it: "Seus erros penderam para um lado: trabalho que pertence ao negócio acabou em TI. É o erro de propriedade mais comum e mais caro que existe -- transforma um time técnico no responsável por decisões para as quais nunca recebeu autoridade.",
      business: "Seus erros penderam para um lado: a execução técnica acabou com os donos de negócio. Parece empoderamento e chega como mandato sem financiamento para gente que não tem as ferramentas para entregar.",
      steward: "Seus erros penderam para um lado: chegaram ao Data Steward decisões que exigiam autoridade de negócio ou propriedade técnica. A curadoria absorvendo tudo é como esse papel se queima.",
      generic: "Seus erros se espalharam pelos três papéis em vez de penderem para um, o que normalmente significa que o modelo de responsabilidades não está escrito em lugar nenhum."
    },

    contactMessage: function (c) {
      var lines = [];
      lines.push("Olá Sandy, acabei de terminar o simulador de " + c.simulatorLabel + (c.bandLabel ? " e saí como " + c.bandLabel : "") + ".");
      if (c.pillarLabel) {
        lines.push("O pilar que ele apontou para mim foi " + c.pillarLabel + ".");
      }
      lines.push("");
      lines.push("Gostaria de conversar sobre como isso fica no meu time. Um pouco de contexto sobre onde estamos:");
      lines.push("");
      return lines.join("\n");
    }
  };

  /* Role identifiers in the ownership simulator are the same untranslated
   * strings in all three languages ("Business Owner", "IT / Tech",
   * "Data Steward"), so the lean tally works without a per-locale table. */
  var ROLE_KEYS = {
    "IT / Tech": "it",
    "Business Owner": "business",
    "Data Steward": "steward"
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function clampPct(value) {
    if (typeof value !== "number" || !isFinite(value)) return null;
    return Math.max(0, Math.min(100, value));
  }

  /*
   * Reduce whatever a page hands over into {dimensionKey: 0-100}.
   *
   * Accepts the two shapes the simulators already keep in state: the Day-to-Day
   * metrics object of clamped 0-100 numbers, and the literacy categories object
   * of {correct, total} counters. Same permissiveness as categoryBreakdown in
   * simulator-leaderboard.js, and for the same reason -- the pages should not
   * have to reshape state to call this.
   */
  function normalizeDimensions(raw) {
    var out = {};
    if (!raw || typeof raw !== "object") return out;
    for (var key in raw) {
      if (!Object.prototype.hasOwnProperty.call(raw, key)) continue;
      var value = raw[key];
      var pct = null;
      if (typeof value === "number") {
        pct = clampPct(value);
      } else if (value && typeof value === "object" && typeof value.total === "number" && value.total > 0) {
        pct = clampPct((Number(value.correct) || 0) / value.total * 100);
      }
      if (pct !== null) out[key] = pct;
    }
    return out;
  }

  /*
   * Score the five pillars rather than the dimensions.
   *
   * The weighted sum is normalised by the weights that actually contributed, so
   * a pillar fed by one dimension and a pillar fed by two are on the same 0-100
   * scale and can be compared. `n` counts contributing dimensions and is kept
   * because it breaks ties better than an arbitrary rule: between two equally
   * low pillars, the one supported by more evidence is the more defensible
   * thing to put in a headline.
   */
  function pillarScoresFromDimensions(simulator, dimensions) {
    var weights = PILLAR_WEIGHTS[simulator];
    var acc = {};
    if (!weights) return acc;
    for (var dim in dimensions) {
      if (!Object.prototype.hasOwnProperty.call(dimensions, dim)) continue;
      var map = weights[dim];
      if (!map) continue;
      for (var pillar in map) {
        if (!Object.prototype.hasOwnProperty.call(map, pillar)) continue;
        var w = map[pillar];
        if (!acc[pillar]) acc[pillar] = { num: 0, den: 0, n: 0 };
        acc[pillar].num += dimensions[dim] * w;
        acc[pillar].den += w;
        acc[pillar].n += 1;
      }
    }
    var out = {};
    for (var key in acc) {
      if (!Object.prototype.hasOwnProperty.call(acc, key)) continue;
      if (acc[key].den <= 0) continue;
      out[key] = { pct: acc[key].num / acc[key].den, n: acc[key].n };
    }
    return out;
  }

  /* The ownership simulator has no dimensions, so pillars are scored from
   * per-scenario correctness via the scenario-id map. */
  function pillarScoresFromAnswers(answers) {
    var acc = {};
    if (!answers || !answers.length) return acc;
    for (var i = 0; i < answers.length; i++) {
      var answer = answers[i] || {};
      var pillar = OWNERSHIP_SCENARIO_PILLARS[answer.scenarioId];
      if (!pillar) continue;
      if (!acc[pillar]) acc[pillar] = { correct: 0, total: 0 };
      acc[pillar].total += 1;
      if (answer.isCorrect) acc[pillar].correct += 1;
    }
    var out = {};
    for (var key in acc) {
      if (!Object.prototype.hasOwnProperty.call(acc, key)) continue;
      out[key] = { pct: acc[key].correct / acc[key].total * 100, n: acc[key].total };
    }
    return out;
  }

  var MIN_EVIDENCE = 2;
  var SOFT_SPOT_CEILING = 80;
  var SOFT_SPOT_SPREAD = 10;

  function pickLowest(scores, candidates) {
    var best = null;
    for (var i = 0; i < PILLAR_ORDER.length; i++) {
      var key = PILLAR_ORDER[i];
      if (candidates.indexOf(key) === -1) continue;
      if (best === null) { best = key; continue; }
      var a = scores[key], b = scores[best];
      if (a.pct < b.pct - 0.0001) { best = key; continue; }
      if (Math.abs(a.pct - b.pct) <= 0.0001) {
        /* Equal scores: the pillar backed by more answers is the more
         * defensible one to name, and only if that is equal too does the
         * fixed order decide. */
        if (a.n > b.n) { best = key; continue; }
        if (a.n === b.n &&
            TIEBREAK_ORDER.indexOf(key) < TIEBREAK_ORDER.indexOf(best)) {
          best = key;
        }
      }
    }
    return best;
  }

  /*
   * The weakest measured pillar, or null when nothing was measured.
   *
   * Unmeasured pillars are not candidates -- calling a pillar weak because the
   * simulator never asked about it would be inventing a finding, and the people
   * who play these simulators are exactly the people who would catch it.
   *
   * Pillars resting on a single answer are also deprioritised whenever anything
   * better exists. In the ownership simulator, Metadata & Catalog is carried by
   * exactly one scenario out of ten, so without this rule one wrong click on the
   * catalog question outranks a genuine three-scenario weakness in Foundations
   * and becomes the headline. A pillar with one data point behind it is a
   * rounding error, not a diagnosis; it still gets shown in the meter with its
   * real number, it just does not get to be the finding.
   */
  function pickWeakest(scores) {
    var wellEvidenced = [];
    var all = [];
    for (var key in scores) {
      if (!Object.prototype.hasOwnProperty.call(scores, key)) continue;
      all.push(key);
      if (scores[key].n >= MIN_EVIDENCE) wellEvidenced.push(key);
    }
    if (wellEvidenced.length) return pickLowest(scores, wellEvidenced);
    return all.length ? pickLowest(scores, all) : null;
  }

  /*
   * Whether the weakest pillar is actually worth calling out.
   *
   * Someone who answers everything correctly still has a mathematically lowest
   * pillar, and telling a perfect scorer that their weakest pillar is
   * Foundations at 100% is the kind of detail that discredits the whole block.
   * A soft spot is claimed only when the pillar is genuinely low in absolute
   * terms AND clearly below the player best, so a flat, strong profile is
   * reported as what it is: no weak pillar, just one that was never measured.
   */
  function hasSoftSpot(scores, weakKey) {
    if (!weakKey || !scores[weakKey]) return false;
    var lo = scores[weakKey].pct;
    var hi = lo;
    for (var key in scores) {
      if (!Object.prototype.hasOwnProperty.call(scores, key)) continue;
      if (scores[key].pct > hi) hi = scores[key].pct;
    }
    return lo < SOFT_SPOT_CEILING && (hi - lo) >= SOFT_SPOT_SPREAD;
  }

  /*
   * Which way the ownership mistakes leaned.
   *
   * "You got 6 of 10" is a grade. "Your misses all sent business decisions to
   * IT" is a finding about how this person thinks, and it is the single most
   * personalised sentence anywhere in this file. Only claimed when one role
   * absorbs at least half of the misses and at least two of them, so a lean is
   * never asserted off a single wrong answer.
   */
  function ownershipLean(answers) {
    if (!answers || !answers.length) return null;
    var tally = { it: 0, business: 0, steward: 0 };
    var misses = 0;
    for (var i = 0; i < answers.length; i++) {
      var answer = answers[i] || {};
      if (answer.isCorrect) continue;
      misses += 1;
      var key = ROLE_KEYS[answer.selectedRole];
      if (key) tally[key] += 1;
    }
    if (misses < 2) return null;
    var leader = null;
    for (var role in tally) {
      if (!Object.prototype.hasOwnProperty.call(tally, role)) continue;
      if (leader === null || tally[role] > tally[leader]) leader = role;
    }
    if (leader === null || tally[leader] < 2) return null;
    return tally[leader] / misses >= 0.5 ? leader : "generic";
  }

  /*
   * Cross-simulator pillar coverage, kept in localStorage.
   *
   * Purely additive: it lets a returning visitor who has played two simulators
   * be told they have now touched all five pillars, which is a truer and more
   * inviting sentence than showing them a fourth incomplete meter. Every read
   * and write is wrapped, because localStorage throws rather than no-ops in
   * private-browsing modes and a storage exception must not take down the CTA.
   */
  function readCoverage() {
    try {
      var raw = window.localStorage.getItem(COVERAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  /*
   * Stash the run the visitor is looking at.
   *
   * The ?ctx= parameter on the contact link carries only three short keys,
   * because a URL carrying an emoji tier title is a URL people notice. The
   * simulator pages and the homepage are the same origin, so the readable
   * labels can travel through localStorage instead and the contact message gets
   * to say "and came out as 🏆 Data Ownership Master" without putting that in
   * the address bar.
   *
   * ?ctx= remains the trigger and the source of truth for which simulator: this
   * value is only trusted when the two agree, so a stale entry from last week
   * cannot describe a run the visitor did not just finish.
   */
  function writeLastRun(ctx, pillarKey) {
    try {
      window.localStorage.setItem(LAST_RUN_KEY, JSON.stringify({
        simulator: ctx.simulator,
        locale: ctx.locale,
        band: ctx.band,
        bandLabel: ctx.bandLabel || null,
        simulatorLabel: ctx.simulatorLabel || null,
        score: typeof ctx.score === "number" ? ctx.score : null,
        pillar: pillarKey || null
      }));
    } catch (error) {
      /* Private browsing. The contact link still works, it just arrives with the
       * generic labels from SIMULATOR_LABELS instead of this page's own. */
    }
  }

  function readLastRun() {
    try {
      var raw = window.localStorage.getItem(LAST_RUN_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function writeCoverage(scores, simulator) {
    try {
      var store = readCoverage();
      for (var key in scores) {
        if (!Object.prototype.hasOwnProperty.call(scores, key)) continue;
        store[key] = { pct: Math.round(scores[key].pct), simulator: simulator };
      }
      window.localStorage.setItem(COVERAGE_KEY, JSON.stringify(store));
      return store;
    } catch (error) {
      return scores;
    }
  }

  /*
   * Scorecard URL for a finished run.
   *
   * usp=pp_url comes first because that is the parameter Google Forms itself
   * emits on a pre-filled link and the one it looks for; the entry.* pairs carry
   * the run into the response row.
   *
   * The utm_* tags are appended for completeness and cost nothing, but they are
   * not the measurement story: Google Forms does not record query parameters
   * against a response, so nothing downstream can read them today. They matter
   * only if the Scorecard ever moves to a hosted page. The three entry.* fields
   * are the real instrumentation, which is why SCORECARD_ENTRY_IDS is worth
   * filling in.
   */
  function buildScorecardUrl(locale, ctx, pillarKey) {
    var base = SCORECARD_FORMS[locale] || SCORECARD_FORMS.es;
    var params = ["usp=pp_url"];
    var ids = SCORECARD_ENTRY_IDS[locale] || {};

    function add(entryId, value) {
      if (!entryId || value == null || value === "") return;
      params.push("entry." + entryId + "=" + encodeURIComponent(value));
    }
    add(ids.simulator, ctx.simulator);
    add(ids.band, ctx.bandLabel || ctx.band);
    add(ids.pillar, pillarKey || "");

    params.push("utm_source=simulator");
    params.push("utm_medium=results");
    params.push("utm_campaign=" + encodeURIComponent(ctx.simulator));
    params.push("utm_content=" + encodeURIComponent((ctx.band || "na") + "_" + (pillarKey || "na")));

    return base + "?" + params.join("&");
  }

  /* The homepage contact form reads ?ctx= and prefills the textarea from it, so
   * the visitor arrives with the run already described and only has to add
   * their own context. Dot-separated because no key here contains a dot. */
  function buildContactUrl(locale, ctx, pillarKey) {
    var path = CONTACT_PATHS[locale] || CONTACT_PATHS.es;
    var value = [ctx.simulator, ctx.band || "na", pillarKey || "na"].join(".");
    return SITE_ROOT + path + "?ctx=" + encodeURIComponent(value) + "#contacto";
  }

  /*
   * Styles are injected from here rather than added to assets/styles.css
   * because the nine simulator pages do not all load that stylesheet -- they are
   * self-contained Tailwind pages -- and a component that only renders on some
   * of them would be a trap for whoever edits it next. Everything is namespaced
   * under .sim-bridge and uses no Tailwind utilities, so the same markup renders
   * identically on all nine regardless of what else the page loads.
   */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      ".sim-bridge{--sb-deepblue:#003366;--sb-teal:#095b73;--sb-cyan:#65b7c7;--sb-orange:#e95d24;--sb-emerald:#50c878;",
      "background:linear-gradient(135deg,var(--sb-deepblue) 0%,var(--sb-teal) 100%);color:#f8fafc;border-radius:16px;",
      "padding:1.75rem;margin:0 0 1.5rem;text-align:left;box-shadow:0 10px 30px rgba(0,51,102,.25);",
      "font-family:inherit;line-height:1.6;}",

      ".sim-bridge__eyebrow{margin:0 0 .6rem;font-size:.72rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--sb-cyan);}",
      ".sim-bridge__headline{margin:0 0 .75rem;font-size:1.3rem;font-weight:800;line-height:1.3;color:#fff;}",
      ".sim-bridge__evidence{margin:0 0 .75rem;font-size:.95rem;color:#e2f1f5;}",
      ".sim-bridge__body{margin:0 0 1rem;font-size:.9rem;color:#c9dfe6;}",
      ".sim-bridge__lean{margin:0 0 1rem;padding:.7rem .9rem;font-size:.88rem;color:#f4e4d8;",
      "border-left:3px solid var(--sb-orange);background:rgba(233,93,36,.12);border-radius:0 8px 8px 0;}",

      ".sim-bridge__meter{list-style:none;margin:0 0 1.25rem;padding:0;display:grid;gap:.4rem;}",
      "@media(min-width:640px){.sim-bridge__meter{grid-template-columns:repeat(5,1fr);gap:.5rem;}}",
      ".sim-bridge__pillar{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:9px;padding:.55rem .6rem;}",
      ".sim-bridge__pillar-name{display:block;font-size:.7rem;font-weight:700;color:#fff;margin-bottom:.35rem;line-height:1.25;}",
      ".sim-bridge__track{height:4px;border-radius:999px;background:rgba(255,255,255,.16);overflow:hidden;}",
      ".sim-bridge__fill{display:block;height:100%;border-radius:999px;background:var(--sb-emerald);}",
      ".sim-bridge__pillar--weak .sim-bridge__fill{background:#f0b429;}",
      ".sim-bridge__pillar--weak{border-color:rgba(240,180,41,.55);background:rgba(240,180,41,.12);}",
      ".sim-bridge__pillar--blank{border-style:dashed;border-color:rgba(255,255,255,.3);background:transparent;}",
      ".sim-bridge__pillar--prior{border-color:rgba(101,183,199,.45);}",
      ".sim-bridge__pillar--prior .sim-bridge__fill{background:var(--sb-cyan);opacity:.75;}",
      ".sim-bridge__pillar--blank .sim-bridge__pillar-name{color:#a8c4cd;}",
      ".sim-bridge__pillar-note{display:block;font-size:.62rem;color:#a8c4cd;margin-top:.3rem;}",

      ".sim-bridge__cta{display:inline-block;background:var(--sb-orange);color:#fff;font-weight:800;font-size:.98rem;",
      "padding:.85rem 1.6rem;border-radius:999px;text-decoration:none;box-shadow:0 6px 18px rgba(233,93,36,.35);",
      "transition:transform .18s ease,box-shadow .18s ease;}",
      ".sim-bridge__cta:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(233,93,36,.45);color:#fff;}",
      /* A dark focus ring would vanish against this gradient, so the indicator
         is white with an orange offset -- same intent as --focus-ring-dark in
         assets/styles.css, inverted for a dark surface. */
      ".sim-bridge__cta:focus-visible,.sim-bridge__alt-link:focus-visible{outline:3px solid #fff;outline-offset:3px;}",
      ".sim-bridge__note{margin:.85rem 0 0;font-size:.76rem;color:#a8c4cd;max-width:52ch;}",
      ".sim-bridge__alt{margin:1.1rem 0 0;padding-top:.9rem;border-top:1px solid rgba(255,255,255,.14);font-size:.82rem;color:#a8c4cd;}",
      ".sim-bridge__alt-link{color:var(--sb-cyan);font-weight:700;text-decoration:underline;text-underline-offset:2px;}",
      ".sim-bridge__alt-link:hover{color:#fff;}",
      "@media(prefers-reduced-motion:reduce){.sim-bridge__cta{transition:none;}.sim-bridge__cta:hover{transform:none;}}"
    ].join("");
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  /*
   * The meter is the completion mechanic: five slots, and any one simulator can
   * only ever fill four of them. An unfinished set is harder to walk away from
   * than a finished one, which is why it renders even for a player who scored
   * perfectly.
   *
   * `prior` carries pillar readings from the visitor's earlier runs, so a pillar
   * this simulator cannot see still shows its real number if another simulator
   * measured it. Without that, a returning visitor was told "5 of 5 pillars
   * measured across your runs" directly above a chip stamped "not measured
   * here", which reads as a bug rather than as progress.
   */
  function renderMeter(copy, scores, weakKey, unmeasured, prior) {
    var items = [];
    for (var i = 0; i < PILLAR_ORDER.length; i++) {
      var key = PILLAR_ORDER[i];
      var name = escapeHtml(copy.pillars[key]);
      var entry = scores[key];
      var measuredNow = entry && unmeasured.indexOf(key) === -1;
      var priorEntry = !measuredNow && prior && prior[key] && typeof prior[key].pct === "number"
        ? prior[key] : null;

      var state, pct;
      if (measuredNow) {
        state = key === weakKey ? "weak" : "covered";
        pct = Math.round(entry.pct);
      } else if (priorEntry) {
        state = "prior";
        pct = Math.round(priorEntry.pct);
      } else {
        state = "blank";
        pct = null;
      }

      var cls = "sim-bridge__pillar" + (state === "covered" ? "" : " sim-bridge__pillar--" + state);
      var status = copy.status[state] || copy.status.covered;
      var inner = '<span class="sim-bridge__pillar-name">' + name + "</span>";
      if (pct === null) {
        inner += '<span class="sim-bridge__pillar-note">' + escapeHtml(status) + "</span>";
      } else {
        inner += '<span class="sim-bridge__track"><span class="sim-bridge__fill" style="width:' + pct + '%"></span></span>';
        inner += '<span class="sim-bridge__pillar-note">' + pct + "%</span>";
      }
      items.push('<li class="' + cls + '" aria-label="' + escapeHtml(copy.pillars[key] + ": " + status) + '">' + inner + "</li>");
    }
    return '<ul class="sim-bridge__meter" aria-label="' + escapeHtml(copy.ui.meterLabel) + '">' + items.join("") + "</ul>";
  }

  /*
   * render(ctx) -- called once at the end of a page's results function.
   *
   * ctx: {
   *   simulator     required, one of the three keys used in PILLAR_WEIGHTS /
   *                 OWNERSHIP_SCENARIO_PILLARS
   *   locale        required, "en" | "es" | "pt"
   *   band          required, the page's own band key ("master", "leader",
   *                 "champion", ...) so this block cannot contradict the profile
   *                 label already on screen
   *   bandLabel     optional display label, used in the prefilled messages
   *   simulatorLabel optional display name, used in the prefilled messages
   *   score         number shown in the evidence sentence
   *   correct/total optional counts for the evidence sentence
   *   dimensions    optional {key: 0-100} or {key: {correct,total}}
   *   answers       optional ownership answer array
   * }
   *
   * Everything after the slot lookup is wrapped: a thrown error here would mean
   * a visitor who just finished a simulator sees a broken results screen, and
   * the pre-existing CTA is a perfectly acceptable outcome by comparison. That
   * is also why the old CTA is hidden only after the new markup is in the DOM.
   */
  function render(ctx) {
    var slot = document.getElementById("simBridgeSlot");
    if (!slot || !ctx || !ctx.simulator) return;

    try {
      var locale = COPY[ctx.locale] ? ctx.locale : "es";
      var copy = COPY[locale];

      var scores = ctx.answers && ctx.answers.length
        ? pillarScoresFromAnswers(ctx.answers)
        : pillarScoresFromDimensions(ctx.simulator, normalizeDimensions(ctx.dimensions));

      var unmeasured = [];
      var declared = UNMEASURED[ctx.simulator] || [];
      for (var i = 0; i < PILLAR_ORDER.length; i++) {
        var key = PILLAR_ORDER[i];
        if (!scores[key] || declared.indexOf(key) !== -1) unmeasured.push(key);
      }

      /* focusKey is the pillar this block is willing to name in public: the
       * weakest one, but only when it is a real soft spot. Everything
       * user-visible keys off focusKey rather than weakKey, so a strong flat
       * profile never gets told it has a weak pillar. */
      /* If nothing was measured, there is no honest version of this block --
       * every headline here asserts that four pillars moved during the run.
       * Bail out and leave the page's own CTA standing, which is the correct
       * outcome for a call site passing the wrong state shape. */
      var measured = 0;
      for (var m in scores) {
        if (Object.prototype.hasOwnProperty.call(scores, m)) measured += 1;
      }
      if (!measured) {
        if (window.console && window.console.warn) {
          window.console.warn("SimulatorBridge: no pillar could be scored for " + ctx.simulator + "; leaving the existing CTA in place.");
        }
        return;
      }

      var weakKey = pickWeakest(scores);
      var focusKey = hasSoftSpot(scores, weakKey) ? weakKey : null;

      /* Which block leads. Coverage mode needs a blank pillar it has copy for;
       * if a page ever starts measuring that pillar, this falls through to the
       * weakest-pillar block rather than printing a stale claim. Weakest mode
       * falls the other way for a player with no soft spot -- the honest lead
       * for someone who aced it is the pillar nobody measured. */
      var mode = HEADLINE_MODE[ctx.simulator] === "coverage" ? "coverage" : "weakest";
      var block = null;
      if (mode === "weakest" && focusKey) block = copy.weakest[focusKey];
      if (!block) {
        for (var j = 0; j < unmeasured.length; j++) {
          if (copy.coverage[unmeasured[j]]) { block = copy.coverage[unmeasured[j]]; break; }
        }
      }
      if (!block && focusKey) block = copy.weakest[focusKey];
      if (!block) block = copy.coverage.culture;

      var evidenceGroup = copy.evidence[ctx.simulator] || {};
      var evidenceFn = evidenceGroup[ctx.band];
      var evidence = null;
      if (typeof evidenceFn === "function") {
        evidence = evidenceFn({
          score: ctx.score,
          correct: ctx.correct,
          total: ctx.total
        });
      }

      var lean = ctx.answers && ctx.answers.length ? ownershipLean(ctx.answers) : null;
      var leanText = lean ? copy.misattribution[lean] : null;

      /* Coverage is merged across simulators before the eyebrow is written, so a
       * returning visitor is told they have completed the set rather than shown
       * a fourth partial meter. */
      var measuredCount = PILLAR_ORDER.length - unmeasured.length;

      /* Read before write: once this run is merged in, there is no way left to
       * tell which readings came from an earlier simulator. */
      var prior = readCoverage();
      var store = writeCoverage(scores, ctx.simulator);
      var storedCount = 0;
      for (var s in store) {
        if (Object.prototype.hasOwnProperty.call(store, s) && PILLAR_ORDER.indexOf(s) !== -1) storedCount += 1;
      }
      var completedElsewhere = storedCount === PILLAR_ORDER.length && measuredCount < PILLAR_ORDER.length;

      var eyebrow = completedElsewhere ? copy.ui.eyebrowComplete : copy.ui.eyebrow(measuredCount);

      var scorecardUrl = buildScorecardUrl(locale, ctx, focusKey);
      var contactUrl = buildContactUrl(locale, ctx, focusKey);

      /*
       * block.headline and block.body are the only strings inserted unescaped,
       * because they are module constants above that intentionally contain
       * &amp; entities. Everything else -- the evidence line, the lean line, the
       * pillar names, the URLs -- goes through escapeHtml, since those either
       * interpolate numbers handed over by the page or end up inside an
       * attribute. Nothing on this path carries visitor-typed input: the player
       * name is rendered by simulator-leaderboard.js, not here.
       */
      var html = [];
      html.push('<div class="sim-bridge" role="group" aria-label="' + escapeHtml(copy.ui.meterLabel) + '">');
      html.push('<p class="sim-bridge__eyebrow">' + escapeHtml(eyebrow) + "</p>");
      html.push('<h3 class="sim-bridge__headline">' + block.headline + "</h3>");
      if (evidence) html.push('<p class="sim-bridge__evidence">' + escapeHtml(evidence) + "</p>");
      if (leanText) html.push('<p class="sim-bridge__lean">' + escapeHtml(leanText) + "</p>");
      html.push('<p class="sim-bridge__body">' + block.body + "</p>");
      html.push(renderMeter(copy, scores, focusKey, unmeasured, prior));
      if (completedElsewhere && unmeasured.length) {
        html.push('<p class="sim-bridge__body">' + escapeHtml(copy.ui.returning(copy.pillars[unmeasured[0]])) + "</p>");
      }
      html.push('<a class="sim-bridge__cta" href="' + escapeHtml(scorecardUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(copy.ui.cta) + "</a>");
      html.push('<p class="sim-bridge__note">' + escapeHtml(copy.ui.note) + "</p>");
      html.push('<div class="sim-bridge__alt">' + escapeHtml(copy.ui.altPrefix) + ' <a class="sim-bridge__alt-link" href="' + escapeHtml(contactUrl) + '">' + escapeHtml(copy.ui.altLink) + "</a></div>");
      html.push("</div>");

      injectStyles();
      slot.innerHTML = html.join("");
      writeLastRun(ctx, focusKey);

      /* Only now that the replacement is on screen does the old CTA go away, so
       * a failure above leaves the visitor with the CTA the page shipped with. */
      var superseded = document.querySelectorAll("[data-sim-bridge-replaces]");
      for (var k = 0; k < superseded.length; k++) {
        superseded[k].style.display = "none";
      }
    } catch (error) {
      /* Deliberately silent in the UI. The console line is for whoever is
       * editing a call site and passing the wrong state shape. */
      if (window.console && window.console.warn) {
        window.console.warn("SimulatorBridge: render skipped", error);
      }
    }
  }

  /*
   * contactPrefill(ctxValue, locale) -- the homepage end of the bridge.
   *
   * Turns the ?ctx=simulator.band.pillar value on an inbound contact link into
   * the text that goes in the message box. Returns null for anything it does not
   * recognise, so a hand-edited or truncated URL leaves the form untouched
   * rather than filling it with placeholders.
   *
   * The stored run is only consulted when its simulator matches the one named in
   * the URL. That check is the whole reason it is safe to read: without it, a
   * visitor who played last month and later clicked a bare contact link would
   * get a message describing a run they no longer remember.
   */
  function contactPrefill(ctxValue, locale) {
    if (!ctxValue) return null;
    var parts = String(ctxValue).split(".");
    var simulator = parts[0];
    var labels = SIMULATOR_LABELS[locale] || SIMULATOR_LABELS.es;
    if (!labels[simulator]) return null;

    var band = parts[1] && parts[1] !== "na" ? parts[1] : null;
    var pillar = parts[2] && parts[2] !== "na" ? parts[2] : null;
    var copy = COPY[locale] || COPY.es;

    var stored = readLastRun();
    var trusted = stored && stored.simulator === simulator ? stored : null;

    return {
      subject: CONTACT_SUBJECT + ": " + labels[simulator],
      message: copy.contactMessage({
        simulatorLabel: (trusted && trusted.simulatorLabel) || labels[simulator],
        bandLabel: trusted && trusted.bandLabel ? trusted.bandLabel : null,
        pillarLabel: pillar && copy.pillars[pillar] ? copy.pillars[pillar] : null
      }),
      simulator: simulator,
      band: band,
      pillar: pillar
    };
  }

  window.SimulatorBridge = {
    render: render,
    contactPrefill: contactPrefill,
    /* Exposed for reasoning about the mapping without replaying a whole game --
     * the pillar scores are the part most likely to need checking after a
     * scenario is reworded or a metric is rebalanced. */
    pillarScoresFromAnswers: pillarScoresFromAnswers,
    pillarScoresFromDimensions: pillarScoresFromDimensions,
    normalizeDimensions: normalizeDimensions,
    pickWeakest: pickWeakest,
    hasSoftSpot: hasSoftSpot,
    ownershipLean: ownershipLean,
    buildScorecardUrl: buildScorecardUrl,
    PILLAR_ORDER: PILLAR_ORDER
  };
})();
