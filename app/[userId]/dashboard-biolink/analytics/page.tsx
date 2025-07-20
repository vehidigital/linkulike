'use client'

import React from "react";
import { Analytics } from "@/components/biolink-dashboard/Analytics";

export default function AnalyticsPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Verfolge die Performance deiner Bio Link Seite</p>
      </div>
      
      {/* Analytics Content */}
      <Analytics />
    </div>
  );
} 