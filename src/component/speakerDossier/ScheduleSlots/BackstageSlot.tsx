"use client";
import { Camera, Eye, Star, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DeepPartialScheduleItemType } from "@/types/schedule";

type BackstageProps = { backstageData: DeepPartialScheduleItemType };

export default function BackstageSlot({ backstageData }: BackstageProps) {
  const t = useTranslations("SpeakerBriefing");

  const slotContent = () => {
    switch (backstageData.Type) {
      case "Maske":
        return (
          <>
            <div className="flex gap-4 items-center mb-2">
              <Eye
                className="bg-white p-2 rounded-xl"
                size={40}
                strokeWidth="2px"
              />
              <div>
                <h3 className="font-bold text-xl leading-[.8em]">
                  {backstageData.Title}
                </h3>
              </div>
            </div>

            <p>{t("schedule-masking-information")}</p>
            {backstageData.Notes && (
              <div className=" bg-white p-2 rounded-2xl">
                <p className="text-gray-400">{t("schedule-note")}:</p>
                <p className="italic">{backstageData.Notes}</p>
              </div>
            )}
          </>
        );
      case "Interview":
        return (
          <>
            <div className="flex gap-4 items-center mb-2">
              <Camera
                className="bg-white p-2 rounded-xl"
                size={40}
                strokeWidth="2px"
              />
              <div>
                <h4 className="mb-1">Interview</h4>
                <h1 className="font-bold text-xl leading-[.8em]">
                  {backstageData.Title}
                </h1>
              </div>
            </div>
            <p>{backstageData.Description}</p>
            {backstageData.Notes && (
              <div className=" bg-white p-2 rounded-2xl">
                <p className="text-gray-400">{t("schedule-note")}:</p>
                <p className="italic">{backstageData.Notes}</p>
              </div>
            )}
          </>
        );
      case "Verpflegung":
        return (
          <>
            <div className=" flex gap-4 items-center  mb-2">
              <Utensils
                className="bg-white p-2 rounded-xl"
                size={40}
                strokeWidth="2px"
              />
              <div>
                <h4>{t("Catering")}</h4>
                <h1 className="font-bold text-xl leading-[.8em]">
                  {backstageData.Title}
                </h1>
              </div>
            </div>
            <p>{backstageData.Description}</p>
            {backstageData.Notes && (
              <div className=" bg-white p-2 rounded-2xl">
                <p className="text-gray-400">{t("schedule-note")}:</p>
                <p className="italic">{backstageData.Notes}</p>
              </div>
            )}
          </>
        );
      case "Q&As":
        return (
          <>
            <div className=" flex gap-4 items-center mb-2">
              <Utensils
                className="bg-white p-2 rounded-xl"
                size={40}
                strokeWidth="2px"
              />
              <div>
                <h1 className="font-bold text-xl leading-[.8em]">
                  {backstageData.Title}
                </h1>
              </div>
            </div>
            <p>{backstageData.Description}</p>
            {backstageData.Notes && (
              <div className=" bg-white p-2 rounded-2xl">
                <p className="text-gray-400">{t("schedule-note")}:</p>
                <p className="italic">{backstageData.Notes}</p>
              </div>
            )}
          </>
        );
      default:
        return (
          <>
            <div className="flex gap-4 items-center mb-2">
              <Star
                className="bg-white p-2 rounded-xl"
                size={40}
                strokeWidth="2px"
              />
              <div>
                <h3 className="font-bold text-xl leading-[.8em]">
                  {backstageData.Title}
                </h3>
              </div>
            </div>
            <p>{backstageData.Description}</p>
            {backstageData.Notes && (
              <div className=" bg-white p-2 rounded-2xl">
                <p className="text-gray-400">{t("schedule-note")}:</p>
                <p className="italic">{backstageData.Notes}</p>
              </div>
            )}
          </>
        );
    }
  };

  return <div className="flex flex-col gap-2">{slotContent()}</div>;
}
