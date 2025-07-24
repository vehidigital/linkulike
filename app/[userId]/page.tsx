'use client';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Share2 } from 'lucide-react';
import { ProfileView } from '@/components/ProfileView';

// Social-Icons Mapping (ggf. anpassen/erweitern)
const socialIcons: Record<string, React.ReactNode> = {
  instagram: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
  youtube: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21.8 8.001a2.752 2.752 0 0 0-1.936-1.947C18.2 6 12 6 12 6s-6.2 0-7.864.054A2.752 2.752 0 0 0 2.2 8.001 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999 2.752 2.752 0 0 0 1.936 1.947C5.8 18 12 18 12 18s6.2 0 7.864-.054A2.752 2.752 0 0 0 21.8 15.999 28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999zM10 15V9l6 3-6 3z"/></svg>,
  facebook: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5.019 3.676 9.163 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.324 21.163 22 17.019 22 12z"/></svg>,
  // ...weitere Plattformen
  mail: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11L8.09 11.91a16 16 0 0 0 6 6l2.8-2.8a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z"/></svg>,
  globe: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>,
};

function getBackgroundStyle(settings: any) {
  if (!settings) return {};
  if (settings.backgroundImageActive && settings.backgroundImageUrl) {
    return {
      backgroundImage: `url(${settings.backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: settings.backgroundColor || '#fff',
    };
  }
  return { background: settings.backgroundColor || '#fff' };
}

function getTextColor(settings: any) {
  return settings?.textColor || '#222';
}

function getFontFamily(settings: any) {
  return settings?.fontFamily || 'inherit';
}

function getButtonStyle(settings: any) {
  return {
    background: settings?.buttonColor || '#fff',
    color: settings?.buttonTextColor || '#222',
    border: `2px solid ${settings?.buttonBorderColor || '#e0e0e0'}`,
    fontWeight: 600,
    fontFamily: getFontFamily(settings),
  };
}

export default function PublicProfile({ params }: { params: { userId: string } }) {
  const [userData, setUserData] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, linksRes, socialsRes, settingsRes] = await Promise.all([
          fetch(`/api/user/profile?userId=${params.userId}`),
          fetch(`/api/links?userId=${params.userId}`),
          fetch(`/api/user/socials?userId=${params.userId}`),
          fetch(`/api/user/design?userId=${params.userId}`),
        ]);
        const user = userRes.ok ? await userRes.json() : {};
        const links = linksRes.ok ? await linksRes.json() : [];
        const socials = socialsRes.ok ? await socialsRes.json() : [];
        const settings = settingsRes.ok ? await settingsRes.json() : {};
        setUserData(user);
        setLinks(links);
        setSocials(socials);
        setSettings(settings);
      } catch (e) {
        // Fehlerbehandlung
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.userId]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Lädt...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-100">
      <ProfileView
        userData={userData}
        links={links}
        socials={socials}
        settings={settings}
      />
    </div>
  );
} 