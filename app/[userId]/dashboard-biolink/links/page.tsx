'use client';
import React, { useState } from "react";
import { AddLinkCard } from "@/components/biolink-dashboard/AddLinkCard";
import { LinkListCard } from "@/components/biolink-dashboard/LinkListCard";
import { SocialsCard } from "@/components/biolink-dashboard/SocialsCard";

interface LinksPageProps {
  onLinkChanged?: () => void;
  onSocialChanged?: () => void;
}

export default function LinksPage({ onLinkChanged, onSocialChanged }: LinksPageProps) {
  const [reloadLinks, setReloadLinks] = useState(0);
  const [reloadSocials, setReloadSocials] = useState(0);
  
  const handleLinkChanged = () => {
    setReloadLinks(r => r + 1);
    onLinkChanged?.();
  };
  
  const handleSocialChanged = () => {
    setReloadSocials(r => r + 1);
    onSocialChanged?.();
  };
  
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Links</h1>
        <p className="text-gray-600">Verwalte deine Links und Social Media Profile</p>
      </div>
      
      {/* Content Cards */}
      <div className="space-y-6">
        <AddLinkCard onLinkAdded={handleLinkChanged} />
        <LinkListCard reloadLinks={reloadLinks} onLinkChanged={handleLinkChanged} />
        <SocialsCard onSocialChanged={handleSocialChanged} />
      </div>
    </div>
  );
} 