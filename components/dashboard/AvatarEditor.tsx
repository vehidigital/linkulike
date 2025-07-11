import React, { useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface AvatarEditorProps {
  image: string | null;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
  isUploading?: boolean; // NEU: Upload-Status für Modal-Spinner
  onRemove?: () => void; // NEU: Avatar entfernen
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous"; // WICHTIG: Verhindert "tainted canvas" Fehler
    image.src = imageSrc;
    image.onload = () => {
      const rad = getRadianAngle(rotation);

      // calculate bounding box of the rotated image
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const newWidth = image.width * cos + image.height * sin;
      const newHeight = image.width * sin + image.height * cos;

      // create a canvas that will fit the rotated image
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');

      // move the origin to the center of the canvas
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(rad);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);

      // get the cropped image from the rotated image
      const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
      );

      // set canvas to the desired crop size
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // paste the cropped image
      ctx.putImageData(data, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    image.onerror = reject;
  });
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({ image, onCropComplete, onCancel, isUploading, onRemove }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropCompleteCb = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!localImage || !croppedAreaPixels) return;
    setLoading(true);
    const croppedImg = await getCroppedImg(localImage, croppedAreaPixels, rotation);
    setLoading(false);
    onCropComplete(croppedImg);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageData = ev.target?.result as string;
      setLocalImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[350px] flex flex-col items-center relative">
        {/* Upload-Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 rounded-lg">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span className="mt-3 text-sm text-gray-700 font-medium">Avatar wird gespeichert...</span>
          </div>
        )}
        {/* Neues Foto hochladen */}
        <button
          type="button"
          className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded shadow hover:bg-gray-200 transition"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          Neues Foto hochladen
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {/* Cropper & Controls nur wenn Bild vorhanden */}
        {localImage && (
          <>
            <div className="relative w-60 h-60 bg-gray-100 rounded-full overflow-hidden">
              <Cropper
                image={localImage}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropCompleteCb}
                minZoom={1}
                maxZoom={3}
              />
            </div>
            <div className="flex flex-col gap-2 w-full mt-4">
              <label className="text-xs">Zoom</label>
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} disabled={isUploading} />
              <label className="text-xs mt-2">Rotation</label>
              <input type="range" min={0} max={360} step={1} value={rotation} onChange={e => setRotation(Number(e.target.value))} disabled={isUploading} />
            </div>
          </>
        )}
        <div className="flex gap-4 mt-6 w-full justify-end">
          {onRemove && (
            <button type="button" onClick={onRemove} className="px-3 py-1 rounded bg-red-100 text-red-700 text-sm mr-auto" disabled={isUploading}>Bild entfernen</button>
          )}
          <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-sm" disabled={isUploading}>Abbrechen</button>
          <button type="button" onClick={handleDone} className="px-4 py-1 rounded bg-black text-white text-sm font-semibold" disabled={loading || isUploading || !localImage}>{loading ? 'Speichern...' : 'Speichern'}</button>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor; 