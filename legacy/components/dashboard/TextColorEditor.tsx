"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

interface TextColorEditorProps {
  displayNameColor?: string;
  usernameColor?: string;
  bioColor?: string;
  footerColor?: string;
  onUpdate: (data: {
    displayNameColor?: string;
    usernameColor?: string;
    bioColor?: string;
    footerColor?: string;
  }) => void;
  isProUser?: boolean;
}

const COLOR_OPTIONS = [
  { value: 'auto', label: 'Auto', color: '#6b7280' },
  { value: '#fff', label: 'Weiß', color: '#ffffff' },
  { value: '#222', label: 'Schwarz', color: '#222222' },
];

export default function TextColorEditor({ 
  displayNameColor, 
  usernameColor, 
  bioColor, 
  footerColor, 
  onUpdate, 
  isProUser = false 
}: TextColorEditorProps) {
  const handleColorChange = (field: string, color: string) => {
    onUpdate({ [field]: color });
  };

  if (!isProUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Individuelle Schriftfarben
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Pro-Feature</h3>
              <p className="text-sm">
                Passe individuelle Schriftfarben für Display Name, Username, Bio und Footer an.
              </p>
            </div>
            <button className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
              Upgrade auf Pro
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Individuelle Schriftfarben
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Display Name</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    displayNameColor === option.value ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    background: option.color,
                    color: option.value === '#fff' ? '#222' : '#fff'
                  }}
                  onClick={() => handleColorChange('displayNameColor', option.value)}
                  title={option.label}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Username</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    usernameColor === option.value ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    background: option.color,
                    color: option.value === '#fff' ? '#222' : '#fff'
                  }}
                  onClick={() => handleColorChange('usernameColor', option.value)}
                  title={option.label}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Bio</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    bioColor === option.value ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    background: option.color,
                    color: option.value === '#fff' ? '#222' : '#fff'
                  }}
                  onClick={() => handleColorChange('bioColor', option.value)}
                  title={option.label}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Footer</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    footerColor === option.value ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    background: option.color,
                    color: option.value === '#fff' ? '#222' : '#fff'
                  }}
                  onClick={() => handleColorChange('footerColor', option.value)}
                  title={option.label}
                >
                  A
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
          <strong>Auto:</strong> Automatische Kontrastfarbe basierend auf dem Hintergrund<br />
          <strong>Weiß/Schwarz:</strong> Feste Farbe unabhängig vom Hintergrund
        </div>
      </CardContent>
    </Card>
  );
} 