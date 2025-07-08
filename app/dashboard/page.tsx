"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, BarChart3, TrendingUp, Users, Link as LinkIcon, Eye, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import LinkEditor from "@/components/dashboard/LinkEditor"
import ProfileEditor from "@/components/dashboard/ProfileEditor"
import Analytics from "@/components/dashboard/Analytics"
import ThemeEditor from "@/components/dashboard/ThemeEditor"
import { ProfilePreview } from "@/components/profile/ProfilePreview"
import { AppHeader } from "@/components/navigation/app-header"
import { getTranslations } from "@/lib/i18n"
import { Sidebar } from "@/components/navigation/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LangDropdown } from "@/components/LangDropdown"

interface Link {
  id: string
  title: string
  url: string
  icon: string
  isActive: boolean
  position: number
  customColor?: string
  useCustomColor?: boolean
}

interface UserProfile {
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  theme: string
  backgroundColor: string
  backgroundGradient: string
  buttonStyle: string
  buttonColor: string
  buttonGradient: string
  textColor: string
  fontFamily: string
  isPremium?: boolean
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [links, setLinks] = useState<Link[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("links")
  const [editProfile, setEditProfile] = useState<{ displayName: string; bio: string; avatarUrl: string } | null>(null);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<"de" | "en">("en")

  useEffect(() => {
    console.log('Dashboard useEffect - status:', status, 'session:', !!session)
    
    if (status === "loading") {
      console.log('Dashboard: Still loading session...')
      return
    }
    
    // Warte länger bevor wir zur Login-Seite weiterleiten
    if (status === "unauthenticated") {
      console.log('Dashboard: Session unauthenticated, waiting 2 seconds before redirect...')
      const timer = setTimeout(() => {
        console.log('Dashboard: Redirecting to login after timeout')
        router.push("/login")
      }, 2000)
      
      return () => clearTimeout(timer)
    }
    
    // Nur fetchData aufrufen wenn Session definitiv da ist
    if (status === "authenticated" && session) {
      console.log('Dashboard: Fetching data - authenticated')
      fetchData()
    }
  }, [session, status])

  useEffect(() => {
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

  useEffect(() => {
    if (profile) {
      setPendingProfile(profile);
      setEditProfile({
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      });
    }
  }, [profile]);

  const fetchData = async () => {
    console.log('Dashboard: Starting fetchData')
    try {
      const [linksRes, profileRes] = await Promise.all([
        fetch("/api/links"),
        fetch("/api/user/profile")
      ])
      
      if (linksRes.ok) {
        const linksData = await linksRes.json()
        setLinks(linksData)
      } else {
        console.log('Links API failed:', linksRes.status)
        setLinks([])
      }
      
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      } else {
        console.log('Profile API failed:', profileRes.status)
        setProfile(null)
      }
    } catch (error) {
      console.error('Fetch data error:', error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLink = async () => {
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Link",
          url: "https://",
          icon: "globe",
          position: links.length,
          customColor: "#f3f4f6",
          useCustomColor: true
        })
      })

      if (response.ok) {
        await fetchData()
        toast({
          title: "Success",
          description: "Link added successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchData()
        toast({
          title: "Success",
          description: "Link deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      })
    }
  }

  const handleUpdateLinks = async (updatedLinks: Link[]) => {
    try {
      const response = await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLinks)
      })

      if (response.ok) {
        await fetchData()
        toast({
          title: "Success",
          description: "Links updated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update links",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
  }

  const handleThemeUpdate = async (updatedProfile: UserProfile) => {
    setPendingProfile(updatedProfile);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
      if (response.ok) {
        await fetchData();
        toast({ title: "Theme gespeichert", description: "Deine Theme-Einstellungen wurden übernommen." });
      } else {
        toast({ title: "Fehler", description: "Theme konnte nicht gespeichert werden", variant: "destructive" });
      }
    } catch {
      toast({ title: "Fehler", description: "Theme konnte nicht gespeichert werden", variant: "destructive" });
    }
  }

  // Zeige Loading während Session noch lädt
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{t.loading || "Lädt..."}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Zeige Dashboard auch ohne Profil - User kann es später erstellen
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.dashboardTitle}</h1>
            <p className="text-gray-600 mb-8">{t.dashboardSubtitle}</p>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
                          <p className="text-sm text-gray-500">{t.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  // Profillink immer ohne Sprach-Subdomain generieren
  const publicUrl = `http://linkulike.local:3000/${profile.username}`

  // Calculate stats
  const totalClicks = links.reduce((total, link) => total + (link as any).clicks?.length || 0, 0)
  const activeLinks = links.filter(link => link.isActive).length

  // Logout-Handler für Sidebar
  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      const { signOut } = await import("next-auth/react")
      await signOut({ redirect: false })
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile ? { displayName: profile.displayName, avatarUrl: profile.avatarUrl } : null}
        onLogout={handleLogout}
      />
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar nur für Sprache/User und Profil-Link-Buttons */}
        <div className="sticky top-0 z-30 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex items-center justify-end h-16 px-6">
          <div className="flex items-center gap-4">
            <LangDropdown currentLang={lang} pathname={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'} />
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
                  <span className="hidden md:inline">{t.viewProfile || "Profil anzeigen"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {navigator.clipboard.writeText(publicUrl)}}
                  className="flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden md:inline">{t.copyLink || "Link kopieren"}</span>
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
                <AvatarFallback>{profile.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            {/* Tab-abhängige große Überschrift */}
            {activeTab === "links" && (
              <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.yourLinks || "Links verwalten"}</h1>
            )}
            {activeTab === "profile" && (
              <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.profileSettings || "Profil-Einstellungen"}</h1>
            )}
            {activeTab === "theme" && (
              <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.themeAppearance || "Design & Aussehen"}</h1>
            )}
            {activeTab === "analytics" && (
              <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.analytics || "Analytics"}</h1>
            )}
            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {activeTab === "links" && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{t.yourLinks}</h2>
                      <p className="text-gray-600 mt-1">{t.dashboardSubtitle}</p>
                    </div>
                    <Button onClick={handleAddLink} className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                                              <span>{t.addLink}</span>
                    </Button>
                  </div>
                  <LinkEditor
                    links={links}
                    onUpdate={handleUpdateLinks}
                    onDelete={handleDeleteLink}
                    currentLang={lang}
                    t={t}
                  />
                </div>
              )}
              {activeTab === "profile" && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">{t.profileSettings}</h2>
                    <p className="text-gray-600 mt-1">{t.profileSettingsSubtitle}</p>
                  </div>
                  <ProfileEditor
                    profile={profile}
                    onUpdate={handleProfileUpdate}
                    editProfile={editProfile}
                    setEditProfile={setEditProfile}
                    fetchProfile={fetchData}
                    isProUser={profile.isPremium || false}
                    t={t}
                    currentLang={lang}
                  />
                </div>
              )}
              {activeTab === "theme" && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">{t.themeAppearance}</h2>
                    <p className="text-gray-600 mt-1">{t.themeAppearanceSubtitle}</p>
                  </div>
                  <ThemeEditor
                    profile={pendingProfile || profile}
                    onUpdate={async (updatedProfile) => {
                      setPendingProfile(updatedProfile);
                      await handleThemeUpdate(updatedProfile);
                    }}
                    isProUser={Boolean(profile.isPremium)}
                    setPendingProfile={setPendingProfile}
                    t={t}
                    currentLang={lang}
                  />
                </div>
              )}
              {activeTab === "analytics" && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">{t.analytics}</h2>
                    <p className="text-gray-600 mt-1">{t.analyticsSubtitle}</p>
                  </div>
                  <Analytics links={links} t={t} currentLang={lang} />
                </div>
              )}
            </div>
          </div>
          {/* Profile Preview - Sticky Right Sidebar */}
          <div className="hidden lg:block lg:w-80">
            <div className="sticky top-24">
              {/* Kleines Live Preview Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{t.livePreviewBadge || "Live Preview"}</span>
              </div>
              <div className="flex justify-center">
                <ProfilePreview
                  displayName={activeTab === 'profile' && editProfile ? editProfile.displayName : (activeTab === 'theme' && pendingProfile ? pendingProfile.displayName : profile.displayName)}
                  username={profile.username}
                  bio={activeTab === 'profile' && editProfile ? editProfile.bio : (activeTab === 'theme' && pendingProfile ? pendingProfile.bio : profile.bio)}
                  avatarUrl={activeTab === 'profile' && editProfile ? editProfile.avatarUrl : (activeTab === 'theme' && pendingProfile ? pendingProfile.avatarUrl : profile.avatarUrl)}
                  links={links}
                  theme={activeTab === 'theme' && pendingProfile ? (pendingProfile.buttonStyle === "gradient" ? pendingProfile.backgroundGradient : pendingProfile.backgroundColor) : (profile.buttonStyle === "gradient" ? profile.backgroundGradient : profile.backgroundColor)}
                  buttonStyle={activeTab === 'theme' && pendingProfile ? pendingProfile.buttonStyle : profile.buttonStyle}
                  buttonColor={activeTab === 'theme' && pendingProfile ? pendingProfile.buttonColor : profile.buttonColor}
                  buttonGradient={activeTab === 'theme' && pendingProfile ? pendingProfile.buttonGradient : profile.buttonGradient}
                  currentLang={lang}
                  textColor={activeTab === 'theme' && pendingProfile ? pendingProfile.textColor : profile.textColor}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 