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
  isLoading: boolean
  saveSettings: () => Promise<void>
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
  const [settings, setSettings] = useState<DesignSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

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
        // Ensure isCustomTheme is properly set based on selectedTheme
        const isCustomTheme = data.selectedTheme === 'create-your-own'
        setSettings(prev => ({ 
          ...prev, 
          ...data,
          isCustomTheme: isCustomTheme,
          useCustomButtonTextColor: !!data.useCustomButtonTextColor, // Fix: immer Boolean
          showBranding: (data.showBranding === undefined || data.showBranding === null) ? true : data.showBranding // Fallback: immer true, außer explizit false
        }))
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
    setSettings(prev => {
      const newSettings = { ...prev, ...updates }
      
      // Ensure isCustomTheme is properly set when selectedTheme changes
      if (updates.selectedTheme) {
        newSettings.isCustomTheme = updates.selectedTheme === 'create-your-own'
      }
      
      return newSettings
    })
  }

  const saveSettings = async () => {
    try {
      console.log('saveSettings called with settings:', settings);
      const url = `/api/user/design?userId=${userId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not ok:', response.status, errorText);
        throw new Error(`Failed to save settings: ${response.status} ${errorText}`)
      }

      const result = await response.json();
      console.log('Design settings saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving design settings:', error)
      throw error
    }
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
    <DesignContext.Provider value={{ settings, updateSettings, isLoading, saveSettings }}>
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