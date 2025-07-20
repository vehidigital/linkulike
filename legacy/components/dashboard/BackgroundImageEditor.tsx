"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image, X, Settings, Eye, EyeOff } from "lucide-react";
import { useUploadThing } from '@/lib/uploadthing';
import { toast } from "@/hooks/use-toast";
import Cropper from 'react-easy-crop';

interface BackgroundImageEditorProps {
  backgroundImageUrl?: string;
  backgroundImageActive?: boolean;
  backgroundOverlayType?: 'dark' | 'light' | 'custom' | 'none';
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;
  onUpdate: (data: {
    backgroundImageUrl?: string;
    backgroundImageActive?: boolean;
    backgroundOverlayType?: 'dark' | 'light' | 'custom' | 'none';
    backgroundOverlayColor?: string;
    backgroundOverlayOpacity?: number;
  }) => void;
}

const OVERLAY_OPTIONS = [
  { value: 'none', label: 'Kein Overlay' },
  { value: 'dark', label: 'Dunkler Overlay' },
  { value: 'light', label: 'Heller Overlay' },
  { value: 'custom', label: 'Benutzerdefiniert' },
];

export default function BackgroundImageEditor({ 
  backgroundImageUrl, 
  backgroundImageActive = false,
  backgroundOverlayType = 'dark',
  backgroundOverlayColor = 'rgba(0,0,0,0.45)',
  backgroundOverlayOpacity = 1,
  onUpdate 
}: BackgroundImageEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("background", {
    onClientUploadComplete: async (res) => {
      if (res && res.length > 0) {
        const imageUrl = res[0].url;
        onUpdate({ 
          backgroundImageUrl: imageUrl, 
          backgroundImageActive: true,
          backgroundOverlayType: backgroundOverlayType 
        });
        toast({
          title: "Hintergrundbild hochgeladen",
          description: "Das Bild wurde erfolgreich hochgeladen.",
        });
      }
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      toast({ 
        title: "Fehler", 
        description: `Upload fehlgeschlagen: ${error.message}`, 
        variant: "destructive" 
      });
      setIsUploading(false);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Zeige Cropper mit der Datei
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageData = ev.target?.result as string;
      setSelectedImage(imageData);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return;
    
    setIsUploading(true);
    try {
      // Cropped image erstellen
      const canvas = document.createElement('canvas');
      const image = new window.Image();
      image.src = selectedImage;
      
      await new Promise<void>((resolve) => {
        image.onload = () => {
          canvas.width = croppedAreaPixels.width;
          canvas.height = croppedAreaPixels.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              image,
              croppedAreaPixels.x,
              croppedAreaPixels.y,
              croppedAreaPixels.width,
              croppedAreaPixels.height,
              0,
              0,
              croppedAreaPixels.width,
              croppedAreaPixels.height
            );
          }
          resolve();
        };
      });

      // Canvas zu Blob konvertieren
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `background_${Date.now()}.jpg`, { type: 'image/jpeg' });
          await startUpload([file]);
        }
      }, 'image/jpeg', 0.9);
      
      setShowCropper(false);
      setSelectedImage(null);
    } catch (error) {
      toast({ 
        title: "Fehler", 
        description: "Bildverarbeitung fehlgeschlagen", 
        variant: "destructive" 
      });
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onUpdate({ 
      backgroundImageUrl: '', 
      backgroundImageActive: false 
    });
    toast({
      title: "Hintergrundbild entfernt",
      description: "Das Hintergrundbild wurde entfernt.",
    });
  };

  const handleToggleActive = () => {
    onUpdate({ backgroundImageActive: !backgroundImageActive });
  };

  const handleOverlayTypeChange = (type: 'dark' | 'light' | 'custom' | 'none') => {
    onUpdate({ backgroundOverlayType: type });
  };

  const handleOverlayColorChange = (color: string) => {
    onUpdate({ backgroundOverlayColor: color });
  };

  const handleOverlayOpacityChange = (opacity: number) => {
    onUpdate({ backgroundOverlayOpacity: opacity });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Hintergrundbild
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aktuelles Bild */}
          {backgroundImageUrl && (
            <div className="relative">
              <div 
                className="w-full h-32 rounded-lg bg-cover bg-center border"
                style={{ backgroundImage: `url(${backgroundImageUrl})` }}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  variant={backgroundImageActive ? "default" : "secondary"}
                  onClick={handleToggleActive}
                  className="h-8 px-2"
                >
                  {backgroundImageActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveImage}
                  className="h-8 px-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {backgroundImageUrl ? 'Bild ändern' : 'Bild hochladen'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Overlay Einstellungen */}
          {backgroundImageUrl && backgroundImageActive && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label>Overlay-Typ</Label>
                <Select value={backgroundOverlayType} onValueChange={handleOverlayTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OVERLAY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {backgroundOverlayType === 'custom' && (
                <div className="space-y-2">
                  <Label>Overlay-Farbe</Label>
                  <Input
                    type="color"
                    value={backgroundOverlayColor?.replace('rgba(0,0,0,0.45)', '#000000') || '#000000'}
                    onChange={(e) => handleOverlayColorChange(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Label>Transparenz</Label>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={backgroundOverlayOpacity || 1}
                    onChange={(e) => handleOverlayOpacityChange(parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cropper Modal */}
      {showCropper && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw] max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Bild zuschneiden</h3>
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={9/16}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                minZoom={1}
                maxZoom={3}
              />
            </div>
            <div className="space-y-2 mb-4">
              <Label>Zoom</Label>
              <Input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCropper(false);
                  setSelectedImage(null);
                }}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCropSave}
                disabled={isUploading}
              >
                {isUploading ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 