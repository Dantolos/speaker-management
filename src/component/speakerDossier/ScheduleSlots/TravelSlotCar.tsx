"use client";

import { Car } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";

type CarProps = {
  destination?: string;
  arrivalDate?: string;
};

export default function TravelSlotCar({ destination, arrivalDate }: CarProps) {
  const t = useTranslations("SpeakerBriefing");
  const format = useFormatter();
  const arrival_Date = arrivalDate ? new Date(arrivalDate) : undefined;

  const venue: string = destination ? destination : "";
  return (
    <>
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <Car size={30} />
          <h3 className="text-2xl font-bold">{t("schedule-car-title")}</h3>
          <div className="w-full">
            {arrival_Date && (
              <p className="mt-2">
                {`${t("schedule-car-arrival", {
                  time: format.dateTime(arrival_Date, {
                    hour: "numeric",
                    minute: "numeric",
                  }),
                  venue: venue,
                })} `}
              </p>
            )}
          </div>
        </div>
      </div>
      <p>{t("schedule-car-text")}</p>
    </>
  );
}
