"use client";

import { useState, useEffect, useRef } from "react";
import { User, Camera, Save, Loader2, Edit, X, AlertTriangle, Check, Copy, RotateCcw } from "lucide-react";
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
import AvatarUploadFlow from "@/components/profile/AvatarUploadFlow";

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
  fetchProfile: any;
  isProUser: boolean;
  t?: any;
  currentLang?: "de" | "en";
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  onEditDataChange?: (data: any) => void;
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

export default function ProfileEditor({ profile, onUpdate, fetchProfile, isProUser, t: tProp, currentLang = "en", isEditMode, setIsEditMode, onEditDataChange }: ProfileEditorProps) {
  console.log('profile ref', profile);
  const t = tProp || getTranslations(currentLang);
  
  // Bearbeitungsmodus
  const [isLoading, setIsLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"de" | "en">("en");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State für AvatarUploadFlow-Modal
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  // State for independent avatar border color selection
  const [pendingAvatarBorderColor, setPendingAvatarBorderColor] = useState<string | null>(null);
  const [isSavingBorderColor, setIsSavingBorderColor] = useState(false);

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

  const allowedFields = [
    "username",
    "displayName",
    "bio",
    "avatarUrl",
    "originalAvatarUrl",
    "avatarBorderColor",
    "theme",
    "backgroundColor",
    "backgroundGradient",
    "buttonStyle",
    "buttonColor",
    "buttonGradient",
    "textColor",
    "fontFamily"
  ];

  // PENDING CHANGES: Diese werden nur in der Live Preview angezeigt
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  
  // ORIGINAL DATA: Das sind die echten, gespeicherten Daten
  const [originalData, setOriginalData] = useState<Record<string, any>>({});

  // Initialize original data when profile changes
  useEffect(() => {
    const initialData = Object.fromEntries(allowedFields.map(key => [key, profile[key] ?? ""]));
    setOriginalData(initialData);
    setPendingChanges({}); // Reset pending changes when profile changes
  }, [profile.id]);

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
        const originalAvatarUrl = res[0].url;
        
        // Add to pending changes (not saved yet)
        setPendingChanges(prev => ({ ...prev, originalAvatarUrl }));
        if (onEditDataChange) {
          const previewData = { ...originalData, ...pendingChanges, originalAvatarUrl };
          onEditDataChange(previewData);
        }
        
        toast({
          title: "Avatar hochgeladen",
          description: "Das Bild wurde zur Vorschau hinzugefügt. Speichere deine Änderungen, um es zu übernehmen.",
        });
      }
    },
    onUploadError: (error: Error) => {
      toast({ title: t.error, description: `${t.avatarUploadFailed}: ${error.message}`, variant: "destructive" });
      setIsLoading(false);
    },
  });

  // Store original image when component loads with an avatar
  useEffect(() => {
    if (profile.avatarUrl && !originalImage) {
      setOriginalImage(profile.avatarUrl);
    }
  }, [profile.avatarUrl, originalImage]);

  // Check if there are any pending changes
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  // Get current display data (original + pending changes)
  const getCurrentData = (field: string) => {
    return pendingChanges[field] !== undefined ? pendingChanges[field] : originalData[field];
  };

  const handleSaveProfile = async () => {
    if (!hasPendingChanges) {
      toast({ title: "Keine Änderungen", description: "Es gibt keine Änderungen zum Speichern." });
      return;
    }

    setIsLoading(true);
    try {
      // Only send pending changes to the API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingChanges),
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdate(updatedProfile);
        setOriginalData(prev => ({ ...prev, ...pendingChanges }));
        setPendingChanges({}); // Clear pending changes
        setIsEditMode(false);
        toast({ title: t.profileSaved, description: 'Deine Änderungen wurden gespeichert.' });
      } else {
        const errorData = await response.json();
        toast({ title: t.error, description: errorData.error || t.profileSaveFailed, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setPendingChanges({}); // Clear all pending changes
    // Reset preview to original data
    if (onEditDataChange) {
      onEditDataChange(originalData);
    }
  };

  const handleResetChanges = () => {
    setPendingChanges({}); // Clear all pending changes
    // Reset preview to original data
    if (onEditDataChange) {
      onEditDataChange(originalData);
    }
    toast({ title: "Änderungen zurückgesetzt", description: "Alle Änderungen wurden verworfen." });
  };

  // handleFileChange: Lade das Originalbild direkt zu Uploadthing hoch
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      // 1. Originalbild zu Uploadthing hochladen
      const uploadRes = await startUpload([file]);
      if (uploadRes && uploadRes.length > 0) {
        const originalAvatarUrl = uploadRes[0].url;
        // 2. Add to pending changes (not saved yet)
        setPendingChanges(prev => ({ ...prev, originalAvatarUrl }));
        if (onEditDataChange) {
          const previewData = { ...originalData, ...pendingChanges, originalAvatarUrl };
          onEditDataChange(previewData);
        }
        // 3. Öffne den Cropper mit der Uploadthing-URL als Bildquelle
        setSelectedImage(originalAvatarUrl);
        setEditorOpen(true);
      } else {
        toast({ title: "Fehler", description: "Upload fehlgeschlagen.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fehler", description: "Upload fehlgeschlagen.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarEdit = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarEditExisting = async () => {
    if (!getCurrentData('avatarUrl')) return;
    
    try {
      if (originalImage) {
        setSelectedImage(originalImage);
        setEditorOpen(true);
        return;
      }
      
      const response = await fetch(getCurrentData('avatarUrl'));
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

  // handleCropComplete: Lade das bearbeitete Bild als Datei zu Uploadthing hoch
  const handleCropComplete = async (croppedImageUrl: string) => {
    setIsLoading(true);
    try {
      // DataURL in File umwandeln
      const blob = await (await fetch(croppedImageUrl)).blob();
      const file = new File([blob], `avatar_cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
      // Bearbeitetes Bild zu Uploadthing hochladen
      const uploadRes = await startUpload([file]);
      if (uploadRes && uploadRes.length > 0) {
        const avatarUrl = uploadRes[0].url;
        
        // Add to pending changes (not saved yet)
        setPendingChanges(prev => ({ 
          ...prev, 
          avatarUrl,
          originalAvatarUrl: getCurrentData('originalAvatarUrl') || originalData.originalAvatarUrl
        }));
        
        if (onEditDataChange) {
          const previewData = { 
            ...originalData, 
            ...pendingChanges, 
            avatarUrl,
            originalAvatarUrl: getCurrentData('originalAvatarUrl') || originalData.originalAvatarUrl
          };
          onEditDataChange(previewData);
        }
        
        setEditorOpen(false);
        toast({ 
          title: "Avatar bearbeitet", 
          description: "Das bearbeitete Bild wurde zur Vorschau hinzugefügt. Speichere deine Änderungen, um es zu übernehmen." 
        });
      } else {
        toast({ title: "Fehler", description: "Upload fehlgeschlagen.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fehler", description: "Upload fehlgeschlagen.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    // Add to pending changes (not saved yet)
    setPendingChanges(prev => ({ ...prev, avatarUrl: "", originalAvatarUrl: "" }));
    if (onEditDataChange) {
      const previewData = { ...originalData, ...pendingChanges, avatarUrl: "", originalAvatarUrl: "" };
      onEditDataChange(previewData);
    }
    toast({ title: "Avatar entfernt", description: "Avatar wurde zur Vorschau entfernt. Speichere deine Änderungen, um es zu übernehmen." });
    // File-Input nach Entfernen zurücksetzen
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        // Update original data immediately for username changes
        setOriginalData(prev => ({ ...prev, username: usernameData.newUsername }));
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
    const url = `http://linkulike.local:3000/${getCurrentData('username')}`;
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

  const publicUrl = `http://linkulike.local:3000/${getCurrentData('username')}`;

  const AVATAR_BORDER_COLORS = [
    "#fff", // Weiß
    "#222", // Schwarz
    "#6366f1", // Indigo
    "#f59e42", // Orange
    "#10b981", // Green
    "#ef4444", // Red
    "#3b82f6", // Blue
    "#f472b6", // Pink
    "#facc15", // Yellow
    "#a3e635", // Lime
  ];
  const PRO_AVATAR_BORDER_COLORS = [
    ...AVATAR_BORDER_COLORS,
    "#8b5cf6", // Violet
    "#14b8a6", // Teal
    "#eab308", // Amber
    "#f43f5e", // Rose
    "#0ea5e9", // Sky
    // ... weitere Farben
  ];

  // Zentrale Handler-Funktion für alle Edit-Feld-Änderungen
  const handleEditChange = (field: string, value: any) => {
    setPendingChanges(prev => {
      const updated = { ...prev, [field]: value };
      // Update preview immediately
      if (onEditDataChange) {
        const previewData = { ...originalData, ...updated };
        onEditDataChange(previewData);
      }
      return updated;
    });
  };

  // Handler for independent avatar border color selection
  const handleAvatarBorderColorSelect = (color: string) => {
    setPendingAvatarBorderColor(color);
    // Show preview immediately
    if (onEditDataChange) {
      onEditDataChange({ ...originalData, ...pendingChanges, avatarBorderColor: color });
    }
  };

  // Confirm and save avatar border color
  const handleConfirmAvatarBorderColor = async () => {
    if (!pendingAvatarBorderColor) return;
    setIsSavingBorderColor(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarBorderColor: pendingAvatarBorderColor }),
      });
      if (response.ok) {
        const updatedProfile = await response.json();
        setOriginalData(prev => ({ ...prev, avatarBorderColor: pendingAvatarBorderColor }));
        setPendingAvatarBorderColor(null);
        if (onEditDataChange) onEditDataChange({ ...updatedProfile, avatarBorderColor: pendingAvatarBorderColor });
        onUpdate(updatedProfile);
        toast({ title: "Rahmenfarbe gespeichert", description: "Die neue Avatar-Rahmenfarbe wurde übernommen." });
      } else {
        toast({ title: "Fehler", description: "Rahmenfarbe konnte nicht gespeichert werden.", variant: "destructive" });
      }
    } finally {
      setIsSavingBorderColor(false);
    }
  };

  // Cancel avatar border color selection
  const handleCancelAvatarBorderColor = () => {
    setPendingAvatarBorderColor(null);
    // Restore preview to last saved color
    if (onEditDataChange) {
      onEditDataChange({ ...originalData, ...pendingChanges, avatarBorderColor: originalData.avatarBorderColor });
    }
  };

  return (
    <div className="max-w-lg ml-0 bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 relative">
      {/* Bearbeitungsmodus-Badge */}
      {isEditMode && (
        <div className="absolute top-4 left-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
          {hasPendingChanges ? "Änderungen ausstehend" : "Bearbeitungsmodus"}
        </div>
      )}
      
      {/* Avatar-Bereich */}
      <div className="flex flex-col items-center gap-2 relative">
        <Avatar className="w-32 h-32 border-4 shadow-md bg-gray-200"
          style={{ borderColor: (pendingAvatarBorderColor !== null ? pendingAvatarBorderColor : getCurrentData('avatarBorderColor')) || "#fff" }}
        >
          <AvatarImage src={getCurrentData('avatarUrl') || undefined} alt={getCurrentData('displayName') || "Avatar"} />
          <AvatarFallback>
            <span>{(getCurrentData('displayName') || "U").charAt(0).toUpperCase()}</span>
          </AvatarFallback>
        </Avatar>
        
        {/* Farbauswahl */}
        <div className="flex gap-2 mt-2 flex-wrap justify-center items-center bg-gray-50/60 rounded-xl px-4 py-3 border border-gray-100">
          {(isProUser ? PRO_AVATAR_BORDER_COLORS : AVATAR_BORDER_COLORS).map((color) => (
            <button
              key={color}
              type="button"
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400
                ${(pendingAvatarBorderColor !== null ? pendingAvatarBorderColor : getCurrentData('avatarBorderColor')) === color ? 'ring-2 ring-black' : ''}
                ${color === '#fff' ? 'border-black' : 'border-transparent'}`}
              style={{ background: color, borderColor: color === '#fff' ? '#222' : color }}
              onClick={() => handleAvatarBorderColorSelect(color)}
              aria-label={`Rahmenfarbe ${color}`}
              tabIndex={0}
            >
              {(pendingAvatarBorderColor !== null ? pendingAvatarBorderColor : getCurrentData('avatarBorderColor')) === color && (
                <span className="block w-3 h-3 rounded-full bg-white border border-black" />
              )}
            </button>
          ))}
          {/* Inline Confirm and Cancel buttons for avatar border color */}
          {pendingAvatarBorderColor !== null && (
            <div className="flex items-center ml-3 gap-1">
              <button
                type="button"
                className="w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={handleConfirmAvatarBorderColor}
                disabled={isSavingBorderColor}
                aria-label="Rahmenfarbe übernehmen"
                title="Rahmenfarbe übernehmen"
                tabIndex={0}
              >
                {isSavingBorderColor ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                className="w-7 h-7 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center shadow transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={handleCancelAvatarBorderColor}
                disabled={isSavingBorderColor}
                aria-label="Abbrechen"
                title="Abbrechen"
                tabIndex={0}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 mt-1">Avatar-Rahmenfarbe</span>
        
        {/* Kamera-Icon jetzt UNTER dem Avatar */}
        <button
          type="button"
          className="mt-1 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition border border-gray-200"
          onClick={() => setAvatarModalOpen(true)}
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
              value={getCurrentData('displayName') || ""}
              onChange={e => handleEditChange('displayName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base"
              maxLength={32}
              required
            />
          ) : (
            <div className="py-2 px-4 bg-gray-50 rounded text-gray-800 border border-gray-100">{getCurrentData('displayName')}</div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <div className="flex items-center gap-2">
            <input
              name="username"
              value={getCurrentData('username') || ""}
              disabled
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 bg-gray-100 text-gray-500"
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
              value={getCurrentData('bio') || ""}
              onChange={e => handleEditChange('bio', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base min-h-[80px] resize-none outline-none transition-colors"
              maxLength={160}
              rows={3}
            />
          ) : (
            <div className="py-2 px-4 bg-gray-50 rounded text-gray-800 border border-gray-100 min-h-[60px]">{getCurrentData('bio')}</div>
          )}
          <div className="text-xs text-gray-400 text-right">{(getCurrentData('bio') || "").length}/160</div>
        </div>
      </div>
      
      {/* Speichern/Abbrechen-Button nur im Edit-Mode */}
      {isEditMode ? (
        <div className="flex justify-between gap-2 mt-4">
          {hasPendingChanges && (
            <button
              type="button"
              onClick={handleResetChanges}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-200 transition flex items-center gap-2"
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4" />
              Zurücksetzen
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={handleSaveProfile}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
              disabled={isLoading || !hasPendingChanges}
            >
              {isLoading ? "Speichern..." : "Änderungen speichern"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-200 transition"
              disabled={isLoading}
            >
              Abbrechen
            </button>
          </div>
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
      
      {/* AvatarUploadFlow-Modal */}
      {avatarModalOpen && (
        <AvatarUploadFlow
          initialAvatarUrl={getCurrentData('avatarUrl')}
          initialOriginalAvatarUrl={getCurrentData('originalAvatarUrl')}
          onAvatarChange={(avatarUrl, originalAvatarUrl) => {
            setPendingChanges(prev => ({ ...prev, avatarUrl, originalAvatarUrl }));
            if (onEditDataChange) {
              const previewData = { ...originalData, ...pendingChanges, avatarUrl, originalAvatarUrl };
              onEditDataChange(previewData);
            }
            if (typeof fetchProfile === 'function') fetchProfile();
          }}
          onClose={() => setAvatarModalOpen(false)}
          userId={profile.id || profile.userId || ''}
        />
      )}
    </div>
  );
} 