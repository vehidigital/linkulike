import AuthHeader from "@/components/navigation/auth-header"
import { Footer } from "@/components/navigation/footer"
import { getTranslations } from "@/lib/i18n"
import { getLangFromHost } from "@/lib/server-utils"

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