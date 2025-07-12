"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import LinkEditor from "@/components/dashboard/LinkEditor";
import { useProfile } from "@/components/profile/ProfileContext";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function UserLinksPage() {
  const { profile, links, isLoading, updateLinks, fetchProfile } = useProfile();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [showPreview, setShowPreview] = useState(true);
  const [previewLinks, setPreviewLinks] = useState(links);

  useEffect(() => {
    setPreviewLinks(links); // keep previewLinks in sync with real links
  }, [links]);

  useEffect(() => {
    if (!isLoading) {
      if (!profile) {
        router.push("/login");
        return;
      }
      if (profile.id && userId && profile.id !== userId) {
        router.push("/login");
        return;
      }
    }
  }, [isLoading, profile, userId, router]);

  if (isLoading || !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

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

  return (
    <DashboardLayout
      preview={<ProfilePreview
        displayName={profile.displayName}
        username={profile.username}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
        links={previewLinks}
        theme={profile.backgroundGradient || profile.backgroundColor}
        buttonStyle={profile.buttonStyle}
        buttonColor={profile.buttonColor}
        buttonGradient={profile.buttonGradient}
        currentLang={profile.lang || "de"}
        textColor={profile.textColor}
      />}
      showPreview={showPreview}
      previewToggle={previewToggle}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Links verwalten</h1>
        <p className="mt-2 text-gray-600">Erstelle und verwalte deine Links</p>
      </div>
      <LinkEditor 
        links={links} 
        onUpdate={updateLinks} 
        onPreviewChange={setPreviewLinks}
        onDelete={async (linkId) => {
          try {
            const response = await fetch(`/api/links/${linkId}`, {
              method: "DELETE",
            });
            if (response.ok) {
              const newLinks = links.filter(link => link.id !== linkId);
              updateLinks(newLinks);
              // Wichtig: Nach dem Delete das Profil neu laden, um Persistenz zu gewährleisten
              await fetchProfile();
            }
          } catch (error) {
            console.error('Delete error:', error);
          }
        }} 
      />
    </DashboardLayout>
  );
}
