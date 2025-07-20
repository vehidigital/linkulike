'use client'

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Verwalte deine Account-Einstellungen</p>
      </div>
      
      {/* Settings Content */}
      <div className="space-y-6">
        {/* Preferred link */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred link</CardTitle>
            <CardDescription>This is an aesthetic choice. Both links are usable.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue="bio-link" className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bio-link" id="bio-link" />
                <Label htmlFor="bio-link" className="font-medium">bio.link/reich2102</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="username-link" id="username-link" />
                <Label htmlFor="username-link" className="font-medium">reich2102.bio.link</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* NSFW warning */}
        <Card>
          <CardHeader>
            <CardTitle>NSFW warning</CardTitle>
            <CardDescription>Show a warning before displaying your page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch id="nsfw-warning" />
              <Label htmlFor="nsfw-warning">Enable NSFW warning</Label>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>Choose the title and description to appear on search engines and social posts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seo-title">Title</Label>
              <Input id="seo-title" placeholder="Enter SEO title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-description">Description (max 160 chars)</Label>
              <Input id="seo-description" placeholder="Enter SEO description" maxLength={160} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 