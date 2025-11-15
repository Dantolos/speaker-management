"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

const CopyToClipboardButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy text to clipboard", error);
    }
  };

  return (
    <button
      onClick={handleCopyClick}
      className="bg-gray-200 p-3 rounded-2xl group transition-all hover:bg-gray-300"
    >
      {isCopied ? (
        <Check color="#4b4b4b" size={15} className="transition-all scale-100" />
      ) : (
        <Copy
          color="#4b4b4b"
          size={15}
          className="transition-all group-hover:scale-[1.2]"
        />
      )}
    </button>
  );
};

export default CopyToClipboardButton;
