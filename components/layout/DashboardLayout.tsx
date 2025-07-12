import React, { useState, ReactNode } from "react";
import Sidebar from "../navigation/sidebar";
import { AppHeader } from "../navigation/app-header";
import { useProfile } from "../profile/ProfileContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  preview?: React.ReactNode;
  showPreview?: boolean;
  previewToggle?: ReactNode;
}

export function DashboardLayout({ children, preview, showPreview = true, previewToggle }: DashboardLayoutProps) {
  const { profile } = useProfile();
  const currentLang = profile?.lang || "de";
  const publicUrl = profile?.username ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://linkulike.local:3000"}/${profile.username}` : "";
  const profileProps = profile
    ? {
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatarUrl: profile.avatarUrl || "",
      }
    : null;

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar: fixed, immer sichtbar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-30">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
      {/* Main Content Area als Grid */}
      <div className={`flex flex-col min-h-screen transition-all duration-200`}>
        <header className="sticky top-0 z-20 bg-gray-50 border-b">
          <AppHeader currentLang={currentLang} publicUrl={publicUrl} profile={profileProps} />
        </header>
        {/* Grid-Layout für Content & Preview */}
        <main className="flex-1 w-full flex flex-col items-center lg:pl-64">
          <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-8 md:gap-10 xl:gap-12 px-2 sm:px-4 xl:px-12 py-6 md:py-10" style={{ minHeight: 'calc(100vh - 64px)' }}>
            {/* Content */}
            <section className="w-full max-w-2xl xl:max-w-3xl mx-auto">
              <div className="space-y-8">{children}</div>
            </section>
            {/* Preview Panel (rechts, sticky) */}
            <aside className="hidden xl:flex flex-col items-center xl:sticky xl:top-32">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-[420px] border border-gray-100">
                <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-100">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Live Preview</span>
                  {previewToggle}
                </div>
                {showPreview && preview && (
                  <div className="p-6">{preview}</div>
                )}
              </div>
            </aside>
            {/* Preview unter Content auf kleineren Screens */}
            <aside className="xl:hidden w-full mt-6 sm:mt-8 flex flex-col items-center">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-100">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Live Preview</span>
                  {previewToggle}
                </div>
                {showPreview && preview && (
                  <div className="p-4 sm:p-6">{preview}</div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
} 