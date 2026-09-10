#!/usr/bin/env node
/**
 * Renders the article diagrams from the copy below into assets/images/blog.
 *
 * Every published article carries one diagram, and every diagram exists in
 * English, Spanish and Portuguese, so the file this reads is the single place
 * the three versions of a picture are kept next to each other. Translating a
 * label means editing one line here and re-running, rather than editing three
 * SVGs by hand and hoping they stay in step.
 *
 * The output is committed, because the site's build refuses to start when an
 * article references an image that is not on disk, and because the CMS media
 * library lists what is in the repository. So this is a tool you run when the
 * copy changes -- `npm run diagrams` -- in the same spirit as
 * scripts/refresh-simulator-insights.mjs, not a build step. `--check` proves
 * the committed files still match the copy, which is what npm run check calls.
 *
 * Layouts and the house style live in scripts/lib/diagram-render.mjs.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDiagram } from './lib/diagram-render.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = path.join(ROOT, 'assets/images/blog');
const LANGUAGES = ['en', 'es', 'pt'];

/**
 * One entry per article.
 *
 * `article` holds the slug of the markdown file in each language, so the figure
 * lines this can print land in the right file. `layout` picks the shape from
 * diagram-render.mjs, and the per-language block carries both the diagram copy
 * and the alt text and caption the article needs.
 *
 * Every article already contains a table, so none of these diagrams restates
 * one. Each adds the shape the prose is describing: a sequence, a spectrum, a
 * boundary, a two-by-two, a wheel.
 */
export const DIAGRAMS = [
  // -----------------------------------------------------------------------
  {
    slug: 'data-governance-roles',
    layout: 'stack',
    article: {
      en: 'when-good-data-goes-bad-why-end-to-end-data-quality-is-the-backbone-of-governance',
      es: 'cuando-los-datos-buenos-se-vuelven-malos-la-calidad-de-datos-end-to-end-como-columna-vertebral-del-gobierno',
      pt: 'quando-dados-bons-se-tornam-ruins-por-que-a-qualidade-de-dados-end-to-end-e-a-espinha-dorsal-da-governanca',
    },
    en: {
      eyebrow: 'END-TO-END DATA QUALITY: WHO IS ACCOUNTABLE',
      title: 'Data governance organizational accountability for data quality',
      description:
        'Four roles in sequence — data owner, data steward, data engineer and business consumer — each with the data quality responsibility it holds, and a feedback path from the business consumer back to the data steward.',
      figure: {
        alt: 'Data Governance Organizational Accountability Diagram',
        caption:
          'Who is accountable for data quality at each stage of the pipeline, and where a business consumer takes a discrepancy.',
      },
      loop: { label: 'ESCALATION' },
      items: [
        {
          kicker: 'STRATEGIC ACCOUNTABILITY',
          title: 'Data owner',
          body: 'Defines what high-quality data means in business terms, sets the acceptable error thresholds, and approves the remediation budget.',
        },
        {
          kicker: 'TACTICAL OVERSIGHT',
          title: 'Data steward',
          body: 'Writes the validation rules, investigates why a check failed, and owns both the remediation workflow and the glossary definition behind it.',
        },
        {
          kicker: 'TECHNICAL EXECUTION',
          title: 'Data engineer',
          body: 'Builds the automated tests into the pipeline, so a failed check halts the run and routes the corrupted records to quarantine.',
        },
        {
          kicker: 'ACTIVE FEEDBACK LOOP',
          title: 'Business consumer',
          body: 'Reads the numbers, and escalates a discrepancy to the steward rather than rebuilding the metric in a shadow spreadsheet nobody governs.',
        },
      ],
    },
    es: {
      eyebrow: 'CALIDAD DE DATOS END-TO-END: QUIÉN RESPONDE',
      title: 'Responsabilidad organizativa sobre la calidad de los datos',
      description:
        'Cuatro roles en secuencia — propietario de datos, data steward, ingeniero de datos y consumidor de negocio — cada uno con la responsabilidad de calidad que le corresponde, y la vía de escalado que devuelve una discrepancia del consumidor al steward.',
      figure: {
        alt: 'Diagrama de responsabilidad organizativa en el gobierno de datos',
        caption:
          'Quién responde por la calidad de los datos en cada etapa del pipeline, y a dónde lleva un consumidor de negocio una discrepancia.',
      },
      loop: { label: 'ESCALADO' },
      items: [
        {
          kicker: 'RESPONSABILIDAD ESTRATÉGICA',
          title: 'Propietario de datos',
          body: 'Define qué significa un dato de calidad en términos de negocio, fija los umbrales de error aceptables y aprueba el presupuesto de remediación.',
        },
        {
          kicker: 'SUPERVISIÓN TÁCTICA',
          title: 'Data steward',
          body: 'Escribe las reglas de validación, investiga por qué falló un control y es dueño tanto del flujo de remediación como de la definición del glosario.',
        },
        {
          kicker: 'EJECUCIÓN TÉCNICA',
          title: 'Ingeniero de datos',
          body: 'Integra las pruebas automáticas en el pipeline, de modo que un control fallido detiene la ejecución y envía los registros corruptos a cuarentena.',
        },
        {
          kicker: 'BUCLE DE RETROALIMENTACIÓN',
          title: 'Consumidor de negocio',
          body: 'Lee las cifras y escala la discrepancia al steward en lugar de reconstruir la métrica en una hoja de cálculo paralela que nadie gobierna.',
        },
      ],
    },
    pt: {
      eyebrow: 'QUALIDADE DE DADOS END-TO-END: QUEM RESPONDE',
      title: 'Responsabilidade organizacional pela qualidade dos dados',
      description:
        'Quatro papéis em sequência — proprietário dos dados, data steward, engenheiro de dados e consumidor de negócio — cada um com a responsabilidade de qualidade que lhe cabe, e o caminho de escalonamento que leva a divergência do consumidor de volta ao steward.',
      figure: {
        alt: 'Diagrama de responsabilidade organizacional na governança de dados',
        caption:
          'Quem responde pela qualidade dos dados em cada etapa do pipeline, e para onde um consumidor de negócio leva uma divergência.',
      },
      loop: { label: 'ESCALONAMENTO' },
      items: [
        {
          kicker: 'RESPONSABILIDADE ESTRATÉGICA',
          title: 'Proprietário dos dados',
          body: 'Define o que é um dado de qualidade em termos de negócio, fixa os limites de erro aceitáveis e aprova o orçamento de remediação.',
        },
        {
          kicker: 'SUPERVISÃO TÁTICA',
          title: 'Data steward',
          body: 'Escreve as regras de validação, investiga por que um controle falhou e é dono tanto do fluxo de remediação quanto da definição do glossário.',
        },
        {
          kicker: 'EXECUÇÃO TÉCNICA',
          title: 'Engenheiro de dados',
          body: 'Integra os testes automáticos ao pipeline, de forma que um controle reprovado interrompe a execução e manda os registros corrompidos para quarentena.',
        },
        {
          kicker: 'CICLO DE RETORNO ATIVO',
          title: 'Consumidor de negócio',
          body: 'Lê os números e escala a divergência ao steward em vez de reconstruir a métrica em uma planilha paralela que ninguém governa.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'governance-operating-models',
    layout: 'flow',
    article: {
      en: 'building-a-data-governance-operating-model',
      es: 'como-construir-un-modelo-operativo-de-gobierno-de-datos',
      pt: 'como-criar-um-modelo-operacional-de-governanca-de-dados',
    },
    en: {
      eyebrow: 'CHOOSING A GOVERNANCE OPERATING MODEL',
      title: 'The three data governance operating models and what each one trades away',
      description:
        'Three operating models on a spectrum from centralised to federated to decentralised, with what each one buys and what it gives up, along an axis running from consistency to speed.',
      figure: {
        alt: 'The three data governance operating models on a spectrum from consistency to speed',
        caption:
          'Centralised, federated and decentralised governance, and the trade between consistency and speed that each one makes.',
      },
      axis: { from: 'CONSISTENCY', to: 'SPEED' },
      stages: [
        {
          title: 'Centralised',
          body: 'One team owns every definition. Consistent, and a bottleneck the moment the second domain arrives.',
        },
        {
          title: 'Federated',
          body: 'A central team sets the standard; each domain applies it and owns its own data. The model most organisations end up needing.',
        },
        {
          title: 'Decentralised',
          body: 'Each domain governs itself. Fast, until two domains define the same customer differently.',
        },
      ],
    },
    es: {
      eyebrow: 'CÓMO ELEGIR EL MODELO OPERATIVO DE GOBIERNO',
      title: 'Los tres modelos operativos de gobierno de datos y lo que cede cada uno',
      description:
        'Tres modelos operativos en un espectro de centralizado a federado a descentralizado, con lo que compra cada uno y lo que entrega a cambio, sobre un eje que va de la consistencia a la velocidad.',
      figure: {
        alt: 'Los tres modelos operativos de gobierno de datos en un espectro de consistencia a velocidad',
        caption:
          'Gobierno centralizado, federado y descentralizado, y el intercambio entre consistencia y velocidad que hace cada uno.',
      },
      axis: { from: 'CONSISTENCIA', to: 'VELOCIDAD' },
      stages: [
        {
          title: 'Centralizado',
          body: 'Un solo equipo es dueño de cada definición. Consistente, y un cuello de botella en cuanto llega el segundo dominio.',
        },
        {
          title: 'Federado',
          body: 'Un equipo central fija el estándar; cada dominio lo aplica y es dueño de sus datos. El modelo que casi todas las organizaciones acaban necesitando.',
        },
        {
          title: 'Descentralizado',
          body: 'Cada dominio se gobierna solo. Rápido, hasta que dos dominios definen al mismo cliente de forma distinta.',
        },
      ],
    },
    pt: {
      eyebrow: 'COMO ESCOLHER O MODELO OPERACIONAL DE GOVERNANÇA',
      title: 'Os três modelos operacionais de governança e o que cada um abre mão',
      description:
        'Três modelos operacionais num espectro de centralizado a federado a descentralizado, com o que cada um compra e o que entrega em troca, sobre um eixo que vai da consistência à velocidade.',
      figure: {
        alt: 'Os três modelos operacionais de governança de dados num espectro de consistência a velocidade',
        caption:
          'Governança centralizada, federada e descentralizada, e a troca entre consistência e velocidade que cada uma faz.',
      },
      axis: { from: 'CONSISTÊNCIA', to: 'VELOCIDADE' },
      stages: [
        {
          title: 'Centralizado',
          body: 'Um único time é dono de cada definição. Consistente, e um gargalo no momento em que chega o segundo domínio.',
        },
        {
          title: 'Federado',
          body: 'Um time central define o padrão; cada domínio o aplica e é dono dos seus dados. O modelo que a maioria das organizações acaba precisando.',
        },
        {
          title: 'Descentralizado',
          body: 'Cada domínio se governa sozinho. Rápido, até dois domínios definirem o mesmo cliente de formas diferentes.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'governance-management-boundary',
    layout: 'bridge',
    article: {
      en: 'data-governance-vs-data-management-key-differences-real-examples',
      es: 'gobernanza-de-datos-vs-gestion-de-datos-diferencias-clave-y-ejemplos-reales',
      pt: 'governanca-de-dados-vs-gestao-de-dados-diferencas-chave-e-exemplos-reais',
    },
    en: {
      eyebrow: 'WHERE GOVERNANCE ENDS AND MANAGEMENT BEGINS',
      title: 'The boundary between data governance and data management',
      description:
        'Three shared artifacts — the business glossary, data quality rules and access policy — with the decision each one needs from governance on the left and the delivery each one needs from data management on the right.',
      figure: {
        alt: 'Three shared artifacts with the governance decision on one side and the data management delivery on the other',
        caption:
          'The same three artifacts belong to both disciplines: governance decides what they say, data management makes them work.',
      },
      left: 'GOVERNANCE DECIDES',
      middle: 'SHARED ARTIFACT',
      right: 'MANAGEMENT DELIVERS',
      rows: [
        {
          artifact: 'Business glossary',
          left: 'Approves the definition of an active customer and names the owner who defends it.',
          right: 'Publishes it in the catalogue and wires it to the tables and reports that use it.',
        },
        {
          artifact: 'Data quality rules',
          left: 'Sets the threshold that counts as acceptable and who is called when it breaks.',
          right: 'Runs the checks in the pipeline and quarantines the records that fail them.',
        },
        {
          artifact: 'Access policy',
          left: 'Rules who may see which data, for which purpose, and for how long.',
          right: 'Provisions the roles, enforces masking, and produces the access audit trail.',
        },
      ],
    },
    es: {
      eyebrow: 'DÓNDE TERMINA EL GOBIERNO Y EMPIEZA LA GESTIÓN',
      title: 'La frontera entre gobierno de datos y gestión de datos',
      description:
        'Tres artefactos compartidos — el glosario de negocio, las reglas de calidad y la política de acceso — con la decisión que cada uno necesita del gobierno a la izquierda y la entrega que cada uno necesita de la gestión de datos a la derecha.',
      figure: {
        alt: 'Tres artefactos compartidos con la decisión de gobierno a un lado y la entrega de la gestión de datos al otro',
        caption:
          'Los mismos tres artefactos pertenecen a ambas disciplinas: el gobierno decide qué dicen, la gestión los hace funcionar.',
      },
      left: 'EL GOBIERNO DECIDE',
      middle: 'ARTEFACTO COMPARTIDO',
      right: 'LA GESTIÓN ENTREGA',
      rows: [
        {
          artifact: 'Glosario de negocio',
          left: 'Aprueba la definición de cliente activo y designa al propietario que la defiende.',
          right: 'Lo publica en el catálogo y lo conecta con las tablas e informes que lo usan.',
        },
        {
          artifact: 'Reglas de calidad',
          left: 'Fija el umbral que se considera aceptable y a quién se llama cuando se rompe.',
          right: 'Ejecuta los controles en el pipeline y pone en cuarentena los registros que fallan.',
        },
        {
          artifact: 'Política de acceso',
          left: 'Decide quién puede ver qué datos, con qué finalidad y durante cuánto tiempo.',
          right: 'Aprovisiona los roles, aplica el enmascarado y genera la traza de auditoría.',
        },
      ],
    },
    pt: {
      eyebrow: 'ONDE A GOVERNANÇA TERMINA E A GESTÃO COMEÇA',
      title: 'A fronteira entre governança de dados e gestão de dados',
      description:
        'Três artefatos compartilhados — o glossário de negócio, as regras de qualidade e a política de acesso — com a decisão que cada um exige da governança à esquerda e a entrega que cada um exige da gestão de dados à direita.',
      figure: {
        alt: 'Três artefatos compartilhados com a decisão da governança de um lado e a entrega da gestão de dados do outro',
        caption:
          'Os mesmos três artefatos pertencem às duas disciplinas: a governança decide o que eles dizem, a gestão os faz funcionar.',
      },
      left: 'A GOVERNANÇA DECIDE',
      middle: 'ARTEFATO COMUM',
      right: 'A GESTÃO ENTREGA',
      rows: [
        {
          artifact: 'Glossário de negócio',
          left: 'Aprova a definição de cliente ativo e nomeia o dono que a defende.',
          right: 'Publica no catálogo e liga às tabelas e relatórios que a utilizam.',
        },
        {
          artifact: 'Regras de qualidade',
          left: 'Define o limite considerado aceitável e quem é acionado quando ele quebra.',
          right: 'Executa os controles no pipeline e põe em quarentena os registros reprovados.',
        },
        {
          artifact: 'Política de acesso',
          left: 'Decide quem pode ver quais dados, para qual finalidade e por quanto tempo.',
          right: 'Provisiona os papéis, aplica o mascaramento e gera a trilha de auditoria.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'data-literacy-capability-loop',
    layout: 'flow',
    article: {
      en: 'data-literacy-is-a-business-capability',
      es: 'la-alfabetizacion-de-datos-es-una-capacidad-de-negocio',
      pt: 'alfabetizacao-de-dados-e-uma-capacidade-de-negocio',
    },
    en: {
      eyebrow: 'DATA LITERACY AS A CAPABILITY, NOT A COURSE',
      title: 'The four stages that turn data literacy into a business capability',
      description:
        'Four stages in a loop — define the decisions, teach the questions, embed the answer in the workflow, and measure the decision — where the measurement feeds the next round of definitions rather than ending the programme.',
      figure: {
        alt: 'Four stages in a loop that turn data literacy into a business capability',
        caption:
          'Literacy becomes a capability when measurement feeds the next round of definitions, instead of closing the programme.',
      },
      loop: { label: 'MEASUREMENT REDEFINES THE DECISIONS' },
      stages: [
        {
          title: 'Define the decisions',
          body: 'Name the recurring decisions the business actually makes.',
        },
        {
          title: 'Teach the questions',
          body: 'Train people to ask what a number means and where it came from.',
        },
        {
          title: 'Embed in the workflow',
          body: 'Put the trusted answer inside the process people already use.',
        },
        {
          title: 'Measure the decision',
          body: 'Track whether the decision changed, not who attended training.',
        },
      ],
    },
    es: {
      eyebrow: 'ALFABETIZACIÓN DE DATOS: UNA CAPACIDAD, NO UN CURSO',
      title: 'Las cuatro etapas que convierten la alfabetización de datos en capacidad',
      description:
        'Cuatro etapas en bucle — definir las decisiones, enseñar las preguntas, integrar la respuesta en el flujo de trabajo y medir la decisión — donde la medición alimenta la siguiente ronda de definiciones en lugar de cerrar el programa.',
      figure: {
        alt: 'Cuatro etapas en bucle que convierten la alfabetización de datos en una capacidad de negocio',
        caption:
          'La alfabetización se vuelve capacidad cuando la medición alimenta la siguiente ronda de definiciones, en vez de cerrar el programa.',
      },
      loop: { label: 'LA MEDICIÓN REDEFINE LAS DECISIONES' },
      stages: [
        {
          title: 'Definir las decisiones',
          body: 'Nombrar las decisiones recurrentes que el negocio toma de verdad.',
        },
        {
          title: 'Enseñar las preguntas',
          body: 'Formar a la gente para preguntar qué significa un número y de dónde viene.',
        },
        {
          title: 'Integrar en el flujo',
          body: 'Poner la respuesta fiable dentro del proceso que ya se usa.',
        },
        {
          title: 'Medir la decisión',
          body: 'Medir si la decisión cambió, no quién asistió a la formación.',
        },
      ],
    },
    pt: {
      eyebrow: 'LITERACIA DE DADOS: UMA CAPACIDADE, NÃO UM CURSO',
      title: 'As quatro etapas que transformam literacia de dados em capacidade',
      description:
        'Quatro etapas em ciclo — definir as decisões, ensinar as perguntas, embutir a resposta no fluxo de trabalho e medir a decisão — em que a medição alimenta a próxima rodada de definições em vez de encerrar o programa.',
      figure: {
        alt: 'Quatro etapas em ciclo que transformam a literacia de dados em capacidade de negócio',
        caption:
          'A literacia se torna capacidade quando a medição alimenta a próxima rodada de definições, em vez de encerrar o programa.',
      },
      loop: { label: 'A MEDIÇÃO REDEFINE AS DECISÕES' },
      stages: [
        {
          title: 'Definir as decisões',
          body: 'Nomear as decisões recorrentes que o negócio realmente toma.',
        },
        {
          title: 'Ensinar as perguntas',
          body: 'Formar as pessoas para perguntar o que um número significa e de onde veio.',
        },
        {
          title: 'Embutir no fluxo',
          body: 'Colocar a resposta confiável dentro do processo já usado.',
        },
        {
          title: 'Medir a decisão',
          body: 'Medir se a decisão mudou, não quem participou do treinamento.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'data-pain-points',
    layout: 'cards',
    article: {
      en: 'identifying-and-addressing-data-pain-points-the-first-step-in-data-governance',
      es: 'identificacion-y-solucion-de-puntos-de-dolor-de-datos-el-primer-paso-en-gobierno-de-datos',
      pt: 'identificando-e-solucionando-pontos-de-dor-de-dados-o-primeiro-passo-na-governanca-de-dados',
    },
    en: {
      eyebrow: 'SIX PAIN POINTS THAT TELL YOU WHERE TO START',
      title: 'Six common data pain points and the governance move each one calls for',
      description:
        'Six recurring symptoms — conflicting reports, manual reconciliation, no clear owner, slow access requests, unexplained metrics and duplicated records — each paired with the first governance action it justifies.',
      figure: {
        alt: 'Six common data pain points, each with the first governance action it justifies',
        caption:
          'Each symptom points at a specific first move. The pain point is the business case for it, which is why it comes first.',
      },
      items: [
        {
          kicker: 'SYMPTOM 01',
          title: 'Two reports, one truth',
          body: 'Finance and sales quote different revenue for the same month. Start with one agreed definition and a named owner for it.',
        },
        {
          kicker: 'SYMPTOM 02',
          title: 'The spreadsheet in the middle',
          body: 'Somebody reconciles the numbers by hand every month. Move the rule into the pipeline before you buy a tool.',
        },
        {
          kicker: 'SYMPTOM 03',
          title: 'Nobody owns the field',
          body: 'Everyone uses the customer status, nobody decides what it means. Assign the owner first, the steward second.',
        },
        {
          kicker: 'SYMPTOM 04',
          title: 'Access takes three weeks',
          body: 'Requests queue behind an unwritten approval path. Publish the path and the standing decision it should follow.',
        },
        {
          kicker: 'SYMPTOM 05',
          title: 'The metric nobody explains',
          body: 'The dashboard number has no lineage back to a source. Document the calculation where the reader will see it.',
        },
        {
          kicker: 'SYMPTOM 06',
          title: 'The same customer, four times',
          body: 'Duplicated records inflate every count. Agree the matching rule before de-duplicating anything.',
        },
      ],
    },
    es: {
      eyebrow: 'SEIS PUNTOS DE DOLOR QUE INDICAN POR DÓNDE EMPEZAR',
      title: 'Seis puntos de dolor de datos y la acción de gobierno que exige cada uno',
      description:
        'Seis síntomas recurrentes — informes que no cuadran, conciliación manual, ausencia de propietario, accesos lentos, métricas inexplicables y registros duplicados — cada uno con la primera acción de gobierno que justifica.',
      figure: {
        alt: 'Seis puntos de dolor de datos, cada uno con la primera acción de gobierno que justifica',
        caption:
          'Cada síntoma señala un primer movimiento concreto. El punto de dolor es su caso de negocio, y por eso va primero.',
      },
      items: [
        {
          kicker: 'SÍNTOMA 01',
          title: 'Dos informes, una verdad',
          body: 'Finanzas y ventas dan ingresos distintos para el mismo mes. Empieza por una definición acordada y un propietario con nombre.',
        },
        {
          kicker: 'SÍNTOMA 02',
          title: 'La hoja de cálculo intermedia',
          body: 'Alguien concilia las cifras a mano cada mes. Lleva la regla al pipeline antes de comprar una herramienta.',
        },
        {
          kicker: 'SÍNTOMA 03',
          title: 'Nadie es dueño del campo',
          body: 'Todos usan el estado del cliente y nadie decide qué significa. Asigna primero el propietario y después el steward.',
        },
        {
          kicker: 'SÍNTOMA 04',
          title: 'El acceso tarda tres semanas',
          body: 'Las solicitudes esperan tras una ruta de aprobación no escrita. Publica la ruta y la decisión que debe seguir.',
        },
        {
          kicker: 'SÍNTOMA 05',
          title: 'La métrica que nadie explica',
          body: 'El número del dashboard no tiene trazabilidad hasta el origen. Documenta el cálculo donde el lector lo verá.',
        },
        {
          kicker: 'SÍNTOMA 06',
          title: 'El mismo cliente, cuatro veces',
          body: 'Los registros duplicados inflan cualquier recuento. Acuerda la regla de coincidencia antes de deduplicar.',
        },
      ],
    },
    pt: {
      eyebrow: 'SEIS PONTOS DE DOR QUE MOSTRAM ONDE COMEÇAR',
      title: 'Seis pontos de dor de dados e a ação de governança que cada um exige',
      description:
        'Seis sintomas recorrentes — relatórios que não batem, conciliação manual, ausência de dono, acessos lentos, métricas inexplicáveis e registros duplicados — cada um com a primeira ação de governança que justifica.',
      figure: {
        alt: 'Seis pontos de dor de dados, cada um com a primeira ação de governança que justifica',
        caption:
          'Cada sintoma aponta para um primeiro movimento concreto. O ponto de dor é o business case dele, e por isso vem primeiro.',
      },
      items: [
        {
          kicker: 'SINTOMA 01',
          title: 'Dois relatórios, uma verdade',
          body: 'Financeiro e vendas informam receitas diferentes para o mesmo mês. Comece por uma definição acordada e um dono com nome.',
        },
        {
          kicker: 'SINTOMA 02',
          title: 'A planilha do meio',
          body: 'Alguém concilia os números à mão todo mês. Leve a regra para o pipeline antes de comprar uma ferramenta.',
        },
        {
          kicker: 'SINTOMA 03',
          title: 'Ninguém é dono do campo',
          body: 'Todos usam o status do cliente e ninguém decide o que ele significa. Defina primeiro o dono, depois o steward.',
        },
        {
          kicker: 'SINTOMA 04',
          title: 'O acesso leva três semanas',
          body: 'Os pedidos esperam por um caminho de aprovação não escrito. Publique o caminho e a decisão que ele deve seguir.',
        },
        {
          kicker: 'SINTOMA 05',
          title: 'A métrica que ninguém explica',
          body: 'O número do painel não tem linhagem até a origem. Documente o cálculo onde o leitor vai vê-lo.',
        },
        {
          kicker: 'SINTOMA 06',
          title: 'O mesmo cliente, quatro vezes',
          body: 'Registros duplicados inflam qualquer contagem. Acorde a regra de correspondência antes de deduplicar.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'governance-program-building-blocks',
    layout: 'cards',
    article: {
      en: 'introduction-to-the-basics-of-a-data-governance-program',
      es: 'introduccion-a-las-bases-de-un-programa-de-gobierno-de-datos',
      pt: 'introducao-aos-fundamentos-de-um-programa-de-governanca-de-dados',
    },
    en: {
      eyebrow: 'THE SIX BUILDING BLOCKS OF A GOVERNANCE PROGRAMME',
      title: 'The six building blocks of a data governance programme',
      description:
        'Six components a governance programme needs together — strategy and scope, roles and accountability, policies and standards, processes and workflow, metadata and catalogue, and the metrics that prove it works.',
      figure: {
        alt: 'The six building blocks of a data governance programme',
        caption:
          'Six blocks that only work together: any one of them missing is the usual reason a governance programme stalls.',
      },
      items: [
        {
          kicker: 'BLOCK 01',
          title: 'Strategy and scope',
          body: 'Two or three business outcomes governance answers for, and everything it is explicitly not doing yet.',
        },
        {
          kicker: 'BLOCK 02',
          title: 'Roles and accountability',
          body: 'Named owners and stewards per domain, with the decision rights each one actually holds.',
        },
        {
          kicker: 'BLOCK 03',
          title: 'Policies and standards',
          body: 'Short rules people can follow, written where the work happens rather than in a binder.',
        },
        {
          kicker: 'BLOCK 04',
          title: 'Processes and workflow',
          body: 'How a definition gets approved, a rule gets changed, and an exception gets granted.',
        },
        {
          kicker: 'BLOCK 05',
          title: 'Metadata and catalogue',
          body: 'One place to look up what a field means, where it comes from, and who to ask about it.',
        },
        {
          kicker: 'BLOCK 06',
          title: 'Metrics and reporting',
          body: 'A handful of measures showing the outcomes moved, on the same cadence as the business.',
        },
      ],
    },
    es: {
      eyebrow: 'LOS SEIS PILARES DE UN PROGRAMA DE GOBIERNO',
      title: 'Los seis pilares de un programa de gobierno de datos',
      description:
        'Seis componentes que un programa de gobierno necesita a la vez — estrategia y alcance, roles y responsabilidad, políticas y estándares, procesos y flujo de trabajo, metadatos y catálogo, y las métricas que demuestran que funciona.',
      figure: {
        alt: 'Los seis pilares de un programa de gobierno de datos',
        caption:
          'Seis pilares que solo funcionan juntos: que falte cualquiera de ellos es la razón habitual de que un programa se atasque.',
      },
      items: [
        {
          kicker: 'PILAR 01',
          title: 'Estrategia y alcance',
          body: 'Dos o tres resultados de negocio de los que el gobierno responde, y todo lo que explícitamente aún no hace.',
        },
        {
          kicker: 'PILAR 02',
          title: 'Roles y responsabilidad',
          body: 'Propietarios y stewards con nombre por dominio, con los derechos de decisión que de verdad tienen.',
        },
        {
          kicker: 'PILAR 03',
          title: 'Políticas y estándares',
          body: 'Reglas cortas que la gente pueda seguir, escritas donde ocurre el trabajo y no en una carpeta.',
        },
        {
          kicker: 'PILAR 04',
          title: 'Procesos y flujo',
          body: 'Cómo se aprueba una definición, se cambia una regla y se concede una excepción.',
        },
        {
          kicker: 'PILAR 05',
          title: 'Metadatos y catálogo',
          body: 'Un único sitio para consultar qué significa un campo, de dónde viene y a quién preguntar.',
        },
        {
          kicker: 'PILAR 06',
          title: 'Métricas e informes',
          body: 'Unas pocas medidas que muestren que los resultados se movieron, con la cadencia del negocio.',
        },
      ],
    },
    pt: {
      eyebrow: 'OS SEIS PILARES DE UM PROGRAMA DE GOVERNANÇA',
      title: 'Os seis pilares de um programa de governança de dados',
      description:
        'Seis componentes que um programa de governança precisa ao mesmo tempo — estratégia e escopo, papéis e responsabilidade, políticas e padrões, processos e fluxo de trabalho, metadados e catálogo, e as métricas que provam que funciona.',
      figure: {
        alt: 'Os seis pilares de um programa de governança de dados',
        caption:
          'Seis pilares que só funcionam juntos: faltar qualquer um deles é a razão habitual de um programa empacar.',
      },
      items: [
        {
          kicker: 'PILAR 01',
          title: 'Estratégia e escopo',
          body: 'Dois ou três resultados de negócio de que a governança responde, e tudo o que ela explicitamente ainda não faz.',
        },
        {
          kicker: 'PILAR 02',
          title: 'Papéis e responsabilidade',
          body: 'Donos e stewards com nome por domínio, com os direitos de decisão que de fato possuem.',
        },
        {
          kicker: 'PILAR 03',
          title: 'Políticas e padrões',
          body: 'Regras curtas que as pessoas consigam seguir, escritas onde o trabalho acontece.',
        },
        {
          kicker: 'PILAR 04',
          title: 'Processos e fluxo',
          body: 'Como uma definição é aprovada, uma regra é alterada e uma exceção é concedida.',
        },
        {
          kicker: 'PILAR 05',
          title: 'Metadados e catálogo',
          body: 'Um único lugar para consultar o que um campo significa, de onde vem e a quem perguntar.',
        },
        {
          kicker: 'PILAR 06',
          title: 'Métricas e relatórios',
          body: 'Poucas medidas que mostrem que os resultados se moveram, na cadência do negócio.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'responsible-ai-input-controls',
    layout: 'flow',
    article: {
      en: 'responsible-ai-starts-with-data-governance',
      es: 'la-ia-responsable-empieza-con-el-gobierno-de-datos',
      pt: 'a-ia-responsavel-comeca-com-a-governanca-de-dados',
    },
    en: {
      eyebrow: 'RESPONSIBLE AI: GOVERN THE INPUTS, NOT THE OUTPUT',
      title: 'The four control points between a source system and an AI decision',
      description:
        'A chain from source system to training dataset to model to decision, with the governance control that has to hold at each hop, and a change notification that runs back from the source to everything downstream.',
      figure: {
        alt: 'Four control points between a source system and an AI decision',
        caption:
          'Responsible AI is decided upstream: each hop carries one control, and a source change has to notify every hop after it.',
      },
      loop: { label: 'A SOURCE CHANGE NOTIFIES EVERY HOP' },
      stages: [
        {
          title: 'Source system',
          body: 'Only approved sources, each with a named owner.',
        },
        {
          title: 'Training dataset',
          body: 'Purpose tags that say what this data may be used for.',
        },
        {
          title: 'Model',
          body: 'A recorded lineage from every feature back to its source.',
        },
        {
          title: 'Decision',
          body: 'A person accountable for the outcome, not the algorithm.',
        },
      ],
    },
    es: {
      eyebrow: 'IA RESPONSABLE: GOBIERNA LAS ENTRADAS, NO LA SALIDA',
      title: 'Los cuatro puntos de control entre un sistema origen y una decisión de IA',
      description:
        'Una cadena del sistema origen al conjunto de entrenamiento, al modelo y a la decisión, con el control de gobierno que debe cumplirse en cada salto, y una notificación de cambio que vuelve del origen a todo lo que depende de él.',
      figure: {
        alt: 'Cuatro puntos de control entre un sistema origen y una decisión de IA',
        caption:
          'La IA responsable se decide aguas arriba: cada salto lleva un control, y un cambio en el origen debe avisar a todos los siguientes.',
      },
      loop: { label: 'UN CAMBIO EN EL ORIGEN AVISA A LA CADENA' },
      stages: [
        {
          title: 'Sistema origen',
          body: 'Solo fuentes aprobadas, cada una con un propietario con nombre.',
        },
        {
          title: 'Conjunto de entrenamiento',
          body: 'Etiquetas de finalidad que dicen para qué puede usarse el dato.',
        },
        {
          title: 'Modelo',
          body: 'Linaje registrado de cada atributo hasta su origen.',
        },
        {
          title: 'Decisión',
          body: 'Una persona responsable del resultado, no el algoritmo.',
        },
      ],
    },
    pt: {
      eyebrow: 'IA RESPONSÁVEL: GOVERNE AS ENTRADAS, NÃO A SAÍDA',
      title: 'Os quatro pontos de controle entre um sistema de origem e uma decisão de IA',
      description:
        'Uma cadeia do sistema de origem ao conjunto de treino, ao modelo e à decisão, com o controle de governança que precisa valer em cada salto, e uma notificação de mudança que volta da origem para tudo o que depende dela.',
      figure: {
        alt: 'Quatro pontos de controle entre um sistema de origem e uma decisão de IA',
        caption:
          'A IA responsável se decide na origem: cada salto carrega um controle, e uma mudança na origem precisa avisar todos os seguintes.',
      },
      loop: { label: 'MUDANÇA NA ORIGEM AVISA A CADEIA TODA' },
      stages: [
        {
          title: 'Sistema de origem',
          body: 'Apenas fontes aprovadas, cada uma com um dono nomeado.',
        },
        {
          title: 'Conjunto de treino',
          body: 'Etiquetas de finalidade que dizem para que o dado pode servir.',
        },
        {
          title: 'Modelo',
          body: 'Linhagem registrada de cada atributo até sua origem.',
        },
        {
          title: 'Decisão',
          body: 'Uma pessoa responsável pelo resultado, não o algoritmo.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'data-literacy-governance-matrix',
    layout: 'matrix',
    article: {
      en: 'unlocking-true-data-driven-potential-why-data-literacy-rules-governance',
      es: 'desbloqueando-el-potencial-de-los-datos-la-alfabetizacion-de-datos-en-la-gobernanza',
      pt: 'desbloqueando-o-potencial-dos-dados-a-literacia-de-dados-na-governanca',
    },
    en: {
      eyebrow: 'LITERACY AND GOVERNANCE: FOUR PLACES TO BE',
      title: 'Data literacy crossed with data governance maturity',
      description:
        'A two-by-two of data literacy against governance maturity: confident and wrong, genuinely data-driven, running on gut feel, and governed but unused.',
      figure: {
        alt: 'A two-by-two of data literacy against data governance maturity',
        caption:
          'Governance without literacy is paperwork; literacy without governance is four teams confidently quoting four numbers.',
      },
      axisX: 'DATA GOVERNANCE MATURITY',
      axisY: 'DATA LITERACY',
      quadrants: [
        {
          kicker: 'SKILL WITHOUT AGREEMENT',
          title: 'Confident and wrong',
          body: 'Everyone builds their own analysis, and four teams arrive at four revenue numbers. The skill is real; the shared definition is missing.',
        },
        {
          kicker: 'THE GOAL',
          title: 'Genuinely data-driven',
          body: 'People ask good questions and get one trusted answer. The only quadrant where a dashboard actually changes a decision.',
        },
        {
          kicker: 'THE STARTING POINT',
          title: 'Running on gut feel',
          body: 'Data exists but nobody trusts it or uses it. Start with the decisions people already make, not with a catalogue.',
        },
        {
          kicker: 'COMPLIANCE THEATRE',
          title: 'Governed but unused',
          body: 'The glossary is complete, the policies are approved, and nobody opens either. Governance became paperwork.',
        },
      ],
    },
    es: {
      eyebrow: 'ALFABETIZACIÓN Y GOBIERNO: CUATRO LUGARES POSIBLES',
      title: 'La alfabetización de datos cruzada con la madurez del gobierno',
      description:
        'Una matriz de dos por dos de alfabetización de datos frente a madurez de gobierno: seguros y equivocados, realmente guiados por datos, decidiendo por intuición, y gobernados pero sin uso.',
      figure: {
        alt: 'Una matriz de dos por dos de alfabetización de datos frente a madurez del gobierno de datos',
        caption:
          'El gobierno sin alfabetización es papeleo; la alfabetización sin gobierno son cuatro equipos citando cuatro cifras con total seguridad.',
      },
      axisX: 'MADUREZ DEL GOBIERNO DE DATOS',
      axisY: 'ALFABETIZACIÓN DE DATOS',
      quadrants: [
        {
          kicker: 'HABILIDAD SIN ACUERDO',
          title: 'Seguros y equivocados',
          body: 'Cada equipo construye su propio análisis y cuatro equipos llegan a cuatro cifras de ingresos. La habilidad existe; falta la definición compartida.',
        },
        {
          kicker: 'EL OBJETIVO',
          title: 'Guiados por datos',
          body: 'La gente hace buenas preguntas y recibe una única respuesta fiable. El único cuadrante donde un dashboard cambia de verdad una decisión.',
        },
        {
          kicker: 'EL PUNTO DE PARTIDA',
          title: 'Decidiendo por intuición',
          body: 'Los datos existen pero nadie los usa ni confía en ellos. Empieza por las decisiones que ya se toman, no por un catálogo.',
        },
        {
          kicker: 'GOBIERNO DE ESCAPARATE',
          title: 'Gobernados pero sin uso',
          body: 'El glosario está completo, las políticas aprobadas, y nadie abre ninguno de los dos. El gobierno se volvió papeleo.',
        },
      ],
    },
    pt: {
      eyebrow: 'LITERACIA E GOVERNANÇA: QUATRO LUGARES POSSÍVEIS',
      title: 'A literacia de dados cruzada com a maturidade da governança',
      description:
        'Uma matriz dois por dois de literacia de dados contra maturidade da governança: seguros e errados, realmente orientados por dados, decidindo por intuição, e governados mas sem uso.',
      figure: {
        alt: 'Uma matriz dois por dois de literacia de dados contra maturidade da governança de dados',
        caption:
          'Governança sem literacia é papelada; literacia sem governança são quatro times citando quatro números com toda a confiança.',
      },
      axisX: 'MATURIDADE DA GOVERNANÇA DE DADOS',
      axisY: 'LITERACIA DE DADOS',
      quadrants: [
        {
          kicker: 'HABILIDADE SEM ACORDO',
          title: 'Seguros e errados',
          body: 'Cada time monta a própria análise e quatro times chegam a quatro números de receita. A habilidade existe; falta a definição comum.',
        },
        {
          kicker: 'O OBJETIVO',
          title: 'Orientados por dados',
          body: 'As pessoas fazem boas perguntas e recebem uma única resposta confiável. O único quadrante em que um painel muda de fato uma decisão.',
        },
        {
          kicker: 'O PONTO DE PARTIDA',
          title: 'Decidindo por intuição',
          body: 'Os dados existem, mas ninguém confia neles nem os usa. Comece pelas decisões que já são tomadas, não por um catálogo.',
        },
        {
          kicker: 'GOVERNANÇA DE VITRINE',
          title: 'Governados mas sem uso',
          body: 'O glossário está completo, as políticas aprovadas, e ninguém abre nenhum dos dois. A governança virou papelada.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'data-governance-myths',
    layout: 'stack',
    article: {
      en: 'what-data-governance-is-and-what-it-is-not-5-common-misconceptions',
      es: 'que-es-y-que-no-es-la-gobernanza-de-datos-5-mitos-comunes',
      pt: 'o-que-e-e-o-que-nao-e-governanca-de-dados-5-mitos-comuns',
    },
    en: {
      eyebrow: 'FIVE THINGS DATA GOVERNANCE IS NOT',
      title: 'Five misconceptions about data governance, and what it actually is',
      description:
        'Five common claims about data governance — that it is a tool, that it belongs to IT, that it slows the business down, that it is a project, and that it is only for regulated industries — each answered with what governance actually is.',
      figure: {
        alt: 'Five misconceptions about data governance, each answered with what it actually is',
        caption:
          'Each myth on the left of the card, and the thing governance actually is on the right of it.',
      },
      items: [
        {
          kicker: 'MYTH 01 · IT IS A TOOL YOU BUY',
          title: 'It is a set of decisions, recorded',
          body: 'A catalogue with no named owner and no approval path is a search box. The tool stores the decision; it does not make it.',
        },
        {
          kicker: 'MYTH 02 · IT BELONGS TO IT',
          title: 'The business owns the definitions',
          body: 'IT can build the pipeline, but only the business can say what an active customer is and which error rate is acceptable.',
        },
        {
          kicker: 'MYTH 03 · IT SLOWS US DOWN',
          title: 'It removes the rework',
          body: 'The delay is not the approval path; it is the three weeks spent arguing after the fact about whose number is right.',
        },
        {
          kicker: 'MYTH 04 · IT IS A PROJECT',
          title: 'It is an operating capability',
          body: 'Projects end. Definitions change, systems get replaced and people leave, so the decision-making has to outlive the rollout.',
        },
        {
          kicker: 'MYTH 05 · IT IS ONLY FOR BANKS',
          title: 'Any company that decides on data needs it',
          body: 'Regulation sets a floor, not the reason. If a wrong number costs you a decision, you already have a governance problem.',
        },
      ],
    },
    es: {
      eyebrow: 'CINCO COSAS QUE EL GOBIERNO DE DATOS NO ES',
      title: 'Cinco mitos sobre el gobierno de datos y lo que realmente es',
      description:
        'Cinco afirmaciones habituales sobre el gobierno de datos — que es una herramienta, que es cosa de TI, que frena al negocio, que es un proyecto y que solo aplica a sectores regulados — cada una respondida con lo que el gobierno es en realidad.',
      figure: {
        alt: 'Cinco mitos sobre el gobierno de datos, cada uno respondido con lo que realmente es',
        caption:
          'Cada mito a la izquierda de la tarjeta, y lo que el gobierno de datos realmente es a su derecha.',
      },
      items: [
        {
          kicker: 'MITO 01 · ES UNA HERRAMIENTA QUE SE COMPRA',
          title: 'Es un conjunto de decisiones registradas',
          body: 'Un catálogo sin propietario ni ruta de aprobación es un buscador. La herramienta guarda la decisión, no la toma.',
        },
        {
          kicker: 'MITO 02 · ES COSA DE TI',
          title: 'El negocio es dueño de las definiciones',
          body: 'TI construye el pipeline, pero solo el negocio puede decir qué es un cliente activo y qué tasa de error es aceptable.',
        },
        {
          kicker: 'MITO 03 · NOS FRENA',
          title: 'Elimina el retrabajo',
          body: 'El retraso no es la ruta de aprobación: son las tres semanas discutiendo después quién tiene el número correcto.',
        },
        {
          kicker: 'MITO 04 · ES UN PROYECTO',
          title: 'Es una capacidad operativa',
          body: 'Los proyectos terminan. Las definiciones cambian, los sistemas se reemplazan y la gente se va: decidir debe sobrevivir al despliegue.',
        },
        {
          kicker: 'MITO 05 · SOLO ES PARA BANCOS',
          title: 'Lo necesita cualquier empresa que decida con datos',
          body: 'La regulación marca un mínimo, no el motivo. Si un número equivocado te cuesta una decisión, ya tienes un problema de gobierno.',
        },
      ],
    },
    pt: {
      eyebrow: 'CINCO COISAS QUE A GOVERNANÇA DE DADOS NÃO É',
      title: 'Cinco mitos sobre governança de dados e o que ela realmente é',
      description:
        'Cinco afirmações comuns sobre governança de dados — que é uma ferramenta, que é assunto de TI, que atrasa o negócio, que é um projeto e que só vale para setores regulados — cada uma respondida com o que a governança realmente é.',
      figure: {
        alt: 'Cinco mitos sobre governança de dados, cada um respondido com o que ela realmente é',
        caption:
          'Cada mito à esquerda do cartão, e o que a governança de dados realmente é à direita dele.',
      },
      items: [
        {
          kicker: 'MITO 01 · É UMA FERRAMENTA QUE SE COMPRA',
          title: 'É um conjunto de decisões registradas',
          body: 'Um catálogo sem dono e sem caminho de aprovação é uma busca. A ferramenta guarda a decisão, não a toma.',
        },
        {
          kicker: 'MITO 02 · É ASSUNTO DE TI',
          title: 'O negócio é dono das definições',
          body: 'TI constrói o pipeline, mas só o negócio pode dizer o que é um cliente ativo e qual taxa de erro é aceitável.',
        },
        {
          kicker: 'MITO 03 · ISSO NOS ATRASA',
          title: 'Ela elimina o retrabalho',
          body: 'O atraso não é o caminho de aprovação: são as três semanas discutindo depois quem tem o número certo.',
        },
        {
          kicker: 'MITO 04 · É UM PROJETO',
          title: 'É uma capacidade operacional',
          body: 'Projetos terminam. Definições mudam, sistemas são trocados e pessoas saem: decidir precisa sobreviver ao rollout.',
        },
        {
          kicker: 'MITO 05 · É SÓ PARA BANCOS',
          title: 'Serve a qualquer empresa que decide com dados',
          body: 'A regulação define um mínimo, não o motivo. Se um número errado custa uma decisão, você já tem um problema de governança.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'dmbok-governance-wheel',
    layout: 'hub',
    article: {
      en: 'what-is-data-governance-in-dama-dmbok-framework-key-components',
      es: 'que-es-la-gobernanza-de-datos-segun-dama-dmbok-marco-y-componentes-clave',
      pt: 'o-que-e-governanca-de-dados-no-dama-dmbok-framework-e-componentes-chave',
    },
    en: {
      eyebrow: 'DAMA-DMBOK: WHY GOVERNANCE SITS AT THE CENTRE',
      title: 'Data governance at the centre of the DAMA-DMBOK knowledge areas',
      description:
        'Data governance at the centre of six DAMA-DMBOK knowledge areas — data architecture, data quality, metadata, master data, data security and data storage — with the decision governance supplies to each one.',
      figure: {
        alt: 'Data governance at the centre of six DAMA-DMBOK knowledge areas',
        caption:
          'Governance is the hub of the DMBOK wheel because each surrounding area needs a decision it cannot make on its own.',
      },
      centre: 'DATA GOVERNANCE',
      centreNote: 'DECIDES · ARBITRATES',
      spokes: [
        { title: 'Data architecture', body: 'Approves the target state and the exceptions' },
        { title: 'Data quality', body: 'Sets the thresholds and who is accountable' },
        { title: 'Master data', body: 'Rules the golden record and its survivorship' },
        { title: 'Data security', body: 'Classifies the data and approves the access' },
        { title: 'Data storage', body: 'Sets the retention and the deletion rules' },
        { title: 'Metadata', body: 'Mandates the glossary and the lineage' },
      ],
    },
    es: {
      eyebrow: 'DAMA-DMBOK: POR QUÉ EL GOBIERNO ESTÁ EN EL CENTRO',
      title: 'El gobierno de datos en el centro de las áreas de conocimiento del DMBOK',
      description:
        'El gobierno de datos en el centro de seis áreas de conocimiento de DAMA-DMBOK — arquitectura, calidad de datos, metadatos, datos maestros, seguridad y almacenamiento — con la decisión que el gobierno aporta a cada una.',
      figure: {
        alt: 'El gobierno de datos en el centro de seis áreas de conocimiento de DAMA-DMBOK',
        caption:
          'El gobierno es el eje de la rueda DMBOK porque cada área que lo rodea necesita una decisión que no puede tomar sola.',
      },
      centre: 'GOBIERNO DE DATOS',
      centreNote: 'DECIDE · ARBITRA',
      spokes: [
        { title: 'Arquitectura', body: 'Aprueba el estado objetivo y las excepciones' },
        { title: 'Calidad de datos', body: 'Fija los umbrales y quién responde' },
        { title: 'Datos maestros', body: 'Decide el registro maestro y su supervivencia' },
        { title: 'Seguridad', body: 'Clasifica el dato y aprueba los accesos' },
        { title: 'Almacenamiento', body: 'Fija las reglas de retención y borrado' },
        { title: 'Metadatos', body: 'Exige el glosario y el linaje' },
      ],
    },
    pt: {
      eyebrow: 'DAMA-DMBOK: POR QUE A GOVERNANÇA FICA NO CENTRO',
      title: 'A governança de dados no centro das áreas de conhecimento do DMBOK',
      description:
        'A governança de dados no centro de seis áreas de conhecimento do DAMA-DMBOK — arquitetura, qualidade de dados, metadados, dados mestres, segurança e armazenamento — com a decisão que a governança fornece a cada uma.',
      figure: {
        alt: 'A governança de dados no centro de seis áreas de conhecimento do DAMA-DMBOK',
        caption:
          'A governança é o eixo da roda DMBOK porque cada área ao redor precisa de uma decisão que não consegue tomar sozinha.',
      },
      centre: 'GOVERNANÇA DE DADOS',
      centreNote: 'DECIDE · ARBITRA',
      spokes: [
        { title: 'Arquitetura', body: 'Aprova o estado-alvo e as exceções' },
        { title: 'Qualidade de dados', body: 'Define os limites e quem responde' },
        { title: 'Dados mestres', body: 'Decide o registro mestre e sua sobrevivência' },
        { title: 'Segurança', body: 'Classifica o dado e aprova os acessos' },
        { title: 'Armazenamento', body: 'Define as regras de retenção e descarte' },
        { title: 'Metadados', body: 'Exige o glossário e a linhagem' },
      ],
    },
  },

  // -----------------------------------------------------------------------
  {
    slug: 'golden-square-people-process-technology-data',
    layout: 'matrix',
    article: {
      en: 'why-data-governance-is-all-about-people-process-technology-and-data',
      es: 'por-que-el-gobierno-de-datos-trata-de-personas-procesos-tecnologia-y-datos',
      pt: 'por-que-a-governanca-de-dados-e-sobre-pessoas-processos-tecnologia-e-dados',
    },
    en: {
      eyebrow: 'THE FOUR THINGS GOVERNANCE HAS TO GET RIGHT',
      title: 'People, process, technology and data, and how each one fails alone',
      description:
        'The four pillars of data governance — people, process, technology and data — each with what it contributes and the specific way a governance programme fails when that pillar is missing.',
      figure: {
        alt: 'People, process, technology and data, with the way a governance programme fails without each one',
        caption:
          'Each pillar contributes something the others cannot, which is why a programme missing one fails in a predictable way.',
      },
      quadrants: [
        {
          kicker: 'WITHOUT IT: NOBODY DECIDES',
          title: 'People',
          body: 'Named owners and stewards who hold real decision rights. Miss this and every definition stays open, because nobody has the job of closing it.',
        },
        {
          kicker: 'WITHOUT IT: EVERY CASE IS NEW',
          title: 'Process',
          body: 'The repeatable path from a question to an approved answer. Miss this and each definition gets re-argued from scratch in a different meeting.',
        },
        {
          kicker: 'WITHOUT IT: NOTHING SCALES',
          title: 'Technology',
          body: 'The catalogue, the lineage, the automated checks. Miss this and the rules live in a spreadsheet that only its author maintains.',
        },
        {
          kicker: 'WITHOUT IT: IT IS ALL THEORY',
          title: 'Data',
          body: 'The actual definitions, quality rules and classifications. Miss this and you have a governance framework that governs nothing.',
        },
      ],
    },
    es: {
      eyebrow: 'LAS CUATRO COSAS QUE EL GOBIERNO DEBE ACERTAR',
      title: 'Personas, procesos, tecnología y datos, y cómo falla cada uno por separado',
      description:
        'Los cuatro pilares del gobierno de datos — personas, procesos, tecnología y datos — cada uno con lo que aporta y la forma concreta en que un programa fracasa cuando ese pilar falta.',
      figure: {
        alt: 'Personas, procesos, tecnología y datos, con la forma en que un programa de gobierno fracasa sin cada uno',
        caption:
          'Cada pilar aporta algo que los demás no pueden, y por eso un programa al que le falta uno fracasa de forma predecible.',
      },
      quadrants: [
        {
          kicker: 'SIN ELLAS: NADIE DECIDE',
          title: 'Personas',
          body: 'Propietarios y stewards con nombre y derechos de decisión reales. Sin esto, cada definición queda abierta porque nadie tiene el trabajo de cerrarla.',
        },
        {
          kicker: 'SIN ELLOS: TODO CASO ES NUEVO',
          title: 'Procesos',
          body: 'El camino repetible de una pregunta a una respuesta aprobada. Sin esto, cada definición se vuelve a discutir desde cero en otra reunión.',
        },
        {
          kicker: 'SIN ELLA: NADA ESCALA',
          title: 'Tecnología',
          body: 'El catálogo, el linaje, los controles automáticos. Sin esto, las reglas viven en una hoja de cálculo que solo mantiene su autor.',
        },
        {
          kicker: 'SIN ELLOS: TODO ES TEORÍA',
          title: 'Datos',
          body: 'Las definiciones, reglas de calidad y clasificaciones reales. Sin esto, tienes un marco de gobierno que no gobierna nada.',
        },
      ],
    },
    pt: {
      eyebrow: 'AS QUATRO COISAS QUE A GOVERNANÇA PRECISA ACERTAR',
      title: 'Pessoas, processos, tecnologia e dados, e como cada um falha sozinho',
      description:
        'Os quatro pilares da governança de dados — pessoas, processos, tecnologia e dados — cada um com o que contribui e a forma concreta em que um programa falha quando esse pilar falta.',
      figure: {
        alt: 'Pessoas, processos, tecnologia e dados, com a forma em que um programa de governança falha sem cada um',
        caption:
          'Cada pilar contribui com algo que os outros não podem, e por isso um programa sem um deles falha de forma previsível.',
      },
      quadrants: [
        {
          kicker: 'SEM ELAS: NINGUÉM DECIDE',
          title: 'Pessoas',
          body: 'Donos e stewards com nome e direitos de decisão reais. Sem isso, cada definição fica aberta porque ninguém tem a tarefa de fechá-la.',
        },
        {
          kicker: 'SEM ELES: TODO CASO É NOVO',
          title: 'Processos',
          body: 'O caminho repetível de uma pergunta a uma resposta aprovada. Sem isso, cada definição é rediscutida do zero em outra reunião.',
        },
        {
          kicker: 'SEM ELA: NADA ESCALA',
          title: 'Tecnologia',
          body: 'O catálogo, a linhagem, os controles automáticos. Sem isso, as regras vivem em uma planilha que só o autor mantém.',
        },
        {
          kicker: 'SEM ELES: É TUDO TEORIA',
          title: 'Dados',
          body: 'As definições, regras de qualidade e classificações reais. Sem isso, você tem um framework de governança que não governa nada.',
        },
      ],
    },
  },
  // -----------------------------------------------------------------------
  {
    slug: 'symptoms-data-tyranny',
    layout: 'cards',
    article: {
      en: 'from-data-tyranny-to-data-democracy-making-data-work-for-everyone',
      es: 'de-la-tirania-a-la-democracia-de-datos-hacer-que-los-datos-funcionen-para-todos',
      pt: 'da-tirania-a-democracia-de-dados-fazendo-a-informacao-trabalhar-para-todos',
    },
    en: {
      eyebrow: 'SIX SYMPTOMS OF DATA TYRANNY',
      title: 'Six symptoms of data tyranny and what each one costs the business',
      description:
        'Six recurring symptoms of over-restricted data — approval loops, shadow spreadsheets, a single delivery team, no self-service, discouraged exploration and distrust of governance — each with the delay or risk it creates.',
      figure: {
        alt: 'Six symptoms of data tyranny, each with the cost it imposes on the business',
        caption:
          'Each symptom is a bottleneck somebody is already working around, and the workaround is the real cost.',
      },
      items: [
        {
          kicker: 'SYMPTOM 01',
          title: 'Endless approval loops',
          body: 'Basic access needs sign-off from IT and legal, so a routine decision waits weeks for data the company already holds.',
        },
        {
          kicker: 'SYMPTOM 02',
          title: 'Data black markets',
          body: 'Blocked teams export raw extracts into desktop spreadsheets, and the reporting that matters moves outside governance entirely.',
        },
        {
          kicker: 'SYMPTOM 03',
          title: 'One team owns everything',
          body: 'A single central engineering team holds every pipeline change, so each department queues behind all the others.',
        },
        {
          kicker: 'SYMPTOM 04',
          title: 'No self-service',
          body: 'Nobody can find a dataset or read a field definition without raising a ticket, so nobody looks before deciding.',
        },
        {
          kicker: 'SYMPTOM 05',
          title: 'Exploration discouraged',
          body: 'Every dataset is treated as top-tier risk, so exploratory analysis stops being worth the paperwork it now requires.',
        },
        {
          kicker: 'SYMPTOM 06',
          title: 'Governance loses trust',
          body: 'People read governance as red tape rather than the thing that makes speed and quality possible at the same time.',
        },
      ],
    },
    es: {
      eyebrow: 'SEIS SÍNTOMAS DE LA TIRANÍA DE DATOS',
      title: 'Seis síntomas de la tiranía de datos y lo que cuesta cada uno',
      description:
        'Seis síntomas recurrentes de unos datos sobrerrestringidos — cadenas de aprobación, hojas de cálculo en la sombra, un único equipo de entrega, ausencia de autoservicio, exploración desincentivada y desconfianza en el gobierno — cada uno con el retraso o el riesgo que genera.',
      figure: {
        alt: 'Seis síntomas de la tiranía de datos, cada uno con el coste que impone al negocio',
        caption:
          'Cada síntoma es un cuello de botella que alguien ya está sorteando, y ese atajo es el coste real.',
      },
      items: [
        {
          kicker: 'SÍNTOMA 01',
          title: 'Aprobaciones interminables',
          body: 'Un acceso básico exige el visto bueno de TI y legal, y una decisión rutinaria espera semanas por datos que la empresa ya tiene.',
        },
        {
          kicker: 'SÍNTOMA 02',
          title: 'Mercados negros de datos',
          body: 'Los equipos bloqueados exportan extractos a hojas de cálculo locales, y el reporting que importa sale del gobierno de datos.',
        },
        {
          kicker: 'SÍNTOMA 03',
          title: 'Un equipo lo hace todo',
          body: 'Un único equipo central concentra cada cambio de pipeline, así que todas las áreas esperan en la misma cola.',
        },
        {
          kicker: 'SÍNTOMA 04',
          title: 'Cero autoservicio',
          body: 'Nadie encuentra un dataset ni lee la definición de un campo sin abrir un ticket, así que nadie consulta antes de decidir.',
        },
        {
          kicker: 'SÍNTOMA 05',
          title: 'Exploración penalizada',
          body: 'Todo dato se trata como riesgo máximo, y el análisis exploratorio deja de compensar el papeleo que ahora exige.',
        },
        {
          kicker: 'SÍNTOMA 06',
          title: 'El gobierno pierde crédito',
          body: 'La gente lee el gobierno como burocracia y no como lo que hace posibles la velocidad y la calidad a la vez.',
        },
      ],
    },
    pt: {
      eyebrow: 'SEIS SINTOMAS DA TIRANIA DOS DADOS',
      title: 'Seis sintomas da tirania dos dados e o custo de cada um',
      description:
        'Seis sintomas recorrentes de dados excessivamente restritos — cadeias de aprovação, planilhas paralelas, um único time de entrega, ausência de autosserviço, exploração desestimulada e desconfiança na governança — cada um com o atraso ou o risco que gera.',
      figure: {
        alt: 'Seis sintomas da tirania dos dados, cada um com o custo que impõe ao negócio',
        caption:
          'Cada sintoma é um gargalo que alguém já está contornando, e o contorno é o custo real.',
      },
      items: [
        {
          kicker: 'SINTOMA 01',
          title: 'Aprovações intermináveis',
          body: 'Um acesso básico exige aval da TI e do jurídico, e uma decisão rotineira espera semanas por dados que a empresa já tem.',
        },
        {
          kicker: 'SINTOMA 02',
          title: 'Mercados negros de dados',
          body: 'Times bloqueados exportam extrações para planilhas locais, e o relatório que importa passa a viver fora da governança.',
        },
        {
          kicker: 'SINTOMA 03',
          title: 'Um time faz tudo',
          body: 'Um único time central concentra cada mudança de pipeline, então todas as áreas esperam na mesma fila.',
        },
        {
          kicker: 'SINTOMA 04',
          title: 'Zero autosserviço',
          body: 'Ninguém acha um dataset nem lê a definição de um campo sem abrir um ticket, então ninguém consulta antes de decidir.',
        },
        {
          kicker: 'SINTOMA 05',
          title: 'Exploração punida',
          body: 'Todo dado é tratado como risco máximo, e a análise exploratória deixa de valer o processo que agora exige.',
        },
        {
          kicker: 'SINTOMA 06',
          title: 'A governança perde crédito',
          body: 'As pessoas leem a governança como burocracia, e não como o que torna velocidade e qualidade possíveis juntas.',
        },
      ],
    },
  },
];

/** Everything the renderer needs for one diagram in one language. */
const specFor = (diagram, language) => ({ layout: diagram.layout, ...diagram[language] });

/** Where the SVG for a diagram in a language lives, relative to the repo. */
export const diagramPath = (slug, language) => `assets/images/blog/${slug}-${language}.svg`;

/** The markdown a standalone figure needs: alt text, path, and title as the caption. */
export const figureLine = (diagram, language) => {
  const { alt, caption } = diagram[language].figure;
  return `![${alt}](/${diagramPath(diagram.slug, language)} "${caption}")`;
};

const readIfPresent = async (file) => {
  try {
    return await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

const main = async () => {
  const check = process.argv.includes('--check');
  const figures = process.argv.includes('--figures');

  if (figures) {
    for (const diagram of DIAGRAMS) {
      for (const language of LANGUAGES) {
        console.log(`${language}\t${diagram.article[language]}\t${figureLine(diagram, language)}`);
      }
    }
    return;
  }

  const stale = [];
  let written = 0;

  for (const diagram of DIAGRAMS) {
    for (const language of LANGUAGES) {
      let svg;
      try {
        svg = renderDiagram(specFor(diagram, language));
      } catch (error) {
        throw new Error(`${diagram.slug} (${language}): ${error.message}`);
      }

      const file = path.join(OUTPUT_DIR, `${diagram.slug}-${language}.svg`);
      const existing = await readIfPresent(file);

      if (check) {
        if (existing !== svg) stale.push(diagramPath(diagram.slug, language));
        continue;
      }

      if (existing !== svg) {
        await writeFile(file, svg);
        written += 1;
      }
    }
  }

  if (check) {
    if (stale.length) {
      console.error(
        `${stale.length} diagram(s) do not match scripts/generate-blog-diagrams.mjs. ` +
          `Run "npm run diagrams" and commit the result:\n  ${stale.join('\n  ')}`
      );
      process.exitCode = 1;
      return;
    }
    console.log(`${DIAGRAMS.length * LANGUAGES.length} diagrams match the source copy.`);
    return;
  }

  console.log(
    `Rendered ${DIAGRAMS.length * LANGUAGES.length} diagrams (${written} changed) into assets/images/blog.`
  );
};

// Only when run as a command: the DIAGRAMS table and figureLine are exported for
// other scripts to read, and importing them should not write anything.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
