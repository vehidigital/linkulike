"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Settings, Eye, BarChart3, Palette, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import LinkEditor from "@/components/dashboard/LinkEditor"
import ProfileEditor from "@/components/dashboard/ProfileEditor"
import Analytics from "@/components/dashboard/Analytics"
import ThemeEditor from "@/components/dashboard/ThemeEditor"
import { ProfilePreview } from "@/components/profile/ProfilePreview"
import { LangDropdown } from "@/components/LangDropdown"
import { getTranslations } from "@/lib/i18n"

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
        // Bei 401 nicht zur Login-Seite weiterleiten, nur leeres Array setzen
        setLinks([])
      }
      
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      } else {
        console.log('Profile API failed:', profileRes.status)
        // Bei 401 nicht zur Login-Seite weiterleiten, nur null setzen
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
          <p className="text-lg text-gray-600">Loading your session...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to your Dashboard!</h1>
            <p className="text-gray-600 mb-8">Your profile is being loaded. You can start creating your bio links.</p>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Debug-Logging für Props
  console.log('Dashboard profile:', profile)
  console.log('Dashboard editProfile:', editProfile)
  console.log('Dashboard avatarUrl für Preview:', activeTab === 'profile' && editProfile ? editProfile?.avatarUrl : profile.avatarUrl)

  const publicUrl = `http://linkulike.local:3000/${profile.username}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Dashboard Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{t.dashboardTitle || "Dashboard"}</h1>
                  <p className="text-gray-600 mt-2">
                    {t.dashboardSubtitle || "Manage your bio links and customize your profile"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <LangDropdown currentLang={lang} pathname={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'} />
                  <Button
                    variant="outline"
                    onClick={() => window.open(publicUrl, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t.viewProfile || "View Profile"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(publicUrl)}
                  >
                    {t.copyLink || "Copy Link"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t.statsTotalClicks || "Total Clicks"}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {links.reduce((total, link) => total + (link as any).clicks?.length || 0, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Plus className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t.statsActiveLinks || "Active Links"}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {links.filter(link => link.isActive).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t.statsProfileViews || "Profile Views"}</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Palette className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t.statsTheme || "Theme"}</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">
                        {profile.theme}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="links">{t.links}</TabsTrigger>
                <TabsTrigger value="profile">{t.profile}</TabsTrigger>
                <TabsTrigger value="theme">{t.design}</TabsTrigger>
                <TabsTrigger value="analytics">{t.analytics || "Analytics"}</TabsTrigger>
              </TabsList>

              <TabsContent value="links" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{t.yourLinks || "Your Links"}</CardTitle>
                      <Button onClick={handleAddLink}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t.addLink}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <LinkEditor
                      links={links}
                      onUpdate={handleUpdateLinks}
                      onDelete={handleDeleteLink}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.profileSettings || "Profile Settings"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfileEditor
                      profile={profile}
                      onUpdate={handleProfileUpdate}
                      editProfile={editProfile}
                      setEditProfile={setEditProfile}
                      fetchProfile={fetchData}
                      isProUser={profile.isPremium || false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="theme" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.themeAppearance || "Theme & Appearance"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ThemeEditor
                      profile={pendingProfile || profile}
                      onUpdate={async (updatedProfile) => {
                        setPendingProfile(updatedProfile);
                        await handleThemeUpdate(updatedProfile);
                      }}
                      isProUser={Boolean(profile.isPremium)}
                      setPendingProfile={setPendingProfile}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.analytics || "Analytics"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Analytics links={links} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          {/* Smartphone Bio Preview */}
          <div className="hidden lg:block min-w-[320px] max-w-[340px]">
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
  )
} 