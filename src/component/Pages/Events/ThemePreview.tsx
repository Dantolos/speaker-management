import { ThemeOption } from "@/services/speaker/dashboard";

export default function ThemePreview({ theme }: { theme: ThemeOption | null }) {
  if (!theme) return null;

  const colors = [
    { label: "Primary", value: theme.primaryColor, light: true },
    { label: "Secondary", value: theme.secondaryColor, light: true },
    { label: "Background", value: theme.background, light: false },
    { label: "Foreground", value: theme.foreground, light: true },
  ].filter((c) => c.value);

  if (colors.length === 0) return null;

  // Einfache Heuristik: helle Farben brauchen dunklen Text
  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 160;
  };

  return (
    <div className="flex gap-0.5 rounded-xl overflow-hidden h-9 mt-3">
      {colors.map((c) => (
        <div
          key={c.label}
          className="flex-1 flex items-center justify-center border-foreground/10"
          style={{
            backgroundColor: c.value,
            borderWidth: isLight(c.value!) ? "0.5px" : "0",
            borderStyle: "solid",
          }}
        >
          <span
            className="text-[11px] font-medium"
            style={{ color: isLight(c.value!) ? "#0f0f0f" : "#ffffff" }}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
