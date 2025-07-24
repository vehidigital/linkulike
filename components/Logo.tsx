import React from "react";

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <span className="flex items-center gap-2 select-none">
      <span className="bg-black text-white rounded px-2 py-1 text-lg font-extrabold tracking-tight" style={{letterSpacing: 2, fontFamily: 'inherit'}}>LINKU</span>
      {withText && (
        <span className="text-black font-extrabold text-lg tracking-tight" style={{letterSpacing: 2, fontFamily: 'inherit'}}>LIKE</span>
      )}
    </span>
  );
} 