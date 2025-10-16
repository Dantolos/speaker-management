"use client";
import { useFormatter } from "next-intl";
import TravelSlot from "./ScheduleSlots/TravelSlot";
import TransferSlot from "./ScheduleSlots/TransferSlot";
import SessionSlot from "./ScheduleSlots/SessionSlot";
import BackstageSlot from "./ScheduleSlots/BackstageSlot";

type ScheduleSlotProps = {
  starttime: string | null;
  duration?: string | null;
  endtime?: string | null;
  type: string;
  title?: string;
  subtitle?: string | null;
  description?: React.ReactNode | undefined;
  scheduleData?: object | null;
};

export default function ScheduleSlot({
  starttime,
  duration,
  endtime,
  type,
  title,
  subtitle,
  description,
  scheduleData,
}: ScheduleSlotProps) {
  const format = useFormatter();

  const time_start = starttime ? new Date(starttime) : undefined;
  let time_end = endtime ? new Date(endtime) : undefined;
  if (duration) {
    time_end = new Date(starttime + duration * 60000);
  }

  return (
    <div className="p-4 bg-gray-100 gap-4 flex items-stretch rounded-2xl min-h-[80px] break-inside-avoid">
      <div className="w-[100px]   flex flex-col justify-between self-stretch relative pl-3">
        <div className="absolute top-0 border-l-2 h-[calc(100%-22px)]  mt-[10px] -ml-3"></div>
        {starttime && (
          <div className="relative">
            <div className="rounded-full h-[8px] w-[8px]  bg-gray-900 absolute -left-[15px] top-[8px]"></div>
            {format.dateTime(time_start, {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
        )}
        {endtime && (
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
        {subtitle && <h6>{subtitle}</h6>}
        <h4 className="font-bold text-xl">{title}</h4>
        {(() => {
          switch (type) {
            case "session":
              return (
                <SessionSlot
                  room={scheduleData["Room"]}
                  duration={scheduleData["Dauer in Minuten"]}
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
                  type={scheduleData.Reisetyp}
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
