'use client'

import React from "react";
import { 
  ProfileCard, 
  BackgroundCard, 
  ThemesCard, 
  ButtonCard, 
  FontCard, 
  SocialPositionCard, 
  BrandingCard,
  ShareButtonCard
} from "@/components/biolink-dashboard/DesignCards";
import { useDesign } from "@/components/biolink-dashboard/DesignContext";

export default function DesignPage() {
  const { settings } = useDesign();
  
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Design</h1>
        <p className="text-gray-600">Passe das Aussehen deiner Bio Link Seite an</p>
      </div>
      
      {/* Content Cards */}
      <div className="space-y-6">
        <ProfileCard />
        <ThemesCard />
        {settings.isCustomTheme && <>
          <BackgroundCard />
          <ButtonCard />
          <FontCard />
        </>}
        <SocialPositionCard />
        <BrandingCard />
        <ShareButtonCard />
      </div>
    </div>
  );
} 