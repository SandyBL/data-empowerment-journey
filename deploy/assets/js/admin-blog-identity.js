/**
 * One Identity session, shared between this page's sign-in and the editor.
 *
 * Decap's Git Gateway backend signs every commit it makes with a Netlify
 * Identity access token, and it gets that token in one of two ways: from
 * `window.netlifyIdentity` if the page provides it, or -- failing that -- from
 * an Identity client it builds for itself, restored from the session left in
 * localStorage.
 *
 * The second way looks like it works, and it does, for about an hour. The
 * sign-in on this page keeps its own session refreshed: @netlify/identity
 * schedules a refresh a minute before the access token expires, exchanges the
 * refresh token for a new pair, and writes the result back. The editor's
 * separate client is not party to any of that. It holds the refresh token it
 * read at sign-in, and Identity honours a refresh token once -- so the first
 * request the editor makes after its own copy of the token goes stale tries to
 * refresh with a token that has already been spent, is refused, and clears the
 * session. The next call for a token finds nothing at all, which reaches the
 * author as:
 *
 *   Failed to persist entry: ACCESS_TOKEN_ERROR: Failed getting access token:
 *   Gotrue-js: failed getting jwt access token
 *
 * Which is to say it reaches them on the Publish button at the end of a long
 * writing session, having given no sign of trouble while the article was being
 * written -- and it takes this page's session down with it, since clearing
 * removes the session the sign-in established too.
 *
 * So the second way is taken off the table. This module provides the first: a
 * `window.netlifyIdentity` standing in for the identity widget this site does
 * not load, backed by the session the sign-in card already established and
 * reading its tokens through @netlify/identity's own API. There is then one
 * client, one refresh schedule and one refresh token, and the editor sends
 * whichever access token the page currently holds.
 *
 * The surface below is exactly what decap-cms-backend-git-gateway 3.8 calls on
 * `window.netlifyIdentity`, and no more.
 */
import { getUser, logout, refreshSession } from "/assets/js/vendor/netlify-identity.js";

/**
 * The cookie @netlify/identity keeps the current access token in. It writes it
 * on sign-in and rewrites it on every refresh, which is what makes reading it
 * here equivalent to asking the session for its token -- without opening a
 * second client on the session to do the asking.
 */
const TOKEN_COOKIE = "nf_jwt";

const SESSION_GONE =
  "the Blog Content Studio sign-in has expired. Copy the article text somewhere safe, then reload this page, sign in again, and paste it into a fresh entry.";

const readCookie = (name) => {
  const match = new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`).exec(document.cookie);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

/**
 * Seconds until the token expires, or null if it does not say.
 *
 * Only used to turn an already-expired token into the message above, rather
 * than letting Git Gateway answer a doomed commit with a bare 401.
 */
const secondsOfLifeLeft = (token) => {
  const payload = token.split(".")[1];
  if (!payload) return null;
  const padded = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
  try {
    const { exp } = JSON.parse(atob(padded));
    return typeof exp === "number" ? exp - Math.floor(Date.now() / 1000) : null;
  } catch {
    return null;
  }
};

/**
 * The access token to sign the next Git Gateway request with.
 *
 * `refreshSession` is the shared session's own refresh: it returns a new token
 * when the current one is within a minute of expiring, does nothing and
 * returns null when it is not, and de-duplicates against the refresh the page
 * has already scheduled. So calling it before every request costs nothing
 * while the token is good, and is the whole recovery when it is not -- notably
 * after a laptop has been asleep for longer than the token lives, where the
 * scheduled refresh never got to run.
 */
const accessToken = async () => {
  const refreshed = await refreshSession();
  const token = refreshed ?? readCookie(TOKEN_COOKIE);
  if (!token) throw new Error(SESSION_GONE);

  const remaining = secondsOfLifeLeft(token);
  if (remaining !== null && remaining <= 0) throw new Error(SESSION_GONE);

  return token;
};

/**
 * Installs the bridge, and says whether it managed to.
 *
 * Must be called before the editor's script is appended: Decap reads
 * `window.netlifyIdentity` as its bundle evaluates, and builds a client of its
 * own if nothing is there.
 */
export const bridgeIdentityToEditor = async () => {
  if (window.netlifyIdentity) return true;

  // The editor asks who is signed in synchronously, so the answer is settled
  // here, before it can ask. There is no one to bridge to otherwise.
  const user = await getUser();
  if (!user) return false;

  /**
   * What Decap gets when it asks who is signed in: the email and metadata it
   * labels the editor with, and the function it takes its tokens from.
   *
   * It binds that function once, when it signs in, and calls the bound copy
   * for every Git Gateway request for the rest of the session -- so the token
   * is deliberately resolved per call rather than captured here. Capturing it
   * is the mistake that produces a working editor which cannot publish an hour
   * later.
   */
  const editorUser = () => ({
    email: user.email,
    user_metadata: user.userMetadata ?? {},
    jwt: accessToken,
  });

  window.netlifyIdentity = {
    /**
     * Decap registers "init" as its bundle evaluates and waits up to two and a
     * half seconds for it before it will look up the signed-in user, so it is
     * answered at once -- the session it is waiting on was established before
     * the editor was even downloaded.
     *
     * Its authentication screen also registers "login", "logout" and "error".
     * Nothing here fires those: signing in happens on this page before the
     * editor exists, and signing out reloads it. They are accepted and ignored
     * rather than left to fault.
     */
    on(event, handler) {
      if (event === "init") queueMicrotask(() => handler(editorUser()));
    },

    /** Only reached if "init" somehow never arrived. Nothing needs starting. */
    init() {},

    currentUser: () => editorUser(),

    /**
     * Decap's own Log out. Ending the session is the easy half; the other half
     * is that this page is still showing the editor, so it reloads, which
     * brings back the sign-in card the way a first visit does.
     */
    async logout() {
      try {
        await logout();
      } catch {
        /* the session is being abandoned either way */
      }
      window.location.reload();
    },

    /**
     * The widget these stand in for opens a modal to sign in and closes it
     * afterwards. Here the sign-in card on this page is that modal, so closing
     * is nothing and opening is a reload back to it.
     */
    close() {},
    open() {
      window.location.reload();
    },

    /**
     * Emptied by Decap if `logout` throws, to force its authentication screen
     * back to the login state. Nothing here reads it; it exists so that path
     * has a store to empty instead of faulting.
     */
    store: { user: null, modal: { page: "login" }, saving: false },
  };

  return true;
};
