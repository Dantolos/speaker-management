"use client";
import { useTranslations, useFormatter } from "next-intl";
import { Clock, Languages, MapPin } from "lucide-react";
import SessionInformationTag from "./SessionInformationTag";

type SessionProps = {
  room?: string;
  duration?: number;
  language?: string;
};

export default function SessionSlot({
  room,
  duration,
  language,
}: SessionProps) {
  const t = useTranslations("SpeakerBriefing");
  const format = useFormatter();
  //const pickup_Date = pickUpTime ? new Date(pickUpTime) : undefined;

  return (
    <div className="flex flex-col gap-2 ">
      {room && (
        <SessionInformationTag
          label={t("label-room")}
          value={room}
          icon={<MapPin size="22" className="  text-gray-400" />}
        />
      )}
      {duration && (
        <SessionInformationTag
          label={t("label-duration")}
          value={`${duration} ${t("sufix-minute")}`}
          icon={<Clock size="22" className="  text-gray-400" />}
        />
      )}
      {language && (
        <SessionInformationTag
          label={t("label-language")}
          value={language}
          icon={<Languages size="22" className="  text-gray-400" />}
        />
      )}
      <h5 className="font-bold leading-0 mt-4">
        {t("schedule-session-end-title")}
      </h5>
      <p>{t("schedule-session-end-text")}</p>
    </div>
  );
}
