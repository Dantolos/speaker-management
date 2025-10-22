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
  return (
    <>
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center ">
          <Car size={30} />
          <h3 className="text-2xl font-bold">{t("schedule-car-title")}</h3>
          {arrival_Date && (
            <p className="mt-2">
              {`${t("schedule-car-arrival")} `}
              <span className="font-bold">
                {format.dateTime(arrival_Date, {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </span>
              .
            </p>
          )}
        </div>
      </div>
      <p>{t("schedule-car-text")}</p>
      {destination && <p>{destination}</p>}
    </>
  );
}
