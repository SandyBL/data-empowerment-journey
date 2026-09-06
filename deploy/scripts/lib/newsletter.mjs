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
 *   The block is one field. Name, company and role are what turn a 12% capture
 *   rate into a 3% one, and none of them are needed to send an email.
 */

const COPY = {
  en: {
    kicker: 'Optional',
    heading: 'Want the next one?',
    lead: 'Take the file — nothing here is gated. If you would also like the next template, playbook, or article when it is published, leave an address. One email when there is something new, nothing else, unsubscribe in one click.',
    label: 'Email address',
    placeholder: 'you@company.com',
    submit: 'Send me the next one',
    sending: 'Sending…',
    success: 'You are on the list. Check your inbox for a confirmation.',
    error: 'That did not send. Please try again, or write to us from the contact form.',
    privacy: 'No sharing, no selling, no third-party tracking on this form.',
  },
  es: {
    kicker: 'Opcional',
    heading: '¿Quieres el próximo?',
    lead: 'Llévate el archivo: aquí nada está bloqueado. Si además quieres recibir la próxima plantilla, playbook o artículo cuando se publique, deja tu correo. Un email cuando hay algo nuevo, nada más, y te das de baja en un clic.',
    label: 'Correo electrónico',
    placeholder: 'tu@empresa.com',
    submit: 'Enviarme el próximo',
    sending: 'Enviando…',
    success: 'Ya estás en la lista. Revisa tu bandeja de entrada.',
    error: 'No se pudo enviar. Vuelve a intentarlo o escríbenos desde el formulario de contacto.',
    privacy: 'No compartimos ni vendemos tu correo, y este formulario no tiene rastreadores de terceros.',
  },
  pt: {
    kicker: 'Opcional',
    heading: 'Quer o próximo?',
    lead: 'Leve o arquivo: aqui nada é bloqueado. Se também quiser receber o próximo modelo, playbook ou artigo quando for publicado, deixe seu e-mail. Um e-mail quando houver algo novo, nada além disso, e você cancela em um clique.',
    label: 'E-mail',
    placeholder: 'voce@empresa.com',
    submit: 'Quero o próximo',
    sending: 'Enviando…',
    success: 'Você está na lista. Confira sua caixa de entrada.',
    error: 'Não foi possível enviar. Tente novamente ou escreva pelo formulário de contato.',
    privacy: 'Não compartilhamos nem vendemos seu e-mail, e este formulário não tem rastreadores de terceiros.',
  },
};

const escapeAttribute = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * `source` records which page the address came from, so the list can answer
 * "which resource actually earns subscribers" without any analytics.
 *
 * The form posts to /thank-you with a normal browser submit when the enhancing
 * script has not run; assets/js/newsletter.js intercepts it otherwise so the
 * reader stays on the page they were reading.
 */
export const renderNewsletterForm = (lang, { source, id = 'newsletter-signup' }) => {
  const copy = COPY[lang] || COPY.en;

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
        <label class="signup__label" for="${id}-email">${escapeAttribute(copy.label)}</label>
        <div class="signup__row">
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
