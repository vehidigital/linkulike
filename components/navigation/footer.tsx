"use client"

import Link from "next/link"
import { getTranslations } from "@/lib/i18n"
import { useEffect, useState } from "react"

export function Footer({ lang: propLang, t: propT }: { lang?: "de" | "en", t?: any } = {}) {
  const [currentLang, setCurrentLang] = useState<"de" | "en">(propLang || "en")

  useEffect(() => {
    if (propLang) {
      setCurrentLang(propLang)
      return
    }
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.startsWith('de.')) {
        setCurrentLang('de')
      } else {
        setCurrentLang('en')
      }
    }
  }, [propLang])

  const t = propT || getTranslations(currentLang)

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">linkulike</h3>
            <p className="text-gray-600">
              {t.footerClaim}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">
              {t.footerProduct}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-gray-600 hover:text-gray-900">{t.footerFeatures}</Link></li>
              <li><Link href="/pricing" className="text-gray-600 hover:text-gray-900">{t.footerPricing}</Link></li>
              <li><Link href="/templates" className="text-gray-600 hover:text-gray-900">{t.footerTemplates}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">
              {t.footerLegal}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">{t.footerPrivacy}</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">{t.footerTerms}</Link></li>
              <li><Link href="/imprint" className="text-gray-600 hover:text-gray-900">{t.footerImprint}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">
              {t.footerSupport}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-600 hover:text-gray-900">{t.footerHelp}</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-gray-900">{t.footerFaq}</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">{t.footerContact}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>&copy; 2024 linkulike. {t.footerCopyright}</p>
        </div>
      </div>
    </footer>
  )
} 