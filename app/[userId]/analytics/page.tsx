"use client";
import { useState } from "react";
import { useProfile } from "@/components/profile/ProfileContext";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import Analytics from "@/components/dashboard/Analytics";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function UserAnalyticsPage() {
  const { profile, links, isLoading } = useProfile();
  const [showPreview, setShowPreview] = useState(true);

  if (isLoading || !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout
      preview={<ProfilePreview
        displayName={profile.displayName}
        username={profile.username}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
        links={links}
        theme={profile.backgroundGradient || profile.backgroundColor}
        buttonStyle={profile.buttonStyle}
        buttonColor={profile.buttonColor}
        buttonGradient={profile.buttonGradient}
        currentLang={profile.lang || "de"}
        textColor={profile.textColor}
      />}
      showPreview={showPreview}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Analytics</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-2"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="hidden sm:inline">{showPreview ? "Preview ausblenden" : "Preview anzeigen"}</span>
        </Button>
      </div>
      <Analytics links={links} />
    </DashboardLayout>
  );
}
