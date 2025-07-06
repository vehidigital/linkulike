"use client"
import Link from "next/link"
import { Globe, ChevronDown } from "lucide-react"
import { useState, useRef } from "react"
import { getTranslations, SUPPORTED_LANGUAGES } from "@/lib/i18n"

export default function AuthHeader({ lang }: { lang: "de" | "en" }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const t = getTranslations(lang)
  const current = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0]

  // Optional: Language Switcher
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-xl text-gray-900">linkulike</span>
        </Link>
        {/* Language Switcher (optional) */}
        <div ref={ref} className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            onClick={() => setOpen(v => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-lg">{current.flag}</span>
            <span className="text-gray-700">{current.label}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {SUPPORTED_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${l.code === lang ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
                  onClick={() => {
                    setOpen(false)
                    if (typeof window !== 'undefined') {
                      const protocol = window.location.protocol
                      let newHost = "localhost:3000"
                      if (l.subdomain) {
                        newHost = `${l.subdomain}.localhost:3000`
                      }
                      window.location.href = `${protocol}//${newHost}${window.location.pathname}`
                    }
                  }}
                  role="option"
                  aria-selected={l.code === lang}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span>{l.label}</span>
                  {l.code === lang && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
} 