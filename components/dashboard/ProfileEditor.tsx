"use client";

import { useState, useEffect, useRef } from "react";
import { User, Camera, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useUploadThing } from '@/lib/uploadthing';
import AvatarEditor from './AvatarEditor';

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  backgroundColor: string;
  backgroundGradient: string;
  buttonStyle: string;
  buttonColor: string;
  buttonGradient: string;
  textColor: string;
  fontFamily: string;
  buttonTextColor?: string;
}

interface ProfileEditorProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  editProfile?: { displayName: string; bio: string; avatarUrl: string } | null;
  setEditProfile?: (profile: { displayName: string; bio: string; avatarUrl: string }) => void;
  fetchProfile?: () => void;
  isProUser: boolean;
}

export default function ProfileEditor({ profile, onUpdate, editProfile, setEditProfile, fetchProfile, isProUser }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    username: profile.username,
    displayName: profile.displayName || "",
    bio: profile.bio || "",
    avatarUrl: profile.avatarUrl || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use UploadThing hook
  const { startUpload, isUploading } = useUploadThing("avatar", {
    onClientUploadComplete: async (res) => {
      console.log('UploadThing client upload complete:', res);
      if (res && res.length > 0) {
        const avatarUrl = res[0].url;
        console.log('Avatar URL from UploadThing:', avatarUrl);
        
        setFormData(prev => ({ ...prev, avatarUrl }));
        if (setEditProfile) setEditProfile({ 
          displayName: formData.displayName, 
          bio: formData.bio, 
          avatarUrl 
        });
        
        // Save to profile
        try {
          const response = await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, avatarUrl }),
          });
          
          if (response.ok) {
            const updatedProfile = await response.json();
            console.log('Profile updated successfully:', updatedProfile);
            onUpdate(updatedProfile);
            if (typeof fetchProfile === 'function') fetchProfile();
            toast({ title: "Erfolg", description: "Avatar wurde erfolgreich gespeichert" });
          } else {
            const errorData = await response.json();
            console.error('Profile update failed:', errorData);
            toast({ title: "Fehler", description: "Avatar konnte nicht gespeichert werden", variant: "destructive" });
          }
        } catch (e) {
          console.error('Profile update error:', e);
          toast({ title: "Fehler", description: "Avatar konnte nicht gespeichert werden", variant: "destructive" });
        }
      } else {
        console.error('No upload result received');
        toast({ title: "Fehler", description: "Avatar Upload fehlgeschlagen", variant: "destructive" });
      }
      setIsLoading(false);
    },
    onUploadError: (error: Error) => {
      console.error('UploadThing error:', error);
      toast({ title: "Fehler", description: `Avatar Upload fehlgeschlagen: ${error.message}`, variant: "destructive" });
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (setEditProfile) {
      setEditProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
      });
    }
  }, [formData.displayName, formData.bio, formData.avatarUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdate(updatedProfile);
        toast({ title: 'Profil gespeichert', description: 'Deine Änderungen wurden übernommen.' });
      } else {
        toast({ title: 'Fehler', description: 'Profil konnte nicht gespeichert werden', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageData = ev.target?.result as string;
      setSelectedImage(imageData);
      setOriginalImage(imageData); // Store the original image
      setEditorOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarEdit = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarEditExisting = async () => {
    if (!formData.avatarUrl) return;
    
    try {
      console.log('Loading existing avatar:', formData.avatarUrl);
      
      // If we have the original image stored, use it
      if (originalImage) {
        console.log('Using stored original image');
        setSelectedImage(originalImage);
        setEditorOpen(true);
        return;
      }
      
      // Otherwise, fetch the existing avatar image
      const response = await fetch(formData.avatarUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      console.log('Avatar loaded successfully, opening editor');
      setSelectedImage(dataUrl);
      setOriginalImage(dataUrl); // Store as original for future edits
      setEditorOpen(true);
    } catch (error) {
      console.error('Error loading existing avatar:', error);
      toast({ title: "Fehler", description: "Bestehendes Bild konnte nicht geladen werden", variant: "destructive" });
    }
  };

  const handleAvatarEditorCancel = () => {
    setEditorOpen(false);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    setEditorOpen(false);
    setIsLoading(true);
    try {
      console.log('Starting avatar upload process...');
      const blob = await (await fetch(croppedDataUrl)).blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      
      console.log('File created:', file.name, file.size, file.type);
      
      // Use UploadThing hook to upload the file
      await startUpload([file]);
      
    } catch (e) {
      console.error('Avatar upload error:', e);
      toast({ title: "Fehler", description: `Avatar konnte nicht gespeichert werden: ${e instanceof Error ? e.message : 'Unbekannter Fehler'}`, variant: "destructive" });
      setIsLoading(false);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('ProfileEditor avatarUrl:', formData.avatarUrl);
  }, [formData.avatarUrl]);

  // Store original image when component loads with an avatar
  useEffect(() => {
    if (formData.avatarUrl && !originalImage) {
      // Store the current avatar as the original image for editing
      setOriginalImage(formData.avatarUrl);
    }
  }, [formData.avatarUrl, originalImage]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      {/* Avatar Upload + Preview */}
      <label className="text-sm font-medium">Avatar</label>
      <div className="flex items-center gap-4 mb-2">
        <Avatar className="w-16 h-16 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
          <AvatarImage
            src={formData.avatarUrl || undefined}
            alt="avatar"
            isLoading={isLoading}
            size={64}
          />
          {!formData.avatarUrl && !isLoading && (
            <AvatarFallback>
              <span className="text-gray-400 text-2xl">?</span>
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col gap-1">
          <button type="button" onClick={handleAvatarEdit} className="bg-black text-white rounded px-3 py-1 text-xs font-semibold hover:bg-gray-900">Neues Foto</button>
          {formData.avatarUrl && (
            <button type="button" onClick={handleAvatarEditExisting} className="bg-gray-600 text-white rounded px-3 py-1 text-xs font-semibold hover:bg-gray-700">Bearbeiten</button>
          )}
        </div>
        {formData.avatarUrl && (
          <button
            type="button"
            onClick={async () => {
              setIsLoading(true);
              try {
                setFormData(prev => ({ ...prev, avatarUrl: "" }));
                if (setEditProfile) setEditProfile({ displayName: formData.displayName, bio: formData.bio, avatarUrl: "" });
                const response = await fetch("/api/user/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...formData, avatarUrl: "" }),
                });
                if (response.ok) {
                  const updatedProfile = await response.json();
                  onUpdate(updatedProfile);
                  if (typeof fetchProfile === 'function') fetchProfile();
                } else {
                  toast({ title: "Fehler", description: "Avatar konnte nicht entfernt werden", variant: "destructive" });
                }
              } catch (e) {
                toast({ title: "Fehler", description: "Avatar konnte nicht entfernt werden", variant: "destructive" });
              } finally {
                setIsLoading(false);
              }
            }}
            className="bg-red-500 text-white rounded px-3 py-1 text-xs font-semibold hover:bg-red-600 ml-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Entfernen"}
          </button>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {editorOpen && selectedImage && (
        <AvatarEditor
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleAvatarEditorCancel}
        />
      )}
      <label className="text-sm font-medium">Username</label>
      <Input
        value={formData.username}
        onChange={e => setFormData({ ...formData, username: e.target.value })}
        placeholder="your-username"
        required
      />
      <label className="text-sm font-medium">Display Name</label>
      <Input
        value={formData.displayName}
        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
        placeholder="Your name"
        maxLength={30}
      />
      <label className="text-sm font-medium">Bio</label>
      <Textarea
        value={formData.bio}
        onChange={e => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Tell people about yourself..."
        rows={3}
        maxLength={160}
      />
      <button type="submit" disabled={isLoading} className="mt-2 px-4 py-2 bg-black text-white rounded text-sm font-semibold disabled:opacity-60">
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
} 