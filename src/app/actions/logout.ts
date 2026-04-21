"use server";
import { getInternalSession } from "@/utils/auth";
import { redirect } from "next/navigation";

export async function logout() {
  const session = await getInternalSession();
  session.destroy();
  redirect("/sign-in");
}
