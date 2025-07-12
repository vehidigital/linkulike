"use client";

import { useState, useEffect } from "react";
import { Palette, Eye, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { getTranslations } from "@/lib/i18n";
import { useProfile } from '@/components/profile/ProfileContext';

interface UserProfile {
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
}

interface ThemeEditorProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  isProUser: boolean;
  setPendingProfile: (profile: UserProfile) => void;
  t?: any;
  currentLang?: "de" | "en";
}

const THEME_PRESETS = [
  {
    id: "default",
    name: "Default",
    backgroundColor: "#6366f1",
    backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    buttonStyle: "gradient",
    buttonColor: "#6366f1",
    buttonGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
    fontFamily: "Inter",
  },
  {
    id: "dark",
    name: "Dark",
    backgroundColor: "#1a1a1a",
    backgroundGradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    buttonStyle: "solid",
    buttonColor: "#222",
    buttonGradient: "linear-gradient(135deg, #232526 0%, #414345 100%)",
    textColor: "#ffffff",
    fontFamily: "Inter",
  },
  {
    id: "light",
    name: "Light",
    backgroundColor: "#fff", // wirklich weiß
    backgroundGradient: "linear-gradient(135deg, #fff 0%, #e5e7eb 100%)", // sehr heller Verlauf
    buttonStyle: "solid",
    buttonColor: "#1a1a1a",
    buttonGradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    textColor: "#222", // immer schwarz
    fontFamily: "Inter",
  },
  {
    id: "sunset",
    name: "Sunset",
    backgroundColor: "#f59e42",
    backgroundGradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    buttonStyle: "gradient",
    buttonColor: "#f59e42",
    buttonGradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    textColor: "#ffffff",
    fontFamily: "Inter",
  },
  {
    id: "ocean",
    name: "Ocean",
    backgroundColor: "#3b82f6",
    backgroundGradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    buttonStyle: "gradient",
    buttonColor: "#3b82f6",
    buttonGradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    textColor: "#ffffff",
    fontFamily: "Inter",
  },
  {
    id: "forest",
    name: "Forest",
    backgroundColor: "#22c55e",
    backgroundGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    buttonStyle: "gradient",
    buttonColor: "#22c55e",
    buttonGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    textColor: "#ffffff",
    fontFamily: "Inter",
  },
  // NEU: Rotes Preset
  {
    id: "red",
    name: "Red",
    backgroundColor: "#ef4444",
    backgroundGradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
    buttonStyle: "gradient",
    buttonColor: "#ef4444",
    buttonGradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
    textColor: "#ffffff",
    fontFamily: "Inter",
  },
];

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Roboto", label: "Roboto (Clean)" },
  { value: "Open Sans", label: "Open Sans (Friendly)" },
  { value: "Poppins", label: "Poppins (Bold)" },
  { value: "Montserrat", label: "Montserrat (Elegant)" },
  { value: "Playfair Display", label: "Playfair Display (Classic)" },
];

export default function ThemeEditor({ profile, onUpdate, isProUser, setPendingProfile, t: tProp, currentLang = "en" }: ThemeEditorProps) {
  const t = tProp || getTranslations(currentLang);
  const { links, fetchProfile } = useProfile();
  
  // ORIGINAL DATA: Das sind die echten, gespeicherten Daten
  const [originalData, setOriginalData] = useState<UserProfile>(profile);
  
  // PENDING CHANGES: Diese werden nur in der Live Preview angezeigt
  const [pendingChanges, setPendingChanges] = useState<Partial<UserProfile>>({});
  
  // UI State
  const [isGradient, setIsGradient] = useState(() => {
    return profile.buttonStyle === 'gradient' || profile.buttonGradient?.includes('gradient');
  });
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    const matchingPreset = THEME_PRESETS.find(preset => 
      preset.backgroundColor === profile.backgroundColor ||
      preset.backgroundGradient === profile.backgroundGradient ||
      preset.id === profile.theme
    );
    return matchingPreset?.id || "default";
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize original data when profile changes
  useEffect(() => {
    setOriginalData(profile);
    setPendingChanges({}); // Reset pending changes when profile changes
    
    // Update UI state
    setIsGradient(profile.buttonStyle === 'gradient' || profile.buttonGradient?.includes('gradient'));
    const matchingPreset = THEME_PRESETS.find(preset => 
      preset.backgroundColor === profile.backgroundColor ||
      preset.backgroundGradient === profile.backgroundGradient ||
      preset.id === profile.theme
    );
    setSelectedPreset(matchingPreset?.id || "default");
  }, [profile]);

  // Get current display data (original + pending changes)
  const getCurrentData = (field: keyof UserProfile) => {
    return pendingChanges[field] !== undefined ? pendingChanges[field] : originalData[field];
  };

  // Check if there are any pending changes
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  // Update pending changes and preview
  const updatePendingChanges = (changes: Partial<UserProfile>) => {
    setPendingChanges(prev => {
      const updated = { ...prev, ...changes };
      // Always use current links from context
      const previewData = { ...originalData, ...updated };
      setPendingProfile({ ...(previewData as any), links });
      return updated;
    });
  };

  // handlePresetSelect: Textfarbe immer aus Preset übernehmen
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const presetIsGradient = isGradient;
      const themeData = {
        backgroundColor: preset.backgroundColor,
        backgroundGradient: preset.backgroundGradient,
        buttonStyle: presetIsGradient ? "gradient" : "solid",
        buttonColor: presetIsGradient ? preset.buttonGradient : preset.buttonColor,
        buttonGradient: preset.buttonGradient,
        textColor: preset.id === 'light' ? '#222' : preset.id === 'dark' ? '#fff' : preset.textColor,
        fontFamily: preset.fontFamily,
        theme: preset.id,
      };
      updatePendingChanges(themeData);
    }
  };

  // handleToggle: Gradient/Non-Gradient Switch verbessert
  const handleToggle = () => {
    const newIsGradient = !isGradient;
    setIsGradient(newIsGradient);
    const preset = THEME_PRESETS.find((p) => p.id === selectedPreset);
    if (preset) {
      const themeData = {
        backgroundColor: preset.backgroundColor,
        backgroundGradient: preset.backgroundGradient,
        buttonStyle: newIsGradient ? "gradient" : "solid",
        buttonColor: newIsGradient ? preset.buttonGradient : preset.buttonColor,
        buttonGradient: preset.buttonGradient,
        textColor: preset.id === 'light' ? '#222' : preset.id === 'dark' ? '#fff' : preset.textColor,
        fontFamily: preset.fontFamily,
        theme: preset.id,
      };
      updatePendingChanges(themeData);
    }
  };

  const handleTextColorChange = (color: string) => {
    updatePendingChanges({ textColor: color });
  };

  const handleSave = async () => {
    if (!hasPendingChanges) {
      toast({ title: "Keine Änderungen", description: "Es gibt keine Änderungen zum Speichern." });
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = { ...originalData, ...pendingChanges };
      await onUpdate({ ...(updatedProfile as any), links });
      await fetchProfile(); // Sync context after save
      setOriginalData({ ...(updatedProfile as any), links });
      setPendingChanges({}); // Clear pending changes
      toast({ title: 'Theme gespeichert', description: 'Deine Theme-Einstellungen wurden gespeichert.' });
    } catch {
      toast({ title: 'Fehler', description: 'Theme konnte nicht gespeichert werden', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetChanges = () => {
    setPendingChanges({}); // Clear all pending changes
    // Reset preview to original data
    setPendingProfile({ ...(originalData as any), links });
    toast({ title: "Änderungen zurückgesetzt", description: "Alle Änderungen wurden verworfen." });
  };

  const previewStyle = {
    background: isGradient ? getCurrentData('backgroundGradient') : getCurrentData('backgroundColor'),
    color: getCurrentData('textColor'),
    fontFamily: getCurrentData('fontFamily'),
  };

  const buttonStyle = {
    background: isGradient ? getCurrentData('buttonGradient') : getCurrentData('buttonColor'),
    color: getCurrentData('textColor'),
  };

  return (
    <div className="w-full space-y-6">
      {/* Status Badge */}
      {hasPendingChanges && (
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
          Änderungen ausstehend - Speichere deine Änderungen, um sie zu übernehmen
        </div>
      )}
      <div>
        <div className="flex items-center mb-4 gap-2">
          <span>{t.uniColorHint}</span>
          <Checkbox checked={isGradient} onCheckedChange={handleToggle} id="gradient-toggle" />
          <span>{t.gradientHint}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`relative p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 \
                ${selectedPreset === preset.id ? 'border-blue-500 ring-2 ring-blue-200' : preset.id === 'light' ? 'border-gray-300 bg-gray-50 shadow-sm' : 'border-gray-200'}
              `}
              style={{
                background: isGradient ? preset.backgroundGradient : preset.backgroundColor,
                color: preset.id === 'light' ? '#222' : (isGradient ? '#fff' : preset.textColor),
                boxShadow: preset.id === 'light' ? '0 1px 4px 0 rgba(0,0,0,0.04)' : undefined
              }}
            >
              <span className="font-semibold drop-shadow text-sm" style={{color: preset.id === 'light' ? '#222' : (isGradient ? '#fff' : preset.textColor)}}>{preset.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm font-medium">{t.textColorHint}</label>
          <button
            type="button"
            className={`w-8 h-8 rounded border ${getCurrentData('textColor') === '#fff' ? 'ring-2 ring-blue-500' : ''}`}
            style={{ background: '#222', color: '#fff' }}
            onClick={() => handleTextColorChange('#fff')}
            aria-label={t.whiteTooltip}
          >A</button>
          <button
            type="button"
            className={`w-8 h-8 rounded border ${getCurrentData('textColor') === '#222' ? 'ring-2 ring-blue-500' : ''}`}
            style={{ background: '#fff', color: '#222' }}
            onClick={() => handleTextColorChange('#222')}
            aria-label={t.blackTooltip}
          >A</button>
          {isProUser && (
            <input
              type="color"
              value={getCurrentData('textColor') || '#222222'}
              onChange={e => handleTextColorChange(e.target.value)}
              className="w-8 h-8 p-0 border rounded"
            />
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex justify-between gap-2 mt-6">
          {hasPendingChanges && (
            <button
              type="button"
              onClick={handleResetChanges}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-200 transition flex items-center gap-2"
              disabled={isSaving}
            >
              <RotateCcw className="w-4 h-4" />
              Zurücksetzen
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold disabled:opacity-60 hover:bg-blue-700 transition"
              onClick={handleSave}
              disabled={isSaving || !hasPendingChanges}
            >
              {isSaving ? t.savingText : "Änderungen speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}