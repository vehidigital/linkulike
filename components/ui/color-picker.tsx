"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Palette, Check, X, AlertTriangle, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { getContrastColor, hasLowContrast } from "@/lib/color-utils"

interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
  className?: string
  showContrastWarning?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "bubble" | "button"
}

// Curated color palettes for better UX
const COLOR_PALETTES = {
  primary: [
    "#000000", "#ffffff", "#3b82f6", "#ef4444", "#10b981", 
    "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ],
  neutral: [
    "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8",
    "#64748b", "#475569", "#334155", "#1e293b", "#0f172a"
  ],
  warm: [
    "#fef2f2", "#fee2e2", "#fecaca", "#fca5a5", "#f87171",
    "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"
  ],
  cool: [
    "#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8",
    "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"
  ],
  nature: [
    "#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80",
    "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"
  ]
}

const PALETTE_NAMES = {
  primary: "Primär",
  neutral: "Neutral", 
  warm: "Warm",
  cool: "Cool",
  nature: "Natur"
}

export function ColorPicker({ 
  value, 
  onChange, 
  className, 
  showContrastWarning = true,
  size = "md",
  variant = "button"
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(value || "#000000")
  const [activePalette, setActivePalette] = useState<keyof typeof COLOR_PALETTES>("primary")
  const [copied, setCopied] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      setCustomColor(value)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleColorChange = (color: string) => {
    setCustomColor(color)
    onChange(color)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(customColor)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy color:', err)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return variant === "bubble" ? "w-8 h-8" : "h-8 px-3 text-sm"
      case "lg":
        return variant === "bubble" ? "w-12 h-12" : "h-12 px-4 text-base"
      default:
        return variant === "bubble" ? "w-10 h-10" : "h-10 px-4"
    }
  }

  const getIconSize = () => {
    switch (size) {
      case "sm": return "w-3 h-3"
      case "lg": return "w-5 h-5"
      default: return "w-4 h-4"
    }
  }

  const renderTrigger = () => {
    if (variant === "bubble") {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            isOpen ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300 hover:border-gray-400",
            getSizeClasses()
          )}
          style={{
            background: "conic-gradient(red, orange, yellow, green, cyan, blue, violet, red)",
          }}
          title="Farbe auswählen"
          aria-label="Farbe auswählen"
          aria-expanded={isOpen}
        >
          <Palette className={cn("text-white drop-shadow-sm", getIconSize())} />
          {/* Aktuelle Farbe als kleiner Kreis unten rechts */}
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: customColor, transform: 'translate(30%, 30%)' }} />
        </button>
      )
    }

    return (
      <Button
        type="button"
        variant="outline"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <div 
          className="w-4 h-4 rounded border"
          style={{ backgroundColor: customColor }}
        />
        <Palette className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <div className={cn("relative", className)} ref={pickerRef}>
      {renderTrigger()}

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[320px] max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Farbe auswählen</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Aktueller Hex-Code + Copy + Kontrastwarnung */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-28 px-2 py-1 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#000000"
              aria-label="Hex-Farbcode eingeben"
              maxLength={7}
            />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Farbe kopieren"
              >
                <Copy className={cn("w-4 h-4", copied ? "text-green-600" : "text-gray-500")} />
              </button>
            {showContrastWarning && hasLowContrast(customColor) && (
              <AlertTriangle className="w-4 h-4 text-amber-600 ml-1" />
            )}
          </div>

          {/* Color Picker Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benutzerdefinierte Farbe
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                aria-label="Farbe auswählen"
              />
            </div>
          </div>

          {/* Color Palettes */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Farbpaletten</label>
            </div>
            {/* Palette Tabs */}
            <div className="flex gap-1 mb-3 p-1 bg-gray-100 rounded-lg">
              {Object.entries(PALETTE_NAMES).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => setActivePalette(key as keyof typeof COLOR_PALETTES)}
                  className={cn(
                    "flex-1 px-2 py-1 text-xs font-medium rounded transition-colors",
                    activePalette === key 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
            {/* Active Palette Colors */}
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTES[activePalette].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className={cn(
                    "w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    customColor === color 
                      ? "border-blue-500 ring-2 ring-blue-200 scale-105" 
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  style={{ backgroundColor: color }}
                  title={`${color} auswählen`}
                  aria-label={`Farbe ${color} auswählen`}
                >
                  {customColor === color && (
                    <Check className="w-4 h-4 mx-auto text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 