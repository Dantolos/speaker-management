import Link from "next/link";
import CopyToClipboardButton from "@/component/Utils/CopyButton";
import type { Speaker } from "@/types/speaker";
import { ArrowRight } from "lucide-react";

export default function SpeakerTable({ Speakers }: { Speakers: Speaker[] }) {
  return (
    <table className="px-4 mx-4">
      <tbody>
        {Speakers.map((speaker) => (
          <tr
            key={speaker.id}
            className="rounded-2xl hover:bg-gray-100  hover:border-s-stone-600 px-4 overflow-hidden"
          >
            <td>
              <p className="px-3 py-1.5 bg-gray-200 rounded-3xl m-2">
                {`${speaker.Person?.["First Name"]} ${speaker.Person?.["Last Name"]}`}
              </p>
            </td>

            <td>
              <CopyToClipboardButton
                text={`${process.env.NEXT_PUBLIC_BASE_URL}/speaker/${speaker.id}`}
              />
            </td>
            <td>
              <Link href={`./speaker/${speaker.id}`}>
                <div className="bg-gray-200 p-2 rounded-2xl group transition-all hover:bg-gray-300 ml-4">
                  <ArrowRight
                    color="#4b4b4b"
                    size={20}
                    className="transition-all group-hover:scale-[1.2]"
                  />
                </div>
              </Link>
            </td>
            <td className="text-gray-400 pl-2">
              <div className="rounded-2xl border-1 border-gray-400 overflow-hidden py-1 px-2">
                <span className="  p-1 h-full">ID:</span> {speaker.id}{" "}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
