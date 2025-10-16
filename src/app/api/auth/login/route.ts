import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/utils/auth";

export async function POST(req: Request) {
  const formData = await req.formData();
  const password = formData.get("password")?.toString() || "";

  const session = await getIronSession<SessionData>(
    req,
    NextResponse.next(),
    sessionOptions,
  );

  if (password === process.env.IRON_SESSION_PASSWORD) {
    session.isAuthenticated = true;
    await session.save();
    return NextResponse.json({ success: true, redirect: "/" });
  }

  return NextResponse.json({ success: false, message: "Invalid password" });
}
