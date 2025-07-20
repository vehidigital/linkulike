'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { GripVertical, Pencil, Trash, Eye, Star, Sparkles, Zap, Heart, Crown } from 'lucide-react';
import { eventEmitter, EVENTS } from "@/lib/events";

interface Link {
  id: string;
  title: string;
  url: string;
  position: number;
  highlight?: boolean;
  highlightStyle?: string;
  analytics?: { totalClicks?: number };
}

export function LinkListCard({ reloadLinks, onLinkChanged }: { reloadLinks?: number, onLinkChanged?: () => void }) {
  const params = useParams();
  const userId = params.userId as string;
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editLink, setEditLink] = useState<Link | null>(null);
  const [deleteLink, setDeleteLink] = useState<Link | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  
  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  async function fetchLinks() {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/links?userId=${userId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fehler beim Laden der Links');
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      setError('Fehler beim Laden der Links');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, [reloadLinks, userId]);

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
    
    const newLinks = Array.from(links);
    const [removed] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(dragOverIndex.current, 0, removed);
    
    // Update positions
    const updatedItems = newLinks.map((item, idx) => ({ ...item, position: idx }));
    
    setIsSubmitting(true);
    try {
      const url = `/api/links?userId=${userId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems),
      });
      if (response.ok) {
        setLinks(updatedItems);
        if (onLinkChanged) onLinkChanged();
        eventEmitter.emit(EVENTS.LINKS_UPDATED);
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
      setIsSubmitting(false);
    }
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editLink) return;
    setIsSubmitting(true);
    setEditError(null);
    try {
      const url = `/api/links/${editLink.id}?userId=${userId}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editLink),
      });
      if (!res.ok) throw new Error("Fehler beim Aktualisieren des Links");
      setEditLink(null);
      fetchLinks();
      if (onLinkChanged) onLinkChanged();
      eventEmitter.emit(EVENTS.LINKS_UPDATED);
    } catch (err) {
      setEditError("Fehler beim Aktualisieren des Links.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteLink) return;
    setIsSubmitting(true);
    try {
      const url = `/api/links/${deleteLink.id}?userId=${userId}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleteLink(null);
      fetchLinks();
      if (onLinkChanged) onLinkChanged();
      eventEmitter.emit(EVENTS.LINKS_UPDATED);
    } catch {
      // Fehlerbehandlung optional
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 flex flex-col gap-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-gray-900">Deine Links</h3>
        <p className="text-sm text-gray-600">Verwalte deine Profil-Links</p>
      </div>
      <div className="flex flex-col gap-3">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Lade Links...</p>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {!loading && !error && links.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Noch keine Links vorhanden</p>
            <p className="text-gray-400 text-xs mt-1">Füge deinen ersten Link hinzu</p>
          </div>
        )}
        {!loading && !error && links.map((link, index) => (
          <div 
            key={link.id} 
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
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{link.title}</div>
              <div className="text-xs text-gray-500 break-all">{link.url}</div>
            </div>
            <div className="flex items-center gap-3 ml-2">
              <span className="flex items-center text-gray-400 bg-gray-50 px-2 py-1 rounded-lg" title="Aufrufe">
                <Eye className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">{link.analytics?.totalClicks ?? 0}</span>
              </span>
              <button 
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors" 
                title="Bearbeiten" 
                onClick={() => setEditLink(link)}
              >
                <Pencil className="w-4 h-4 text-gray-500 hover:text-purple-600" />
              </button>
              <button 
                className="p-2 hover:bg-red-50 rounded-lg transition-colors" 
                title="Löschen" 
                onClick={() => setDeleteLink(link)}
              >
                <Trash className="w-4 h-4 text-gray-500 hover:text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit-Modal */}
              <Dialog open={!!editLink} onOpenChange={v => !v && setEditLink(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Link bearbeiten</DialogTitle>
              <DialogDescription className="text-gray-600">
                Bearbeite die Details deines Links.
              </DialogDescription>
            </DialogHeader>
          {editLink && (
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Titel</label>
                <Input
                  placeholder="Link-Titel"
                  value={editLink.title}
                  onChange={e => setEditLink({ ...editLink, title: e.target.value })}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">URL</label>
                <Input
                  placeholder="https://example.com"
                  value={editLink.url}
                  onChange={e => setEditLink({ ...editLink, url: e.target.value })}
                  type="url"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                <Checkbox 
                  checked={editLink.highlight || false} 
                  onCheckedChange={v => setEditLink({ ...editLink, highlight: !!v })}
                  className="border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Als Highlight markieren</span>
              </label>
              
              {(editLink.highlight || false) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Highlight-Stil</label>
                  <Select 
                    value={editLink.highlightStyle || "star"} 
                    onValueChange={v => setEditLink({ ...editLink, highlightStyle: v })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="star" className="hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-2 py-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-900">Stern</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sparkle" className="hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-2 py-1">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="text-gray-900">Funkeln</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="shake" className="hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-2 py-1">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-900">Wackeln</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pulse" className="hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-2 py-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-gray-900">Pulsieren</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="glow" className="hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-2 py-1">
                          <Crown className="w-4 h-4 text-yellow-600" />
                          <span className="text-gray-900">Leuchten</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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

      {/* Delete-Modal */}
              <Dialog open={!!deleteLink} onOpenChange={v => !v && setDeleteLink(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Link löschen</DialogTitle>
              <DialogDescription className="text-gray-600">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </DialogDescription>
            </DialogHeader>
          {deleteLink && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Möchtest du den Link <strong>"{deleteLink.title}"</strong> wirklich löschen?
              </p>
              <p className="text-sm text-gray-500">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <DialogFooter className="gap-3">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Löschen..." : "Link löschen"}
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