import React from "react";

export function PublicFooter() {
  return (
    <footer className="w-full bg-white border-t py-8 flex flex-col items-center gap-2 text-gray-400 text-sm mt-16">
      <div>© {new Date().getFullYear()} Linkulike. All rights reserved.</div>
      <div className="flex gap-4">
        <a href="/imprint" className="hover:text-black">Imprint</a>
        <a href="/privacy" className="hover:text-black">Privacy</a>
      </div>
    </footer>
  );
} 