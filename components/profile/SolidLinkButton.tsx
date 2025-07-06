import React from "react"

export function SolidLinkButton({ title, color, icon, textColor }: { title?: string, color?: string, icon?: string, textColor?: string }) {
  const buttonTitle = title && title.trim().length > 0 ? title : 'Link'
  const effectiveTextColor = textColor || "#fff"

  return (
    <button
      style={{
        backgroundColor: color || "#6366f1",
        color: effectiveTextColor,
        border: "none",
        borderRadius: "1rem",
        padding: "1rem 2rem",
        fontWeight: 700,
        fontSize: "1.1rem",
        width: "100%",
        opacity: 1,
        boxShadow: "0 4px 16px 0 rgba(0,0,0,0.13)",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        justifyContent: "center"
      }}
    >
      {icon && <span style={{ fontSize: "1.3em" }}>{icon}</span>}
      <span>{buttonTitle}</span>
    </button>
  )
} 