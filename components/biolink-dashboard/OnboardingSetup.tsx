'use client';
import React, { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

export function OnboardingSetup({ onComplete }: { onComplete: (data: any) => void }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File|null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string|null>(null);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const { startUpload, isUploading } = useUploadThing("avatar", {
    onUploadBegin: () => {
      console.log('[ONBOARDING] Upload beginning...');
    },
    onUploadError: (error) => {
      console.error('[ONBOARDING] Upload error:', error);
      setError(`Upload fehlgeschlagen: ${error.message}`);
    },
    onClientUploadComplete: (res) => {
      console.log('[ONBOARDING] Client upload complete:', res);
    },
    onUploadProgress: (progress) => {
      console.log('[ONBOARDING] Upload progress:', progress);
    },
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!name || !linkName || !linkUrl) {
      setError("Name und mindestens ein Link sind erforderlich.");
      setLoading(false);
      return;
    }

    try {
      let avatarUrl = undefined;
      
      // Upload avatar if selected
      if (avatar) {
        console.log('[ONBOARDING] Uploading avatar...');
        const uploadedFiles = await startUpload([avatar]);
        
        if (uploadedFiles && uploadedFiles[0]) {
          avatarUrl = uploadedFiles[0].url;
          console.log('[ONBOARDING] Avatar uploaded successfully:', avatarUrl);
        } else {
          console.error('[ONBOARDING] Avatar upload failed');
          setError("Avatar-Upload fehlgeschlagen. Bitte versuche es erneut.");
          setLoading(false);
          return;
        }
      }

      // Call parent completion handler
      onComplete({ 
        name, 
        bio, 
        avatarUrl, 
        links: [{ title: linkName, url: linkUrl }] 
      });
      
    } catch (error) {
      console.error('[ONBOARDING] Error during submission:', error);
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto mt-10 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="w-full flex flex-col gap-2 items-center">
        <label className="font-bold text-lg mb-2">Setup your page</label>
        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center mb-2 overflow-hidden">
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-gray-400">📷</span>
          )}
        </div>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleAvatarChange} 
          className="mb-2"
          disabled={loading || isUploading}
        />
        {isUploading && (
          <div className="text-sm text-blue-600">Avatar wird hochgeladen...</div>
        )}
      </div>
      <input
        type="text"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        autoComplete="name"
        required
        disabled={loading || isUploading}
      />
      <input
        type="text"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        placeholder="Bio"
        value={bio}
        onChange={e => setBio(e.target.value)}
        autoComplete="off"
        disabled={loading || isUploading}
      />
      <div className="w-full flex flex-col gap-2">
        <label className="font-semibold">Add your first link</label>
        <input
          type="text"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Link name (My Instagram)"
          value={linkName}
          onChange={e => setLinkName(e.target.value)}
          autoComplete="off"
          required
          disabled={loading || isUploading}
        />
        <input
          type="url"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="URL (https://instagram.com/yourname)"
          value={linkUrl}
          onChange={e => setLinkUrl(e.target.value)}
          autoComplete="url"
          required
          disabled={loading || isUploading}
        />
      </div>
      {error && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-sm text-center">{error}</div>
        </div>
      )}
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow hover:scale-[1.03] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading || isUploading}
      >
        {loading || isUploading ? "Speichere..." : "Get started"}
      </button>
    </form>
  );
} 