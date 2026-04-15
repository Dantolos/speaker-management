type TagProps = {
  label: string;
  value: string;
  icon: React.ReactNode | undefined;
};
export default function SessionInformationTag({
  label,
  value,
  icon,
}: TagProps) {
  return (
    <div className=" border-primary/60 border-2 p-1  rounded-2xl flex gap-2 items-center ">
      {icon}
      <p className="text-primary/80">{label} | </p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
