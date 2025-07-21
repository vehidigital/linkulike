'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface DesignSettings {
  displayName: string
  bio: string
  selectedTheme: string
  isCustomTheme: boolean
  buttonStyle: 'filled' | 'outlined' | 'gradient'
  buttonColor: string
  buttonGradient?: string
  useCustomButtonTextColor?: boolean
  buttonTextColor?: string
  selectedFont: string
  socialPosition: 'top' | 'middle' | 'bottom'
  showBranding: boolean
  showShareButton: boolean
  backgroundType: 'color' | 'video' | 'image'
  backgroundImage?: string
  backgroundColor?: string
  avatarImage?: string
  originalAvatarImage?: string
  avatarShape?: 'circle' | 'rectangle'
  avatarBorderColor?: string
  textColor?: string
  backgroundOverlayType?: string
  backgroundOverlayColor?: string
  backgroundOverlayOpacity?: number
  displayNameColor?: string
  bioColor?: string
  usernameColor?: string
  footerColor?: string
}

interface DesignContextType {
  settings: DesignSettings
  updateSettings: (updates: Partial<DesignSettings>) => void
  updatePreview: (updates: Partial<DesignSettings>) => void
  resetPreview: () => void
  isLoading: boolean
  saveSettings: (override?: Partial<DesignSettings>) => Promise<void>
}

const defaultSettings: DesignSettings = {
  displayName: '',
  bio: '',
  selectedTheme: 'basics',
  isCustomTheme: false,
  buttonStyle: 'filled',
  buttonColor: '#3b82f6',
  buttonGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  useCustomButtonTextColor: false,
  buttonTextColor: '#ffffff',
  selectedFont: 'Inter',
  socialPosition: 'bottom', // 'top' | 'middle' | 'bottom'
  showBranding: true,
  showShareButton: false,
  backgroundType: 'color',
  backgroundImage: '',
  backgroundColor: '#1e3a8a',
  avatarImage: '',
  originalAvatarImage: '',
  avatarShape: 'circle',
  avatarBorderColor: '#ffffff',
  textColor: '#ffffff',
  backgroundOverlayType: 'dark',
  backgroundOverlayColor: '#000000',
  backgroundOverlayOpacity: 0.2,
  displayNameColor: '#ffffff',
  bioColor: '#ffffff',
  usernameColor: '#ffffff',
  footerColor: '#ffffff',
}

const DesignContext = createContext<DesignContextType | undefined>(undefined)

export function DesignProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const userId = params.userId as string;
  const [previewSettings, setPreviewSettings] = useState<DesignSettings>(defaultSettings)
  const [savedSettings, setSavedSettings] = useState<DesignSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load settings from API on mount
  useEffect(() => {
    loadSettings()
  }, [userId])

  const loadSettings = async () => {
    try {
      // Always use userId parameter since we're in a userId-specific route
      const url = `/api/user/design?userId=${userId}`;
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded design settings from API:', data);
        console.log('API GET: avatarBorderColor =', data.avatarBorderColor);
        // Ensure isCustomTheme is properly set based on selectedTheme
        const isCustomTheme = data.selectedTheme === 'create-your-own'
        const loadedSettings = { 
          ...defaultSettings, 
          ...data,
          isCustomTheme: isCustomTheme,
          useCustomButtonTextColor: !!data.useCustomButtonTextColor, // Fix: immer Boolean
          showBranding: (data.showBranding === undefined || data.showBranding === null) ? true : data.showBranding // Fallback: immer true, außer explizit false
        };
        setPreviewSettings(loadedSettings);
        setSavedSettings(loadedSettings);
        setIsInitialized(true)
      } else {
        // If API fails, still mark as initialized to prevent showing loading forever
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Error loading design settings:', error)
      // If API fails, still mark as initialized to prevent showing loading forever
      setIsInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = (updates: Partial<DesignSettings>) => {
    console.log('💾 updateSettings called with:', updates);
    console.log('💾 Current previewSettings before update:', previewSettings);
    console.log('💾 Current savedSettings before update:', savedSettings);
    
    setPreviewSettings(prev => {
      const newSettings = { ...prev, ...updates }
      
      // Ensure isCustomTheme is properly set when selectedTheme changes
      if (updates.selectedTheme) {
        newSettings.isCustomTheme = updates.selectedTheme === 'create-your-own'
      }
      
      console.log('💾 New previewSettings after update:', newSettings);
      return newSettings
    })
    
    // Also update saved settings
    setSavedSettings(prev => {
      const newSettings = { ...prev, ...updates }
      
      // Ensure isCustomTheme is properly set when selectedTheme changes
      if (updates.selectedTheme) {
        newSettings.isCustomTheme = updates.selectedTheme === 'create-your-own'
      }
      
      console.log('💾 New savedSettings after update:', newSettings);
      return newSettings
    })
    
    // Debug: Log the current state after updates
    setTimeout(() => {
      console.log('💾 State after updateSettings - previewSettings:', {
        backgroundColor: previewSettings.backgroundColor,
        avatarBorderColor: previewSettings.avatarBorderColor,
        socialPosition: previewSettings.socialPosition,
        showBranding: previewSettings.showBranding,
        showShareButton: previewSettings.showShareButton,
        selectedFont: previewSettings.selectedFont
      });
      console.log('💾 State after updateSettings - savedSettings:', {
        backgroundColor: savedSettings.backgroundColor,
        avatarBorderColor: savedSettings.avatarBorderColor,
        socialPosition: savedSettings.socialPosition,
        showBranding: savedSettings.showBranding,
        showShareButton: savedSettings.showShareButton,
        selectedFont: savedSettings.selectedFont
      });
    }, 0);
  }

  const updatePreview = (updates: Partial<DesignSettings>) => {
    console.log('👁️ updatePreview called with:', updates);
    console.log('👁️ Current previewSettings before update:', previewSettings);
    
    // Only update the preview state, don't update saved settings
    setPreviewSettings(prev => {
      const newSettings = { ...prev, ...updates }
      
      // Ensure isCustomTheme is properly set when selectedTheme changes
      if (updates.selectedTheme) {
        newSettings.isCustomTheme = updates.selectedTheme === 'create-your-own'
      }
      
      console.log('👁️ New previewSettings after update:', newSettings);
      return newSettings
    })
  }

  const saveSettings = async (override: Partial<DesignSettings> = {}) => {
    if (isSaving) return; // Verhindere parallele Saves
    setIsSaving(true);
    try {
      const settingsToSave = { ...previewSettings, ...override };
      console.log('💾 saveSettings called with settingsToSave:', settingsToSave);
      console.log('💾 Sende an API: avatarBorderColor =', settingsToSave.avatarBorderColor);
      const url = `/api/user/design?userId=${userId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not ok:', response.status, errorText);
        throw new Error(`Failed to save settings: ${response.status} ${errorText}`);
      }
      const result = await response.json();
      console.log('💾 Design settings saved successfully:', result);
      setSavedSettings({ ...settingsToSave });
      setIsSaving(false);
      return result;
    } catch (error) {
      setIsSaving(false);
      console.error('💾 Error saving design settings:', error)
    }
  }

  const resetPreview = () => {
    console.log('🔄 resetPreview called');
    console.log('🔄 Current previewSettings:', previewSettings);
    console.log('🔄 Saved settings to restore:', savedSettings);
    
    // Reset preview to saved settings
    setPreviewSettings(savedSettings);
    
    console.log('🔄 resetPreview completed');
  }

  // Don't render children until we've at least attempted to load settings
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <DesignContext.Provider value={{ settings: previewSettings, updateSettings, updatePreview, resetPreview, isLoading, saveSettings }}>
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign() {
  const context = useContext(DesignContext)
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider')
  }
  return context
} 