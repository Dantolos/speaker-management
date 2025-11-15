"use client";

import { useState, ReactNode, useRef, useEffect } from "react";

interface L3AccoredonProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Accordeon({ title, icon, children }: L3AccoredonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string | undefined>("0px");

  useEffect(() => {
    if (isOpen) {
      setMaxHeight(`${contentRef.current?.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }
  }, [isOpen]);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="bg-gray-100 rounded-2xl overflow-hidden mt-4">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center py-4 p-4 bg-gray-100 font-semibold text-left hover:bg-gray-100  hover:cursor-pointer  transition-all"
        aria-expanded={isOpen}
        aria-controls="accordion-content"
      >
        <div className="flex gap-4 items-center">
          {icon && <div className="bg-white rounded-2xl p-2">{icon}</div>}
          <h2 className="text-2xl font-bold pb-0 leading-1 translate-y-0.5  ">
            {title}
          </h2>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-300  ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        ref={contentRef}
        id="accordion-content"
        className={`overflow-hidden transition-max-height duration-500 ease-in-out bg-gray-100  px-4`}
        style={{ maxHeight }}
      >
        <div className={`${isOpen && "border-t-1"} border-t-gray-500 py-4`}>
          {children}
        </div>
      </div>
    </div>
  );
}
