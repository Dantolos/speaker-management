import { NextRequest, NextResponse } from "next/server";
import { getRecords } from "@/services/airtable";

export async function GET(request: NextRequest) {
  const filter = `FIND("AD2025", ARRAYJOIN({Speaker an Event}))`;
  const records = await getRecords(process.env.AIRTABLE_TABLE_NAME!, filter);
  return NextResponse.json(records);
}
