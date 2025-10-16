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
    <div className=" bg-white p-1 rounded-2xl flex gap-2 items-center ">
      {icon}
      <p className="text-gray-400">{label} | </p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
