import React, { useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface AvatarEditorProps {
  image: string | null;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

function getCroppedImg(imageSrc: string, crop: any, rotation = 0, zoom = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');
      const size = Math.min(image.width, image.height);
      canvas.width = size;
      canvas.height = size;
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(
        image,
        -image.width / 2,
        -image.height / 2
      );
      ctx.restore();
      const dataUrl = canvas.toDataURL('image/jpeg');
      resolve(dataUrl);
    };
    image.onerror = reject;
  });
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onCropCompleteCb = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!image || !croppedAreaPixels) return;
    setLoading(true);
    const croppedImg = await getCroppedImg(image, croppedAreaPixels, rotation, zoom);
    setLoading(false);
    onCropComplete(croppedImg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[350px] flex flex-col items-center">
        <div className="relative w-60 h-60 bg-gray-100 rounded-full overflow-hidden">
          {image && (
            <Cropper
              image={image}
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
          )}
        </div>
        <div className="flex flex-col gap-2 w-full mt-4">
          <label className="text-xs">Zoom</label>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} />
          <label className="text-xs mt-2">Rotation</label>
          <input type="range" min={0} max={360} step={1} value={rotation} onChange={e => setRotation(Number(e.target.value))} />
        </div>
        <div className="flex gap-4 mt-6 w-full justify-end">
          <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-sm">Abbrechen</button>
          <button type="button" onClick={handleDone} className="px-4 py-1 rounded bg-black text-white text-sm font-semibold" disabled={loading}>{loading ? 'Speichern...' : 'Speichern'}</button>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor; 