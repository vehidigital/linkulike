"use client";

import React, { useState, useRef, useEffect } from "react";
import { Edit3, Trash2, GripVertical, Globe, ExternalLink, Eye, EyeOff, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import { toast } from "@/hooks/use-toast";
import { getColorForUrl, getIconForUrl, socialPlatforms } from "@/lib/social-icons";
import { getRandomModernColor, getContrastColor, hasLowContrast } from "@/lib/color-utils";
import { SolidLinkButton } from "@/components/profile/SolidLinkButton";
import { getLinkButtonColors, getLinkIcon } from "@/lib/link-button-utils";
import { getTranslations } from "@/lib/i18n";
import { useProfile } from "@/components/profile/ProfileContext";

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

interface LinkEditorProps {
  links: Link[];
  onUpdate: (links: Link[]) => void;
  onDelete?: (linkId: string) => void;
  theme?: string;
  currentLang?: "de" | "en";
  t?: any;
  onPreviewChange?: (links: Link[]) => void; // NEW: for live preview only
}

export const ICON_OPTIONS = [
  { value: "", label: "", name: "noIcon" },
  { value: "globe", label: "🌐", name: "globe" },
  { value: "link", label: "🔗", name: "link" },
  { value: "mail", label: "✉️", name: "mail" },
  { value: "phone", label: "📞", name: "phone" },
  { value: "briefcase", label: "💼", name: "business" },
  { value: "document", label: "📄", name: "document" },
  { value: "mobile", label: "📱", name: "mobile" },
];

const THEME_COLORS = {
  Default:   { color: "#6366f1", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  Sunset:    { color: "#f59e42", gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)" },
  Ocean:     { color: "#3b82f6", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  Forest:    { color: "#22c55e", gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  Dark:      { color: "#222",    gradient: "linear-gradient(135deg, #232526 0%, #414345 100%)" },
  Light:     { color: "#f3f4f6", gradient: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)" },
} as const;

type ThemeKey = keyof typeof THEME_COLORS;

const isProUser = false // TODO: Dynamisch setzen

function getColorPresets(theme = "Default") {
  const themeKey = theme as ThemeKey;
  const themeColor = THEME_COLORS[themeKey]?.color || THEME_COLORS.Default.color
  return [
    { name: "standard", value: themeColor },
    { name: "white", value: "#ffffff" },
    { name: "neutral", value: "#9ca3af" },
    { name: "green", value: "#22c55e" },
    { name: "orange", value: "#f59e42" },
    { name: "pink", value: "#ec4899" },
    { name: "black", value: "#222" },
    { name: "gray", value: "#6b7280" },
  ]
}

export default function LinkEditor({ links, onUpdate, onDelete, theme = "Default", currentLang = "en", t: tProp, onPreviewChange }: LinkEditorProps) {
  const t = tProp || getTranslations(currentLang);
  
  // ORIGINAL DATA: Das sind die echten, gespeicherten Links
  const [originalLinks, setOriginalLinks] = useState<Link[]>(links);
  
  // UI State
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dragOverIndex = useRef<number | null>(null);
  const { fetchProfile } = useProfile();

  // Initialize original links when links prop changes
  useEffect(() => {
    setOriginalLinks(links);
  }, [links]);

  // Die Standardfarbe aus dem aktuellen Theme holen
  const themeKey = theme as ThemeKey;
  const themeColor = THEME_COLORS[themeKey]?.color || THEME_COLORS.Default.color

  // COLOR_PRESETS wird jetzt dynamisch per Funktion erzeugt
  const COLOR_PRESETS = getColorPresets(theme)

  // Native Drag & Drop Handlers (now persist immediately)
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };
  
  const handleDrop = async () => {
    if (draggedIndex === null || dragOverIndex.current === null || draggedIndex === dragOverIndex.current) {
      setDraggedIndex(null);
      dragOverIndex.current = null;
      return;
    }
    const newLinks = Array.from(originalLinks);
    const [removed] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(dragOverIndex.current, 0, removed);
    // Update positions
    const updatedItems = newLinks.map((item, idx) => ({ ...item, position: idx }));
    setIsSaving(true);
    try {
      const response = await fetch('/api/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems),
      });
      if (response.ok) {
        setOriginalLinks(updatedItems);
        if (onUpdate) onUpdate(updatedItems);
        if (fetchProfile) await fetchProfile();
        toast({ title: 'Reihenfolge gespeichert', description: 'Die neue Reihenfolge wurde gespeichert.' });
      } else {
        toast({ title: 'Fehler', description: 'Reihenfolge konnte nicht gespeichert werden', variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };

  const handleEditLink = async (link: Link) => {
    setEditingLink(link);
    setIsEditing(true);
  };

  const handleSaveLink = async (updatedLink: Link) => {
    setIsSaving(true);
    try {
      let newLinks;
      if (!updatedLink.id || updatedLink.id.startsWith('temp_')) {
        // New link
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLink),
        });
        if (response.ok) {
          const created = await response.json();
          newLinks = [...originalLinks, created];
        } else {
          toast({ title: 'Fehler', description: 'Link konnte nicht erstellt werden', variant: 'destructive' });
          return;
        }
      } else {
        // Update existing link
        const response = await fetch(`/api/links/${updatedLink.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLink),
        });
        if (response.ok) {
          const updated = await response.json();
          newLinks = originalLinks.map(l => l.id === updated.id ? updated : l);
        } else {
          toast({ title: 'Fehler', description: 'Link konnte nicht gespeichert werden', variant: 'destructive' });
          return;
        }
      }
      setOriginalLinks(newLinks);
      if (onUpdate) onUpdate(newLinks);
      if (fetchProfile) await fetchProfile();
      toast({ title: 'Link gespeichert', description: 'Der Link wurde gespeichert.' });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
      setEditingLink(null);
    }
  };

  const handleToggleActive = async (link: Link) => {
    setIsSaving(true);
    try {
      const updatedLink = { ...link, isActive: !link.isActive };
      const response = await fetch(`/api/links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLink),
      });
      if (response.ok) {
        const updated = await response.json();
        const newLinks = originalLinks.map(l => l.id === updated.id ? updated : l);
        setOriginalLinks(newLinks);
        if (onUpdate) onUpdate(newLinks);
        if (fetchProfile) await fetchProfile();
        toast({ title: 'Status gespeichert', description: 'Der Link-Status wurde gespeichert.' });
      } else {
        toast({ title: 'Fehler', description: 'Status konnte nicht gespeichert werden', variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const newLinks = originalLinks.filter(link => link.id !== linkId);
        setOriginalLinks(newLinks);
        if (onUpdate) onUpdate(newLinks);
        if (fetchProfile) await fetchProfile();
        toast({ title: 'Link gelöscht', description: 'Der Link wurde gelöscht.' });
      } else {
        toast({ title: 'Fehler', description: 'Link konnte nicht gelöscht werden', variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getIconDisplay = (iconValue: string) => {
    const icon = ICON_OPTIONS.find((i) => i.value === iconValue);
    return icon ? icon.label : "🌐";
  };

  const getLinkColor = (link: Link) => {
    if (link.useCustomColor && link.customColor) {
      return link.customColor;
    }
    
    // Auto-detect social platform color
    const platformColor = getColorForUrl(link.url);
    if (platformColor !== "#000000") {
      return platformColor;
    }
    
    // Use modern color for non-social links
    return getRandomModernColor();
  };

  const getLinkPreviewStyle = (link: Link) => {
    const backgroundColor = getLinkColor(link);
    const textColor = getContrastColor(backgroundColor);
    
    return {
      backgroundColor,
      color: textColor,
    };
  };

  const currentLinks = originalLinks;

  return (
    <div className="w-full space-y-4">

      {/* Action Buttons */}
      {/* Removed global save/reset buttons */}

      <div className="space-y-2">
        {currentLinks.map((link, index) => (
          <div
            key={link.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => handleDragOver(index, e)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            style={{
              opacity: draggedIndex === index ? 0.5 : 1,
              boxShadow: draggedIndex === index ? '0 2px 8px 0 rgba(0,0,0,0.10)' : 'none',
              background: draggedIndex === index ? '#f8fafc' : 'white',
              cursor: 'move',
              border: dragOverIndex.current === index && draggedIndex !== null && draggedIndex !== index ? '2px dashed #a0aec0' : '1px solid #e5e7eb',
              borderRadius: 12,
              marginBottom: 8,
              transition: 'box-shadow 0.1s, background 0.1s, border 0.1s',
            }}
          >
            <div className="p-4 overflow-x-hidden">
              <div className="flex items-center">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Color Preview */}
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-200 flex-shrink-0"
                    style={{
                      backgroundColor: getLinkButtonColors(link, theme).backgroundColor,
                      color: getLinkButtonColors(link, theme).textColor
                    }}
                  >
                    <span className="text-sm font-bold flex items-center justify-center h-full">
                      {getLinkIcon(link, ICON_OPTIONS)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {link.url}
                    </p>
                    {link.useCustomColor && (
                      <p className="text-xs text-blue-600">
                        {t.customColor || "Custom color"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <Badge variant={link.isActive ? "default" : "secondary"}>
                    {link.isActive ? (t.active || "Active") : (t.inactive || "Inactive")}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                    onClick={() => handleToggleActive(link)}
                  >
                    {link.isActive ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                    onClick={() => handleEditLink(link)}
                    title={t.editLink || "Edit Link"}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-gray-100 hover:bg-gray-200 rounded-full p-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteLink(link.id)}
                    title={t.delete || "Delete"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add Link Button */}
        <Button onClick={() => {
          setEditingLink({ id: '', title: '', url: '', icon: '', isActive: true, position: currentLinks.length });
          setIsEditing(true);
        }}>
          {t.addLink || "+ Link hinzufügen"}
        </Button>
        
        {/* Edit Link Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-md bg-white opacity-100">
            <DialogHeader>
              <DialogTitle>{t.editLink || "Link bearbeiten"}</DialogTitle>
              <DialogDescription>
                {t.editLinkDescription || "Bitte geben Sie die Details des Links ein, um ihn zu aktualisieren."}
              </DialogDescription>
            </DialogHeader>
            {editingLink && (
              <EditLinkForm
                link={editingLink}
                onSave={handleSaveLink}
                onCancel={() => {
                  setIsEditing(false);
                  setEditingLink(null);
                }}
                theme={theme}
                t={t}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface EditLinkFormProps {
  link: Link;
  onSave: (link: Link) => void;
  onCancel: () => void;
  theme: string;
  t: any;
}

function EditLinkForm({ link, onSave, onCancel, theme, t }: EditLinkFormProps) {
  const [formData, setFormData] = useState({
    title: link.title,
    url: link.url,
    icon: link.icon,
    color: link.customColor || THEME_COLORS[theme as ThemeKey]?.color || THEME_COLORS.Default.color,
    useCustomColor: link.useCustomColor || false,
    textColorOverride: link.textColorOverride || undefined,
  });

  // COLOR_PRESETS auch hier dynamisch erzeugen
  const COLOR_PRESETS = getColorPresets(theme)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...link, ...formData, customColor: formData.color, useCustomColor: formData.useCustomColor });
  };

  const currentColor = formData.color;
  const textColor = getContrastColor(currentColor);

  let previewTextColor = getContrastColor(currentColor);
  if (formData.textColorOverride === 'light') previewTextColor = '#fff';
  else if (formData.textColorOverride === 'dark') previewTextColor = '#222';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.title || "Titel"}
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={t.titlePlaceholder || "Titel"}
          required
          maxLength={32}
          className="max-w-full truncate overflow-x-auto whitespace-nowrap"
          title={formData.title}
        />
        <div className={`text-xs mt-1 text-right ${formData.title.length >= 32 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{formData.title.length}/32</div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.link || "Link"}
        </label>
        <Input
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder={t.linkPlaceholder || "https://..."}
          required
          maxLength={120}
          className="max-w-full truncate"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.icon || "Icon"}
        </label>
        <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon.value}
              type="button"
              onClick={() => setFormData({ ...formData, icon: icon.value })}
              className={`p-2 rounded border text-lg hover:bg-gray-50 ${
                formData.icon === icon.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              {icon.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Settings */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.color || "Farbe"}
        </label>
        <div className="flex gap-2 flex-wrap mb-2">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.value}
              type="button"
              style={{
                background: preset.value,
                border: formData.color === preset.value && formData.useCustomColor ? "2.5px solid #6366f1" : "1px solid #ccc",
                width: 32,
                height: 32,
                borderRadius: 8,
                cursor: "pointer"
              }}
              onClick={() => setFormData(f => ({ ...f, color: preset.value, useCustomColor: true }))}
              aria-label={preset.name}
            />
          ))}
        </div>
        {isProUser && (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={formData.useCustomColor ? formData.color : THEME_COLORS[theme as ThemeKey]?.color || THEME_COLORS.Default.color}
              onChange={e => setFormData(f => ({ ...f, color: e.target.value, useCustomColor: true }))}
              disabled={!formData.useCustomColor}
              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #ccc" }}
            />
            <label className="text-sm">
              <input
                type="checkbox"
                checked={formData.useCustomColor}
                onChange={e => setFormData(f => ({ ...f, useCustomColor: e.target.checked }))}
              /> {t.customColorPro || "Eigene Farbe (Pro)"}
            </label>
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            className={`w-8 h-8 rounded border text-xs ${!formData.textColorOverride ? 'ring-2 ring-blue-500' : ''}`}
            style={{ background: '#eee', color: '#222' }}
            onClick={() => setFormData(f => ({ ...f, textColorOverride: undefined }))}
            aria-label="Auto"
          >{t.auto || "A"}</button>
          <button
            type="button"
            className={`w-8 h-8 rounded border text-xs ${formData.textColorOverride === 'light' ? 'ring-2 ring-blue-500' : ''}`}
            style={{ background: '#222', color: '#fff' }}
            onClick={() => setFormData(f => ({ ...f, textColorOverride: 'light' }))}
            aria-label="Hell"
          >{t.light || "A"}</button>
          <button
            type="button"
            className={`w-8 h-8 rounded border text-xs ${formData.textColorOverride === 'dark' ? 'ring-2 ring-blue-500' : ''}`}
            style={{ background: '#fff', color: '#222' }}
            onClick={() => setFormData(f => ({ ...f, textColorOverride: 'dark' }))}
            aria-label="Dunkel"
          >{t.dark || "A"}</button>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.preview || "Vorschau"}
          </label>
          <div className="max-w-xs truncate overflow-x-auto" title={formData.title}>
            <SolidLinkButton
              title={formData.title}
              color={currentColor}
              icon={ICON_OPTIONS.find(opt => opt.value === formData.icon)?.label}
              textColor={previewTextColor}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>{t.cancel || "Abbrechen"}</Button>
        <Button type="submit">{t.saveChanges || "Zur Vorschau hinzufügen"}</Button>
      </div>
    </form>
  );
} 