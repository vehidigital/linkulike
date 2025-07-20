"use client";

import { useState } from "react";
import LinkEditor from "@/components/dashboard/LinkEditor";
import ThemeEditor, { UserProfile } from "@/components/dashboard/ThemeEditor";
import BackgroundImageEditor from "@/components/dashboard/BackgroundImageEditor";
import TextColorEditor from "@/components/dashboard/TextColorEditor";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const initialProfile: UserProfile = {
  username: "alexander_demo",
  displayName: "Alexander Reich",
  bio: "Hier ist mein Bio-Link!",
  avatarUrl: "",
  theme: "default",
  backgroundColor: "#6366f1",
  backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  buttonStyle: "gradient",
  buttonColor: "#6366f1",
  buttonGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  textColor: "#fff",
  fontFamily: "Inter",
  backgroundImageUrl: "",
  backgroundImageActive: false,
  backgroundOverlayType: "dark",
  backgroundOverlayColor: "rgba(0,0,0,0.45)",
  backgroundOverlayOpacity: 1,
  displayNameColor: "auto",
  usernameColor: "auto",
  bioColor: "auto",
  footerColor: "auto",
};

const initialLinks = [
  { id: "1", title: "Mein Blog", url: "https://meinblog.de", icon: "lucide-link", isActive: true, position: 0 },
  { id: "2", title: "Instagram", url: "https://instagram.com/alex", icon: "lucide-globe", isActive: true, position: 1 },
];

export default function DesignTestPage() {
  const [profile, setProfile] = useState<UserProfile>({ ...initialProfile });
  const [links, setLinks] = useState([...initialLinks]);
  const [pendingProfile, setPendingProfile] = useState<UserProfile>({ ...initialProfile });
  const [pendingLinks, setPendingLinks] = useState([...initialLinks]);
  const [mode, setMode] = useState<"theme" | "background">("theme");
  const [isDirty, setIsDirty] = useState(false);

  const handleProfileChange = (data: Partial<UserProfile>) => {
    setPendingProfile((prev: UserProfile) => ({ ...prev, ...data }));
    setIsDirty(true);
  };
  const handleLinksChange = (newLinks: typeof links) => {
    setPendingLinks(newLinks);
    setIsDirty(true);
  };
  const handleSave = () => {
    setProfile({ ...pendingProfile });
    setLinks([...pendingLinks]);
    setIsDirty(false);
  };
  const handleReset = () => {
    setPendingProfile({ ...profile });
    setPendingLinks([...links]);
    setIsDirty(false);
  };
  const handleModeChange = (val: string) => {
    setMode(val as "theme" | "background");
    setIsDirty(true);
    if (val === "theme") {
      setPendingProfile((prev: UserProfile) => ({ ...prev, backgroundImageActive: false }));
    }
    if (val === "background") {
      setPendingProfile((prev: UserProfile) => ({ ...prev, backgroundImageActive: true }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profil-Informationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Benutzername</label>
            <Input
              value={pendingProfile.username}
              onChange={(e) => handleProfileChange({ username: e.target.value })}
              placeholder="@benutzername"
            />
            <label className="block text-sm font-medium text-gray-700">Displayname</label>
            <Input
              value={pendingProfile.displayName}
              onChange={(e) => handleProfileChange({ displayName: e.target.value })}
              placeholder="Dein Name"
            />
            <label className="block text-sm font-medium text-gray-700">Bio-Text</label>
            <Textarea
              value={pendingProfile.bio}
              onChange={(e) => handleProfileChange({ bio: e.target.value })}
              placeholder="Beschreibe dich in einem Satz..."
              rows={2}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Links verwalten</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkEditor links={pendingLinks} onUpdate={handleLinksChange} />
          </CardContent>
        </Card>
        <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="theme">Theme/Gradient</TabsTrigger>
            <TabsTrigger value="background">Hintergrundbild</TabsTrigger>
          </TabsList>
          <TabsContent value="theme">
            <ThemeEditor
              profile={pendingProfile}
              onUpdate={() => {}}
              isProUser={true}
              setPendingProfile={handleProfileChange}
            />
          </TabsContent>
          <TabsContent value="background">
            <BackgroundImageEditor
              backgroundImageUrl={pendingProfile.backgroundImageUrl}
              backgroundImageActive={pendingProfile.backgroundImageActive}
              backgroundOverlayType={pendingProfile.backgroundOverlayType}
              backgroundOverlayColor={pendingProfile.backgroundOverlayColor}
              backgroundOverlayOpacity={pendingProfile.backgroundOverlayOpacity}
              onUpdate={handleProfileChange}
            />
          </TabsContent>
        </Tabs>
        <TextColorEditor
          displayNameColor={pendingProfile.displayNameColor}
          usernameColor={pendingProfile.usernameColor}
          bioColor={pendingProfile.bioColor}
          footerColor={pendingProfile.footerColor}
          onUpdate={handleProfileChange}
          isProUser={true}
        />
        <Card>
          <CardHeader>
            <CardTitle>Button-Design</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button-Farbe</label>
            <Input
              value={pendingProfile.buttonColor}
              onChange={(e) => handleProfileChange({ buttonColor: e.target.value })}
              type="color"
              className="w-20 h-10"
            />
          </CardContent>
        </Card>
        <div className="flex gap-4 mt-6">
          <Button onClick={handleSave} disabled={!isDirty} className="bg-blue-600 text-white">Änderungen übernehmen</Button>
          <Button onClick={handleReset} disabled={!isDirty} variant="outline">Zurücksetzen</Button>
        </div>
      </div>
      <div>
        <ProfilePreview
          displayName={pendingProfile.displayName}
          username={pendingProfile.username}
          bio={pendingProfile.bio}
          avatarUrl={pendingProfile.avatarUrl}
          links={pendingLinks}
          theme={pendingProfile.backgroundGradient || pendingProfile.backgroundColor}
          buttonStyle={pendingProfile.buttonStyle}
          buttonColor={pendingProfile.buttonColor}
          buttonGradient={pendingProfile.buttonGradient}
          currentLang={"de"}
          textColor={pendingProfile.textColor}
          themeId={pendingProfile.theme}
          fontFamily={pendingProfile.fontFamily}
          backgroundImageUrl={pendingProfile.backgroundImageUrl}
          backgroundOverlayType={pendingProfile.backgroundOverlayType}
          backgroundOverlayColor={pendingProfile.backgroundOverlayColor}
          backgroundOverlayOpacity={pendingProfile.backgroundOverlayOpacity}
          backgroundImageActive={pendingProfile.backgroundImageActive}
          displayNameColor={pendingProfile.displayNameColor}
          usernameColor={pendingProfile.usernameColor}
          bioColor={pendingProfile.bioColor}
          customFooterColor={pendingProfile.footerColor}
        />
      </div>
    </div>
  );
} 