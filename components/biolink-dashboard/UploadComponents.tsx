'use client'

import React, { useCallback, useState, useRef, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Crop, RotateCcw, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadThing } from '@/lib/uploadthing'
import { useDesign } from './DesignContext'
import Cropper from 'react-easy-crop'
import { ColorPicker } from '@/components/ui/color-picker'



// ColorPickerBubble is now replaced with the new ColorPicker component

interface UploadAvatarProps {
  onUploadComplete?: (url: string) => void
}

interface UploadBackgroundProps {
  onUploadComplete?: (url: string) => void
}

// Best Practice: Client-side image compression
const compressImage = async (file: File, options: {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  quality?: number
} = {}): Promise<File> => {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    quality = 0.85
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidthOrHeight) {
          height = (height * maxWidthOrHeight) / width;
          width = maxWidthOrHeight;
        }
      } else {
        if (height > maxWidthOrHeight) {
          width = (width * maxWidthOrHeight) / height;
          height = maxWidthOrHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Best Practice: Utility function to get cropped image
function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const rad = (rotation * Math.PI) / 180;

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

// Best Practice: Enhanced Avatar Cropper with better UX
function AvatarCropper({ 
  image, 
  onCropComplete, 
  onCancel, 
  isUploading,
  avatarShape
}: { 
  image: string; 
  onCropComplete: (url: string) => void; 
  onCancel: () => void; 
  isUploading: boolean;
  avatarShape: 'circle' | 'rectangle';
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropCompleteCb = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) {
      setError('Bitte positioniere das Bild zuerst');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const croppedImg = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(croppedImg);
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Fehler beim Bearbeiten des Bildes');
    } finally {
      setLoading(false);
    }
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[450px] max-w-[90vw] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Avatar positionieren</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetCrop}
            disabled={isUploading}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Zurücksetzen
          </Button>
        </div>
        
        {isUploading && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Avatar wird hochgeladen...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <div className={`relative w-64 h-64 bg-gray-100 overflow-hidden mb-4 mx-auto ${
          avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'
        }`}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape={avatarShape === 'circle' ? 'round' : 'rect'}
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteCb}
            minZoom={0.5}
            maxZoom={3}
          />
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium flex items-center justify-between">
              Zoom
              <span className="text-xs text-gray-500">{zoom.toFixed(1)}x</span>
            </label>
            <input 
              type="range" 
              min={0.5} 
              max={3} 
              step={0.1} 
              value={zoom} 
              onChange={e => setZoom(Number(e.target.value))} 
              disabled={isUploading}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium flex items-center justify-between">
              Rotation
              <span className="text-xs text-gray-500">{rotation}°</span>
            </label>
            <input 
              type="range" 
              min={0} 
              max={360} 
              step={1} 
              value={rotation} 
              onChange={e => setRotation(Number(e.target.value))} 
              disabled={isUploading}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isUploading || loading}>
            Abbrechen
          </Button>
          <Button onClick={handleDone} disabled={loading || isUploading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Speichern
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Best Practice: Enhanced Background Cropper
function BackgroundCropper({ 
  image, 
  onCropComplete, 
  onCancel, 
  isUploading 
}: { 
  image: string; 
  onCropComplete: (url: string) => void; 
  onCancel: () => void; 
  isUploading: boolean;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropCompleteCb = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) {
      setError('Bitte positioniere das Bild zuerst');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const croppedImg = await getCroppedImg(image, croppedAreaPixels, 0);
      onCropComplete(croppedImg);
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Fehler beim Bearbeiten des Bildes');
    } finally {
      setLoading(false);
    }
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Hintergrundbild positionieren</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetCrop}
            disabled={isUploading}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Zurücksetzen
          </Button>
        </div>
        
        {isUploading && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Hintergrundbild wird hochgeladen...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={9/16}
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCb}
            minZoom={0.5}
            maxZoom={3}
          />
        </div>
        
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium flex items-center justify-between">
            Zoom
            <span className="text-xs text-gray-500">{zoom.toFixed(1)}x</span>
          </label>
          <input 
            type="range" 
            min={0.5} 
            max={3} 
            step={0.1} 
            value={zoom} 
            onChange={e => setZoom(Number(e.target.value))} 
            disabled={isUploading}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isUploading || loading}>
            Abbrechen
          </Button>
          <Button onClick={handleDone} disabled={loading || isUploading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Speichern
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Best Practice: Enhanced Upload Avatar with better error handling and UX
export function UploadAvatar({ onUploadComplete }: UploadAvatarProps) {
  const { settings, updateSettings, saveSettings } = useDesign();
  

  const { startUpload, isUploading } = useUploadThing("avatar");
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'processing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    originalSize: number;
    compressedSize: number;
    uploadTime: number;
  } | null>(null);

  // Best Practice: Memoized file validation
  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Nur JPG, PNG, WebP und GIF Dateien sind erlaubt';
    }
    
    if (file.size > maxSize) {
      return 'Datei ist zu groß (max. 10MB)';
    }
    
    return null;
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        // Best Practice: Client-side compression
        const startTime = Date.now();
        const compressedFile = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          quality: 0.85
        });
        
        const reader = new FileReader();
        reader.onload = (ev) => {
          const imageData = ev.target?.result as string;
          setSelectedImage(imageData);
          setShowCropper(true);
          
          // Track upload stats
          setUploadStats({
            originalSize: file.size,
            compressedSize: compressedFile.size,
            uploadTime: Date.now() - startTime
          });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Fehler beim Verarbeiten der Datei');
      }
    },
    [validateFile]
  );

  const handleCropComplete = async (croppedDataUrl: string) => {
    setUploadProgress('uploading');
    setError(null);
    
    try {
      // Check if this is a new upload or editing an existing original
      const isNewUpload = !settings.originalAvatarImage || selectedImage !== settings.originalAvatarImage;
      
      let originalImageUrl = settings.originalAvatarImage;
      
      // Only upload original if it's a new upload
      if (isNewUpload) {
        const originalBlob = await (await fetch(selectedImage!)).blob();
        const originalFile = new File([originalBlob], `avatar_original_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const originalUploaded = await startUpload([originalFile]);
        
        if (!originalUploaded || !originalUploaded[0]) {
          throw new Error('Failed to upload original image');
        }
        
        originalImageUrl = originalUploaded[0].ufsUrl;
        console.log('New original image uploaded:', originalImageUrl);
      } else {
        console.log('Using existing original image:', originalImageUrl);
      }
      
      setUploadProgress('processing');
      
      // Wait a moment to ensure the first upload is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Always upload the cropped image (this replaces the old cropped image)
      const croppedBlob = await (await fetch(croppedDataUrl)).blob();
      const croppedFile = new File([croppedBlob], `avatar_cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const croppedUploaded = await startUpload([croppedFile]);
      
      if (croppedUploaded && croppedUploaded[0]) {
        const croppedImageUrl = croppedUploaded[0].ufsUrl;
        
        // Update settings with new URLs (UploadThing router handles database update)
        updateSettings({ 
          avatarImage: croppedImageUrl,
          originalAvatarImage: originalImageUrl
        });
        onUploadComplete?.(croppedImageUrl);
        
        // Note: UploadThing router already updates the database
        // No need to call saveSettings() here to avoid race conditions
        console.log('Avatar uploaded successfully:', { 
          cropped: croppedImageUrl, 
          original: originalImageUrl,
          isNewUpload 
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError('Fehler beim Upload des Avatars');
    } finally {
      setShowCropper(false);
      setSelectedImage(null);
      setUploadProgress('idle');
      setUploadStats(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0]?.errors[0]?.message;
      setError(error || 'Datei konnte nicht hochgeladen werden');
    }
  });

  const removeAvatar = async () => {
    try {
      // Get userId from URL params
      const pathSegments = window.location.pathname.split('/');
      const userId = pathSegments[1]; // /[userId]/...
      
      const response = await fetch(`/api/user/avatar/delete?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        updateSettings({ 
          avatarImage: '',
          originalAvatarImage: ''
        });
        // Note: Delete API already updates the database
        // No need to call saveSettings() here to avoid race conditions
        console.log('Avatar removed and deleted from UploadThing');
      } else {
        throw new Error('Failed to delete avatar');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      setError('Fehler beim Entfernen des Avatars');
    }
  };

  const restoreOriginal = async () => {
    if (settings.originalAvatarImage && settings.originalAvatarImage !== settings.avatarImage) {
      // Load the original image into the cropper for editing
      setSelectedImage(settings.originalAvatarImage);
      setShowCropper(true);
      console.log('Original avatar loaded for editing');
    }
  };

  const handleAvatarShapeChange = async (shape: 'circle' | 'rectangle') => {
    try {
      console.log('Changing avatar shape to:', shape);
      // Update settings immediately for instant UI feedback
      updateSettings({ avatarShape: shape });
      
      // Get userId from URL params
      const pathSegments = window.location.pathname.split('/');
      const userId = pathSegments[1]; // /[userId]/...
      
      // Save directly to database
      const response = await fetch(`/api/user/design?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          avatarShape: shape
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save avatar shape');
      }

      console.log('Avatar shape saved successfully:', shape);
    } catch (error) {
      console.error('Error changing avatar shape:', error);
      setError('Fehler beim Ändern der Avatar-Form');
    }
  };

  const handleAvatarBorderColorChange = async (color: string) => {
    try {
      console.log('Changing avatar border color to:', color);
      // Update settings immediately for instant UI feedback
      updateSettings({ avatarBorderColor: color });
      
      // Get userId from URL params
      const pathSegments = window.location.pathname.split('/');
      const userId = pathSegments[1]; // /[userId]/...
      
      // Save directly to database
      const response = await fetch(`/api/user/design?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          avatarBorderColor: color
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save avatar border color');
      }

      console.log('Avatar border color saved successfully:', color);
    } catch (error) {
      console.error('Error changing avatar border color:', error);
      setError('Fehler beim Ändern der Randfarbe');
    }
  };

  // Best Practice: Memoized upload status
  const uploadStatus = useMemo(() => {
    if (isUploading || uploadProgress !== 'idle') {
      return {
        isActive: true,
        message: uploadProgress === 'uploading' ? 'Wird hochgeladen...' : 'Wird verarbeitet...',
        icon: <Loader2 className="w-4 h-4 animate-spin" />
      };
    }
    return { isActive: false, message: '', icon: null };
  }, [isUploading, uploadProgress]);

  return (
    <>
      <div className="space-y-4">
        {/* Avatar Preview Section */}
        <div className="flex items-center gap-4">
          <div
            {...getRootProps()}
            className={`w-20 h-20 border-2 border-dashed cursor-pointer flex items-center justify-center transition-colors ${
              settings.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'
            } ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            {settings.avatarImage ? (
              <div 
                className={`w-full h-full ${
                  settings.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'
                } overflow-hidden`}
                style={{
                  border: `3px solid ${settings.avatarBorderColor || '#ffffff'}`,
                  borderRadius: settings.avatarShape === 'circle' ? '50%' : '8px'
                }}
              >
                <img
                  src={settings.avatarImage}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Foto hochladen</p>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Avatar</h3>
            <p className="text-xs text-gray-500">
              {settings.avatarImage ? 'Dein aktuelles Profilbild' : 'Lade dein Profilbild hoch'}
            </p>
          </div>
        </div>



        {/* Action Buttons - Only show if avatar exists */}
        {settings.avatarImage && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={removeAvatar}
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={uploadStatus.isActive}
            >
              <X className="w-4 h-4 mr-2" />
              Entfernen
            </Button>
            
            {settings.originalAvatarImage && settings.originalAvatarImage !== settings.avatarImage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={restoreOriginal}
                className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                disabled={uploadStatus.isActive}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Original
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Best Practice: Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Best Practice: Upload Stats */}
      {uploadStats && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <div className="text-sm">
              <div>Original: {(uploadStats.originalSize / 1024 / 1024).toFixed(1)}MB</div>
              <div>Komprimiert: {(uploadStats.compressedSize / 1024 / 1024).toFixed(1)}MB</div>
              <div>Zeit: {uploadStats.uploadTime}ms</div>
            </div>
          </div>
        </div>
      )}

      {showCropper && selectedImage && (
        <AvatarCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedImage(null);
            setUploadProgress('idle');
            setError(null);
            setUploadStats(null);
          }}
          isUploading={uploadStatus.isActive}
          avatarShape={settings.avatarShape || 'circle'}
        />
      )}
    </>
  );
}

// Best Practice: Enhanced Upload Background with better error handling and UX
export function UploadBackground({ onUploadComplete }: UploadBackgroundProps) {
  const { settings, updateSettings, saveSettings } = useDesign();
  const { startUpload, isUploading } = useUploadThing("background");
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'processing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    originalSize: number;
    compressedSize: number;
    uploadTime: number;
  } | null>(null);

  // Best Practice: Memoized file validation
  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 20 * 1024 * 1024; // 20MB for backgrounds
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Nur JPG, PNG, WebP und GIF Dateien sind erlaubt';
    }
    
    if (file.size > maxSize) {
      return 'Datei ist zu groß (max. 20MB)';
    }
    
    return null;
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        // Best Practice: Client-side compression for backgrounds
        const startTime = Date.now();
        const compressedFile = await compressImage(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 2560, // Higher resolution for backgrounds
          quality: 0.9
        });
        
        const reader = new FileReader();
        reader.onload = (ev) => {
          const imageData = ev.target?.result as string;
          setSelectedImage(imageData);
          setShowCropper(true);
          
          // Track upload stats
          setUploadStats({
            originalSize: file.size,
            compressedSize: compressedFile.size,
            uploadTime: Date.now() - startTime
          });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Fehler beim Verarbeiten der Datei');
      }
    },
    [validateFile]
  );

  const handleCropComplete = async (croppedDataUrl: string) => {
    setUploadProgress('uploading');
    setError(null);
    
    try {
      const blob = await (await fetch(croppedDataUrl)).blob();
      const file = new File([blob], `background_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const uploaded = await startUpload([file]);
      if (uploaded && uploaded[0]) {
        const imageUrl = uploaded[0].ufsUrl;
        updateSettings({ 
          backgroundImage: imageUrl,
          backgroundType: 'image'
        });
        onUploadComplete?.(imageUrl);
        
        // Note: UploadThing router already updates the database
        // No need to call saveSettings() here to avoid race conditions
        console.log('Background uploaded successfully:', imageUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError('Fehler beim Upload des Hintergrundbildes');
    } finally {
      setShowCropper(false);
      setSelectedImage(null);
      setUploadProgress('idle');
      setUploadStats(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0]?.errors[0]?.message;
      setError(error || 'Datei konnte nicht hochgeladen werden');
    }
  });

  const removeBackground = async () => {
    try {
      // Get userId from URL params
      const pathSegments = window.location.pathname.split('/');
      const userId = pathSegments[1]; // /[userId]/...
      
      const response = await fetch(`/api/user/background/delete?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        updateSettings({ 
          backgroundImage: '',
          backgroundType: 'color'
        });
        // Note: Delete API already updates the database
        // No need to call saveSettings() here to avoid race conditions
        console.log('Background removed and deleted from UploadThing');
      } else {
        throw new Error('Failed to delete background');
      }
    } catch (error) {
      console.error('Error removing background:', error);
      setError('Fehler beim Entfernen des Hintergrundbildes');
    }
  };

  // Best Practice: Memoized upload status
  const uploadStatus = useMemo(() => {
    if (isUploading || uploadProgress !== 'idle') {
      return {
        isActive: true,
        message: uploadProgress === 'uploading' ? 'Wird hochgeladen...' : 'Wird verarbeitet...',
        icon: <Loader2 className="w-4 h-4 animate-spin" />
      };
    }
    return { isActive: false, message: '', icon: null };
  }, [isUploading, uploadProgress]);

  return (
    <>
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`w-full h-32 rounded-lg border-2 border-dashed cursor-pointer flex items-center justify-center transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {settings.backgroundImage && settings.backgroundType === 'image' ? (
            <div className="relative w-full h-full">
              <img
                src={settings.backgroundImage}
                alt="Background"
                className="w-full h-full rounded-lg object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeBackground();
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                disabled={uploadStatus.isActive}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Bild hier ablegen' : 'Klicken oder ziehen zum Hochladen'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max. 20MB • JPG, PNG, WebP, GIF
              </p>
            </div>
          )}
        </div>
        
        {/* Best Practice: Upload Progress */}
        {uploadStatus.isActive && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              {uploadStatus.icon}
              <span className="text-sm">{uploadStatus.message}</span>
            </div>
          </div>
        )}

        {/* Best Practice: Error Display */}
        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Best Practice: Upload Stats */}
        {uploadStats && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <div className="text-sm">
                <div>Original: {(uploadStats.originalSize / 1024 / 1024).toFixed(1)}MB</div>
                <div>Komprimiert: {(uploadStats.compressedSize / 1024 / 1024).toFixed(1)}MB</div>
                <div>Zeit: {uploadStats.uploadTime}ms</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCropper && selectedImage && (
        <BackgroundCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedImage(null);
            setUploadProgress('idle');
            setError(null);
            setUploadStats(null);
          }}
          isUploading={uploadStatus.isActive}
        />
      )}
    </>
  );
} 