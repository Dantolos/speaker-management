"use client";
import { TrainFront } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";

type TrainProps = {
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  trainNr: string;
};

export default function TravelSlotTrain({
  origin,
  destination,
  departureDate,
  arrivalDate,
  trainNr,
}: TrainProps) {
  const t = useTranslations("SpeakerBriefing");
  const format = useFormatter();
  const departure_Date = departureDate ? new Date(departureDate) : undefined;
  const arrival_Date = arrivalDate ? new Date(arrivalDate) : undefined;

  return (
    <>
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center ">
          <TrainFront size={30} />
          <h3 className="text-2xl font-bold">{t("schedule-train-journey")}</h3>
        </div>
        <h4 className="justify-self-end font-bold">
          {format.dateTime(departure_Date!, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
        </h4>
      </div>
      <div className="bg-white rounded-2xl p-2 w-full flex justify-between">
        <div className="flex gap-4">
          <div className="self-center">
            <p>{t("schedule-origin")}</p>
            <p className="text-2xl font-bold">{origin}</p>
          </div>
        </div>
        <div className="flex items-end flex-col">
          {trainNr && (
            <p>
              {t("schedule-trainnr")}
              <span className="font-bold bg-gray-200 rounded-2xl p-2 ml-1">
                {trainNr}
              </span>
            </p>
          )}
          {departure_Date && (
            <div className="flex items-end flex-col justify-center">
              <p className="text-2xl font-bold">
                {format.dateTime(departure_Date!, {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-2 w-full flex justify-between">
        <div className="flex gap-4">
          <div className="self-center">
            <p>{t("schedule-destination")}</p>
            <p className="text-2xl font-bold">{destination}</p>
          </div>
        </div>
        <div className="flex items-end flex-col">
          {arrival_Date && (
            <div className="flex items-end flex-col justify-center">
              <p className="text-2xl font-bold">
                {format.dateTime(arrival_Date!, {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p>
                {format.dateTime(arrival_Date!, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
