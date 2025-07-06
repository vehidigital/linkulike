import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      displayName?: string
      bio?: string
      avatarUrl?: string
      theme?: string
      onboardingCompleted: boolean
      isPremium: boolean
    }
  }

  interface User {
    id: string
    email: string
    username: string
    displayName?: string
    bio?: string
    avatarUrl?: string
    theme?: string
    onboardingCompleted: boolean
    isPremium: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    displayName?: string
    bio?: string
    avatarUrl?: string
    theme?: string
    onboardingCompleted: boolean
    isPremium: boolean
  }
} 