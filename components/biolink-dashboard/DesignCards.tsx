'use client'

import React, { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useDesign } from "./DesignContext";
import { UploadAvatar, UploadBackground } from "./UploadComponents";
import { themeTemplates, applyThemeToSettings } from "@/lib/theme-templates";
import { Play, Check, X, Camera, Palette, User, Edit2, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColorPicker } from "@/components/ui/color-picker";
import { ThemePhonePreview } from './ThemePhonePreview';
const AVATAR_BORDER_COLORS = [
  '#000000', '#ffffff', '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'
];


// ColorPickerBubble is now replaced with the new ColorPicker component

export function ProfileCard() {
  const { settings, updateSettings, updatePreview, resetPreview, saveSettings } = useDesign();
  
  // Local state for editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempName, setTempName] = useState(settings.displayName || '');
  const [tempBio, setTempBio] = useState(settings.bio || '');
  const [originalName, setOriginalName] = useState(settings.displayName || '');
  const [originalBio, setOriginalBio] = useState(settings.bio || '');
  
  // Limits
  const NAME_LIMIT = 30;
  const BIO_LIMIT = 150;
  
  const handleUpdate = async (updates: Partial<typeof settings>) => {
    console.log('🔄 handleUpdate called with:', updates);
    try {
      console.log('🔄 Calling updateSettings...');
      updateSettings(updates);
      console.log('🔄 Calling saveSettings...');
      await saveSettings();
      console.log('🔄 handleUpdate completed successfully');
    } catch (error) {
      console.error('❌ Error saving profile settings:', error);
    }
  };
  
  const handleNameSave = async () => {
    console.log('💾 handleNameSave called');
    console.log('💾 tempName:', tempName);
    console.log('💾 originalName:', originalName);
    console.log('💾 Will save?', tempName.trim() && tempName !== originalName);
    
    if (tempName.trim() && tempName !== originalName) {
      console.log('💾 Saving name:', tempName.trim());
      await handleUpdate({ displayName: tempName.trim() });
      setOriginalName(tempName.trim());
      console.log('💾 Name saved, originalName updated to:', tempName.trim());
    }
    setIsEditingName(false);
    console.log('💾 handleNameSave completed');
  };
  
  const handleNameCancel = () => {
    setTempName(originalName);
    // Restore original in preview
    resetPreview();
    setIsEditingName(false);
  };
  
  const handleBioSave = async () => {
    console.log('💾 handleBioSave called');
    console.log('💾 tempBio:', tempBio);
    console.log('💾 originalBio:', originalBio);
    console.log('💾 Will save?', tempBio !== originalBio);
    
    if (tempBio !== originalBio) {
      console.log('💾 Saving bio:', tempBio);
      await handleUpdate({ bio: tempBio });
      setOriginalBio(tempBio);
      console.log('💾 Bio saved, originalBio updated to:', tempBio);
    }
    setIsEditingBio(false);
    console.log('💾 handleBioSave completed');
  };
  
  const handleBioCancel = () => {
    setTempBio(originalBio);
    // Restore original in preview
    resetPreview();
    setIsEditingBio(false);
  };
  
  // Update original values when settings change (e.g., after loading from API)
  useEffect(() => {
    console.log('🔄 useEffect triggered');
    console.log('🔄 settings.displayName:', settings.displayName);
    console.log('🔄 settings.bio:', settings.bio);
    console.log('🔄 isEditingName:', isEditingName);
    console.log('🔄 isEditingBio:', isEditingBio);
    console.log('🔄 originalName before update:', originalName);
    console.log('🔄 originalBio before update:', originalBio);
    
    // Only update original values if we're not currently editing
    if (!isEditingName) {
      setOriginalName(settings.displayName || '');
      setTempName(settings.displayName || '');
    }
    if (!isEditingBio) {
      setOriginalBio(settings.bio || '');
      setTempBio(settings.bio || '');
    }
    
    console.log('🔄 useEffect completed');
  }, [settings.displayName, settings.bio, isEditingName, isEditingBio]);
  
  // Live preview during editing - only update state, don't save
  const handleNameChange = (value: string) => {
    console.log('🔵 handleNameChange called with:', value);
    console.log('🔵 Current tempName:', tempName);
    console.log('🔵 Current originalName:', originalName);
    setTempName(value);
    console.log('🔵 Calling updatePreview with displayName:', value);
    updatePreview({ displayName: value });
    console.log('🔵 handleNameChange completed');
  };
  
  const handleBioChange = (value: string) => {
    console.log('🟢 handleBioChange called with:', value);
    console.log('🟢 Current tempBio:', tempBio);
    console.log('🟢 Current originalBio:', originalBio);
    setTempBio(value);
    console.log('🟢 Calling updatePreview with bio:', value);
    updatePreview({ bio: value });
    console.log('🟢 handleBioChange completed');
  };
  
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Profil</h3>
        <p className="text-sm text-gray-600">Deine persönlichen Informationen</p>
      </div>
      <div className="flex flex-row gap-8 items-start">
        {/* Linke Seite: Name & Bio */}
        <div className="flex-1 flex flex-col gap-6 justify-center">
          <div className="relative w-full">
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-16"
              placeholder="Anzeigename"
              value={tempName}
              onChange={e => handleNameChange(e.target.value)}
              maxLength={NAME_LIMIT}
              readOnly={!isEditingName}
              onFocus={() => setIsEditingName(true)}
            />
            {/* Zeichenzähler für Name */}
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${tempName.length >= NAME_LIMIT ? 'text-red-500' : 'text-gray-400'}`} style={{ top: '80%' }}>
              {tempName.length} / {NAME_LIMIT}
            </div>
            {isEditingName ? (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                <button onClick={handleNameSave} className="text-green-600 hover:bg-green-100 rounded p-1"><Check size={18} /></button>
                <button onClick={handleNameCancel} className="text-red-600 hover:bg-red-100 rounded p-1 ml-1"><X size={18} /></button>
              </span>
            ) : (
              <button onClick={() => setIsEditingName(true)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"><Edit2 size={18} /></button>
            )}
          </div>
          <div className="relative w-full">
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-base font-normal focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[48px] pr-16"
              placeholder="Bio (optional)"
              value={tempBio}
              onChange={e => handleBioChange(e.target.value)}
              maxLength={BIO_LIMIT}
              readOnly={!isEditingBio}
              onFocus={() => setIsEditingBio(true)}
            />
            {/* Zeichenzähler für Bio */}
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${tempBio.length >= BIO_LIMIT ? 'text-red-500' : 'text-gray-400'}`} style={{ top: '80%' }}>
              {tempBio.length} / {BIO_LIMIT}
            </div>
            {isEditingBio ? (
              <span className="absolute right-3 top-2 flex gap-2">
                <button onClick={handleBioSave} className="text-green-600 hover:bg-green-100 rounded p-1"><Check size={18} /></button>
                <button onClick={handleBioCancel} className="text-red-600 hover:bg-red-100 rounded p-1 ml-1"><X size={18} /></button>
              </span>
            ) : (
              <button onClick={() => setIsEditingBio(true)} className="absolute right-3 top-2 text-gray-400 hover:text-purple-500"><Edit2 size={18} /></button>
            )}
          </div>
        </div>
        {/* Rechte Seite: Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className={`w-32 h-32 ${settings.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'} flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300`}> 
              {settings.avatarImage ? (
                <img src={settings.avatarImage} alt="Avatar" className={`w-full h-full object-cover ${settings.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} />
              ) : (
                <Camera className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
          </label>
        </div>
      </div>
      {/* Darunter: Randfarbe und Form */}
      <div className="flex flex-row gap-6 items-center mt-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Randfarbe</label>
          <div className="flex gap-3 items-center">
            <ColorPicker 
              value={settings.avatarBorderColor || '#e5e7eb'}
              onChange={async color => {
                updateSettings({ avatarBorderColor: color });
                updatePreview({ avatarBorderColor: color });
                await saveSettings({ avatarBorderColor: color });
              }}
              variant="bubble"
              size="lg"
            />
            <div className="flex gap-2 mt-2">
              {AVATAR_BORDER_COLORS.map(color => (
                    <button
                      key={color}
                  type="button"
                  onClick={async () => {
                    updateSettings({ avatarBorderColor: color });
                    updatePreview({ avatarBorderColor: color });
                    await saveSettings({ avatarBorderColor: color });
                  }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${settings.avatarBorderColor === color ? 'border-blue-500' : 'border-gray-200'}`}
                  style={{ background: color }}
                >
                  {settings.avatarBorderColor === color && <span className="block w-3 h-3 rounded-full bg-white border border-black shadow-sm" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <div className="flex gap-2">
            <button type="button" onClick={async () => { updateSettings({ avatarShape: 'circle' }); updatePreview({ avatarShape: 'circle' }); await saveSettings({ avatarShape: 'circle' }); }} className={`w-10 h-10 rounded-full border-2 ${settings.avatarShape === 'circle' ? 'border-pink-500' : 'border-gray-200'}`}></button>
            <button type="button" onClick={async () => { updateSettings({ avatarShape: 'rectangle' }); updatePreview({ avatarShape: 'rectangle' }); await saveSettings({ avatarShape: 'rectangle' }); }} className={`w-10 h-10 rounded-lg border-2 ${settings.avatarShape === 'rectangle' ? 'border-pink-500' : 'border-gray-200'}`}></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Neue moderne SVG-Icons für BackgroundCard
const PaletteIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="url(#paint0_radial)"/><defs><radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(12 12) scale(10)"><stop stopColor="#fff"/><stop offset="1" stopColor="#bbb"/></radialGradient></defs></svg>
);
const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e5e7eb"/><polygon points="10,8 18,12 10,16" fill="#555"/></svg>
);
const ImageIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" fill="#e5e7eb"/><circle cx="9" cy="10" r="2" fill="#bdbdbd"/><path d="M4 18l5-5a2 2 0 0 1 2.8 0l4.2 4.2a2 2 0 0 0 2.8 0L20 16" stroke="#bdbdbd" strokeWidth="1.5" fill="none"/></svg>
);

export function BackgroundCard() {
  const { settings, updateSettings, updatePreview, saveSettings } = useDesign();

  // Color state
  const color = settings.backgroundColor || '#1e3a8a';

  // Sofort speichern, kein Delay
  const handleColorChange = async (hex: string) => {
    try {
      updateSettings({ backgroundColor: hex, backgroundType: 'color', backgroundImage: '' });
      updatePreview({ backgroundColor: hex, backgroundType: 'color', backgroundImage: '' });
      await saveSettings({ backgroundColor: hex, backgroundType: 'color', backgroundImage: '' });
      console.log('Background color saved:', hex);
    } catch (e) {
      console.error('Error saving background color:', e);
      alert('Fehler beim Speichern der Hintergrundfarbe!');
    }
  };

  const handleUpdate = async (updates: Partial<typeof settings>) => {
    try {
      console.log('handleUpdate called with:', updates);
      
      if (updates.backgroundType === 'color') {
        updateSettings({ ...updates, backgroundImage: '' });
      } else if (updates.backgroundType === 'image') {
        updateSettings({ ...updates });
      } else {
        updateSettings(updates);
      }
      
      await saveSettings();
      console.log('Background settings saved successfully:', updates);
    } catch (e) {
      console.error('Error saving background settings:', e);
      alert('Fehler beim Speichern!');
    }
  };

  const presetColors = [
    '#1e3a8a', '#dc2626', '#16a34a', '#7c3aed', '#000000'
  ];



  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <div className="text-lg font-bold mb-2">Background</div>
      
      {/* Three Cards: Color, Image */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Color Card */}
        <div 
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${settings.backgroundType === 'color' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
          onClick={() => handleUpdate({ backgroundType: 'color', backgroundImage: '' })}
        >
          <div className="w-full h-16 flex items-center justify-center mb-2">
            <PaletteIcon />
          </div>
          <div className="text-sm font-medium text-center">Color</div>
        </div>

        {/* Image Card */}
        <div 
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${settings.backgroundType === 'image' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
          onClick={() => handleUpdate({ backgroundType: 'image' })}
        >
          <div className="w-full h-16 flex items-center justify-center mb-2">
            <ImageIcon />
          </div>
          <div className="text-sm font-medium text-center">Image</div>
        </div>
      </div>

      {/* Color Bubbles */}
      {settings.backgroundType === 'color' && (
        <div className="flex gap-3 items-center">
          {/* Color Picker */}
          <ColorPicker 
            value={color} 
            onChange={handleColorChange} 
            variant="bubble"
            size="md"
          />
          {/* Preset Colors */}
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              onClick={async () => {
                try {
                  updateSettings({ backgroundColor: presetColor, backgroundType: 'color', backgroundImage: '' });
                  updatePreview({ backgroundColor: presetColor, backgroundType: 'color', backgroundImage: '' });
                  await saveSettings({ backgroundColor: presetColor, backgroundType: 'color', backgroundImage: '' });
                  console.log('Preset background color saved:', presetColor);
                } catch (e) {
                  console.error('Error saving preset background color:', e);
                  alert('Fehler beim Speichern der Hintergrundfarbe!');
                }
              }}
              className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                settings.backgroundColor === presetColor ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
              style={{ backgroundColor: presetColor }}
            />
          ))}
        </div>
      )}

      {/* Image Content */}
      {settings.backgroundType === 'image' && (
        <UploadBackground onUploadComplete={(url) => {
          if (!url) {
            // Wenn Bild gelöscht wird, automatisch auf Farbe zurückschalten
            handleUpdate({ backgroundType: 'color' });
          }
          console.log('Background uploaded:', url);
        }} />
      )}
    </div>
  );
}

export function ThemesCard() {
  const { settings, updateSettings, updatePreview, saveSettings } = useDesign();
  const sortedThemes = [
    ...themeTemplates.filter(t => t.id !== 'create-your-own'),
    ...themeTemplates.filter(t => t.id === 'create-your-own'),
  ];
  
  const handleThemeSelect = async (themeId: string) => {
    try {
      if (themeId === 'create-your-own') {
        console.log('Theme: Create your own selected');
        updateSettings({ selectedTheme: themeId });
        updatePreview({ selectedTheme: themeId });
        await saveSettings({ selectedTheme: themeId });
      } else {
        const themeSettings = applyThemeToSettings(themeId);
        if (themeSettings) {
          updateSettings({ ...themeSettings, isCustomTheme: false });
          updatePreview({ ...themeSettings, isCustomTheme: false });
          await saveSettings(themeSettings);
        }
      }
      console.log('Theme selection saved:', themeId);
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <div className="text-lg font-bold mb-2">Themes</div>
      <div className="grid grid-cols-3 gap-3">
        {sortedThemes.map(theme => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`p-3 rounded-xl border-2 ${settings.selectedTheme === theme.id ? 'border-pink-500' : 'border-gray-200'} bg-gray-50 flex flex-col items-center gap-2 hover:scale-[1.03] transition-transform`}
            style={{ fontFamily: theme.styles.fontFamily || 'Inter' }}
          >
            <ThemePhonePreview theme={theme} displayName={settings.displayName} bio={settings.bio} />
            <span className="text-xs font-semibold mt-1">{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Hilfsfunktion für Kontrastfarbe
function getContrastColor(hex: string) {
  if (!hex || hex.length !== 7) return '#fff';
  const r = parseInt(hex.substr(1,2),16);
  const g = parseInt(hex.substr(3,2),16);
  const b = parseInt(hex.substr(5,2),16);
  const yiq = (r*299 + g*587 + b*114) / 1000;
  return yiq >= 128 ? '#000' : '#fff';
}

export function ButtonCard() {
  const { settings, updateSettings, updatePreview, saveSettings } = useDesign();
  if (!settings.isCustomTheme) return null;
  
  const handleButtonUpdate = async (updates: Partial<typeof settings>) => {
    try {
      updateSettings(updates);
      updatePreview(updates);
      await saveSettings();
    } catch (error) {
      console.error('Error saving button settings:', error);
    }
  };

  // Kontrastfarbe für Button-Text berechnen
  const getButtonTextColor = (backgroundColor: string) => {
    if (!backgroundColor) return '#ffffff';
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const buttonTextColor = getButtonTextColor(settings.buttonColor || '#3b82f6');
  
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-6">
      <div className="text-lg font-bold mb-2">Button Design</div>
      
      {/* Button Style Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">Button-Stil</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleButtonUpdate({ buttonStyle: 'filled' })}
            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              settings.buttonStyle === 'filled' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div 
              className="w-full h-10 rounded-lg mb-2 flex items-center justify-center text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: settings.buttonColor || '#3b82f6',
                color: buttonTextColor
              }}
            >
              Beispiel Button
            </div>
            <span className="text-xs font-medium">Filled</span>
          </button>
          
          <button
            onClick={() => handleButtonUpdate({ buttonStyle: 'outlined' })}
            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              settings.buttonStyle === 'outlined' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div 
              className="w-full h-10 border-2 rounded-lg mb-2 flex items-center justify-center text-sm font-medium transition-colors"
              style={{ 
                borderColor: settings.buttonColor || '#3b82f6',
                color: settings.buttonColor || '#3b82f6'
              }}
            >
              Beispiel Button
            </div>
            <span className="text-xs font-medium">Outlined</span>
          </button>
        </div>
      </div>

      {/* Button Color Customization */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">Button-Farbe</label>
        <div className="flex items-center gap-3">
          <ColorPicker 
            value={settings.buttonColor || '#3b82f6'} 
            onChange={async (c: string) => {
              await handleButtonUpdate({ buttonColor: c });
              await saveSettings({ buttonColor: c });
            }} 
            variant="bubble"
            size="md"
          />
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Aktuelle Farbe</div>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border-2 border-gray-300"
                style={{ backgroundColor: settings.buttonColor || '#3b82f6' }}
              />
              <span className="text-sm font-mono text-gray-700">
                {settings.buttonColor || '#3b82f6'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Button Text Color (Manual Override) */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 mb-1">Button-Textfarbe</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${!settings.useCustomButtonTextColor ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
            onClick={() => handleButtonUpdate({ useCustomButtonTextColor: false })}
          >
            Auto
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${settings.useCustomButtonTextColor ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
            onClick={() => handleButtonUpdate({ useCustomButtonTextColor: true })}
          >
            Manuell
          </button>
        </div>
        {!settings.useCustomButtonTextColor ? (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ backgroundColor: buttonTextColor }} />
            <span className="text-sm font-mono text-gray-700">{buttonTextColor}</span>
            <span className="text-xs text-gray-500 ml-2">Automatisch berechnet für optimalen Kontrast</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ColorPicker 
              value={settings.buttonTextColor || buttonTextColor} 
              onChange={async (c: string) => handleButtonUpdate({ buttonTextColor: c })} 
              variant="bubble"
              size="sm"
            />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Textfarbe</div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border-2 border-gray-300"
                  style={{ backgroundColor: settings.buttonTextColor || buttonTextColor }}
                />
                <span className="text-sm font-mono text-gray-700">
                  {settings.buttonTextColor || buttonTextColor}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vorschau entfernt */}
    </div>
  );
}

export function FontCard() {
  const { settings, updateSettings, updatePreview, saveSettings } = useDesign();
  if (!settings.isCustomTheme) return null;
  
  const handleFontUpdate = async (updates: Partial<typeof settings>) => {
    try {
      updateSettings(updates);
      updatePreview(updates);
      if (updates.selectedFont) {
        await saveSettings({ selectedFont: updates.selectedFont });
      } else {
        await saveSettings(updates);
      }
    } catch (error) {
      console.error('Error saving font settings:', error);
    }
  };
  
  const fonts = [
    { label: 'Sans', value: 'system-ui, Arial, Helvetica, sans-serif' },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Serif', value: 'Georgia, Times New Roman, serif' },
    { label: 'Times', value: 'Times New Roman, Times, serif' },
    { label: 'Monospace', value: 'Menlo, Monaco, Consolas, monospace' },
    { label: 'Courier', value: 'Courier New, Courier, monospace' },
    { label: 'Rounded', value: 'Arial Rounded MT Bold, system-ui, sans-serif' },
    { label: 'Comic', value: 'Comic Sans MS, Comic Sans, cursive, sans-serif' },
  ];
  const textColor = settings.textColor || '#000000';
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <div className="text-lg font-bold mb-2">Font</div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {fonts.map((font) => (
          <button
            key={font.label}
            onClick={async () => handleFontUpdate({ selectedFont: font.value })}
            className={`p-2 rounded border text-xs transition-all hover:scale-105 ${settings.selectedFont === font.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            style={{ fontFamily: font.value }}
          >
            {font.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <ColorPicker 
          value={textColor} 
          onChange={(c: string) => handleFontUpdate({ textColor: c })} 
          variant="bubble"
          size="md"
        />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ backgroundColor: textColor }} />
          <span className="text-sm font-mono text-gray-700">{textColor}</span>
        </div>
      </div>
    </div>
  );
}

export function SocialPositionCard() {
  const { settings, updateSettings, saveSettings } = useDesign();

  const handleUpdate = async (value: 'top' | 'middle' | 'bottom') => {
    try {
      updateSettings({ socialPosition: value });
      await saveSettings({ socialPosition: value });
      console.log('Social position saved:', value);
    } catch (error) {
      console.error('Error saving social position:', error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <div className="text-lg font-bold mb-2">Position to display socials</div>
      <RadioGroup value={settings.socialPosition} onValueChange={handleUpdate}>
          <div className="flex items-center space-x-2 mb-4">
            <RadioGroupItem value="top" id="top" />
            <Label htmlFor="top">Top</Label>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <RadioGroupItem value="middle" id="middle" />
            <Label htmlFor="middle">Middle</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bottom" id="bottom" />
            <Label htmlFor="bottom">Bottom</Label>
          </div>
      </RadioGroup>
    </div>
  );
}

export function BrandingCard() {
  const { settings, updateSettings, saveSettings } = useDesign();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleToggle = async () => {
    setIsSaving(true);
    setSuccess(false);
    const newValue = !settings.showBranding;
    updateSettings({ showBranding: newValue });
    try {
      await saveSettings({ showBranding: newValue });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
      console.log('Branding settings saved:', { showBranding: newValue });
    } catch (error) {
      console.error('Error saving branding settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <div className="text-lg font-bold mb-2">Branding</div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="branding"
          checked={!!settings.showBranding}
          onCheckedChange={handleToggle}
          disabled={isSaving}
        />
        <Label htmlFor="branding">Show "Powered by Linkulike"</Label>
        {isSaving && <Loader2 className="w-4 h-4 animate-spin text-purple-500 ml-2" />}
        {success && !isSaving && <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />}
      </div>
    </div>
  );
}

export function ShareButtonCard() {
  const { settings, updateSettings, saveSettings } = useDesign();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleToggle = async () => {
    setIsSaving(true);
    setSuccess(false);
    const newValue = !settings.showShareButton;
    updateSettings({ showShareButton: newValue });
    try {
      await saveSettings({ showShareButton: newValue });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
      console.log('Share button settings saved:', { showShareButton: newValue });
    } catch (error) {
      console.error('Error saving share button settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <div className="text-lg font-bold mb-2">Share Button</div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="share" 
          checked={!!settings.showShareButton} 
          onCheckedChange={handleToggle}
          disabled={isSaving}
        />
        <Label htmlFor="share">Show share button</Label>
        {isSaving && <Loader2 className="w-4 h-4 animate-spin text-purple-500 ml-2" />}
        {success && !isSaving && <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />}
      </div>
    </div>
  );
} 