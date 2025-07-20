"use client"

import Link from "next/link"
import { getTranslations } from "@/lib/i18n"
import { useEffect, useState } from "react"
import { LangDropdown } from "@/components/LangDropdown"

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
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Linkulike</span>
            </div>
            <p className="text-gray-500 max-w-xs">{t.footerClaim}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <h3 className="font-semibold mb-4">{t.footerProduct}</h3>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-gray-900">{t.footerFeatures}</a></li>
                <li><a href="#" className="hover:text-gray-900">{t.footerPricing}</a></li>
                <li><a href="#" className="hover:text-gray-900">{t.footerTemplates}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t.footerSupport}</h3>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-gray-900">{t.footerHelp}</a></li>
                <li><a href="#" className="hover:text-gray-900">{t.footerContact}</a></li>
                <li><a href="#" className="hover:text-gray-900">{t.footerFaq}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t.footerLegal}</h3>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-gray-900">{t.footerPrivacy}</a></li>
                <li><a href="#" className="hover:text-gray-900">{t.footerTerms}</a></li>
                <li><a href="#" className="hover:text-gray-900">{t.footerImprint}</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="mb-2">
              <LangDropdown currentLang={currentLang} pathname={typeof window !== 'undefined' ? window.location.pathname : '/'} />
            </div>
            <span className="text-xs text-gray-400">&copy; 2024 Linkulike. {t.footerCopyright}</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 