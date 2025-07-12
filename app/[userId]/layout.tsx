import React from "react";
import { ProfileProvider } from "@/components/profile/ProfileContext";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
} 