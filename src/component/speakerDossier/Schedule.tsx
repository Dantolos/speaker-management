"use client";
import React from "react";
import { useFormatter } from "next-intl";
import ScheduleSlot from "./ScheduleSlot";
import type { DeepPartialScheduleType } from "@/types/schedule";

type ScheduleProps = {
  ProgramData: DeepPartialScheduleType;
};

export default function Schedule({ ProgramData }: ScheduleProps) {
  const format = useFormatter();
  let lastDate: string | null = null;

  return (
    <>
      {ProgramData.map((slot, index) => {
        const dateStr = slot.start ?? slot.end;

        if (!dateStr) return null; // skip if both missing

        const slotDate = new Date(dateStr).toDateString();
        const showDateHeader = slotDate !== lastDate;
        lastDate = slotDate;

        return (
          <React.Fragment key={index}>
            {showDateHeader && (
              <div className="border-gray-400 py-2 px-4 w-full rounded-2xl border-2 font-bold">
                {format.dateTime(new Date(slotDate)!, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}

            <ScheduleSlot
              start={slot.start}
              end={slot.end}
              Type={slot.programtype}
              scheduleData={slot}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
