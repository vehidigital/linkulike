"use client";
import { useState, useEffect } from "react";
import { useProfile } from "@/components/profile/ProfileContext";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import ThemeEditor from "@/components/dashboard/ThemeEditor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function UserDesignPage() {
  const { profile, links, isLoading, updateProfile } = useProfile();
  const [showPreview, setShowPreview] = useState(true);
  const [pendingProfile, setPendingProfile] = useState(profile);

  const previewToggle = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowPreview((v) => !v)}
      className="flex items-center gap-2"
    >
      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      <span className="hidden sm:inline">{showPreview ? "Preview ausblenden" : "Preview anzeigen"}</span>
    </Button>
  );

  // Update pendingProfile when profile changes
  useEffect(() => {
    if (profile && pendingProfile?.username !== profile?.username) {
      setPendingProfile(profile);
    }
  }, [profile, pendingProfile?.username]);

  if (isLoading || !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout
      preview={<ProfilePreview
        displayName={pendingProfile?.displayName || profile.displayName}
        username={pendingProfile?.username || profile.username}
        bio={pendingProfile?.bio || profile.bio}
        avatarUrl={pendingProfile?.avatarUrl || profile.avatarUrl}
        links={pendingProfile?.links || links}
        theme={pendingProfile?.backgroundGradient || pendingProfile?.backgroundColor || profile.backgroundGradient || profile.backgroundColor}
        buttonStyle={pendingProfile?.buttonStyle || profile.buttonStyle}
        buttonColor={pendingProfile?.buttonColor || profile.buttonColor}
        buttonGradient={pendingProfile?.buttonGradient || profile.buttonGradient}
        currentLang={pendingProfile?.lang || profile.lang || "de"}
        textColor={pendingProfile?.textColor || profile.textColor}
        themeId={pendingProfile?.theme || profile.theme}
      />}
      showPreview={showPreview}
      previewToggle={previewToggle}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Design anpassen</h1>
      </div>
      <ThemeEditor 
        profile={pendingProfile || profile} 
        onUpdate={updateProfile} 
        isProUser={false}
        setPendingProfile={(newProfile) => setPendingProfile(newProfile as any)}
        currentLang={profile.lang || "de"}
      />
    </DashboardLayout>
  );
}
