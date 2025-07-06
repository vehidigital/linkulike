import Link from "next/link"
import { getTranslations } from "@/lib/i18n"
import { headers } from "next/headers"

async function getLangFromHost() {
  const h = await headers()
  const host = h.get("host") || ""
  if (host.startsWith("de.")) {
    return "de"
  }
  return "en"
}

export default async function NotFound() {
  const lang = await getLangFromHost()
  const t = getTranslations(lang)
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {lang === "de" ? "Seite nicht gefunden" : "Page Not Found"}
        </h2>
        <p className="text-gray-600 mb-8">
          {lang === "de" ? "Die gesuchte Seite existiert nicht." : "The page you're looking for doesn't exist."}
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          {lang === "de" ? "Zur Startseite" : "Go Home"}
        </Link>
      </div>
    </div>
  )
} 