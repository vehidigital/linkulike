import React from "react"
import { getColorForUrl, socialPlatforms } from "@/lib/social-icons"
import { getContrastColor, extractFirstColorFromGradient } from "@/lib/color-utils"
import { SolidLinkButton } from "./SolidLinkButton"
import { ICON_OPTIONS } from "../dashboard/LinkEditor"
import { getLinkButtonColors, getLinkIcon } from "@/lib/link-button-utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getTranslations } from '@/lib/i18n'

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
  placeholders?: {
    displayName: string
    username: string
    bio: string
    links: { icon: string; label: string }[]
  }
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

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ displayName, username, bio, avatarUrl, links, theme, buttonStyle, buttonColor, buttonGradient, currentLang, textColor, placeholders }) => {
  const t = getTranslations(currentLang);
  const name = displayName || placeholders?.displayName || (currentLang === "de" ? "Max Mustermann" : "Max Example")
  const uname = username || placeholders?.username || (currentLang === "de" ? "maxmustermann" : "maxexample")
  const bioText = bio || placeholders?.bio || t.sampleBio
  const showLinks = links && links.length > 0 ? links.slice(0, 5) : demoLinks[currentLang].map(l => ({ ...l, label: t.sampleLink }))
  const bg = buttonStyle === 'gradient'
    ? (theme && theme.startsWith('linear-gradient') ? theme : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
    : (theme && !theme.startsWith('linear-gradient') ? theme : '#6366f1')
  // Für Kontrastfarbe: immer echte Farbe extrahieren
  const bgColorForContrast = extractFirstColorFromGradient(bg);
  const effectiveTextColor = textColor || getContrastColor(bgColorForContrast)
  const footerColor = getContrastColor(bgColorForContrast);

  // Logging für Debugging
  console.log('ProfilePreview avatarUrl:', avatarUrl);

  return (
    <div
      className="w-[340px] max-w-full rounded-[2.2rem] shadow-2xl mx-auto relative overflow-visible flex flex-col items-center justify-start"
      style={{ aspectRatio: '9/19', background: bg, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)', padding: '2.5rem 1.2rem 2rem 1.2rem' }}
    >
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto border-4 border-white/20 shadow-lg bg-gray-200">
            <AvatarImage src={avatarUrl || undefined} alt={name} />
            <AvatarFallback>
              <span>{name.charAt(0).toUpperCase()}</span>
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: effectiveTextColor }}>{name}</h1>
            <p className="text-sm opacity-80 mb-1" style={{ color: effectiveTextColor }}>@{uname}</p>
            {bioText && (
              <p className="text-sm opacity-90 leading-relaxed max-w-sm mx-auto text-center line-clamp-3 break-words" style={{ color: effectiveTextColor, whiteSpace: 'pre-line' }}>{bioText}</p>
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
              buttonColors = getLinkButtonColors(l, buttonColor || STANDARD_COLOR);
              icon = getLinkIcon(l, ICON_OPTIONS);
              textColor = getContrastColor(buttonColors.backgroundColor);
              if (l.textColorOverride === 'light') textColor = '#fff';
              else if (l.textColorOverride === 'dark') textColor = '#222';
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
                className="w-full py-4 px-6 rounded-xl font-medium text-left transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center space-x-3"
                style={{ backgroundColor: buttonColors.backgroundColor, color: textColor, border: `1px solid ${buttonColors.backgroundColor}` }}
                type="button"
              >
                <span className="text-xl">{icon || '🌐'}</span>
                <span className="flex-1">{title}</span>
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7m5-5 3 3m0 0-3 3m3-3H9" /></svg>
              </Button>
            )
          }) : (
            <div className="text-center py-8 opacity-60">
              <p>{t.sampleLinksNotice}</p>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-4">
          <button type="button" className="rounded px-4 py-2 flex items-center" style={{ color: footerColor }}><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>Like</button>
          <button type="button" className="rounded px-4 py-2 flex items-center" style={{ color: footerColor }}><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zm4 4h8v8H8V8z" /></svg>Share</button>
        </div>
        {/* Footer */}
        <div className="text-center text-sm opacity-60" style={{ color: footerColor }}>
          <p>Powered by Linkulike</p>
        </div>
      </div>
    </div>
  )
} 