"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Edit3, Trash2, GripVertical, Globe, ExternalLink, Eye, EyeOff, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import { toast } from "@/hooks/use-toast";
import { getColorForUrl, getIconForUrl, socialPlatforms } from "@/lib/social-icons";
import { getRandomModernColor, getContrastColor, hasLowContrast } from "@/lib/color-utils";
import { SolidLinkButton } from "@/components/profile/SolidLinkButton";
import { getLinkButtonColors, getLinkIcon } from "@/lib/link-button-utils";

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
  position: number;
  customColor?: string;
  useCustomColor?: boolean;
}

interface LinkEditorProps {
  links: Link[];
  onUpdate: (links: Link[]) => void;
  onDelete: (linkId: string) => void;
  theme?: string;
}

export const ICON_OPTIONS = [
  { value: "", label: "", name: "Kein Icon" },
  { value: "globe", label: "🌐", name: "Globe" },
  { value: "link", label: "🔗", name: "Link" },
  { value: "mail", label: "✉️", name: "Mail" },
  { value: "phone", label: "📞", name: "Phone" },
  { value: "briefcase", label: "💼", name: "Business" },
  { value: "document", label: "📄", name: "Dokument" },
  { value: "mobile", label: "📱", name: "Handy" },
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
    { name: "Standard", value: themeColor },
    { name: "Neutral", value: "#9ca3af" },
    { name: "Grün", value: "#22c55e" },
    { name: "Orange", value: "#f59e42" },
    { name: "Pink", value: "#ec4899" },
    { name: "Schwarz", value: "#222" },
    { name: "Grau", value: "#6b7280" },
  ]
}

export default function LinkEditor({ links, onUpdate, onDelete, theme = "Default" }: LinkEditorProps) {
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Die Standardfarbe aus dem aktuellen Theme holen
  const themeKey = theme as ThemeKey;
  const themeColor = THEME_COLORS[themeKey]?.color || THEME_COLORS.Default.color

  // COLOR_PRESETS wird jetzt dynamisch per Funktion erzeugt
  const COLOR_PRESETS = getColorPresets(theme)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    onUpdate(updatedItems);
  };

  const handleEditLink = async (link: Link) => {
    setEditingLink(link);
    setIsEditing(true);
  };

  const handleSaveLink = async (updatedLink: Link) => {
    try {
      const response = await fetch(`/api/links/${updatedLink.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLink),
      });

      if (response.ok) {
        const updatedLinks = links.map((link) =>
          link.id === updatedLink.id ? updatedLink : link
        );
        onUpdate(updatedLinks);
        setIsEditing(false);
        setEditingLink(null);
        toast({
          title: "Success",
          description: "Link updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (link: Link) => {
    const updatedLink = { ...link, isActive: !link.isActive };
    await handleSaveLink(updatedLink);
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

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="links" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {links.map((link, index) => (
                <Draggable key={link.id} draggableId={link.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-all ${
                        snapshot.isDragging ? "shadow-lg rotate-2" : ""
                      } ${!link.isActive ? "opacity-60" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab hover:cursor-grabbing"
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            
                            {/* Color Preview */}
                            <div 
                              className="w-8 h-8 rounded border-2 border-gray-200"
                              style={{
                                backgroundColor: getLinkButtonColors(link, themeColor).backgroundColor,
                                color: getLinkButtonColors(link, themeColor).textColor
                              }}
                            >
                              <span className="text-sm font-bold flex items-center justify-center h-full">
                                {getLinkIcon(link, ICON_OPTIONS)}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {link.title}
                              </h3>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {link.url}
                              </p>
                              {link.useCustomColor && (
                                <p className="text-xs text-blue-600">
                                  Custom color
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant={link.isActive ? "default" : "secondary"}>
                              {link.isActive ? "Active" : "Inactive"}
                            </Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
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
                              size="sm"
                              onClick={() => handleEditLink(link)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(link.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Link Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md bg-white opacity-100">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
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
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EditLinkFormProps {
  link: Link;
  onSave: (link: Link) => void;
  onCancel: () => void;
  theme: string;
}

function EditLinkForm({ link, onSave, onCancel, theme }: EditLinkFormProps) {
  const [formData, setFormData] = useState({
    title: link.title,
    url: link.url,
    icon: link.icon,
    color: link.customColor || THEME_COLORS[theme as ThemeKey]?.color || THEME_COLORS.Default.color,
    useCustomColor: link.useCustomColor || false,
  });

  // COLOR_PRESETS auch hier dynamisch erzeugen
  const COLOR_PRESETS = getColorPresets(theme)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...link, ...formData, customColor: formData.color, useCustomColor: formData.useCustomColor });
  };

  const currentColor = formData.color;
  const textColor = getContrastColor(currentColor);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Link title"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL
        </label>
        <Input
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://example.com"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon
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
          Farbe wählen
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
              /> Eigene Farbe (Pro)
            </label>
          </div>
        )}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vorschau
          </label>
          <SolidLinkButton
            title={formData.title}
            color={currentColor}
            icon={ICON_OPTIONS.find(opt => opt.value === formData.icon)?.label}
            textColor={getContrastColor(currentColor)}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
} 