"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  // State for avatar border color selection with confirmation
  const [selectedAvatarBorderColor, setSelectedAvatarBorderColor] = useState<string | null>(null);
  const [showColorConfirmation, setShowColorConfirmation] = useState(false);
  const [showConfirmedMessage, setShowConfirmedMessage] = useState(false);
  const [showProfileSavedBanner, setShowProfileSavedBanner] = useState(false);
  const scrollPositionRef = useRef<number | null>(null);

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

    // Merke Scroll-Position
    scrollPositionRef.current = window.scrollY;
    setIsLoading(true);
    try {
      console.log("Sending profile update:", pendingChanges);
      
      // Only send pending changes to the API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingChanges),
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const updatedProfile = await response.json();
        console.log("Profile updated successfully:", updatedProfile);
        onUpdate(updatedProfile);
        setOriginalData(prev => ({ ...prev, ...pendingChanges }));
        setPendingChanges({}); // Clear pending changes
        setIsEditMode(false);
        setShowProfileSavedBanner(true); // Show confirmation banner
        setTimeout(() => setShowProfileSavedBanner(false), 3000);
        toast({ title: t.profileSaved, description: 'Deine Änderungen wurden gespeichert.' });
      } else {
        const errorText = await response.text();
        console.error("Profile update failed:", response.status, errorText);
        let errorMessage = "Unbekannter Fehler";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        toast({ title: t.error, description: errorMessage, variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: t.error, description: "Netzwerkfehler beim Speichern", variant: 'destructive' });
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
  const handleEditChange = useCallback((field: string, value: any) => {
    setPendingChanges(prev => {
      const updated = { ...prev, [field]: value };
      // Update preview immediately
      if (onEditDataChange) {
        const previewData = { ...originalData, ...updated };
        onEditDataChange(previewData);
      }
      return updated;
    });
  }, [onEditDataChange, originalData]);

  // Handler for avatar border color selection (pendingChange)
  const handleAvatarBorderColorSelect = useCallback((color: string) => {
    console.log("Avatar border color selected:", color);
    setSelectedAvatarBorderColor(color);
    setShowColorConfirmation(true);
    setShowConfirmedMessage(false); // Hide any existing confirmation message
    
    // Immediately update the live preview with the selected color
    if (onEditDataChange) {
      const previewData = { 
        ...originalData, 
        ...pendingChanges, 
        avatarBorderColor: color 
      };
      onEditDataChange(previewData);
    }
  }, [onEditDataChange, originalData, pendingChanges]);

  // Handler for confirming avatar border color
  const handleConfirmAvatarBorderColor = useCallback(() => {
    if (selectedAvatarBorderColor) {
      setPendingChanges(prev => {
        const updated = { ...prev, avatarBorderColor: selectedAvatarBorderColor };
        if (onEditDataChange) {
          const previewData = { ...originalData, ...updated };
          onEditDataChange(previewData);
        }
        return updated;
      });
    }
    setShowColorConfirmation(false);
    setSelectedAvatarBorderColor(null);
    
    // Show confirmation message and auto-hide after 3 seconds
    setShowConfirmedMessage(true);
    setTimeout(() => {
      setShowConfirmedMessage(false);
    }, 3000);
  }, [selectedAvatarBorderColor, onEditDataChange, originalData]);

  // Handler for canceling avatar border color selection
  const handleCancelAvatarBorderColor = useCallback(() => {
    setShowColorConfirmation(false);
    setSelectedAvatarBorderColor(null);
    
    // Reset the live preview to the original or confirmed color
    if (onEditDataChange) {
      const previewData = { 
        ...originalData, 
        ...pendingChanges
        // Don't include the temporary selected color
      };
      onEditDataChange(previewData);
    }
  }, [onEditDataChange, originalData, pendingChanges]);

  // Scroll-Position nach dem Speichern wiederherstellen, wenn Edit-Mode verlassen wurde
  useEffect(() => {
    if (!isEditMode && scrollPositionRef.current !== null) {
      window.scrollTo({ top: scrollPositionRef.current });
      scrollPositionRef.current = null;
    }
  }, [isEditMode]);

  return (
    <div className="max-w-lg ml-0 bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 relative">
      {/* Bestätigungsbanner nach dem Speichern */}
      {showProfileSavedBanner && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-xl shadow-lg z-50 text-sm font-semibold animate-fade-in-out">
          Profil erfolgreich gespeichert
        </div>
      )}
      {/* Bearbeitungsmodus-Badge */}
      {isEditMode && (
        <div className="absolute top-4 left-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
          {hasPendingChanges ? "Änderungen ausstehend" : "Bearbeitungsmodus"}
        </div>
      )}
      
      {/* Avatar-Bereich */}
      <div className="flex flex-col items-center gap-2 relative">
        <div className="flex items-center justify-center w-full mb-2">
          <Avatar className="w-32 h-32 border-4 shadow-md bg-gray-200 transition-all duration-200"
            style={{ borderColor: (selectedAvatarBorderColor && showColorConfirmation) ? selectedAvatarBorderColor : (getCurrentData('avatarBorderColor') || "#fff") }}
          >
            <AvatarImage src={getCurrentData('avatarUrl') || undefined} alt={getCurrentData('displayName') || "Avatar"} />
            <AvatarFallback>
              <span>{(getCurrentData('displayName') || "U").charAt(0).toUpperCase()}</span>
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            className="ml-4 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition border border-gray-200"
            onClick={() => setAvatarModalOpen(true)}
            title="Avatar ändern"
            style={{ alignSelf: 'flex-start' }}
          >
            <Camera className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        {/* Avatar-Rahmenfarbe Auswahl */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Avatar-Rahmenfarbe</label>
          <div className="flex gap-2 flex-wrap justify-center items-center bg-gray-50/60 rounded-xl px-4 py-2 border border-gray-100">
            {(isProUser ? PRO_AVATAR_BORDER_COLORS : AVATAR_BORDER_COLORS).map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:scale-110
                  ${getCurrentData('avatarBorderColor') === color ? 'ring-2 ring-black scale-110' : 'hover:ring-1 hover:ring-gray-400'}
                  ${color === '#fff' ? 'border-black' : 'border-transparent'}`}
                style={{ background: color, borderColor: color === '#fff' ? '#222' : color }}
                onClick={() => handleAvatarBorderColorSelect(color)}
                aria-label={`Rahmenfarbe ${color}`}
                tabIndex={0}
                title={`Rahmenfarbe: ${color}`}
              >
                {getCurrentData('avatarBorderColor') === color && (
                  <span className="block w-3 h-3 rounded-full bg-white border border-black shadow-sm" />
                )}
              </button>
            ))}
          </div>
          {/* Bestätigung für ausgewählte Farbe */}
          {showColorConfirmation && selectedAvatarBorderColor && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ background: selectedAvatarBorderColor }}
                  />
                  <span className="text-sm text-blue-700">
                    Neue Rahmenfarbe ausgewählt
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelAvatarBorderColor}
                    className="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                    title="Abbrechen"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAvatarBorderColor}
                    className="p-1 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                    title="Bestätigen"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
          {showConfirmedMessage && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-xs text-green-700">
                <Check className="w-3 h-3" />
                <span>Rahmenfarbe bestätigt</span>
              </div>
            </div>
          )}
        </div>
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