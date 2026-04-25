import { NextResponse } from "next/server";
import { getInternalSession } from "@/utils/auth";
import { getSession } from "@/services/speaker/program";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const internal = await getInternalSession();
  if (!internal.isAuthenticated) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}
