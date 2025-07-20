import { PublicNav } from "@/components/biolink-dashboard/PublicNav";
import { PublicFooter } from "@/components/biolink-dashboard/PublicFooter";
import { ClaimMyLink } from "@/components/biolink-dashboard/ClaimMyLink";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNav />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 text-center">Dein moderner Bio-Link.<br />Schnell. Schön. Smart.</h1>
        <p className="text-xl text-gray-500 mb-10 text-center max-w-2xl">Alle Links, Socials & Content an einem Ort. Für Creator, Brands & Teams. Kostenlos starten und sofort teilen!</p>
        <ClaimMyLink />
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <span className="text-3xl mb-2">⚡️</span>
            <div className="font-bold text-lg mb-1">Sofort startklar</div>
            <div className="text-gray-500 text-center">In 1 Minute eingerichtet. Keine App, kein Schnickschnack.</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <span className="text-3xl mb-2">🎨</span>
            <div className="font-bold text-lg mb-1">Individuell & schön</div>
            <div className="text-gray-500 text-center">Themes, Bilder, Farben, alles live anpassbar. Sieht immer top aus.</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <span className="text-3xl mb-2">📈</span>
            <div className="font-bold text-lg mb-1">Analytics & mehr</div>
            <div className="text-gray-500 text-center">Sieh, was funktioniert. Wachse mit Insights & Tools.</div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
} 