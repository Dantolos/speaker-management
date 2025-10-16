import type { DeepPartialScheduleType } from "@/types/schedule";

export default async function programDataMapping(
  rawSpeakerData: object,
): Promise<DeepPartialScheduleType> {
  // console.log(rawSpeakerData);
  const keyMap = {
    "Session Start Time": "start", // Sessions
    "Session End Time": "end",
    Abreisezeit: "start", // Reisen
    Ankunftszeit: "end",
    "Pick Up Time": "start", // Transfers
    "Drop Off Time": "end",
    Startdate: "start", // Backstage Slots
    Enddate: "end",
  };

  let ProgrammData = [];

  if (rawSpeakerData.Sessions) {
    const sessions = rawSpeakerData.Sessions.map((obj) => ({
      ...obj,
      programtype: "session",
    }));
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
    const transfers = rawSpeakerData.Transfers.map((obj) => ({
      ...obj,
      programtype: "transfer",
    }));
    ProgrammData = ProgrammData.concat(transfers);
  }

  if (rawSpeakerData.Backstage) {
    const backstageSlots = rawSpeakerData.Backstage.map((obj) => ({
      ...obj,
      programtype: "backstage",
    }));
    ProgrammData = ProgrammData.concat(backstageSlots);
  }

  // Rename keys according to keyMap on the combined ProgrammData array
  ProgrammData = ProgrammData.map((obj) => {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = keyMap[key] || key;
      acc[newKey] = obj[key];
      return acc;
    }, {});
  });

  // Sort by the Startdate
  ProgrammData = ProgrammData.sort((a, b) => {
    const aDate = new Date(a.start || a.end);
    const bDate = new Date(b.start || b.end);
    return aDate - bDate;
  });

  console.log(ProgrammData);

  return ProgrammData;
}
