"use client";

import { useState } from "react";
import { Palette, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

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
    backgroundColor: "#f3f4f6",
    backgroundGradient: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    buttonStyle: "solid",
    buttonColor: "#1a1a1a",
    buttonGradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    textColor: "#1a1a1a",
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
];

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Roboto", label: "Roboto (Clean)" },
  { value: "Open Sans", label: "Open Sans (Friendly)" },
  { value: "Poppins", label: "Poppins (Bold)" },
  { value: "Montserrat", label: "Montserrat (Elegant)" },
  { value: "Playfair Display", label: "Playfair Display (Classic)" },
];

export default function ThemeEditor({ profile, onUpdate }: ThemeEditorProps) {
  const [isGradient, setIsGradient] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>(profile.theme || "default");
  const [isLoading, setIsLoading] = useState(false);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const themeData = {
        backgroundColor: preset.backgroundColor,
        backgroundGradient: preset.backgroundGradient,
        buttonStyle: isGradient ? "gradient" : "solid",
        buttonColor: isGradient ? preset.buttonGradient : preset.buttonColor,
        buttonGradient: preset.buttonGradient,
        textColor: preset.textColor,
        fontFamily: preset.fontFamily,
        theme: preset.id,
      };
      onUpdate({ ...profile, ...themeData });
    }
  };

  const handleToggle = () => {
    setIsGradient((prev) => !prev);
    // Nach dem Umschalten das aktuelle Preset erneut anwenden
    handlePresetSelect(selectedPreset);
  };

  const previewStyle = {
    background: isGradient ? profile.backgroundGradient : profile.backgroundColor,
    color: profile.textColor,
    fontFamily: profile.fontFamily,
  };

  const buttonStyle = {
    background: isGradient ? profile.buttonGradient : profile.buttonColor,
    color: profile.textColor,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme auswählen</CardTitle>
        </CardHeader>
        <CardContent>
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
                className={`relative p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 ${selectedPreset === preset.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                style={{
                  background: isGradient ? preset.backgroundGradient : preset.backgroundColor,
                }}
              >
                <span className="font-semibold drop-shadow text-sm" style={{color: isGradient ? '#fff' : preset.textColor}}>{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 