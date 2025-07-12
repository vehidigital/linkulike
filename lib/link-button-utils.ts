// Utility für konsistente Link-Button-Farben und Icons
import { getContrastColor } from "./color-utils";
import { getColorForUrl } from "./social-icons";

export function getLinkButtonColors(link: { customColor?: string; useCustomColor?: boolean; url?: string }) {
  let backgroundColor;
  if (link.useCustomColor && link.customColor) {
    backgroundColor = link.customColor;
  } else if (link.url) {
    const brand = getColorForUrl(link.url);
    if (brand && brand !== '#000000') {
      backgroundColor = brand;
    } else {
      backgroundColor = '#f3f4f6'; // Neutral fallback
    }
  } else {
    backgroundColor = '#f3f4f6';
  }
  const textColor = getContrastColor(backgroundColor);
  return { backgroundColor, textColor };
}

export function getLinkIcon(link: { icon?: string }, iconOptions: { value: string; label: string }[]) {
  if (!link.icon) return '';
  const found = iconOptions.find(opt => opt.value === link.icon);
  return found ? found.label : '';
} 