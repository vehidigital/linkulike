import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { generateReactHelpers } from '@uploadthing/react';
import type { UploadRouter } from '@/app/api/uploadthing/uploadthingRouter';
const { useUploadThing } = generateReactHelpers<UploadRouter>();
// import { utapi } from '@/lib/uploadthing-server'; // Entfernt
import { Loader2, Camera, X, RotateCcw, CheckCircle } from 'lucide-react';

// Hilfsfunktion: Bild komprimieren
async function compressImage(file: File, maxSize = 512): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (blob) {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        } else {
          reject(new Error('Fehler beim Komprimieren'));
        }
      }, 'image/jpeg', 0.9);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Hilfsfunktion: Cropping
function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
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
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    image.onerror = reject;
  });
}

// UUID v4 Polyfill (funktioniert überall)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function AvatarUpload({
  avatarUrl,
  onUpload,
  onDelete,
  shape = 'circle',
  userId,
}: {
  avatarUrl?: string;
  onUpload: (url: string) => void;
  onDelete: () => void;
  shape?: 'circle' | 'rectangle';
  userId: string;
}) {
  const { startUpload, isUploading } = useUploadThing('avatar');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rotation, setRotation] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Aspect Ratio Auswahl
  const [aspect, setAspect] = useState<number>(1); // Default: Quadrat
  // Vorschau-Format für CSS
  const aspectClass = aspect === 3 ? 'aspect-[3/1]' : aspect === 2 ? 'aspect-[2/1]' : 'aspect-square';

  React.useEffect(() => {
    setPreviewUrl(null);
  }, [avatarUrl]);

  // Drag & Drop & Klick auf Avatar
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setError(null);
    try {
      const compressed = await compressImage(acceptedFiles[0]);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(compressed);
    } catch (e) {
      setError('Fehler beim Verarbeiten der Datei');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    // Entferne noClick/noKeyboard, damit Dropzone-Click funktioniert
  });

  // Cropping fertig
  const handleCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Cropping mit Rotation
  function getCroppedImgWithRotation(imageSrc: string, pixelCrop: any, rotation: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.crossOrigin = 'anonymous';
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Set canvas size to crop size
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        // Translate to center, rotate, translate back
        ctx?.translate(canvas.width / 2, canvas.height / 2);
        ctx?.rotate((rotation * Math.PI) / 180);
        ctx?.translate(-canvas.width / 2, -canvas.height / 2);
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
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      image.onerror = reject;
    });
  }

  // Upload nach Cropping
  const handleSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return;
    setLoading(true);
    setError(null);
    try {
      const croppedDataUrl = await getCroppedImgWithRotation(selectedImage, croppedAreaPixels, rotation);
      const croppedBlob = await (await fetch(croppedDataUrl)).blob();
      // NEU: Dateiname mit userId-Struktur
      const croppedFile = new File([croppedBlob], `user_${userId}/avatar_${uuidv4()}.jpg`, { type: 'image/jpeg' });
      const uploaded = await startUpload([croppedFile]);
      if (uploaded && uploaded[0]?.url) {
        setPreviewUrl(uploaded[0].url); // Sofortiges Preview
        onUpload(uploaded[0].url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1500);
      }
      setShowCropper(false);
      setSelectedImage(null);
      setRotation(0);
    } catch (e) {
      setError('Fehler beim Upload');
    } finally {
      setLoading(false);
    }
  };

  // Avatar löschen (inkl. UploadThing)
  const handleDelete = async () => {
    if (!avatarUrl) return;
    setLoading(true);
    setError(null);
    try {
      // Extrahiere File-Key aus URL
      const fileKey = avatarUrl.split('/').pop();
      if (fileKey) {
        await fetch('/api/uploadthing/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKeys: [fileKey] }),
        });
      }
      onDelete();
      setSelectedImage(null);
      setShowCropper(false);
      setRotation(0);
      setPreviewUrl(null);
    } catch (e) {
      setError('Fehler beim Löschen');
    } finally {
      setLoading(false);
    }
  };

  // Avatar klickbar machen (immer aktiv, auch wenn kein Bild)
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      open();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      // Erzeuge Pfad mit User-Ordner
      const ext = file.name.split('.').pop() || 'jpg';
      const randomName = `user_${userId}/avatar_${uuidv4()}.${ext}`;
      const renamedFile = new File([file], randomName, { type: file.type });
      const uploaded = await startUpload([renamedFile]);
      if (uploaded && uploaded[0]?.url) {
        setPreviewUrl(uploaded[0].url);
        onUpload(uploaded[0].url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1500);
      }
    } catch (e) {
      setError('Fehler beim Upload');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Seitenverhältnis-Auswahl */}
      <div className="flex gap-2 mb-2 items-center">
        <span className="text-xs text-gray-500">Seitenverhältnis:</span>
        <button type="button" onClick={() => setAspect(1)} className={`px-2 py-1 rounded border text-xs font-medium ${aspect === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}>1:1</button>
        <button type="button" onClick={() => setAspect(3)} className={`px-2 py-1 rounded border text-xs font-medium ${aspect === 3 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}>3:1</button>
        <button type="button" onClick={() => setAspect(2)} className={`px-2 py-1 rounded border text-xs font-medium ${aspect === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}>2:1</button>
        <span className="ml-2 text-xs text-gray-400">Für Firmenlogos empfehlen wir 3:1 oder 2:1</span>
      </div>
      <div
        {...getRootProps()}
        className={`relative group w-32 ${aspectClass} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} border-2 border-dashed flex items-center justify-center bg-gray-100 cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        tabIndex={0}
        onClick={handleAvatarClick}
        aria-label="Avatar hochladen"
      >
        {previewUrl || avatarUrl ? (
          <img
            src={previewUrl || avatarUrl}
            alt="Avatar"
            className={`w-full h-full object-cover ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
            style={aspect !== 1 ? { aspectRatio: `${aspect}/1` } : {}}
          />
        ) : (
          <Camera className="w-16 h-16 text-gray-400" />
        )}
        {/* Löschen-Button nur beim Hover sichtbar */}
        {avatarUrl && (
          <button
            onClick={e => { e.stopPropagation(); handleDelete(); }}
            className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100 opacity-0 group-hover:opacity-100 transition"
            disabled={loading}
            aria-label="Avatar löschen"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        )}
        <input {...getInputProps()} ref={fileInputRef} className="hidden" />
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-green-100/80">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 text-center mt-1">
        {isDragActive ? 'Datei hier ablegen...' : 'Klicke auf das Bild oder ziehe eine Datei hierher'}<br />
        <span className="text-[10px]">JPG, PNG, WebP • Max. 10MB</span>
      </div>
      {/* Cropping-Dialog */}
      {showCropper && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[350px] max-w-[90vw] max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-2">Avatar zuschneiden</h3>
            <div className={`relative w-56 ${aspect === 3 ? 'aspect-[3/1]' : aspect === 2 ? 'aspect-[2/1]' : 'aspect-square'} bg-gray-100 overflow-hidden mb-4 mx-auto ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={shape === 'circle' ? 'round' : 'rect'}
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                minZoom={0.5}
                maxZoom={3}
                rotation={rotation}
              />
            </div>
            {/* Zoom-Slider und Rotieren */}
            <div className="flex items-center gap-4 mb-2">
              <label className="text-xs text-gray-500">Zoom</label>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-xs text-gray-700">{zoom.toFixed(2)}x</span>
              <Button type="button" variant="outline" size="icon" onClick={() => setRotation(r => (r + 90) % 360)} title="90° drehen">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <span className="text-xs text-gray-500">{rotation}°</span>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => { setShowCropper(false); setSelectedImage(null); setRotation(0); }} disabled={loading}>
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />} Speichern
              </Button>
            </div>
            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          </div>
        </div>
      )}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
} 