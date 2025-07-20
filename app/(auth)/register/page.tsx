"use client"

import Link from "next/link";
import { ClaimMyLink } from "@/components/biolink-dashboard/ClaimMyLink";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2 justify-center mb-4">
            <span className="bg-black text-white rounded px-2 py-1 text-lg">LINKU</span><span className="text-black">LIKE</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Registrieren</h1>
          <p className="text-gray-600">Erstelle deine eigene Link-in-Bio Seite</p>
        </div>
        
        <ClaimMyLink />
        
        <div className="text-center mt-8">
          <div className="text-gray-500">Schon einen Account? <Link href="/login" className="text-purple-600 font-bold hover:underline">Jetzt einloggen</Link></div>
        </div>
      </div>
    </div>
  );
}