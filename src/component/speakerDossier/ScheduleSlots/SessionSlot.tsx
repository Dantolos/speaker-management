"use client";
import { useTranslations } from "next-intl";
import { Clock, Languages, MapPin, MessageCircleWarning } from "lucide-react";
import SessionInformationTag from "./SessionInformationTag";
import { Person } from "@/types/speaker";

type SessionProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  room?: string;
  duration?: number;
  language?: string;
  speaker?: Person[] | false;
};

export default function SessionSlot({
  title,
  subtitle,
  room,
  description,
  duration,
  language,
  speaker,
}: SessionProps) {
  const t = useTranslations("SpeakerBriefing");
  const tG = useTranslations("General");

  return (
    <div className="flex flex-col gap-2 ">
      {title && <h4 className="font-bold text-2xl mb-0 ">{title}</h4>}
      {subtitle && <h6 className="font-bold text-lg leading-2">{subtitle}</h6>}
      {description && <p>{description}</p>}
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

      {speaker && (
        <div className="mt-2">
          <p className="font-bold mb-2">{tG("speaker")}</p>
          <div className="flex gap-2 flex-wrap">
            {speaker.map((person, index) => (
              <div key={index} className="py-1 px-3 rounded-2xl bg-primary/10">
                {`${person["First Name"]} ${person["Last Name"]}`}
              </div>
            ))}
          </div>
        </div>
      )}
      {false && (
        <>
          <h5 className="font-bold leading-0 mt-4 mb-2">
            {t("schedule-session-end-title")}
          </h5>
          <p>{t("schedule-session-end-text")}</p>
        </>
      )}
      <div className="flex items-center mt-2 gap-2 border-1 border-secondary rounded-2xl py-3 px-3 bg-secondary/5 text-secondary">
        <MessageCircleWarning />
        <p>
          {t.rich("schedule-attention", {
            b: (chunks) => <b>{chunks}</b>,
          })}
        </p>
      </div>
    </div>
  );
}
