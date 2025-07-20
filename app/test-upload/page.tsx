'use client';

import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { startUpload, isUploading } = useUploadThing("avatar", {
    onUploadBegin: () => {
      console.log("Upload beginning...");
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setError(`Upload fehlgeschlagen: ${error.message}`);
    },
    onClientUploadComplete: (res) => {
      console.log("Client upload complete:", res);
    },
    onUploadProgress: (progress) => {
      console.log("Upload progress:", progress);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Bitte wähle eine Datei aus");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadedFiles = await startUpload([file]);
      
      if (uploadedFiles && uploadedFiles[0]) {
        setUploadedUrl(uploadedFiles[0].url);
        console.log("Upload successful:", uploadedFiles[0]);
      } else {
        setError("Upload fehlgeschlagen");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload fehlgeschlagen: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">UploadThing Test (Onboarding Mode)</h1>
        <p className="text-sm text-gray-600 mb-6">
          Diese Seite testet UploadThing ohne Session (Onboarding-Modus)
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Datei auswählen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={loading || isUploading}
            />
          </div>

          {file && (
            <div>
              <p className="text-sm text-gray-600">Ausgewählte Datei: {file.name}</p>
              <p className="text-sm text-gray-600">Größe: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading || isUploading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || isUploading ? "Upload läuft..." : "Upload starten"}
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {uploadedUrl && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-600 text-sm mb-2">Upload erfolgreich!</p>
              <img src={uploadedUrl} alt="Uploaded" className="w-full h-32 object-cover rounded" />
              <p className="text-xs text-gray-500 mt-2 break-all">{uploadedUrl}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 