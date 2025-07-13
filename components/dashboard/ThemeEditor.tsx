"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import BackgroundUploadFlow from "@/components/profile/BackgroundUploadFlow";

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
  backgroundImageUrl?: string;
  backgroundCropDesktop?: any;
  backgroundCropMobile?: any;
}

interface ThemeEditorProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  isProUser: boolean;
  setPendingProfile: (profile: UserProfile) => void;
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

export default function ThemeEditor({ profile, onUpdate, isProUser, setPendingProfile }: ThemeEditorProps) {
  const [pendingTheme, setPendingTheme] = useState<Partial<UserProfile> | null>(null);
  const [showBgUpload, setShowBgUpload] = useState(false);
  const [pendingBackgroundImage, setPendingBackgroundImage] = useState<string | null>(null);
  const [isGradient, setIsGradient] = useState<boolean>(profile.buttonStyle === 'gradient');

  // Theme-Auswahl
  const handlePresetSelect = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const nextTheme: Partial<UserProfile> = {
        ...(pendingTheme || profile),
        backgroundColor: preset.backgroundColor,
        backgroundGradient: preset.backgroundGradient,
        buttonStyle: isGradient ? "gradient" : "solid",
        buttonColor: isGradient ? preset.buttonGradient : preset.buttonColor,
        buttonGradient: preset.buttonGradient,
        textColor: preset.textColor,
        fontFamily: pendingTheme?.fontFamily || profile.fontFamily, // Behalte die aktuelle Schriftart
        theme: preset.id,
      };
      setPendingTheme(nextTheme);
      setPendingProfile({ ...profile, ...nextTheme });
    }
  };

  // Textfarbe
  const handleTextColorChange = (color: string) => {
    const nextTheme = { ...(pendingTheme || profile), textColor: color };
    setPendingTheme(nextTheme);
    setPendingProfile({ ...profile, ...nextTheme });
  };

  // Schriftart-Auswahl
  const handleFontChange = (fontFamily: string) => {
    const nextTheme = { ...(pendingTheme || profile), fontFamily };
    setPendingTheme(nextTheme);
    setPendingProfile({ ...profile, ...nextTheme });
  };

  // Gradient Toggle
  const handleToggle = () => {
    setIsGradient((prev) => {
      const newIsGradient = !prev;
      if (pendingTheme) {
        const preset = THEME_PRESETS.find((p) => p.id === (pendingTheme.theme || profile.theme));
        if (preset) {
          const nextTheme = {
            ...pendingTheme,
            buttonStyle: newIsGradient ? "gradient" : "solid",
            buttonColor: newIsGradient ? preset.buttonGradient : preset.buttonColor,
            buttonGradient: preset.buttonGradient,
          };
          setPendingTheme(nextTheme);
          setPendingProfile({ ...profile, ...nextTheme });
        }
      }
      return newIsGradient;
    });
  };

  // Hintergrundbild
  const handleBackgroundChange = (imgOrUrl: string, isDataUrl?: boolean, crops?: { desktop?: any; mobile?: any }) => {
    if (isDataUrl) {
      setPendingBackgroundImage(imgOrUrl);
      setPendingProfile({ ...profile, ...(pendingTheme || {}), backgroundImageUrl: imgOrUrl });
    } else {
      setPendingBackgroundImage(null);
      setPendingProfile({ ...profile, ...(pendingTheme || {}), backgroundImageUrl: imgOrUrl, backgroundCropDesktop: crops?.desktop, backgroundCropMobile: crops?.mobile });
    }
    setShowBgUpload(false);
  };
  const handleRemoveBackground = () => {
    setPendingBackgroundImage(null);
    setPendingProfile({ ...profile, ...(pendingTheme || {}), backgroundImageUrl: "" });
  };

  // Bestätigen
  const handleConfirm = () => {
    if (pendingTheme || pendingBackgroundImage) {
      const updates = { ...profile, ...(pendingTheme || {}) };
      if (pendingBackgroundImage) {
        updates.backgroundImageUrl = pendingBackgroundImage;
      }
      onUpdate(updates);
      setPendingTheme(null);
      setPendingBackgroundImage(null);
    }
  };
  // Verwerfen
  const handleDiscard = () => {
    setPendingTheme(null);
    setPendingBackgroundImage(null);
    setPendingProfile(profile);
  };

  // Prüfe ob es ausstehende Änderungen gibt
  const hasPendingChanges = pendingTheme !== null || pendingBackgroundImage !== null;

  return (
    <div className="w-full space-y-6">
      {/* Banner für alle ausstehenden Änderungen */}
      {hasPendingChanges && (
        <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-between mt-4">
          <span>Änderung ausstehend - Bestätige oder verwerfe die Änderung</span>
          <div className="flex gap-2">
            <button onClick={handleDiscard} className="p-1 rounded hover:bg-yellow-200 transition" title="Verwerfen"><X className="w-4 h-4" /></button>
            <button onClick={handleConfirm} className="p-1 rounded hover:bg-yellow-200 transition" title="Bestätigen"><Check className="w-4 h-4" /></button>
          </div>
        </div>
      )}
      <div>
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
              className={`relative p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 ${preset.id === (pendingTheme?.theme || profile.theme) ? 'border-blue-500 ring-2 ring-blue-200' : preset.id === 'light' ? 'border-gray-300 bg-gray-50 shadow-sm' : 'border-gray-200'}`}
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
        {/* Textfarbe */}
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm font-medium">Textfarbe</label>
          <button type="button" className={`w-8 h-8 rounded border ${((pendingTheme?.textColor || profile.textColor) === '#fff') ? 'ring-2 ring-blue-500' : ''}`} style={{ background: '#222', color: '#fff' }} onClick={() => handleTextColorChange('#fff')}>A</button>
          <button type="button" className={`w-8 h-8 rounded border ${((pendingTheme?.textColor || profile.textColor) === '#222') ? 'ring-2 ring-blue-500' : ''}`} style={{ background: '#fff', color: '#222' }} onClick={() => handleTextColorChange('#222')}>A</button>
        </div>
        {/* Schriftart-Auswahl */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-3">Schriftart</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FONT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`px-4 py-3 rounded-lg border text-base transition-all text-center ${((pendingTheme?.fontFamily || profile.fontFamily) === opt.value) ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                style={{ fontFamily: opt.value }}
                onClick={() => handleFontChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {/* Hintergrundbild-Upload */}
        <div className="mt-8">
          <label className="block text-sm font-medium mb-2">Eigenes Hintergrundbild</label>
          <div className="flex items-center gap-4">
            {pendingBackgroundImage || profile.backgroundImageUrl ? (
              <img src={pendingBackgroundImage || profile.backgroundImageUrl} alt="Hintergrundbild Vorschau" className="w-32 h-20 object-cover rounded border shadow" />
            ) : (
              <div className="w-32 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400 border">Kein Bild</div>
            )}
            <button type="button" className="px-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition" onClick={() => setShowBgUpload(true)}>{pendingBackgroundImage || profile.backgroundImageUrl ? 'Ändern' : 'Hochladen'}</button>
            {(pendingBackgroundImage || profile.backgroundImageUrl) && (
              <button type="button" className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm font-semibold hover:bg-gray-200 transition" onClick={handleRemoveBackground}>Entfernen</button>
            )}
          </div>
        </div>
        {showBgUpload && (
          <BackgroundUploadFlow
            initialBackgroundUrl={pendingBackgroundImage || profile.backgroundImageUrl}
            onBackgroundChange={handleBackgroundChange}
            onClose={() => setShowBgUpload(false)}
          />
        )}
      </div>
    </div>
  );
}