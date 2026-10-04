/*
 * The CDMP practice question bank: 100 DAMA-DMBOK2 questions, in English only.
 *
 * Shared by the three /simulators/<lang>/cdmp-exam-practice/ pages instead of
 * being inlined in each of them, which is the one place this site's simulators
 * break their own rule about carrying their whole app inline. The reason is the
 * content: the CDMP exam is sat in English, so the Spanish and Portuguese pages
 * ask the same questions with the same answer options, word for word, and the
 * only thing that differs between the three pages is the wording around them.
 * Three copies of an identical 100-question bank would be three chances for a
 * correction to land in one language and not the other two -- and a wrong answer
 * key is the one defect a certification drill cannot ship.
 *
 * A classic <script>, like every other file the simulators load, so the pages
 * stay module-free and their inline logic can read the bank synchronously.
 *
 * Each entry:
 *   id          stable identifier, area-prefixed; the run breakdown is keyed by
 *               dimension rather than by id, so this is for traceability
 *   area        DMBOK knowledge area, shown on the question card
 *   chapter     the DMBOK2 chapter the area belongs to
 *   prompt      the question, as the exam would phrase it
 *   options     five answer options; exactly one is correct
 *   correct     index into options
 *   dmbokRef    chapter and section a candidate can go and read
 *   explanation why the correct option is correct
 *
 * Not rewritable per private space, unlike the scenario wording in the other
 * simulators: netlify/lib/scenario-fields.mjs deliberately leaves this
 * simulator out, because a client editing certification questions would be
 * editing the scoring key of an exam they do not set.
 */
(function () {
  "use strict";

  /*
   * Which of the five scored dimensions each knowledge area reports on.
   *
   * Seventeen areas collapse into five because a ten-question run touches at
   * most ten areas, and a breakdown with seventeen keys of which seven are
   * empty tells a facilitator nothing. The five keys are the ones
   * assets/js/simulator-analysis.mjs maps onto Scorecard pillars, so a run
   * published from this page can be read in the same room report as a run from
   * any other simulator.
   */
  var AREA_DIMENSIONS = {
    "Data Management": "foundations",
    "Data Governance": "foundations",
    "Organization & Roles": "foundations",
    "Maturity Assessment": "foundations",
    "Data Culture & Literacy": "foundations",
    "Data Ethics": "security",
    "Data Security": "security",
    "Data Architecture": "architecture",
    "Data Modeling & Design": "architecture",
    "Data Storage & Operations": "architecture",
    "Data Integration": "architecture",
    "Data Warehousing & BI": "architecture",
    "Big Data & Data Science": "architecture",
    "Metadata Management": "metadata",
    "Document & Content": "metadata",
    "Reference & Master Data": "metadata",
    "Data Quality": "quality"
  };

  var QUESTIONS = [
    {
      id: "DMBOK-DM-01",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "According to DAMA-DMBOK2, which principle underpins the fundamental distinction between data management and other IT asset management disciplines?",
      options: [
        "Data is an asset with unique properties: it is not used up when consumed and can be shared at once.",
        "Data should be valued and depreciated like other tangible assets, using standard balance-sheet schedules.",
        "Data management is primarily a technology concern, so ownership of data should sit with the IT department.",
        "Data is a by-product of applications, so it is best managed through application portfolio management.",
        "Data has value only while in active operational use, so its lifecycle management ends once it is archived."
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 1, Section 2.3 (\"Data as an Organizational Asset\")",
      explanation: "Data is an organizational asset with unique characteristics: it is not consumed or depleted when used, can be shared simultaneously by multiple processes, and requires continuous lifecycle stewardship."
    },
    {
      id: "DMBOK-DM-02",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "In Peter Aiken's DMBOK Pyramid, which knowledge areas form Phase 1, the foundation an organization typically builds first when it acquires an application with database capabilities?",
      options: [
        "Data Modeling & Design, Data Storage & Operations, Data Security, and Data Integration & Interoperability",
        "Data Governance, Data Quality and Data Architecture, stabilised before any application is put in place",
        "Reference & Master Data, Data Warehousing & BI, and Document & Content Management",
        "Data Quality, supported by reliable Metadata and a consistent Data Architecture",
        "Big Data and Data Science, built directly on the purchased application's database"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 1, Section 3.4 (\"DMBOK Pyramid (Aiken)\", Figure 4)",
      explanation: "Aiken's pyramid describes how organizations typically evolve. Phase 1: buying an application gives a starting point for data modeling & design, data storage, and data security, and making it work with other systems requires data integration & interoperability. Phase 2: using the application exposes data quality problems, whose management depends on reliable metadata and consistent data architecture. Phase 3: disciplined quality, metadata and architecture practices require data governance. Phase 4: the organization can then leverage advanced practices such as master data, data warehousing & BI, document & content management, and big data/data science."
    },
    {
      id: "DMBOK-DM-03",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "Which framework models strategic alignment by connecting Business Strategy, IT Strategy, Organizational Infrastructure, and IT Infrastructure across both functional integration and strategic fit?",
      options: [
        "The Henderson and Venkatraman Strategic Alignment Model",
        "The Zachman Framework for Enterprise Architecture (6x6 matrix)",
        "The TOGAF Architecture Development Method (ADM)",
        "The CMMI Data Management Maturity (DMM) Model",
        "The DAMA-DMBOK Functional Framework (DAMA Wheel)"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 1, Section 3.1 (\"Strategic Alignment Model\")",
      explanation: "The Strategic Alignment Model (Henderson and Venkatraman) identifies four fundamental domains: Business Strategy, IT Strategy, Organizational Infrastructure, and IT Infrastructure."
    },
    {
      id: "DMBOK-DM-04",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "How does the Amsterdam Information Model (AIM) extend the classic Henderson and Venkatraman Strategic Alignment Model?",
      options: [
        "By adding a Data Governance layer beneath the Strategy, Structure and Operations rows of the model.",
        "By adding a middle \"Information and Communication\" column between Business and Technology.",
        "By replacing strategic fit with a single maturity scale measured through a capability maturity model.",
        "By splitting IT Infrastructure into separate Data Architecture and Application Architecture domains.",
        "By adding Planner, Owner, Designer and Builder perspective rows, as in the Zachman framework."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 1, Section 3.2 (\"The Amsterdam Information Model\")",
      explanation: "The Amsterdam Information Model extends the Strategic Alignment Model by adding a middle column, Information and Communication, between the business and technology columns, so that information management is treated as a concern in its own right rather than folded into IT."
    },
    {
      id: "DMBOK-DM-05",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "What is the primary objective of formulating a formal Enterprise Data Strategy according to DMBOK2?",
      options: [
        "To define the detailed physical database standards that every development project must follow.",
        "To align data management priorities, capabilities and investments with business goals.",
        "To document the current-state inventory of systems, interfaces and data stores across the enterprise.",
        "To set the technology roadmap, including the choice of DBMS, cloud and integration platforms.",
        "To replace the data governance charter as the document that assigns data decision rights."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 1, Section 2.6 (\"Data Management Strategy\")",
      explanation: "A Data Management Strategy sets the roadmap to develop data capabilities that directly support and accelerate enterprise business goals and outcomes."
    },
    {
      id: "DMBOK-DM-06",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "In the DAMA Wheel framework, which knowledge area is positioned at the central epicenter supporting all other disciplines?",
      options: [
        "Data Architecture",
        "Data Quality Management",
        "Data Governance",
        "Metadata Management",
        "Reference and Master Data Management"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 1, Section 3.3 (\"The DAMA-DMBOK Framework - Wheel\")",
      explanation: "Data Governance occupies the center of the DAMA Wheel because it provides the cross-functional oversight, policies, and decision rights necessary across all other 10 knowledge areas."
    },
    {
      id: "DMBOK-DM-07",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "Which environmental element in the DAMA Context Diagram represents the measurable end-products produced by data management activities?",
      options: [
        "Inputs",
        "Deliverables",
        "Suppliers",
        "Consumers",
        "Business Drivers"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 1, Section 3.3 (\"Context Diagram - Environmental Elements\")",
      explanation: "Deliverables are the tangible work products (databases, data models, policies, architectures) produced by activities in each Knowledge Area."
    },
    {
      id: "DMBOK-ETH-01",
      area: "Data Ethics",
      chapter: "Chapter 2: Data Handling Ethics",
      prompt: "Which ethical principle in DMBOK2 emphasizes that individuals must be notified about what data is captured about them and have a voice in how it is used?",
      options: [
        "Purpose Limitation",
        "Notice and Consent",
        "Data Minimisation and Proportionality",
        "Storage Limitation",
        "Accountability"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 2, Section 3.2 (\"Principles Behind Data Privacy Law\")",
      explanation: "Data privacy principles worldwide and DMBOK2 emphasize Transparency, Fair Processing, and Notice/Consent, ensuring individuals understand and agree to data collection."
    },
    {
      id: "DMBOK-ETH-02",
      area: "Data Ethics",
      chapter: "Chapter 2: Data Handling Ethics",
      prompt: "In data ethics and predictive modeling, what is \"Proxy Bias\"?",
      options: [
        "Selecting a sample that over-represents some groups, so results do not reflect the whole population.",
        "Using a seemingly neutral variable that correlates with a protected attribute, e.g. postcode for race.",
        "Collecting data only to support a result decided in advance, then presenting it as objective evidence.",
        "Searching the data until it confirms an analyst's hunch, while ignoring evidence that contradicts it.",
        "Reusing data collected for one purpose for an unrelated purpose without the data subjects' consent."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 2, Section 3.4 (\"Risks of Unethical Data Handling Practices\") & Bad Data Handbook",
      explanation: "Proxy bias occurs when an ostensibly neutral variable (such as postal code) serves as a proxy for protected classes like race, socioeconomic status, or religion."
    },
    {
      id: "DMBOK-ETH-03",
      area: "Data Ethics",
      chapter: "Chapter 2: Data Handling Ethics",
      prompt: "Which global privacy regulation codifies the \"Right to be Forgotten\" (Data Erasure) and mandatory Data Protection Impact Assessments (DPIAs)?",
      options: [
        "Sarbanes-Oxley Act (SOX)",
        "General Data Protection Regulation (GDPR)",
        "Health Insurance Portability and Accountability Act (HIPAA)",
        "Payment Card Industry Data Security Standard (PCI-DSS)",
        "Gramm-Leach-Bliley Act (GLBA)"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 2, Section 3.2 (\"Principles Behind Data Privacy Law\")",
      explanation: "GDPR introduced rigorous individual rights including the Right to Erasure, Right of Access, and requirements for Data Protection Impact Assessments."
    },
    {
      id: "DMBOK-ETH-04",
      area: "Data Ethics",
      chapter: "Chapter 2: Data Handling Ethics",
      prompt: "According to DMBOK2, why is legal compliance insufficient for ensuring comprehensive ethical data handling?",
      options: [
        "Laws apply only within one jurisdiction, so global firms must follow a single ethics code instead.",
        "Laws set a minimum standard; ethics asks what is right even where the law is silent.",
        "Compliance covers only data security, whereas ethics covers data quality and accuracy.",
        "Compliance is the job of the legal team, while ethics is the sole responsibility of data stewards.",
        "Regulators accept ethical intent as a defence, so an ethics policy can stand in for compliance."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 2, Section 1 (\"Introduction to Data Handling Ethics\")",
      explanation: "Ethics goes beyond compliance: legality represents the minimum acceptable bar, whereas ethical data handling requires doing what is socially and morally responsible."
    },
    {
      id: "DMBOK-ETH-05",
      area: "Data Ethics",
      chapter: "Chapter 2: Data Handling Ethics",
      prompt: "What is the primary danger of \"Dark Patterns\" in website and user experience design from an ethical standpoint?",
      options: [
        "They collect data silently through cookies and trackers, with no user interface involved at all.",
        "They trick users into sharing personal data or granting consent they did not intend to give.",
        "They expose personal data to attackers by leaving web forms and sessions unencrypted.",
        "They profile users in ways that let algorithms discriminate against protected groups.",
        "They hide data quality defects from users by displaying cached or stale information."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 2, Section 3.3 (\"Online Data in an Ethical Context\")",
      explanation: "Dark patterns deliberately manipulate user interfaces to deceive users into yielding personal data or consenting to tracking without clear awareness."
    },
    {
      id: "DMBOK-ETH-06",
      area: "Data Ethics",
      chapter: "Chapter 2: Data Handling Ethics",
      prompt: "Which role in modern organizations is specifically tasked with championing ethical data practices and ensuring compliance with privacy statutes?",
      options: [
        "Chief Information Security Officer (CISO)",
        "Data Protection Officer (DPO)",
        "Enterprise Data Architect",
        "Technical Data Steward",
        "Database Administrator (DBA)"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 2, Section 3.5 (\"Establishing an Ethical Data Culture\")",
      explanation: "The Data Protection Officer (DPO) oversees data protection strategy, ensures privacy compliance, and acts as the liaison with regulatory authorities."
    },
    {
      id: "DMBOK-ETH-07",
      area: "Data Ethics",
      chapter: "Chapter 2: Data Handling Ethics",
      prompt: "What constitutes an ethical \"Data Handling Culture\" across an organization according to DMBOK2?",
      options: [
        "A code of conduct signed by staff each year, which serves as the organization's main ethics control.",
        "Ongoing training, transparent practices, bias checks, and leaders who treat trust as a core value.",
        "Delegating all ethical review to the legal team, which checks each project for regulatory compliance.",
        "Strong access controls and encryption, since data security alone ensures ethical data handling.",
        "Appointing a DPO who carries sole accountability for ethical decisions on behalf of the firm."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 2, Section 3.5 (\"Establishing an Ethical Data Culture\")",
      explanation: "An ethical data culture requires intentional training, accountability, governance review boards, and valuing consumer trust over short-term exploitation."
    },
    {
      id: "DMBOK-DG-01",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "According to DMBOK2, which body is the primary and highest authority for data governance in an organization, responsible for oversight, support and funding of data governance activities?",
      options: [
        "Data Governance Steering Committee",
        "Data Governance Council (DGC)",
        "Data Governance Office (DGO)",
        "Data Stewardship Team",
        "Local (business unit) Data Governance Committee"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 3, Section 1.3 (\"Data Governance Organization Parts\", Table 2)",
      explanation: "DMBOK2 describes the Data Governance Steering Committee, made up of senior executives, as the primary and highest authority for data governance, responsible for oversight, support and funding. The Data Governance Council manages governance initiatives (such as developing policies and metrics), issues and escalations; the Data Governance Office focuses on enterprise-level data definitions and standards; stewardship teams and local committees work within a subject area or business unit."
    },
    {
      id: "DMBOK-DG-02",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "What is the primary responsibility of a Business Data Steward in DAMA DMBOK2 and John Ladley's governance frameworks?",
      options: [
        "The IT professional who maintains data structures, ETL jobs and database operations for a domain.",
        "The business SME accountable for the definitions, quality rules and proper use of a domain's data.",
        "The senior executive who holds overall decision rights over data for the enterprise as a whole.",
        "The coordinator who leads stewardship teams and acts as their liaison to the Data Governance Council.",
        "The steward who oversees one data domain across every business function that uses that data."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 3, Section 1.3 (\"Essential Concepts - Stewardship\") & Ladley Ch. 3",
      explanation: "Business Data Stewards represent business domains, defining official terminology, setting data quality expectations, approving access, and resolving ambiguities."
    },
    {
      id: "DMBOK-DG-03",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "Which governance operating model federates authority between centralized policy-setting committees and decentralized business domain stewards?",
      options: [
        "Centralized operating model",
        "Federated / Hybrid model",
        "Replicated operating model",
        "Decentralized operating model",
        "Network operating model"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 3, Section 2.6 & Chapter 16, Section 3 (\"Operating Models\")",
      explanation: "A Federated or Hybrid model provides enterprise-wide policy consistency while allowing business domain units to execute stewardship autonomously."
    },
    {
      id: "DMBOK-DG-04",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "What core artifact documents authoritative business terms, standardized definitions, synonyms, and assigned stewards across the enterprise?",
      options: [
        "The enterprise business glossary",
        "The physical data dictionary",
        "The enterprise conceptual data model",
        "The reference data code set catalog",
        "The data lineage and impact map"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 3, Section 2.14 (\"Develop a Business Glossary\")",
      explanation: "The Business Glossary is the core deliverable that establishes a common business vocabulary, definitions, and domain stewardship across the entire organization."
    },
    {
      id: "DMBOK-DG-05",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "According to John Ladley and DMBOK2, what is the key distinction between Data Governance and Data Management?",
      options: [
        "Governance holds decision rights and oversight over data; management executes the work.",
        "Governance is a business function and management an IT function, so each owns separate data assets.",
        "Governance defines the data architecture; management implements that architecture in physical databases.",
        "Governance is a time-bound project to fix data quality; management is the ongoing program that follows.",
        "Governance is the umbrella discipline; management is one of the knowledge areas that it contains."
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 3, Section 1.3 & Ladley Chapter 2 (\"Definitions and Concepts\")",
      explanation: "Governance focuses on establishing decision rights, policies, rules, and oversight (\"doing the right things\"), while management executes operations (\"doing things right\")."
    },
    {
      id: "DMBOK-DG-06",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "Which office serves as the operational focal point, coordinating data stewardship meetings, tracking metrics, and facilitating policy rollout?",
      options: [
        "Data Governance Office (DGO)",
        "Data Governance Steering Committee",
        "Data Stewardship Team",
        "Local Data Governance Committee",
        "Architecture Review Board (ARB)"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 3, Section 1.3 (\"Data Governance Organization Parts\") & Section 2.6 (\"Operating Framework\")",
      explanation: "The Data Governance Office (DGO) runs the day-to-day machinery of governance: it focuses on enterprise-level data definitions and standards, coordinates data stewards and their meetings, tracks metrics, and supports the rollout of policies."
    },
    {
      id: "DMBOK-DG-07",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "In Data Governance issue management, what is the defined path for issues that cannot be resolved at the stewardship level?",
      options: [
        "Escalate it to the Data Governance Council for a decision",
        "Pass it to the DBA team to resolve through a schema change",
        "Refer it to Internal Audit for a formal compliance ruling",
        "Let each business unit keep its own definition locally",
        "Record both terms in the glossary as synonyms and close it"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 3, Section 2.10 (\"Engage in Issue Management\")",
      explanation: "Unresolved cross-departmental data conflicts or policy disputes escalate through the Data Governance Council for final binding arbitration."
    },
    {
      id: "DMBOK-DG-08",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "Which metric best demonstrates the business value and impact of a Data Governance program to executive leadership?",
      options: [
        "The number of data policies and standards approved by the Data Governance Council during the year.",
        "Fewer compliance issues, better quality on critical data elements, and lower rework costs.",
        "The number of data stewards appointed and their attendance rate at stewardship meetings.",
        "The count of business terms defined, approved and published in the enterprise glossary.",
        "The number of tools deployed, such as data catalogs, profiling engines and MDM hubs."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 3, Section 5 (\"Metrics\") & Ladley Chapter 9",
      explanation: "Executive leadership measures governance by tangible business outcomes: reduced operational errors, lower compliance risk, and faster analytical onboarding."
    },
    {
      id: "DMBOK-DA-01",
      area: "Data Architecture",
      chapter: "Chapter 4: Data Architecture",
      prompt: "Which artifact represents an enterprise-wide view of the major subject areas and business concepts, entirely independent of technology and software constraints?",
      options: [
        "Enterprise-wide physical data model (all schemas)",
        "Enterprise Conceptual Data Model (ECDM)",
        "Data flow (lineage) diagram",
        "Canonical message model",
        "Application-to-entity CRUD matrix"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 4, Section 1.3 & Chapter 5 (\"Data Modeling and Design\")",
      explanation: "An Enterprise Conceptual Data Model (ECDM) provides a high-level representation of core enterprise business concepts (e.g., Party, Product, Agreement) without technical bias."
    },
    {
      id: "DMBOK-DA-02",
      area: "Data Architecture",
      chapter: "Chapter 4: Data Architecture",
      prompt: "In modern distributed data architectures (as detailed by Strengholt in Data Management at Scale and DMBOK2), what is the core premise of \"Domain-Driven Data Architecture\"?",
      options: [
        "All data is consolidated into one enterprise warehouse governed by a central data team.",
        "Data is treated as a product, owned and governed by the domain teams closest to the business.",
        "A single canonical model is enforced so that every domain shares identical entity definitions.",
        "Domains are defined by technology platform, with one team owning each database engine.",
        "Raw data from all domains lands in a shared data lake, with schemas applied on read."
      ],
      correct: 1,
      dmbokRef: "Strengholt Chapter 2 (\"Organizing Data Using Data Domains\") & DMBOK2 Ch. 4",
      explanation: "Domain-driven data architectures decentralize data ownership to domain teams who know the data best, packaging reliable data products with bounded contexts."
    },
    {
      id: "DMBOK-DA-03",
      area: "Data Architecture",
      chapter: "Chapter 4: Data Architecture",
      prompt: "What is a \"Data Flow Diagram\" (or Data Lineage Flow) in Enterprise Data Architecture?",
      options: [
        "A diagram of the entities in a subject area and the relationships between them.",
        "A diagram of how data moves from source systems through transformations to consumers.",
        "A matrix showing which business processes create, read, update or delete each entity.",
        "A diagram of the states an entity passes through, such as prospect, customer and former customer.",
        "A diagram of business processes and the sequence of tasks performed by each role."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 4, Section 1.3.1 (\"Data Flows\")",
      explanation: "Data Flow diagrams map how data travels from source systems through intermediate transformation stores into end-user analytical dashboards."
    },
    {
      id: "DMBOK-DA-04",
      area: "Data Architecture",
      chapter: "Chapter 4: Data Architecture",
      prompt: "In the Zachman Framework for Enterprise Architecture, what does the \"Data / What\" column represent across perspective rows (Planner, Owner, Designer, Builder)?",
      options: [
        "The business processes and functions, refined from value chains down to program code.",
        "Data, refined from business concepts in the top rows down to physical data structures.",
        "The locations and network nodes where the business operates and systems are deployed.",
        "The business events and cycles, refined from master schedules down to timing definitions.",
        "The goals and business rules, refined from strategy down to detailed rule specifications."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 4, Section 1.3 (\"Enterprise Architecture Frameworks\")",
      explanation: "In the Zachman framework, the \"What\" column corresponds to Data, moving from high-level business concepts (Planner/Owner) to physical data models (Designer/Builder)."
    },
    {
      id: "DMBOK-DA-05",
      area: "Data Architecture",
      chapter: "Chapter 4: Data Architecture",
      prompt: "What constitutes an Enterprise Data Architecture \"Target State\"?",
      options: [
        "The documented current state of the systems, data stores and interfaces now in production.",
        "The future-state blueprint of models, systems and flows that supports long-term strategy.",
        "The roadmap of transition projects that moves the organization from one architecture to the next.",
        "The gap analysis comparing current capabilities with industry maturity benchmarks.",
        "The physical design of one project's database, as approved by the architecture review board."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 4, Section 2.1 (\"Establish Data Architecture Practice\")",
      explanation: "The Target State defines the idealized, forward-looking architectural roadmap that bridges current technical gaps to satisfy business strategy."
    },
    {
      id: "DMBOK-DA-06",
      area: "Data Architecture",
      chapter: "Chapter 4: Data Architecture",
      prompt: "Which practice assesses architectural divergence and approves changes to enterprise data models and blueprints?",
      options: [
        "Architecture governance via a review board (ARB)",
        "Data quality monitoring against agreed quality thresholds",
        "Change Advisory Board approval of production deployments",
        "Metadata lineage and impact analysis reporting",
        "Data stewardship review and approval of glossary terms"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 4, Section 6 (\"Data Architecture Governance\")",
      explanation: "Architecture Governance uses review boards to evaluate projects against enterprise standards, prevent technical debt, and ensure roadmap alignment."
    },
    {
      id: "DMBOK-DA-07",
      area: "Data Architecture",
      chapter: "Chapter 4: Data Architecture",
      prompt: "What is a \"Canonical Data Model\" commonly utilized for in enterprise architecture?",
      options: [
        "The single physical schema that every application must adopt for its own database.",
        "A common format that applications map to and from, reducing point-to-point interfaces.",
        "A model of the enterprise's core subject areas, used to scope data governance work.",
        "The master data record selected as the trusted golden version of a business entity.",
        "A set of conformed dimensions shared across the data marts of an enterprise warehouse."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 4 & Chapter 8, Section 1.3 (\"Canonical Models\") & Strengholt Ch. 5",
      explanation: "A canonical data model provides a shared intermediate structure, simplifying enterprise messaging and API integration by avoiding N*(N-1) point-to-point interfaces."
    },
    {
      id: "DMBOK-MOD-01",
      area: "Data Modeling & Design",
      chapter: "Chapter 5: Data Modeling and Design",
      prompt: "In relational database normalization, what condition must be met for a relational entity to satisfy Third Normal Form (3NF)?",
      options: [
        "It is in 2NF and no non-key attribute depends on another non-key attribute.",
        "Every attribute holds a single atomic value and there are no repeating groups.",
        "It is in 1NF and every non-key attribute depends on the whole of the primary key.",
        "It contains no independent multi-valued facts about the same key.",
        "Each entity has a single-attribute surrogate key and no composite keys."
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 5, Section 1.3.5 (\"Normalization\")",
      explanation: "Third Normal Form (3NF) requires 2NF compliance and guarantees that no non-key attribute transitively depends on another non-key attribute."
    },
    {
      id: "DMBOK-MOD-02",
      area: "Data Modeling & Design",
      chapter: "Chapter 5: Data Modeling and Design",
      prompt: "In Kimball dimensional modeling, what characterizes a \"Conformed Dimension\"?",
      options: [
        "A dimension used only within one data mart, with surrogate keys local to that mart.",
        "A dimension with the same keys, attributes and meaning in every fact table that uses it.",
        "A dimension built from leftover flags and indicators, kept out of the fact table.",
        "A dimension whose only attribute is stored in the fact table, with no separate table.",
        "A dimension that plays several roles in one fact table, such as order date and ship date."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 5 & Chapter 11, Section 1.3 (\"Dimensional Modeling\")",
      explanation: "Conformed dimensions (e.g., Customer, Date, Product) are built once and shared across multiple fact tables to provide coherent enterprise slicing and dicing."
    },
    {
      id: "DMBOK-MOD-03",
      area: "Data Modeling & Design",
      chapter: "Chapter 5: Data Modeling and Design",
      prompt: "What are the three progressive levels of data models defined in DAMA DMBOK2?",
      options: [
        "Relational, Dimensional and Object-Oriented",
        "Conceptual, Logical and Physical",
        "Subject Area, Entity and Attribute",
        "Source, Staging and Presentation",
        "Enterprise, Application and Project"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 5, Section 1.3 (\"Data Model Levels\")",
      explanation: "Data modeling progresses from Conceptual (high-level business scope) to Logical (business attributes and rules independent of tech) to Physical (RDBMS-specific DDL)."
    },
    {
      id: "DMBOK-MOD-04",
      area: "Data Modeling & Design",
      chapter: "Chapter 5: Data Modeling and Design",
      prompt: "In dimensional modeling, what is a \"Slowly Changing Dimension Type 2\" (SCD Type 2)?",
      options: [
        "The existing row is overwritten in place, so no history of earlier values is kept.",
        "A new row is inserted for each change, with effective dates and a current-row flag.",
        "A new column holds the previous value alongside the current value in the same row.",
        "Changes are written to a separate history table, while the main row stays current only.",
        "The original attribute value is retained as loaded and is never updated afterwards."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 5 & Chapter 11, Section 1.3 (\"SCD Types\")",
      explanation: "SCD Type 2 tracks complete historical lineage by creating a new version of the row with validity date ranges whenever an attribute changes."
    },
    {
      id: "DMBOK-MOD-05",
      area: "Data Modeling & Design",
      chapter: "Chapter 5: Data Modeling and Design",
      prompt: "What represents the cardinality of a relationship in an Entity-Relationship (ER) diagram?",
      options: [
        "The number of distinct values held in an attribute across all instances of an entity.",
        "How many instances of one entity relate to an instance of another (1:1, 1:N, M:N).",
        "The number of attributes that together make up the primary key of an entity.",
        "The number of entities taking part in the relationship, such as binary or ternary.",
        "The verb phrase that names the relationship, read in each direction between entities."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 5, Section 1.3.3 (\"Relationships and Cardinality\")",
      explanation: "Cardinality defines the numeric constraints (one-to-one, one-to-many, many-to-many) governing how entity instances associate with one another."
    },
    {
      id: "DMBOK-MOD-06",
      area: "Data Modeling & Design",
      chapter: "Chapter 5: Data Modeling and Design",
      prompt: "What is a \"Surrogate Key\" in data modeling and warehousing?",
      options: [
        "An identifier with business meaning, such as an account number, used by the business.",
        "A system-generated identifier with no business meaning, used as the primary key.",
        "A key made up of two or more attributes that together identify an instance.",
        "An attribute in one entity that references the primary key of another entity.",
        "Any candidate key that was not chosen as the primary key of the entity."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 5, Section 1.3.4 (\"Keys\")",
      explanation: "Surrogate keys are system-generated unique identifiers (often integers or UUIDs) that insulate data models from changes in underlying business natural keys."
    },
    {
      id: "DMBOK-MOD-07",
      area: "Data Modeling & Design",
      chapter: "Chapter 5: Data Modeling and Design",
      prompt: "In Data Vault modeling, what are the three core entity types?",
      options: [
        "Facts, Dimensions and Bridge tables",
        "Hubs, Links and Satellites",
        "Anchors, Attributes and Ties",
        "Nodes, Edges and Properties",
        "Entities, Relationships and Attributes"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 5, Section 1.3.8 (\"Data Vault Modeling\")",
      explanation: "Data Vault modeling is built upon Hubs (unique business keys), Links (associations or transactions between Hubs), and Satellites (descriptive historical attributes)."
    },
    {
      id: "DMBOK-MOD-08",
      area: "Data Modeling & Design",
      chapter: "Chapter 5: Data Modeling and Design",
      prompt: "In dimensional modeling, what is a Fact Table primarily composed of?",
      options: [
        "Descriptive text attributes used to filter, group and label query results.",
        "Foreign keys to dimension tables plus numeric measures of a business event.",
        "The business keys of one core concept, with load dates and record sources.",
        "Descriptive attributes of a business key with load timestamps tracking history.",
        "Hierarchy levels flattened into columns, such as category, subcategory and product."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 5 & Chapter 11 (\"Dimensional Modeling\")",
      explanation: "Fact tables contain the quantitative performance measures of a business event alongside foreign keys that link out to contextual dimension tables."
    },
    {
      id: "DMBOK-STO-01",
      area: "Data Storage & Operations",
      chapter: "Chapter 6: Data Storage and Operations",
      prompt: "Which set of properties represents the reliability guarantees of traditional relational transaction processing engines?",
      options: [
        "BASE (Basically Available, Soft state, Eventual consistency)",
        "ACID (Atomicity, Consistency, Isolation, Durability)",
        "CAP (Consistency, Availability, Partition tolerance)",
        "CRUD (Create, Read, Update, Delete)",
        "2PC (Two-Phase Commit across distributed nodes)"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 6, Section 1.3 (\"Essential Concepts - Transaction Management\")",
      explanation: "ACID guarantees database transaction integrity: Atomicity (all or nothing), Consistency (preserves schema constraints), Isolation (concurrency safety), and Durability (persisted post-commit)."
    },
    {
      id: "DMBOK-STO-02",
      area: "Data Storage & Operations",
      chapter: "Chapter 6: Data Storage and Operations",
      prompt: "What is the primary difference between RPO (Recovery Point Objective) and RTO (Recovery Time Objective) in disaster recovery planning?",
      options: [
        "RPO is the maximum tolerable data loss, measured in time; RTO is the maximum tolerable downtime.",
        "RPO is the maximum tolerable downtime; RTO is the maximum tolerable data loss, measured in time.",
        "RPO is how often backups are scheduled; RTO is how long a backup job takes to complete.",
        "RPO applies to the primary site; RTO applies only to the disaster recovery site.",
        "RPO measures the restore success rate; RTO measures time since the last tested failover."
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 6, Section 1.3 (\"Business Continuity and Disaster Recovery\")",
      explanation: "RPO specifies the maximum age of data that must be recovered from backup after disaster (data loss tolerance), while RTO specifies how quickly systems must be restored (downtime tolerance)."
    },
    {
      id: "DMBOK-STO-03",
      area: "Data Storage & Operations",
      chapter: "Chapter 6: Data Storage and Operations",
      prompt: "What is Database Sharding in high-scale data storage operations?",
      options: [
        "Vertical partitioning of a table's columns into separate tables on the same server.",
        "Horizontally partitioning rows across separate database servers to spread load.",
        "Copying the whole database to read-only replicas that serve query traffic.",
        "Splitting a table into date-range partitions within a single database instance.",
        "Storing each column separately on disk to speed up analytic aggregation queries."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 6, Section 1.3 (\"Database Architectures\") & Strengholt",
      explanation: "Sharding partitions rows across multiple distinct physical database nodes, allowing horizontal read and write scalability beyond a single server capacity."
    },
    {
      id: "DMBOK-STO-04",
      area: "Data Storage & Operations",
      chapter: "Chapter 6: Data Storage and Operations",
      prompt: "Which database maintenance activity identifies fragmented storage, updates index tree balance, and reorganizes table pages for optimal I/O?",
      options: [
        "Index rebuild / reorganization",
        "Updating query optimizer statistics",
        "Database consistency checking (integrity checks)",
        "Transaction log backup and truncation",
        "Capacity planning and storage provisioning"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 6, Section 2.2 (\"Manage Databases\")",
      explanation: "Re-indexing and defragmentation reorganize physical data and leaf pages in B-trees, reducing random disk I/O and accelerating query execution."
    },
    {
      id: "DMBOK-STO-05",
      area: "Data Storage & Operations",
      chapter: "Chapter 6: Data Storage and Operations",
      prompt: "What is the operational purpose of a Database Transaction Log (Write-Ahead Log / WAL)?",
      options: [
        "Recording who accessed which data and when, so security teams can review usage.",
        "Logging each change before it reaches data pages, so the database can recover.",
        "Recording errors and warnings raised by the DBMS to support troubleshooting.",
        "Holding recent query results in memory so that repeated queries return faster.",
        "Storing a full copy of the database, taken at a point in time, for later restores."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 6, Section 1.3 (\"Essential Concepts\")",
      explanation: "The Write-Ahead Log (WAL) ensures Durability and Atomicity by logging transaction operations before data pages are flushed to permanent storage."
    },
    {
      id: "DMBOK-STO-06",
      area: "Data Storage & Operations",
      chapter: "Chapter 6: Data Storage and Operations",
      prompt: "What does data archiving accomplish in enterprise storage operations?",
      options: [
        "It permanently deletes data past its retention period, so that it cannot be recovered.",
        "It moves inactive data from operational systems to lower-cost storage, retained per policy.",
        "It creates periodic copies of the database so it can be restored after a failure.",
        "It replicates data to a secondary site so service can continue if the primary site fails.",
        "It compresses data in place within the production database to reduce its storage footprint."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 6, Section 2.2 (\"Manage Database Performance and Capacity\")",
      explanation: "Archiving moves cold, non-operational data out of production databases to lower-cost storage while keeping it available under retention policies, improving performance and lowering primary storage costs. Purging, by contrast, permanently deletes data that no longer needs to be kept; backups and replication protect against loss rather than relocate inactive data."
    },
    {
      id: "DMBOK-STO-07",
      area: "Data Storage & Operations",
      chapter: "Chapter 6: Data Storage and Operations",
      prompt: "Which role is fundamentally responsible for database software installation, physical schema implementation, performance monitoring, and disaster recovery execution?",
      options: [
        "Data Architect",
        "Database Administrator (DBA)",
        "Technical Data Steward",
        "Infrastructure / Storage Administrator",
        "Data Modeler"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 6, Section 1.3 (\"Roles and Responsibilities\")",
      explanation: "The Database Administrator (DBA) manages physical database engines, tuning, capacity planning, security patch management, and backup/restore procedures."
    },
    {
      id: "DMBOK-SEC-01",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "What constitutes the classic \"CIA Triad\" of information security emphasized throughout DMBOK2 Chapter 7?",
      options: [
        "Confidentiality, Integrity, Availability",
        "Confidentiality, Integrity, Accountability",
        "Authentication, Authorization, Auditing",
        "Classification, Identification, Authorization",
        "Compliance, Integrity, Auditability"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 7, Section 1.2 (\"Goals and Principles\")",
      explanation: "The CIA Triad stands for Confidentiality (preventing unauthorized disclosure), Integrity (safeguarding accuracy/completeness), and Availability (ensuring authorized access)."
    },
    {
      id: "DMBOK-SEC-02",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "What is the difference between Data Masking and Encryption according to DMBOK2?",
      options: [
        "Masking is reversible with a key; encryption permanently replaces values so they cannot be restored.",
        "Masking substitutes realistic but fictitious values; encryption makes data unreadable without a key.",
        "Masking protects data in transit; encryption protects data only while it is stored at rest.",
        "Masking applies only to production data; encryption is used only in test environments.",
        "Masking removes sensitive columns entirely; encryption swaps them for tokens held in a vault."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 7, Section 3.7 (\"Data Masking/Encryption\")",
      explanation: "Masking replaces sensitive values with realistic but fictitious (often format-preserving) values, typically without a way back to the original, which makes it suitable for development and testing; encryption transforms plaintext into ciphertext that authorized holders of the key can decrypt."
    },
    {
      id: "DMBOK-SEC-03",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "What security model verifies every user and device access request regardless of whether they are located inside or outside the corporate perimeter network?",
      options: [
        "Defense in depth (layered controls)",
        "Zero Trust Architecture",
        "Perimeter security (castle-and-moat)",
        "Principle of least privilege",
        "Separation of duties"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 7 & Eryurek et al. Ch. 7 (\"Zero-Trust Model\")",
      explanation: "Zero Trust adheres to the principle \"never trust, always verify\", validating identity, context, and permissions continuously for every transaction."
    },
    {
      id: "DMBOK-SEC-04",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "What is Role-Based Access Control (RBAC) in enterprise database security?",
      options: [
        "Permissions are evaluated from attributes of the user, resource and context at request time.",
        "Permissions are granted to job roles, and users get them by being assigned to roles.",
        "The data owner grants and revokes access to each object entirely at their own discretion.",
        "Access is decided by comparing a user's clearance with the data's classification label.",
        "Access is filtered at row level according to the user's organizational unit or region."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 7, Section 1.3 (\"User Identity and Access Management\")",
      explanation: "RBAC simplifies authorization management by provisioning permissions to roles (e.g., Billing Clerk, Auditor) and mapping users to those designated roles."
    },
    {
      id: "DMBOK-SEC-05",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "What is data anonymization in data security?",
      options: [
        "Replacing identifiers with pseudonyms that can be re-linked using a separately held key.",
        "Irreversibly altering personal data so the individual can no longer be identified.",
        "Encrypting personal data so only users holding the decryption key can read it.",
        "Restricting access to personal data to roles with a legitimate business need.",
        "Classifying personal data by sensitivity so that suitable controls can be applied."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 7, Section 3.7 & GDPR Article 4",
      explanation: "Anonymization alters personal data permanently so that the individual cannot be re-identified by any means, rendering the dataset exempt from many privacy laws."
    },
    {
      id: "DMBOK-SEC-06",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "What does a CRUD Matrix define in data security and governance?",
      options: [
        "A matrix of tasks against roles showing who is Responsible, Accountable, Consulted and Informed.",
        "A matrix of roles or applications against data entities, showing CRUD rights on each.",
        "A matrix of business processes against conformed dimensions, used to plan the data warehouse.",
        "A matrix of data elements against quality dimensions, showing the target score for each one.",
        "A matrix of systems against interfaces, showing how data flows between the applications."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 7, Section 4.1 (\"CRUD Matrix Usage\")",
      explanation: "A CRUD Matrix explicitly maps who (or what system) is permitted to Create, Read, Update, or Delete specific data entities across the enterprise."
    },
    {
      id: "DMBOK-SEC-07",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "Which practice routinely evaluates database configurations against known vulnerabilities, unpatched CVEs, and compliance baseline settings?",
      options: [
        "Vulnerability scanning and security audits",
        "Data masking and obfuscation",
        "Role-based access control provisioning",
        "Data security classification and labeling",
        "Encryption of data at rest and in transit"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 7, Section 2 (\"Assess Current Security Risks\") and Data Security Audit",
      explanation: "Vulnerability assessments and security audits compare configurations against known weaknesses, missing patches, and baseline settings, finding drift before it is exploited. Masking, encryption, access control, and classification are controls; they do not evaluate configurations."
    },
    {
      id: "DMBOK-INT-01",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "What is Change Data Capture (CDC) in modern data integration architecture?",
      options: [
        "Extracting a complete snapshot of each source table on every scheduled run and fully reloading the target",
        "Detecting and capturing only the rows inserted, updated, or deleted at the source since the last extract",
        "Providing a logical query layer over source systems so that data can be read in place without moving it",
        "Recording the end-to-end path of data from its origin through each transformation to its reports",
        "Routing messages between producer and consumer applications through a central enterprise service bus"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 8, Section 1.3 (\"Essential Concepts - CDC\")",
      explanation: "CDC limits extraction to changed data, detected through source flags or timestamps, triggers, or database transaction logs, so full-table extracts are not needed."
    },
    {
      id: "DMBOK-INT-02",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "How does ELT (Extract-Load-Transform) differ fundamentally from traditional ETL (Extract-Transform-Load)?",
      options: [
        "ELT transforms data in a separate staging engine before loading, so the target receives only conformed data",
        "ELT removes the need for transformation because the target keeps data only in its original source format",
        "ELT loads raw data into the target first and runs transformations with the target platform's own compute",
        "ELT applies only to real-time streaming, whereas ETL applies only to scheduled batch integration",
        "ELT queries the sources in place through a virtual layer, so no data is physically loaded into a target"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 8, Section 1.3 (\"ETL vs. ELT\") & Strengholt Ch. 4",
      explanation: "In ELT, raw data is loaded into scalable cloud data platforms first, and compute-heavy transformations are executed inside the high-performance target system."
    },
    {
      id: "DMBOK-INT-03",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "What is Data Virtualization in enterprise integration?",
      options: [
        "Replicating source databases to a central store in near real time so that queries run against the copies",
        "Running database servers as virtual machines to consolidate hardware and reduce infrastructure costs",
        "Consolidating data from many sources into an integrated, subject-oriented, historical analytical store",
        "A logical layer that lets users query heterogeneous sources in real time without moving the data",
        "Capturing only the changed source rows and streaming them to downstream targets as the changes occur"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 8, Section 3.2 (\"Data Virtualization Server\")",
      explanation: "Data Virtualization abstracts underlying distributed data sources, presenting a unified virtual schema for real-time querying without physical ETL copying."
    },
    {
      id: "DMBOK-INT-04",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "What is the role of an Enterprise Service Bus (ESB) or messaging broker in application interoperability?",
      options: [
        "Connecting each pair of systems through a dedicated point-to-point interface built for that exchange",
        "Acting as the system of record where master data is authored and from which it is then published",
        "Providing a virtual query layer that federates heterogeneous sources without moving any of the data",
        "Storing integrated historical data in a subject-oriented store for enterprise reporting and analysis",
        "Decoupling producer and consumer systems by routing and transforming messages through a shared bus"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 8, Section 3.3 (\"Enterprise Service Bus\") & Strengholt Ch. 5",
      explanation: "An ESB/broker decouples systems, routing messages, transforming data formats, and enabling event-driven communication between disparate enterprise applications."
    },
    {
      id: "DMBOK-INT-05",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "What is a Data Sharing Agreement (sometimes formalized as an SLA or data contract) between data producers and consumers?",
      options: [
        "A formal agreement on data format, delivery frequency, quality expectations, ownership, and permitted use",
        "A technical interface specification that defines only the physical file layout and the transfer protocol",
        "An internal policy that classifies data by sensitivity and sets the access controls required for each class",
        "A vendor license granting the organization the right to use a purchased data integration tool",
        "A retention schedule setting how long shared records must be kept before they are destroyed"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 8, Section 6.1 (\"Data Sharing Agreements\") & Strengholt Ch. 8",
      explanation: "Data Sharing Agreements or Data Contracts define the schemas, SLA latencies, quality thresholds, and responsibilities expected between provider and consumer."
    },
    {
      id: "DMBOK-INT-06",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "Which architecture processes continuous data streams record-by-record with sub-second latencies rather than collecting records in batch intervals?",
      options: [
        "Scheduled batch processing",
        "Event stream processing",
        "Nightly full-refresh ETL",
        "Bulk managed file transfer",
        "Periodic snapshot replication"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 8 & Strengholt Ch. 6 (\"Event and Notification Management\")",
      explanation: "Event streaming platforms process data continuously in real-time as events occur, contrasting with traditional scheduled batch window processing."
    },
    {
      id: "DMBOK-INT-07",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "What is \"Data Lineage\" tracing within data integration pipelines?",
      options: [
        "Recording which users accessed or modified each data element, and when, for security audit purposes",
        "Documenting the business definition, owner, and approved usage rules of each data element",
        "Tracing data from its origin systems through each transformation to its reporting destinations",
        "Measuring whether data values conform to the formats and domains defined for each data element",
        "Tracking the versions of each pipeline's code and configuration as changes are deployed to production"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 8, Section 6.2 & Chapter 12 (\"Data Lineage\")",
      explanation: "Data lineage maps data origin, step-by-step transformations, and ultimate analytical consumption, providing transparency for audits and impact analysis."
    },
    {
      id: "DMBOK-DOC-01",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "In Document and Content Management, what is a \"Controlled Vocabulary\"?",
      options: [
        "A logical data model defining the entities, attributes, and relationships of a subject area",
        "A schedule defining how long each category of records must be retained before its disposal",
        "An open set of user-generated tags applied without restriction, emerging from use (a folksonomy)",
        "A defined list of explicitly allowed terms used to index, tag, and retrieve content consistently",
        "A metadata repository storing the technical schemas and lineage of an organization's databases"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 9, Section 3.3 (\"Controlled Vocabulary and Metadata Tools\")",
      explanation: "Controlled vocabularies (including taxonomies and thesauri) standardize terminology to ensure accurate tagging, classification, and retrieval of documents."
    },
    {
      id: "DMBOK-DOC-02",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "What is \"Electronic Discovery\" (e-Discovery) in document management?",
      options: [
        "Automatically indexing and classifying content so that users can find documents through enterprise search",
        "Profiling data sources to discover their actual structure, content patterns, and quality anomalies",
        "Scanning repositories to locate sensitive data so that it can be classified and protected",
        "Applying the retention schedule to identify which records are eligible for authorized destruction",
        "Identifying, preserving, collecting, and producing electronically stored information for legal matters"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 9, Section 3.5 (\"E-Discovery Technology\")",
      explanation: "E-Discovery is the legally mandated process to locate, preserve, and review electronic records (emails, documents, chats) relevant to legal matters."
    },
    {
      id: "DMBOK-DOC-03",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "What is a \"Records Retention Schedule\"?",
      options: [
        "A policy defining how long each category of record must be kept and when it is to be disposed of",
        "A plan specifying how often backups are taken and how long they are kept to support system recovery",
        "A file plan organizing records into a classification hierarchy so that they can be filed and found",
        "A legal hold notice suspending the destruction of records relevant to pending litigation",
        "A lifecycle policy moving data between storage tiers based on how often it is accessed"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 9, Section 2.1 (\"Plan for Lifecycle Management\")",
      explanation: "Retention schedules dictate how long categories of records must be preserved for compliance and when they should be destroyed to mitigate legal liability."
    },
    {
      id: "DMBOK-DOC-04",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "What distinguishes unstructured content from structured data in DMBOK2?",
      options: [
        "Unstructured content has no metadata, whereas structured data is always described in a metadata catalog",
        "Structured data follows a predefined model or schema; unstructured content has none (e.g., email, video)",
        "Structured data lives only in relational databases; anything stored as a file is unstructured by definition",
        "Unstructured content falls outside data management scope and needs no governance or retention rules",
        "Structured data is internal to the organization, while unstructured content always comes from outside"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 9, Section 1 (\"Introduction\")",
      explanation: "Structured data fits into predefined columns and tables, whereas unstructured content (documents, audio, emails) requires metadata and taxonomy to manage."
    },
    {
      id: "DMBOK-DOC-05",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "What does a \"Taxonomy\" provide in Enterprise Content Management (ECM)?",
      options: [
        "A list of preferred terms with their synonyms and related terms, used to expand search queries",
        "A formal representation of concepts and the many kinds of relationships among them, used for reasoning",
        "A hierarchical classification of terms that organizes content by parent-child relationships",
        "A set of standard metadata elements, such as title and creator, used to describe any resource",
        "A retention schedule that groups content by the legal period for which it must be kept"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 9, Section 1.3 (\"Taxonomies\")",
      explanation: "A taxonomy arranges knowledge and terms into parent-child hierarchies, enabling intuitive navigation, faceted search, and consistent document indexing."
    },
    {
      id: "DMBOK-DOC-06",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "What is \"OCR\" (Optical Character Recognition) utilized for in document digitization?",
      options: [
        "Recognizing spoken audio and transcribing it into text for indexing in a content repository",
        "Reading barcodes on documents to route them automatically into the correct business workflow",
        "Extracting embedded metadata, such as author and creation date, from native electronic files",
        "Converting images of printed or handwritten text into machine-readable, searchable text",
        "Comparing scanned pages with their originals to verify that no tampering occurred after capture"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 9, Section 3.1 (\"ECM Systems\")",
      explanation: "OCR software processes scanned paper documents and images into editable, indexable, and searchable digital text representations."
    },
    {
      id: "DMBOK-MDM-01",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "Which statement accurately contrasts Reference Data with Master Data in DMBOK2?",
      options: [
        "Master data defines permissible code values (e.g., ISO currency codes); reference data describes core business entities (e.g., Customer)",
        "Reference data comes only from external standards bodies, while master data is always created inside the organization",
        "Master data records business events such as orders and payments; reference data records the parties involved in them",
        "Reference data never changes once it is loaded, whereas master data changes with every business transaction",
        "Reference data defines permissible values and codes (e.g., ISO currency codes); master data describes core entities (e.g., Customer, Product)"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 10, Section 1 (\"Introduction\")",
      explanation: "Reference data categorizes other data (codes, country lists, statuses); Master data provides the definitive business context around core business entities."
    },
    {
      id: "DMBOK-MDM-02",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "What is a \"Golden Record\" in Master Data Management (MDM)?",
      options: [
        "The reconciled, authoritative record of an entity, built by matching and merging multiple sources",
        "The first version of a record captured in the original system of entry, preserved unchanged for audit",
        "A record that has passed every data quality rule and is therefore locked against further updates",
        "The definitive list of permissible code values that other systems must use, such as country codes",
        "The most recently updated record for an entity, which always overwrites the values held in other systems"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 10, Section 1.3 (\"Golden Record / Single Version of Truth\")",
      explanation: "A Golden Record aggregates, de-duplicates, and reconciles multiple matching records into a single trusted, authoritative master entity."
    },
    {
      id: "DMBOK-MDM-03",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "Which MDM architectural style maintains master data centrally, requiring all transactional source systems to read and write directly to the centralized hub?",
      options: [
        "Registry",
        "Transaction Hub",
        "Consolidated",
        "Coexistence (Hybrid)",
        "Federated (Virtual)"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 10, Section 1.3.4 (\"MDM Architecture Styles\")",
      explanation: "In the Transaction Hub style the hub is the system of record: master data is authored and maintained there and source applications read from and write to it. Registry keeps data in the sources with only an index; Consolidated copies data into the hub for reference without being the authoring system; Coexistence (Hybrid) authors in the hub but synchronizes back to sources that keep local copies."
    },
    {
      id: "DMBOK-MDM-04",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "In contrast to the Centralized MDM style, how does the \"Registry\" MDM style operate?",
      options: [
        "Master data is copied into the hub and reconciled there, but the sources keep authoring their own records",
        "Master data is authored in the hub, and the reconciled records are synchronized back to the source systems",
        "Master data stays in the source systems; the hub holds only cross-reference keys and matching results",
        "All systems read and write master data directly in the hub, which becomes the single system of record",
        "Master data is published as code lists that source systems download to validate their entry fields"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 10, Section 1.3.4 (\"MDM Architecture Styles - Registry\")",
      explanation: "The Registry style creates a lightweight index of pointers and cross-system mappings without consolidating or modifying the underlying operational source databases."
    },
    {
      id: "DMBOK-MDM-05",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "What is \"Entity Resolution\" (Match and Merge) in Master Data Management?",
      options: [
        "Resolving referential integrity violations by deleting child records whose parent keys no longer exist",
        "Mapping each source system's code values to the enterprise reference values that they correspond to",
        "Placing each entity at its correct position in a hierarchy, such as a legal-entity ownership tree",
        "Deciding whether records in different systems describe the same real-world entity, then linking them",
        "Standardizing names and addresses into consistent formats before they are loaded into the warehouse"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 10, Section 2.1 (\"MDM Activities - Match and Merge\")",
      explanation: "Entity resolution uses deterministic and probabilistic matching algorithms to link and merge records that represent the exact same customer, vendor, or product."
    },
    {
      id: "DMBOK-MDM-06",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "Which entity is universally recognized as a primary Master Data subject area across almost all industries?",
      options: [
        "Sales order transactions",
        "ISO country codes",
        "ETL job execution logs",
        "Daily inventory snapshots",
        "Customer (Party)"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 10, Section 1 (\"Introduction - Master Data Entities\")",
      explanation: "Party (Customer, Patient, Citizen), Product, Financial Account, Location, and Vendor represent the universal core master entities across enterprises."
    },
    {
      id: "DMBOK-MDM-07",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "What is an example of external standardized Reference Data commonly adopted by global enterprises?",
      options: [
        "ISO 3166 country codes and ISO 4217 currency codes",
        "An internal product hierarchy defined by marketing",
        "The enterprise customer golden record in the MDM hub",
        "Order status codes defined by the sales application",
        "Fiscal calendar periods defined by corporate finance"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 10, Section 1.3 (\"Reference Data Types\")",
      explanation: "ISO country and currency codes, postal abbreviations, and industry NAICS codes are standard external reference datasets widely ingested by organizations."
    },
    {
      id: "DMBOK-DW-01",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "In Data Warehousing architecture, what is the core philosophy of Bill Inmon's Corporate Information Factory (CIF)?",
      options: [
        "A bus of conformed dimensions linking dimensional data marts that together form the enterprise warehouse",
        "A normalized (3NF) enterprise data warehouse as the integrated source that feeds departmental data marts",
        "Independent departmental data marts loaded directly from sources, without a central integration layer",
        "Raw data of every format landed in low-cost storage and structured only when it is read (schema-on-read)",
        "Reports run directly against operational systems through a virtual layer, with no persistent warehouse"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.3 (\"DW Architecture Philosophies - Inmon vs. Kimball\")",
      explanation: "Bill Inmon advocates a top-down EDW modeled in 3NF to capture enterprise truth, which subsequently feeds departmental dimensional data marts."
    },
    {
      id: "DMBOK-DW-02",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "In contrast to Bill Inmon, what is Ralph Kimball's primary architectural approach to Data Warehousing?",
      options: [
        "A top-down, normalized enterprise data warehouse that populates dependent departmental data marts",
        "An operational data store integrating current source data for near-real-time operational reporting",
        "A bottom-up warehouse built as dimensional data marts integrated through conformed dimensions",
        "A hub, link, and satellite model designed to store the full auditable history of all source data",
        "Separate data marts per department, each with its own dimensions and no shared enterprise keys"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.3 (\"Kimball Dimensional Architecture\")",
      explanation: "Ralph Kimball's dimensional design builds the enterprise warehouse out of conformed star schemas and dimensional data marts linked by shared dimensions."
    },
    {
      id: "DMBOK-DW-03",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "In dimensional modeling, what is the difference between a Star Schema and a Snowflake Schema?",
      options: [
        "A star schema has one fact table per subject area; a snowflake schema allows only one fact table in total",
        "A star schema stores detailed transactions; a snowflake schema stores only pre-aggregated summary data",
        "A star schema normalizes dimensions into sub-tables; a snowflake keeps each dimension in a single table",
        "A star schema keeps each dimension in one denormalized table; a snowflake splits dimensions into sub-tables",
        "A star schema is used only in Kimball designs; a snowflake schema is the required model for an Inmon EDW"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.3 (\"Star vs. Snowflake Schemas\")",
      explanation: "Snowflake schemas normalize dimension tables to reduce redundancy, splitting them into secondary hierarchies, whereas Star schemas denormalize them for query speed."
    },
    {
      id: "DMBOK-DW-04",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "What is a \"Factless Fact Table\" in dimensional data modeling?",
      options: [
        "A dimension table with no foreign keys that simply lists the descriptive attributes of a business entity",
        "A fact table whose measures are pre-aggregated to a coarser grain, such as monthly totals by region",
        "A fact table recording the state of a process at regular intervals, such as daily account balances",
        "A dimension holding miscellaneous low-cardinality flags and indicators removed from the fact table",
        "A fact table holding only dimension keys and no numeric measures, used to record events or coverage"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.3 (\"Dimensional Modeling Concepts\")",
      explanation: "Factless fact tables record events or circumstances (e.g., class attendance, marketing coverage) that contain foreign keys linking dimensions without numerical measures."
    },
    {
      id: "DMBOK-DW-05",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "What is the primary risk associated with \"Spreadmarts\" (uncontrolled desktop spreadsheets acting as data marts)?",
      options: [
        "Conflicting versions of the truth, with metrics that cannot be audited, reconciled, or governed",
        "Higher licensing costs for the enterprise BI platform as more analysts need named user seats",
        "Loss of history, because spreadsheets cannot hold more than a single reporting period of data",
        "Slower warehouse loads, because spreadsheet data must be reprocessed in every ETL batch window",
        "Lower query performance in the warehouse caused by many analysts running their own ad hoc reports"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.1 (\"Business Drivers - Spreadmarts\")",
      explanation: "Spreadmarts breed competing versions of the truth, lack data governance controls, and risk exposing sensitive information through unsecured desktop files."
    },
    {
      id: "DMBOK-DW-06",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "What capability does \"OLAP\" (Online Analytical Processing) provide to business analysts?",
      options: [
        "High-volume processing of short read-write transactions, such as order entry or card authorizations",
        "Multidimensional analysis of consolidated data with drill-down, roll-up, and slice-and-dice operations",
        "Automated discovery of hidden patterns and predictions in large datasets using machine learning",
        "Continuous processing of event streams as they arrive, with sub-second latency for operational alerts",
        "Delivery of fixed-format, scheduled production reports to a large population of operational users"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.3 (\"OLAP Technology\")",
      explanation: "OLAP engines allow analysts to explore multidimensional cubes rapidly, rolling up to summaries, drilling down to details, and slicing across dimensions."
    },
    {
      id: "DMBOK-DW-07",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "What is a \"Data Lakehouse\" in modern analytical data architecture?",
      options: [
        "A data lake whose zones are copied nightly into a separate relational warehouse used for all reporting",
        "An operational data store holding current, integrated data for near-real-time operational reporting",
        "A platform combining low-cost data lake storage with warehouse features such as ACID transactions and schemas",
        "A virtualization layer that queries the data lake and the warehouse in place without storing any data",
        "A dimensional data mart for a single department, loaded on a schedule from the enterprise data warehouse"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 11 & Strengholt Ch. 1 (\"Data Lakehouse Evolution\")",
      explanation: "Data Lakehouses unite the scalable unstructured storage of data lakes with the schema controls, ACID guarantees, and SQL performance of data warehouses."
    },
    {
      id: "DMBOK-META-01",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "Which category of metadata documents job execution times, row counts, error logs, and file sizes in data pipelines?",
      options: [
        "Technical metadata",
        "Business metadata",
        "Descriptive metadata",
        "Operational metadata",
        "Structural metadata"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 12, Section 1.3 (\"Types of Metadata\")",
      explanation: "Operational metadata describes the processing and access of data: job run times and logs, row counts, error and exception logs, audit/balance/control results, and backup and retention details. DMBOK2 classifies data lineage and source-to-target mappings as technical metadata."
    },
    {
      id: "DMBOK-META-02",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "What constitutes \"Business Metadata\" in DMBOK2?",
      options: [
        "Table and column names, data types, keys, indexes, and the physical storage locations of data files",
        "Job run times, row counts, error logs, and the results of audit, balance, and control processes",
        "Database access patterns, query execution plans, and the results of performance-tuning activities",
        "Source-to-target mappings, ETL program code, and the transformation logic applied in each pipeline step",
        "Business terms and definitions, business rules, data owners and stewards, and security classifications"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 12, Section 1.3 (\"Types of Metadata - Business\")",
      explanation: "Business metadata provides the business context, defining term meanings, operational business rules, data ownership, and sensitivity ratings."
    },
    {
      id: "DMBOK-META-03",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "What constitutes \"Technical Metadata\"?",
      options: [
        "Physical table and column names, data types, keys, indexes, and storage locations",
        "Business term definitions, calculation rules, data owners, and approved usage guidance",
        "Batch job run times, row counts, error logs, and audit, balance, and control results",
        "Data quality scores for critical data elements, tracked against agreed thresholds",
        "Stewardship assignments and decision rights recorded in the data governance charter"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 12, Section 1.3 (\"Types of Metadata - Technical\")",
      explanation: "Technical metadata describes the technical artifacts, systems, table structures, field formats, schemas, and connection details."
    },
    {
      id: "DMBOK-META-04",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "What is a \"Metadata Repository\" (or Enterprise Data Catalog)?",
      options: [
        "A data warehouse that integrates business data from operational systems for reporting and analytics",
        "A centralized or federated store that integrates and manages metadata from across the organization",
        "A master data hub holding the reconciled golden records for customers, products, and suppliers",
        "A content management system that stores documents and enforces their records retention schedules",
        "A modeling tool's local file that stores the diagrams for one project's logical and physical models"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 12, Section 3.1 (\"Metadata Repository Management Tools\")",
      explanation: "A Metadata Repository or Data Catalog consolidates metadata, enabling discoverability, search, impact analysis, and cross-system lineage tracking."
    },
    {
      id: "DMBOK-META-05",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "Why is \"Impact Analysis\" a vital capability enabled by metadata management?",
      options: [
        "It measures the business value of each dataset to prioritize which datasets receive stewardship first",
        "It quantifies the financial cost of poor data quality to justify a data quality improvement program",
        "It shows what depends on a data structure before it changes, so downstream breakages are avoided",
        "It assesses the likelihood and impact of a data breach to set the security controls for each dataset",
        "It compares current data management practices against a maturity model to identify capability gaps"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 12, Section 4.1 (\"Lineage and Impact Analysis\")",
      explanation: "Impact analysis traces dependencies, revealing exactly which downstream tables, pipelines, and reports will break if a column or schema changes."
    },
    {
      id: "DMBOK-META-06",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "Which metadata architecture collects and synchronizes metadata into a single centralized physical store from all environment sources?",
      options: [
        "Distributed metadata architecture",
        "Hybrid metadata architecture",
        "Bi-directional metadata architecture",
        "Centralized metadata architecture",
        "Registry-style metadata architecture"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 12, Section 2.3 (\"Define Metadata Architecture\")",
      explanation: "In a centralized architecture, metadata is extracted from all sources into a single repository, giving fast, consistent queries. A distributed architecture leaves metadata in the sources and retrieves it on demand; a hybrid architecture combines the two; a bi-directional architecture lets metadata change anywhere and coordinates changes back to the sources."
    },
    {
      id: "DMBOK-META-07",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "What does the Dublin Core Metadata Initiative define?",
      options: [
        "A metamodel for exchanging data warehouse metadata between tools, maintained by the OMG (CWM)",
        "A registry standard describing data elements and their value domains (ISO/IEC 11179)",
        "A framework for classifying the descriptive representations of an enterprise (Zachman)",
        "A standard for exchanging statistical data and metadata between statistical agencies (SDMX)",
        "Fifteen core elements, such as Title, Creator, and Subject, for describing resources (ISO 15836)"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 12, Section 6.3 (\"Metadata Standards\")",
      explanation: "Dublin Core is an internationally recognized standard (ISO 15836) establishing basic descriptive metadata properties for resource discoverability."
    },
    {
      id: "DMBOK-DQ-01",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "Which data quality dimension measures whether all required data values are populated without unexpected nulls or omissions?",
      options: [
        "Completeness",
        "Validity",
        "Uniqueness",
        "Timeliness",
        "Reasonability"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 13, Section 1.3 (\"Data Quality Dimensions\")",
      explanation: "Completeness evaluates whether required fields have data values populated, ensuring no missing information across expected records."
    },
    {
      id: "DMBOK-DQ-02",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "What does DMBOK2 emphasize as the most sustainable and cost-effective approach to managing data quality problems?",
      options: [
        "Cleansing data in the warehouse after each load so that reports always show the corrected values",
        "Preventing defects at the point of entry through validation controls and root-cause correction",
        "Running periodic enterprise-wide profiling to inventory every defect in every data store",
        "Assigning a dedicated team to correct the errors users report through a help desk process",
        "Buying third-party data to overwrite internal records whenever the two sources disagree"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 13, Section 4.1 & 4.6 (\"Preventive Actions & Root Cause Analysis\")",
      explanation: "Prevention at the root cause is vastly more economical than downstream rework, scrubbing, and reconciliation after bad data has spread."
    },
    {
      id: "DMBOK-DQ-03",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "Which data quality dimension evaluates whether data accurately reflects the real-world entity or verifiable event it is intended to represent?",
      options: [
        "Validity",
        "Consistency",
        "Accuracy",
        "Reasonability",
        "Completeness"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 13, Section 1.3 (\"Data Quality Dimensions - Accuracy\")",
      explanation: "Accuracy measures truthfulness: whether recorded attributes correctly mirror the real-world object, balance, or occurrence."
    },
    {
      id: "DMBOK-DQ-04",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "What is \"Data Profiling\" in a Data Quality management program?",
      options: [
        "Defining the business rules and thresholds that data must meet before it is accepted into a system",
        "Correcting and standardizing data values so that they conform to their defined formats and domains",
        "Comparing records across systems to determine which ones represent the same real-world entity",
        "Statistical analysis of a dataset's actual content to discover its structure, patterns, and anomalies",
        "Reporting quality scores for critical data elements to stakeholders over time on a dashboard"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 13, Section 3.1 (\"Data Profiling Tools\")",
      explanation: "Data profiling examines actual data contents, evaluating null counts, value frequencies, pattern distributions, and constraint violations."
    },
    {
      id: "DMBOK-DQ-05",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "Which data quality dimension evaluates whether data values are identical and non-contradictory across different systems and reports?",
      options: [
        "Uniqueness",
        "Validity",
        "Timeliness",
        "Reasonability",
        "Consistency"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 13, Section 1.3 (\"Data Quality Dimensions - Consistency\")",
      explanation: "Consistency verifies that data across multiple databases, datamarts, and reports aligns without contradictions in values or definitions."
    },
    {
      id: "DMBOK-DQ-06",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "In Statistical Process Control (SPC) applied to Data Quality (as described in DMBOK2 Ch. 13 and Bad Data Handbook), what do Control Charts reveal?",
      options: [
        "Whether variation in a quality measure is common-cause noise or a special-cause signal needing action",
        "Which data quality dimensions contribute the most defects, ranked from most to least frequent",
        "The root causes of a defect, grouped into categories such as people, process, and technology",
        "The cost of poor data quality, broken down into prevention, appraisal, and failure costs",
        "The value frequencies and null counts found for each column when a dataset is first profiled"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 13, Section 4.5 (\"Statistical Process Control\")",
      explanation: "Control charts use upper and lower control limits to differentiate routine process variation from anomalous spikes that signal operational failures."
    },
    {
      id: "DMBOK-DQ-07",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "What is a \"Data Quality Scorecard / Dashboard\"?",
      options: [
        "A register of open data quality issues with their owners, priority, and remediation status",
        "A report of critical data elements' measured conformance to agreed quality thresholds over time",
        "A profiling report listing the value frequencies and null counts found in a single dataset",
        "A maturity assessment summary rating each data management capability on a scale from 0 to 5",
        "A service level agreement defining the quality and delivery commitments between data parties"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 13, Section 2.7 & Eryurek et al. Ch. 5 (\"Scorecards\")",
      explanation: "Quality scorecards present high-level metric indicators tracking data trustworthiness, rule adherence, and trends across enterprise data domains."
    },
    {
      id: "DMBOK-DQ-08",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "What is a \"Critical Data Element\" (CDE) in enterprise data governance and data quality?",
      options: [
        "A data element classified as highly sensitive, which must be encrypted or masked wherever it is stored",
        "A data element used as the primary key of a master data entity, such as a customer identifier",
        "A data element whose quality is vital to regulatory compliance, key business operations, or decisions",
        "A data element that fails the most quality rules, as identified during the latest data profiling run",
        "A data element defined in the business glossary with an approved definition and an assigned owner"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 13, Section 2.3 (\"Identify Critical Data and Business Rules\")",
      explanation: "CDEs are high-value fields (e.g., Customer Tax ID, Account Balance, Product SKU) prioritized for strict governance and quality monitoring."
    },
    {
      id: "DMBOK-BD-01",
      area: "Big Data & Data Science",
      chapter: "Chapter 14: Big Data and Data Science",
      prompt: "According to Eric Brewer's CAP Theorem, what must a distributed data system give up when a network partition occurs?",
      options: [
        "Partition tolerance, so that consistency and availability are both preserved",
        "Atomicity or durability, because ACID properties cannot hold across nodes",
        "Nothing, provided eventual consistency (BASE) is used to keep all three",
        "Either consistency or availability: it can remain CP or AP, but not both",
        "Either scalability or performance, since nodes cannot grow without latency"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 6, Section 1.3 (\"Database Processing: ACID, BASE, CAP\"), applied to the distributed platforms of Chapter 14",
      explanation: "CAP states that a distributed system can guarantee at most two of Consistency, Availability, and Partition tolerance. Because partitions cannot be ruled out, when one occurs the system must choose between consistency (CP) and availability (AP). BASE systems choose availability and accept eventual consistency."
    },
    {
      id: "DMBOK-BD-02",
      area: "Big Data & Data Science",
      chapter: "Chapter 14: Big Data and Data Science",
      prompt: "Which list matches the \"V\" characteristics of Big Data as described in DMBOK2 Chapter 14?",
      options: [
        "Volume, Velocity, Variety, Veracity, Value",
        "Volume, Velocity, Variety, Validity, Visualization, Value",
        "Volume, Velocity, Variety, Variability, Visibility, Value",
        "Volume, Velocity, Variety, Validity, Volatility, Visibility",
        "Volume, Velocity, Variety, Viscosity, Volatility, Veracity"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 14, Section 1.3 (\"Essential Concepts: Big Data\")",
      explanation: "DMBOK2 characterizes Big Data by Volume (amount of data), Velocity (speed at which data is captured, generated, or shared), Variety/Variability (forms of data), Viscosity (how difficult the data is to use or integrate), Volatility (how often data changes, and so how long it stays useful), and Veracity (how trustworthy it is). \"Value\" appears in many industry lists but is not one of DMBOK2's Vs."
    },
    {
      id: "DMBOK-BD-03",
      area: "Big Data & Data Science",
      chapter: "Chapter 14: Big Data and Data Science",
      prompt: "What is \"Data Wrangling\" (or Data Munging) in the data science lifecycle?",
      options: [
        "Iteratively cleaning, reshaping, and enriching raw data into a form suitable for analysis and modeling",
        "Training and tuning a predictive model, then validating its accuracy against a held-out test dataset",
        "Presenting analytical findings through charts and dashboards so that business users can act on them",
        "Ingesting raw data of any format into the data lake, unchanged, for later exploration by data scientists",
        "Deploying a validated model into production and monitoring its predictions for drift over time"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 14 & Bad Data Handbook Ch. 1",
      explanation: "Wrangling converts raw, inconsistent, or poorly structured data into clean feature sets suitable for analytical and machine learning algorithms."
    },
    {
      id: "DMBOK-MAT-01",
      area: "Maturity Assessment",
      chapter: "Chapter 15: Data Management Maturity Assessment",
      prompt: "In the generic maturity scale used for Data Management Maturity Assessments in DMBOK2 (Level 0 to Level 5), what characterizes Level 3?",
      options: [
        "Practices depend on individual effort, with little process and inconsistent results",
        "Standard, documented processes are applied consistently across the organization",
        "Basic practices are repeatable within some teams but not standardized enterprise-wide",
        "Processes are measured quantitatively and managed against defined performance targets",
        "Processes are continuously improved based on quantitative feedback and innovation"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 15, Section 1.3 (\"Assessment Levels\")",
      explanation: "DMBOK2's scale runs Level 0 No Capability, 1 Initial/Ad Hoc, 2 Repeatable, 3 Defined, 4 Managed, 5 Optimized. Level 3 (Defined) means standard processes, roles, and tools are documented and used consistently across the organization; quantitative management begins at Level 4."
    },
    {
      id: "DMBOK-MAT-02",
      area: "Maturity Assessment",
      chapter: "Chapter 15: Data Management Maturity Assessment",
      prompt: "In the generic maturity scale used for Data Management Maturity Assessments in DMBOK2, what is the highest level (Level 5)?",
      options: [
        "Managed",
        "Defined",
        "Optimized",
        "Repeatable",
        "Initial / Ad Hoc"
      ],
      correct: 2,
      dmbokRef: "DMBOK2 Chapter 15, Section 1.3 (\"Assessment Levels\")",
      explanation: "Level 5 (Optimized) is reached when data management practices are continuously improved based on measurement and feedback. Below it are Level 4 Managed (quantitatively measured), Level 3 Defined, Level 2 Repeatable, and Level 1 Initial/Ad Hoc."
    },
    {
      id: "DMBOK-ORG-01",
      area: "Organization & Roles",
      chapter: "Chapter 16: Data Management Organization and Role Expectations",
      prompt: "Which executive leader is primarily responsible for treating data as a strategic corporate asset, establishing data literacy, and aligning data capabilities with enterprise business strategy?",
      options: [
        "Chief Information Officer (CIO)",
        "Chief Information Security Officer",
        "Executive Data Steward",
        "Chief Data Officer (CDO)",
        "Enterprise Data Architect"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 16, Section 6.1 (\"The Chief Data Officer\") & Carl Anderson Ch. 11",
      explanation: "The Chief Data Officer leads enterprise data strategy, governance, and data literacy, aligning data capabilities with business strategy. The CIO focuses on information technology, the CISO on security, an executive data steward on governance decisions for a domain, and an enterprise data architect on data architecture."
    },
    {
      id: "DMBOK-ORG-02",
      area: "Organization & Roles",
      chapter: "Chapter 17: Data Management and Organizational Change Management",
      prompt: "DMBOK2 uses John Kotter's eight-stage process for leading major change. Which stage comes first?",
      options: [
        "Form a powerful guiding coalition",
        "Develop a vision and strategy",
        "Communicate the change vision",
        "Generate short-term wins",
        "Establish a sense of urgency"
      ],
      correct: 4,
      dmbokRef: "DMBOK2 Chapter 17 (\"Kotter's Eight Stage Process for Major Change\")",
      explanation: "Kotter's stages are: establish a sense of urgency, create the guiding coalition, develop a vision and strategy, communicate the change vision, empower broad-based action, generate short-term wins, consolidate gains and produce more change, and anchor new approaches in the culture. Allowing too much complacency, that is, failing to create urgency, is the first of Kotter's eight errors."
    }
  ];

  window.CDMP_QUESTION_BANK = QUESTIONS;
  window.CDMP_AREA_DIMENSIONS = AREA_DIMENSIONS;
})();
