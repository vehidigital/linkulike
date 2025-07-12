"use client"

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link as LinkIcon, BarChart3, Palette, User, Settings } from "lucide-react";
import Link from "next/link";

// Add types for profile and link

type Profile = {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
  theme?: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  buttonStyle?: string;
  buttonColor?: string;
  buttonGradient?: string;
  textColor?: string;
  fontFamily?: string;
  isPremium?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastUsernameChange?: string;
};

type LinkAnalytics = {
  totalClicks: number;
  recentClicks: number;
  lastClick: string | null;
};

type Link = {
  id: string;
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  customColor?: string;
  useCustomColor?: boolean;
  analytics: LinkAnalytics;
};

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (session?.user?.id !== userId) {
      toast({ title: "Forbidden", description: "You are not allowed to view this page.", variant: "destructive" });
      router.push("/login");
      return;
    }
    fetchData();
  }, [status, session, userId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, linksRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/links")
      ]);
      setProfile(profileRes.ok ? await profileRes.json() : null);
      setLinks(linksRes.ok ? await linksRes.json() : []);
    } catch {
      setProfile(null);
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Profil nicht gefunden.</div>;
  }

  // KPIs
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + (l.analytics?.totalClicks || 0), 0);
  const activeLinks = links.filter((l) => l.isActive).length;
  const profileViews = Math.floor(totalClicks * 0.3);

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      {/* Begrüßung */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16">
          <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName} />
          <AvatarFallback>{profile.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Willkommen zurück, {profile.displayName || profile.username}!</h1>
          <p className="text-gray-500">Hier findest du alle wichtigen Infos und schnellen Einstieg.</p>
        </div>
      </div>
      {/* Quicklinks */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Link href={`/${userId}/links`}><Button variant="outline" className="w-full flex flex-col items-center py-6"><LinkIcon className="w-6 h-6 mb-2" />Links</Button></Link>
        <Link href={`/${userId}/design`}><Button variant="outline" className="w-full flex flex-col items-center py-6"><Palette className="w-6 h-6 mb-2" />Design</Button></Link>
        <Link href={`/${userId}/analytics`}><Button variant="outline" className="w-full flex flex-col items-center py-6"><BarChart3 className="w-6 h-6 mb-2" />Analytics</Button></Link>
        <Link href={`/${userId}/profile`}><Button variant="outline" className="w-full flex flex-col items-center py-6"><User className="w-6 h-6 mb-2" />Profil</Button></Link>
        <Link href={`/${userId}/settings`}><Button variant="outline" className="w-full flex flex-col items-center py-6"><Settings className="w-6 h-6 mb-2" />Einstellungen</Button></Link>
      </div>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6 flex flex-col items-center"><span className="text-gray-500 text-sm mb-1">Links</span><span className="text-2xl font-bold">{totalLinks}</span></CardContent></Card>
        <Card><CardContent className="p-6 flex flex-col items-center"><span className="text-gray-500 text-sm mb-1">Klicks</span><span className="text-2xl font-bold">{totalClicks}</span></CardContent></Card>
        <Card><CardContent className="p-6 flex flex-col items-center"><span className="text-gray-500 text-sm mb-1">Profilaufrufe</span><span className="text-2xl font-bold">{profileViews}</span></CardContent></Card>
        <Card><CardContent className="p-6 flex flex-col items-center"><span className="text-gray-500 text-sm mb-1">Aktive Links</span><span className="text-2xl font-bold">{activeLinks}</span></CardContent></Card>
      </div>
    </div>
  );
}
