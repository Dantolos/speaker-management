"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import LanguageSwitch from "./LanguageSwitch";
import { logout } from "@/app/actions/logout";

interface Props {
  locale: string;
  email?: string;
}

export default function Nav({ locale, email }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const links = [
    { href: `/${locale}`, label: "Dashboard" },
    { href: `/${locale}/speaker`, label: "Speaker" },
    { href: `/${locale}/events`, label: "Events" },
  ];

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  const initials = email ? email.slice(0, 2).toUpperCase() : "?";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="bg-box-background border-b border-foreground/10 px-6 flex items-center justify-between h-14 sticky top-0">
      <div className="flex items-center gap-8">
        <Image
          src="/assets/linden-icon.svg"
          alt="LINDENverse"
          height={30}
          width={30}
        />
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

        {/* Profile */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((p) => !p)}
            className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center hover:bg-primary/30 transition-all"
          >
            {initials}
          </button>

          {open && (
            <div className="absolute right-0 top-10 w-48 bg-box-background border border-foreground/10 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-foreground/10">
                <p className="text-xs text-foreground/50 truncate">{email}</p>
              </div>
              <div className="p-1">
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
                  >
                    <LogOut size={14} />
                    Abmelden
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
