"use client"

import { createContext, useContext, useState } from "react"
import { signIn, signOut } from "next-auth/react"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth-options"
import { prisma } from "./db"

interface AuthContextType {
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (email: string, password: string, username: string, displayName: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, displayName }),
      })
      
      if (response.ok) {
        return { success: true }
      } else {
        const error = await response.text()
        return { success: false, error }
      }
    } catch (error) {
      return { success: false, error: "Registration failed" }
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        return { success: false, error: result.error }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: "Sign in failed" }
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
  }

  return (
    <AuthContext.Provider value={{
      signUp: handleSignUp,
      signIn: handleSignIn,
      signOut: handleSignOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export async function getAuthRedirect() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return "/login"
  }

  // Prüfen ob Onboarding abgeschlossen ist
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true }
  })

  if (!user?.onboardingCompleted) {
    return "/onboarding"
  }

  return "/dashboard"
}

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Nicht authentifiziert")
  }

  return session.user
} 