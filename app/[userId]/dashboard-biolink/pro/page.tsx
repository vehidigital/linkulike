'use client'

import React from "react";
import { ProFeatures } from "@/components/biolink-dashboard/ProFeatures";

export default function ProPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pro Features</h1>
        <p className="text-gray-600">Upgrade auf Pro für erweiterte Funktionen</p>
      </div>
      
      {/* Pro Features Content */}
      <ProFeatures />
    </div>
  );
} 