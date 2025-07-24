import React from 'react';
import { ThemeTemplate } from '@/lib/theme-templates';

export function ThemePhonePreview({ theme, displayName, bio }: { theme: ThemeTemplate, displayName?: string, bio?: string }) {
  const font = theme.styles.fontFamily || 'Inter';
  const bg = theme.styles.backgroundGradient
    ? undefined
    : theme.styles.backgroundColor || '#f3f4f6';
  const gradient = theme.styles.backgroundGradient;
  // Farben exakt aus dem Theme übernehmen
  const displayNameColor = theme.styles.displayNameColor;
  const bioColor = theme.styles.bioColor;
  const buttonStyle = theme.styles.buttonStyle;
  const buttonColor = theme.styles.buttonColor || '#2563eb';
  const buttonTextColor = buttonStyle === 'filled' ? (theme.styles.textColor || '#fff') : buttonColor;

  // Beispieltext oder Userdaten
  const shownDisplayName = displayName || 'John Doe';
  const shownBio = bio || 'Beispieltext';

  return (
    <div
      className="w-28 h-56 rounded-2xl shadow-lg border-2 border-black flex flex-col items-center justify-start overflow-hidden relative"
      style={{
        background: gradient || bg,
        fontFamily: font,
      }}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-black rounded-b-xl z-10" style={{marginTop: 0}} />
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-200 mt-5 mb-2 border-2 border-white flex items-center justify-center text-gray-400 text-lg font-bold">
        <span>😊</span>
      </div>
      {/* Displayname */}
      <div className="text-xs font-bold mb-0.5 truncate" style={{ color: displayNameColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>
        {shownDisplayName}
      </div>
      {/* Bio */}
      <div className="text-[10px] mb-2" style={{ color: bioColor, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
        {shownBio}
      </div>
      {/* Buttons */}
      <div className="flex flex-col gap-1 w-4/5">
        <div
          className={`rounded-full px-2 py-1 text-[11px] font-semibold shadow text-center ${buttonStyle === 'outlined' ? 'bg-transparent border-2' : ''}`}
          style={{
            background: buttonStyle === 'filled' ? buttonColor : 'transparent',
            borderColor: buttonStyle === 'outlined' ? buttonColor : 'transparent',
            color: buttonStyle === 'filled' ? buttonTextColor : buttonColor,
            borderWidth: buttonStyle === 'outlined' ? 2 : 0,
          }}
        >
          Button
        </div>
        <div
          className={`rounded-full px-2 py-1 text-[11px] font-semibold shadow text-center ${buttonStyle === 'outlined' ? 'bg-transparent border-2' : ''}`}
          style={{
            background: buttonStyle === 'filled' ? buttonColor : 'transparent',
            borderColor: buttonStyle === 'outlined' ? buttonColor : 'transparent',
            color: buttonStyle === 'filled' ? buttonTextColor : buttonColor,
            borderWidth: buttonStyle === 'outlined' ? 2 : 0,
          }}
        >
          Button
        </div>
      </div>
    </div>
  );
} 