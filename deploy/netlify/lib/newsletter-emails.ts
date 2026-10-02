import type { Locale } from "./newsletter.js";

/**
 * The two emails the newsletter sends: a welcome when someone signs up, and a
 * "new article" broadcast for each article published after that.
 *
 * Both are deliberately plain: one column, the logo, a few sentences, a
 * handful of links, one button, and a footer pointing at the LinkedIn
 * newsletter so email readers can follow there too, with inline styles because that is all most mail clients honour. No
 * tracking pixels and no rewritten links: the signup form promises "no
 * third-party tracking", and an email that keeps that promise is also one that
 * spam filters have less reason to distrust.
 *
 * The broadcast is rendered once per article and batch and handed to Resend,
 * which substitutes {{{RESEND_UNSUBSCRIBE_URL}}} per recipient and runs the
 * unsubscribe flow itself. The welcome is a transactional email that Resend
 * does not manage that way, so it carries this site's own unsubscribe link.
 */

const ORIGIN = "https://datagovjourney.com";
const LOGO = `${ORIGIN}/assets/images/dg-logo.png`;
const TEAL = "#095b73";
const INK = "#0f172a";
const MUTED = "#475569";
const LINKEDIN_BLUE = "#0077b5";

/** The LinkedIn newsletter: a separate list, linked from the foot of every email. */
const LINKEDIN_NEWSLETTER = "https://www.linkedin.com/newsletters/the-data-empowerment-journey-7282492393252147200/";

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
    team: "The Data Governance Journey team",
    articleSubject: (title: string) => `New article: ${title}`,
    articleKicker: "New on Data Governance Journey",
    articleButton: "Read the article",
    articleOutro: "Questions or a different view? Just reply to this email, we read every one.",
    footer: "You are receiving this because you subscribed at datagovjourney.com.",
    unsubscribe: "Unsubscribe",
    greeting: (name: string | null) => (name ? `Hi ${name},` : "Hi there,"),
    broadcastGreeting: "Hi {{{contact.first_name|there}}},",
    linkedinKicker: "Also on LinkedIn",
    linkedinText: "Shorter pieces and the conversation in the comments: The Data Empowerment Journey, a separate newsletter on LinkedIn.",
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
    team: "El equipo de Data Governance Journey",
    articleSubject: (title: string) => `Nuevo artículo: ${title}`,
    articleKicker: "Nuevo en Data Governance Journey",
    articleButton: "Leer el artículo",
    articleOutro: "¿Preguntas u otro punto de vista? Responde a este correo, leemos todos.",
    footer: "Recibes este correo porque te suscribiste en datagovjourney.com.",
    unsubscribe: "Darse de baja",
    greeting: (name: string | null) => (name ? `Hola, ${name}:` : "Hola:"),
    broadcastGreeting: "Hola {{{contact.first_name|de nuevo}}},",
    linkedinKicker: "También en LinkedIn",
    linkedinText: "Piezas más breves y la conversación en los comentarios: The Data Empowerment Journey, una newsletter aparte en LinkedIn.",
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
    team: "Equipe Data Governance Journey",
    articleSubject: (title: string) => `Novo artigo: ${title}`,
    articleKicker: "Novo no Data Governance Journey",
    articleButton: "Ler o artigo",
    articleOutro: "Dúvidas ou outro ponto de vista? É só responder a este e-mail, lemos todos.",
    footer: "Você está recebendo este e-mail porque se inscreveu em datagovjourney.com.",
    unsubscribe: "Cancelar inscrição",
    greeting: (name: string | null) => (name ? `Olá, ${name}!` : "Olá!"),
    broadcastGreeting: "Olá {{{contact.first_name|de novo}}},",
    linkedinKicker: "Também no LinkedIn",
    linkedinText: "Textos mais curtos e a conversa nos comentários: The Data Empowerment Journey, uma newsletter separada no LinkedIn.",
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
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;">
<tr><td style="padding:28px 32px 8px;">
<a href="${ORIGIN}/${locale}/"><img src="${LOGO}" width="56" height="56" alt="Data Governance Journey" style="display:block;border:0;"></a>
</td></tr>
<tr><td style="padding:8px 32px 32px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${INK};">
${body}
<p style="margin:28px 0 0;">${escapeHtml(copy.signOff)}<br><strong>${escapeHtml(copy.team)}</strong></p>
</td></tr>
<tr><td style="padding:20px 32px 24px;border-top:1px solid #e2e8f0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:${MUTED};">
<p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:${LINKEDIN_BLUE};">${escapeHtml(copy.linkedinKicker)}</p>
<p style="margin:0 0 12px;">${escapeHtml(copy.linkedinText)}</p>
<a href="${LINKEDIN_NEWSLETTER}" style="display:inline-block;background:${LINKEDIN_BLUE};color:#ffffff;text-decoration:none;font-weight:bold;padding:9px 18px;border-radius:8px;">${escapeHtml(copy.linkedinButton)}</a>
</td></tr>
</table>
<p style="max-width:560px;margin:20px auto 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${MUTED};">
${escapeHtml(copy.footer)}<br><a href="${unsubscribeHref}" style="color:${MUTED};">${escapeHtml(copy.unsubscribe)}</a>
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
  `<p style="margin:28px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;background:${TEAL};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:8px;">${escapeHtml(label)}</a></p>`;

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
        `<h2 style="margin:28px 0 8px;font-size:18px;line-height:1.3;color:${TEAL};">${escapeHtml(copy.startHeading)}</h2>`,
        `<p style="margin:0 0 12px;">${escapeHtml(copy.startIntro)}</p>`,
        ...startHere.map((article) => {
          const summary = article.summary && article.summary !== article.title ? article.summary : "";
          return `<p style="margin:0 0 16px;padding-left:12px;border-left:3px solid ${TEAL};"><a href="${escapeHtml(article.url)}" style="color:${TEAL};font-weight:bold;text-decoration:none;">${escapeHtml(article.title)}</a>${
            summary ? `<br><span style="font-size:14px;color:${MUTED};">${escapeHtml(summary)}</span>` : ""
          }</p>`;
        }),
      ]
    : [];
  const greeting = copy.greeting(firstName);
  const body = [
    `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${TEAL};">${escapeHtml(copy.welcomeHeading)}</h1>`,
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

export const renderArticleEmail = (locale: Locale, article: Article) => {
  const copy = COPY[locale];
  const unsubscribe = "{{{RESEND_UNSUBSCRIBE_URL}}}";
  const summary = article.summary && article.summary !== article.title ? article.summary : "";
  const body = [
    `<p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${escapeHtml(copy.articleKicker)}</p>`,
    // Resend fills the placeholder per recipient. Never escaped here: it is
    // not text yet, and the name it becomes is allow-listed at signup.
    `<p style="margin:0 0 16px;">${copy.broadcastGreeting}</p>`,
    `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;"><a href="${escapeHtml(article.url)}" style="color:${TEAL};text-decoration:none;">${escapeHtml(article.title)}</a></h1>`,
    summary ? `<p style="margin:0 0 16px;">${escapeHtml(summary)}</p>` : "",
    button(article.url, copy.articleButton),
    `<p style="margin:0;color:${MUTED};">${escapeHtml(copy.articleOutro)}</p>`,
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
