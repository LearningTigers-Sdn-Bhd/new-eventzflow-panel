export const VIBRANT_COLORS = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"
];

export function getGroupColor(colorName: string | undefined | null) {
  if (!colorName) return "bg-slate-300";
  
  // Use 600 for vibrant colors, 300 for neutral/gray colors
  const shade = VIBRANT_COLORS.includes(colorName) ? "600" : "300";
  return `bg-${colorName}-${shade}`;
}