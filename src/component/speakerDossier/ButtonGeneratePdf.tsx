"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
//import { useTranslations } from "next-intl";

type PDFPros = {
  filename: string;
};

export default function DownloadPdfButton({ filename }: PDFPros) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  //const t = useTranslations("SpeakerBriefing");

  // Datum formatieren und Dateiname bauen
  const getFormattedDate = () => {
    const date = new Date();
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    const year = String(date.getFullYear()).slice(2);
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}_${hours}${minutes}`;
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const currentUrl = window.location.origin + pathname;

      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Cookies nicht manuell senden — Browser sendet sie automatisch mit fetch
        },
        body: JSON.stringify({ url: currentUrl }),
        credentials: "include", // wichtig, damit Cookies mitgesendet werden
      });

      if (!res.ok) {
        alert("PDF konnte nicht generiert werden.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_${getFormattedDate()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      alert("Fehler beim PDF-Download");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="py-3 px-6 border-gray-400 border-2 rounded-2xl bg-gray-100 hover:bg-gray-300 cursor-pointer"
    >
      {isLoading ? (
        <>
          <span
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #ccc",
              borderTop: "2px solid #333",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 1s linear infinite",
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          PDF wird generiert...
          <style>
            {`@keyframes spin {
                 0% { transform: rotate(0deg); }
                 100% { transform: rotate(360deg); }
               }`}
          </style>
        </>
      ) : (
        <>PDF herunterladen</>
      )}
    </button>
  );
}
