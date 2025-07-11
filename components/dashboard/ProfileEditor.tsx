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
  // Bearbeitungsmodus
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
    <div className="max-w-lg ml-0 bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 relative">
      {/* Bearbeitungsmodus-Badge */}
      {isEditMode && (
        <div className="absolute top-4 left-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow">Bearbeitungsmodus</div>
      )}
      {/* Avatar-Bereich */}
      <div className="flex flex-col items-center gap-2 relative">
        <div className="relative group">
          <img
            src={editData.avatarUrl || "/avatar-placeholder.png"}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md group-hover:brightness-90 transition"
            onError={e => { e.currentTarget.src = "/avatar-placeholder.png"; }}
          />
        </div>
        {/* Kamera-Icon jetzt UNTER dem Avatar */}
        <button
          type="button"
          className="mt-2 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition border border-gray-200"
          onClick={() => setEditorOpen(true)}
          title="Avatar ändern"
        >
          <Camera className="w-5 h-5 text-gray-700" />
        </button>
        <span className="text-xs text-gray-400 mt-1">Avatar ändern</span>
      </div>
      {/* Profilinfos */}
      <div className={`flex flex-col gap-6 ${isEditMode ? 'border-2 border-blue-300 rounded-xl p-4 bg-blue-50/30' : ''}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          {isEditMode ? (
            <input
              name="displayName"
              value={editData.displayName}
              onChange={e => setEditData(d => ({ ...d, displayName: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base"
              maxLength={32}
              required
            />
          ) : (
            <div className="py-2 px-4 bg-gray-50 rounded text-gray-800 border border-gray-100">{editData.displayName}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <div className="flex items-center gap-2">
            <input
              name="username"
              value={profile.username}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 text-base cursor-not-allowed"
            />
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUsernameDialogOpen(true)}
                className="ml-1"
              >
                Benutzernamen ändern
              </Button>
            )}
          </div>
          {/* Username-Dialog */}
          <Dialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen}>
            <DialogContent className="sm:max-w-md bg-white shadow-xl rounded-xl border border-gray-200 p-6">
              <DialogHeader>
                <DialogTitle>Benutzernamen ändern</DialogTitle>
                <DialogDescription>
                  Wähle einen neuen, eindeutigen Benutzernamen. (Nur Buchstaben, Zahlen, - und _)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Neuer Benutzername</label>
                  <Input
                    value={usernameData.newUsername}
                    onChange={(e) => setUsernameData(prev => ({ ...prev, newUsername: e.target.value }))}
                    placeholder="neuer-benutzername"
                    maxLength={32}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bestätigen</label>
                  <Input
                    value={usernameData.confirmation}
                    onChange={(e) => setUsernameData(prev => ({ ...prev, confirmation: e.target.value }))}
                    placeholder="neuer-benutzername"
                    maxLength={32}
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
                    Du kannst deinen Benutzernamen erst wieder am {getNextUsernameChangeDate()?.toLocaleDateString() || ''} ändern.
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUsernameDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleUsernameChange}
                  disabled={isChangingUsername || !usernameData.newUsername || usernameData.newUsername !== usernameData.confirmation || !canChangeUsername()}
                >
                  {isChangingUsername ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ändere...
                    </>
                  ) : (
                    "Speichern"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          {isEditMode ? (
            <textarea
              name="bio"
              value={editData.bio}
              onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base min-h-[60px]"
              maxLength={160}
            />
          ) : (
            <div className="py-2 px-4 bg-gray-50 rounded text-gray-800 border border-gray-100 min-h-[60px]">{editData.bio}</div>
          )}
          <div className="text-xs text-gray-400 text-right mt-1">{editData.bio.length}/160</div>
        </div>
      </div>
      {/* Speichern/Abbrechen-Button nur im Edit-Mode */}
      {isEditMode ? (
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
            disabled={isLoading || !hasProfileChanges}
          >
            {isLoading ? "Speichern..." : "Speichern"}
          </button>
          <button
            type="button"
            onClick={() => { setIsEditMode(false); setEditData({ displayName: profile.displayName || "", bio: profile.bio || "", avatarUrl: profile.avatarUrl || "" }); }}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-200 transition"
            disabled={isLoading}
          >
            Abbrechen
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        >
          Profil bearbeiten
        </button>
      )}
      {/* Avatar Editor Modal */}
      {editorOpen && (
        <AvatarEditor
          image={selectedImage || editData.avatarUrl || null}
          onCropComplete={handleCropComplete}
          onCancel={handleAvatarEditorCancel}
          isUploading={isUploading || isLoading}
          onRemove={async () => {
            setIsLoading(true);
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
              setEditorOpen(false);
              setIsLoading(false);
            } else {
              toast({ title: t.error, description: t.avatarRemoveFailed, variant: "destructive" });
              setIsLoading(false);
            }
          }}
        />
      )}
    </div>
  );
} 