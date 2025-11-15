import { getRecords } from "@/services/airtable";
import { redirect } from "next/navigation";

import type { Speaker } from "@/types/speaker";
import SpeakerTable from "@/component/Pages/Speaker/SpeakerTable";
import { getTeamSession } from "@/utils/auth";

export default async function SpeakerPage() {
  const session = await getTeamSession();

  if (!session.isAuthenticated) {
    redirect(`/sign-in?redirect=/speaker&type=team`);
  }

  const Speakers: Speaker[] = await getRecords("Confirmed Contributions");

  return (
    <div>
      <h1>Speaker</h1>
      {Speakers && Speakers.length > 0 && <SpeakerTable Speakers={Speakers} />}
    </div>
  );
}
