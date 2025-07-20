"use client";
import React from "react";
import { LivePreview } from "@/components/biolink-dashboard/LivePreview";
import ProfileEditor from "@/components/dashboard/ProfileEditor";
import { useProfile } from "@/components/profile/ProfileContext";

export default function UserProfilePage() {
  const { profile, updateProfile } = useProfile();
  return (
    <>
      {/* Linke Spalte: Live-Preview */}
      <div className="w-full lg:w-1/2 lg:sticky lg:top-24 lg:h-fit">
        <div className="flex justify-center lg:justify-end lg:pr-8">
          <LivePreview />
        </div>
      </div>
      {/* Rechte Spalte: Content */}
      <div className="w-full lg:w-1/2 lg:pl-8">
        <div className="flex flex-col gap-6 max-w-md mx-auto lg:mx-0">
          <ProfileEditor 
            profile={profile} 
            onUpdate={updateProfile} 
            fetchProfile={() => {}}
            isProUser={false}
            isEditMode={false}
            setIsEditMode={() => {}}
            onEditDataChange={() => {}}
          />
        </div>
      </div>
    </>
  );
}
