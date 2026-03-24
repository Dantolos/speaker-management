// component/UI/LanguageSwitcher.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

interface Props {
  currentLocale: string;
}

export default function LanguageSwitch({ currentLocale }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Aktuellen Pfad nehmen und Locale ersetzen
    const newPath = pathname.replace(`/${currentLocale}/`, `/${newLocale}/`);
    router.push(newPath);
  };

  return (
    <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
      {["de", "en"].map((lang) => (
        <button
          key={lang}
          onClick={() => switchLocale(lang)}
          className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
            currentLocale === lang
              ? "bg-white shadow text-black"
              : "text-gray-500 hover:text-black"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
