import React, { useRef, useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import type { Area } from 'react-easy-crop';

// Hilfsfunktion für Cropping (Canvas-Export) für beliebiges Seitenverhältnis
async function getCroppedImgForAspect(imageSrc: string, crop: Area, rotation = 0, aspect: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      // Berechne Zielgröße basierend auf gewünschtem Seitenverhältnis
      let width = crop.width;
      let height = crop.height;
      if (width / height > aspect) {
        width = height * aspect;
      } else {
        height = width / aspect;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        width,
        height,
        0,
        0,
        width,
        height
      );
      ctx.restore();
      canvas.toBlob((blob) => {
        if (!blob) return reject('Canvas is empty');
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, 'image/jpeg', 0.92);
    };
    image.onerror = () => reject('Image load error');
  });
}

interface BackgroundUploadFlowProps {
  initialBackgroundUrl?: string;
  onBackgroundChange: (url: string, isPreview?: boolean) => void;
  onClose: () => void;
}

const ASPECT = 16 / 9;

const BackgroundUploadFlow: React.FC<BackgroundUploadFlowProps> = ({ initialBackgroundUrl, onBackgroundChange, onClose }) => {
  const [step, setStep] = useState<'start' | 'edit' | 'preview'>('start');
  const [isUploading, setIsUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(initialBackgroundUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("avatar"); // Reuse avatar endpoint for now

  // Tabs für Desktop/Mobile
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  // Crop-States für beide Ansichten
  const [desktopCrop, setDesktopCrop] = useState({ crop: { x: 0, y: 0 }, zoom: 1, rotation: 0, croppedAreaPixels: null as Area | null });
  const [mobileCrop, setMobileCrop] = useState({ crop: { x: 0, y: 0 }, zoom: 1, rotation: 0, croppedAreaPixels: null as Area | null });

  // Aktuelle Crop-States je nach Tab
  const crop = activeTab === 'desktop' ? desktopCrop.crop : mobileCrop.crop;
  const zoom = activeTab === 'desktop' ? desktopCrop.zoom : mobileCrop.zoom;
  const rotation = activeTab === 'desktop' ? desktopCrop.rotation : mobileCrop.rotation;
  const croppedAreaPixels = activeTab === 'desktop' ? desktopCrop.croppedAreaPixels : mobileCrop.croppedAreaPixels;
  const setCrop = (val: any) => activeTab === 'desktop' ? setDesktopCrop(s => ({ ...s, crop: val })) : setMobileCrop(s => ({ ...s, crop: val }));
  const setZoom = (val: number) => activeTab === 'desktop' ? setDesktopCrop(s => ({ ...s, zoom: val })) : setMobileCrop(s => ({ ...s, zoom: val }));
  const setRotation = (val: number) => activeTab === 'desktop' ? setDesktopCrop(s => ({ ...s, rotation: val })) : setMobileCrop(s => ({ ...s, rotation: val }));
  const setCroppedAreaPixels = (val: Area) => activeTab === 'desktop' ? setDesktopCrop(s => ({ ...s, croppedAreaPixels: val })) : setMobileCrop(s => ({ ...s, croppedAreaPixels: val }));

  // onCropComplete für beide Ansichten
  const onCropComplete = useCallback((_: Area, cropped: Area) => setCroppedAreaPixels(cropped), [activeTab]);

  // Cropped-Image erzeugen für Preview (optional)
  const updateDualPreview = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const desktop = await getCroppedImgForAspect(imageSrc, croppedAreaPixels, rotation, 16/9);
    const mobile = await getCroppedImgForAspect(imageSrc, croppedAreaPixels, rotation, 9/16);
    // setDesktopPreview(desktop); // This state is no longer needed
    // setMobilePreview(mobile); // This state is no longer needed
  }, [imageSrc, croppedAreaPixels, rotation]);
  // Aktualisiere Dual-Preview bei Crop/Zoom/Rotation
  useEffect(() => { updateDualPreview(); }, [updateDualPreview]);

  // Upload zu Uploadthing
  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsUploading(true);
    try {
      const res = await fetch(imageSrc || ''); // Assuming imageSrc is the full URL of the original image
      const blob = await res.blob();
      const file = new File([blob], 'background.jpg', { type: 'image/jpeg' });
      const uploadRes = await startUpload([file]);
      if (uploadRes && uploadRes.length > 0) {
        const url = uploadRes[0].url;
        onBackgroundChange(url, false);
        toast({ title: "Upload erfolgreich", description: "Hintergrundbild wurde gespeichert.", variant: "default" });
        onClose();
      } else {
        toast({ title: "Fehler", description: "Upload fehlgeschlagen.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fehler", description: "Upload fehlgeschlagen.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  // Bild entfernen
  const handleRemove = () => {
    setImageSrc(undefined);
    // setCroppedImage(null); // This state is no longer needed
    setStep('start');
    onBackgroundChange("");
  };

  // Bild auswählen
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
      setStep('edit');
    });
    reader.readAsDataURL(file);
  };

  // UI: Tabs + Cropper
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-all animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[700px] flex flex-col items-center relative animate-fade-in">
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 rounded-2xl">
            <svg className="animate-spin h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span className="mt-4 text-base text-gray-700 font-medium">Wird gespeichert...</span>
          </div>
        )}
        {step === 'start' && (
          <>
            <div className="flex flex-col items-center gap-4 mb-6">
              {imageSrc ? (
                <img
                  src={imageSrc || ''}
                  alt="Hintergrundbild Vorschau"
                  className="w-80 h-44 object-cover rounded-xl border shadow"
                />
              ) : (
                <div className="w-80 h-44 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border">
                  Kein Bild ausgewählt
                </div>
              )}
              <button
                type="button"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition text-base shadow"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{ minWidth: 180, textAlign: 'center' }}
              >
                Neues Hintergrundbild hochladen
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
              {imageSrc && (
                <button
                  className="px-5 py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition text-base shadow"
                  onClick={handleRemove}
                  disabled={isUploading}
                  style={{ minWidth: 180 }}
                >
                  Bild entfernen
                </button>
              )}
            </div>
            <button onClick={onClose} className="mt-2 px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold text-base shadow hover:bg-gray-300 transition">Abbrechen</button>
          </>
        )}
        {step === 'edit' && imageSrc && (
          <div className="w-full flex flex-col items-center">
            {/* Tabs */}
            <div className="flex gap-4 mb-4">
              <button className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('desktop')}>Desktop</button>
              <button className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('mobile')}>Mobile</button>
            </div>
            {/* Cropper für aktive Ansicht */}
            <div className="relative w-80 h-44 bg-gray-100 rounded-xl overflow-hidden mb-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={activeTab === 'desktop' ? 16/9 : 9/16}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>
            {/* Zoom & Rotation Controls */}
            <div className="flex gap-6 mb-2 w-full justify-center">
              <label className="flex flex-col items-center">
                <span className="text-xs mb-1">Zoom</span>
                <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} />
              </label>
              <label className="flex flex-col items-center">
                <span className="text-xs mb-1">Rotation</span>
                <input type="range" min={0} max={360} step={1} value={rotation} onChange={e => setRotation(Number(e.target.value))} />
              </label>
            </div>
            {/* Controls */}
            <div className="flex gap-3 mt-4 w-full justify-center">
              <button
                className="px-5 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition text-base shadow"
                onClick={() => setStep('start')}
                disabled={isUploading}
                style={{ minWidth: 160 }}
              >
                Abbrechen
              </button>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-base shadow"
                onClick={handleSave}
                disabled={isUploading || !imageSrc || !croppedAreaPixels}
                style={{ minWidth: 160 }}
              >
                Speichern
              </button>
            </div>
          </div>
        )}
        {step === 'preview' && croppedAreaPixels && (
          <>
            <div className="flex flex-col items-center gap-4 mb-6">
              <img
                src={imageSrc}
                alt="Hintergrundbild Vorschau"
                className="w-80 h-44 object-cover rounded-xl border shadow"
              />
              <div className="flex gap-3 mt-2 w-full justify-center">
                <button
                  className="px-5 py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition text-base shadow"
                  onClick={() => setStep('edit')}
                  disabled={isUploading}
                  style={{ minWidth: 160 }}
                >
                  Nochmal bearbeiten
                </button>
                <button
                  className="px-5 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition text-base shadow"
                  onClick={handleSave}
                  disabled={isUploading}
                  style={{ minWidth: 160 }}
                >
                  Speichern
                </button>
              </div>
            </div>
            <button onClick={onClose} className="mt-2 px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold text-base shadow hover:bg-gray-300 transition">Abbrechen</button>
          </>
        )}
      </div>
    </div>
  );
};

export default BackgroundUploadFlow; 