"use client";
import React from "react";
import { LivePreview } from "@/components/biolink-dashboard/LivePreview";
import ThemeEditor from "@/components/dashboard/ThemeEditor";
import { useProfile } from "@/components/profile/ProfileContext";
import { PendingChangesBanner } from "@/components/ui/pending-changes-banner";

export default function UserDesignPage() {
  const { profile, updatePendingProfile, commitPendingProfile, discardPendingProfile } = useProfile();
  return (
    <>
      {/* Linke Spalte: Live-Preview */}
      <div className="w-full lg:w-1/2 lg:sticky lg:top-24 lg:h-fit">
        <div className="flex justify-center lg:justify-end lg:pr-8">
          <LivePreview />
        </div>
      </div>
      {/* Rechte Spalte: Cards */}
      <div className="w-full lg:w-1/2 lg:pl-8">
        <div className="flex flex-col gap-6 max-w-md mx-auto lg:mx-0">
          <PendingChangesBanner className="mb-2" />
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 flex flex-col gap-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Themes</h2>
            <ThemeEditor 
              profile={profile} 
              onUpdate={commitPendingProfile}
              isProUser={false}
              setPendingProfile={updatePendingProfile}
              onDiscard={discardPendingProfile}
            />
          </div>
        </div>
      </div>
    </>
  );
}
