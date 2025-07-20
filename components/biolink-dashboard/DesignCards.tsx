'use client'

import React, { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useDesign } from "./DesignContext";
import { UploadAvatar, UploadBackground } from "./UploadComponents";
import { themeTemplates, applyThemeToSettings } from "@/lib/theme-templates";
import { Play, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColorPicker } from "@/components/ui/color-picker";



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
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Profil</h3>
        <p className="text-sm text-gray-600">Deine persönlichen Informationen</p>
      </div>

      <div className="space-y-5">
        {/* Main Content Row */}
        <div className="flex items-start gap-5">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="text-center space-y-3">
              <Avatar className="w-16 h-16 mx-auto border-2 border-gray-100 shadow-md">
                <AvatarImage src={settings.avatarImage} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                  {settings.displayName ? settings.displayName.slice(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <UploadAvatar onUploadComplete={(url) => {
                  console.log('Avatar uploaded:', url);
                }} />
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Anzeigename <span className="text-red-500">*</span>
              </label>
              {isEditingName ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Dein Name"
                    value={tempName}
                    onChange={e => handleNameChange(e.target.value)}
                    maxLength={NAME_LIMIT}
                    className="h-10 text-sm border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    autoFocus
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleNameSave}
                        disabled={!tempName.trim() || tempName.trim() === originalName}
                        className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white font-medium"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Speichern
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleNameCancel}
                        className="h-8 px-4 border-gray-300 hover:bg-gray-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Abbrechen
                      </Button>
                    </div>
                    <span className={`text-xs font-medium ${tempName.length > NAME_LIMIT * 0.8 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {tempName.length}/{NAME_LIMIT}
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  className="h-10 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center justify-between group"
                  onClick={() => setIsEditingName(true)}
                >
                  <span className={settings.displayName ? 'text-gray-900' : 'text-gray-500'}>
                    {settings.displayName || 'Dein Name'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{settings.displayName?.length || 0}/{NAME_LIMIT}</span>
                    <div className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Bio <span className="text-gray-400">(optional)</span>
              </label>
              {isEditingBio ? (
                <div className="space-y-3">
                  <textarea
                    placeholder="Erzähle etwas über dich..."
                    value={tempBio}
                    onChange={e => handleBioChange(e.target.value)}
                    maxLength={BIO_LIMIT}
                    className="w-full h-20 rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 resize-none"
                    autoFocus
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleBioSave}
                        disabled={tempBio === originalBio}
                        className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white font-medium"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Speichern
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBioCancel}
                        className="h-8 px-4 border-gray-300 hover:bg-gray-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Abbrechen
                      </Button>
                    </div>
                    <span className={`text-xs font-medium ${tempBio.length > BIO_LIMIT * 0.8 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {tempBio.length}/{BIO_LIMIT}
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  className="min-h-[48px] px-3 py-2 text-sm border border-gray-200 rounded-md bg-white cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-start justify-between group"
                  onClick={() => setIsEditingBio(true)}
                >
                  <span className={settings.bio ? 'text-gray-900' : 'text-gray-500'}>
                    {settings.bio || 'Erzähle etwas über dich...'}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{settings.bio?.length || 0}/{BIO_LIMIT}</span>
                    <div className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Customization */}
        <div className="pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            {/* Avatar Shape */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Form</label>
              <RadioGroup 
                value={settings.avatarShape || 'circle'} 
                onValueChange={(value) => handleUpdate({ avatarShape: value as 'circle' | 'rectangle' })}
                className="flex gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="circle" id="circle" className="text-purple-600" />
                  <Label htmlFor="circle" className="text-sm">Kreis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rectangle" id="rectangle" className="text-purple-600" />
                  <Label htmlFor="rectangle" className="text-sm">Rechteck</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Border Color */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Randfarbe</label>
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-8 gap-1">
                  {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleUpdate({ avatarBorderColor: color })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        settings.avatarBorderColor === color 
                          ? 'border-gray-400 scale-110' 
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <ColorPicker
                  value={settings.avatarBorderColor || '#ffffff'}
                  onChange={(color) => handleUpdate({ avatarBorderColor: color })}
                  size="sm"
                  variant="bubble"
                />
              </div>
            </div>
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
  const { settings, updateSettings, saveSettings } = useDesign();

  // Color state
  const color = settings.backgroundColor || '#1e3a8a';

  // Sofort speichern, kein Delay
  const handleColorChange = async (hex: string) => {
    try {
      updateSettings({ backgroundColor: hex, backgroundType: 'color', backgroundImage: '' });
      await saveSettings();
      console.log('Background color saved:', hex);
    } catch (e) {
      console.error('Error saving background color:', e);
      alert('Fehler beim Speichern der Hintergrundfarbe!');
    }
  };

  const handleUpdate = async (updates: Partial<typeof settings>) => {
    try {
      if (updates.backgroundType === 'color') {
        updateSettings({ ...updates, backgroundImage: '' });
      } else if (updates.backgroundType === 'image') {
        updateSettings({ ...updates });
      } else {
        updateSettings(updates);
      }
      await saveSettings();
      console.log('Background settings saved:', updates);
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
              onClick={() => handleUpdate({ backgroundColor: presetColor })}
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
  const { settings, updateSettings, saveSettings } = useDesign();
  const sortedThemes = [
    ...themeTemplates.filter(t => t.id !== 'create-your-own'),
    ...themeTemplates.filter(t => t.id === 'create-your-own'),
  ];
  
  const handleThemeSelect = async (themeId: string) => {
    try {
      if (themeId === 'create-your-own') {
        updateSettings({ selectedTheme: themeId, isCustomTheme: true });
      } else {
        const themeSettings = applyThemeToSettings(themeId);
        if (themeSettings) {
          updateSettings({ ...themeSettings, isCustomTheme: false });
        }
      }
      await saveSettings();
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
          >
            <div className={`w-full h-10 rounded ${theme.preview} mb-1 flex items-center justify-center`}></div>
            <span className="text-xs font-semibold">{theme.name}</span>
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
  const { settings, updateSettings, saveSettings } = useDesign();
  if (!settings.isCustomTheme) return null;
  
  const handleUpdate = async (updates: Partial<typeof settings>) => {
    try {
      updateSettings(updates);
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
            onClick={() => handleUpdate({ buttonStyle: 'filled' })}
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
            onClick={() => handleUpdate({ buttonStyle: 'outlined' })}
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
            onChange={(c: string) => handleUpdate({ buttonColor: c })} 
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
            onClick={() => handleUpdate({ useCustomButtonTextColor: false })}
          >
            Auto
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${settings.useCustomButtonTextColor ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
            onClick={() => handleUpdate({ useCustomButtonTextColor: true })}
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
              onChange={(c: string) => handleUpdate({ buttonTextColor: c })} 
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
  const { settings, updateSettings, saveSettings } = useDesign();
  if (!settings.isCustomTheme) return null;
  
  const handleUpdate = async (updates: Partial<typeof settings>) => {
    try {
      updateSettings(updates);
      await saveSettings();
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
            onClick={() => handleUpdate({ selectedFont: font.value })}
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
          onChange={(c: string) => handleUpdate({ textColor: c })} 
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
      await saveSettings();
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

  const handleUpdate = async (updates: Partial<typeof settings>) => {
    try {
      updateSettings(updates);
      await saveSettings();
      console.log('Branding settings saved:', updates);
    } catch (error) {
      console.error('Error saving branding settings:', error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <div className="text-lg font-bold mb-2">Branding</div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="branding" 
          checked={settings.showBranding} 
          onCheckedChange={(checked) => handleUpdate({ showBranding: checked as boolean })}
        />
        <Label htmlFor="branding">Show "Powered by Linkulike"</Label>
      </div>
    </div>
  );
}

export function ShareButtonCard() {
  const { settings, updateSettings, saveSettings } = useDesign();

  const handleUpdate = async (updates: Partial<typeof settings>) => {
    try {
      updateSettings(updates);
      await saveSettings();
      console.log('Share button settings saved:', updates);
    } catch (error) {
      console.error('Error saving share button settings:', error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col gap-4">
      <div className="text-lg font-bold mb-2">Share Button</div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="share" 
          checked={settings.showShareButton} 
          onCheckedChange={(checked) => handleUpdate({ showShareButton: checked as boolean })}
        />
        <Label htmlFor="share">Show share button</Label>
      </div>
    </div>
  );
} 