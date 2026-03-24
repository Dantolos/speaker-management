type Props = {
  label: string;
  value: React.ReactNode;
  note?: string | null;
};
export default function InfoRow({ label, value, note }: Props) {
  return (
    <>
      <div className="flex w-full gap-[2%] mb-3 items-center">
        <div className="w-[15%]">
          <p className="font-bold">{label}</p>
        </div>
        <div className="w-[73%]">
          {note && <div className="">{note}</div>}
          <div className="w-full border-primary/10 border-2 p-2 rounded-xl">
            {value}
          </div>
        </div>
      </div>
    </>
  );
}
