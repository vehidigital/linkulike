import React from "react"
import { getColorForUrl, socialPlatforms } from "@/lib/social-icons"
import { getContrastColor, extractFirstColorFromGradient } from "@/lib/color-utils"
import { SolidLinkButton } from "./SolidLinkButton"
import { ICON_OPTIONS } from "../dashboard/LinkEditor"
import { getLinkButtonColors, getLinkIcon } from "@/lib/link-button-utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getTranslations } from '@/lib/i18n'
import { Heart, Share2 } from 'lucide-react'
import { Phone, Mail, Link as LucideLink, ArrowRight, BarChart, Globe } from "lucide-react";

interface LinkItem {
  icon: string
  label: string
  gradient: string
}

interface DemoLink { icon: string; label: string }
interface UserLink {
  title: string;
  url: string;
  icon: string;
  customColor?: string;
  useCustomColor?: boolean;
  textColorOverride?: 'light' | 'dark';
}
type PreviewLink = UserLink | DemoLink

interface ProfilePreviewProps {
  displayName?: string
  username?: string
  bio?: string
  avatarUrl?: string
  links?: PreviewLink[]
  theme?: string
  buttonStyle?: 'gradient' | 'solid' | string
  buttonColor?: string
  buttonGradient?: string
  currentLang: "de" | "en"
  textColor?: string
  fontFamily?: string
  placeholders?: {
    displayName: string
    username: string
    bio: string
    links: { icon: string; label: string }[]
  }
  themeId?: string // NEU
  avatarBorderColor?: string // NEU
  backgroundImageUrl?: string // NEU: Hintergrundbild
  originalBackgroundImageUrl?: string;
  backgroundCropDesktopUrl?: string;
  backgroundCropMobileUrl?: string;
  backgroundCropDesktop?: any;
  backgroundCropMobile?: any;
  backgroundOverlayType?: 'dark' | 'light' | 'custom' | 'none';
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;
  backgroundImageActive?: boolean; // NEU: Flag für aktiven Status
  // Pro-Features für individuelle Textfarben
  displayNameColor?: string; // NEU: Individuelle Farbe für Display Name
  usernameColor?: string; // NEU: Individuelle Farbe für Username
  bioColor?: string; // NEU: Individuelle Farbe für Bio
  customFooterColor?: string; // NEU: Individuelle Farbe für Footer
}

const demoLinks: Record<"de" | "en", LinkItem[]> = {
  de: [
    { icon: "🌐", label: "Eigene Website", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { icon: "📸", label: "Instagram", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { icon: "🎵", label: "Spotify", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  ],
  en: [
    { icon: "🌐", label: "Personal Website", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { icon: "📸", label: "Instagram", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { icon: "🎵", label: "Spotify", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  ],
}

const demoBio = {
  de: "Creator, Musiker & Web-Entdecker",
  en: "Creator, musician & web explorer",
}

const STANDARD_COLOR = '#f3f4f6'

function isDemoLink(link: PreviewLink): link is DemoLink {
  return 'label' in link
}

function isUserLink(link: PreviewLink): link is UserLink {
  return 'title' in link && 'url' in link
}

function getBrandColorByIcon(iconValue: string): string | undefined {
  const found = socialPlatforms.find(p => p.value === iconValue)
  return found ? found.color : undefined
}

function getButtonColor(link: UserLink) {
  if (link.useCustomColor && link.customColor) {
    return link.customColor
  }
  // Nur Brand-Farbe, wenn URL zu Social passt
  const brand = getColorForUrl(link.url)
  if (brand && brand !== '#000000') {
    return brand
  }
  // Sonst Standardfarbe
  return STANDARD_COLOR
}

// Map für Google Fonts mit Fallback
const fontFamilyMap: Record<string, string> = {
  "Inter": "var(--font-inter), sans-serif",
  "Roboto": "var(--font-roboto), sans-serif",
  "Open Sans": "var(--font-open-sans), sans-serif",
  "Poppins": "var(--font-poppins), sans-serif",
  "Montserrat": "var(--font-montserrat), sans-serif",
  "Playfair Display": "var(--font-playfair), serif",
};

// Hilfsfunktion für Lucide-Icons
const LUCIDE_ICONS: { [key: string]: JSX.Element } = {
  "lucide-phone": <Phone className="w-5 h-5" />,
  "lucide-mail": <Mail className="w-5 h-5" />,
  "lucide-link": <LucideLink className="w-5 h-5" />,
  "lucide-arrow-right": <ArrowRight className="w-5 h-5" />,
  "lucide-bar-chart": <BarChart className="w-5 h-5" />,
  "lucide-globe": <Globe className="w-5 h-5" />,
};

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ displayName, username, bio, avatarUrl, links, theme, buttonStyle, buttonColor, buttonGradient, currentLang, textColor, fontFamily, placeholders, themeId, avatarBorderColor, backgroundImageUrl, backgroundOverlayType, backgroundOverlayColor, backgroundOverlayOpacity, backgroundImageActive, displayNameColor, usernameColor, bioColor, customFooterColor }) => {
  const t = getTranslations(currentLang);
  const name = displayName || placeholders?.displayName || (currentLang === "de" ? "Max Mustermann" : "Max Example")
  const uname = username || placeholders?.username || (currentLang === "de" ? "maxmustermann" : "maxexample")
  const bioText = bio || placeholders?.bio || t.sampleBio
  const demo = (demoLinks && demoLinks[currentLang]) ? demoLinks[currentLang] : [];
  // Filter only active user links
  const filteredLinks = links?.filter(l => !('isActive' in l) || (l as any).isActive !== false) || [];
  const showLinks = filteredLinks.length > 0 ? filteredLinks.slice(0, 5) : demo.map(l => ({ ...l, label: t.sampleLink }));
  // Ersetze die bg-Berechnung:
  let bg;
  if (buttonStyle === 'gradient') {
    // Gradient-Mode
    if (themeId === 'light') {
      bg = 'linear-gradient(135deg, #fff 0%, #e5e7eb 100%)';
    } else {
      bg = buttonGradient || theme || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  } else {
    // Uni-Farbe
    if (themeId === 'light') {
      bg = '#fff';
    } else {
      bg = buttonColor || theme || '#6366f1';
    }
  }
  // Für Kontrastfarbe: immer echte Farbe extrahieren
  const bgColorForContrast = extractFirstColorFromGradient(bg);
  // Nach bgColorForContrast:
  const isLightTheme = (typeof theme === 'string' && theme.toLowerCase().includes('light')) || bgColorForContrast === '#f3f4f6' || bgColorForContrast === '#fff' || bgColorForContrast === '#ffffff' || (typeof bgColorForContrast === 'string' && bgColorForContrast.toLowerCase().includes('e5e7eb'));
  // NEU: Dark Theme immer weiße Schrift
  const isDarkTheme = (themeId === 'dark' || (!isLightTheme && (bgColorForContrast === '#222' || bgColorForContrast === '#111' || bgColorForContrast === '#000' || (typeof bgColorForContrast === 'string' && bgColorForContrast.toLowerCase().includes('6366f1')))));

  // Hintergrundbild-Logik
  const hasBgImage = !!(backgroundImageUrl && backgroundImageActive !== false);

  // Overlay-Logik
  let overlayStyle: React.CSSProperties | undefined = undefined;
  if (hasBgImage) {
    switch (backgroundOverlayType) {
      case 'dark':
        overlayStyle = { position: 'absolute', inset: 0, borderRadius: '2.2rem', background: 'rgba(0,0,0,0.45)', zIndex: 1 };
        break;
      case 'light':
        overlayStyle = { position: 'absolute', inset: 0, borderRadius: '2.2rem', background: 'rgba(255,255,255,0.35)', zIndex: 1 };
        break;
      case 'custom':
        overlayStyle = { position: 'absolute', inset: 0, borderRadius: '2.2rem', background: backgroundOverlayColor ? backgroundOverlayColor : 'rgba(0,0,0,0.45)', opacity: backgroundOverlayOpacity ?? 1, zIndex: 1 };
        break;
      case 'none':
        overlayStyle = undefined;
        break;
      default:
        overlayStyle = { position: 'absolute', inset: 0, borderRadius: '2.2rem', background: 'rgba(0,0,0,0.45)', zIndex: 1 };
    }
  }

  // Preview-Card-Style: Immer 9:16, backgroundImage als cover
  const previewCardStyle: React.CSSProperties = hasBgImage
    ? {
        aspectRatio: '9/16',
        width: '320px',
        maxWidth: '100%',
        borderRadius: '2.2rem',
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'visible',
        fontFamily: fontFamilyMap[fontFamily || 'Inter'],
      }
    : {
        aspectRatio: '9/16',
        width: '320px',
        maxWidth: '100%',
        borderRadius: '2.2rem',
        background: bg,
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'visible',
        fontFamily: fontFamilyMap[fontFamily || 'Inter'],
      };

  // Anpassung: Wenn Hintergrundbild, immer kontrastreiche Schrift
  const effectiveTextColor = textColor
    ? textColor
    : hasBgImage
      ? (backgroundOverlayType === 'light' ? '#222' : '#fff')
      : (isDarkTheme ? '#fff' : (isLightTheme ? '#222' : getContrastColor(bgColorForContrast)));

  // Individuelle Textfarben (Pro-Features)
  const effectiveDisplayNameColor = displayNameColor === 'auto' || !displayNameColor 
    ? effectiveTextColor 
    : displayNameColor;
  const effectiveUsernameColor = usernameColor === 'auto' || !usernameColor 
    ? effectiveTextColor 
    : usernameColor;
  const effectiveBioColor = bioColor === 'auto' || !bioColor 
    ? effectiveTextColor 
    : bioColor;

  // Footer-Farbe: Dynamisch je nach Theme und Overlay
  const effectiveFooterColor =
    customFooterColor === 'auto' || !customFooterColor
      ? hasBgImage
        ? (
            backgroundOverlayType === 'light'
              ? '#222'
              : '#fff'
          )
        : (isDarkTheme ? '#fff' : '#222')
      : customFooterColor;

  // Im Button-Rendering (innerhalb der map):
  return (
    <div
      className={`mx-auto flex flex-col items-center justify-start border border-gray-200 ${isLightTheme ? 'shadow-md' : 'shadow-sm'}`}
      style={previewCardStyle}
    >
      {/* Overlay für Lesbarkeit, nur wenn Bild und Overlay */}
      {hasBgImage && overlayStyle && (
        <div style={overlayStyle} />
      )}
      <div className="w-full max-w-md mx-auto space-y-8" style={hasBgImage ? { position: 'relative', zIndex: 2 } : {}}>
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto border-4 shadow-lg bg-gray-200"
            style={{ borderColor: avatarBorderColor || '#fff' }}
          >
            <AvatarImage src={avatarUrl || undefined} alt={name} />
            <AvatarFallback>
              <span>{name.charAt(0).toUpperCase()}</span>
            </AvatarFallback>
          </Avatar>
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold mb-2 break-words text-center leading-tight max-w-full max-h-[3.5em] overflow-hidden"
              style={{ color: effectiveDisplayNameColor }}
            >
              {name}
            </h1>
            <p
              className="text-sm opacity-80 mb-1 break-all text-center max-w-full"
              style={{ color: effectiveUsernameColor }}
            >
              @{uname}
            </p>
            {bioText && (
              <p className="text-sm opacity-90 leading-relaxed max-w-sm mx-auto text-center line-clamp-3 break-words" style={{ color: effectiveBioColor, whiteSpace: 'pre-line' }}>{bioText}</p>
            )}
          </div>
        </div>
        {/* Links */}
        <div className="space-y-3">
          {showLinks.length > 0 ? showLinks.map((l, i) => {
            let buttonColors;
            let icon = '';
            let textColor;
            if (isUserLink(l)) {
              buttonColors = getLinkButtonColors(l);
              icon = getLinkIcon(l, ICON_OPTIONS);
              // Button-Textfarbe: Nur nach Link-Override, sonst Kontrast zur Buttonfarbe
              if (l.textColorOverride === 'light') {
                textColor = '#fff';
              } else if (l.textColorOverride === 'dark') {
                textColor = '#222';
              } else {
                textColor = getContrastColor(buttonColors.backgroundColor);
              }
            } else {
              // DemoLink fallback
              buttonColors = { backgroundColor: STANDARD_COLOR };
              icon = l.icon;
              textColor = getContrastColor(buttonColors.backgroundColor);
            }
            const title = isUserLink(l)
              ? (l.title && l.title.trim().length > 0 ? l.title : t.sampleLink)
              : (l.label || t.sampleLink)
            return (
              <Button
                key={i}
                className="w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] flex items-center justify-between gap-3 group"
                style={{ 
                  backgroundColor: buttonColors.backgroundColor, 
                  color: textColor, 
                  border: `1px solid ${buttonColors.backgroundColor}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                type="button"
              >
                {/* Linker Bereich: Icon + Text */}
                <span className="flex items-center gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0 align-middle">
                    {typeof l.icon === 'string' && LUCIDE_ICONS[l.icon]
                      ? LUCIDE_ICONS[l.icon]
                      : (typeof l.icon === 'string' && l.icon.length <= 2 ? l.icon : '🌐')}
                  </span>
                  <span className="truncate block text-base font-semibold align-middle" style={{lineHeight: '1.2'}}>{title}</span>
                </span>
                {/* Rechter Bereich: Icon (z.B. External Link) */}
                <span className="flex items-center flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7m5-5 3 3m0 0-3 3m3-3H9" /></svg>
                </span>
              </Button>
            )
          }) : (
            <div className="text-center py-8 opacity-60">
              <p>{t.sampleLinksNotice}</p>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex justify-center gap-6 pt-4">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-base font-medium ${isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
            style={{ color: effectiveFooterColor }}
          >
            <Heart className="w-5 h-5" />
            <span>Gefällt mir</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-base font-medium ${isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
            style={{ color: effectiveFooterColor }}
          >
            <Share2 className="w-5 h-5" />
            <span>Teilen</span>
          </button>
        </div>
        {/* Footer */}
        <div className="text-center text-sm" style={{ color: effectiveFooterColor }}>
          <p>{currentLang === "de" ? "Powered by Linkulike" : "Powered by Linkulike"}</p>
        </div>
      </div>
    </div>
  )
} 