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
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  editProfile?: { displayName: string; bio: string; avatarUrl: string } | null;
  setEditProfile?: (profile: { displayName: string; bio: string; avatarUrl: string }) => void;
  fetchProfile?: () => void;
  isProUser: boolean;
}

export default function ProfileEditor({ profile, onUpdate, editProfile, setEditProfile, fetchProfile, isProUser }: ProfileEditorProps) {
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
  const t = getTranslations(lang);

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
        setEditData(prev => ({ ...prev, avatarUrl }));
        if (setEditProfile) setEditProfile({ 
          displayName: editData.displayName, 
          bio: editData.bio, 
          avatarUrl 
        });
        
        // Save to profile
        try {
          const response = await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...editData, avatarUrl }),
          });
          
          if (response.ok) {
            const updatedProfile = await response.json();
            onUpdate(updatedProfile);
            if (typeof fetchProfile === 'function') fetchProfile();
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
    setEditorOpen(false);
    setIsLoading(true);
    try {
      const blob = await (await fetch(croppedDataUrl)).blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      await startUpload([file]);
    } catch (e) {
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
    const url = `${window.location.origin}/${profile.username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: t.linkCopied, description: "Profil-Link wurde in die Zwischenablage kopiert" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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

  const publicUrl = `${window.location.origin}/${profile.username}`;

  return (
    <div className="space-y-6">
      {/* Profile URL Section */}
      <Card>
        <CardHeader>
                  <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {t.profileLink}
        </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
              <code className="text-sm text-gray-700">{publicUrl}</code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyProfileUrl}
              className="flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t.copied : t.copy}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Username Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.username}</span>
            <Dialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canChangeUsername()}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {t.changeUsername}
                </Button>
              </DialogTrigger>
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-lg font-mono">
              @{profile.username}
            </Badge>
            {!canChangeUsername() && (
              <Badge variant="outline" className="text-xs">
                {t.changeableOn.replace('{date}', getNextUsernameChangeDate()?.toLocaleDateString() || '')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.profileInformation}</span>
            {!isEditMode ? (
                              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {t.edit}
                </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {t.cancel}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t.save}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditMode ? (
            // View Mode
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatarUrl || undefined} alt="Avatar" />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{profile.displayName || t.noNameSet}</h3>
                  <p className="text-gray-600">@{profile.username}</p>
                </div>
              </div>
              
              {/* Bio */}
              {profile.bio && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">{t.bio}</h4>
                  <p className="text-gray-900 whitespace-pre-line">{profile.bio}</p>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-4">
                <label className="text-sm font-medium">{t.avatar}</label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={editData.avatarUrl || undefined} alt="Avatar" />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAvatarEdit}
                      className="flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      {t.newPhoto}
                    </Button>
                    {editData.avatarUrl && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAvatarEditExisting}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          {t.editPhoto}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveAvatar}
                          disabled={isLoading}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                          {t.removePhoto}
                        </Button>
                      </>
                    )}
                  </div>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.displayName}</label>
                <Input
                  value={editData.displayName}
                  onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder={t.yourName}
                  maxLength={30}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.bio}</label>
                <Textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={t.tellAboutYourself}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500">
                  {editData.bio.length}/160 {t.characters}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avatar Editor Modal */}
      {editorOpen && selectedImage && (
        <AvatarEditor
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleAvatarEditorCancel}
        />
      )}
    </div>
  );
} 