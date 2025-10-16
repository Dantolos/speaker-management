"use client";
import React from "react";
import { useFormatter } from "next-intl";
import ScheduleSlot from "./ScheduleSlot"; // or wherever your component is

type ScheduleProps = {
  ProgramData: Array;
};

export default function Schedule({ ProgramData }: ScheduleProps) {
  const format = useFormatter();
  let lastDate = null;

  return (
    <>
      {ProgramData.map((slot, index) => {
        const slotDate = slot.start
          ? new Date(slot.start).toDateString()
          : new Date(slot.end).toDateString();
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
              starttime={slot.start}
              endtime={slot.end}
              type={slot.programtype}
              scheduleData={slot}
              // subtitle={t("schedule-arrival")}
              // title={t(arrival.Reisetyp)} // Gemapt mit "Flugzeug": Flug / Flight
              // description={""}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
