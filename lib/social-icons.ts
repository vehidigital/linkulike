export interface SocialPlatform {
  name: string
  icon: string
  value: string
  color: string
  domains: string[]
  inputType: 'handle' | 'url' // NEU: handle = nur Username/Handle, url = komplette URL
  urlPrefix?: string // NEU: falls inputType handle, wird das als Prefix genutzt
}

export const socialPlatforms: SocialPlatform[] = [
  {
    name: "Instagram",
    icon: "📷",
    value: "instagram",
    color: "#E4405F",
    domains: ["instagram.com", "ig.me"],
    inputType: 'url'
  },
  {
    name: "YouTube",
    icon: "📺",
    value: "youtube",
    color: "#FF0000",
    domains: ["youtube.com", "youtu.be"],
    inputType: 'url'
  },
  {
    name: "TikTok",
    icon: "🎵",
    value: "tiktok",
    color: "#000000",
    domains: ["tiktok.com"],
    inputType: 'url'
  },
  {
    name: "Twitter",
    icon: "🐦",
    value: "twitter",
    color: "#1DA1F2",
    domains: ["twitter.com", "x.com"],
    inputType: 'url'
  },
  {
    name: "Facebook",
    icon: "📘",
    value: "facebook",
    color: "#1877F2",
    domains: ["facebook.com", "fb.com"],
    inputType: 'url'
  },
  {
    name: "LinkedIn",
    icon: "💼",
    value: "linkedin",
    color: "#0A66C2",
    domains: ["linkedin.com"],
    inputType: 'url'
  },
  {
    name: "GitHub",
    icon: "💻",
    value: "github",
    color: "#181717",
    domains: ["github.com"],
    inputType: 'url'
  },
  {
    name: "Spotify",
    icon: "🎵",
    value: "spotify",
    color: "#1DB954",
    domains: ["spotify.com", "open.spotify.com"],
    inputType: 'url'
  },
  {
    name: "Twitch",
    icon: "🎮",
    value: "twitch",
    color: "#9146FF",
    domains: ["twitch.tv"],
    inputType: 'url'
  },
  {
    name: "Discord",
    icon: "💬",
    value: "discord",
    color: "#5865F2",
    domains: ["discord.gg", "discord.com"],
    inputType: 'url'
  },
  {
    name: "Snapchat",
    icon: "👻",
    value: "snapchat",
    color: "#FFFC00",
    domains: ["snapchat.com"],
    inputType: 'url'
  },
  {
    name: "Pinterest",
    icon: "📌",
    value: "pinterest",
    color: "#E60023",
    domains: ["pinterest.com"],
    inputType: 'url'
  },
  {
    name: "Reddit",
    icon: "🤖",
    value: "reddit",
    color: "#FF4500",
    domains: ["reddit.com"],
    inputType: 'url'
  },
  {
    name: "WhatsApp",
    icon: "📱",
    value: "whatsapp",
    color: "#25D366",
    domains: ["wa.me", "whatsapp.com"],
    inputType: 'url'
  },
  {
    name: "Telegram",
    icon: "📬",
    value: "telegram",
    color: "#0088CC",
    domains: ["t.me", "telegram.me"],
    inputType: 'url'
  },
  {
    name: "Medium",
    icon: "📝",
    value: "medium",
    color: "#000000",
    domains: ["medium.com"],
    inputType: 'url'
  },
  {
    name: "Behance",
    icon: "🎨",
    value: "behance",
    color: "#1769FF",
    domains: ["behance.net"],
    inputType: 'url'
  },
  {
    name: "Dribbble",
    icon: "🏀",
    value: "dribbble",
    color: "#EA4C89",
    domains: ["dribbble.com"],
    inputType: 'url'
  },
  {
    name: "Figma",
    icon: "🎨",
    value: "figma",
    color: "#F24E1E",
    domains: ["figma.com"],
    inputType: 'url'
  },
  {
    name: "Notion",
    icon: "📋",
    value: "notion",
    color: "#000000",
    domains: ["notion.so"],
    inputType: 'url'
  },
  {
    name: "Substack",
    icon: "📧",
    value: "substack",
    color: "#FF6719",
    domains: ["substack.com"],
    inputType: 'url'
  },
  {
    name: "Clubhouse",
    icon: "🏠",
    value: "clubhouse",
    color: "#FF4500",
    domains: ["clubhouse.com"],
    inputType: 'url'
  },
  {
    name: "Signal",
    icon: "📡",
    value: "signal",
    color: "#3A76F0",
    domains: ["signal.org"],
    inputType: 'url'
  },
  {
    name: "Cameo",
    icon: "🎭",
    value: "cameo",
    color: "#00C4CC",
    domains: ["cameo.com"],
    inputType: 'url'
  },
  {
    name: "Buy Me a Coffee",
    icon: "☕",
    value: "buymeacoffee",
    color: "#FFDD00",
    domains: ["buymeacoffee.com"],
    inputType: 'url'
  },
  {
    name: "Ko-fi",
    icon: "💜",
    value: "kofi",
    color: "#FF5E5B",
    domains: ["ko-fi.com"],
    inputType: 'url'
  },
  {
    name: "Patreon",
    icon: "💙",
    value: "patreon",
    color: "#FF424D",
    domains: ["patreon.com"],
    inputType: 'url'
  },
  {
    name: "OnlyFans",
    icon: "💖",
    value: "onlyfans",
    color: "#00AFF0",
    domains: ["onlyfans.com"],
    inputType: 'url'
  },
  {
    name: "Product Hunt",
    icon: "🔍",
    value: "producthunt",
    color: "#DA552F",
    domains: ["producthunt.com"],
    inputType: 'url'
  },
  {
    name: "App Store",
    icon: "📱",
    value: "appstore",
    color: "#0D96F6",
    domains: ["apps.apple.com"],
    inputType: 'url'
  },
  {
    name: "Google Play",
    icon: "🤖",
    value: "googleplay",
    color: "#01875F",
    domains: ["play.google.com"],
    inputType: 'url'
  },
  {
    name: "Website",
    icon: "🌐",
    value: "website",
    color: "#000000",
    domains: ["*"],
    inputType: 'url'
  },
  {
    name: "Email",
    icon: "📧",
    value: "email",
    color: "#EA4335",
    domains: ["mailto:"],
    inputType: 'url'
  },
  {
    name: "Phone",
    icon: "📞",
    value: "phone",
    color: "#25D366",
    domains: ["tel:"],
    inputType: 'url'
  }
];

export function getSocialPlatform(url: string): SocialPlatform {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    for (const platform of socialPlatforms) {
      if (platform.domains.some(domain => hostname.includes(domain))) {
        return platform
      }
    }
    
    // Default to website if no match found
    return socialPlatforms[socialPlatforms.length - 1]
  } catch {
    return socialPlatforms[socialPlatforms.length - 1]
  }
}

export function getIconForUrl(url: string): string {
  return getSocialPlatform(url).icon
}

export function getColorForUrl(url: string): string {
  return getSocialPlatform(url).color
} 