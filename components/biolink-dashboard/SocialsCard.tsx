'use client';

import React, { useState, useRef } from "react";
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { socialPlatforms, SocialPlatform, getIconForUrl } from "@/lib/social-icons";
import { Mail, Facebook, Twitter, Instagram, Youtube, Coffee, Gift, Music, Github, Dribbble, Club, Signal, Twitch, Camera, ShoppingBag, Apple, Smartphone, Globe, Link, User, Phone, MessageCircle, BookOpen, Figma, GripVertical, Pencil, Trash, Heart, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { eventEmitter, EVENTS } from "@/lib/events";

const iconMap: Record<string, any> = {
  email: Mail,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  "buymeacoffee": Coffee,
  "gift": Gift,
  tiktok: Music,
  spotify: Music,
  github: Github,
  dribbble: Dribbble,
  clubhouse: Club,
  signal: Signal,
  twitch: Twitch,
  cameo: Camera,
  "producthunt": ShoppingBag,
  apple: Apple,
  phone: Phone,
  website: Globe,
  bluesky: Globe,
  snapchat: MessageCircle,
  podcasts: Music,
  googleplay: ShoppingBag,
  etsy: ShoppingBag,
  poshmark: ShoppingBag,
  whatsapp: MessageCircle,
  goodreads: BookOpen,
  figma: Figma,
  "1-on-1": User,
  linkedin: User,
  discord: MessageCircle,
  telegram: MessageCircle,
  pinterest: ShoppingBag,
  reddit: BookOpen,
  medium: BookOpen,
  behance: Figma,
  notion: BookOpen,
  substack: Mail,
  kofi: Coffee,
  patreon: Gift,
  onlyfans: Heart,
  appstore: Apple,
  address: MapPin,
  other: Link,
};

interface Social {
  id: string;
  platform: string;
  value: string; // Use 'value' field as per Prisma schema
  position: number;
  customIcon?: string;
  isUrl?: boolean;
}

export function SocialsCard({ onSocialChanged }: { onSocialChanged?: () => void }) {
  const params = useParams();
  const userId = params.userId as string;
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add Social State
  const [addSocialOpen, setAddSocialOpen] = useState(false);
  const [newSocial, setNewSocial] = useState({ 
    platform: '', 
    value: '', 
    customPlatform: '', 
    customIcon: '🔗',
    isUrl: false 
  });
  const [addError, setAddError] = useState<string | null>(null);
  
  // Edit Social State
  const [editSocial, setEditSocial] = useState<Social | null>(null);
  const [editCustomPlatform, setEditCustomPlatform] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  
  // Delete Social State
  const [deleteSocial, setDeleteSocial] = useState<Social | null>(null);
  
  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  // Lade Social-Links beim Mount der Komponente
  React.useEffect(() => {
    loadSocials();
  }, [userId]);

  async function loadSocials() {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/user/socials?userId=${userId}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSocials(Array.isArray(data) ? data : []);
      } else {
        setError('Fehler beim Laden der Social Media');
      }
    } catch (err) {
      setError('Fehler beim Laden der Social Media');
    } finally {
      setLoading(false);
    }
  }

  // Drag & Drop Handlers
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
    
    const newSocials = Array.from(socials);
    const [removed] = newSocials.splice(draggedIndex, 1);
    newSocials.splice(dragOverIndex.current, 0, removed);
    
    // Update positions
    const updatedItems = newSocials.map((item, idx) => ({ ...item, position: idx }));
    
    setLoading(true);
    try {
      const url = `/api/user/socials?userId=${userId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems),
      });
      if (response.ok) {
        setSocials(updatedItems);
        if (onSocialChanged) onSocialChanged();
        toast({ 
          title: 'Gespeichert', 
          description: 'Reihenfolge wurde aktualisiert.',
          variant: "success"
        });
      } else {
        toast({ 
          title: 'Fehler', 
          description: 'Reihenfolge konnte nicht gespeichert werden', 
          variant: 'destructive' 
        });
      }
    } finally {
      setLoading(false);
    }
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };

  // Add Social Handler
  async function handleAddSocial(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setAddError(null);
    
    try {
      const url = `/api/user/socials?userId=${userId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          platform: newSocial.platform, 
          url: newSocial.value,
          customPlatform: newSocial.customPlatform,
          customIcon: newSocial.customIcon,
          isUrl: newSocial.isUrl
        }),
      });
      
      if (response.ok) {
        setAddSocialOpen(false);
        setNewSocial({ platform: '', value: '', customPlatform: '', customIcon: '🔗', isUrl: false });
        await loadSocials();
        if (onSocialChanged) onSocialChanged();
        eventEmitter.emit(EVENTS.SOCIALS_UPDATED);
        toast({ 
          title: 'Erfolgreich', 
          description: 'Social Media wurde hinzugefügt.',
          variant: "success"
        });
      } else {
        setAddError('Fehler beim Hinzufügen der Social Media');
      }
    } catch (err) {
      setAddError('Fehler beim Hinzufügen der Social Media');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Edit Social Handler
  async function handleEditSocial(e: React.FormEvent) {
    e.preventDefault();
    if (!editSocial) return;
    
    setIsSubmitting(true);
    setEditError(null);
    
    try {
      const url = `/api/user/socials/${editSocial.id}?userId=${userId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          platform: editSocial.platform === 'other' ? editCustomPlatform : editSocial.platform, 
          value: editSocial.value 
        }),
      });
      
      if (response.ok) {
        setEditSocial(null);
        await loadSocials();
        if (onSocialChanged) onSocialChanged();
        eventEmitter.emit(EVENTS.SOCIALS_UPDATED);
        toast({ 
          title: 'Erfolgreich', 
          description: 'Social Media wurde aktualisiert.',
          variant: "success"
        });
      } else {
        setEditError('Fehler beim Aktualisieren der Social Media');
      }
    } catch (err) {
      setEditError('Fehler beim Aktualisieren der Social Media');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete Social Handler
  async function handleDeleteSocial() {
    if (!deleteSocial) return;
    
    setIsSubmitting(true);
    
    try {
      const url = `/api/user/socials/${deleteSocial.id}?userId=${userId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setDeleteSocial(null);
        await loadSocials();
        if (onSocialChanged) onSocialChanged();
        eventEmitter.emit(EVENTS.SOCIALS_UPDATED);
        toast({ 
          title: 'Erfolgreich', 
          description: 'Social Media wurde gelöscht.',
          variant: "success"
        });
      } else {
        toast({ 
          title: 'Fehler', 
          description: 'Social Media konnte nicht gelöscht werden', 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      toast({ 
        title: 'Fehler', 
        description: 'Social Media konnte nicht gelöscht werden', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Get Social Icon
  function getSocialIcon(platform: string, customIcon?: string): string {
    // For "other" platform, use custom icon if available
    if (platform === 'other' && customIcon) {
      return customIcon;
    }
    
    // Contact info icons
    if (platform === 'email') return '📧';
    if (platform === 'phone') return '📞';
    if (platform === 'address') return '📍';
    
    // Try to find platform in socialPlatforms
    const socialPlatform = socialPlatforms.find(sp => sp.value === platform);
    if (socialPlatform) {
      return socialPlatform.icon;
    }
    
    // Fallback to iconMap for Lucide icons
    const Icon = iconMap[platform];
    if (Icon) {
      return '🔗'; // Use link emoji for Lucide icons
    }
    
    // Default fallback
    return '🔗';
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 flex flex-col gap-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-gray-900">Social Media</h3>
        <p className="text-sm text-gray-600">Verbinde deine Social Media Profile</p>
      </div>
      <div className="flex flex-col gap-3">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Lade Social Media...</p>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {!loading && !error && socials.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Noch keine Social Media verknüpft</p>
            <p className="text-gray-400 text-xs mt-1">Füge deine ersten Social Media Profile hinzu</p>
          </div>
        )}
        {!loading && !error && socials.map((social, index) => (
          <div 
            key={social.id} 
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => handleDragOver(index, e)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            style={{
              opacity: draggedIndex === index ? 0.5 : 1,
              boxShadow: draggedIndex === index ? '0 4px 12px 0 rgba(0,0,0,0.15)' : '0 2px 8px 0 rgba(0,0,0,0.08)',
              background: draggedIndex === index ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              cursor: 'move',
              border: dragOverIndex.current === index && draggedIndex !== null && draggedIndex !== index ? '2px dashed #a0aec0' : '1px solid rgba(229, 231, 235, 0.8)',
              borderRadius: 16,
              transition: 'all 0.2s ease-in-out',
            }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200/50 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            <GripVertical className="w-5 h-5 text-gray-400 cursor-move flex-shrink-0" />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {social.platform === 'other' ? (
                  <span className="text-lg">{getSocialIcon(social.platform, social.customIcon)}</span>
                ) : (
                  <div 
                    className="w-6 h-6"
                    dangerouslySetInnerHTML={{ __html: getSocialIcon(social.platform) }}
                  />
                )}
              </div>
                             <div className="flex-1 min-w-0">
                 <div className="font-semibold text-gray-900 capitalize">{social.platform}</div>
                 <div className="text-xs text-gray-500 break-all">{social.value}</div>
               </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button 
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors" 
                title="Bearbeiten" 
                onClick={() => {
                  setEditSocial(social);
                  setEditCustomPlatform(social.platform === 'other' ? social.platform : '');
                }}
              >
                <Pencil className="w-4 h-4 text-gray-500 hover:text-purple-600" />
              </button>
              <button 
                className="p-2 hover:bg-red-50 rounded-lg transition-colors" 
                title="Löschen" 
                onClick={() => setDeleteSocial(social)}
              >
                <Trash className="w-4 h-4 text-gray-500 hover:text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Social Button */}
      <button 
        onClick={() => setAddSocialOpen(true)}
        className="mt-4 w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 font-medium"
      >
        + Social Media hinzufügen
      </button>

      {/* Add Social Modal */}
              <Dialog open={addSocialOpen} onOpenChange={setAddSocialOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Social Media hinzufügen</DialogTitle>
              <DialogDescription className="text-gray-600">
                Füge eine neue Social Media Platform zu deinem Profil hinzu.
              </DialogDescription>
            </DialogHeader>
          <form onSubmit={handleAddSocial} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Platform</label>
              <select 
                value={newSocial.platform} 
                onChange={e => setNewSocial({ ...newSocial, platform: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                required
              >
                <option value="">Platform auswählen</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="snapchat">Snapchat</option>
                <option value="twitch">Twitch</option>
                <option value="discord">Discord</option>
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="spotify">Spotify</option>
                <option value="apple">Apple Music</option>
                <option value="soundcloud">SoundCloud</option>
                <option value="pinterest">Pinterest</option>
                <option value="reddit">Reddit</option>
                <option value="github">GitHub</option>
                <option value="behance">Behance</option>
                <option value="dribbble">Dribbble</option>
                <option value="figma">Figma</option>
                <option value="notion">Notion</option>
                <option value="medium">Medium</option>
                <option value="substack">Substack</option>
                <option value="clubhouse">Clubhouse</option>
                <option value="signal">Signal</option>
                <option value="cameo">Cameo</option>
                <option value="buymeacoffee">Buy Me a Coffee</option>
                <option value="kofi">Ko-fi</option>
                <option value="patreon">Patreon</option>
                <option value="onlyfans">OnlyFans</option>
                <option value="producthunt">Product Hunt</option>
                <option value="appstore">App Store</option>
                <option value="googleplay">Google Play</option>
                <option value="website">Website</option>
                <option value="email">E-Mail</option>
                <option value="phone">Telefon</option>
                <option value="address">Adresse</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
            
            {newSocial.platform === 'other' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Benutzerdefinierte Platform</label>
                  <Input
                    placeholder="z.B. Mein Blog, Portfolio, Shop..."
                    value={newSocial.customPlatform || ''}
                    onChange={e => setNewSocial({ ...newSocial, customPlatform: e.target.value })}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Icon auswählen</label>
                  <div className="grid grid-cols-6 gap-2">
                    {['🔗', '🌐', '📱', '💻', '🎨', '📝', '🎵', '📷', '🎮', '💬', '📧', '📞', '📍', '🏠', '🛒', '📚', '🎭', '🏃', '🍕', '☕', '🎪', '🎨', '🔧', '⚡'].map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setNewSocial({ ...newSocial, customIcon: icon })}
                        className={`w-10 h-10 rounded-lg border-2 text-lg hover:scale-110 transition-transform ${
                          newSocial.customIcon === icon 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {(newSocial.platform === 'email' || newSocial.platform === 'phone' || newSocial.platform === 'address') && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="text-mode"
                    name="input-mode"
                    checked={!newSocial.isUrl}
                    onChange={() => setNewSocial({ ...newSocial, isUrl: false })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="text-mode" className="text-sm font-medium text-gray-700">
                    Text (Infobox wird angezeigt)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="url-mode"
                    name="input-mode"
                    checked={newSocial.isUrl}
                    onChange={() => setNewSocial({ ...newSocial, isUrl: true })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="url-mode" className="text-sm font-medium text-gray-700">
                    URL (Direkter Link)
                  </label>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {newSocial.isUrl ? 'URL' : 
                 newSocial.platform === 'email' ? 'E-Mail Adresse' : 
                 newSocial.platform === 'phone' ? 'Telefonnummer' : 
                 newSocial.platform === 'address' ? 'Adresse' : 'URL'}
              </label>
              <Input
                placeholder={
                  newSocial.isUrl ? 'https://...' :
                  newSocial.platform === 'email' ? 'beispiel@email.com' :
                  newSocial.platform === 'phone' ? '+49 123 456789' :
                  newSocial.platform === 'address' ? 'Musterstraße 123, 12345 Stadt' :
                  'https://instagram.com/username'
                }
                value={newSocial.value}
                onChange={e => setNewSocial({ ...newSocial, value: e.target.value })}
                type="text"
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
            {addError && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {addError}
              </div>
            )}
            <DialogFooter className="gap-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Hinzufügen..." : "Social Media hinzufügen"}
              </button>
              <DialogClose asChild>
                <button type="button" className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                  Abbrechen
                </button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Social Modal */}
              <Dialog open={!!editSocial} onOpenChange={v => !v && setEditSocial(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Social Media bearbeiten</DialogTitle>
              <DialogDescription className="text-gray-600">
                Bearbeite die Details deiner Social Media Platform.
              </DialogDescription>
            </DialogHeader>
          {editSocial && (
            <form onSubmit={handleEditSocial} className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Platform</label>
                <select 
                  value={editSocial.platform} 
                  onChange={e => setEditSocial({ ...editSocial, platform: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                  required
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="snapchat">Snapchat</option>
                  <option value="twitch">Twitch</option>
                  <option value="discord">Discord</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="spotify">Spotify</option>
                  <option value="apple">Apple Music</option>
                  <option value="soundcloud">SoundCloud</option>
                  <option value="pinterest">Pinterest</option>
                  <option value="reddit">Reddit</option>
                  <option value="github">GitHub</option>
                  <option value="behance">Behance</option>
                  <option value="dribbble">Dribbble</option>
                  <option value="figma">Figma</option>
                  <option value="notion">Notion</option>
                  <option value="medium">Medium</option>
                  <option value="substack">Substack</option>
                  <option value="clubhouse">Clubhouse</option>
                  <option value="signal">Signal</option>
                  <option value="cameo">Cameo</option>
                  <option value="buymeacoffee">Buy Me a Coffee</option>
                  <option value="kofi">Ko-fi</option>
                  <option value="patreon">Patreon</option>
                  <option value="onlyfans">OnlyFans</option>
                  <option value="producthunt">Product Hunt</option>
                  <option value="appstore">App Store</option>
                  <option value="googleplay">Google Play</option>
                  <option value="website">Website</option>
                  <option value="email">E-Mail</option>
                  <option value="phone">Telefon</option>
                  <option value="address">Adresse</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>
              
              {editSocial?.platform === 'other' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Benutzerdefinierte Platform</label>
                  <Input
                    placeholder="z.B. Mein Blog, Portfolio, Shop..."
                    value={editCustomPlatform}
                    onChange={e => setEditCustomPlatform(e.target.value)}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {editSocial.platform === 'email' ? 'E-Mail Adresse' : 
                   editSocial.platform === 'phone' ? 'Telefonnummer' : 
                   editSocial.platform === 'address' ? 'Adresse' : 'URL'}
                </label>
                <Input
                  placeholder={
                    editSocial.platform === 'email' ? 'beispiel@email.com' :
                    editSocial.platform === 'phone' ? '+49 123 456789' :
                    editSocial.platform === 'address' ? 'Musterstraße 123, 12345 Stadt' :
                    'https://instagram.com/username'
                  }
                  value={editSocial.value}
                  onChange={e => setEditSocial({ ...editSocial, value: e.target.value })}
                  type={
                    editSocial.platform === 'email' ? 'email' :
                    editSocial.platform === 'phone' ? 'tel' :
                    'url'
                  }
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              {editError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {editError}
                </div>
              )}
              <DialogFooter className="gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Speichern..." : "Änderungen speichern"}
                </button>
                <DialogClose asChild>
                  <button type="button" className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                    Abbrechen
                  </button>
                </DialogClose>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Social Modal */}
              <Dialog open={!!deleteSocial} onOpenChange={v => !v && setDeleteSocial(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Social Media löschen</DialogTitle>
              <DialogDescription className="text-gray-600">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </DialogDescription>
            </DialogHeader>
          {deleteSocial && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Möchtest du <strong>"{deleteSocial.platform}"</strong> wirklich löschen?
              </p>
              <p className="text-sm text-gray-500">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <DialogFooter className="gap-3">
                <button
                  onClick={handleDeleteSocial}
                  className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Löschen..." : "Social Media löschen"}
                </button>
                <DialogClose asChild>
                  <button type="button" className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                    Abbrechen
                  </button>
                </DialogClose>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 