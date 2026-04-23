"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = {
  value: string;
  label?: string;
  className?: string;
};

export default function CopyButton({ value, label, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground transition-colors ${className}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {label && <span>{copied ? "Kopiert" : label}</span>}
    </button>
  );
}
