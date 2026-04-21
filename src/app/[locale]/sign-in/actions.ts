"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getInternalSession } from "@/utils/auth";

export async function authInternal(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const otp = formData.get("otp") as string;
  const redirectPath = (formData.get("redirect") as string) || "/";

  try {
    const res = await fetch(`${process.env.DIRECTUS_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, otp }),
    });

    if (!res.ok) {
      const err = await res.json();
      const code = err.errors?.[0]?.extensions?.code;
      if (code === "INVALID_OTP") {
        redirect(
          `/sign-in?error=otp&redirect=${encodeURIComponent(redirectPath)}`,
        );
      }
      redirect(
        `/sign-in?error=credentials&redirect=${encodeURIComponent(redirectPath)}`,
      );
    }

    const { data } = await res.json();
    const session = await getInternalSession();
    session.isAuthenticated = true;
    session.directusToken = data.access_token;
    session.refreshToken = data.refresh_token;
    session.email = email;
    await session.save();

    redirect(redirectPath.startsWith("/") ? redirectPath : "/");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.error(e);
    redirect(
      `/sign-in?error=credentials&redirect=${encodeURIComponent(redirectPath)}`,
    );
  }
}
