"use client";

import { X, Check } from "lucide-react";
import { useProfile } from "@/components/profile/ProfileContext";

interface PendingChangesBannerProps {
  className?: string;
}

export function PendingChangesBanner({ className = "" }: PendingChangesBannerProps) {
  const { profile, pendingProfile, commitPendingProfile, discardPendingProfile } = useProfile();

  // Zeige Banner nur wenn pendingProfile vorhanden ist UND sich vom gespeicherten profile unterscheidet
  if (!pendingProfile || !profile) {
    return null;
  }

  // Prüfe ob es tatsächlich Unterschiede gibt
  const hasChanges = Object.keys(pendingProfile).some(key => {
    const pendingValue = (pendingProfile as any)[key];
    const savedValue = (profile as any)[key];
    
    // Spezielle Behandlung für Arrays (z.B. links)
    if (Array.isArray(pendingValue) && Array.isArray(savedValue)) {
      return JSON.stringify(pendingValue) !== JSON.stringify(savedValue);
    }
    
    return pendingValue !== savedValue;
  });

  if (!hasChanges) {
    return null;
  }

  return (
    <div className={`bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${className}`}>
      <span>Änderung ausstehend - Bestätige oder verwerfe die Änderung</span>
      <div className="flex gap-2">
        <button 
          onClick={discardPendingProfile} 
          className="p-1 rounded hover:bg-yellow-200 transition" 
          title="Verwerfen"
        >
          <X className="w-4 h-4" />
        </button>
        <button 
          onClick={commitPendingProfile} 
          className="p-1 rounded hover:bg-yellow-200 transition" 
          title="Bestätigen"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 