// component/UI/DarkModeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = (isDark: boolean) => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  };

  return (
    <div className="flex gap-1 bg-primary/20 rounded-2xl p-1">
      {[
        { value: false, icon: <Sun size={16} /> },
        { value: true, icon: <Moon size={16} /> },
      ].map(({ value, icon }) => (
        <button
          key={String(value)}
          onClick={() => toggle(value)}
          className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
            dark === value
              ? "bg-white shadow text-primary"
              : "text-primary hover:text-font-primary"
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
