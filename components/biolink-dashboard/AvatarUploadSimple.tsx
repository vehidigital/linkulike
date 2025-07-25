import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Edit2 } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';

export function AvatarUploadSimple({
  avatarUrl,
  onUpload,
  userId,
  initialShape = 'circle',
  initialBorderColor = '#e5e7eb',
}: {
  avatarUrl?: string;
  onUpload: (url: string, borderColor?: string) => void;
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
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Hier sollte deine Upload-API aufgerufen werden:
      // const uploadedUrl = await uploadFile(renamedFile);
      // Demo: Zeige einfach die Vorschau
      setTimeout(() => {
        setLoading(false);
        onUpload(previewUrl!, borderColor);
      }, 1000);
    } catch (e) {
      setError('Fehler beim Upload');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      <div className="flex gap-4 items-center">
        <span className="text-xs text-gray-500">Format:</span>
        <button type="button" onClick={() => setShape('circle')} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all ${shape === 'circle' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'}`}>O</button>
        <button type="button" onClick={() => setShape('rectangle')} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${shape === 'rectangle' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'}`}>▭</button>
      </div>
      <div className="flex gap-4 items-center">
        <span className="text-xs text-gray-500">Randfarbe:</span>
        <ColorPicker value={borderColor} onChange={setBorderColor} variant="bubble" size="md" />
        <span className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ background: borderColor }} />
      </div>
      <div className={`relative w-32 h-32 flex items-center justify-center mb-2 overflow-hidden ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} border-4`} style={{ borderColor }}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar Preview"
            className="absolute left-1/2 top-1/2"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: `translate(-50%, -50%) scale(${zoom})`
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
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
        className="w-full"
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
          onClick={() => onUpload('', borderColor)}
          className="w-full"
        >
          Löschen
        </Button>
      )}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
} 