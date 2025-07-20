import React, { useState, useRef } from "react";
import AvatarEditor from "@/components/dashboard/AvatarEditor";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import imageCompression from 'browser-image-compression';

interface AvatarUploadFlowProps {
  initialAvatarUrl?: string;
  initialOriginalAvatarUrl?: string;
  onAvatarChange?: (avatarUrl: string, originalAvatarUrl: string) => void;
  onClose: () => void;
  userId?: string; // NEU: userId als Prop
}

type Step = 'start' | 'crop' | 'preview';

// Hilfsfunktion für UUID
function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: RFC4122 v4 compliant UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
// Hilfsfunktion für Dateinamen
function generateAvatarFileName(type: 'ORIGINAL' | 'CROPPED') {
  const hash = generateUUID();
  return `LIKEULIKE_${type}_${hash}.jpg`;
}

const AvatarUploadFlow: React.FC<AvatarUploadFlowProps> = ({ initialAvatarUrl, initialOriginalAvatarUrl, onAvatarChange, onClose, userId }) => {
  const [step, setStep] = useState<Step>('start');
  const [isUploading, setIsUploading] = useState(false);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | undefined>(initialOriginalAvatarUrl);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatarUrl);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { startUpload } = useUploadThing("avatar");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. User wählt Bild aus → Original zu Uploadthing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('[AvatarUploadFlow] handleFileChange: file', file);
    if (!file) {
      toast({ title: 'Fehler', description: 'Kein Bild ausgewählt.', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    try {
      // Komprimierung
      let compressedFile;
      try {
        compressedFile = await imageCompression(file, {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          initialQuality: 0.85,
        });
      } catch (err) {
        toast({ title: 'Fehler', description: 'Bildkomprimierung fehlgeschlagen.', variant: 'destructive' });
        console.error('[AvatarUploadFlow] Komprimierung fehlgeschlagen', err);
        setIsUploading(false);
        return;
      }
      console.log('[AvatarUploadFlow] compressedFile', compressedFile);
      if (!compressedFile) {
        toast({ title: 'Fehler', description: 'Komprimiertes Bild ist leer.', variant: 'destructive' });
        setIsUploading(false);
        return;
      }
      const fileName = generateAvatarFileName('ORIGINAL');
      console.log('[AvatarUploadFlow] userId:', userId, 'fileName:', fileName);
      const uploadFile = new File([compressedFile], fileName, { type: 'image/jpeg' });
      console.log('[AvatarUploadFlow] uploadFile', uploadFile);
      if (!uploadFile || uploadFile.size === 0) {
        toast({ title: 'Fehler', description: 'Upload-Datei ist leer oder ungültig.', variant: 'destructive' });
        setIsUploading(false);
        return;
      }
      const uploadRes = await startUpload([uploadFile]);
      console.log('[AvatarUploadFlow] uploadRes', uploadRes);
      if (uploadRes && uploadRes.length > 0) {
        const url = uploadRes[0].url;
        console.log('[AvatarUploadFlow] upload url', url);
        setOriginalAvatarUrl(url);
        setSelectedImage(url);
        setStep('crop');
        if (onAvatarChange) onAvatarChange(avatarUrl || url, url);
        fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ originalAvatarUrl: url }),
        }).catch(() => toast({ title: "Fehler", description: "Original konnte nicht gespeichert werden.", variant: "destructive" }));
        toast({ title: "Upload erfolgreich", description: "Bild wurde hochgeladen.", variant: "default" });
      } else {
        toast({ title: "Fehler", description: "Upload fehlgeschlagen.", variant: "destructive" });
        console.error('[AvatarUploadFlow] Upload fehlgeschlagen', uploadRes);
      }
    } catch (error) {
      toast({ title: "Fehler", description: "Upload fehlgeschlagen.", variant: "destructive" });
      console.error('[AvatarUploadFlow] Fehler beim Upload', error);
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Nach Croppen → Vorschau sofort anzeigen
  const handleCropComplete = async (croppedDataUrl: string) => {
    setCroppedPreview(croppedDataUrl);
    setStep('preview');
  };

  // 3. Speichern des Cropped-Bildes
  const handleSaveCropped = async () => {
    if (!croppedPreview) return;
    setIsUploading(true);
    try {
      const blob = await (await fetch(croppedPreview)).blob();
      // Blob in File umwandeln
      const tempFile = new File([blob], 'temp.jpg', { type: 'image/jpeg' });
      // Komprimierung
      const compressedFile = await imageCompression(tempFile, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        initialQuality: 0.85,
      });
      const fileName = generateAvatarFileName('CROPPED');
      const file = new File([compressedFile], fileName, { type: 'image/jpeg' });
      const uploadRes = await startUpload([file]);
      if (uploadRes && uploadRes.length > 0) {
        const url = uploadRes[0].url;
        setAvatarUrl(url);
        if (onAvatarChange) onAvatarChange(url, originalAvatarUrl || "");
        fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: url }),
        }).catch(() => toast({ title: "Fehler", description: "Avatar konnte nicht gespeichert werden.", variant: "destructive" }));
        toast({ title: "Avatar gespeichert", description: "Dein neuer Avatar wurde gespeichert.", variant: "default" });
        onClose(); // Modal direkt schließen
      } else {
        toast({ title: "Fehler", description: "Upload des Avatars fehlgeschlagen.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fehler", description: "Upload oder Speicherung fehlgeschlagen.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Original wiederherstellen
  const handleRestoreOriginal = async () => {
    if (!originalAvatarUrl) return;
    setAvatarUrl(originalAvatarUrl);
    setCroppedPreview(null);
    setStep('start');
    // Optimistic UI: Avatar sofort anzeigen
    if (onAvatarChange) onAvatarChange(originalAvatarUrl, originalAvatarUrl);
    // Backend-Update asynchron
    fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: originalAvatarUrl }),
    }).catch(() => toast({ title: "Fehler", description: "Konnte Original nicht wiederherstellen.", variant: "destructive" }));
    toast({ title: "Original wiederhergestellt", description: "Das Originalbild ist jetzt dein Avatar." });
  };

  // 5. UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-all animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] flex flex-col items-center relative animate-fade-in">
        {/* Ladeindikator als Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 rounded-2xl">
            <svg className="animate-spin h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span className="mt-4 text-base text-gray-700 font-medium">Wird gespeichert...</span>
          </div>
        )}
        {step === 'start' && (
          <>
            <div className="flex flex-col items-center gap-4 mb-6">
              <img
                src={selectedImage || avatarUrl || originalAvatarUrl || "/avatar-placeholder.png"}
                alt="Avatar Preview"
                className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
              />
              <div className="flex gap-3 mt-2 w-full justify-center flex-wrap">
                <button
                  type="button"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition text-base shadow"
                  style={{ minWidth: 160, textAlign: 'center' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Neues Foto hochladen
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
                {(avatarUrl || originalAvatarUrl) && (
                  <button
                    className="px-5 py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition text-base shadow"
                    onClick={() => {
                      if (originalAvatarUrl) {
                        setSelectedImage(originalAvatarUrl);
                      } else if (avatarUrl) {
                        setSelectedImage(avatarUrl);
                      } else {
                        setSelectedImage("");
                      }
                      setStep('crop');
                    }}
                    disabled={isUploading}
                    style={{ minWidth: 160 }}
                  >
                    Bearbeiten
                  </button>
                )}
                {originalAvatarUrl && avatarUrl && avatarUrl !== originalAvatarUrl && (
                  <button
                    className="px-5 py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition text-base shadow"
                    onClick={handleRestoreOriginal}
                    disabled={isUploading}
                    style={{ minWidth: 160 }}
                  >
                    Originalbild wiederherstellen
                  </button>
                )}
              </div>
            </div>
            <button onClick={onClose} className="mt-2 px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold text-base shadow hover:bg-gray-300 transition">Abbrechen</button>
          </>
        )}
        {step === 'crop' && selectedImage && (
          <div className="w-full flex flex-col items-center">
            <AvatarEditor
              image={selectedImage}
              onCropComplete={handleCropComplete}
              onCancel={onClose}
              isUploading={isUploading}
            />
            <div className="flex gap-3 mt-4 w-full justify-center">
              {originalAvatarUrl && selectedImage !== originalAvatarUrl && (
                <button
                  className="px-5 py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition text-base shadow"
                  onClick={() => setSelectedImage(originalAvatarUrl)}
                  disabled={isUploading}
                  style={{ minWidth: 160 }}
                >
                  Originalbild wiederherstellen
                </button>
              )}
              <button
                className="px-5 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition text-base shadow"
                onClick={onClose}
                disabled={isUploading}
                style={{ minWidth: 160 }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
        {step === 'preview' && croppedPreview && (
          <>
            <div className="flex flex-col items-center gap-4 mb-6">
              <img
                src={croppedPreview}
                alt="Avatar Vorschau"
                className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
              />
              <div className="flex gap-3 mt-2 w-full justify-center">
                <button
                  className="px-5 py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition text-base shadow"
                  onClick={() => { setStep('crop'); }}
                  disabled={isUploading}
                  style={{ minWidth: 160 }}
                >
                  Nochmal bearbeiten
                </button>
                <button
                  className="px-5 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition text-base shadow"
                  onClick={handleSaveCropped}
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

export default AvatarUploadFlow; 