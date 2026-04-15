"use client";

import { useEffect } from "react";

interface Props {
  theme: Record<string, string | undefined>;
  children: React.ReactNode;
  className?: string;
}

export default function ThemeProvider({ theme, children, className }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
    });
    return () => {
      Object.keys(theme).forEach((key) => root.style.removeProperty(key));
    };
  }, [theme]);

  return <div className={className}>{children}</div>;
}
