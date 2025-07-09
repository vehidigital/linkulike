"use client";

import { useState, useEffect, useRef } from "react";
import { User, Camera, Save, Loader2, Edit, X, AlertTriangle, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useUploadThing } from '@/lib/uploadthing';
import AvatarEditor from './AvatarEditor';
import { getTranslations } from "@/lib/i18n";

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
  lastUsernameChange?: string;
}

interface ProfileEditorProps {
  profile: any;
  onUpdate: any;
  editProfile: any;
  setEditProfile: any;
  fetchProfile: any;
  isProUser: boolean;
  t?: any;
  currentLang?: "de" | "en";
}

// UUID-Helper für alle Browser
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: RFC4122 v4 compliant UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ProfileEditor({ profile, onUpdate, editProfile, setEditProfile, fetchProfile, isProUser, t: tProp, currentLang = "en" }: ProfileEditorProps) {
  const t = tProp || getTranslations(currentLang);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"de" | "en">("en");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get translations
  // const t = getTranslations(lang); // This line is now redundant as t is passed as a prop

  // Detect language from hostname
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.startsWith('de.')) {
        setLang('de');
      } else {
        setLang('en');
      }
    }
  }, []);

  // Edit form data
  const [editData, setEditData] = useState({
    displayName: profile.displayName || "",
    bio: profile.bio || "",
    avatarUrl: profile.avatarUrl || "",
  });

  // Username change dialog state
  const [usernameData, setUsernameData] = useState({
    newUsername: "",
    confirmation: "",
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isChangingUsername, setIsChangingUsername] = useState(false);

  // Use UploadThing hook
  const { startUpload, isUploading } = useUploadThing("avatar", {
    onClientUploadComplete: async (res) => {
      if (res && res.length > 0) {
        const avatarUrl = res[0].url;
        // Aktuelle Werte holen
        const displayName = editData.displayName;
        const bio = editData.bio;
        setEditData(prev => ({ ...prev, avatarUrl }));
        if (setEditProfile) setEditProfile({ 
          displayName, 
          bio, 
          avatarUrl 
        });
        // Save to profile mit aktuellen Werten
        try {
          const response = await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayName, bio, avatarUrl }),
          });
          if (response.ok) {
            const updatedProfile = await response.json();
            onUpdate(updatedProfile);
            if (typeof fetchProfile === 'function') fetchProfile(); // Profil neu laden
            toast({ title: t.success, description: t.avatarSaved });
          } else {
            toast({ title: t.error, description: t.avatarSaveFailed, variant: "destructive" });
          }
        } catch (e) {
          toast({ title: t.error, description: t.avatarSaveFailed, variant: "destructive" });
        }
      } else {
        toast({ title: t.error, description: t.avatarUploadFailed, variant: "destructive" });
      }
      setEditorOpen(false);
      setIsLoading(false);
    },
    onUploadError: (error: Error) => {
      toast({ title: t.error, description: `${t.avatarUploadFailed}: ${error.message}`, variant: "destructive" });
      setIsLoading(false);
    },
  });

  // Update edit data when profile changes
  useEffect(() => {
    setEditData({
      displayName: profile.displayName || "",
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
    });
  }, [profile]);

  // Update editProfile when editData changes
  useEffect(() => {
    if (setEditProfile) {
      setEditProfile({
        displayName: editData.displayName,
        bio: editData.bio,
        avatarUrl: editData.avatarUrl,
      });
    }
  }, [editData.displayName, editData.bio, editData.avatarUrl, setEditProfile]);

  // Store original image when component loads with an avatar
  useEffect(() => {
    if (profile.avatarUrl && !originalImage) {
      setOriginalImage(profile.avatarUrl);
    }
  }, [profile.avatarUrl, originalImage]);

  // Track, ob sich Profilinfos geändert haben
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  useEffect(() => {
    setHasProfileChanges(
      editData.displayName !== profile.displayName ||
      editData.bio !== profile.bio
    );
  }, [editData.displayName, editData.bio, profile.displayName, profile.bio]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdate(updatedProfile);
        setIsEditMode(false);
        toast({ title: t.profileSaved, description: 'Deine Änderungen wurden übernommen.' });
      } else {
        const errorData = await response.json();
        toast({ title: t.error, description: errorData.error || t.profileSaveFailed, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      displayName: profile.displayName || "",
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
    });
    setIsEditMode(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageData = ev.target?.result as string;
      setSelectedImage(imageData);
      setOriginalImage(imageData);
      setEditorOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarEdit = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarEditExisting = async () => {
    if (!editData.avatarUrl) return;
    
    try {
      if (originalImage) {
        setSelectedImage(originalImage);
        setEditorOpen(true);
        return;
      }
      
      const response = await fetch(editData.avatarUrl);
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
      
      setSelectedImage(dataUrl);
      setOriginalImage(dataUrl);
      setEditorOpen(true);
    } catch (error) {
      toast({ title: t.error, description: t.existingImageLoadFailed, variant: "destructive" });
    }
  };

  const handleAvatarEditorCancel = () => {
    setEditorOpen(false);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    setIsLoading(true);
    try {
      const blob = await (await fetch(croppedDataUrl)).blob();
      const ext = 'jpg';
      const uniqueName = `avatar_${generateUUID()}.${ext}`;
      const file = new File([blob], uniqueName, { type: 'image/jpeg' });
      console.log('Starte Upload:', file);
      await startUpload([file]);
      console.log('Upload abgeschlossen');
      // File-Input nach Upload zurücksetzen
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      console.error('Avatar-Upload-Fehler:', e);
      toast({ title: "Fehler", description: `Avatar konnte nicht gespeichert werden: ${e instanceof Error ? e.message : 'Unbekannter Fehler'}`, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsLoading(true);
    try {
      setEditData(prev => ({ ...prev, avatarUrl: "" }));
      if (setEditProfile) setEditProfile({ displayName: editData.displayName, bio: editData.bio, avatarUrl: "" });
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editData, avatarUrl: "" }),
      });
      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdate(updatedProfile);
        if (typeof fetchProfile === 'function') fetchProfile();
        toast({ title: t.avatarRemoved, description: "Avatar wurde erfolgreich entfernt" });
        // File-Input nach Entfernen zurücksetzen
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast({ title: t.error, description: t.avatarRemoveFailed, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: t.error, description: t.avatarRemoveFailed, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = async () => {
          if (usernameData.newUsername !== usernameData.confirmation) {
        setUsernameError(t.usernameError);
        return;
      }

    setIsChangingUsername(true);
    setUsernameError(null);
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameData.newUsername }),
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdate(updatedProfile);
        setUsernameDialogOpen(false);
        setUsernameData({ newUsername: "", confirmation: "" });
        toast({ title: t.usernameChanged, description: 'Dein Benutzername wurde erfolgreich geändert.' });
      } else {
        const errorData = await response.json();
        setUsernameError(errorData.error || t.usernameChangeFailed);
      }
    } finally {
      setIsChangingUsername(false);
    }
  };

  const copyProfileUrl = async () => {
    const url = `http://linkulike.local:3000/${profile.username}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopied(true);
      toast({ title: t.linkCopied, description: "Profil-Link wurde in die Zwischenablage kopiert" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      let msg = '';
      if (err instanceof Error) {
        msg = err.message;
      } else {
        msg = String(err);
      }
      window.alert('Kopieren fehlgeschlagen: ' + msg);
      toast({ title: t.error, description: t.linkCopyFailed, variant: "destructive" });
    }
  };

  const canChangeUsername = () => {
    if (!profile.lastUsernameChange) return true;
    const now = new Date();
    const lastChange = new Date(profile.lastUsernameChange);
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
    return now.getTime() - lastChange.getTime() >= THIRTY_DAYS;
  };

  const getNextUsernameChangeDate = () => {
    if (!profile.lastUsernameChange) return null;
    const lastChange = new Date(profile.lastUsernameChange);
    return new Date(lastChange.getTime() + (1000 * 60 * 60 * 24 * 30));
  };

  const publicUrl = `http://linkulike.local:3000/${profile.username}`;

  return (
    <div className="w-full max-w-md ml-0 mt-8 p-6 bg-white rounded-xl shadow flex flex-col items-center">
      {/* Profil-Link */}
      <div className="w-full flex items-center justify-center gap-2 mb-4">
        <span className="text-gray-500 text-sm">{t.profileLink}:</span>
        <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200">{publicUrl}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={copyProfileUrl}
          className="ml-1"
          title={t.copy}
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      {/* Avatar mit Overlay-Buttons */}
      <div className="relative group mb-4">
        <Avatar className="w-28 h-28">
          <AvatarImage src={editData.avatarUrl || undefined} alt="Avatar" />
          <AvatarFallback>
            <User className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        {/* Overlay-Buttons: sichtbar bei Hover oder immer auf Mobile */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 sm:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleAvatarEdit}
            className="bg-white/90 hover:bg-white text-gray-800 shadow"
            title="Neues Foto"
          >
            <Camera className="w-5 h-5" />
          </Button>
          {editData.avatarUrl && (
            <>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleAvatarEditExisting}
                className="bg-white/90 hover:bg-white text-gray-800 shadow"
                title="Bearbeiten"
              >
                <Edit className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleRemoveAvatar}
                disabled={isLoading}
                className="bg-white/90 hover:bg-white text-red-600 shadow"
                title="Entfernen"
              >
                <X className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {/* Display Name */}
      <input
        className="w-full text-xl font-semibold text-center mb-1 border-none focus:ring-2 focus:ring-primary/30 rounded bg-gray-50 py-2 px-3"
        value={editData.displayName}
        onChange={e => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
        placeholder={t.yourName}
        maxLength={30}
      />
      {/* Username + Edit */}
      <div className="flex items-center justify-center gap-2 text-gray-500 text-center mb-2">
        <span>@{profile.username}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setUsernameDialogOpen(true)}
          className="p-1"
          title={t.changeUsername}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
      {/* Username-Dialog */}
      <Dialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white shadow-xl rounded-xl border border-gray-200 p-6">
          <DialogHeader>
            <DialogTitle>{t.changeUsernameTitle}</DialogTitle>
            <DialogDescription>
              {t.changeUsernameDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.newUsername}</label>
              <Input
                value={usernameData.newUsername}
                onChange={(e) => setUsernameData(prev => ({ ...prev, newUsername: e.target.value }))}
                placeholder="neuer-username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.confirmUsername}</label>
              <Input
                value={usernameData.confirmation}
                onChange={(e) => setUsernameData(prev => ({ ...prev, confirmation: e.target.value }))}
                placeholder="neuer-username"
              />
            </div>
            {usernameError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {usernameError}
              </div>
            )}
            {!canChangeUsername() && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t.usernameChangeBlocked.replace('{date}', getNextUsernameChangeDate()?.toLocaleDateString() || '')}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUsernameDialogOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleUsernameChange}
              disabled={isChangingUsername || !usernameData.newUsername || usernameData.newUsername !== usernameData.confirmation}
            >
              {isChangingUsername ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.changingUsername}
                </>
              ) : (
                t.changeUsernameButton
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bio */}
      <textarea
        className="w-full text-center text-gray-700 bg-gray-50 rounded p-2 mb-2 border-none focus:ring-2 focus:ring-primary/30"
        value={editData.bio}
        onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
        placeholder={t.tellAboutYourself}
        rows={3}
        maxLength={160}
      />
      <div className="text-xs text-gray-400 mb-4">{editData.bio.length}/160 {t.characters}</div>
      {/* Save/Cancel nur wenn geändert */}
      {hasProfileChanges && (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isLoading ? t.saving : t.save}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            {t.cancel}
          </Button>
        </div>
      )}
      {/* Avatar Editor Modal */}
      {editorOpen && selectedImage && (
        <AvatarEditor
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleAvatarEditorCancel}
          isUploading={isUploading || isLoading}
        />
      )}
    </div>
  );
} 