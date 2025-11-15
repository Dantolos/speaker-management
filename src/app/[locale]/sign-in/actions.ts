import { getSession, getTeamSession } from "@/utils/auth";
import { redirect } from "next/navigation";

export async function auth(formData: FormData) {
  "use server";

  const session = await getSession();
  const password = formData.get("password") as string;
  const redirectPath = (formData.get("redirect") as string) || "/";

  if (password === process.env.IRON_SESSION_PASSWORD) {
    session.isAuthenticated = true;
    await session.save();
    redirect(redirectPath.startsWith("/") ? redirectPath : "/");
  } else {
    redirect(`/sign-in?redirect=${encodeURIComponent(redirectPath)}`);
  }
}

export async function authTeam(formData: FormData) {
  "use server";

  const session = await getTeamSession();
  const password = formData.get("password") as string;
  const redirectPath = (formData.get("redirect") as string) || "/";

  if (password === process.env.IRON_SESSION_PASSWORD_TEAM) {
    session.isAuthenticated = true;
    await session.save();
    redirect(redirectPath.startsWith("/") ? redirectPath : "/");
  } else {
    redirect(`/sign-in?redirect=${encodeURIComponent(redirectPath)}`);
  }
}
