import type { ArticlePicks } from "./newsletter-feed.js";
import type { Locale } from "./newsletter.js";

/**
 * The two emails the newsletter sends: a welcome when someone signs up, and a
 * "new article" broadcast for each article published after that.
 *
 * Both share one frame dressed like the site: a deep-blue banner with the
 * logo and the wordmark centred above its orange-to-cyan rule, a white card
 * with the blog's one-rounded-corner shape, serif headings, and a dark footer
 * band pointing at the LinkedIn newsletter so email readers can follow there
 * too. Inline styles throughout, because that is all most mail clients
 * honour. The web fonts load from this site, never a font CDN, and each
 * names a fallback (Gmail and Outlook load none); every gradient sits on a
 * solid bgcolor (Outlook on Windows draws neither gradients nor rounded
 * corners). The wordmark is live text, not an image, so the banner still
 * reads when images are blocked. No tracking pixels and no rewritten links:
 * the signup form promises "no third-party tracking", and an email that
 * keeps that promise is also one that spam filters have less reason to distrust.
 *
 * The broadcast is rendered once per article and batch and handed to Resend,
 * which substitutes {{{RESEND_UNSUBSCRIBE_URL}}} per recipient and runs the
 * unsubscribe flow itself. The welcome is a transactional email that Resend
 * does not manage that way, so it carries this site's own unsubscribe link.
 */

const ORIGIN = "https://datagovjourney.com";
const LOGO = `${ORIGIN}/assets/images/dg-logo.png`;
// The site's palette (assets/css/blog.css, assets/css/site-chrome.css).
const DEEPBLUE = "#003366";
const TEAL = "#095b73";
const CYAN = "#65b7c7";
const ORANGE = "#e95d24";
const CORAL = "#ec6d57";
const MINT = "#62e6bd";
const INK = "#071c2c";
const MUTED = "#31505c";
const PAPER = "#f8fafc";
const LINE = "#dbe3e8";
const LINKEDIN_BLUE = "#0a66c2";

const SANS = "'DM Sans',Helvetica,Arial,sans-serif";
const SERIF = "'DM Serif Display',Georgia,'Times New Roman',serif";
const BRAND_FONT = "'Plus Jakarta Sans',Helvetica,Arial,sans-serif";
/** The blog's card shape: square but for one generous top-right corner. */
const CARD_RADIUS = "4px 24px 4px 4px";

/** The LinkedIn newsletter: a separate list, linked from the foot of every email. */
const LINKEDIN_NEWSLETTER = "https://www.linkedin.com/newsletters/the-data-governance-journey-7282492393252147200/";

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const COPY = {
  en: {
    welcomeSubject: "Welcome to Data Governance Journey",
    welcomePreheader: "You're on the list. Here is what to expect.",
    welcomeHeading: "Thank you for joining",
    welcomeBody: [
      "Thank you for signing up. It genuinely means a lot that you want to keep learning about data governance with us.",
      "Here is the deal: whenever a new article is published, you get one email with a short summary and a link to read it. No daily digests, no sales sequences, nothing else.",
      "If there is a data challenge you are wrestling with right now, just reply to this email. Every reply is read by a person, and the best questions often become the next article.",
    ],
    startHeading: "Where to start",
    startIntro: "The three articles readers have opened most lately:",
    welcomeButton: "Browse all articles",
    blogPath: "/en/blog/",
    signOff: "See you in your inbox,",
    team: "The Data Governance Journey",
    articleSubject: (title: string) => `New article: ${title}`,
    articleKicker: "New on Data Governance Journey",
    articleButton: "Read the article",
    relatedKicker: "Also worth reading",
    relatedCue: "Read it",
    termKicker: "Glossary term",
    termCue: "See the definition",
    articleOutro: "Questions or a different view? Just reply to this email, we read every one.",
    footer: "You are receiving this because you subscribed at datagovjourney.com.",
    unsubscribe: "Unsubscribe",
    greeting: (name: string | null) => (name ? `Hi ${name},` : "Hi there,"),
    broadcastGreeting: "Hi {{{contact.first_name|there}}},",
    linkedinKicker: "Also on LinkedIn",
    linkedinText: "Shorter pieces and the conversation in the comments: The Data Governance Journey newsletter on LinkedIn.",
    linkedinButton: "Follow on LinkedIn",
  },
  es: {
    welcomeSubject: "Te damos la bienvenida a Data Governance Journey",
    welcomePreheader: "Ya estás en la lista. Esto es lo que puedes esperar.",
    welcomeHeading: "Gracias por unirte",
    welcomeBody: [
      "Gracias por suscribirte. De verdad significa mucho que quieras seguir aprendiendo sobre gobierno de datos con nosotros.",
      "El trato es sencillo: cada vez que publiquemos un artículo nuevo, recibirás un solo correo con un breve resumen y el enlace para leerlo. Sin resúmenes diarios, sin secuencias de venta, nada más.",
      "Si ahora mismo tienes un reto de datos entre manos, responde a este correo. Cada respuesta la lee una persona, y las mejores preguntas suelen convertirse en el próximo artículo.",
    ],
    startHeading: "Por dónde empezar",
    startIntro: "Los tres artículos más leídos últimamente:",
    welcomeButton: "Ver todos los artículos",
    blogPath: "/es/blog/",
    signOff: "Nos vemos en tu bandeja de entrada,",
    team: "The Data Governance Journey",
    articleSubject: (title: string) => `Nuevo artículo: ${title}`,
    articleKicker: "Nuevo en Data Governance Journey",
    articleButton: "Leer el artículo",
    relatedKicker: "También vale la pena leer",
    relatedCue: "Leerlo",
    termKicker: "Término del glosario",
    termCue: "Ver la definición",
    articleOutro: "¿Preguntas u otro punto de vista? Responde a este correo, leemos todos.",
    footer: "Recibes este correo porque te suscribiste en datagovjourney.com.",
    unsubscribe: "Darse de baja",
    greeting: (name: string | null) => (name ? `Hola, ${name}:` : "Hola:"),
    broadcastGreeting: "Hola {{{contact.first_name|de nuevo}}},",
    linkedinKicker: "También en LinkedIn",
    linkedinText: "Piezas más breves y la conversación en los comentarios: la newsletter The Data Governance Journey en LinkedIn.",
    linkedinButton: "Seguir en LinkedIn",
  },
  pt: {
    welcomeSubject: "Boas-vindas ao Data Governance Journey",
    welcomePreheader: "Você está na lista. Veja o que esperar.",
    welcomeHeading: "Obrigado por se juntar a nós",
    welcomeBody: [
      "Obrigado por se inscrever. Significa muito que você queira continuar aprendendo sobre governança de dados com a gente.",
      "O combinado é simples: sempre que um novo artigo for publicado, você recebe um único e-mail com um breve resumo e o link para ler. Sem resumos diários, sem sequências de vendas, nada além disso.",
      "Se você está enfrentando algum desafio de dados agora, é só responder a este e-mail. Cada resposta é lida por uma pessoa, e as melhores perguntas muitas vezes viram o próximo artigo.",
    ],
    startHeading: "Por onde começar",
    startIntro: "Os três artigos mais lidos ultimamente:",
    welcomeButton: "Ver todos os artigos",
    blogPath: "/pt/blog/",
    signOff: "Até a próxima,",
    team: "The Data Governance Journey",
    articleSubject: (title: string) => `Novo artigo: ${title}`,
    articleKicker: "Novo no Data Governance Journey",
    articleButton: "Ler o artigo",
    relatedKicker: "Também vale a leitura",
    relatedCue: "Ler",
    termKicker: "Termo do glossário",
    termCue: "Ver a definição",
    articleOutro: "Dúvidas ou outro ponto de vista? É só responder a este e-mail, lemos todos.",
    footer: "Você está recebendo este e-mail porque se inscreveu em datagovjourney.com.",
    unsubscribe: "Cancelar inscrição",
    greeting: (name: string | null) => (name ? `Olá, ${name}!` : "Olá!"),
    broadcastGreeting: "Olá {{{contact.first_name|de novo}}},",
    linkedinKicker: "Também no LinkedIn",
    linkedinText: "Textos mais curtos e a conversa nos comentários: a newsletter The Data Governance Journey no LinkedIn.",
    linkedinButton: "Seguir no LinkedIn",
  },
} as const;

/**
 * The shared frame. `unsubscribeHref` is inserted as-is, because for a
 * broadcast it is Resend's placeholder rather than a URL.
 */
const layout = (
  locale: Locale,
  { preheader, body, unsubscribeHref }: { preheader: string; body: string; unsubscribeHref: string },
) => {
  const copy = COPY[locale];
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
@font-face{font-family:'DM Sans';font-weight:400 700;src:url('${ORIGIN}/assets/fonts/dm-sans-latin.woff2') format('woff2');}
@font-face{font-family:'DM Serif Display';font-weight:400;src:url('${ORIGIN}/assets/fonts/dm-serif-display-latin.woff2') format('woff2');}
@font-face{font-family:'Plus Jakarta Sans';font-weight:800;src:url('${ORIGIN}/assets/fonts/plus-jakarta-sans-latin.woff2') format('woff2');}
@media (max-width:600px){.dgj-pad{padding-left:22px!important;padding-right:22px!important;}}
</style>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PAPER}" style="background:${PAPER};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:separate;">
<tr><td align="center" bgcolor="${DEEPBLUE}" class="dgj-pad" style="background:${DEEPBLUE};background-image:linear-gradient(135deg,${DEEPBLUE},#0f172a 78%);padding:34px 32px 28px;border-radius:4px 24px 0 0;border-bottom:3px solid ${CYAN};">
<a href="${ORIGIN}/${locale}/" style="text-decoration:none;color:#ffffff;">
<img src="${LOGO}" width="68" height="66" alt="" style="display:block;margin:0 auto 16px;border:4px solid #33557a;border-radius:20px;background:#ffffff;">
<span style="display:block;font-family:${BRAND_FONT};font-size:16px;font-weight:800;letter-spacing:0.09em;line-height:1.3;text-transform:uppercase;color:#ffffff;">Data Governance Journey</span>
</a>
<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:12px auto 0;">
<tr><td width="28" height="3" bgcolor="${ORANGE}" style="width:28px;height:3px;background:${ORANGE};background-image:linear-gradient(90deg,${ORANGE},#a88a76);border-radius:3px 0 0 3px;font-size:0;line-height:0;">&nbsp;</td><td width="28" height="3" bgcolor="${CYAN}" style="width:28px;height:3px;background:${CYAN};background-image:linear-gradient(90deg,#a88a76,${CYAN});border-radius:0 3px 3px 0;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td></tr>
<tr><td bgcolor="#ffffff" class="dgj-pad" style="background:#ffffff;padding:36px 40px 36px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};">
${body}
<p style="margin:32px 0 0;padding-top:20px;border-top:1px solid ${LINE};">${escapeHtml(copy.signOff)}<br><strong style="font-family:${SERIF};font-size:18px;font-weight:normal;color:${TEAL};">${escapeHtml(copy.team)}</strong></p>
</td></tr>
<tr><td bgcolor="${INK}" class="dgj-pad" style="background:${INK};padding:26px 40px 28px;border-radius:0 0 4px 4px;font-family:${SANS};font-size:14px;line-height:1.55;color:#c9d6dc;">
<p style="margin:0 0 6px;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:${MINT};">${escapeHtml(copy.linkedinKicker)}</p>
<p style="margin:0 0 16px;">${escapeHtml(copy.linkedinText)}</p>
<a href="${LINKEDIN_NEWSLETTER}" style="display:inline-block;background:${LINKEDIN_BLUE};color:#ffffff;text-decoration:none;font-weight:bold;padding:10px 20px;border-radius:${CARD_RADIUS};">${escapeHtml(copy.linkedinButton)}</a>
</td></tr>
</table>
<p style="max-width:600px;margin:20px auto 0;font-family:${SANS};font-size:12px;line-height:1.6;color:#67808a;text-align:center;">
${escapeHtml(copy.footer)}<br><a href="${unsubscribeHref}" style="color:#67808a;">${escapeHtml(copy.unsubscribe)}</a>
</p>
</td></tr>
</table>
</body>
</html>`;
};

/** The plain-text twin of the LinkedIn block in the HTML layout. */
const linkedinText = (locale: Locale) => {
  const copy = COPY[locale];
  return [copy.linkedinKicker, copy.linkedinText, `${copy.linkedinButton}: ${LINKEDIN_NEWSLETTER}`];
};

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:30px 0;"><tr><td bgcolor="${TEAL}" style="background:${TEAL};border-radius:${CARD_RADIUS};border-bottom:3px solid ${CYAN};"><a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 28px;font-family:${SANS};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">${escapeHtml(label)} &rarr;</a></td></tr></table>`;

export type Article = { url: string; title: string; summary: string | null };

/**
 * `startHere` is the short reading list for someone who has just arrived: the
 * most-read articles in their language (see popularArticles in
 * newsletter-feed.ts). An empty list drops the section rather than the email.
 */
export const renderWelcomeEmail = (
  locale: Locale,
  firstName: string | null,
  unsubscribeUrl: string,
  startHere: Article[] = [],
) => {
  const copy = COPY[locale];
  const blogUrl = `${ORIGIN}${copy.blogPath}`;
  const readingList = startHere.length
    ? [
        `<h2 style="margin:32px 0 8px;font-family:${SERIF};font-size:22px;font-weight:normal;line-height:1.2;color:${INK};">${escapeHtml(copy.startHeading)}</h2>`,
        `<p style="margin:0 0 12px;">${escapeHtml(copy.startIntro)}</p>`,
        ...startHere.map((article) => {
          const summary = article.summary && article.summary !== article.title ? article.summary : "";
          return `<p style="margin:0 0 12px;padding:12px 16px;background:${PAPER};border-left:3px solid ${MINT};border-radius:0 12px 0 0;"><a href="${escapeHtml(article.url)}" style="color:${TEAL};font-weight:bold;text-decoration:none;">${escapeHtml(article.title)}</a>${
            summary ? `<br><span style="font-size:14px;color:${MUTED};">${escapeHtml(summary)}</span>` : ""
          }</p>`;
        }),
      ]
    : [];
  const greeting = copy.greeting(firstName);
  const body = [
    `<h1 style="margin:0 0 18px;font-family:${SERIF};font-size:32px;font-weight:normal;line-height:1.1;letter-spacing:-0.01em;color:${INK};">${escapeHtml(copy.welcomeHeading)}</h1>`,
    `<p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>`,
    ...copy.welcomeBody.map((paragraph) => `<p style="margin:0 0 16px;">${escapeHtml(paragraph)}</p>`),
    ...readingList,
    button(blogUrl, copy.welcomeButton),
  ].join("\n");

  return {
    subject: copy.welcomeSubject,
    html: layout(locale, { preheader: copy.welcomePreheader, body, unsubscribeHref: escapeHtml(unsubscribeUrl) }),
    text: [
      copy.welcomeHeading,
      "",
      greeting,
      "",
      ...copy.welcomeBody.flatMap((paragraph) => [paragraph, ""]),
      ...(startHere.length
        ? [copy.startHeading, copy.startIntro, ...startHere.map((article) => `- ${article.title}: ${article.url}`), ""]
        : []),
      `${copy.welcomeButton}: ${blogUrl}`,
      "",
      copy.signOff,
      copy.team,
      "",
      ...linkedinText(locale),
      "",
      `${copy.unsubscribe}: ${unsubscribeUrl}`,
    ].join("\n"),
  };
};

/** A small card under the main article: a kicker, a linked title, a line of text. */
const extraCard = (kicker: string, href: string, title: string, text: string, cue: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;"><tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:16px 18px;border-left:3px solid ${MINT};border-radius:0 12px 0 0;">` +
  `<p style="margin:0 0 6px;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:${CORAL};">${escapeHtml(kicker)}</p>` +
  `<a href="${escapeHtml(href)}" style="font-family:${SERIF};font-size:19px;font-weight:normal;line-height:1.25;color:${INK};text-decoration:none;">${escapeHtml(title)}</a>` +
  (text ? `<p style="margin:6px 0 8px;font-size:14px;line-height:1.55;color:${MUTED};">${escapeHtml(text)}</p>` : `<br>`) +
  `<a href="${escapeHtml(href)}" style="font-size:14px;font-weight:bold;color:${TEAL};text-decoration:none;">${escapeHtml(cue)} &rarr;</a>` +
  `</td></tr></table>`;

/**
 * `picks` is what the build chose to recommend beside this article (see
 * scripts/lib/newsletter-picks.mjs): one more article and one glossary term.
 * Either may be missing, and the email simply goes without that card.
 */
export const renderArticleEmail = (
  locale: Locale,
  article: Article,
  picks: ArticlePicks = { related: null, term: null },
) => {
  const copy = COPY[locale];
  const unsubscribe = "{{{RESEND_UNSUBSCRIBE_URL}}}";
  const summary = article.summary && article.summary !== article.title ? article.summary : "";
  const related = picks.related && picks.related.url !== article.url ? picks.related : null;
  const relatedSummary = related?.summary && related.summary !== related.title ? related.summary : "";
  const term = picks.term;
  const body = [
    `<p style="margin:0 0 14px;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:${CORAL};">${escapeHtml(copy.articleKicker)}</p>`,
    // Resend fills the placeholder per recipient. Never escaped here: it is
    // not text yet, and the name it becomes is allow-listed at signup.
    `<p style="margin:0 0 16px;">${copy.broadcastGreeting}</p>`,
    `<h1 style="margin:0 0 16px;font-family:${SERIF};font-size:30px;font-weight:normal;line-height:1.12;letter-spacing:-0.01em;"><a href="${escapeHtml(article.url)}" style="color:${INK};text-decoration:none;">${escapeHtml(article.title)}</a></h1>`,
    summary ? `<p style="margin:0 0 16px;padding-left:16px;border-left:3px solid ${MINT};color:${MUTED};">${escapeHtml(summary)}</p>` : "",
    button(article.url, copy.articleButton),
    related ? extraCard(copy.relatedKicker, related.url, related.title, relatedSummary, copy.relatedCue) : "",
    term ? extraCard(copy.termKicker, term.url, term.term, term.short, copy.termCue) : "",
    `<p style="margin:${related || term ? "16px" : "0"} 0 0;color:${MUTED};">${escapeHtml(copy.articleOutro)}</p>`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: copy.articleSubject(article.title),
    html: layout(locale, { preheader: summary || article.title, body, unsubscribeHref: unsubscribe }),
    text: [
      copy.broadcastGreeting,
      "",
      copy.articleKicker,
      "",
      article.title,
      "",
      ...(summary ? [summary, ""] : []),
      `${copy.articleButton}: ${article.url}`,
      "",
      ...(related ? [copy.relatedKicker, related.title, ...(relatedSummary ? [relatedSummary] : []), related.url, ""] : []),
      ...(term ? [copy.termKicker, `${term.term}: ${term.short}`, term.url, ""] : []),
      copy.articleOutro,
      "",
      copy.signOff,
      copy.team,
      "",
      ...linkedinText(locale),
      "",
      `${copy.unsubscribe}: ${unsubscribe}`,
    ].join("\n"),
  };
};
