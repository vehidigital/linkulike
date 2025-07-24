'use client'

import React, { useEffect, useState } from "react";
import { useDesign } from "./DesignContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { getThemeTemplate } from "@/lib/theme-templates";
import { getContrastColor } from "@/lib/color-utils";
import { socialPlatforms } from "@/lib/social-icons";
import { Share2, Instagram, Youtube, Facebook, Twitter, Linkedin, Github, Link as LinkIcon, Music, MessageCircle, Twitch, Apple, ShoppingBag, BookOpen, Figma, Dribbble, Mail, Club, Signal, Camera, Coffee, Gift, Globe, Phone, MapPin, User } from "lucide-react";
import { Star, Sparkles, Zap, Heart, Crown } from "lucide-react";
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { eventEmitter, EVENTS } from "@/lib/events";
import { ProfileView } from '@/components/ProfileView';
import { SocialIcon } from 'react-social-icons';

function getCustomSocialIcon(url: string) {
  if (url.includes('onlyfans.com')) {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#00AFF0"/><path d="M23.5 13.5c0 3.59-2.91 6.5-6.5 6.5s-6.5-2.91-6.5-6.5 2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5zm-6.5 3.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" fill="#fff"/></svg>
    );
  }
  if (url.includes('telegram.me') || url.includes('t.me')) {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#0088CC"/><path d="M23.5 10.5l-2.5 11c-.2.8-.7 1-1.4.6l-3.8-2.8-1.8.9c-.2.1-.4 0-.5-.2l-.5-1.7-2.1-.7c-.7-.2-.7-.7.1-1l12-4.7c.6-.2 1 .1.8.8z" fill="#fff"/></svg>
    );
  }
  return null;
}

interface Social {
  id: string;
  platform: string;
  value: string; // Use 'value' field as per Prisma schema
}

interface Link {
  id: string;
  title: string;
  url: string;
  imageUrl?: string;
  highlight?: boolean;
  highlightStyle?: string;
  analytics?: { totalClicks?: number };
}

export function LivePreview({ reloadLinks, reloadSocials, isCompact = false }: { reloadLinks?: number, reloadSocials?: number, isCompact?: boolean }) {
  const { settings } = useDesign();
  
  // Debug: Log settings changes
  useEffect(() => {
    console.log('🎨 LivePreview settings updated:', {
      backgroundColor: settings.backgroundColor,
      avatarBorderColor: settings.avatarBorderColor,
      backgroundType: settings.backgroundType,
      selectedTheme: settings.selectedTheme,
      isCustomTheme: settings.isCustomTheme,
      selectedFont: settings.selectedFont,
      buttonColor: settings.buttonColor,
      buttonTextColor: settings.buttonTextColor,
      textColor: settings.textColor,
      socialPosition: settings.socialPosition,
      showBranding: settings.showBranding,
      showShareButton: settings.showShareButton
    });
  }, [settings]);
  
  // Debug: Log when component re-renders
  console.log('🎨 LivePreview re-rendering with settings:', {
    backgroundColor: settings.backgroundColor,
    avatarBorderColor: settings.avatarBorderColor,
    backgroundType: settings.backgroundType,
    selectedTheme: settings.selectedTheme,
    isCustomTheme: settings.isCustomTheme,
    selectedFont: settings.selectedFont,
    buttonColor: settings.buttonColor,
    buttonTextColor: settings.buttonTextColor,
    textColor: settings.textColor,
    socialPosition: settings.socialPosition,
    showBranding: settings.showBranding,
    showShareButton: settings.showShareButton
  });
  
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socials, setSocials] = useState<Social[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const params = useParams();
  const userId = params.userId as string;
  


  // Lade User-Daten
  useEffect(() => {
    async function fetchUserData() {
      try {
        const url = `/api/user/profile?userId=${userId}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    }
    fetchUserData();
  }, [userId]);

  // Lade Links und Socials beim Mount und bei Änderungen
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch links
        const linksUrl = `/api/links?userId=${userId}`;
        const linksRes = await fetch(linksUrl);
        if (linksRes.ok) {
          const linksData = await linksRes.json();
          setLinks(linksData);
        }

        // Fetch socials
        const socialsUrl = `/api/user/socials?userId=${userId}`;
        const socialsRes = await fetch(socialsUrl);
        if (socialsRes.ok) {
          const socialsData = await socialsRes.json();
          setSocials(Array.isArray(socialsData) ? socialsData : []);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setLinks([]);
        setSocials([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, reloadLinks, reloadSocials]);

  // Listen for events
  useEffect(() => {
    const handleLinksUpdate = () => {
      const fetchData = async () => {
        try {
          const linksUrl = `/api/links?userId=${userId}`;
          const linksRes = await fetch(linksUrl);
          if (linksRes.ok) {
            const linksData = await linksRes.json();
            setLinks(linksData);
          }
        } catch (err) {
          console.error('Error loading links:', err);
        }
      };
      fetchData();
    };

    const handleSocialsUpdate = () => {
      const fetchData = async () => {
        try {
          const socialsUrl = `/api/user/socials?userId=${userId}`;
          const socialsRes = await fetch(socialsUrl);
          if (socialsRes.ok) {
            const socialsData = await socialsRes.json();
            setSocials(Array.isArray(socialsData) ? socialsData : []);
          }
        } catch (err) {
          console.error('Error loading socials:', err);
        }
      };
      fetchData();
    };

    eventEmitter.on(EVENTS.LINKS_UPDATED, handleLinksUpdate);
    eventEmitter.on(EVENTS.SOCIALS_UPDATED, handleSocialsUpdate);

    return () => {
      eventEmitter.off(EVENTS.LINKS_UPDATED, handleLinksUpdate);
      eventEmitter.off(EVENTS.SOCIALS_UPDATED, handleSocialsUpdate);
    };
  }, [userId]);

  const getBackgroundStyle = () => {
    const theme = getThemeTemplate(settings.selectedTheme);
    
    console.log('🎨 getBackgroundStyle called with:', {
      backgroundType: settings.backgroundType,
      backgroundColor: settings.backgroundColor,
      selectedTheme: settings.selectedTheme,
      isCustomTheme: settings.isCustomTheme,
      theme: theme?.id
    });
    
    // Always use custom settings if backgroundType is explicitly set
    if (settings.backgroundType) {
      switch (settings.backgroundType) {
        case 'image':
          console.log('🎨 Using image background:', settings.backgroundImage);
          return {
            backgroundImage: `url("${settings.backgroundImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          };
        case 'color':
          console.log('🎨 Using color background:', settings.backgroundColor);
          return {
            backgroundColor: settings.backgroundColor || '#1e3a8a'
          };
        case 'video':
          console.log('🎨 Using video background');
          return {
            backgroundColor: '#000000', // Platzhalter für Video
          };
        default:
          break;
      }
    }
    
    // If using a predefined theme (not custom), use theme background
    if (theme && !settings.isCustomTheme) {
      console.log('🎨 Using theme background:', theme.id);
      if (theme.styles.backgroundGradient) {
        return {
          background: theme.styles.backgroundGradient,
        };
      } else if (theme.styles.backgroundColor) {
        return {
          backgroundColor: theme.styles.backgroundColor,
        };
      }
    }
    
    // Fallback: use custom background color
    console.log('🎨 Using fallback background color:', settings.backgroundColor);
    return {
      backgroundColor: settings.backgroundColor || '#1e3a8a'
    };
  };

  const getTextColor = () => {
    const theme = getThemeTemplate(settings.selectedTheme);
    
    console.log('🎨 getTextColor called with:', {
      textColor: settings.textColor,
      selectedTheme: settings.selectedTheme,
      isCustomTheme: settings.isCustomTheme,
      themeTextColor: theme?.styles.textColor
    });
    
    // If using a predefined theme (not custom), use theme text color
    if (theme && !settings.isCustomTheme) {
      console.log('🎨 Using theme text color:', theme.styles.textColor);
      return theme.styles.textColor || '#000000';
    }
    
    // Otherwise use custom settings
    console.log('🎨 Using custom text color:', settings.textColor);
    return settings.textColor || '#000000'; // Standard: schwarzer Text
  };

  const getFontFamily = () => {
    console.log('🎨 getFontFamily called with:', {
      selectedFont: settings.selectedFont
    });
    
    // Mapping für alle Standardfonts
    const fontMap: Record<string, string> = {
      'system-ui, Arial, Helvetica, sans-serif': 'system-ui, Arial, Helvetica, sans-serif',
      'Arial, Helvetica, sans-serif': 'Arial, Helvetica, sans-serif',
      'Verdana, Geneva, sans-serif': 'Verdana, Geneva, sans-serif',
      'Tahoma, Geneva, sans-serif': 'Tahoma, Geneva, sans-serif',
      'Georgia, Times New Roman, serif': 'Georgia, Times New Roman, serif',
      'Times New Roman, Times, serif': 'Times New Roman, Times, serif',
      'Menlo, Monaco, Consolas, monospace': 'Menlo, Monaco, Consolas, monospace',
      'Courier New, Courier, monospace': 'Courier New, Courier, monospace',
      'Arial Rounded MT Bold, system-ui, sans-serif': 'Arial Rounded MT Bold, system-ui, sans-serif',
      'Comic Sans MS, Comic Sans, cursive, sans-serif': 'Comic Sans MS, Comic Sans, cursive, sans-serif',
      'Inter': 'Inter, system-ui, Arial, Helvetica, sans-serif',
      'Roboto': 'Roboto, system-ui, Arial, Helvetica, sans-serif',
      'Open Sans': 'Open Sans, system-ui, Arial, Helvetica, sans-serif',
      'Lato': 'Lato, system-ui, Arial, Helvetica, sans-serif',
      'Poppins': 'Poppins, system-ui, Arial, Helvetica, sans-serif',
      'Montserrat': 'Montserrat, system-ui, Arial, Helvetica, sans-serif',
      'Source Sans Pro': 'Source Sans Pro, system-ui, Arial, Helvetica, sans-serif',
      'Raleway': 'Raleway, system-ui, Arial, Helvetica, sans-serif',
      'Ubuntu': 'Ubuntu, system-ui, Arial, Helvetica, sans-serif',
      'Nunito': 'Nunito, system-ui, Arial, Helvetica, sans-serif',
    };
    if (settings.selectedFont && fontMap[settings.selectedFont]) {
      console.log('🎨 Using mapped font:', fontMap[settings.selectedFont]);
      return fontMap[settings.selectedFont];
    }
    console.log('🎨 Using default font');
    return 'system-ui, Arial, Helvetica, sans-serif';
  };

  const getButtonStyle = () => {
    const theme = getThemeTemplate(settings.selectedTheme);
    
    console.log('🎨 getButtonStyle called with:', {
      buttonStyle: settings.buttonStyle,
      buttonColor: settings.buttonColor,
      buttonTextColor: settings.buttonTextColor,
      useCustomButtonTextColor: settings.useCustomButtonTextColor,
      selectedTheme: settings.selectedTheme,
      isCustomTheme: settings.isCustomTheme
    });
    
    // If using a predefined theme (not custom), use theme button style
    if (theme && !settings.isCustomTheme) {
      console.log('🎨 Using theme button style:', theme.id);
      if (theme.styles.buttonStyle === 'filled') {
        return {
          backgroundColor: theme.styles.buttonColor || '#000000',
          color: theme.styles.textColor || '#ffffff'
        };
      } else if (theme.styles.buttonStyle === 'outlined') {
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${theme.styles.buttonColor || '#000000'}`,
          color: theme.styles.buttonColor || '#000000'
        };
      } else if (theme.styles.buttonStyle === 'gradient') {
        return {
          background: theme.styles.buttonGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff'
        };
      }
    }
    
    // Otherwise use custom settings
    console.log('🎨 Using custom button style:', settings.buttonStyle);
    if (settings.buttonStyle === 'filled') {
      return {
        backgroundColor: settings.buttonColor || '#000000',
        color: settings.useCustomButtonTextColor
          ? (settings.buttonTextColor || '#ffffff')
          : getContrastColor(settings.buttonColor || '#000000')
      };
    } else if (settings.buttonStyle === 'outlined') {
      return {
        backgroundColor: 'transparent',
        border: `2px solid ${settings.buttonColor || '#000000'}`,
        color: settings.useCustomButtonTextColor
          ? (settings.buttonTextColor || '#000000')
          : getContrastColor(settings.buttonColor || '#000000')
      };
    } else if (settings.buttonStyle === 'gradient') {
      // Handle gradient button style
      return {
        background: settings.buttonGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: settings.useCustomButtonTextColor
          ? (settings.buttonTextColor || '#ffffff')
          : '#ffffff' // Default white text for gradients
      };
    } else {
      // Fallback: immer wie 'filled'
      return {
        backgroundColor: settings.buttonColor || '#000000',
        color: settings.useCustomButtonTextColor
          ? (settings.buttonTextColor || '#ffffff')
          : '#ffffff' // Default white text for dark backgrounds
      };
    }
  };

  // Social-Icons Mapping
  const socialIcons = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
    tiktok: Music,
    snapchat: MessageCircle,
    twitch: Twitch,
    discord: MessageCircle,
    telegram: MessageCircle,
    whatsapp: MessageCircle,
    spotify: Music,
    apple: Apple,
    soundcloud: Music,
    pinterest: ShoppingBag,
    reddit: BookOpen,
    behance: Figma,
    dribbble: Dribbble,
    figma: Figma,
    notion: BookOpen,
    medium: BookOpen,
    substack: Mail,
    clubhouse: Club,
    signal: Signal,
    cameo: Camera,
    buymeacoffee: Coffee,
    kofi: Coffee,
    patreon: Gift,
    onlyfans: Heart,
    producthunt: ShoppingBag,
    appstore: Apple,
    googleplay: ShoppingBag,
    website: Globe,
    email: Mail,
    phone: Phone,
    address: MapPin,
  };

  // Get Social Icon
  function getSocialIcon(platform: string): string {
    return '🔗';
  }

  function getHighlightIcon(style: string = "star") {
    const iconMap = {
      star: <Star className="w-4 h-4 text-yellow-300" fill="#fde68a" />,
      sparkle: <Sparkles className="w-4 h-4 text-purple-300" />,
      shake: <Zap className="w-4 h-4 text-blue-300" />,
      pulse: <Heart className="w-4 h-4 text-red-300" />,
      glow: <Crown className="w-4 h-4 text-yellow-400" />,
    };
    return iconMap[style as keyof typeof iconMap] || iconMap.star;
  }

  function getHighlightClasses(style: string = "star") {
    const baseClasses = "ring-2";
    const styleClasses = {
      star: "ring-yellow-400",
      sparkle: "ring-purple-400",
      shake: "ring-blue-400 animate-bounce",
      pulse: "ring-red-400 animate-pulse",
      glow: "ring-yellow-500 shadow-lg shadow-yellow-500/50",
    };
    return `${baseClasses} ${styleClasses[style as keyof typeof styleClasses] || styleClasses.star}`;
  }

  // State für Infoboxen
  const [infoBox, setInfoBox] = useState<{ type: string; content: string; x: number; y: number } | null>(null);

  // Social-Icons-Element (intelligente symmetrische Verteilung)
  const SocialIconsBar = socials.length > 0 ? (
    <div className="max-w-xs mx-auto relative px-12 pt-4 pb-12">
      {(() => {
        const totalIcons = socials.length;
        const iconsPerRow = Math.min(4, totalIcons);
        return (
          <div
            className={`grid justify-center gap-8 ${iconsPerRow === 1 ? 'grid-cols-1' : iconsPerRow === 2 ? 'grid-cols-2' : iconsPerRow === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}
            style={{ width: '100%' }}
          >
            {socials.map((s) => (
              <a key={s.id} href={s.value} target="_blank" rel="noopener noreferrer" className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 w-8 h-8" title={s.platform}>
                <SocialIcon url={s.value} network={s.platform} style={{ width: 22, height: 22 }} bgColor="#fff" fgColor="#222" />
              </a>
            ))}
          </div>
        );
      })()}
      {/* InfoBox */}
      {infoBox && (
        <div 
          className="absolute z-50 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/50 p-3 max-w-xs"
          style={{
            left: `${infoBox.x}px`,
            top: `${infoBox.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {infoBox.type === 'email' ? '📧' : 
               infoBox.type === 'phone' ? '📞' : '📍'}
            </span>
            <span className="font-semibold text-sm capitalize">
              {infoBox.type === 'email' ? 'E-Mail' : 
               infoBox.type === 'phone' ? 'Telefon' : 'Adresse'}
            </span>
          </div>
          <p className="text-sm text-gray-700 break-words">{infoBox.content}</p>
          <button
            onClick={() => setInfoBox(null)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  ) : null;

  // Kompakter Modus für das Layout
  if (isCompact) {
    // Hole userId aus userData (username oder id), Fallback auf 'demo'
    const userId = userData?.username || userData?.id || 'demo';
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-100">
        <div className="relative w-[400px] h-[850px] rounded-[2.5rem] shadow-2xl border-4 border-black overflow-hidden">
          <iframe
            src={`/${userId}?preview=1`}
            className="w-full h-full"
            style={{ border: 'none', borderRadius: '2.5rem' }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    );
  }

  // Standard-Modus: ProfileView verwenden
  return (
    <ProfileView
      userData={userData}
      links={links}
      socials={socials}
      settings={settings}
    />
  );
} 