/**
 * The email capture block that sits beside the free downloads.
 *
 * The list this site had was rented. Every subscriber lived inside LinkedIn's
 * newsletter product, which means the audience is reachable only while LinkedIn
 * chooses to deliver it, the addresses cannot be exported, and a change to their
 * distribution algorithm is a change to this business's only owned channel. This
 * form is the owned version: a Netlify Form named "newsletter", whose submissions
 * land in the site's own dashboard and export as CSV.
 *
 * Two deliberate constraints, both of which the site's owner asked for:
 *
 *   The download never depends on it. Every file on the resource pages is a
 *   plain <a download> next to this block, not behind it. Gating a PDF on an
 *   address is how a page that ranks for "data governance charter template"
 *   stops earning links: nobody links to a form.
 *
 *   The block asks for two things and no more: a first name and an address.
 *   The name is there because every email greets the reader by it (Resend
 *   substitutes it per recipient); company and role are still left out, because
 *   they are what turn a 12% capture rate into a 3% one and no email needs them.
 *
 * This list is the email newsletter. The LinkedIn newsletter is a separate
 * channel and is always labelled as LinkedIn wherever the site links to it;
 * nothing on this form sends anyone there.
 */

import { CONTACT_EMAIL } from './brand.mjs';

const COPY = {
  en: {
    kicker: 'Optional',
    heading: 'Want the next one?',
    lead: 'Take the file — nothing here is gated. If you would also like an email each time a new article is published, leave your first name and address. One email per new article, nothing else, unsubscribe in one click.',
    nameLabel: 'First name',
    namePlaceholder: 'Your first name',
    label: 'Email address',
    placeholder: 'you@company.com',
    submit: 'Send me the next one',
    sending: 'Sending…',
    success: 'You are on the list. Check your inbox for a confirmation.',
    error: `That did not send. Please try again, or write to us at ${CONTACT_EMAIL}.`,
    privacy: 'No sharing, no selling, no third-party tracking on this form.',
    readerKicker: 'Email newsletter',
    readerHeading: 'Get the next article by email',
    readerLead: 'One email each time a new article is published, with a short summary and the link. Leave your first name and address. Nothing else, unsubscribe in one click.',
  },
  es: {
    kicker: 'Opcional',
    heading: '¿Quieres el próximo?',
    lead: 'Llévate el archivo: aquí nada está bloqueado. Si además quieres un correo cada vez que se publique un artículo nuevo, deja tu nombre y tu correo. Un email por artículo nuevo, nada más, y te das de baja en un clic.',
    nameLabel: 'Nombre',
    namePlaceholder: 'Tu nombre',
    label: 'Correo electrónico',
    placeholder: 'tu@empresa.com',
    submit: 'Enviarme el próximo',
    sending: 'Enviando…',
    success: 'Ya estás en la lista. Revisa tu bandeja de entrada.',
    error: `No se pudo enviar. Vuelve a intentarlo o escríbenos a ${CONTACT_EMAIL}.`,
    privacy: 'No compartimos ni vendemos tu correo, y este formulario no tiene rastreadores de terceros.',
    readerKicker: 'Newsletter por correo',
    readerHeading: 'Recibe el próximo artículo por correo',
    readerLead: 'Un correo cada vez que se publica un artículo nuevo, con un breve resumen y el enlace. Deja tu nombre y tu correo. Nada más, y te das de baja en un clic.',
  },
  pt: {
    kicker: 'Opcional',
    heading: 'Quer o próximo?',
    lead: 'Leve o arquivo: aqui nada é bloqueado. Se também quiser receber um e-mail sempre que um novo artigo for publicado, deixe seu nome e e-mail. Um e-mail por artigo novo, nada além disso, e você cancela em um clique.',
    nameLabel: 'Nome',
    namePlaceholder: 'Seu nome',
    label: 'E-mail',
    placeholder: 'voce@empresa.com',
    submit: 'Quero o próximo',
    sending: 'Enviando…',
    success: 'Você está na lista. Confira sua caixa de entrada.',
    error: `Não foi possível enviar. Tente novamente ou escreva para ${CONTACT_EMAIL}.`,
    privacy: 'Não compartilhamos nem vendemos seu e-mail, e este formulário não tem rastreadores de terceiros.',
    readerKicker: 'Newsletter por e-mail',
    readerHeading: 'Receba o próximo artigo por e-mail',
    readerLead: 'Um e-mail sempre que um novo artigo é publicado, com um breve resumo e o link. Deixe seu nome e e-mail. Nada além disso, e você cancela em um clique.',
  },
};

export const SIGNUP_NAME_COPY = Object.fromEntries(
  Object.entries(COPY).map(([lang, copy]) => [lang, { label: copy.nameLabel, placeholder: copy.namePlaceholder }])
);

const escapeAttribute = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The first-name field, shared by every copy of the "newsletter" form so they
 * all submit the same fields: Netlify Forms registers one field list per form
 * name, and a copy that drifted would be one whose submissions lose the name.
 * Limited to 50 characters here and sanitised again server-side, because it
 * ends up in an email.
 */
export const renderSignupNameField = (lang, id, className = 'signup__input signup__input--name') => {
  const copy = SIGNUP_NAME_COPY[lang] || SIGNUP_NAME_COPY.en;
  return `<label class="signup__label" for="${id}-name">${escapeAttribute(copy.label)}</label>
          <input
            class="${className}"
            id="${id}-name"
            type="text"
            name="name"
            required
            maxlength="50"
            autocomplete="given-name"
            placeholder="${escapeAttribute(copy.placeholder)}"
          >`;
};

/**
 * `source` records which page the address came from, so the list can answer
 * "which resource actually earns subscribers" without any analytics.
 *
 * The form posts to /thank-you with a normal browser submit when the enhancing
 * script has not run; assets/js/newsletter.js intercepts it otherwise so the
 * reader stays on the page they were reading.
 */
export const renderNewsletterForm = (lang, { source, id = 'newsletter-signup', variant = 'resource' }) => {
  const base = COPY[lang] || COPY.en;
  // `resource` sits beside free downloads and says so; `reader` is the version
  // for articles, the blog index and the subscribe page, where there is no file
  // to take and "nothing here is gated" would make no sense.
  const copy =
    variant === 'reader'
      ? { ...base, kicker: base.readerKicker, heading: base.readerHeading, lead: base.readerLead }
      : base;

  return `<aside class="signup" aria-labelledby="${id}-heading">
      <div class="signup__copy">
        <p class="signup__kicker">${escapeAttribute(copy.kicker)}</p>
        <h2 id="${id}-heading">${escapeAttribute(copy.heading)}</h2>
        <p class="signup__lead">${escapeAttribute(copy.lead)}</p>
      </div>
      <form
        class="signup__form"
        id="${id}"
        name="newsletter"
        method="POST"
        action="/thank-you"
        data-netlify="true"
        netlify-honeypot="bot-field"
        data-newsletter
      >
        <p class="signup__honeypot" aria-hidden="true"><label>Do not fill this in <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <input type="hidden" name="language" value="${lang}">
        <input type="hidden" name="source" value="${escapeAttribute(source)}">
        <div class="signup__row">
          ${renderSignupNameField(lang, id)}
          <label class="signup__label" for="${id}-email">${escapeAttribute(copy.label)}</label>
          <input
            class="signup__input"
            id="${id}-email"
            type="email"
            name="email"
            required
            autocomplete="email"
            inputmode="email"
            placeholder="${escapeAttribute(copy.placeholder)}"
          >
          <button class="signup__submit" type="submit" data-submit-label="${escapeAttribute(
            copy.submit
          )}" data-sending-label="${escapeAttribute(copy.sending)}">${escapeAttribute(copy.submit)}</button>
        </div>
        <p class="signup__status" role="status" aria-live="polite" data-newsletter-status data-success="${escapeAttribute(
          copy.success
        )}" data-error="${escapeAttribute(copy.error)}"></p>
        <p class="signup__privacy"><i class="fa-solid fa-lock" aria-hidden="true"></i>${escapeAttribute(
          copy.privacy
        )}</p>
      </form>
    </aside>`;
};
