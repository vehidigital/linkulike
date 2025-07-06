import React from "react"
import { getColorForUrl, socialPlatforms } from "@/lib/social-icons"
import { getContrastColor } from "@/lib/color-utils"
import { SolidLinkButton } from "./SolidLinkButton"
import { ICON_OPTIONS } from "../dashboard/LinkEditor"
import { getLinkButtonColors, getLinkIcon } from "@/lib/link-button-utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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

const STANDARD_COLOR = '#6366f1'

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
  const name = displayName || placeholders?.displayName || (currentLang === "de" ? "Max Mustermann" : "Max Example")
  const uname = username || placeholders?.username || (currentLang === "de" ? "maxmustermann" : "maxexample")
  const bioText = bio || placeholders?.bio || (currentLang === "de" ? "Creator, Musiker & Web-Entdecker" : "Creator, musician & web explorer")
  const showLinks = links && links.length > 0 ? links.slice(0, 5) : demoLinks[currentLang]
  const bg = buttonStyle === 'gradient'
    ? (theme && theme.startsWith('linear-gradient') ? theme : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
    : (theme && !theme.startsWith('linear-gradient') ? theme : '#6366f1')
  const effectiveTextColor = textColor || getContrastColor(bg)

  // Logging für Debugging
  console.log('ProfilePreview avatarUrl:', avatarUrl);

  return (
    <div
      className="w-[280px] mx-auto rounded-[2.2rem] shadow-2xl relative overflow-visible animate-fadein flex flex-col items-center justify-start"
      style={{ aspectRatio: '9/19', background: bg, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)', padding: '2.5rem 1.2rem 2rem 1.2rem' }}
    >
      {/* Avatar - jetzt innerhalb des Cards, zentriert */}
      <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-white shadow-lg bg-gray-200">
        <AvatarImage src={avatarUrl} alt="avatar" />
        <AvatarFallback>
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {/* Name */}
      <div className="font-extrabold text-lg mb-1 text-center w-full truncate" style={{ color: effectiveTextColor }}>
        {name}
      </div>
      {/* Username */}
      <div className="mb-1 opacity-70 text-center w-full text-sm" style={{ color: effectiveTextColor }}>
        @{uname}
      </div>
      {/* Bio */}
      <div className="text-xs mb-4 opacity-90 text-center w-full line-clamp-2" style={{ color: effectiveTextColor }}>
        {bioText}
      </div>
      {/* Links/Buttons */}
      <div className="flex flex-col items-center w-full gap-4 max-h-[320px] overflow-y-auto py-2">
        {showLinks.length > 0 ? showLinks.map((l, i) => {
          let buttonColors = { backgroundColor: STANDARD_COLOR, textColor: '#fff' };
          let icon = '';
          if (isUserLink(l)) {
            buttonColors = getLinkButtonColors(l, buttonColor || STANDARD_COLOR);
            icon = getLinkIcon(l, ICON_OPTIONS);
          }
          const title = isUserLink(l)
            ? (l.title && l.title.trim().length > 0 ? l.title : (currentLang === 'de' ? 'Link' : 'Link'))
            : (l.label || (currentLang === 'de' ? 'Link' : 'Link'))
          return (
            <SolidLinkButton key={i} title={title} color={buttonColors.backgroundColor} icon={icon} textColor={buttonColors.textColor} />
          )
        }) : (
          <div className="text-gray-200 text-xs mt-8">{currentLang === 'de' ? 'Füge deine ersten Links hinzu' : 'Add your first links'}</div>
        )}
      </div>
      {/* Hinweis für mehr als 5 Links */}
      {links && links.length > 5 && (
        <div className="text-xs text-gray-200 text-center mt-2">
          +{links.length - 5} weitere Links nicht angezeigt
        </div>
      )}
      {/* Footer */}
      <div className="w-full text-center text-[11px] text-gray-200 pb-2 mt-7 select-none" style={{ letterSpacing: 0.2 }}>
        Powered by <span className="font-semibold">linkulike</span>
      </div>
    </div>
  )
} 