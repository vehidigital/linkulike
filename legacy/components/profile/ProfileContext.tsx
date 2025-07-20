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
  // Zentrale pendingProfile-State für alle Änderungen
  pendingProfile: Profile | null;
  // Methoden für zentrale pendingProfile-Verwaltung
  setPendingProfile: (profile: Profile) => void;
  updatePendingProfile: (data: Partial<Profile>) => void;
  clearPendingProfile: () => void;
  commitPendingProfile: () => Promise<void>;
  discardPendingProfile: () => void;
  // Bestehende Methoden
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
  // Zentrale pendingProfile-State
  const [pendingProfile, setPendingProfileState] = useState<Profile | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setLinks(data.links || []);
      } else {
        console.error("Failed to fetch profile:", res.status, res.statusText);
        const errorData = await res.text();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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
        const updated = await res.json();
        setProfile(updated); // Optimistisches Update
        setLinks(updated.links || []);
        // Kein sofortiges fetchProfile mehr!
      } else {
        console.error("Failed to update profile:", res.status, res.statusText);
        const errorData = await res.text();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
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

  // Zentrale pendingProfile-Methoden
  const setPendingProfile = (newProfile: Profile) => {
    setPendingProfileState(newProfile);
  };

  const updatePendingProfile = (data: Partial<Profile>) => {
    if (profile) {
      const currentPending = pendingProfile || profile;
      setPendingProfileState({
        ...currentPending,
        ...data
      });
    }
  };

  const clearPendingProfile = () => {
    setPendingProfileState(null);
  };

  const commitPendingProfile = async () => {
    if (!pendingProfile) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingProfile),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setLinks(updated.links || []);
        setPendingProfileState(null); // Clear pending after successful commit
      } else {
        console.error("Failed to commit pending profile:", res.status, res.statusText);
        const errorData = await res.text();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error committing pending profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const discardPendingProfile = () => {
    setPendingProfileState(null);
  };

  useEffect(() => {
    if (!initialProfile) {
      fetchProfile();
    }
  }, [initialProfile]);

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      links, 
      isLoading, 
      // Zentrale pendingProfile-State und Methoden
      pendingProfile,
      setPendingProfile,
      updatePendingProfile,
      clearPendingProfile,
      commitPendingProfile,
      discardPendingProfile,
      // Bestehende Methoden
      fetchProfile, 
      updateProfile, 
      updateLinks 
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
} 