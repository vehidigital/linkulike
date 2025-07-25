import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Share2 } from 'lucide-react';
import { SocialIcon } from 'react-social-icons';
import { getContrastColor } from '@/lib/color-utils';
import { Logo } from './Logo';

function getBackgroundStyle(settings: any) {
  // Helles Standardlayout
  if (!settings || (!settings.backgroundColor && !settings.backgroundImage)) {
    return {
      background: '#f4f6fa',
    };
  }
  if (settings.backgroundType === 'image' && settings.backgroundImage) {
    return {
      backgroundImage: `url(${settings.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: settings.backgroundColor || '#f4f6fa',
    };
  }
  return { background: settings.backgroundColor || '#f4f6fa' };
}

function getTextColor(settings: any) {
  return settings?.textColor || '#222';
}

function getFontFamily(settings: any) {
  return settings?.fontFamily || 'inherit';
}

function getButtonStyle(settings: any) {
  // Button-Textfarbe bestimmen
  let buttonTextColor = settings?.buttonTextColor;
  if (!settings?.useCustomButtonTextColor) {
    buttonTextColor = getContrastColor(settings?.buttonColor || '#3b82f6');
  }
  // Schriftart bestimmen
  const fontFamily = settings?.selectedFont || getFontFamily(settings);
  // Button-Stil anwenden
  if (settings?.buttonStyle === 'outlined') {
    return {
      background: 'transparent',
      border: `2px solid ${settings?.buttonColor || '#3b82f6'}`,
      color: buttonTextColor || settings?.buttonColor || '#3b82f6',
      fontWeight: 600,
      fontFamily,
    };
  } else {
    // Filled (default)
    return {
      background: settings?.buttonColor || '#3b82f6',
      color: buttonTextColor,
      border: 'none',
      fontWeight: 600,
      fontFamily,
    };
  }
}

export interface ProfileViewProps {
  userData: any;
  links: any[];
  socials: any[];
  settings: any;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userData, links, socials, settings }) => {
  // Socials nach Position filtern
  const socialsBar = (css: string) => {
    const totalIcons = socials.length;
    if (totalIcons === 0) return null;
    // Maximal 4 pro Reihe, dynamisch umbrechen
    const iconsPerRow = 4;
    const rows = [];
    for (let i = 0; i < totalIcons; i += iconsPerRow) {
      rows.push(socials.slice(i, i + iconsPerRow));
    }
    return (
      <div className={`w-full flex flex-col items-center gap-2 ${css}`}>
        {rows.map((row, idx) => (
          <div key={idx} className={`flex flex-row justify-center gap-4`}>
            {row.map((s: any) => (
              <SocialIcon key={s.id} url={s.value} network={s.platform} style={{ width: 36, height: 36 }} bgColor="#fff" fgColor="#222" className="bg-white/90 rounded-full p-2 shadow hover:scale-110 transition-transform duration-200 flex items-center justify-center" />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col w-[340px] min-h-[600px] max-h-[90vh] py-8 rounded-[3rem] shadow-2xl border-[6px] border-neutral-900 overflow-hidden bg-white" style={getBackgroundStyle(settings)}>
      {/* iPhone Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" style={{marginTop: '-6px'}} />
      {/* Share-Button oben links (optional) */}
      {settings?.showShareButton && (
        <button className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg z-10 hover:scale-110 transition-transform duration-200">
          <Share2 className="w-5 h-5 text-purple-600" />
        </button>
      )}
      <div className="flex-1 min-h-0 w-full overflow-y-auto flex flex-col items-center">
        {/* Socials oben */}
        {settings?.socialPosition === 'top' && socialsBar('mt-8 mb-2')}
        {/* Header-Bereich */}
        <div className="flex flex-col items-center w-full px-6 pt-10 pb-4">
          <Avatar className={`w-24 h-24 mb-4 ${settings?.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
            style={{ border: `4px solid ${settings?.avatarBorderColor || '#ffffff'}` }}>
            <AvatarImage src={userData?.avatarUrl || settings?.avatarImage} />
            <AvatarFallback className="bg-white flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-2 text-center truncate" style={{ fontFamily: settings?.selectedFont || getFontFamily(settings), color: settings?.displayNameColor || getTextColor(settings), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {settings?.displayName || userData?.displayName || 'Dein Name'}
          </h1>
          <p className="text-base mb-4 text-center opacity-90" style={{ fontFamily: settings?.selectedFont || getFontFamily(settings), color: settings?.bioColor || getTextColor(settings), wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {(settings?.bio || userData?.bio || 'Deine Bio')}
          </p>
        </div>
        {/* Socials in der Mitte */}
        {settings?.socialPosition === 'middle' && socialsBar('mb-2')}
        {/* Links */}
        <div className="flex flex-col gap-4 w-full max-w-xs mt-4 mb-8">
          {links.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Noch keine Links vorhanden</p>
            </div>
          )}
          {links.map((link: any) => {
            // Highlight-Styles
            let highlightClass = "";
            let highlightIcon = null;
            if (link.highlight) {
              switch (link.highlightStyle) {
                case "star":
                  highlightClass = "ring-2 ring-yellow-400 shadow-yellow-200";
                  highlightIcon = (
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                  );
                  break;
                case "sparkle":
                  highlightClass = "animate-pulse ring-2 ring-purple-400 shadow-purple-200";
                  highlightIcon = (
                    <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                  );
                  break;
                case "shake":
                  highlightClass = "animate-shake ring-2 ring-blue-400 shadow-blue-200";
                  highlightIcon = (
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
                  );
                  break;
                case "pulse":
                  highlightClass = "animate-pulse ring-2 ring-red-400 shadow-red-200";
                  highlightIcon = (
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
                  );
                  break;
                case "glow":
                  highlightClass = "ring-4 ring-yellow-300 shadow-yellow-300/40";
                  highlightIcon = (
                    <svg className="w-5 h-5 text-yellow-300 mr-2" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
                  );
                  break;
                default:
                  highlightClass = "ring-2 ring-yellow-400";
              }
            }
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-4 px-4 rounded-full font-semibold text-center shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 ${highlightClass}`}
                style={getButtonStyle(settings)}
              >
                {highlightIcon}
                {link.title}
              </a>
            );
          })}
        </div>
        {/* Socials unten */}
        {settings?.socialPosition === 'bottom' && socialsBar('mb-4')}
        {/* Branding sticky am unteren Rand */}
        {settings?.showBranding && (
          <div className="flex flex-col items-center justify-center mt-4 mb-4">
            <a
              href="https://linkulike.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/70 rounded-full px-3 py-1 shadow-sm text-xs font-medium text-gray-500 hover:text-purple-600 transition-colors max-w-fit"
              style={{letterSpacing: 0.2}}
            >
              Powered by Linkulike
            </a>
          </div>
        )}
      </div>
    </div>
  );
}; 