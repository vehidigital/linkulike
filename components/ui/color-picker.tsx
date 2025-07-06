"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Palette, Check, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getContrastColor, hasLowContrast } from "@/lib/color-utils"

interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
  className?: string
  showContrastWarning?: boolean
}

const PRESET_COLORS = [
  "#FF0000", "#FF4500", "#FF8C00", "#FFD700", "#32CD32", "#00CED1", 
  "#1E90FF", "#9370DB", "#FF69B4", "#FF1493", "#8B0000", "#006400",
  "#000080", "#4B0082", "#800080", "#FF6347", "#20B2AA", "#87CEEB",
  "#DDA0DD", "#F0E68C", "#98FB98", "#FFB6C1", "#E6E6FA", "#F5F5DC"
]

export function ColorPicker({ value, onChange, className, showContrastWarning = true }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(value || "#000000")
  const pickerRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className={cn("relative", className)} ref={pickerRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <div 
          className="w-4 h-4 rounded border"
          style={{ backgroundColor: customColor }}
        />
        <Palette className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border rounded-lg shadow-lg z-50 min-w-[280px]">
          <div className="space-y-4">
            {/* Custom Color Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Preset Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preset Colors
              </label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      "w-8 h-8 rounded border-2 transition-all hover:scale-110",
                      customColor === color ? "border-gray-800" : "border-gray-300"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {customColor === color && (
                      <Check className="w-4 h-4 mx-auto text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div 
                className="p-3 rounded border"
                style={{ 
                  backgroundColor: customColor,
                  color: getContrastColor(customColor)
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sample Text</span>
                  {showContrastWarning && hasLowContrast(customColor) && (
                    <div className="flex items-center gap-1 text-yellow-200">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs">Low contrast</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 