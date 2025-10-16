"use client";
import useSWR from "swr";
import Link from "next/link";

interface Speaker {
  id: string;
  Name: string;
  // ... add other properties you expect
}

export default function HomePage() {
  const { data, error } = useSWR<Speaker[]>(
    "/api/airtable/speaker/events",
    async (url: string) => fetch(url).then((res) => res.json()),
  );

  if (error) return <div>Error!</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <table>
        <tbody>
          {data.map((record) => (
            <tr key={record.id}>
              <td>
                <Link href={`./speaker/${record.id}`}>
                  <p className="px-3 py-1.5 bg-gray-200 rounded-3xl m-2">
                    {record["Name"]}
                  </p>
                </Link>
              </td>
              <td>{record.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
