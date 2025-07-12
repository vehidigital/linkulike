'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
  position: number;
  customColor?: string;
  useCustomColor?: boolean;
  textColorOverride?: 'light' | 'dark' | undefined;
}

interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  backgroundColor: string;
  backgroundGradient: string;
  buttonStyle: string;
  buttonColor: string;
  buttonGradient: string;
  textColor: string;
  fontFamily: string;
  links: Link[];
  [key: string]: any;
}

interface ProfileContextType {
  profile: Profile | null;
  links: Link[];
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateLinks: (links: Link[]) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
  initialProfile?: Profile;
}

export function ProfileProvider({ children, initialProfile }: ProfileProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile || null);
  const [links, setLinks] = useState<Link[]>(initialProfile?.links || []);
  const [isLoading, setIsLoading] = useState(!initialProfile);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setLinks(data.links || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchProfile();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateLinks = async (newLinks: Link[]) => {
    console.log("ProfileContext: updateLinks called with", newLinks);
    setLinks(newLinks); // Update local state immediately
    
    // Also update the profile state with new links
    if (profile) {
      setProfile({
        ...profile,
        links: newLinks
      });
    }
    
    // Don't make API calls here - let the LinkEditor handle them
    // This prevents double API calls and state overwrites
  };

  useEffect(() => {
    if (!initialProfile) {
      fetchProfile();
    }
  }, [initialProfile]);

  return (
    <ProfileContext.Provider value={{ profile, links, isLoading, fetchProfile, updateProfile, updateLinks }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
} 