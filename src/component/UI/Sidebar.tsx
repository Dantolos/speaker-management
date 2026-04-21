"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";

export type SidebarLink = {
  href: string;
  label: string;
  icon: ReactNode;
};

type Props = {
  sectionLabel: string;
  links: SidebarLink[];
};

export default function Sidebar({ sectionLabel, links }: Props) {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const [open, setOpen] = useState(true);

  const isActive = (href: string) => pathname === `/${locale}${href}`;

  return (
    <aside
      className={`border-r border-foreground/10 bg-box-background flex sticky top-14  h-[calc(100vh-64px)] flex-col   p-3 shrink-0 transition-all duration-200 ${open ? "w-52" : "w-14"}`}
    >
      {/* Toggle */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="self-end mb-3 p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
      >
        {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Section label */}
      {open && (
        <p className="text-xs font-medium text-foreground/40 px-2 py-1 uppercase tracking-wider">
          {sectionLabel}
        </p>
      )}

      {/* Links */}
      <div className="flex flex-col gap-1 mt-1">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={`/${locale}${href}`}
            className={`flex items-center gap-2 text-sm px-2 py-2 rounded-lg transition-all ${
              isActive(href)
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            } ${!open ? "justify-center" : ""}`}
            title={!open ? label : undefined}
          >
            <span className="shrink-0">{icon}</span>
            {open && <span>{label}</span>}
          </Link>
        ))}
      </div>
    </aside>
  );
}
