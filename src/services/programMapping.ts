import type { DeepPartialScheduleType } from "@/types/schedule";
import type { DeepPartialSpeaker } from "@/types/speaker";

export default async function programDataMapping(
  rawSpeakerData: DeepPartialSpeaker,
): Promise<DeepPartialScheduleType> {
  // console.log(rawSpeakerData);
  const keyMap: { [key: string]: string } = {
    "Session Start Time": "start", // Sessions
    "Session End Time": "end",
    Abreisezeit: "start", // Reisen
    Ankunftszeit: "end",
    "Pick Up Time": "start", // Transfers
    "Drop Off Time": "end",
    Startdate: "start", // Backstage Slots
    Enddate: "end",
    "Dauer in Minuten": "Duration",
  };

  let ProgrammData: DeepPartialScheduleType = [];

  if (rawSpeakerData.Sessions) {
    const sessions = rawSpeakerData.Sessions.map(
      (obj) =>
        ({
          ...obj,
          programtype: "session",
        }) as DeepPartialScheduleType[number],
    );
    ProgrammData = ProgrammData.concat(sessions);
  }

  if (rawSpeakerData.Reisen) {
    const reisen = rawSpeakerData.Reisen.map((obj) => ({
      ...obj,
      programtype: "travel",
    }));
    ProgrammData = ProgrammData.concat(reisen);
  }

  if (rawSpeakerData.Transfers) {
    const transfers = rawSpeakerData.Transfers.map(
      (obj) =>
        ({
          ...obj,
          programtype: "transfer",
        }) as DeepPartialScheduleType[number],
    );
    ProgrammData = ProgrammData.concat(transfers);
  }

  if (rawSpeakerData.Backstage) {
    const backstageSlots = rawSpeakerData.Backstage.map(
      (obj) =>
        ({
          ...obj,
          programtype: "backstage",
        }) as DeepPartialScheduleType[number],
    );
    ProgrammData = ProgrammData.concat(backstageSlots);
  }

  // Rename keys according to keyMap on the combined ProgrammData array
  ProgrammData = ProgrammData.map((obj) => {
    return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
      const newKey = keyMap[key] || key;
      acc[newKey] = (obj as Record<string, unknown>)[key];
      return acc;
    }, {});
  });

  // Sort by the Startdate
  ProgrammData = ProgrammData.sort((a, b) => {
    const aDate = new Date(a.start ?? a.end ?? "");
    const bDate = new Date(b.start ?? b.end ?? "");
    return aDate.getTime() - bDate.getTime();
  });

  return ProgrammData;
}
