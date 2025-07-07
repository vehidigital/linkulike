import React from "react"

export function SolidLinkButton({ title, color, icon, textColor }: { title?: string, color?: string, icon?: string, textColor?: string }) {
  const buttonTitle = title && title.trim().length > 0 ? title : 'Link'
  const effectiveTextColor = textColor || "#fff"

  return (
    <button
      className="w-full py-3 px-4 rounded-xl font-bold text-base mb-3 flex items-center justify-center gap-3 shadow"
      style={{
        backgroundColor: color || "#6366f1",
        color: effectiveTextColor,
        border: "none",
      }}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{buttonTitle}</span>
    </button>
  )
} 