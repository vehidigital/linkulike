// Color and contrast utility functions

export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "")
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? "#000000" : "#FFFFFF"
}

export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string) => {
    const hexClean = hex.replace("#", "")
    const r = parseInt(hexClean.substr(0, 2), 16) / 255
    const g = parseInt(hexClean.substr(2, 2), 16) / 255
    const b = parseInt(hexClean.substr(4, 2), 16) / 255
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      if (c <= 0.03928) return c / 12.92
      return Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

export function hasLowContrast(backgroundColor: string, textColor?: string): boolean {
  const contrastColor = textColor || getContrastColor(backgroundColor)
  const contrastRatio = getContrastRatio(backgroundColor, contrastColor)
  return contrastRatio < 3.0 // WCAG AA standard for large text
}

export function getDefaultGradient(): string {
  return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}

export function getModernGradient(): string {
  return "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
}

export function getAccentGradient(): string {
  return "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
}

// Modern, contrast-rich colors for non-social links
export const MODERN_COLORS = [
  "#667eea", // Blue
  "#764ba2", // Purple
  "#f093fb", // Pink
  "#f5576c", // Red
  "#4facfe", // Light Blue
  "#00f2fe", // Cyan
  "#43e97b", // Green
  "#38f9d7", // Teal
  "#fa709a", // Rose
  "#fee140", // Yellow
  "#a8edea", // Mint
  "#fed6e3", // Light Pink
  "#ffecd2", // Peach
  "#fcb69f", // Coral
  "#ff9a9e", // Salmon
  "#fecfef", // Lavender
  "#fecfef", // Light Purple
  "#a8caba", // Sage
  "#d299c2", // Mauve
  "#fef9d7", // Cream
]

export function getRandomModernColor(): string {
  return MODERN_COLORS[Math.floor(Math.random() * MODERN_COLORS.length)]
}

/**
 * Extrahiert die erste Farbe aus einem CSS-Gradient-String (z.B. linear-gradient(...)).
 * Gibt eine Hex- oder RGB-Farbe zurück, oder einen Fallback (#ffffff) bei Fehlern.
 */
export function extractFirstColorFromGradient(bg: string): string {
  if (!bg) return '#ffffff';
  // Nur Hex oder rgb/rgba
  if (bg.startsWith('#') || bg.startsWith('rgb')) return bg;
  // Gradient: linear-gradient(..., #hex ...)
  const match = bg.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})|rgb\([^)]*\)/);
  if (match) return match[0];
  return '#ffffff';
} 