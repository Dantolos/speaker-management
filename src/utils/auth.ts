import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isAuthenticated?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_SECRET!,
  cookieName: "_auth",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();

  return await getIronSession<SessionData>(cookieStore, sessionOptions);
}

export const teamSessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_SECRET_TEAM!, // different secret or reuse the same
  cookieName: "_auth_team",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    path: "/", // or "/" if shared domain but different cookie
  },
};

export async function getTeamSession() {
  const cookieStore = await cookies();
  return await getIronSession<SessionData>(cookieStore, teamSessionOptions);
}
