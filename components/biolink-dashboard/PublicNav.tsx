import React from "react";
import Link from "next/link";

export function PublicNav() {
  return (
    <nav className="w-full bg-white border-b sticky top-0 z-40 flex items-center justify-between px-8 py-4 shadow-sm">
      <Link href="/" className="text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
        <span className="bg-black text-white rounded px-2 py-1 text-lg">LINKU</span><span className="text-black">LIKE</span>
      </Link>
      <div className="flex gap-4 items-center">
        <Link href="/login" className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow hover:scale-[1.04] transition-transform">Login</Link>
        <Link href="/register" className="px-5 py-2 rounded-xl bg-gray-900 text-white font-bold text-lg shadow hover:scale-[1.04] transition-transform">Sign Up</Link>
      </div>
    </nav>
  );
} 