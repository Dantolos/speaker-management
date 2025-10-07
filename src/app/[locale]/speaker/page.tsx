"use client";
import useSWR from "swr";

export default function HomePage() {
  const { data, error } = useSWR("/api/airtable/speaker/events", async (url) =>
    fetch(url).then((res) => res.json()),
  );

  if (error) return <div>Error!</div>;
  if (!data) return <div>Loading...</div>;

  console.log(data);
  return (
    <div>
      {data.map((record: any) => (
        <div key={record.id}>
          <p className="font-bold">{record["Speaker Name"]}</p>
          <p>{record.Position}</p>
        </div>
      ))}
    </div>
  );
}
