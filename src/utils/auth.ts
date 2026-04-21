import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

// ── Types ──────────────────────────────────────────────────────────────────

export interface InternalSessionData {
  isAuthenticated?: boolean;
  directusToken?: string;
  refreshToken?: string;
  email?: string;
}

export interface SpeakerSessionData {
  isAuthenticated?: boolean;
  eventId?: string;
}

// ── Internal Session (Directus Login) ─────────────────────────────────────

export const internalSessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_SECRET!,
  cookieName: "_auth_internal",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};

export async function getInternalSession() {
  const cookieStore = await cookies();
  return getIronSession<InternalSessionData>(
    cookieStore,
    internalSessionOptions,
  );
}

// ── Speaker Session (Event-Passwort) ──────────────────────────────────────

export const speakerSessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_SECRET!,
  cookieName: "_auth_speaker",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};

export async function getSpeakerSession() {
  const cookieStore = await cookies();
  return getIronSession<SpeakerSessionData>(cookieStore, speakerSessionOptions);
}

// ── Backwards compatibility ────────────────────────────────────────────────

/** @deprecated use getInternalSession */
export const getSession = getInternalSession;
/** @deprecated use getSpeakerSession */
export const getTeamSession = getSpeakerSession;

// ── Logout ────────────────────────────────────────────────────────────────

export async function logoutInternal() {
  const session = await getInternalSession();
  session.destroy();
}

export async function logoutSpeaker() {
  const session = await getSpeakerSession();
  session.destroy();
}
