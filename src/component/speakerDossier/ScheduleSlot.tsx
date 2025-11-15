"use client";
import { useFormatter } from "next-intl";
import TravelSlot from "./ScheduleSlots/TravelSlot";
import TransferSlot from "./ScheduleSlots/TransferSlot";
import SessionSlot from "./ScheduleSlots/SessionSlot";
import BackstageSlot from "./ScheduleSlots/BackstageSlot";
import type { DeepPartialScheduleItemType } from "@/types/schedule";

type ScheduleSlotProts = {
  start: string | undefined;
  Duration?: string | number | undefined;
  end: string | undefined;
  Type?: string | undefined;
  Title?: string | undefined;
  scheduleData: DeepPartialScheduleItemType;
};

export default function ScheduleSlot({
  start,
  Duration,
  end,
  Type,
  Title,
  scheduleData,
}: ScheduleSlotProts) {
  const format = useFormatter();

  const time_start = start ? new Date(start) : undefined;
  let time_end = end ? new Date(end) : undefined;
  if (Duration !== undefined && start) {
    const durationMinutes =
      typeof Duration === "string" ? Number(Duration) : Duration;
    if (!isNaN(durationMinutes)) {
      time_end = new Date(new Date(start).getTime() + durationMinutes * 60000);
    }
  }

  return (
    <div className="p-4 bg-gray-100 gap-4 flex items-stretch rounded-2xl min-h-[80px] break-inside-avoid">
      <div className="w-[100px]   flex flex-col justify-between self-stretch relative pl-3">
        <div className="absolute top-0 border-l-2 h-[calc(100%-22px)]  mt-[10px] -ml-3"></div>
        {time_start && (
          <div className="relative">
            <div className="rounded-full h-[8px] w-[8px]  bg-gray-900 absolute -left-[15px] top-[8px]"></div>
            {format.dateTime(time_start, {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
        )}
        {time_end && (
          <div className="absolute bottom-0">
            <div className="rounded-full h-[8px] w-[8px]  bg-gray-900 absolute -left-[15px] top-[7px]"></div>
            {format.dateTime(time_end, {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
        )}
      </div>
      <div className="w-full border-l-2 border-gray-200 pl-4">
        <h4 className="font-bold text-xl">{Title}</h4>
        {(() => {
          switch (Type) {
            case "session":
              return (
                <SessionSlot
                  subtitle={scheduleData["Session-Untertitel"]}
                  room={scheduleData["Room"]}
                  duration={scheduleData.Duration}
                  language={scheduleData["Sessionsprache"]}
                />
              );
            case "transfer":
              return (
                <TransferSlot
                  note={scheduleData.Bemerkung}
                  pickUpTime={scheduleData.start}
                  pickupAddress={scheduleData["Adresse (from Pick Up)"]}
                  dropoffTime={scheduleData.end}
                  dropoffAddress={scheduleData["Adresse (from Drop Off)"]}
                />
              );
            case "travel":
              return (
                <TravelSlot
                  slotData={scheduleData}
                  Type={scheduleData.Reisetyp}
                />
              );
            case "backstage":
              return <BackstageSlot backstageData={scheduleData} />;

            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
}
