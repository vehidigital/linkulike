"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useProfile } from "@/components/profile/ProfileContext";
import BackgroundImageEditor from "./BackgroundImageEditor";
import TextColorEditor from "./TextColorEditor";

export interface UserProfile {
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
  // Hintergrundbild-Felder
  backgroundImageUrl?: string;
  backgroundImageActive?: boolean;
  backgroundOverlayType?: 'dark' | 'light' | 'custom' | 'none';
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;
  // Pro-Features für individuelle Textfarben
  displayNameColor?: string;
  usernameColor?: string;
  bioColor?: string;
  footerColor?: string;
}

interface ThemeEditorProps {
  profile: UserProfile;
  onUpdate: () => void;
  isProUser: boolean;
  setPendingProfile: (data: Partial<UserProfile>) => void;
  onDiscard?: () => void;
}

const THEME_PRESETS = [
  { id: "default", name: "Default", backgroundColor: "#6366f1", backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", buttonStyle: "gradient", buttonColor: "#6366f1", buttonGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", textColor: "#fff", fontFamily: "Inter" },
  { id: "dark", name: "Dark", backgroundColor: "#1a1a1a", backgroundGradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", buttonStyle: "solid", buttonColor: "#222", buttonGradient: "linear-gradient(135deg, #232526 0%, #414345 100%)", textColor: "#fff", fontFamily: "Inter" },
  { id: "light", name: "Light", backgroundColor: "#fff", backgroundGradient: "linear-gradient(135deg, #fff 0%, #e5e7eb 100%)", buttonStyle: "solid", buttonColor: "#1a1a1a", buttonGradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", textColor: "#222", fontFamily: "Inter" },
  { id: "sunset", name: "Sunset", backgroundColor: "#f59e42", backgroundGradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)", buttonStyle: "gradient", buttonColor: "#f59e42", buttonGradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)", textColor: "#fff", fontFamily: "Inter" },
  { id: "ocean", name: "Ocean", backgroundColor: "#3b82f6", backgroundGradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", buttonStyle: "gradient", buttonColor: "#3b82f6", buttonGradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", textColor: "#fff", fontFamily: "Inter" },
  { id: "forest", name: "Forest", backgroundColor: "#22c55e", backgroundGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", buttonStyle: "gradient", buttonColor: "#22c55e", buttonGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", textColor: "#fff", fontFamily: "Inter" },
  { id: "red", name: "Red", backgroundColor: "#ef4444", backgroundGradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)", buttonStyle: "gradient", buttonColor: "#ef4444", buttonGradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)", textColor: "#fff", fontFamily: "Inter" },
];

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Roboto", label: "Roboto (Clean)" },
  { value: "Open Sans", label: "Open Sans (Friendly)" },
  { value: "Poppins", label: "Poppins (Bold)" },
  { value: "Montserrat", label: "Montserrat (Elegant)" },
  { value: "Playfair Display", label: "Playfair Display (Classic)" },
];

export default function ThemeEditor({ profile, onUpdate, isProUser, setPendingProfile, onDiscard }: ThemeEditorProps) {
  const { pendingProfile } = useProfile();
  const [isGradient, setIsGradient] = useState<boolean>(profile.buttonStyle === 'gradient');

  const activeProfile = pendingProfile || profile;

  useEffect(() => {
    setIsGradient(activeProfile.buttonStyle === 'gradient');
  }, [activeProfile.buttonStyle]);

  const handlePresetSelect = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const nextTheme: Partial<UserProfile> = {
        backgroundColor: preset.backgroundColor,
        backgroundGradient: preset.backgroundGradient,
        buttonStyle: isGradient ? "gradient" : "solid",
        buttonColor: isGradient ? preset.buttonGradient : preset.buttonColor,
        buttonGradient: preset.buttonGradient,
        textColor: preset.textColor,
        fontFamily: activeProfile.fontFamily,
        theme: preset.id,
      };
      setPendingProfile(nextTheme);
    }
  };

  const handleTextColorChange = (color: string) => {
    setPendingProfile({ textColor: color });
  };

  const handleFontChange = (fontFamily: string) => {
    setPendingProfile({ fontFamily });
  };

  const handleToggle = () => {
    setIsGradient((prev) => {
      const newIsGradient = !prev;
      const preset = THEME_PRESETS.find((p) => p.id === activeProfile.theme);
      if (preset) {
        const nextTheme = {
          buttonStyle: newIsGradient ? "gradient" : "solid",
          buttonColor: newIsGradient ? preset.buttonGradient : preset.buttonColor,
          buttonGradient: preset.buttonGradient,
        };
        setPendingProfile(nextTheme);
      }
      return newIsGradient;
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Hintergrundbild-Editor */}
      <BackgroundImageEditor
        backgroundImageUrl={activeProfile.backgroundImageUrl}
        backgroundImageActive={activeProfile.backgroundImageActive}
        backgroundOverlayType={activeProfile.backgroundOverlayType}
        backgroundOverlayColor={activeProfile.backgroundOverlayColor}
        backgroundOverlayOpacity={activeProfile.backgroundOverlayOpacity}
        onUpdate={(data) => setPendingProfile({ ...data })}
      />

      <div>
        <div className="mb-6">
          <div className="flex items-center mb-4 gap-2">
            <span>Uni-Farbe</span>
            <Checkbox checked={isGradient} onCheckedChange={handleToggle} id="gradient-toggle" />
            <span>Gradient</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`relative p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 ${preset.id === activeProfile.theme ? 'border-blue-500 ring-2 ring-blue-200' : preset.id === 'light' ? 'border-gray-300 bg-gray-50 shadow-sm' : 'border-gray-200'}`}
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
        </div>
        {/* Schriftfarbe (immer aktiv) */}
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm font-medium">Textfarbe</label>
          <button type="button" className={`w-8 h-8 rounded border ${(activeProfile.textColor === '#fff') ? 'ring-2 ring-blue-500' : ''}`} style={{ background: '#222', color: '#fff' }} onClick={() => handleTextColorChange('#fff')}>A</button>
          <button type="button" className={`w-8 h-8 rounded border ${(activeProfile.textColor === '#222') ? 'ring-2 ring-blue-500' : ''}`} style={{ background: '#fff', color: '#222' }} onClick={() => handleTextColorChange('#222')}>A</button>
        </div>
        {/* Schriftart-Auswahl (immer aktiv) */}
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm font-medium">Schriftart</label>
          <select
            value={activeProfile.fontFamily}
            onChange={(e) => handleFontChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
        {/* Individuelle Textfarben */}
        <TextColorEditor
          displayNameColor={activeProfile.displayNameColor}
          usernameColor={activeProfile.usernameColor}
          bioColor={activeProfile.bioColor}
          footerColor={activeProfile.footerColor}
          onUpdate={(data) => setPendingProfile({ ...data })}
          isProUser={isProUser}
        />
      </div>
    </div>
  );
}