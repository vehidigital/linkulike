"use client"

import Link from "next/link";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user?.id) {
      router.push(`/${session.user.id}/dashboard-biolink/links`);
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Ungültige E-Mail oder Passwort");
      } else if (result?.ok) {
        // Erfolgreicher Login - Session wird automatisch aktualisiert
        // und useEffect wird die Weiterleitung übernehmen
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render if already logged in
  if (session?.user?.id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 w-full max-w-md flex flex-col gap-8 items-center">
        <div className="text-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2 justify-center mb-4">
            <span className="bg-black text-white rounded px-2 py-1 text-lg">LINKU</span><span className="text-black">LIKE</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Willkommen zurück</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input 
            type="email" 
            placeholder="E-Mail" 
            className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Passwort" 
            className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow hover:scale-[1.03] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logge ein..." : "Login"}
          </button>
        </form>
        
        <div className="w-full flex flex-col gap-2 items-center">
          <button className="w-full py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg border-2 border-blue-200 hover:bg-blue-100 transition">
            Login mit Google (Demo)
          </button>
          <button className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg border-2 border-gray-200 hover:bg-gray-200 transition">
            Login mit Apple (Demo)
          </button>
        </div>
        
        <div className="text-gray-500 text-center w-full">
          Noch keinen Account? <Link href="/register" className="text-purple-600 font-bold hover:underline">Jetzt registrieren</Link>
        </div>
      </div>
    </div>
  );
} 