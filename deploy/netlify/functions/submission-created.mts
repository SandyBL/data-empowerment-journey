import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { newsletterSubscribers } from "../../db/schema.js";
import { cleanFirstName, isLocale, newUnsubscribeToken, resend, sendWelcome, syncSubscriber } from "../lib/newsletter.js";

// Runs on every verified Netlify Forms submission, for every form on the site
// -- the file name is what subscribes it to the event, and Netlify signs the
// event so the function cannot be called from outside. Only the "newsletter"
// form (scripts/lib/newsletter.mjs) is handled here; the contact form and any
// other pass straight through untouched.
//
// Netlify Forms stays the record of every signup, exactly as before. This adds
// the reader to the Resend list and sends the welcome email. If Resend is down,
// the row is still saved and newsletter-send.mts finishes the job within the
// hour, so a signup is never lost to a failure on this side.

type FormPayload = {
  form_name?: string;
  data?: Record<string, unknown>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (request: Request) => {
  const { payload } = (await request.json()) as { payload?: FormPayload };
  if (payload?.form_name !== "newsletter") return;

  const data = payload.data ?? {};
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) return;
  const locale = isLocale(data.language) ? data.language : "en";
  const source = typeof data.source === "string" ? data.source.slice(0, 120) : null;
  const firstName = cleanFirstName(data.name);

  try {
    const [created] = await db
      .insert(newsletterSubscribers)
      .values({ email, locale, source, firstName, unsubscribeToken: newUnsubscribeToken() })
      .onConflictDoNothing()
      .returning();

    let subscriber = created;
    if (!subscriber) {
      // Already on the list in this language. A signup in another language is
      // a new row of its own and took the insert above.
      let [existing] = await db
        .select()
        .from(newsletterSubscribers)
        .where(and(eq(newsletterSubscribers.email, email), eq(newsletterSubscribers.locale, locale)));
      if (!existing) return;
      // A name typed this time replaces the one on file (or the lack of one,
      // for anyone who signed up before the form asked).
      if (firstName && firstName !== existing.firstName) {
        [existing] = await db
          .update(newsletterSubscribers)
          .set({ firstName })
          .where(eq(newsletterSubscribers.id, existing.id))
          .returning();
      }
      const contactFields = { ...(existing.firstName ? { first_name: existing.firstName } : {}), unsubscribed: false };
      if (!existing.unsubscribedAt) {
        // Signing up again is the clearest possible request to be on the list,
        // so it also lifts an unsubscribe made from a broadcast, which only
        // Resend knows about. No second welcome.
        if (existing.resendContactId) {
          await resend("PATCH", `/contacts/${encodeURIComponent(email)}`, contactFields);
        }
        return;
      }
      // Coming back after unsubscribing through the welcome email's link.
      [subscriber] = await db
        .update(newsletterSubscribers)
        .set({ unsubscribedAt: null, welcomeSentAt: null })
        .where(eq(newsletterSubscribers.id, existing.id))
        .returning();
      // The unsubscribe link took the contact out of this language's segment
      // and cleared resendContactId, so syncSubscriber below puts it back.
      if (subscriber.resendContactId) {
        await resend("PATCH", `/contacts/${encodeURIComponent(email)}`, contactFields);
      }
    }

    const synced = await syncSubscriber(subscriber);
    const welcomed = await sendWelcome(synced);
    console.log(`Newsletter signup ${subscriber.id} (${locale}) synced; welcome ${welcomed ? "sent" : "deferred"}`);
  } catch (error) {
    // The address itself is never logged.
    console.error("Newsletter signup could not be completed; the hourly job retries it", error);
  }
};
