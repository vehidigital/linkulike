import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateReactHelpers } from '@uploadthing/react';
import type { UploadRouter } from '@/app/api/uploadthing/uploadthingRouter';
const { useUploadThing } = generateReactHelpers<UploadRouter>();
import { Loader2, Image as ImageIcon, X } from 'lucide-react';

export const BackgroundUpload = ({
  backgroundUrl,
  onUpload,
  onDelete,
  shape = 'rectangle',
  userId,
}: {
  backgroundUrl?: string;
  onUpload: (url: string) => void;
  onDelete: () => void;
  shape?: 'circle' | 'rectangle';
  userId: string;
}) => {
  const { startUpload } = useUploadThing('background');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreviewUrl(null);
  }, [backgroundUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      // Erzeuge Pfad mit User-Ordner
      const ext = file.name.split('.').pop() || 'jpg';
      const randomName = `user_${userId}/background_${crypto.randomUUID()}.${ext}`;
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

  const handleDelete = async () => {
    if (backgroundUrl) {
      const fileKey = backgroundUrl.split('/').pop();
      if (fileKey) {
        await fetch('/api/uploadthing/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKeys: [fileKey] }),
        });
      }
    }
    setPreviewUrl(null);
    onDelete();
  };

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[400px] mx-auto">
      <div
        className="relative group w-full max-w-[400px] max-h-[250px] aspect-[16/9] rounded-xl shadow bg-gray-100 border-2 border-dashed flex items-center justify-center cursor-pointer transition-all border-gray-300"
        tabIndex={0}
        aria-label="Hintergrundbild hochladen"
        style={{ pointerEvents: 'auto' }}
        onClick={handleCardClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {previewUrl || backgroundUrl ? (
          <>
            <img
              src={previewUrl || backgroundUrl}
              alt="Background"
              className="w-full h-full object-cover rounded-xl"
              style={{ maxHeight: '250px' }}
            />
            {/* Overlay-Gradient unten */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/30 to-transparent rounded-b-xl pointer-events-none" />
            {/* Edit/Delete Buttons als Row, immer sichtbar */}
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="bg-white/80 border border-gray-300 rounded-full p-1 shadow hover:bg-blue-100 transition"
                aria-label="Hintergrundbild ersetzen"
                tabIndex={-1}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414 1.414-4.243a4 4 0 01.828-1.414z"></path></svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(); }}
                className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100 transition"
                disabled={loading}
                aria-label="Hintergrundbild löschen"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </>
        ) : success ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-600 mb-2"><path d="M9 12l2 2l4 -4" /><circle cx="12" cy="12" r="10" /></svg>
          </div>
        ) : (
          <ImageIcon className="w-16 h-16 text-gray-400" style={{ cursor: 'pointer' }} />
        )}
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 text-center mt-1">
        Klicke auf das Bild oder ziehe eine Datei hierher<br />
        <span className="text-[10px]">JPG, PNG, WebP • Max. 20MB</span>
      </div>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}; 