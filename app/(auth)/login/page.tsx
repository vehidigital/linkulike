"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { getTranslations } from "@/lib/i18n"


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lang, setLang] = useState<"de" | "en">("en")
  const router = useRouter()

  useEffect(() => {
    // Detect language from hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.startsWith('de.')) {
        setLang('de')
      } else {
        setLang('en')
      }
    }
  }, [])

  const t = getTranslations(lang)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: t.loginErrorTitle || (lang === "de" ? "Fehler" : "Error"),
          description: t.loginError,
          variant: "destructive",
        })
      } else {
        toast({
          title: t.loginSuccessTitle || (lang === "de" ? "Erfolg" : "Success"),
          description: t.loginSuccess || (lang === "de" ? "Erfolgreich angemeldet" : "Logged in successfully"),
        })
        
        // Direkt zum Dashboard weiterleiten
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: t.loginErrorTitle || (lang === "de" ? "Fehler" : "Error"),
        description: t.loginErrorGeneric || (lang === "de" ? "Etwas ist schiefgelaufen" : "Something went wrong"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {t.loginWelcome || (lang === "de" ? "Willkommen zurück" : "Welcome back")}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {t.loginSubtitle || (lang === "de" ? "Melde dich in deinem Linkulike-Konto an" : "Sign in to your Linkulike account")}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t.email}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t.password}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t.loading : t.login}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 flex justify-between items-center text-sm">
              <Link href="/register" className="text-blue-600 hover:underline">
                {t.noAccount} {t.register}
              </Link>
              <Link href="#" className="text-gray-500 hover:underline">
                {t.forgotPassword}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 