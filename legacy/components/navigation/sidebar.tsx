"use client"

import { Home, Link2, User, Palette, BarChart3, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const userId = params.userId as string;

  const navItems = [
    { href: `/${userId}/dashboard`, icon: Home, label: "Dashboard" },
    { href: `/${userId}/links`, icon: Link2, label: "Links" },
    { href: `/${userId}/profile`, icon: User, label: "Profil" },
    { href: `/${userId}/design`, icon: Palette, label: "Design" },
    { href: `/${userId}/design-test`, icon: Palette, label: "Design-Test" },
    { href: `/${userId}/analytics`, icon: BarChart3, label: "Analytics" },
    { href: `/${userId}/settings`, icon: Settings, label: "Einstellungen" },
  ];

  return (
    <nav className={`flex flex-col h-full bg-white border-r border-gray-100 py-4 px-2 select-none sticky top-0 z-30 transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'}`}>
      {/* Branding (Logo + Schriftzug als ein Link) */}
      <div className={`flex flex-col items-center ${collapsed ? 'gap-2' : 'gap-3'} mb-6`}>
        <Link href={`/${userId}/dashboard`} className={`flex items-center justify-center group rounded-lg transition-colors ${collapsed ? 'w-10 h-10' : 'w-full px-2 py-1.5'} hover:bg-gray-100`}>
          <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center ${collapsed ? 'w-8 h-8' : 'w-9 h-9'} transition-all`}>
            <span className={`text-white font-bold ${collapsed ? 'text-base' : 'text-lg'} transition-all`}>L</span>
          </div>
          {!collapsed && <span className="font-bold text-xl text-gray-900 ml-3 transition-all">linkulike</span>}
        </Link>
      </div>
      {/* Collapse-Button auf der Trennlinie, immer mittig */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-[-16px] top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow transition-colors w-8 h-8 hover:bg-gray-100 focus:outline-none z-40"
        aria-label={collapsed ? "Menü ausklappen" : "Menü einklappen"}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
      >
        {collapsed ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />}
      </button>
      {/* Navigation Items */}
      <div className={`flex flex-col gap-1 flex-1 ${collapsed ? 'items-center' : ''}`}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link key={href} href={href} className={`group relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-0 py-1.5 rounded-lg transition-colors font-medium text-base w-full`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-400 group-hover:bg-gray-100 group-hover:text-blue-600'}`}>
                <Icon className="w-5 h-5" />
              </div>
              {!collapsed && <span className={`ml-2 text-gray-700 ${active ? 'font-semibold text-blue-700' : ''}`}>{label}</span>}
              {/* Tooltip im collapsed state */}
              {collapsed && (
                <span className="absolute left-14 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      {/* Avatar/Account-Button ganz unten */}
      <div className={`mt-auto flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} mb-2`}>
        <Avatar>
          <AvatarImage src={"/avatar-placeholder.png"} alt="Account" />
          <AvatarFallback>N</AvatarFallback>
        </Avatar>
        {!collapsed && <span className="text-gray-700 font-medium">Account</span>}
      </div>
    </nav>
  );
} 