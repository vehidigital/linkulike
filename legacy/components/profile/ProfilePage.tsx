"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, Share2 } from "lucide-react";
import { getColorForUrl } from "@/lib/social-icons";
import { getContrastColor, extractFirstColorFromGradient } from "@/lib/color-utils";

interface User {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  theme: string;
  backgroundColor: string;
  backgroundGradient: string;
  buttonStyle: string;
  buttonColor: string;
  buttonGradient: string;
  textColor: string;
  fontFamily: string;
  links: Link[];
  buttonTextColor?: string;
  backgroundImageUrl?: string;
  avatarBorderColor?: string;
  backgroundOverlayType?: 'dark' | 'light' | 'custom' | 'none';
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;
  backgroundImageActive?: boolean; // NEU: Flag für aktiven Status
  // Pro-Features für individuelle Textfarben
  displayNameColor?: string; // NEU: Individuelle Farbe für Display Name
  usernameColor?: string; // NEU: Individuelle Farbe für Username
  bioColor?: string; // NEU: Individuelle Farbe für Bio
  footerColor?: string; // NEU: Individuelle Farbe für Footer
}

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
  position: number;
  customColor?: string;
  useCustomColor?: boolean;
  clicks: any[];
  textColorOverride?: string;
}

interface ProfilePageProps {
  user: User;
}

const ICON_MAP: { [key: string]: string } = {
  globe: "🌐",
  instagram: "📷",
  youtube: "📺",
  twitter: "🐦",
  facebook: "📘",
  linkedin: "💼",
  github: "💻",
  tiktok: "🎵",
  spotify: "🎧",
  twitch: "🎮",
  discord: "💬",
  telegram: "📱",
  whatsapp: "📞",
  email: "✉️",
  phone: "📞",
  location: "📍",
  calendar: "📅",
  shop: "🛍️",
  book: "📚",
  heart: "❤️",
};

const STANDARD_COLOR = '#6366f1'

export default function ProfilePage({ user }: ProfilePageProps) {
  const [liked, setLiked] = useState(false);

  const handleLinkClick = async (linkId: string, url: string) => {
    try {
      // Track click
      await fetch(`/api/links/${linkId}/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress: "tracked",
          userAgent: navigator.userAgent,
          referer: document.referrer,
        }),
      });
    } catch (error) {
      console.error("Failed to track click:", error);
    }

    // Open link
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.displayName || user.username} | Bio Links`,
          text: user.bio || `Check out ${user.displayName || user.username}'s bio links`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast here
      } catch (error) {
        console.error("Failed to copy URL:", error);
      }
    }
  };

  const getIconDisplay = (iconValue: string) => {
    return ICON_MAP[iconValue] || "🌐";
  };

  function getButtonColor(link: Link) {
    if (link.useCustomColor && link.customColor) {
      return link.customColor
    }
    const brand = getColorForUrl(link.url)
    if (brand && brand !== '#000000') {
      return brand
    }
    return STANDARD_COLOR
  }

  function getLinkTextColor(link: Link) {
    const backgroundColor = getButtonColor(link)
    let textColor = getContrastColor(backgroundColor)
    if (link.textColorOverride === 'light') textColor = '#fff'
    else if (link.textColorOverride === 'dark') textColor = '#222'
    return textColor
  }

  const getButtonStyle = () => {
    if (user.buttonStyle === "gradient") {
      return {
        background: user.buttonGradient,
        color: "#ffffff",
      };
    } else {
      return {
        backgroundColor: user.buttonColor,
        color: user.textColor,
      };
    }
  };

  const containerStyle = {
    background: user.backgroundGradient,
    color: user.textColor,
    fontFamily: user.fontFamily,
  };

  // Für Kontrastfarbe: immer echte Farbe extrahieren
  const bgColorForContrast = extractFirstColorFromGradient(user.backgroundGradient || user.backgroundColor);
  const footerColor = getContrastColor(bgColorForContrast);

  const buttonStyle = getButtonStyle();

  const hasBgImage = !!(user.backgroundImageUrl && user.backgroundImageActive !== false);
  // Overlay-Logik
  let overlayStyle: React.CSSProperties | undefined = undefined;
  if (hasBgImage) {
    switch (user.backgroundOverlayType) {
      case 'dark':
        overlayStyle = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1 };
        break;
      case 'light':
        overlayStyle = { position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.35)', zIndex: 1 };
        break;
      case 'custom':
        overlayStyle = { position: 'absolute', inset: 0, background: user.backgroundOverlayColor ? user.backgroundOverlayColor : 'rgba(0,0,0,0.45)', opacity: user.backgroundOverlayOpacity ?? 1, zIndex: 1 };
        break;
      case 'none':
        overlayStyle = undefined;
        break;
      default:
        overlayStyle = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1 };
    }
  }
  // Textfarbe für gute Lesbarkeit
  const textColor = hasBgImage
    ? (user.backgroundOverlayType === 'light' ? '#222' : '#fff')
    : user.textColor;

  // Individuelle Textfarben (Pro-Features)
  const effectiveDisplayNameColor = user.displayNameColor === 'auto' || !user.displayNameColor 
    ? textColor 
    : user.displayNameColor;
  const effectiveUsernameColor = user.usernameColor === 'auto' || !user.usernameColor 
    ? textColor 
    : user.usernameColor;
  const effectiveBioColor = user.bioColor === 'auto' || !user.bioColor 
    ? textColor 
    : user.bioColor;

  // Footer-Farbe: Immer automatischer Kontrast, außer wenn explizit gesetzt
  const effectiveFooterColor = user.footerColor === 'auto' || !user.footerColor
    ? (hasBgImage
        ? (user.backgroundOverlayType === 'light' ? '#222' : '#fff')
        : footerColor)
    : user.footerColor;

  const previewBgStyle = hasBgImage
    ? {
        backgroundImage: `url(${user.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : containerStyle;

  function getInitial(user: User): string {
    const base = user.displayName || user.username;
    if (base && typeof base === 'string' && base.length > 0) {
      return base.charAt(0).toUpperCase();
    }
    return '?';
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative"
      style={previewBgStyle}
    >
      {/* Overlay für Lesbarkeit, nur wenn Bild und Overlay */}
      {hasBgImage && overlayStyle && (
        <div style={overlayStyle} />
      )}
      <div className="w-full max-w-[375px] mx-auto space-y-8" style={hasBgImage ? { position: 'relative', zIndex: 2 } : {}}>
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto border-4 shadow-lg bg-gray-200"
            style={{ borderColor: user.avatarBorderColor || '#fff' }}
          >
            <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.username} />
            <AvatarFallback>
              <span>{getInitial(user) || '?'} </span>
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: effectiveDisplayNameColor }}>{user.displayName || user.username}</h1>
            <p className="text-sm opacity-80 mb-1" style={{ color: effectiveUsernameColor }}>@{user.username}</p>
            {user.bio && (
              <p className="text-sm opacity-90 leading-relaxed max-w-sm mx-auto text-center line-clamp-3 break-words" style={{ color: effectiveBioColor, whiteSpace: 'pre-line' }}>
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3">
          {user.links.length > 0 ? (
            user.links.map((link) => {
              const linkColor = getButtonColor(link);
              const textColor = getLinkTextColor(link);
              const buttonTitle = link.title && link.title.trim().length > 0 ? link.title : 'Link'
              
              return (
                <Button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id, link.url)}
                  className="w-full py-4 px-6 rounded-xl font-medium text-left transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: linkColor,
                    color: textColor,
                    border: `1px solid ${linkColor}`
                  }}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <span className="text-xl">{getIconDisplay(link.icon)}</span>
                    <span className="flex-1">{buttonTitle}</span>
                    <ExternalLink className="w-4 h-4 opacity-60" />
                  </div>
                </Button>
              );
            })
          ) : (
            <div className="text-center py-8 opacity-60">
              <p>No links available</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLiked(!liked)}
            className="hover:bg-white/10"
            style={{ color: effectiveFooterColor }}
          >
            <Heart
              className={`w-5 h-5 mr-2 ${liked ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: effectiveFooterColor }}
            />
            {liked ? "Liked" : "Like"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="hover:bg-white/10"
            style={{ color: effectiveFooterColor }}
          >
            <Share2 className="w-5 h-5 mr-2" style={{ color: effectiveFooterColor }} />
            Share
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm opacity-60" style={{ color: effectiveFooterColor }}>
          {/* Footer-Text hat IMMER Kontrastfarbe zum Hintergrund für beste Lesbarkeit */}
          <p>Powered by Linkulike</p>
        </div>
      </div>
    </div>
  );
} 