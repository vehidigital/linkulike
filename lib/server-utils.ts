import { headers } from 'next/headers'
import type { Locale } from './i18n'

export async function getLangFromHost(): Promise<Locale> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    
    // Check if hostname starts with 'de.' for German
    if (host.startsWith('de.')) {
      return 'de'
    }
    
    // Default to English
    return 'en'
  } catch (error) {
    console.error('Error getting language from host:', error)
    return 'en'
  }
}

export function getLangFromHostname(hostname: string): Locale {
  // Check if hostname starts with 'de.' for German
  if (hostname.startsWith('de.')) {
    return 'de'
  }
  
  // Default to English
  return 'en'
} 