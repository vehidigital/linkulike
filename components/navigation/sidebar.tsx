"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, User, Palette, Link as LinkIcon, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  profile: {
    displayName: string
    avatarUrl: string
  } | null
  onLogout?: () => void
}

const navItems = [
  { id: "links", label: "Links", icon: LinkIcon },
  { id: "profile", label: "Profil", icon: User },
  { id: "theme", label: "Design", icon: Palette },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Einstellungen", icon: Settings },
]

export function Sidebar({ activeTab, onTabChange, profile, onLogout }: SidebarProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`hidden lg:flex flex-col h-screen sticky top-0 left-0 z-40 bg-white border-r border-gray-100 shadow-sm transition-all duration-200 ${collapsed ? 'w-20' : 'w-56'}`}>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          {!collapsed && <span className="text-xl font-bold text-gray-900">Linkulike</span>}
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 mt-6 px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full flex items-center gap-3 justify-start px-4 py-3 rounded-lg text-base font-medium ${activeTab === item.id ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' : 'text-gray-700'}`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          )
        })}
        {/* Sidebar Toggle Button - auf Höhe des ersten Menüpunktes, dezent */}
        <button
          className="absolute top-[72px] -right-2 bg-white border border-gray-200 rounded-full shadow-sm p-1.5 hover:bg-gray-50 transition-colors z-50"
          style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Menü ausklappen" : "Menü einklappen"}
          aria-label={collapsed ? "Menü ausklappen" : "Menü einklappen"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-gray-500" /> : <ChevronLeft className="w-4 h-4 text-gray-500" />}
        </button>
      </nav>
      {/* User Info & Logout */}
      <div className="flex flex-col items-center gap-2 p-4 border-t border-gray-100 mt-auto">
        {profile && (
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
              <AvatarFallback>{profile.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {!collapsed && <span className="font-semibold text-gray-900 truncate">{profile.displayName}</span>}
          </div>
        )}
        <Button variant="ghost" className="w-full mt-2 flex items-center gap-2 justify-start" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Abmelden</span>}
        </Button>
      </div>
    </aside>
  )
} 