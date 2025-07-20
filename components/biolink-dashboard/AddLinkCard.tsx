'use client';

import React, { useState } from "react";
import { useParams } from 'next/navigation';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { eventEmitter, EVENTS } from "@/lib/events";
import { Star, Sparkles, Zap, Heart, Crown } from "lucide-react";

export function AddLinkCard({ onLinkAdded }: { onLinkAdded?: () => void }) {
  const params = useParams();
  const userId = params.userId as string;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [highlight, setHighlight] = useState(false);
  const [highlightStyle, setHighlightStyle] = useState("star");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const url = `/api/links?userId=${userId}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, highlight, highlightStyle }),
      });
      if (!res.ok) throw new Error("Fehler beim Speichern des Links");
      setOpen(false);
      setTitle("");
      setUrl("");
      setHighlight(false);
      setHighlightStyle("star");
      if (onLinkAdded) onLinkAdded();
      eventEmitter.emit(EVENTS.LINKS_UPDATED);
    } catch (err) {
      setError("Fehler beim Speichern des Links.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 flex flex-col gap-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-gray-900">Links verwalten</h3>
        <p className="text-sm text-gray-600">Füge neue Links zu deinem Profil hinzu</p>
      </div>
      <div className="flex gap-3 w-full">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button type="button" className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
              + Link hinzufügen
            </button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Neuen Link hinzufügen</DialogTitle>
              <DialogDescription className="text-gray-600">
                Füge einen neuen Link zu deinem Profil hinzu.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Titel</label>
                <Input
                  placeholder="z.B. Meine Website"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">URL</label>
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  type="url"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                <Checkbox 
                  checked={highlight} 
                  onCheckedChange={v => setHighlight(!!v)}
                  className="border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Als Highlight markieren</span>
              </label>
              
              {highlight && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Highlight-Stil</label>
                  <Select value={highlightStyle} onValueChange={setHighlightStyle}>
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
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <DialogFooter className="gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Speichern..." : "Link speichern"}
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
        <button className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
          + Embed
        </button>
      </div>
    </div>
  );
} 