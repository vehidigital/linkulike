'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from 'next-auth/react';

export function ClaimMyLink() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle"|"checking"|"available"|"taken">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string|null>(null);
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string|null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    async function doLoginAndRedirect() {
      if (otpSuccess && userId && email && password) {
        // Automatischer Login nach erfolgreicher Verifizierung
        await signIn('credentials', { email, password, redirect: false });
        setTimeout(() => {
          router.push(`/${userId}/onboarding`);
        }, 1200);
      }
    }
    doLoginAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpSuccess, userId]);

  async function checkUsername(name: string) {
    setUsernameStatus("checking");
    setError(null);
    try {
      const res = await fetch("/api/auth/username-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name })
      });
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
      setError("Fehler bei der Prüfung. Bitte erneut versuchen.");
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username })
      });
      const data = await res.json();
      if (data.success && data.userId) {
        setSuccess(true);
        setUserId(data.userId);
        setOtpStep(true);
      } else {
        setError(data.error || "Fehler bei der Registrierung.");
      }
    } catch {
      setError("Fehler bei der Registrierung.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSuccess(true);
        setOtpError(null);
        // Weiterleitung erfolgt automatisch per useEffect
      } else {
        setOtpError(data.error || "Ungültiger Code.");
      }
    } catch {
      setOtpError("Fehler bei der Verifizierung.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResendOtp() {
    setResendLoading(true);
    setResendSuccess(false);
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setResendSuccess(true);
      } else {
        setOtpError(data.error || "Fehler beim Senden des Codes.");
      }
    } catch {
      setOtpError("Fehler beim Senden des Codes.");
    } finally {
      setResendLoading(false);
      setTimeout(() => setResendSuccess(false), 3000);
    }
  }

  // Hilfsfunktion für zufälligen String
  function randomString(length = 6) {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  function handleSimulateUser() {
    const rand = randomString(8);
    const newUsername = `demo_${rand}`;
    setUsername(newUsername);
    setEmail(`alexander.reich2102+${rand}@gmail.com`);
    setPassword('123');
    setUsernameStatus('idle');
    setError(null);
    checkUsername(newUsername);
  }

  return (
    <form onSubmit={otpStep ? handleVerifyOtp : handleClaim} className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto mt-10 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      {!otpStep && (
        <>
          <div className="w-full flex flex-col gap-2">
            <label className="font-bold text-lg">Claim your link</label>
            <div className="flex w-full gap-0">
              <span className="px-4 py-3 rounded-l-xl bg-gray-100 border border-r-0 border-gray-200 text-gray-500 font-bold text-lg select-none">linkulike.com/</span>
              <input
                type="text"
                className={`flex-1 px-4 py-3 rounded-r-xl border border-gray-200 text-lg font-medium focus:outline-none ${usernameStatus==="taken" ? "border-red-400 bg-red-50" : usernameStatus==="available" ? "border-green-400 bg-green-50" : ""}`}
                placeholder="yourname"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setUsernameStatus("idle");
                  setError(null);
                }}
                onBlur={e => username && checkUsername(username)}
                disabled={success}
                autoComplete="username"
                required
              />
            </div>
            <button
              type="button"
              className="mt-2 px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition self-end"
              onClick={handleSimulateUser}
              disabled={success}
            >
              Simulate random user
            </button>
            {username && usernameStatus==="checking" && <div className="text-xs text-gray-400 mt-1">Prüfe Verfügbarkeit...</div>}
            {username && usernameStatus==="available" && <div className="text-xs text-green-600 mt-1">Username ist verfügbar!</div>}
            {username && usernameStatus==="taken" && <div className="text-xs text-red-600 mt-1">Username ist bereits vergeben.</div>}
          </div>
          {usernameStatus==="available" && !success && (
            <>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg font-medium"
                placeholder="E-Mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg font-medium"
                placeholder="Passwort"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </>
          )}
          {error && <div className="text-red-600 text-sm w-full text-center">{error}</div>}
          {success ? (
            <div className="text-green-600 text-lg font-bold w-full text-center">Check your E-Mail for the verification code!</div>
          ) : (
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow hover:scale-[1.03] transition-transform disabled:opacity-60"
              disabled={loading || usernameStatus!=="available"}
            >
              {loading ? "Claiming..." : "Claim my link"}
            </button>
          )}
        </>
      )}
      {otpStep && (
        <>
          <div className="w-full flex flex-col gap-2">
            <label className="font-bold text-lg">E-Mail-Verifizierung</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg font-medium tracking-widest text-center"
              placeholder="6-stelliger Code"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0,6))}
              required
              disabled={otpSuccess}
              autoFocus
            />
            {otpError && <div className="text-red-600 text-sm w-full text-center">{otpError}</div>}
            {otpSuccess && <div className="text-green-600 text-lg font-bold w-full text-center">Verifiziert! Willkommen 🎉</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow hover:scale-[1.03] transition-transform disabled:opacity-60"
              disabled={otpLoading || otp.length!==6 || otpSuccess}
            >
              {otpLoading ? "Prüfe..." : "Verifizieren"}
            </button>
            <button
              type="button"
              className="w-full py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-md border-2 border-blue-200 hover:bg-blue-100 transition mt-2 disabled:opacity-60"
              onClick={handleResendOtp}
              disabled={resendLoading || otpSuccess}
            >
              {resendLoading ? "Sende erneut..." : resendSuccess ? "Code erneut gesendet!" : "Code erneut senden"}
            </button>
          </div>
        </>
      )}
    </form>
  );
} 