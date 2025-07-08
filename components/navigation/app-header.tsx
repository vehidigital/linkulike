"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  BarChart3, 
  Settings, 
  User, 
  Palette, 
  Link as LinkIcon,
  Menu,
  X,
  LogOut,
  Eye,
  Copy,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
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
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppHeader({ currentLang, publicUrl, profile, activeTab, onTabChange }: AppHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = getTranslations(currentLang)

  const navigation = [
    { id: "links", label: t.links || "Links", icon: LinkIcon },
    { id: "profile", label: t.profile || "Profile", icon: User },
    { id: "theme", label: t.design || "Design", icon: Palette },
    { id: "analytics", label: t.analytics || "Analytics", icon: BarChart3 },
  ]

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  const copyProfileUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    // You could add a toast notification here
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Linkulike</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center space-x-3">
            {/* Language Dropdown */}
            <LangDropdown 
              currentLang={currentLang} 
              pathname={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'} 
            />

            {/* Profil-Link Aktionen immer sichtbar */}
            {profile && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(publicUrl, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden md:inline">{t.viewProfile}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {navigator.clipboard.writeText(publicUrl)}}
                  className="flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden md:inline">{t.copyLink}</span>
                </Button>
              </div>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName} />
                    <AvatarFallback>
                      {(profile?.displayName || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.displayName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onTabChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className="justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
              {profile && (
                <>
                  <div className="border-t pt-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(publicUrl, '_blank')}
                      className="w-full justify-start"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      <span>{t.viewProfile}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyProfileUrl}
                      className="w-full justify-start mt-2"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      <span>{t.copyLink}</span>
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 