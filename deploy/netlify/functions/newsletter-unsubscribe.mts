import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { newsletterSubscribers } from "../../db/schema.js";
import { isLocale, resend, type Locale } from "../lib/newsletter.js";

// The unsubscribe link in the welcome email. Broadcasts do not use it: Resend
// runs their unsubscribe flow itself through {{{RESEND_UNSUBSCRIBE_URL}}}.
//
// GET shows a page with a single button and changes nothing. That matters more
// than it looks: corporate mail scanners open every link in a message to check
// it, and an unsubscribe that fired on GET would silently drop exactly the
// readers at the companies this site writes for. POST does the unsubscribing,
// both from that button and from the one-click "Unsubscribe" that Gmail and
// Apple Mail offer next to the sender (RFC 8058, via the List-Unsubscribe-Post
// header on the email).
//
// The token is 32 random bytes per subscriber, so the link proves which list
// entry it belongs to without carrying the address in the URL.

const COPY = {
  en: {
    title: "Unsubscribe",
    confirm: "Stop receiving the Data Governance Journey newsletter at this address?",
    button: "Unsubscribe",
    done: "You are unsubscribed. You will not receive any more newsletter emails.",
    invalid: "This unsubscribe link is not valid. If you keep receiving emails, reply to any of them and we will remove you.",
    back: "Back to the site",
  },
  es: {
    title: "Darse de baja",
    confirm: "¿Dejar de recibir la newsletter de Data Governance Journey en esta dirección?",
    button: "Darme de baja",
    done: "Te has dado de baja. No recibirás más correos de la newsletter.",
    invalid: "Este enlace no es válido. Si sigues recibiendo correos, responde a cualquiera de ellos y te daremos de baja.",
    back: "Volver al sitio",
  },
  pt: {
    title: "Cancelar inscrição",
    confirm: "Parar de receber a newsletter do Data Governance Journey neste endereço?",
    button: "Cancelar inscrição",
    done: "Sua inscrição foi cancelada. Você não receberá mais e-mails da newsletter.",
    invalid: "Este link não é válido. Se continuar recebendo e-mails, responda a qualquer um deles e removeremos você.",
    back: "Voltar ao site",
  },
} as const;

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const page = (locale: Locale, message: string, form = "") =>
  new Response(
    `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(COPY[locale].title)} | Data Governance Journey</title>
<style>
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f8fafc;color:#0f172a;display:grid;place-items:center;min-height:100vh}
main{max-width:440px;margin:24px;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;text-align:center}
img{width:56px;height:56px}
p{line-height:1.6}
button{font:inherit;font-weight:600;color:#fff;background:#095b73;border:0;border-radius:8px;padding:12px 24px;cursor:pointer}
a{color:#095b73}
</style>
</head>
<body>
<main>
<img src="/assets/images/dg-logo.png" alt="Data Governance Journey">
<p>${escapeHtml(message)}</p>
${form}
<p><a href="/${locale}/">${escapeHtml(COPY[locale].back)}</a></p>
</main>
</body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "no-store" } },
  );

export default async (request: Request) => {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const [subscriber] = /^[0-9a-f]{64}$/.test(token)
    ? await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.unsubscribeToken, token))
    : [];

  if (!subscriber) return page("en", COPY.en.invalid);
  const locale = isLocale(subscriber.locale) ? subscriber.locale : "en";
  const copy = COPY[locale];

  if (request.method === "GET") {
    if (subscriber.unsubscribedAt) return page(locale, copy.done);
    return page(
      locale,
      copy.confirm,
      `<form method="POST" action="/api/newsletter/unsubscribe?token=${token}"><button type="submit">${escapeHtml(copy.button)}</button></form>`,
    );
  }

  try {
    if (subscriber.resendContactId) {
      await resend("PATCH", `/contacts/${subscriber.resendContactId}`, { unsubscribed: true });
    }
    await db
      .update(newsletterSubscribers)
      .set({ unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.id, subscriber.id));
  } catch (error) {
    console.error(`Newsletter: unsubscribe of subscriber ${subscriber.id} failed`, error);
    return new Response("Unsubscribe failed, please try again.", { status: 500 });
  }
  return page(locale, copy.done);
};

export const config: Config = {
  path: "/api/newsletter/unsubscribe",
  method: ["GET", "POST"],
};
