import { NextResponse } from "next/server";
import { getInternalSession } from "@/utils/auth";
import {
  getContact,
  getContactContributions,
} from "@/services/speaker/contacts";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const session = await getInternalSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [contact, contributions] = await Promise.all([
    getContact(id),
    getContactContributions(id),
  ]);

  if (!contact) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ contact, contributions });
}
