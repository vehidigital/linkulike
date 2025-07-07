"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { getTranslations } from "@/lib/i18n"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lang, setLang] = useState<"de" | "en">("en")
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.startsWith('de.')) {
        setLang('de')
      } else {
        setLang('en')
      }
      // Demo-Daten automatisch eintragen
      const random = Math.random().toString(36).substring(2, 8)
      setFormData({
        email: `Alexander.reich2102+${random}@gmail.com`,
        username: `alexander_demo_${random}`,
        password: '12345678',
        confirmPassword: '12345678',
      })
    }
  }, [])

  const t = getTranslations(lang)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log('Formulardaten:', formData)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: lang === "de" ? "Fehler" : "Error",
        description: lang === "de" ? "Passwörter stimmen nicht überein" : "Passwords do not match",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: lang === "de" ? "Fehler" : "Error",
        description: lang === "de" ? "Passwort muss mindestens 6 Zeichen lang sein" : "Password must be at least 6 characters long",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        }),
      })

      console.log('API-Response:', response)

      if (response.ok) {
        // Nach erfolgreicher Registrierung automatisch einloggen
        const signInResult = await signIn("credentials", {
          email: formData.email.toLowerCase(),
          password: formData.password,
          redirect: false,
        })
        // Debug: Session nach Login abfragen
        let sessionJson = null
        try {
          const sessionRes = await fetch("/api/auth/session")
          sessionJson = await sessionRes.json()
        } catch (e) {
          sessionJson = { error: String(e) }
        }
        // Debug: Cookies im Browser loggen
        let cookies = ''
        if (typeof window !== 'undefined') {
          cookies = document.cookie
        }
        if (
          signInResult &&
          !signInResult.error &&
          sessionJson &&
          sessionJson.user &&
          sessionJson.user.id
        ) {
          toast({
            title: lang === "de" ? "Erfolg" : "Success",
            description: lang === "de" ? "Konto erfolgreich erstellt! Du wirst zum Dashboard weitergeleitet." : "Account created successfully! You will be redirected to dashboard.",
          })
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 1000)
        } else {
          setDebugInfo({ signInResult, sessionJson, cookies })
          toast({
            title: lang === "de" ? "Fehler" : "Error",
            description: (lang === "de" ? "Automatisches Login fehlgeschlagen oder keine Session. Debug-Infos unten." : "Automatic login failed or no session. See debug info below."),
            variant: "destructive",
          })
        }
      } else {
        const error = await response.json()
        console.log('API-Error:', error)
        toast({
          title: lang === "de" ? "Fehler" : "Error",
          description: error.error || (lang === "de" ? "Konto konnte nicht erstellt werden" : "Failed to create account"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log('Catch-Error:', error)
      toast({
        title: lang === "de" ? "Fehler" : "Error",
        description: lang === "de" ? "Etwas ist schiefgelaufen" : "Something went wrong",
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
              {t.registerTitle || (lang === "de" ? "Erstelle dein Konto" : "Create your account")}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {t.registerSubtitle || (lang === "de" ? "Schließe dich tausenden von Creatorn auf Linkulike an" : "Join thousands of creators on Linkulike")}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.username}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={t.username}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.password}
                    onChange={handleChange}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.confirmPassword || (lang === "de" ? "Passwort bestätigen" : "Confirm password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t.confirmPassword || (lang === "de" ? "Passwort bestätigen" : "Confirm password")}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t.loading : t.register}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
            {/* Debug-Infos anzeigen, falls vorhanden */}
            {debugInfo && (
              <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-800">
                <div className="font-bold mb-2">Debug-Informationen (nur sichtbar bei Login-Fehler):</div>
                <div><b>signInResult:</b> <pre>{JSON.stringify(debugInfo.signInResult, null, 2)}</pre></div>
                <div><b>Session nach Login:</b> <pre>{JSON.stringify(debugInfo.sessionJson, null, 2)}</pre></div>
                <div><b>Cookies:</b> <pre>{debugInfo.cookies}</pre></div>
              </div>
            )}
            <div className="mt-6 flex justify-between items-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">
                {t.alreadyRegistered} {t.login}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}