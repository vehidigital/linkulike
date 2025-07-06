export interface SocialPlatform {
  name: string
  icon: string
  value: string
  color: string
  domains: string[]
}

export const socialPlatforms: SocialPlatform[] = [
  {
    name: "Instagram",
    icon: "📷",
    value: "instagram",
    color: "#E4405F",
    domains: ["instagram.com", "ig.me"]
  },
  {
    name: "YouTube",
    icon: "📺",
    value: "youtube",
    color: "#FF0000",
    domains: ["youtube.com", "youtu.be"]
  },
  {
    name: "TikTok",
    icon: "🎵",
    value: "tiktok",
    color: "#000000",
    domains: ["tiktok.com"]
  },
  {
    name: "Twitter",
    icon: "🐦",
    value: "twitter",
    color: "#1DA1F2",
    domains: ["twitter.com", "x.com"]
  },
  {
    name: "Facebook",
    icon: "📘",
    value: "facebook",
    color: "#1877F2",
    domains: ["facebook.com", "fb.com"]
  },
  {
    name: "LinkedIn",
    icon: "💼",
    value: "linkedin",
    color: "#0A66C2",
    domains: ["linkedin.com"]
  },
  {
    name: "GitHub",
    icon: "🐙",
    value: "github",
    color: "#181717",
    domains: ["github.com"]
  },
  {
    name: "Twitch",
    icon: "🎮",
    value: "twitch",
    color: "#9146FF",
    domains: ["twitch.tv"]
  },
  {
    name: "Discord",
    icon: "💬",
    value: "discord",
    color: "#5865F2",
    domains: ["discord.gg", "discord.com"]
  },
  {
    name: "Spotify",
    icon: "🎵",
    value: "spotify",
    color: "#1DB954",
    domains: ["spotify.com", "open.spotify.com"]
  },
  {
    name: "Pinterest",
    icon: "📌",
    value: "pinterest",
    color: "#BD081C",
    domains: ["pinterest.com"]
  },
  {
    name: "Snapchat",
    icon: "👻",
    value: "snapchat",
    color: "#FFFC00",
    domains: ["snapchat.com"]
  },
  {
    name: "Reddit",
    icon: "🤖",
    value: "reddit",
    color: "#FF4500",
    domains: ["reddit.com"]
  },
  {
    name: "WhatsApp",
    icon: "💬",
    value: "whatsapp",
    color: "#25D366",
    domains: ["wa.me", "whatsapp.com"]
  },
  {
    name: "Telegram",
    icon: "📱",
    value: "telegram",
    color: "#0088CC",
    domains: ["t.me", "telegram.me"]
  },
  {
    name: "Behance",
    icon: "🎨",
    value: "behance",
    color: "#1769FF",
    domains: ["behance.net"]
  },
  {
    name: "Dribbble",
    icon: "🏀",
    value: "dribbble",
    color: "#EA4C89",
    domains: ["dribbble.com"]
  },
  {
    name: "Medium",
    icon: "📝",
    value: "medium",
    color: "#000000",
    domains: ["medium.com"]
  },
  {
    name: "Substack",
    icon: "📧",
    value: "substack",
    color: "#FF6719",
    domains: ["substack.com"]
  },
  {
    name: "OnlyFans",
    icon: "💕",
    value: "onlyfans",
    color: "#00AFF0",
    domains: ["onlyfans.com"]
  },
  {
    name: "Patreon",
    icon: "💙",
    value: "patreon",
    color: "#FF424D",
    domains: ["patreon.com"]
  },
  {
    name: "Ko-fi",
    icon: "☕",
    value: "kofi",
    color: "#FF5E5B",
    domains: ["ko-fi.com"]
  },
  {
    name: "Buy Me a Coffee",
    icon: "☕",
    value: "buymeacoffee",
    color: "#FFDD00",
    domains: ["buymeacoffee.com"]
  },
  {
    name: "PayPal",
    icon: "💳",
    value: "paypal",
    color: "#00457C",
    domains: ["paypal.me", "paypal.com"]
  },
  {
    name: "Website",
    icon: "🌐",
    value: "globe",
    color: "#000000",
    domains: []
  }
]

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