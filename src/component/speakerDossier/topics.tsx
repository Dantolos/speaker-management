import { notFound } from "next/navigation";
import { getMultipleRecordsById } from "@/services/airtable";

interface Speaker {
  id: string;
  "Speaker Name"?: string;
}

interface Props {
  topics: string[];
}

export default async function Topics({ topics }: Props) {
  // Direkt Airtable-Daten abfragen – ohne fetch
  const data: Speaker | null = await getMultipleRecordsById("Topics"!, topics);

  if (!data) {
    notFound();
  }

  return (
    <main>
      <h1>Speaker: {data["Speaker Name"] || "Kein Name"}</h1>
      <p>ID: {data.id}</p>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </main>
  );
}
