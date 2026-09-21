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
        "Data is an enterprise asset with properties distinct from other physical assets, requiring lifecycle stewardship and not being depleted by use.",
        "Data management strictly concerns physical storage subsystems and DBMS performance tuning.",
        "Data architecture must always follow software release cadences regardless of business needs.",
        "Data management is exclusively governed by IT network infrastructure protocols.",
        "Data assets depreciate linearly on corporate balance sheets according to standard tax depreciation schedules."
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 1, Section 2.3 (\"Data as an Organizational Asset\")",
      explanation: "Data is an organizational asset with unique characteristics: it is not consumed or depleted when used, can be shared simultaneously by multiple processes, and requires continuous lifecycle stewardship."
    },
    {
      id: "DMBOK-DM-02",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "In Peter Aiken's DMBOK Pyramid Framework, which foundational phase must organizations stabilize before advancing into predictive data science and analytics?",
      options: [
        "Enterprise Blockchain Integration and distributed ledger verification.",
        "Phase 1: Foundational practices including Data Governance, Data Quality, and Core Architecture.",
        "Continuous Automated Deployment of machine learning model pipelines.",
        "Unstructured NoSQL schema migration across all business units.",
        "Decentralized Peer-to-Peer data sharing across departmental silos."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 1, Section 3.4 (\"DMBOK Pyramid (Aiken)\")",
      explanation: "Peter Aiken's pyramid illustrates that foundational capabilities (Data Architecture, Governance, and Quality) must be stabilized before an organization can effectively pursue predictive analytics and advanced data science."
    },
    {
      id: "DMBOK-DM-03",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "Which framework models strategic alignment by connecting Business Strategy, IT Strategy, Organizational Infrastructure, and IT Infrastructure across both functional integration and strategic fit?",
      options: [
        "The Henderson and Venkatraman Strategic Alignment Model",
        "The Zachman Enterprise Architecture Framework",
        "The TOGAF Architecture Development Method (ADM)",
        "The CMMI Data Management Maturity Model",
        "The Porter Value Chain Matrix"
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
        "By eliminating the business strategy dimension in favor of automated microservices.",
        "By introducing an explicit middle column for \"Information / Governance\" between Business and IT.",
        "By requiring all data to reside in relational third normal form schemas.",
        "By replacing enterprise architecture with agile user stories.",
        "By defining formal database administrator job descriptions."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 1, Section 3.2 (\"The Amsterdam Information Model\")",
      explanation: "The Amsterdam Information Model introduces an intermediate \"Information and Communication\" pillar between business and technical domains to account for information governance."
    },
    {
      id: "DMBOK-DM-05",
      area: "Data Management",
      chapter: "Chapter 1: Data Management",
      prompt: "What is the primary objective of formulating a formal Enterprise Data Strategy according to DMBOK2?",
      options: [
        "To mandate that all corporate business units adopt a single relational database vendor.",
        "To align data management investments, capabilities, and priorities directly with overall business objectives and value creation.",
        "To outsource all database management operations to public cloud infrastructure providers.",
        "To restrict business user access to self-service reporting platforms.",
        "To replace human data governance councils with automated algorithmic rule engines."
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
        "Technical Drivers"
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
        "Algorithmic Determinism",
        "Notice and Consent / Transparency",
        "Strict Data Obfuscation Protocol",
        "Exclusive Proprietary Stewardship",
        "Universal Data Monopolization"
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
        "The network latency introduced by web proxy servers during ETL queries.",
        "Using an alternate variable that inadvertently correlates with and discriminates against protected demographics (e.g., zip code standing for race).",
        "Encrypting customer keys through third-party hardware modules.",
        "Replicating master records to secondary geographical regions.",
        "Restricting analytical datasets strictly to CSV flat files."
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
        "Federal Information Security Modernization Act (FISMA)"
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
        "Because laws are always updated faster than technological capabilities emerge.",
        "Because laws define the minimum legal threshold; ethics require doing what is right even when not strictly mandated by statutory law.",
        "Because data ethics only applies to nonprofit academic institutions.",
        "Because international organizations are completely exempt from national legal regulations.",
        "Because legal compliance applies solely to physical hardware servers."
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
        "They increase server CPU utilization during batch hours.",
        "They manipulate or trick users into unintentionally surrendering personal data or granting privacy consents.",
        "They corrupt database indexes through uncommitted SQL transactions.",
        "They prevent search engine web crawlers from discovering sitemaps.",
        "They cause data pipelines to drop unformatted UTF-8 characters."
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
        "Database Backup Administrator",
        "Data Protection Officer (DPO) / Chief Privacy Officer",
        "Network Cabling Engineer",
        "ETL Performance Specialist",
        "Report Layout Designer"
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
        "Total avoidance of digital systems and returning to manual paper filings.",
        "Continuous workforce training, transparent privacy practices, proactive bias checks, and executive stewardship of customer trust.",
        "Allowing unrestricted employee access to all consumer data for unrestricted analytics.",
        "Selling consumer profiles to third-party data brokers without disclosure.",
        "Storing plain-text passwords in public repository codebases."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 2, Section 3.5 (\"Establishing an Ethical Data Culture\")",
      explanation: "An ethical data culture requires intentional training, accountability, governance review boards, and valuing consumer trust over short-term exploitation."
    },
    {
      id: "DMBOK-DG-01",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "Which governing body in DMBOK2 holds ultimate executive accountability for approving data policies, funding initiatives, and resolving cross-functional disputes?",
      options: [
        "The Departmental BI Guild",
        "The Data Governance Council (DGC) / Steering Committee",
        "The Database Administration Support Team",
        "The Network Operations Center (NOC)",
        "The External Software Auditing Vendor"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 3, Section 2.6 (\"Define the DG Operating Framework\") & Ladley Ch. 11",
      explanation: "The Data Governance Council (DGC) consists of high-ranking executive stakeholders who approve enterprise data policies, allocate resources, and resolve domain disputes."
    },
    {
      id: "DMBOK-DG-02",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "What is the primary responsibility of a Business Data Steward in DAMA DMBOK2 and John Ladley's governance frameworks?",
      options: [
        "Writing low-level kernel drivers for storage area networks (SAN).",
        "Serving as the business subject matter expert accountable for data definitions, quality criteria, and compliance in their domain.",
        "Physically racking and cabling database servers in enterprise data centers.",
        "Executing manual database index reorganizations on weekends.",
        "Installing client desktop spreadsheet productivity software."
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
        "Monolithic Isolated Model",
        "Hybrid / Federated Operating Model",
        "Total Anarchy Model",
        "Ad-Hoc Tactical Silo Model",
        "Centralized Command-and-Control Only Model"
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
        "Data Definition Language (DDL) Schema Script",
        "The Enterprise Business Glossary",
        "Network Firewall Configuration Table",
        "Database Server Transaction Log",
        "Hardware Asset Depreciation Register"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 3, Section 2.14 (\"Develop a Business Glossary\")",
      explanation: "The Business Glossary is the core deliverable that establishes a common business vocabulary, definitions, and domain stewardship across the entire organization."
    },
    {
      id: "DMBOK-DG-05",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "According to John Ladley and DMBOK2, what is the key distinction between Data Governance and Data Management?",
      options: [
        "Data Governance exercises decision authority and control over data assets; Data Management executes operational planning and lifecycle activities.",
        "Data Governance is strictly an IT function; Data Management is exclusively a marketing function.",
        "There is no distinction; the two terms are synonymous in DAMA standards.",
        "Data Management sets enterprise laws; Data Governance executes database backup scripts.",
        "Data Governance is solely concerned with purchasing software licenses."
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
        "Enterprise Architecture Review Board",
        "Data Governance Program Office (DGPO)",
        "Database Backup Operations Desk",
        "Chief Information Security Office",
        "IT Hardware Procurement Department"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 3, Section 2.6 (\"Operating Framework - DGPO\")",
      explanation: "The Data Governance Program Office (DGPO) runs the day-to-day administrative machinery of governance, coordinating stewards, meetings, and metrics."
    },
    {
      id: "DMBOK-DG-07",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "In Data Governance issue management, what is the defined path for issues that cannot be resolved at the stewardship level?",
      options: [
        "Immediate termination of the involved IT contractors.",
        "Escalation to the Data Governance Council (DGC) for executive determination.",
        "Deleting the disputed data columns from all databases.",
        "Abandoning the data governance initiative entirely.",
        "Filing a civil complaint in federal court."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 3, Section 2.10 (\"Engage in Issue Management\")",
      explanation: "Unresolved cross-departmental data conflicts or policy disputes escalate through the Data Governance Council for final binding arbitration."
    },
    {
      id: "DMBOK-DG-08",
      area: "Data Governance",
      chapter: "Chapter 3: Data Governance",
      prompt: "Which metric best demonstrates the business value and impact of a Data Governance program to executive leadership?",
      options: [
        "The total number of SQL queries executed each day.",
        "Reduction in compliance violations, improved data quality scores on critical data elements, and reduced operational rework costs.",
        "The volume of gigabytes stored on database SAN storage arrays.",
        "The number of software patches installed on database servers.",
        "The count of fiber optic cables running in the server room."
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
        "Physical Database Schema",
        "Enterprise Conceptual Data Model (ECDM)",
        "ETL Pipeline Execution Script",
        "Network Packet Inspection Diagram",
        "Table Index Definition DDL"
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
        "Consolidating all organizational data into a single centralized monolithic enterprise data warehouse.",
        "Treating data as a product owned, modeled, and governed directly by cross-functional domain teams closest to the business reality.",
        "Prohibiting all business analysts from writing SQL queries.",
        "Restricting analytical datasets strictly to flat CSV text files.",
        "Forcing all microservices to share one centralized relational database schema."
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
        "A circuit diagram showing electrical current flowing to server power supplies.",
        "A graphical representation showing the movement, transformations, and landing stages of data from origin systems to downstream consumers.",
        "A chart depicting the organizational reporting hierarchy of data scientists.",
        "A Gantt chart tracking the daily attendance of project managers.",
        "A thermal map showing cooling airflow in a server room."
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
        "The network wiring and router configurations.",
        "The progressive breakdown of data entities from conceptual business things down to physical database tables.",
        "The project milestone delivery dates.",
        "The employee payroll allocation schedules.",
        "The physical server rack elevation diagrams."
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
        "The exact configuration of legacy mainframe systems currently in production.",
        "The future-state blueprint representing desired systems, models, and data flows aligned with long-term strategic business goals.",
        "A temporary snapshot of system RAM memory during an ETL failure.",
        "A collection of obsolete database user manuals.",
        "The physical floor plan of an abandoned data facility."
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
        "Data Architecture Governance / Architecture Review Board (ARB)",
        "Database Backup Restoration Drills",
        "Help Desk Ticket Dispatching",
        "Routine OS Security Patching",
        "Employee Performance Reviews"
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
        "To store temporary cache files on mobile client devices.",
        "To provide a generalized, common data format that disparate applications translate to and from during integration, reducing point-to-point connections.",
        "To replace all enterprise relational tables with unstructured text files.",
        "To encrypt network communications at the physical hardware layer.",
        "To calculate employee bonus percentages."
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
        "It is in Second Normal Form (2NF) and contains no transitive functional dependencies (non-key attributes depend solely on the primary key).",
        "All non-key attributes are converted into nested JSON structures.",
        "It contains denormalized summary tables to optimize query speeds.",
        "It permits multi-valued repeating groups across columns.",
        "Every column is indexed with a clustered B-Tree index."
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
        "A dimension table that is strictly isolated within a single departmental data mart without shared surrogate keys.",
        "A dimension shared consistently across multiple business processes and fact tables with uniform keys and attribute definitions.",
        "A dimension that overwrites all past historical data upon every nightly load without tracking change.",
        "A factless fact table designed to capture event occurrences.",
        "A table that only stores database audit log errors."
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
        "Alpha, Beta, Release Candidate",
        "Conceptual, Logical, and Physical Data Models",
        "Relational, Graph, and Document Models",
        "Source, Staging, and Reporting Models",
        "Executive, Managerial, and Operational Models"
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
        "A dimension that overwrites the existing record in place, obliterating history.",
        "A dimension that preserves history by inserting a new record with effective start/end timestamps and an active indicator flag.",
        "A dimension that creates a new column for each historical change.",
        "A dimension that deletes old records permanently from the database.",
        "A dimension that converts text attributes into integer values."
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
        "The cryptographic key strength used on the table columns.",
        "The quantitative numerical relationship between instances of two entities (e.g., 1:1, 1:N, M:N).",
        "The total number of physical gigabytes allocated on disk storage.",
        "The query execution speed in milliseconds.",
        "The network latency between client and database server."
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
        "A natural business identifier like a social security number or email address.",
        "An artificially generated numeric sequence (or UUID) with no intrinsic business meaning, used as a primary key.",
        "A public encryption key stored in a certificate repository.",
        "A database user account with administrative superuser rights.",
        "A foreign key pointing to an external web service API."
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
        "Tables, Views, and Triggers",
        "Hubs (business keys), Links (relationships), and Satellites (context/attributes over time)",
        "Facts, Dimensions, and Aggregates",
        "Nodes, Edges, and Properties",
        "Clusters, Shards, and Replicas"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 5, Section 1.3.8 (\"Data Vault Modeling\")",
      explanation: "Data Vault modeling is built upon Hubs (unique business keys), Links (associations or transactions between Hubs), and Satellites (descriptive historical attributes)."
    },
    {
      id: "DMBOK-MOD-08",
      area: "Data Modeling & Design",
      chapter: "Chapter 5: Data Modeling and Design",
      prompt: "What is an \"Anchor Table\" or Fact Table in dimensional modeling primarily composed of?",
      options: [
        "Only text descriptive columns with no numerical values.",
        "Foreign keys referencing dimension tables and numerical measurement metrics (facts).",
        "Unstructured raw log files.",
        "Database trigger scripts and stored procedures.",
        "User permissions and password hashes."
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
        "REST (Representational State Transfer)",
        "CRUD (Create, Read, Update, Delete)",
        "SOAP (Simple Object Access Protocol)"
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
        "RPO defines maximum acceptable data loss in elapsed time; RTO defines maximum acceptable system downtime to restore service.",
        "RPO measures network speed; RTO measures database backup file size.",
        "RPO applies only to cloud databases; RTO applies solely to on-premises hardware.",
        "RPO is managed by developers; RTO is managed by accounting teams.",
        "They are identical acronyms used interchangeably in database operations."
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
        "Compressing backup files using ZIP encryption.",
        "Horizontally partitioning data across multiple independent database server instances to distribute load.",
        "Physically destroying decommissioned solid-state hard drives.",
        "Creating view indexes on read-only reporting replicas.",
        "Encrypting database communication sockets via SSL."
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
        "Index Defragmentation / Re-indexing",
        "Running nightly schema drop scripts",
        "Resetting root administrative passwords",
        "Overwriting backup archive tapes",
        "Purging user active directory accounts"
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
        "To store employee timesheet entries for database administration teams.",
        "To record changes sequentially before writing to disk pages, ensuring crash recovery and rollback integrity.",
        "To display user interface error popups on client web browsers.",
        "To calculate quarterly software license amortization.",
        "To publish company marketing press releases."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 6, Section 1.3 (\"Essential Concepts\")",
      explanation: "The Write-Ahead Log (WAL) ensures Durability and Atomicity by logging transaction operations before data pages are flushed to permanent storage."
    },
    {
      id: "DMBOK-STO-06",
      area: "Data Storage & Operations",
      chapter: "Chapter 6: Data Storage and Operations",
      prompt: "What does Database Purging / Archival accomplish in enterprise storage operations?",
      options: [
        "Deleting all historical customer orders to free up disk space immediately.",
        "Moving inactive historical data out of operational transactional systems to lower-cost long-term storage while adhering to legal retention policies.",
        "Overriding database constraint checks during end-of-month accounting.",
        "Restarting database servers during peak business hours.",
        "Encrypting source code repositories."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 6, Section 2.2 (\"Manage Database Performance and Capacity\")",
      explanation: "Archival removes cold, non-operational data from production databases, improving transactional query performance and lowering primary storage costs."
    },
    {
      id: "DMBOK-STO-07",
      area: "Data Storage & Operations",
      chapter: "Chapter 6: Data Storage and Operations",
      prompt: "Which role is fundamentally responsible for database software installation, physical schema implementation, performance monitoring, and disaster recovery execution?",
      options: [
        "Data Entry Clerk",
        "Database Administrator (DBA)",
        "Social Media Manager",
        "Creative Art Director",
        "Human Resources Generalist"
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
        "Cloud, Integration, Analytics",
        "Confidentiality, Integrity, Availability",
        "Cost, Identity, Authentication",
        "Centralization, Ingestion, Auditing",
        "Compliance, Innovation, Agility"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 7, Section 1.2 (\"Goals and Principles\")",
      explanation: "The CIA Triad stands for Confidentiality (preventing unauthorized disclosure), Integrity (safeguarding accuracy/completeness), and Availability (ensuring authorized access)."
    },
    {
      id: "DMBOK-SEC-02",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "What is the difference between Data Masking and Encryption according to DMBOK2?",
      options: [
        "Encryption is permanent and cannot be reversed; Masking is always reversible using a password.",
        "Masking alters sensitive values to preserve structural format without allowing reversal (ideal for test environments); encryption scrambles data using algorithms requiring keys for authorized decryption.",
        "Masking applies only to network switches; encryption applies only to web page HTML.",
        "They are identical technical terms with zero difference.",
        "Masking is only permitted in healthcare settings; encryption is prohibited in finance."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 7, Section 3.7 (\"Data Masking/Encryption\")",
      explanation: "Masking replaces sensitive values (e.g., masking credit cards with asterisks) for development/testing; encryption transforms plaintext to ciphertext with mathematical keys for reversibility."
    },
    {
      id: "DMBOK-SEC-03",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "What security model verifies every user and device access request regardless of whether they are located inside or outside the corporate perimeter network?",
      options: [
        "Perimeter Firewall Defense",
        "Zero Trust Architecture",
        "Open Network Trust Model",
        "Single Password Trust Domain",
        "Air-Gapped Workstation Isolation"
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
        "Granting system permissions based on an individual user's astrological sign.",
        "Assigning permissions to organizational job roles, with users granted permissions by virtue of being assigned to those roles.",
        "Allowing all users access to all tables without login credentials.",
        "Changing all passwords automatically every five minutes.",
        "Disabling database encryption during business hours."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 7, Section 1.3 (\"User Identity and Access Management\")",
      explanation: "RBAC simplifies authorization management by provisioning permissions to roles (e.g., Billing Clerk, Auditor) and mapping users to those designated roles."
    },
    {
      id: "DMBOK-SEC-05",
      area: "Data Security",
      chapter: "Chapter 7: Data Security",
      prompt: "What is Data Obfuscation / Anonymization in data security?",
      options: [
        "Deleting entire database instances after quarterly closes.",
        "Irreversibly altering personal data so that the data subject can no longer be identified directly or indirectly.",
        "Increasing database CPU frequency to scramble memory registers.",
        "Publishing confidential passwords in corporate intranet newsletters.",
        "Converting database tables from SQL to XML formats."
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
        "A tool used by database engines to sort rows alphabetically.",
        "A matrix mapping business roles or applications against data entities showing rights to Create, Read, Update, and Delete.",
        "A metric measuring how many hard drives have failed in a SAN array.",
        "A project management schedule for software quality testing.",
        "A list of forbidden SQL keywords."
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
        "Data Security Auditing and Vulnerability Scanning",
        "Manual spreadsheet cell color coding",
        "Nightly server hard-reboot cycles",
        "Deleting historical transaction logs",
        "Disabling firewall intrusion detection rules"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 7, Section 2.1 (\"Identify Security Requirements\")",
      explanation: "Regular vulnerability scans and security audits identify configuration drift, weak authentication parameters, and unpatched security vulnerabilities before exploitation."
    },
    {
      id: "DMBOK-INT-01",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "What is Change Data Capture (CDC) in modern data integration architecture?",
      options: [
        "A software revision control tool used for tracking Git branches.",
        "A technique to detect, record, and stream only the specific rows that have changed (inserted, updated, deleted) in source databases since last extraction.",
        "A backup technique that resets all passwords across an enterprise directory.",
        "A batch process that rebuilds entire database tables from scratch every hour.",
        "A protocol for compressing audio and video streams."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 8, Section 1.3 (\"Essential Concepts - CDC\")",
      explanation: "CDC captures real-time data modifications from database transaction logs without requiring heavy full-table extract scans."
    },
    {
      id: "DMBOK-INT-02",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "How does ELT (Extract-Load-Transform) differ fundamentally from traditional ETL (Extract-Transform-Load)?",
      options: [
        "ELT eliminates all data transformations entirely.",
        "ELT loads raw extracted data directly into the target database/cloud warehouse first, leveraging the destination engine's massively parallel compute to execute transformations.",
        "ELT can only process data stored on magnetic tape reels.",
        "ELT requires manual paper transcription before loading.",
        "ELT prohibits the use of SQL in transformation stages."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 8, Section 1.3 (\"ETL vs. ELT\") & Strengholt Ch. 4",
      explanation: "In ELT, raw data is loaded into scalable cloud data platforms first, and compute-heavy transformations are executed inside the high-performance target system."
    },
    {
      id: "DMBOK-INT-03",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "What is Data Virtualization in enterprise integration?",
      options: [
        "Simulating database hardware inside virtual reality goggles.",
        "Providing a logical data layer that allows users to query heterogeneous source systems in real-time without physically consolidating or moving the data.",
        "Exporting all relational tables to flat CSV files.",
        "Replacing physical database servers with emulated game consoles.",
        "Converting database records into synthesized audio waves."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 8, Section 3.2 (\"Data Virtualization Server\")",
      explanation: "Data Virtualization abstracts underlying distributed data sources, presenting a unified virtual schema for real-time querying without physical ETL copying."
    },
    {
      id: "DMBOK-INT-04",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "What is the role of an Enterprise Service Bus (ESB) or messaging broker in application interoperability?",
      options: [
        "Physically transporting desktop computers between corporate offices.",
        "Decoupling producer and consumer systems by routing and transforming asynchronous messages through standard communication protocols.",
        "Serving as the primary relational database for payroll processing.",
        "Replacing software developers with automated project plans.",
        "Managing corporate email calendar invites."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 8, Section 3.3 (\"Enterprise Service Bus\") & Strengholt Ch. 5",
      explanation: "An ESB/broker decouples systems, routing messages, transforming data formats, and enabling event-driven communication between disparate enterprise applications."
    },
    {
      id: "DMBOK-INT-05",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "What is a Data Sharing Agreement (Service Level Agreement / Data Contract) between data producers and consumers?",
      options: [
        "A contract to purchase cloud storage hardware at a discount.",
        "A formal agreement documenting data formats, delivery frequency, quality expectations, ownership, and permitted usage rights.",
        "A non-disclosure agreement signed by cleaning staff.",
        "A software license agreement for desktop spreadsheets.",
        "A disclaimer stating that data is provided without any quality assurance."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 8, Section 6.1 (\"Data Sharing Agreements\") & Strengholt Ch. 8",
      explanation: "Data Sharing Agreements or Data Contracts define the schemas, SLA latencies, quality thresholds, and responsibilities expected between provider and consumer."
    },
    {
      id: "DMBOK-INT-06",
      area: "Data Integration",
      chapter: "Chapter 8: Data Integration & Interoperability",
      prompt: "Which architecture processes continuous data streams record-by-record with sub-second latencies rather than collecting records in batch intervals?",
      options: [
        "Batch Processing Window",
        "Streaming / Event-Driven Architecture (e.g., Apache Kafka)",
        "Nightly Chronological Dump",
        "Manual File Transfer Protocol (FTP)",
        "Tape Archive Rotation"
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
        "Tracking the genealogies of database administration team leaders.",
        "Tracing the lifecycle path of data from origin systems, through intermediate transformations, down to reporting destinations.",
        "Measuring the physical age of computer motherboard silicon.",
        "Tracking how many software versions a vendor has published.",
        "Logging how many times a user clicked a mouse."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 8, Section 6.2 & Chapter 12 (\"Data Lineage\")",
      explanation: "Data lineage maps data origin, step-by-step transformations, and ultimate analytical consumption, providing transparency for audits and impact analysis."
    },
    {
      id: "DMBOK-DOC-01",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "In Document and Content Management, what is a \"Controlled Vocabulary\"?",
      options: [
        "A predefined, curated list of terms and definitions used to index, tag, and retrieve unstructured content consistently across an organization.",
        "A filter installed on email servers to block profanities.",
        "A dictionary of programming language reserved compiler keywords.",
        "A list of allowed database passwords.",
        "An encryption key schedule for digital signatures."
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 9, Section 3.3 (\"Controlled Vocabulary and Metadata Tools\")",
      explanation: "Controlled vocabularies (including taxonomies and thesauri) standardize terminology to ensure accurate tagging, classification, and retrieval of documents."
    },
    {
      id: "DMBOK-DOC-02",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "What is \"Electronic Discovery\" (e-Discovery) in document management?",
      options: [
        "A game played by IT support staff to discover open network ports.",
        "The legal process of identifying, preserving, collecting, reviewing, and producing electronically stored information (ESI) in response to litigation or investigations.",
        "The automated indexing of web pages by commercial search engines.",
        "Finding discarded hardware servers in electronic waste bins.",
        "Browsing for open-source software libraries on the internet."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 9, Section 3.5 (\"E-Discovery Technology\")",
      explanation: "E-Discovery is the legally mandated process to locate, preserve, and review electronic records (emails, documents, chats) relevant to legal matters."
    },
    {
      id: "DMBOK-DOC-03",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "What is a \"Records Retention Schedule\"?",
      options: [
        "A sports schedule tracking corporate bowling league tournaments.",
        "A policy-driven document defining mandatory periods for retaining and disposing of corporate records based on legal, fiscal, and operational requirements.",
        "A calendar showing database administration shift work.",
        "A schedule for cleaning printer rollers in office copy centers.",
        "A list of corporate board meeting dates."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 9, Section 2.1 (\"Plan for Lifecycle Management\")",
      explanation: "Retention schedules dictate how long categories of records must be preserved for compliance and when they should be destroyed to mitigate legal liability."
    },
    {
      id: "DMBOK-DOC-04",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "What distinguishes unstructured content from structured data in DMBOK2?",
      options: [
        "Unstructured content cannot be read by human beings.",
        "Structured data conforms to fixed data models and schemas (e.g., tables); unstructured content lacks a predefined data model (e.g., PDFs, emails, video).",
        "Unstructured content requires no storage space on hard drives.",
        "Structured data only contains numeric decimal numbers.",
        "Unstructured content is strictly illegal under international law."
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
        "A tax calculation script for corporate accounting.",
        "A hierarchical classification structure of terms and concepts that categorizes content items according to their relationships.",
        "A tool to compress multimedia video files.",
        "A database backup recovery protocol.",
        "A network cable labeling system."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 9, Section 1.3 (\"Taxonomies\")",
      explanation: "A taxonomy arranges knowledge and terms into parent-child hierarchies, enabling intuitive navigation, faceted search, and consistent document indexing."
    },
    {
      id: "DMBOK-DOC-06",
      area: "Document & Content",
      chapter: "Chapter 9: Document and Content Management",
      prompt: "What is \"OCR\" (Optical Character Recognition) utilized for in document digitization?",
      options: [
        "Converting audio voice files into synthesized guitar music.",
        "Converting images of typed, handwritten, or printed text into machine-encoded and searchable text data.",
        "Resetting database administrative passwords.",
        "Routing network packets across wireless routers.",
        "Calculating corporate sales tax rates."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 9, Section 3.1 (\"ECM Systems\")",
      explanation: "OCR software processes scanned paper documents and images into editable, indexable, and searchable digital text representations."
    },
    {
      id: "DMBOK-MDM-01",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "Which statement accurately contrasts Reference Data with Master Data in DMBOK2?",
      options: [
        "Reference Data defines permissible values and classification codes (e.g., ISO currency codes); Master Data represents core enterprise entities (e.g., Customer, Product, Facility).",
        "Master Data updates every millisecond while Reference Data never changes under any circumstances.",
        "Reference Data applies only to unstructured video assets.",
        "Master Data is managed exclusively by third-party hardware vendors.",
        "Reference Data and Master Data are completely identical terms with no distinction."
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 10, Section 1 (\"Introduction\")",
      explanation: "Reference data categorizes other data (codes, country lists, statuses); Master data provides the definitive business context around core business entities."
    },
    {
      id: "DMBOK-MDM-02",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "What is a \"Golden Record\" in Master Data Management (MDM)?",
      options: [
        "A commemorative vinyl award given to outstanding database administrators.",
        "The single, reconciled, authoritative master record representing the best version of truth for an entity instance across disparate source systems.",
        "A database table encrypted with 512-bit RSA hardware chips.",
        "The first row inserted into a relational database table.",
        "A high-priority bug report filed with an enterprise software vendor."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 10, Section 1.3 (\"Golden Record / Single Version of Truth\")",
      explanation: "A Golden Record aggregates, de-duplicates, and reconciles multiple matching records into a single trusted, authoritative master entity."
    },
    {
      id: "DMBOK-MDM-03",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "Which MDM architectural style maintains master data centrally, requiring all transactional source systems to read and write directly to the centralized hub?",
      options: [
        "Registry Style",
        "Centralized (Transactional Hub) Style",
        "Loose Federation Style",
        "Passive Analytical Style",
        "Ad-Hoc Peer-to-Peer Style"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 10, Section 1.3.4 (\"MDM Architecture Styles\")",
      explanation: "In the Centralized/Transactional style, the MDM hub is the authoring master system of record where all updates and transactions originate or synchronize."
    },
    {
      id: "DMBOK-MDM-04",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "In contrast to the Centralized MDM style, how does the \"Registry\" MDM style operate?",
      options: [
        "It physically duplicates all database records to overseas data centers.",
        "It leaves master records in their local source systems, storing only cross-reference keys and matching rules in a central lightweight index to identify duplicates.",
        "It deletes all source system databases and converts them to spreadsheets.",
        "It mandates that users manually type customer records into paper ledgers.",
        "It encrypts database tables so that no queries can be run."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 10, Section 1.3.4 (\"MDM Architecture Styles - Registry\")",
      explanation: "The Registry style creates a lightweight index of pointers and cross-system mappings without consolidating or modifying the underlying operational source databases."
    },
    {
      id: "DMBOK-MDM-05",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "What is \"Entity Resolution\" (Match and Merge) in Master Data Management?",
      options: [
        "Rebooting database servers to resolve memory fragmentation.",
        "The algorithmic process of determining whether two records across different systems represent the same real-world entity and unifying them.",
        "Upgrading database software to a new minor patch release.",
        "Calculating monthly sales commissions for account executives.",
        "Configuring domain name server (DNS) routing records."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 10, Section 2.1 (\"MDM Activities - Match and Merge\")",
      explanation: "Entity resolution uses deterministic and probabilistic matching algorithms to link and merge records that represent the exact same customer, vendor, or product."
    },
    {
      id: "DMBOK-MDM-06",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "Which entity is universally recognized as a primary Master Data subject area across almost all industries?",
      options: [
        "Server CPU fan speed sensor readings",
        "Customer (or Patient / Citizen / Party)",
        "Ephemeral web server HTTP error codes",
        "Nightly ETL log job batch run numbers",
        "Network printer toner level percentages"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 10, Section 1 (\"Introduction - Master Data Entities\")",
      explanation: "Party (Customer, Patient, Citizen), Product, Financial Account, Location, and Vendor represent the universal core master entities across enterprises."
    },
    {
      id: "DMBOK-MDM-07",
      area: "Reference & Master Data",
      chapter: "Chapter 10: Reference and Master Data",
      prompt: "What is an example of external standardized Reference Data commonly adopted by global enterprises?",
      options: [
        "Internal employee nicknames created in private chat channels.",
        "ISO 3166 Country Codes and ISO 4217 Currency Codes.",
        "A temporary shopping cart ID generated on an e-commerce website.",
        "A developer's personal computer IP address.",
        "A single customer invoice number."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 10, Section 1.3 (\"Reference Data Types\")",
      explanation: "ISO country and currency codes, postal abbreviations, and industry NAICS codes are standard external reference datasets widely ingested by organizations."
    },
    {
      id: "DMBOK-DW-01",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "In Data Warehousing architecture, what is the core philosophy of Bill Inmon's Corporate Information Factory (CIF)?",
      options: [
        "A normalized (3NF) centralized Enterprise Data Warehouse (EDW) serving as the single source of truth, from which departmental dimensional data marts are populated.",
        "Discarding centralized data warehouses in favor of uncoordinated independent data marts.",
        "Directly querying transactional operational tables for all business reporting needs.",
        "Eliminating relational storage in favor of unstructured flat text files.",
        "Restricting analytical reporting exclusively to mobile smartphone devices."
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.3 (\"DW Architecture Philosophies - Inmon vs. Kimball\")",
      explanation: "Bill Inmon advocates a top-down EDW modeled in 3NF to capture enterprise truth, which subsequently feeds departmental dimensional data marts."
    },
    {
      id: "DMBOK-DW-02",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "In contrast to Bill Inmon, what is Ralph Kimball's primary architectural approach to Data Warehousing?",
      options: [
        "A centralized 3NF repository that prohibits dimensional star schemas.",
        "An Enterprise Data Warehouse built bottom-up as a confederation of conformed dimensional data marts (dimensional star schemas).",
        "Storing all data inside unindexed JSON document databases.",
        "Refusing to aggregate or summarize transaction logs.",
        "Using manual paper spreadsheets for business intelligence."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.3 (\"Kimball Dimensional Architecture\")",
      explanation: "Ralph Kimball's dimensional design builds the enterprise warehouse out of conformed star schemas and dimensional data marts linked by shared dimensions."
    },
    {
      id: "DMBOK-DW-03",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "In a Star Schema design, what is the difference between a Star Schema and a Snowflake Schema?",
      options: [
        "A Star schema has no fact tables; a Snowflake schema has multiple fact tables.",
        "In a Star schema, dimension tables are completely denormalized; in a Snowflake schema, dimensions are normalized into secondary lookup tables.",
        "A Snowflake schema can only be queried in winter months.",
        "Star schemas are strictly used for financial transactions; Snowflake schemas are used for marketing.",
        "There is no architectural difference between the two schemas."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.3 (\"Star vs. Snowflake Schemas\")",
      explanation: "Snowflake schemas normalize dimension tables to reduce redundancy, splitting them into secondary hierarchies, whereas Star schemas denormalize them for query speed."
    },
    {
      id: "DMBOK-DW-04",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "What is a \"Factless Fact Table\" in dimensional data modeling?",
      options: [
        "A corrupt database table that has lost its numerical data due to hardware failure.",
        "A fact table that contains only dimensional keys and no numeric metrics, used to record events (e.g., student attendance) or coverage conditions.",
        "A dimension table with zero foreign keys.",
        "A temporary table used solely during database software upgrades.",
        "A reporting dashboard that displays only graphic charts."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.3 (\"Dimensional Modeling Concepts\")",
      explanation: "Factless fact tables record events or circumstances (e.g., class attendance, marketing coverage) that contain foreign keys linking dimensions without numerical measures."
    },
    {
      id: "DMBOK-DW-05",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "What is the primary risk associated with \"Spreadmarts\" (uncontrolled desktop spreadsheets acting as data marts)?",
      options: [
        "They consume too much printer paper in corporate mailrooms.",
        "Data silos, conflicting metrics, lack of auditability, security vulnerabilities, and inconsistent business decisions.",
        "They accelerate enterprise database query performance too significantly.",
        "They prevent software developers from learning SQL programming.",
        "They cause monitor screens to flicker."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 11, Section 1.1 (\"Business Drivers - Spreadmarts\")",
      explanation: "Spreadmarts breed competing versions of the truth, lack data governance controls, and risk exposing sensitive information through unsecured desktop files."
    },
    {
      id: "DMBOK-DW-06",
      area: "Data Warehousing & BI",
      chapter: "Chapter 11: DW and Business Intelligence",
      prompt: "What capability does \"OLAP\" (Online Analytical Processing) provide to business analysts?",
      options: [
        "Executing high-frequency single-row credit card authorization writes.",
        "Multidimensional analysis of consolidated enterprise data with drill-down, roll-up, and slicing capabilities.",
        "Generating real-time printer driver firmware updates.",
        "Formatting text in corporate word processing documents.",
        "Managing physical network cabling switches."
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
        "A small recreational building near a reservoir where servers are washed.",
        "An architectural pattern that combines the cost-effective scalability of object data lakes with the ACID transactions, schema enforcement, and governance of traditional data warehouses.",
        "A database table dedicated to recording water utility meter readings.",
        "An outdated mainframe storage system from the 1970s.",
        "A software program that deletes stale database backups."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 11 & Strengholt Ch. 1 (\"Data Lakehouse Evolution\")",
      explanation: "Data Lakehouses unite the scalable unstructured storage of data lakes with the schema controls, ACID guarantees, and SQL performance of data warehouses."
    },
    {
      id: "DMBOK-META-01",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "Which category of metadata documents data lineage, transformation execution times, log counts, and file sizes in data pipelines?",
      options: [
        "Operational Metadata",
        "Business Metadata",
        "Descriptive Metadata",
        "Conceptual Metadata",
        "Aesthetic Metadata"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 12, Section 1.3 (\"Types of Metadata\")",
      explanation: "Operational metadata details processing runtime metrics (execution timestamps, job logs, row counts, error codes, and batch run durations)."
    },
    {
      id: "DMBOK-META-02",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "What constitutes \"Business Metadata\" in DMBOK2?",
      options: [
        "The physical clock speed of the CPU processor chips.",
        "Business terms, semantic definitions, calculation formulas, data owners, security classifications, and business rules.",
        "Database index B-Tree leaf node block allocations.",
        "The manufacturer serial numbers of network routers.",
        "The voltage specifications of data center power supplies."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 12, Section 1.3 (\"Types of Metadata - Business\")",
      explanation: "Business metadata provides the business context, defining term meanings, operational business rules, data ownership, and sensitivity ratings."
    },
    {
      id: "DMBOK-META-03",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "What constitutes \"Technical Metadata\"?",
      options: [
        "Executive summaries written for corporate annual reports.",
        "Physical table names, column data types, index definitions, primary and foreign key constraints, and storage paths.",
        "Employee performance evaluation ratings.",
        "Marketing brand color style guidelines.",
        "Customer sentiment survey reviews."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 12, Section 1.3 (\"Types of Metadata - Technical\")",
      explanation: "Technical metadata describes the technical artifacts, systems, table structures, field formats, schemas, and connection details."
    },
    {
      id: "DMBOK-META-04",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "What is a \"Metadata Repository\" (or Enterprise Data Catalog)?",
      options: [
        "A filing cabinet storing printed database printouts.",
        "A centralized or federated database system that stores, indexes, integrates, and manages metadata from across an organization's diverse technical assets.",
        "A script that converts database tables to HTML web pages.",
        "An archive storage facility for decommissioned backup tapes.",
        "A billing system for software subscription licenses."
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
        "It evaluates the structural impact of earthquakes on data center foundations.",
        "It enables architects to analyze upstream and downstream dependencies before changing a data structure, preventing unexpected pipeline breakages.",
        "It measures how much electricity database servers consume.",
        "It tracks employee computer screen time.",
        "It evaluates changes in competitor stock market valuations."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 12, Section 4.1 (\"Lineage and Impact Analysis\")",
      explanation: "Impact analysis traces dependencies, revealing exactly which downstream tables, pipelines, and reports will break if a column or schema changes."
    },
    {
      id: "DMBOK-META-06",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "Which metadata architecture collects and synchronizes metadata into a single centralized physical store from all environment sources?",
      options: [
        "Distributed Virtual Architecture",
        "Centralized Metadata Repository Architecture",
        "Peer-to-Peer Unregistered Model",
        "Ephemeral Stateless Design",
        "Disconnected Silo Architecture"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 12, Section 2.3 (\"Define Metadata Architecture\")",
      explanation: "A centralized metadata architecture copies metadata from all sources into a single unified database repository for fast queries and consistency."
    },
    {
      id: "DMBOK-META-07",
      area: "Metadata Management",
      chapter: "Chapter 12: Metadata Management",
      prompt: "What does the Dublin Core Metadata Initiative define?",
      options: [
        "A list of financial accounting regulations for European banks.",
        "A standardized set of fifteen core metadata elements (e.g., Title, Creator, Subject) used universally for describing digital and physical resources.",
        "A software compiler for compiling Python applications.",
        "A database transaction benchmark test.",
        "A standard for fiber optic communication cables."
      ],
      correct: 1,
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
        "Timeliness",
        "Uniqueness",
        "Consistency",
        "Precision"
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
        "Routinely paying consultants to manually edit production database tables.",
        "Preventing defects at the point of origin through validation rules, source controls, and root cause correction.",
        "Tolerating errors in reporting and leaving consumers to guess correct figures.",
        "Deleting any transaction record that generates an exception log.",
        "Disabling database constraint checks to accelerate data entry speeds."
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
        "Accuracy",
        "Storage Density",
        "Network Latency",
        "Query Volume",
        "File Format"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 13, Section 1.3 (\"Data Quality Dimensions - Accuracy\")",
      explanation: "Accuracy measures truthfulness: whether recorded attributes correctly mirror the real-world object, balance, or occurrence."
    },
    {
      id: "DMBOK-DQ-04",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "What is \"Data Profiling\" in a Data Quality management program?",
      options: [
        "Investigating the credit history of business analysts.",
        "Using statistical analysis and pattern evaluation to discover the true structure, content, completeness, and anomalies within existing datasets.",
        "Formatting report charts with company brand colors.",
        "Writing user documentation for client billing applications.",
        "Creating social media profile avatars for data stewards."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 13, Section 3.1 (\"Data Profiling Tools\")",
      explanation: "Data profiling examines actual data contents, evaluating null counts, value frequencies, pattern distributions, and constraint violations."
    },
    {
      id: "DMBOK-DQ-05",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "Which data quality dimension evaluates whether data values are identical and non-contradictory across different systems and reports?",
      options: [
        "Consistency",
        "Latency",
        "Modularity",
        "Compression",
        "Verbosity"
      ],
      correct: 0,
      dmbokRef: "DMBOK2 Chapter 13, Section 1.3 (\"Data Quality Dimensions - Consistency\")",
      explanation: "Consistency verifies that data across multiple databases, datamarts, and reports aligns without contradictions in values or definitions."
    },
    {
      id: "DMBOK-DQ-06",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "In Statistical Process Control (SPC) applied to Data Quality (as described in DMBOK2 Ch. 13 and Bad Data Handbook), what do Control Charts reveal?",
      options: [
        "Employee vacation schedules.",
        "Whether variations in data quality metrics are part of normal common-cause noise or represent special-cause anomalies requiring remediation.",
        "The physical temperature of server CPUs.",
        "The daily financial market closing prices.",
        "The number of printed pages in an office."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 13, Section 4.5 (\"Statistical Process Control\")",
      explanation: "Control charts use upper and lower control limits to differentiate routine process variation from anomalous spikes that signal operational failures."
    },
    {
      id: "DMBOK-DQ-07",
      area: "Data Quality",
      chapter: "Chapter 13: Data Quality",
      prompt: "What is a \"Data Quality Scorecard / Dashboard\"?",
      options: [
        "A gaming scoreboard used in internal esports competitions.",
        "A reporting visual displaying quantitative conformance of Critical Data Elements (CDEs) against predefined quality thresholds over time.",
        "A spreadsheet recording vendor invoices.",
        "A terminal command line for formatting hard drives.",
        "A security badge reader log at office doorways."
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
        "A data field that causes the database to crash whenever queried.",
        "A data attribute critical to operational success, regulatory compliance, risk management, or strategic executive decision-making.",
        "A forgotten data table that has not been updated in over ten years.",
        "A column containing only encrypted hexadecimal codes.",
        "A temporary variable used inside a software loop."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 13, Section 2.3 (\"Identify Critical Data and Business Rules\")",
      explanation: "CDEs are high-value fields (e.g., Customer Tax ID, Account Balance, Product SKU) prioritized for strict governance and quality monitoring."
    },
    {
      id: "DMBOK-BD-01",
      area: "Big Data & Data Science",
      chapter: "Chapter 14: Big Data and Data Science",
      prompt: "According to Eric Brewer's CAP Theorem, which two guarantees can a distributed data system provide simultaneously during a network partition event?",
      options: [
        "Both Consistency and Availability simultaneously (CA during P)",
        "Either Consistency or Availability (CP or AP, but not both CA when P occurs)",
        "Cost and Performance without trade-off",
        "Encryption and Compression simultaneously without CPU overhead",
        "Centralization and Total Scalability"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 14, Section 1.3 (\"CAP Theorem\")",
      explanation: "The CAP Theorem proves that when a network Partition (P) occurs in a distributed system, one must trade off between Consistency (C) and Availability (A)."
    },
    {
      id: "DMBOK-BD-02",
      area: "Big Data & Data Science",
      chapter: "Chapter 14: Big Data and Data Science",
      prompt: "Which set of characteristics defines the classic \"V-Dimensions\" of Big Data in DMBOK2?",
      options: [
        "Validity, Visuals, Virtualization, Vectors",
        "Volume, Velocity, Variety, Veracity, and Value",
        "Virtual, Volatile, Vulnerable, Variable",
        "Vertical, Variance, Vectors, Verification",
        "Visibility, Viability, Versatility, Volume"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 14, Section 1.3 (\"The V's of Big Data\")",
      explanation: "Big Data is characterized by Volume (scale), Velocity (speed), Variety (formats), Veracity (trustworthiness), and Value (business impact)."
    },
    {
      id: "DMBOK-BD-03",
      area: "Big Data & Data Science",
      chapter: "Chapter 14: Big Data and Data Science",
      prompt: "What is \"Data Wrangling\" (or Data Munging) in the data science lifecycle?",
      options: [
        "Deleting old databases from backup servers.",
        "The iterative process of cleaning, transforming, reshaping, and enriching raw messy data into a structured format ready for statistical modeling.",
        "Writing executive presentation summaries for annual reports.",
        "Installing network patch cords in server racks.",
        "Setting up user active directory accounts."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 14 & Bad Data Handbook Ch. 1",
      explanation: "Wrangling converts raw, inconsistent, or poorly structured data into clean feature sets suitable for analytical and machine learning algorithms."
    },
    {
      id: "DMBOK-MAT-01",
      area: "Maturity Assessment",
      chapter: "Chapter 15: Data Management Maturity",
      prompt: "In standard Data Management Maturity Assessments (e.g., CMMI-based DMM or DAMA DMMA), what characterizes Level 3 maturity?",
      options: [
        "Ad-hoc, undocumented practices relying entirely on individual heroics (Level 1).",
        "Defined standard processes documented, standardized, and consistently integrated across the enterprise.",
        "Complete lack of data awareness with zero documented policies (Level 0).",
        "Fully autonomous AI systems that govern databases without human involvement (Level 6).",
        "Departmental silos that actively refuse to share records."
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 15, Section 1.3 (\"Maturity Levels\") & Caballero Ch. 7",
      explanation: "Level 3 (\"Defined\") indicates that standard data management practices, roles, and procedures are documented, repeatable, and practiced enterprise-wide."
    },
    {
      id: "DMBOK-MAT-02",
      area: "Maturity Assessment",
      chapter: "Chapter 15: Data Management Maturity",
      prompt: "What is the highest level of maturity (Level 5) in standard maturity models?",
      options: [
        "Initial / Ad-Hoc",
        "Managed / Repeatable",
        "Defined / Standardized",
        "Optimizing / Measured Continuous Improvement",
        "Chaotic / Undefined"
      ],
      correct: 3,
      dmbokRef: "DMBOK2 Chapter 15, Section 1.3 (\"Maturity Levels\")",
      explanation: "Level 5 (\"Optimizing\") represents the pinnacle where processes are quantitatively measured and continuously improved through automated feedback loops."
    },
    {
      id: "DMBOK-ORG-01",
      area: "Organization & Roles",
      chapter: "Chapter 16: Organization and Roles",
      prompt: "Which executive leader is primarily responsible for treating data as a strategic corporate asset, establishing data literacy, and aligning data capabilities with enterprise business strategy?",
      options: [
        "Senior Database Administrator",
        "Chief Data Officer (CDO)",
        "Network Security Operator",
        "Facilities Manager",
        "Help Desk Lead"
      ],
      correct: 1,
      dmbokRef: "DMBOK2 Chapter 16, Section 6.1 (\"The Chief Data Officer\") & Carl Anderson Ch. 11",
      explanation: "The Chief Data Officer (CDO) leads enterprise data strategy, governance, analytics democratization, and cultural literacy, bridging business and technology."
    },
    {
      id: "DMBOK-ORG-02",
      area: "Data Culture & Literacy",
      chapter: "Gartner & DMBOK Culture Frameworks",
      prompt: "According to Gartner and Carl Anderson (Creating a Data-Driven Organization), what is an \"Anti-HiPPO\" culture in data-informed decision making?",
      options: [
        "A culture that strictly defers to the \"Highest Paid Person's Opinion\" regardless of empirical findings.",
        "A culture that empowers teams to test hypotheses and rely on evidence, metrics, and empirical data rather than unquestioned executive opinion.",
        "A database compression scheme that reduces disk storage overhead.",
        "A software program that deletes stale user spreadsheets.",
        "A project management methodology that bans all meetings."
      ],
      correct: 1,
      dmbokRef: "Carl Anderson Ch. 10 (\"Data-Driven Culture: Anti-HiPPO\") & Gartner D&A Literacy",
      explanation: "HiPPO stands for \"Highest Paid Person's Opinion.\" An anti-HiPPO culture relies on empirical data, rigorous testing, and metrics rather than purely hierarchical authority."
    }
  ];

  window.CDMP_QUESTION_BANK = QUESTIONS;
  window.CDMP_AREA_DIMENSIONS = AREA_DIMENSIONS;
})();
