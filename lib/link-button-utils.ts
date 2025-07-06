// Utility für konsistente Link-Button-Farben und Icons
import { getContrastColor } from "./color-utils";

export function getLinkButtonColors(link: { customColor?: string; useCustomColor?: boolean }, themeColor: string) {
  const backgroundColor = link.useCustomColor && link.customColor
    ? link.customColor
    : themeColor || '#6366f1';
  const textColor = getContrastColor(backgroundColor);
  return { backgroundColor, textColor };
}

export function getLinkIcon(link: { icon?: string }, iconOptions: { value: string; label: string }[]) {
  if (!link.icon) return '';
  const found = iconOptions.find(opt => opt.value === link.icon);
  return found ? found.label : '';
} 