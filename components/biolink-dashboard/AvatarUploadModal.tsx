import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Edit2 } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';

export function AvatarUploadModal({
  open,
  onOpenChange,
  avatarUrl,
  onUpload,
  onDelete,
  userId,
  initialShape = 'circle',
  initialBorderColor = '#e5e7eb',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarUrl?: string;
  onUpload: (url: string, borderColor?: string) => void;
  onDelete: () => void;
  userId: string;
  initialShape?: 'circle' | 'rectangle';
  initialBorderColor?: string;
}) {
  const [shape, setShape] = useState<'circle' | 'rectangle'>(initialShape);
  const [borderColor, setBorderColor] = useState<string>(initialBorderColor || '#e5e7eb');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);

  // Automatische Format-Erkennung
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    // Bild laden und Format vorschlagen
    const img = new window.Image();
    img.onload = () => {
      if (img.width > img.height * 1.2) {
        setShape('rectangle');
      } else {
        setShape('circle');
      }
    };
    img.src = url;
  };

  // Upload-Logik (vereinfacht, ohne Cropping)
  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      // Dateiname mit userId-Struktur
      const ext = selectedFile.name.split('.').pop() || 'jpg';
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      const randomName = `user_${userId}/avatar_${uuid}.${ext}`;
      const renamedFile = new File([selectedFile], randomName, { type: selectedFile.type });
      // Simpler Upload: Nutze fetch oder deine Upload-API
      // Hier als Platzhalter (du kannst hier deine Upload-Logik einfügen)
      // const uploadedUrl = await uploadFile(renamedFile);
      // Demo: Zeige einfach die Vorschau
      setTimeout(() => {
        setLoading(false);
        onUpload(previewUrl!, borderColor);
        onOpenChange(false);
      }, 1000);
    } catch (e) {
      setError('Fehler beim Upload');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Avatar/Logo hochladen</DialogTitle>
          <DialogDescription>
            Lade ein Profilbild oder Firmenlogo hoch. Das Format wird automatisch erkannt, kann aber umgeschaltet werden.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 items-center mb-2">
            <span className="text-xs text-gray-500">Format:</span>
            <button type="button" onClick={() => setShape('circle')} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all ${shape === 'circle' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'}`}>O</button>
            <button type="button" onClick={() => setShape('rectangle')} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${shape === 'rectangle' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'}`}>▭</button>
          </div>
          <div className="flex gap-4 items-center mb-2">
            <span className="text-xs text-gray-500">Randfarbe:</span>
            <ColorPicker value={borderColor} onChange={setBorderColor} variant="bubble" size="md" />
            <span className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ background: borderColor }} />
          </div>
          <div className="w-32 h-32 flex items-center justify-center mb-2 overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar Preview"
                className={`w-full h-full object-contain ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} border-4`}
                style={{ borderColor, transform: `scale(${zoom})` }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} border-2 border-dashed border-gray-300`}>
                <Edit2 className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          {/* Zoom-Slider */}
          {previewUrl && (
            <div className="flex items-center gap-2 mb-2 w-32">
              <span className="text-xs text-gray-500">Zoom</span>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-700">{zoom.toFixed(2)}x</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            Bild auswählen
          </Button>
          {selectedFile && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Speichern'}
            </Button>
          )}
          {avatarUrl && !selectedFile && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              className="w-full"
            >
              Löschen
            </Button>
          )}
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Abbrechen</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 