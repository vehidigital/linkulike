export type Locale = 'en' | 'de'

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    flag: '🇺🇸',
    subdomain: null
  },
  {
    code: 'de',
    label: 'Deutsch',
    flag: '🇩🇪',
    subdomain: 'de'
  }
] as const

// Import translations dynamically to avoid TypeScript issues
const getTranslationsData = () => {
  try {
    const en = require('./locales/en.json')
    const de = require('./locales/de.json')
    return { en, de }
  } catch (error) {
    console.error('Failed to load translations:', error)
    return { en: {}, de: {} }
  }
}

const translations = getTranslationsData()

export function getTranslations(locale: Locale = 'en') {
  return translations[locale] || translations.en
}

export function getAvailableLocales(): Locale[] {
  return Object.keys(translations) as Locale[]
}

export function isValidLocale(locale: string): locale is Locale {
  return locale in translations
}

// Export default for compatibility
export default { getTranslations, getAvailableLocales, isValidLocale } 