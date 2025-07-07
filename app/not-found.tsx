import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTranslations } from "@/lib/i18n"
import { getLangFromHost } from "@/lib/server-utils"
import { LangDropdown } from "@/components/LangDropdown"

export default async function NotFound() {
  const lang = await getLangFromHost()
  const t = getTranslations(lang)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LangDropdown currentLang={lang} pathname="/404" />
      </div>
      
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t.pageNotFound || "Page not found"}
          </h2>
          <p className="text-gray-600 mb-8">
            {t.pageNotFoundDesc || "Sorry, we couldn't find the page you're looking for."}
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              {t.backToHome || "Back to Home"}
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">
              {t.login}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 