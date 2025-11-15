"use client";
import { Bus } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";

type TransferProps = {
  note?: string;
  pickUpTime?: string;
  pickupAddress?: string | undefined;
  dropoffTime?: string;
  dropoffAddress?: string | undefined;
};

export default function TransferSlot({
  note,
  pickUpTime,
  pickupAddress,
  dropoffTime,
  dropoffAddress,
}: TransferProps) {
  const t = useTranslations("SpeakerBriefing");
  const tg = useTranslations("General");
  const format = useFormatter();
  const pickup_Date = pickUpTime ? new Date(pickUpTime) : undefined;
  const dropoff_Date = dropoffTime ? new Date(dropoffTime) : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center flex-wrap">
        <Bus size={30} />
        <h3 className="font-bold text-2xl">Transfer</h3>
      </div>
      <p>{t("schedule-transfer-text")}</p>

      <div className="w-full flex gap-2">
        <div className="bg-white p-2 rounded-2xl">
          <p className="font-bold">{t("schedule-pickup")}</p>
          <div className="text-2xl">
            {format.dateTime(pickup_Date!, {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
          <div>{pickupAddress}</div>
        </div>
        <div className="bg-white p-2 rounded-2xl">
          <p className="font-bold">{t("schedule-dropoff")}</p>
          <div className="text-2xl">
            {format.dateTime(dropoff_Date!, {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
          <div>{dropoffAddress}</div>
        </div>
      </div>
      {note && (
        <div className="bg-white p-2 rounded-2xl">
          <p className="font-bold">{tg("note")}</p>
          <p>{note}</p>
        </div>
      )}
    </div>
  );
}
