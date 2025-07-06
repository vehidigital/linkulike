"use client"

import { ExternalLink } from "lucide-react"
import { getIconForUrl, getColorForUrl } from "@/lib/social-icons"
import { getContrastColor } from "@/lib/color-utils"

const STANDARD_COLOR = '#6366f1'

interface LinkButtonProps {
  id: string
  title: string
  url: string
  icon?: string
  buttonStyle?: string
  buttonColor?: string
  buttonGradient?: string
  textColor?: string
  customColor?: string
  useCustomColor?: boolean
}

export function LinkButton({ 
  id, 
  title, 
  url, 
  icon, 
  buttonStyle = "gradient",
  buttonColor = "#ffffff",
  buttonGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  textColor = "#ffffff",
  customColor,
  useCustomColor = false
}: LinkButtonProps) {
  const handleClick = async () => {
    try {
      // Track click
      await fetch(`/api/links/${id}/click`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  // Auto-detect icon if not provided
  const displayIcon = icon || getIconForUrl(url)

  // Best Practice Button Color Logic
  const getButtonColor = () => {
    if (useCustomColor && customColor) {
      return customColor
    }
    const brand = getColorForUrl(url)
    if (brand && brand !== '#000000') {
      return brand
    }
    return STANDARD_COLOR
  }

  // Determine text color for best contrast
  const getTextColor = () => {
    const backgroundColor = getButtonColor()
    return getContrastColor(backgroundColor)
  }

  // Determine button styling
  const getButtonStyle = () => {
    const backgroundColor = getButtonColor()
    const textCol = getTextColor()
    return {
      backgroundColor: backgroundColor,
      color: textCol,
      border: `1px solid ${backgroundColor}`
    }
  }

  const buttonTitle = title && title.trim().length > 0 ? title : 'Link'

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="block rounded-xl p-4 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
      style={getButtonStyle()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span 
            className="text-2xl"
          >
            {displayIcon}
          </span>
          <div>
            <h3 className="font-semibold text-lg">{buttonTitle}</h3>
            <p 
              className="text-sm opacity-80"
              style={{ 
                color: getTextColor(),
                opacity: 0.8
              }}
            >
              {new URL(url).hostname}
            </p>
          </div>
        </div>
        <ExternalLink 
          className="h-5 w-5 opacity-60" 
          style={{ 
            color: getTextColor(),
            opacity: 0.6
          }}
        />
      </div>
    </a>
  )
} 