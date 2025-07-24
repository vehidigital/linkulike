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
    displayNameColor?: string
    bioColor?: string
  }
}

export const themeTemplates: ThemeTemplate[] = [
  {
    id: 'create-your-own',
    name: 'Individuell',
    description: 'Gestalte dein eigenes Design',
    preview: 'bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-blue-500',
    styles: {
      backgroundColor: '#f3f4f6',
      buttonStyle: 'filled',
      buttonColor: '#2563eb',
      textColor: '#22223b',
      displayNameColor: '#22223b',
      bioColor: '#374151',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'nordlicht',
    name: 'Nordlicht',
    description: 'Kühle Blautöne, modern',
    preview: 'bg-gradient-to-br from-blue-500 to-indigo-400',
    styles: {
      backgroundColor: '#3b82f6',
      buttonStyle: 'filled',
      buttonColor: '#6366f1',
      textColor: '#f1f5f9',
      displayNameColor: '#f1f5f9',
      bioColor: '#dbeafe',
      fontFamily: 'Montserrat',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'papaya-dream',
    name: 'Papaya Dream',
    description: 'Fruchtig, warm, freundlich',
    preview: 'bg-gradient-to-br from-orange-200 to-pink-300',
    styles: {
      backgroundColor: '#fdba74',
      buttonStyle: 'filled',
      buttonColor: '#fb7185',
      textColor: '#7c2d12',
      displayNameColor: '#7c2d12',
      bioColor: '#a16207',
      fontFamily: 'Lato',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    description: 'Dunkel, kontrastreich, futuristisch',
    preview: 'bg-gradient-to-br from-gray-900 to-blue-900',
    styles: {
      backgroundColor: '#18181b',
      buttonStyle: 'filled',
      buttonColor: '#0ea5e9',
      textColor: '#f3e8ff',
      displayNameColor: '#f3e8ff',
      bioColor: '#a5b4fc',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'minty-fresh',
    name: 'Minty Fresh',
    description: 'Frisch, grün, clean',
    preview: 'bg-gradient-to-br from-green-200 to-teal-400',
    styles: {
      backgroundColor: '#6ee7b7',
      buttonStyle: 'filled',
      buttonColor: '#10b981',
      textColor: '#065f46',
      displayNameColor: '#065f46',
      bioColor: '#047857',
      fontFamily: 'Raleway',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'royal-vibes',
    name: 'Royal Vibes',
    description: 'Edel, lila-gold, luxuriös',
    preview: 'bg-gradient-to-br from-purple-700 to-yellow-300',
    styles: {
      backgroundColor: '#a78bfa',
      buttonStyle: 'filled',
      buttonColor: '#facc15',
      textColor: '#3b0764',
      displayNameColor: '#3b0764',
      bioColor: '#a21caf',
      fontFamily: 'Poppins',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'sunrise-flow',
    name: 'Sunrise Flow',
    description: 'Helle, warme Farben',
    preview: 'bg-gradient-to-br from-yellow-200 to-orange-400',
    styles: {
      backgroundColor: '#fde68a',
      buttonStyle: 'filled',
      buttonColor: '#f59e42',
      textColor: '#7c4700',
      displayNameColor: '#7c4700',
      bioColor: '#a16207',
      fontFamily: 'Montserrat',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'urban-jungle',
    name: 'Urban Jungle',
    description: 'Grün, urban, modern',
    preview: 'bg-gradient-to-br from-green-500 to-lime-300',
    styles: {
      backgroundColor: '#22c55e',
      buttonStyle: 'filled',
      buttonColor: '#166534',
      textColor: '#f0fdf4',
      displayNameColor: '#166534',
      bioColor: '#166534',
      fontFamily: 'Raleway',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'peachy-keen',
    name: 'Peachy Keen',
    description: 'Pfirsich, soft, freundlich',
    preview: 'bg-gradient-to-br from-pink-200 to-orange-100',
    styles: {
      backgroundColor: '#fcd34d',
      buttonStyle: 'filled',
      buttonColor: '#fb7185',
      textColor: '#be185d',
      displayNameColor: '#be185d',
      bioColor: '#a21caf',
      fontFamily: 'Lato',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'blueberry-night',
    name: 'Blueberry Night',
    description: 'Dunkelblau, modern, cool',
    preview: 'bg-gradient-to-br from-blue-900 to-indigo-700',
    styles: {
      backgroundColor: '#312e81',
      buttonStyle: 'filled',
      buttonColor: '#818cf8',
      textColor: '#f1f5f9',
      displayNameColor: '#f1f5f9',
      bioColor: '#a5b4fc',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'cafe-latte',
    name: 'Café Latte',
    description: 'Braun, gemütlich, warm',
    preview: 'bg-gradient-to-br from-yellow-100 to-amber-300',
    styles: {
      backgroundColor: '#fef3c7',
      buttonStyle: 'filled',
      buttonColor: '#b45309',
      textColor: '#7c4700',
      displayNameColor: '#7c4700',
      bioColor: '#a16207',
      fontFamily: 'Poppins',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'lavender-fields',
    name: 'Lavender Fields',
    description: 'Lila, soft, floral',
    preview: 'bg-gradient-to-br from-purple-200 to-pink-200',
    styles: {
      backgroundColor: '#e9d5ff',
      buttonStyle: 'filled',
      buttonColor: '#a78bfa',
      textColor: '#6d28d9',
      displayNameColor: '#6d28d9',
      bioColor: '#a21caf',
      fontFamily: 'Montserrat',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'coral-reef',
    name: 'Coral Reef',
    description: 'Koralle, lebendig, frisch',
    preview: 'bg-gradient-to-br from-pink-300 to-orange-300',
    styles: {
      backgroundColor: '#fb7185',
      buttonStyle: 'filled',
      buttonColor: '#f59e42',
      textColor: '#fff7ed',
      displayNameColor: '#be185d',
      bioColor: '#be185d',
      fontFamily: 'Lato',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'sakura-spring',
    name: 'Sakura Spring',
    description: 'Japanisch, rosa, Frühling',
    preview: 'bg-gradient-to-br from-pink-100 to-pink-400',
    styles: {
      backgroundColor: '#fbcfe8',
      buttonStyle: 'filled',
      buttonColor: '#f472b6',
      textColor: '#831843',
      displayNameColor: '#831843',
      bioColor: '#a21caf',
      fontFamily: 'Poppins',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'amber-glow',
    name: 'Amber Glow',
    description: 'Goldgelb, warm, freundlich',
    preview: 'bg-gradient-to-br from-yellow-200 to-amber-400',
    styles: {
      backgroundColor: '#fde68a',
      buttonStyle: 'filled',
      buttonColor: '#fbbf24',
      textColor: '#78350f',
      displayNameColor: '#78350f',
      bioColor: '#a16207',
      fontFamily: 'Montserrat',
      backgroundOverlayType: 'none',
    }
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Business, sachlich, grau',
    preview: 'bg-gradient-to-br from-gray-200 to-gray-500',
    styles: {
      backgroundColor: '#e5e7eb',
      buttonStyle: 'outlined',
      buttonColor: '#374151',
      textColor: '#22223b',
      displayNameColor: '#22223b',
      bioColor: '#374151',
      fontFamily: 'Inter',
      backgroundOverlayType: 'none',
    }
  },
];

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
    displayNameColor: theme.styles.displayNameColor,
    bioColor: theme.styles.bioColor,
  }
} 