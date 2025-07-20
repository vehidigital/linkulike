'use client'

import React, { useEffect, useState } from "react";
import { useDesign } from "./DesignContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { getThemeTemplate } from "@/lib/theme-templates";
import { getContrastColor } from "@/lib/color-utils";
import { socialPlatforms } from "@/lib/social-icons";
import { Share2, Instagram, Youtube, Facebook, Twitter, Linkedin, Github, Link as LinkIcon, Music, MessageCircle, Twitch, Apple, ShoppingBag, BookOpen, Figma, Dribbble, Mail, Club, Signal, Camera, Coffee, Gift, Globe, Phone, MapPin } from "lucide-react";
import { Star, Sparkles, Zap, Heart, Crown } from "lucide-react";
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { eventEmitter, EVENTS } from "@/lib/events";

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
    
    // If using a predefined theme (not custom), use theme background
    if (theme && !settings.isCustomTheme) {
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
    
    // Otherwise use custom settings
    switch (settings.backgroundType) {
      case 'image':
        return {
          backgroundImage: `url("${settings.backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      case 'color':
        return {
          backgroundColor: settings.backgroundColor
        };
      case 'video':
        return {
          backgroundColor: '#000000', // Platzhalter für Video
        };
      default:
        // Standard: heller Hintergrund
        return {
          backgroundColor: '#ffffff'
        };
    }
  };

  const getTextColor = () => {
    const theme = getThemeTemplate(settings.selectedTheme);
    
    // If using a predefined theme (not custom), use theme text color
    if (theme && !settings.isCustomTheme) {
      return theme.styles.textColor || '#000000';
    }
    
    // Otherwise use custom settings
    return settings.textColor || '#000000'; // Standard: schwarzer Text
  };

  const getFontFamily = () => {
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
    };
    if (settings.selectedFont && fontMap[settings.selectedFont]) {
      return fontMap[settings.selectedFont];
    }
    return 'system-ui, Arial, Helvetica, sans-serif';
  };

  const getButtonStyle = () => {
    const theme = getThemeTemplate(settings.selectedTheme);
    
    // If using a predefined theme (not custom), use theme button style
    if (theme && !settings.isCustomTheme) {
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
    if (settings.buttonStyle === 'filled') {
      return {
        backgroundColor: settings.buttonColor,
        color: settings.useCustomButtonTextColor
          ? (settings.buttonTextColor || '#ffffff')
          : getContrastColor(settings.buttonColor || '#000000')
      };
    } else if (settings.buttonStyle === 'outlined') {
      return {
        backgroundColor: 'transparent',
        border: `2px solid ${settings.buttonColor}`,
        color: settings.useCustomButtonTextColor
          ? (settings.buttonTextColor || '#ffffff')
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
        backgroundColor: settings.buttonColor,
        color: settings.useCustomButtonTextColor
          ? (settings.buttonTextColor || '#ffffff')
          : getContrastColor(settings.buttonColor || '#000000')
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
    <div className="max-w-xs mx-auto relative">
      {(() => {
        const totalIcons = socials.length;
        
        // Intelligente Verteilung für perfekte Symmetrie
        let firstRowCount, secondRowCount;
        
        if (totalIcons <= 3) {
          // 1-3 Icons: Alle in eine Reihe
          firstRowCount = totalIcons;
          secondRowCount = 0;
        } else if (totalIcons === 4) {
          // 4 Icons: 2+2
          firstRowCount = 2;
          secondRowCount = 2;
        } else if (totalIcons === 5) {
          // 5 Icons: 3+2
          firstRowCount = 3;
          secondRowCount = 2;
        } else if (totalIcons === 6) {
          // 6 Icons: 3+3
          firstRowCount = 3;
          secondRowCount = 3;
        } else if (totalIcons === 7) {
          // 7 Icons: 4+3 (symmetrischer als 3+3+1)
          firstRowCount = 4;
          secondRowCount = 3;
        } else {
          // 8+ Icons: 4+4
          firstRowCount = 4;
          secondRowCount = Math.min(4, totalIcons - 4);
        }
        
        const renderIcon = (s: any, index: number) => {
          const isContactInfo = ['email', 'phone', 'address'].includes(s.platform);
          
          if (isContactInfo) {
            // Verwende das isUrl Flag aus der Datenbank
            const isUrl = s.isUrl || s.value.startsWith('http://') || s.value.startsWith('https://') || s.value.startsWith('mailto:') || s.value.startsWith('tel:');
            
            if (isUrl) {
              // URL: Direkter Link
              const getContactIcon = () => {
                switch (s.platform) {
                  case 'email': return '📧';
                  case 'phone': return '📞';
                  case 'address': return '📍';
                  default: return '🔗';
                }
              };
              
              return (
                <a
                  key={s.id}
                  href={s.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 w-10 h-10"
                  title={s.platform}
                >
                  <span className="text-lg">{getContactIcon()}</span>
                </a>
              );
            } else {
              // Text: Infobox öffnen
              const handleClick = (e: React.MouseEvent) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                setInfoBox({
                  type: s.platform,
                  content: s.value,
                  x: rect.left + rect.width / 2,
                  y: rect.top - 10
                });
              };
              
              const getContactIcon = () => {
                switch (s.platform) {
                  case 'email': return '📧';
                  case 'phone': return '📞';
                  case 'address': return '📍';
                  default: return '🔗';
                }
              };
              
              return (
                <button
                  key={s.id}
                  onClick={handleClick}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 w-10 h-10"
                  title={s.platform}
                >
                  <span className="text-lg">{getContactIcon()}</span>
                </button>
              );
            }
          }
          
          // Normale Social Media Links
          const socialPlatform = socialPlatforms.find(sp => sp.value === s.platform);
          if (socialPlatform && socialPlatform.icon.startsWith('<svg')) {
            return (
              <a key={s.id} href={s.value} target="_blank" rel="noopener noreferrer" className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 w-10 h-10" title={s.platform}>
                <div 
                  className="w-5 h-5"
                  style={{ color: socialPlatform.color }}
                  dangerouslySetInnerHTML={{ __html: socialPlatform.icon }}
                />
              </a>
            );
          }
          
          const Icon = socialIcons[s.platform as keyof typeof socialIcons] || LinkIcon;
          return (
            <a key={s.id} href={s.value} target="_blank" rel="noopener noreferrer" className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 w-10 h-10" title={s.platform}>
              <Icon className="w-5 h-5" />
            </a>
          );
        };
        
        return (
          <>
            {/* First row */}
            <div className="flex justify-center gap-3 mb-3" style={{ maxWidth: 'fit-content', margin: '0 auto' }}>
              {socials.slice(0, firstRowCount).map((s, index) => renderIcon(s, index))}
            </div>
            
            {/* Second row (if needed) */}
            {secondRowCount > 0 && (
              <div className="flex justify-center gap-3" style={{ maxWidth: 'fit-content', margin: '0 auto' }}>
                {socials.slice(firstRowCount, firstRowCount + secondRowCount).map((s, index) => renderIcon(s, firstRowCount + index))}
              </div>
            )}
            
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
          </>
        );
      })()}
    </div>
  ) : null;

  // Kompakter Modus für das Layout
  if (isCompact) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-between overflow-hidden" style={getBackgroundStyle()}>
        <div className="flex flex-col items-center w-full px-4 pt-8 pb-2 flex-1">
          {/* Socials oben - vor dem Avatar */}
          {settings.socialPosition === 'top' && (
            <div className="mb-6">
              {SocialIconsBar}
            </div>
          )}
          
          {/* Avatar, Name, Bio */}
          <Avatar className={`w-16 h-16 mb-3 mt-2 ${
            settings.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'
          }`}
          style={{
            border: `3px solid ${settings.avatarBorderColor || '#ffffff'}`
          }}>
            <AvatarImage src={userData?.avatarUrl || settings.avatarImage} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
              {(settings.displayName || userData?.displayName) ? (settings.displayName || userData?.displayName)?.slice(0, 2).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-lg font-bold mb-1 text-center" style={{ fontFamily: getFontFamily(), color: getTextColor() }}>
            {settings.displayName || userData?.displayName || 'Dein Name'}
          </h1>
          
          <p className="text-xs mb-3 text-center opacity-90" style={{ fontFamily: getFontFamily(), color: getTextColor() }}>
            {settings.bio || userData?.bio || 'Deine Bio'}
          </p>
          
          {/* Socials in der Mitte - nach der Bio */}
          {settings.socialPosition === 'middle' && (
            <div className="mb-3">
              {SocialIconsBar}
            </div>
          )}
          
          {/* Dynamische Links */}
          <div className="flex flex-col gap-2 w-full max-w-[280px] mt-2">
            {loading && (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mx-auto mb-1"></div>
                <p className="text-gray-600 text-xs">Lade...</p>
              </div>
            )}
            
            {!loading && links.length === 0 && (
              <div className="text-center py-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <p className="text-gray-500 text-xs">Keine Links</p>
              </div>
            )}
            
            {!loading && links.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-2 px-3 rounded-lg font-medium text-center shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1 ${link.highlight ? getHighlightClasses(link.highlightStyle) : ''}`}
                style={getButtonStyle()}
              >
                {link.highlight && getHighlightIcon(link.highlightStyle)}
                <span className="text-xs">{link.title}</span>
              </a>
            ))}
          </div>
        </div>
        
        {/* Socials unten - vor dem Branding */}
        {settings.socialPosition === 'bottom' && (
          <div className="mb-4">
            {SocialIconsBar}
          </div>
        )}
        
        {/* Branding immer ganz unten */}
        {settings.showBranding && (
          <div
            className="px-2 py-1 rounded select-none flex items-center justify-center mb-2"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: '#222',
              textShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            LINKULIKE
          </div>
        )}
      </div>
    );
  }

  // Normaler Modus
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 flex flex-col gap-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-gray-900">Live Vorschau</h3>
        <p className="text-sm text-gray-600">So sieht dein Profil aus</p>
      </div>
      
      {/* Phone Frame mit Preview */}
      <div className="flex justify-center">
        <div className="relative bg-black rounded-[2.5rem] shadow-2xl border-4 border-black p-0 w-[340px] h-[700px] flex flex-col items-center justify-between overflow-hidden">
          {/* Share-Button oben links */}
          {settings.showShareButton && (
            <button className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg z-10 hover:scale-110 transition-transform duration-200">
              <Share2 className="w-5 h-5 text-purple-600" />
            </button>
          )}
          
          {/* Phone-Display-Inhalt */}
          <div className="flex-1 flex flex-col items-center justify-between w-full h-full relative" style={getBackgroundStyle()}>
            <div className="flex flex-col items-center w-full px-6 pt-12 pb-4 flex-1">
              {/* Socials oben - vor dem Avatar */}
              {settings.socialPosition === 'top' && (
                <div className="mb-6">
                  {SocialIconsBar}
                </div>
              )}
              
              {/* Avatar, Name, Bio */}
              <Avatar className={`w-20 h-20 mb-4 ${
                settings.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'
              }`}
              style={{
                border: `4px solid ${settings.avatarBorderColor || '#ffffff'}`
              }}>
                <AvatarImage src={userData?.avatarUrl || settings.avatarImage} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                  {(settings.displayName || userData?.displayName) ? (settings.displayName || userData?.displayName)?.slice(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-xl font-bold mb-2 text-center" style={{ fontFamily: getFontFamily(), color: getTextColor() }}>
                {settings.displayName || userData?.displayName || 'Dein Name'}
              </h1>
              
              <p className="text-sm mb-4 text-center opacity-90" style={{ fontFamily: getFontFamily(), color: getTextColor() }}>
                {settings.bio || userData?.bio || 'Deine Bio'}
              </p>
              
              {/* Socials in der Mitte - nach der Bio */}
              {settings.socialPosition === 'middle' && (
                <div className="mb-4">
                  {SocialIconsBar}
                </div>
              )}
              
              {/* Dynamische Links */}
              <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Lade Links...</p>
                  </div>
                )}
                
                {!loading && links.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Noch keine Links vorhanden</p>
                  </div>
                )}
                
                {!loading && links.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 px-4 rounded-full font-semibold text-center shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 ${link.highlight ? getHighlightClasses(link.highlightStyle) : ''}`}
                    style={getButtonStyle()}
                  >
                    {link.highlight && getHighlightIcon(link.highlightStyle)}
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Socials unten - vor dem Branding */}
            {settings.socialPosition === 'bottom' && (
              <div className="mb-4">
                {SocialIconsBar}
              </div>
            )}
            
            {/* Branding immer ganz unten */}
            {settings.showBranding && (
              <div
                className="px-4 py-1 rounded-lg select-none flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '0.15em',
                  color: '#222',
                  textShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }}
              >
                LINKULIKE
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 