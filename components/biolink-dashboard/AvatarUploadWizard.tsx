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
import { Loader2, Edit2, X } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';
import Cropper from 'react-easy-crop';
import { generateReactHelpers } from '@uploadthing/react';
import type { UploadRouter } from '@/app/api/uploadthing/uploadthingRouter';
const { useUploadThing } = generateReactHelpers<UploadRouter>();

// Hilfsfunktion zum Löschen bei UploadThing
async function deleteFromUploadThing(url: string) {
  if (!url) return;
  const fileKey = url.split('/').pop();
  if (fileKey) {
    await fetch('/api/uploadthing/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileKeys: [fileKey] }),
    });
  }
}

export function AvatarUploadWizard({
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
  const { startUpload } = useUploadThing('avatar');
  const [step, setStep] = useState(1);
  const [shape, setShape] = useState<'circle' | 'rectangle'>(initialShape);
  const [borderColor, setBorderColor] = useState<string>(initialBorderColor || '#e5e7eb');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl || null);

  // Reset modal state when it opens/closes
  React.useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedFile(null);
      setPreviewUrl(avatarUrl || null);
      setError(null);
      setLoading(false);
    }
  }, [open, avatarUrl]);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperSize = 288; // w-72/h-72 = 288px
  const [minZoom, setMinZoom] = useState(1);

  // Dynamische minZoom-Berechnung nach Bild-Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep(2);
    // Bild laden und Format vorschlagen + minZoom berechnen
    const img = new window.Image();
    img.onload = () => {
      if (img.width > img.height * 1.2) {
        setShape('rectangle');
      } else {
        setShape('circle');
      }
      // minZoom so berechnen, dass der Cropper immer ausgefüllt ist
      let minZoomCalc = Math.max(
        cropperSize / img.width,
        cropperSize / img.height,
        1
      );
      minZoomCalc = minZoomCalc * 1.02; // 2% mehr für Spielraum
      setMinZoom(minZoomCalc);
      setZoom(minZoomCalc);
      setCrop({ x: 0, y: 0 }); // zentriert
    };
    img.src = url;
  };

  // Cropping fertig
  const onCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  // Schritt 3: Upload mit Cropping
  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels) return;
    setLoading(true);
    setError(null);
    try {
      // Vor Upload: Altes Avatar löschen, falls vorhanden
      if (avatarUrl) {
        await deleteFromUploadThing(avatarUrl);
      }
      // Cropping anwenden
      const croppedDataUrl = await getCroppedImg(previewUrl!, croppedAreaPixels, 0.8); // Komprimierung auf 80%
      const croppedBlob = await (await fetch(croppedDataUrl)).blob();
      const ext = selectedFile.name.split('.').pop() || 'jpg';
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      const randomName = `user_${userId}/avatar_${uuid}.${ext}`;
      const croppedFile = new File([croppedBlob], randomName, { type: croppedBlob.type || selectedFile.type });
      const uploaded = await startUpload([croppedFile]);
      if (uploaded && uploaded[0]?.url) {
        setLoading(false);
        setPreviewUrl(uploaded[0].url); // Preview auf echte URL setzen
        console.log('Avatar-Upload-URL:', uploaded[0].url);
        onUpload(uploaded[0].url, borderColor);
        onOpenChange(false);
      } else {
        setLoading(false);
        setError('Fehler beim Upload: Keine URL erhalten');
      }
    } catch (e) {
      setError('Fehler beim Upload');
      setLoading(false);
    }
  };

  // Hilfsfunktion: Cropping auf DataURL anwenden (mit Komprimierung)
  async function getCroppedImg(imageSrc: string, pixelCrop: any, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.crossOrigin = 'anonymous';
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );
        resolve(canvas.toDataURL('image/jpeg', quality)); // Komprimierung
      };
      image.onerror = reject;
    });
  }

  // Wizard-UI
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        // Reset state when modal is closed
        setStep(1);
        setSelectedFile(null);
        setPreviewUrl(avatarUrl || null);
        setError(null);
        setLoading(false);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-pink-600" />
            </div>
            Avatar/Logo hochladen
          </DialogTitle>
          <DialogDescription>
            Lade ein Profilbild oder Firmenlogo hoch. Folge den Schritten für das beste Ergebnis.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6">
          {step === 1 && (
            <>
              <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-full border-2 border-dashed border-gray-300 mb-2 relative group cursor-pointer hover:border-gray-400 transition-colors" onClick={() => fileInputRef.current?.click()}>
                {avatarUrl ? (
                  <>
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover rounded-full" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Edit2 className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Edit2 className="w-12 h-12 text-gray-400" />
                    <span className="text-sm text-gray-500">Klicken zum Hochladen</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-full space-y-3">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Neues Bild auswählen
                </Button>
                {avatarUrl && (
                  <Button type="button" variant="destructive" onClick={async () => {
                    await deleteFromUploadThing(avatarUrl);
                    onDelete();
                    onOpenChange(false);
                  }} className="w-full">
                    <X className="w-4 h-4 mr-2" />
                    Aktuelles Bild entfernen
                  </Button>
                )}
              </div>
            </>
          )}
          {step === 2 && previewUrl && (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-72 h-72 bg-gray-100 rounded-lg overflow-hidden border-4" style={{ borderColor, pointerEvents: 'auto' }}>
                  <Cropper
                    image={previewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape={shape === 'circle' ? 'round' : 'rect'}
                    showGrid={true}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    minZoom={minZoom}
                    maxZoom={3}
                  />
                </div>
                <div className="flex items-center gap-3 w-64 mt-3">
                  <span className="text-xs text-gray-500 font-medium">Zoom</span>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={e => setZoom(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-xs text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">{zoom.toFixed(2)}x</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Ziehe das Bild, um den Ausschnitt zu wählen.</div>
                <div className="flex gap-4 items-center mt-2">
                  <span className="text-xs text-gray-500 font-medium">Format:</span>
                  <button type="button" onClick={() => setShape('circle')} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all hover:scale-105 ${shape === 'circle' ? 'border-pink-500 bg-pink-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>O</button>
                  <button type="button" onClick={() => setShape('rectangle')} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all hover:scale-105 ${shape === 'rectangle' ? 'border-pink-500 bg-pink-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>▭</button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <div className="text-xs text-blue-700 text-center">
                    <strong>Tipp:</strong> Für Fotos kannst du den optimalen Bildausschnitt wählen. Für Logos empfiehlt sich ein zentrales, quadratisches Logo – sehr breite oder schmale Logos werden beschnitten.
                  </div>
                </div>
                <div className="flex gap-3 mt-6 w-full">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Zurück
                  </Button>
                  <Button type="button" onClick={handleUpload} disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Speichern...
                      </>
                    ) : (
                      'Speichern'
                    )}
                  </Button>
                  {avatarUrl && (
                    <Button type="button" variant="destructive" onClick={async () => {
                      await deleteFromUploadThing(avatarUrl);
                      onDelete();
                      onOpenChange(false);
                    }} className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Entfernen
                    </Button>
                  )}
                </div>
                {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
              </div>
            </>
          )}
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