"use client";
import TravelSlotFlight from "./TravelSlotFlight";
import TravelSlotTrain from "./TravelSlotTrain";
import TravelSlotCar from "./TravelSlotCar";
import type { DeepPartialScheduleItemType } from "@/types/schedule";

type TravelProps = {
  slotData: DeepPartialScheduleItemType;
  Type: string | undefined;
};

export default function TravelSlot({ slotData, Type }: TravelProps) {
  const slotContent = () => {
    switch (Type) {
      case "Flugzeug":
        return (
          <>
            <TravelSlotFlight
              origin={slotData.Abreiseort}
              destination={slotData.Ankunftsort}
              departureDate={slotData.start}
              arrivalDate={slotData.end}
              flightNr1={slotData["Flugnummer (1. Flug)"]}
              via={slotData.via}
              flightNr2={slotData["Flugnummer (2. Flug)"]}
            />
          </>
        );
      case "Zug":
        return (
          <>
            <TravelSlotTrain
              origin={slotData.Abreiseort}
              destination={slotData.Ankunftsort}
              departureDate={slotData.start}
              arrivalDate={slotData.end}
              trainNr={slotData["Zugnummer / -verbindung"]}
            />
          </>
        );
      case "Auto":
        return (
          <>
            <TravelSlotCar
              destination={slotData.Ankunftsort}
              arrivalDate={slotData.end}
            />
          </>
        );

      default:
        return <></>;
    }
  };

  return <div className="w-full flex flex-col gap-2">{slotContent()}</div>;
}
