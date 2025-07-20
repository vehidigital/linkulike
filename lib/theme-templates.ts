export interface ThemeTemplate {
  id: string
  name: string
  description: string
  preview: string
  styles: {
    backgroundColor?: string
    backgroundGradient?: string
    buttonStyle: 'filled' | 'outlined' | 'gradient'
    buttonColor?: string
    buttonGradient?: string
    textColor: string
    fontFamily: string
    backgroundOverlayType: 'none' | 'dark' | 'light' | 'custom'
    backgroundOverlayColor?: string
    backgroundOverlayOpacity?: number
  }
}

export const themeTemplates: ThemeTemplate[] = [
  {
    id: 'create-your-own',
    name: 'Create your own',
    description: 'Customize everything',
    preview: 'bg-white border-2 border-blue-500',
    styles: {
      backgroundColor: '#ffffff',
      buttonStyle: 'filled',
      buttonColor: '#000000',
      textColor: '#000000',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'basics',
    name: 'Basics',
    description: 'Clean and minimal design',
    preview: 'bg-white',
    styles: {
      backgroundColor: '#ffffff',
      buttonStyle: 'filled',
      buttonColor: '#000000',
      textColor: '#000000',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'carbon',
    name: 'Carbon',
    description: 'Dark and sophisticated',
    preview: 'bg-black',
    styles: {
      backgroundColor: '#000000',
      buttonStyle: 'filled',
      buttonColor: '#ffffff',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'xmas23',
    name: 'Xmas 23',
    description: 'Festive holiday theme',
    preview: 'bg-green-800',
    styles: {
      backgroundColor: '#166534',
      buttonStyle: 'filled',
      buttonColor: '#dc2626',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'pride',
    name: 'Pride',
    description: 'Rainbow gradient theme',
    preview: 'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500',
    styles: {
      backgroundGradient: 'linear-gradient(135deg, #ff0000 0%, #ff8000 20%, #ffff00 40%, #00ff00 60%, #0080ff 80%, #8000ff 100%)',
      buttonStyle: 'filled',
      buttonColor: '#ffffff',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'glitch',
    name: 'Glitch',
    description: 'Cyberpunk inspired',
    preview: 'bg-white border-2 border-black',
    styles: {
      backgroundColor: '#ffffff',
      buttonStyle: 'outlined',
      buttonColor: '#000000',
      textColor: '#000000',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'winter',
    name: 'Winter - Live',
    description: 'Cool winter vibes',
    preview: 'bg-blue-100',
    styles: {
      backgroundColor: '#dbeafe',
      buttonStyle: 'filled',
      buttonColor: '#1e40af',
      textColor: '#1e3a8a',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'autumn',
    name: 'Autumn',
    description: 'Warm autumn colors',
    preview: 'bg-orange-50',
    styles: {
      backgroundColor: '#fff7ed',
      buttonStyle: 'filled',
      buttonColor: '#ea580c',
      textColor: '#9a3412',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'blush',
    name: 'Blush',
    description: 'Soft pink tones',
    preview: 'bg-pink-50',
    styles: {
      backgroundColor: '#fdf2f8',
      buttonStyle: 'filled',
      buttonColor: '#ec4899',
      textColor: '#be185d',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'leaf',
    name: 'Leaf',
    description: 'Natural green theme',
    preview: 'bg-green-50',
    styles: {
      backgroundColor: '#f0fdf4',
      buttonStyle: 'filled',
      buttonColor: '#16a34a',
      textColor: '#15803d',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    description: 'Magical pastel colors',
    preview: 'bg-purple-50',
    styles: {
      backgroundColor: '#faf5ff',
      buttonStyle: 'filled',
      buttonColor: '#a855f7',
      textColor: '#7c3aed',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'clear-sky',
    name: 'Clear Sky',
    description: 'Bright blue sky',
    preview: 'bg-blue-50',
    styles: {
      backgroundColor: '#eff6ff',
      buttonStyle: 'filled',
      buttonColor: '#3b82f6',
      textColor: '#1d4ed8',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra clean design',
    preview: 'bg-white border border-gray-200',
    styles: {
      backgroundColor: '#ffffff',
      buttonStyle: 'outlined',
      buttonColor: '#374151',
      textColor: '#374151',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'cloudy',
    name: 'Cloudy',
    description: 'Soft gray tones',
    preview: 'bg-gray-100',
    styles: {
      backgroundColor: '#f3f4f6',
      buttonStyle: 'filled',
      buttonColor: '#6b7280',
      textColor: '#374151',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'shadow',
    name: 'Shadow',
    description: 'Elegant with shadows',
    preview: 'bg-gray-50 shadow-lg',
    styles: {
      backgroundColor: '#f9fafb',
      buttonStyle: 'filled',
      buttonColor: '#4b5563',
      textColor: '#374151',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
]

export function getThemeTemplate(themeId: string): ThemeTemplate | undefined {
  return themeTemplates.find(theme => theme.id === themeId)
}

export function applyThemeToSettings(themeId: string) {
  const theme = getThemeTemplate(themeId)
  if (!theme) return null

  return {
    selectedTheme: theme.id,
    backgroundColor: theme.styles.backgroundColor,
    backgroundGradient: theme.styles.backgroundGradient,
    buttonStyle: theme.styles.buttonStyle,
    buttonColor: theme.styles.buttonColor,
    buttonGradient: theme.styles.buttonGradient,
    textColor: theme.styles.textColor,
    selectedFont: theme.styles.fontFamily,
    backgroundOverlayType: theme.styles.backgroundOverlayType,
    backgroundOverlayColor: theme.styles.backgroundOverlayColor,
    backgroundOverlayOpacity: theme.styles.backgroundOverlayOpacity,
  }
} 