"use client";
import { useState, useEffect } from "react";
import { useProfile } from "@/components/profile/ProfileContext";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import ProfileEditor from "@/components/dashboard/ProfileEditor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function UserProfilePage() {
  const { profile, links, isLoading, updateProfile } = useProfile();
  const [showPreview, setShowPreview] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [liveEditData, setLiveEditData] = useState(profile);

  // Initialize liveEditData when profile changes
  useEffect(() => {
    setLiveEditData(profile);
  }, [profile]);

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

  if (isLoading || !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Always use liveEditData for preview if available, otherwise fallback to profile
  const previewData = liveEditData || profile;

  return (
    <DashboardLayout
      preview={<ProfilePreview
        displayName={previewData?.displayName || profile.displayName}
        username={previewData?.username || profile.username}
        bio={previewData?.bio || profile.bio}
        avatarUrl={previewData?.avatarUrl || profile.avatarUrl}
        avatarBorderColor={previewData?.avatarBorderColor !== undefined ? previewData.avatarBorderColor : profile.avatarBorderColor}
        links={links}
        theme={previewData?.backgroundGradient || previewData?.backgroundColor || profile.backgroundGradient || profile.backgroundColor}
        buttonStyle={previewData?.buttonStyle || profile.buttonStyle}
        buttonColor={previewData?.buttonColor || profile.buttonColor}
        buttonGradient={previewData?.buttonGradient || profile.buttonGradient}
        currentLang={previewData?.lang || profile.lang || "de"}
        textColor={previewData?.textColor || profile.textColor}
      />}
      showPreview={showPreview}
      previewToggle={previewToggle}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Profil bearbeiten</h1>
      </div>
      <ProfileEditor 
        profile={profile} 
        onUpdate={updateProfile} 
        fetchProfile={() => {}}
        isProUser={false}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        onEditDataChange={setLiveEditData}
      />
    </DashboardLayout>
  );
}
