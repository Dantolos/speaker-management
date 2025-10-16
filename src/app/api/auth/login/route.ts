import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/auth";

export async function POST(req: Request) {
  const formData = await req.formData();
  const password = formData.get("password")?.toString() || "";
  const redirectPath = formData.get("redirect")?.toString() || "/";

  const res = NextResponse.next();
  const session = await getIronSession(req, res, sessionOptions);

  if (password === process.env.IRON_SESSION_PASSWORD) {
    session.isAuthenticated = true; // Now this is recognized!
    await session.save();

    return NextResponse.json({ success: true, redirect: redirectPath });
  }

  return NextResponse.json({ success: false });
}
