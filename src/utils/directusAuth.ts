// utils/directusAuth.ts
"use server";
import { getInternalSession } from "./auth";

export async function getValidToken(): Promise<string | undefined> {
  const session = await getInternalSession();
  if (!session.isAuthenticated || !session.directusToken) return undefined;

  const payload = JSON.parse(
    Buffer.from(session.directusToken.split(".")[1], "base64").toString(),
  );
  const isExpired = payload.exp * 1000 < Date.now() + 10_000;

  if (!isExpired) return session.directusToken;

  try {
    const res = await fetch(`${process.env.DIRECTUS_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });

    if (!res.ok) return undefined;

    const { data } = await res.json();
    session.directusToken = data.access_token;
    session.refreshToken = data.refresh_token;
    await session.save();
    return session.directusToken;
  } catch {
    return undefined;
  }
}
