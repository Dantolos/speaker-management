import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/utils/auth";

export async function GET(req: Request) {
  const session = await getIronSession<SessionData>(
    req,
    NextResponse.next(),
    sessionOptions,
  );
  return NextResponse.json({
    isAuthenticated: session.isAuthenticated || false,
  });
}

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(
    req,
    NextResponse.next(),
    sessionOptions,
  );
  session.destroy();
  return NextResponse.json({ success: true });
}
