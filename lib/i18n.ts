import de from "./locales/de.json"
import en from "./locales/en.json"

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', subdomain: '', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', subdomain: 'de', flag: '🇩🇪' },
  // beliebig erweiterbar
]

const translations = { de, en }

export function getTranslations(lang: "de" | "en") {
  return translations[lang]
}

export async function getTranslationsAsync(lang: "de" | "en") {
  return translations[lang]
} 