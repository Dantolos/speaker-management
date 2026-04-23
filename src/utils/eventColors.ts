// 9 Farbrampen, konsistent mit Design-System
export const EVENT_COLORS = [
  { fg: "#534AB7", bg: "#EEEDFE", dot: "#7F77DD" }, // purple
  { fg: "#0F6E56", bg: "#E1F5EE", dot: "#1D9E75" }, // teal
  { fg: "#993C1D", bg: "#FAECE7", dot: "#D85A30" }, // coral
  { fg: "#993556", bg: "#FBEAF0", dot: "#D4537E" }, // pink
  { fg: "#185FA5", bg: "#E6F1FB", dot: "#378ADD" }, // blue
  { fg: "#3B6D11", bg: "#EAF3DE", dot: "#639922" }, // green
  { fg: "#854F0B", bg: "#FAEEDA", dot: "#BA7517" }, // amber
  { fg: "#A32D2D", bg: "#FCEBEB", dot: "#E24B4A" }, // red
  { fg: "#5F5E5A", bg: "#F1EFE8", dot: "#888780" }, // gray
] as const;

export function colorFor(index: number) {
  return EVENT_COLORS[index % EVENT_COLORS.length];
}
