import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!,
);

export async function getRecords(tableName: string, filterFormula?: string) {
  const queryOptions = filterFormula ? { filterByFormula: filterFormula } : {};
  const records = await base(tableName).select(queryOptions).all();
  return records.map((record) => record.fields);
}
