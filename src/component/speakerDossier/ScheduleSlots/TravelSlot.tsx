"use client";
import TravelSlotFlight from "./TravelSlotFlight";
import TravelSlotTrain from "./TravelSlotTrain";
import TravelSlotCar from "./TravelSlotCar";

type TravelProps = {
  slotData: object;
  type: string;
};

export default function TravelSlot({ slotData, type }: TravelProps) {
  const slotContent = () => {
    switch (type) {
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
