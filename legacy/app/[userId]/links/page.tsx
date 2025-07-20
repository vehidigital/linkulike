"use client";
import React from "react";
import { LivePreview } from "@/components/biolink-dashboard/LivePreview";
import LinkEditor from "@/components/dashboard/LinkEditor";
import { useProfile } from "@/components/profile/ProfileContext";

export default function UserLinksPage() {
  const { links, updateLinks, fetchProfile } = useProfile();
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
          <LinkEditor 
            links={links} 
            onUpdate={updateLinks} 
            onDelete={async (linkId) => {
              try {
                const response = await fetch(`/api/links/${linkId}`, {
                  method: "DELETE",
                });
                if (response.ok) {
                  const newLinks = links.filter(link => link.id !== linkId);
                  updateLinks(newLinks);
                  await fetchProfile();
                }
              } catch (error) {
                console.error('Delete error:', error);
              }
            }} 
          />
        </div>
      </div>
    </>
  );
}
