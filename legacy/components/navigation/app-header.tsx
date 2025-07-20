"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LangDropdown } from "@/components/LangDropdown"
import { getTranslations } from "@/lib/i18n"

interface AppHeaderProps {
  currentLang: "de" | "en"
  publicUrl: string
  profile: {
    username: string
    displayName: string
    avatarUrl: string
  } | null
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function AppHeader({ currentLang, publicUrl, profile, activeTab, onTabChange }: AppHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = getTranslations(currentLang)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="relative w-full h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        {/* Button-Gruppe rechts */}
        <div className="flex-1 flex justify-end items-center gap-3 pr-8 ml-48">
          {profile && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 min-w-[120px] justify-center"
                onClick={() => window.open(publicUrl, '_blank')}
              >
                <Eye className="h-4 w-4" />
                <span className="hidden md:inline">{t.viewProfile}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 min-w-[120px] justify-center"
                onClick={() => {navigator.clipboard.writeText(publicUrl)}}
              >
                <Copy className="h-4 w-4" />
                <span className="hidden md:inline">{t.copyLink}</span>
              </Button>
              <div className="min-w-[120px] flex justify-center">
                <LangDropdown currentLang={currentLang} pathname={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 