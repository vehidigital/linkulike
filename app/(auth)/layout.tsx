import AuthHeader from "@/components/navigation/auth-header"
import { Footer } from "@/components/navigation/footer"
import { headers } from "next/headers"
import { getTranslations } from "@/lib/i18n"

async function getLangFromHost() {
  const h = await headers()
  const host = h.get("host") || ""
  if (host.startsWith("de.")) {
    return "de"
  }
  return "en"
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLangFromHost()
  const t = getTranslations(lang)
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      <AuthHeader lang={lang} />
      <main className="flex-1 flex items-center justify-center">{children}</main>
      <Footer lang={lang} t={t} />
    </div>
  )
} 