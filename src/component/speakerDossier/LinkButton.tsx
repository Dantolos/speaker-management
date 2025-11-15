import React from "react";
import Link from "next/link";

type ButtonParams = {
  text: string;
  link: string;
  icon?: React.ReactNode;
};

export default function LinkButton({ text, link, icon }: ButtonParams) {
  return (
    <Link href={link} target="_blank" className="group">
      <div className="bg-white flex flex-col gap-1 p-2 rounded-2xl items-center transition-all group-hover:bg-gray-100">
        <div className="transition-all group-hover:scale-[1.1]">{icon}</div>
        <p className="font-bold">{text}</p>
      </div>
    </Link>
  );
}
