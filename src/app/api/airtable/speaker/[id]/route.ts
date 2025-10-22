import { NextRequest, NextResponse } from "next/server";
import { getRecordById } from "@/services/airtable";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  // params ist jetzt ein Promise, deshalb await
  const { id } = await context.params;

  try {
    const record = await getRecordById(process.env.AIRTABLE_TABLE_NAME!, id);
    return NextResponse.json(record);
  } catch (error) {
    console.log(`Error: Speaker Request (speaker/[id]/route.ts): ${error}`);
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
}
