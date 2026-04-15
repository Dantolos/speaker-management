"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DarkModeToggle from "./DarkModeToggle";
import LanguageSwitch from "./LanguageSwitch";

export default function Nav({ locale }: { locale: string }) {
  const pathname = usePathname();

  const links = [
    { href: `/${locale}`, label: "Dashboard" },
    { href: `/${locale}/speaker`, label: "Speaker" },
  ];

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="bg-box-background border-b border-foreground/10 px-6 flex items-center justify-between h-14">
      <div className="flex items-center gap-8">
        <span className="font-medium">L3L MGMT</span>
        <div className="flex gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                isActive(href)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitch currentLocale={locale} />
        <DarkModeToggle />
      </div>
    </nav>
  );
}
