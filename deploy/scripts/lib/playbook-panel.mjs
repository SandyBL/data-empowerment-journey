/**
 * What appears after a playbook download, once the file is already on its way.
 *
 * The three cards in src/partials/playbook-cards.html are plain
 * `<a download>` anchors and they stay that way: the download is never
 * conditional on anything, which is the promise the playbooks page makes in its
 * own deck and the reason scripts/lib/newsletter.mjs exists in the shape it
 * does. Nothing here gates a file, asks a question before one, or sends the
 * reader somewhere else to earn one.
 *
 * What it does is use the one moment on this site where attention is highest
 * and demonstrably unspent -- the reader has the playbook and is still on the
 * page -- to say that two other things exist. Both are things people who came
 * for a PDF routinely never find: the scenario simulators and the maturity
 * scorecard. The newsletter row underneath is the owned list, not the LinkedIn
 * one, for the reasons written at the top of ./newsletter.mjs; the LinkedIn
 * archive is the small link at the bottom because past issues genuinely live
 * there and nowhere else.
 *
 * Rendered as a native <dialog>. showModal() gives focus containment, Esc to
 * close, inertness for the rest of the page and a ::backdrop, none of which the
 * hand-rolled modals elsewhere in this repository get for free -- and a
 * <dialog> with no `open` attribute is display:none, so a reader with no
 * JavaScript downloads the playbook and never sees a panel that could not have
 * worked for them anyway.
 */

import { escapeHtml } from './markdown.mjs';
import { pagePath, simulatorPath } from './routes.mjs';
import { NEWSLETTER_URL } from './site-nav.mjs';

/**
 * The panel is one block of copy per language rather than three inline
 * `data-lang-content` spans, because it is rendered from code for one language
 * at a time. The partials do it the other way round only because they were
 * lifted out of the trilingual homepage master.
 */
const COPY = {
  en: {
    eyebrow: 'Download started',
    title: 'The playbook is yours.',
    lead: 'It is in your downloads — nothing was gated and nothing else is needed. While you are here, two things on this site that people who came for a PDF usually never find.',
    simulatorTitle: 'Put a room inside the trade-offs',
    simulatorText: 'Three scenario simulators. You make the calls a governance lead makes, under the same incomplete information, and the score says what the room would have had to live with.',
    simulatorCta: 'Open the day-to-day simulator',
    maturityTitle: 'Find out where you actually are',
    maturityText: 'The maturity scorecard returns your DAMA level, a radar chart across People, Process and Technology, and an executive report on completion.',
    maturityCta: 'Take the assessment',
    signupTitle: 'Want the next one?',
    signupText: 'One email when a new playbook, template or article is published. Nothing else, unsubscribe in one click.',
    signupLabel: 'Email address',
    signupPlaceholder: 'you@company.com',
    signupSubmit: 'Send me the next one',
    signupSending: 'Sending…',
    signupSuccess: 'You are on the list.',
    signupError: 'That did not send. Please try again.',
    privacy: 'No sharing, no selling, no third-party tracking on this form.',
    archive: 'Past issues are on LinkedIn',
    close: 'Close',
  },
  es: {
    eyebrow: 'Descarga iniciada',
    title: 'El playbook ya es tuyo.',
    lead: 'Está en tus descargas: no hubo ningún muro y no hace falta nada más. Y ya que estás aquí, dos cosas de este sitio que casi nunca encuentra quien vino por un PDF.',
    simulatorTitle: 'Mete a una sala dentro de las decisiones',
    simulatorText: 'Tres simuladores de escenarios. Tomas las decisiones que toma un responsable de gobierno de datos, con la misma información incompleta, y la puntuación dice con qué habría tenido que vivir la sala.',
    simulatorCta: 'Abrir el simulador del día a día',
    maturityTitle: 'Descubre dónde estás de verdad',
    maturityText: 'El Scorecard de Madurez te devuelve tu nivel DAMA, un gráfico de araña en Personas, Procesos y Tecnología, y un informe ejecutivo al terminar.',
    maturityCta: 'Hacer el diagnóstico',
    signupTitle: '¿Quieres el próximo?',
    signupText: 'Un email cuando se publique un nuevo playbook, plantilla o artículo. Nada más, y te das de baja en un clic.',
    signupLabel: 'Correo electrónico',
    signupPlaceholder: 'tu@empresa.com',
    signupSubmit: 'Enviarme el próximo',
    signupSending: 'Enviando…',
    signupSuccess: 'Ya estás en la lista.',
    signupError: 'No se pudo enviar. Vuelve a intentarlo.',
    privacy: 'No compartimos ni vendemos tu correo, y este formulario no tiene rastreadores de terceros.',
    archive: 'Los números anteriores están en LinkedIn',
    close: 'Cerrar',
  },
  pt: {
    eyebrow: 'Download iniciado',
    title: 'O playbook é seu.',
    lead: 'Está nos seus downloads: não houve nenhum muro e não é preciso mais nada. E já que você está aqui, duas coisas deste site que quase nunca encontra quem veio por um PDF.',
    simulatorTitle: 'Coloque uma sala dentro das decisões',
    simulatorText: 'Três simuladores de cenários. Você toma as decisões que um responsável de governança toma, com a mesma informação incompleta, e a pontuação diz com o que a sala teria de conviver.',
    simulatorCta: 'Abrir o simulador do dia a dia',
    maturityTitle: 'Descubra onde você realmente está',
    maturityText: 'O Scorecard de Maturidade devolve o seu nível DAMA, um gráfico radar em Pessoas, Processos e Tecnologia, e um relatório executivo ao terminar.',
    maturityCta: 'Fazer o diagnóstico',
    signupTitle: 'Quer o próximo?',
    signupText: 'Um e-mail quando um novo playbook, modelo ou artigo for publicado. Nada além disso, e você cancela em um clique.',
    signupLabel: 'E-mail',
    signupPlaceholder: 'voce@empresa.com',
    signupSubmit: 'Quero o próximo',
    signupSending: 'Enviando…',
    signupSuccess: 'Você está na lista.',
    signupError: 'Não foi possível enviar. Tente novamente.',
    privacy: 'Não compartilhamos nem vendemos seu e-mail, e este formulário não tem rastreadores de terceiros.',
    archive: 'As edições anteriores estão no LinkedIn',
    close: 'Fechar',
  },
};

/** The day-to-day simulator is the one the playbook's reader is closest to. */
const SIMULATOR = 'data-governance-day-to-day';

/**
 * The signup row.
 *
 * Deliberately the same Netlify form as the block at the foot of the page --
 * same `newsletter` name, same honeypot, same field names, and the same
 * `[data-newsletter]` hook so assets/js/newsletter.js submits it without a
 * second implementation. One list, not two: splitting subscribers across two
 * forms would undo the point of owning the list in the first place. What tells
 * them apart is `source`, which assets/js/playbook-panel.js rewrites to name
 * the playbook that earned the address before the dialog opens.
 *
 * The `.signup__*` classes are reused for the control internals for the same
 * reason -- the input, the button and the status line should not drift from the
 * ones the reader saw further down the page.
 */
const renderSignup = (copy, lang) => `
      <form
        class="download-panel__signup"
        id="playbook-panel-signup"
        name="newsletter"
        method="POST"
        action="/thank-you"
        data-netlify="true"
        netlify-honeypot="bot-field"
        data-newsletter
      >
        <p class="signup__honeypot" aria-hidden="true"><label>Do not fill this in <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <input type="hidden" name="language" value="${lang}">
        <input type="hidden" name="source" value="playbook-panel" data-playbook-source>
        <p class="download-panel__signup-title">${escapeHtml(copy.signupTitle)}</p>
        <p class="download-panel__signup-text">${escapeHtml(copy.signupText)}</p>
        <label class="signup__label" for="playbook-panel-email">${escapeHtml(copy.signupLabel)}</label>
        <div class="signup__row">
          <input
            class="signup__input"
            id="playbook-panel-email"
            type="email"
            name="email"
            required
            autocomplete="email"
            inputmode="email"
            placeholder="${escapeHtml(copy.signupPlaceholder)}"
          >
          <button class="signup__submit" type="submit" data-submit-label="${escapeHtml(
            copy.signupSubmit
          )}" data-sending-label="${escapeHtml(copy.signupSending)}">${escapeHtml(copy.signupSubmit)}</button>
        </div>
        <p class="signup__status" role="status" aria-live="polite" data-newsletter-status data-success="${escapeHtml(
          copy.signupSuccess
        )}" data-error="${escapeHtml(copy.signupError)}"></p>
        <p class="signup__privacy"><i class="fa-solid fa-lock" aria-hidden="true"></i>${escapeHtml(
          copy.privacy
        )}</p>
      </form>`;

/** One of the two things the panel exists to point at. */
const renderOffer = ({ icon, title, text, cta, href }) => `
        <li class="download-panel__offer">
          <p class="download-panel__offer-title"><i class="fa-solid ${icon}" aria-hidden="true"></i>${escapeHtml(
            title
          )}</p>
          <p class="download-panel__offer-text">${escapeHtml(text)}</p>
          <a class="download-panel__offer-cta" href="${href}">${escapeHtml(
            cta
          )}<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
        </li>`;

export const renderPlaybookPanel = (lang) => {
  const copy = COPY[lang] || COPY.en;

  return `    <dialog class="download-panel" id="playbook-panel" aria-labelledby="playbook-panel-title" data-playbook-panel>
      <form method="dialog" class="download-panel__dismiss">
        <button class="download-panel__close" type="submit" aria-label="${escapeHtml(copy.close)}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </form>
      <p class="download-panel__eyebrow"><i class="fa-solid fa-circle-check" aria-hidden="true"></i>${escapeHtml(
        copy.eyebrow
      )}</p>
      <h2 class="download-panel__title" id="playbook-panel-title">${escapeHtml(copy.title)}</h2>
      <p class="download-panel__lead">${escapeHtml(copy.lead)}</p>
      <ul class="download-panel__offers">${renderOffer({
        icon: 'fa-play',
        title: copy.simulatorTitle,
        text: copy.simulatorText,
        cta: copy.simulatorCta,
        href: simulatorPath(lang, SIMULATOR),
      })}${renderOffer({
    icon: 'fa-gauge-high',
    title: copy.maturityTitle,
    text: copy.maturityText,
    cta: copy.maturityCta,
    href: pagePath(lang, 'maturity-assessment'),
  })}
      </ul>${renderSignup(copy, lang)}
      <a class="download-panel__archive" href="${NEWSLETTER_URL}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin" aria-hidden="true"></i>${escapeHtml(
        copy.archive
      )}</a>
    </dialog>`;
};
