"use client";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { DesignProvider } from "@/components/biolink-dashboard/DesignContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkListCard } from "@/components/biolink-dashboard/LinkListCard"
import { SocialsCard } from "@/components/biolink-dashboard/SocialsCard"
import { Analytics } from "@/components/biolink-dashboard/Analytics"
import { LivePreview } from "@/components/biolink-dashboard/LivePreview"
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const TABS = [
  { label: "Links", path: "links" },
  { label: "Posts", path: "posts" },
  { label: "Design", path: "design" },
  { label: "Analytics", path: "analytics" },
  { label: "Pro", path: "pro" },
  { label: "Subscribers", path: "subscribers" },
  { label: "Settings", path: "settings" },
];

export default function DashboardBiolinkLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const userId = params.userId as string;
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reloadLinks, setReloadLinks] = useState(0);
  const [reloadSocials, setReloadSocials] = useState(0);

  // Custom logout function
  const handleLogout = async () => {
    try {
      // Try NextAuth signOut first
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('NextAuth signOut failed, trying manual logout:', error);
      // Fallback: manual logout
      try {
        const response = await fetch('/api/auth/signout', {
          method: 'POST',
        });
        if (response.ok) {
          router.push('/');
        } else {
          // If API logout fails, just redirect to home
          router.push('/');
        }
      } catch (fallbackError) {
        console.error('Manual logout failed:', fallbackError);
        // Last resort: just redirect
        router.push('/');
      }
    }
  };

  // Load user data from API
  useEffect(() => {
    async function loadUserData() {
      try {
        const response = await fetch(`/api/user/profile?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [userId]);

  const username = userData?.username || session?.user?.username;
  const displayName = userData?.displayName || session?.user?.displayName || username;
  const avatarUrl = userData?.avatarUrl || session?.user?.avatarUrl;
  
  // Profil-Link dynamisch bestimmen
  let baseUrl = "";
  if (typeof window !== "undefined") {
    baseUrl = window.location.origin;
  } else if (process.env.NEXT_PUBLIC_BASE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  }
  const profileUrl = username ? `${baseUrl}/${username}` : "#";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DesignProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* HEADER: Logo links, Actions rechts */}
        <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm flex items-center justify-between px-4 md:px-12 h-16">
          {/* Logo links */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">linkulike</span>
          </Link>
          {/* Actions rechts */}
          <div className="flex items-center gap-4">
            <Link href="/upgrade" className="hidden md:inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
              Upgrade
            </Link>
            {username && (
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 font-semibold hover:text-purple-700 hover:underline text-sm bg-purple-50 px-3 py-1.5 rounded-lg">
                {profileUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
            {/* Share-Button */}
            <button className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-semibold shadow-sm hover:shadow-md transition-all duration-200">
              Share
            </button>
            {/* User-Avatar mit Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 focus:outline-none hover:scale-105 transition-transform duration-200">
                  <Avatar className="h-10 w-10 ring-2 ring-purple-100 shadow-md">
                    <AvatarImage src={avatarUrl} alt={displayName || "U"} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                      {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-xl">
                <DropdownMenuLabel className="font-normal text-gray-600 text-xs uppercase tracking-wide">
                  Switch accounts
                </DropdownMenuLabel>
                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <Avatar className="h-8 w-8 ring-2 ring-purple-100">
                    <AvatarImage src={avatarUrl} alt={displayName || "U"} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                      {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{displayName}</span>
                    <span className="text-xs text-gray-500">{profileUrl.replace('https://', '')}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/add-page" className="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 font-semibold">
                    <span className="text-lg">+</span>
                    Add a new page
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 bg-gray-200" />
                <DropdownMenuItem asChild>
                  <Link href={`/${userId}/dashboard-biolink/settings`} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Account settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 bg-gray-200" />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-semibold">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* BIO.LINK LAYOUT: Preview links, Content rechts */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 flex gap-8 min-h-[calc(100vh-64px)]">
          {/* Linke Spalte: Live Preview mit Smartphone-Rahmen */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                <div className="flex justify-center">
                  {/* Smartphone-Rahmen */}
                  <div className="w-72 h-[540px] bg-black rounded-[3rem] p-1 shadow-2xl relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
                    
                    {/* Lautsprecher */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-800 rounded-full z-20"></div>
                    
                    {/* Kamera */}
                    <div className="absolute top-3 right-8 w-3 h-3 bg-gray-800 rounded-full z-20"></div>
                    
                    {/* Screen mit LivePreview */}
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                      {/* LivePreview Content */}
                      <div className="h-full overflow-hidden">
                        <LivePreview 
                          key={`preview-${reloadLinks}-${reloadSocials}-${Date.now()}`}
                          reloadLinks={reloadLinks} 
                          reloadSocials={reloadSocials}
                          isCompact={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rechte Spalte: Navigation + Content */}
          <div className="flex-1">
            {/* Navigation Tabs - Horizontal */}
            <nav className="w-full bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl p-2 mb-6 shadow-sm">
              <div className="flex gap-1 overflow-x-auto">
                {TABS.map(tab => {
                  const href = `/${userId}/dashboard-biolink/${tab.path}`;
                  const active = pathname?.startsWith(href);
                  return (
                    <Link 
                      key={tab.path} 
                      href={href} 
                      className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                        active 
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md" 
                          : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{tab.label}</span>
                        {tab.label==="Subscribers" && (
                          <span className="text-xs bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
            
            {/* Content Area mit Context für Reload-Funktionen */}
            <div className="w-full">
              {React.cloneElement(children as React.ReactElement, {
                onLinkChanged: () => setReloadLinks(r => r + 1),
                onSocialChanged: () => setReloadSocials(r => r + 1)
              })}
            </div>
          </div>
        </div>
      </div>
    </DesignProvider>
  );
} 