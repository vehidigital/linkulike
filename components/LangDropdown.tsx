"use client"

import { useState, useRef, useEffect } from "react"
import { Globe, ChevronDown } from "lucide-react"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n"

export function LangDropdown({ currentLang, pathname }: { currentLang: string, pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSwitch = (lang: typeof SUPPORTED_LANGUAGES[number]) => {
    setOpen(false)
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol
      const path = pathname
      let newHost = "linkulike.local:3000"
      if (lang.subdomain) {
        newHost = `${lang.subdomain}.linkulike.local:3000`
      }
      window.location.href = `${protocol}//${newHost}${path}`
    }
  }

  const current = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0]

  return (
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
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                lang.code === currentLang 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-gray-700'
              }`}
              onClick={() => handleSwitch(lang)}
              role="option"
              aria-selected={lang.code === currentLang}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === currentLang && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 