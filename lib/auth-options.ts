import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { JWT } from "next-auth/jwt"
import type { Session, AuthOptions, SessionStrategy } from "next-auth"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        })
        if (!user) return null
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) return null
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName || undefined,
          bio: user.bio || undefined,
          avatarUrl: user.avatarUrl || undefined,
          theme: user.theme || undefined,
          onboardingCompleted: user.onboardingCompleted || false,
          isPremium: user.isPremium,
        }
      }
    })
  ],
  session: { strategy: "jwt" as SessionStrategy },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: any }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.displayName = user.displayName
        token.bio = user.bio
        token.avatarUrl = user.avatarUrl
        token.theme = user.theme
        token.onboardingCompleted = user.onboardingCompleted
        token.isPremium = user.isPremium
      }
      return token
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.displayName = token.displayName as string
        session.user.bio = token.bio as string
        session.user.avatarUrl = token.avatarUrl as string
        session.user.theme = token.theme as string
        session.user.onboardingCompleted = token.onboardingCompleted as boolean
        session.user.isPremium = token.isPremium as boolean
      }
      return session
    }
  }
} 