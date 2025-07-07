"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe, ChevronDown, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { getTranslations, SUPPORTED_LANGUAGES } from "@/lib/i18n"

const navItems = [
  { href: "/features", key: "features" },
  { href: "/pricing", key: "pricing" },
]

export function PublicNav() {
  const pathname = usePathname()
  const [currentLang, setCurrentLang] = useState("en")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const found = SUPPORTED_LANGUAGES.find(l => l.subdomain && hostname.startsWith(l.subdomain + '.'))
      setCurrentLang(found ? found.code : "en")
    }
  }, [pathname])

  const t = getTranslations(currentLang as "de" | "en")

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-xl text-gray-900">linkulike</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            {t.features}
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            {t.pricing}
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <LangDropdown currentLang={currentLang} pathname={pathname} />
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            {t.login}
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
              {t.register}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Open menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 z-50">
          <div className="flex flex-col p-6 space-y-4">
            <Link href="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
              {t.features}
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
              {t.pricing}
            </Link>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <LangDropdown currentLang={currentLang} pathname={pathname} />
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.login}
                </Link>
              </div>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  {t.register}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function LangDropdown({ currentLang, pathname }: { currentLang: string, pathname: string }) {
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
      let newHost = "localhost:3000"
      if (lang.subdomain) {
        newHost = `${lang.subdomain}.localhost:3000`
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