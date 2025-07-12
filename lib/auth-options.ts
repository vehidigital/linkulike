import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          // Log failed login attempt (missing credentials)
          await logLoginAttempt({
            email: credentials?.email || 'unknown',
            success: false,
            reason: 'missing_credentials',
            ipAddress: getClientIP(req),
            userAgent: req.headers?.['user-agent'] || null,
          })
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        })

        if (!user) {
          // Log failed login attempt (user not found)
          await logLoginAttempt({
            email: credentials.email.toLowerCase(),
            success: false,
            reason: 'user_not_found',
            ipAddress: getClientIP(req),
            userAgent: req.headers?.['user-agent'] || null,
          })
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          // Log failed login attempt (invalid password)
          await logLoginAttempt({
            email: credentials.email.toLowerCase(),
            success: false,
            reason: 'invalid_password',
            ipAddress: getClientIP(req),
            userAgent: req.headers?.['user-agent'] || null,
            userId: user.id,
          })
          return null
        }

        // Log successful login
        await logLoginAttempt({
          email: credentials.email.toLowerCase(),
          success: true,
          reason: 'success',
          ipAddress: getClientIP(req),
          userAgent: req.headers?.['user-agent'] || null,
          userId: user.id,
        })

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName || undefined,
          bio: user.bio || undefined,
          avatarUrl: user.avatarUrl || undefined,
          theme: user.theme || undefined,
          isPremium: user.isPremium,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.displayName = user.displayName
        token.bio = user.bio
        token.avatarUrl = user.avatarUrl
        token.theme = user.theme
        token.isPremium = user.isPremium
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.displayName = token.displayName
        session.user.bio = token.bio
        session.user.avatarUrl = token.avatarUrl
        session.user.theme = token.theme
        session.user.isPremium = token.isPremium
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: isProd
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        domain: isProd ? ".linkulike.com" : ".linkulike.local",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
      },
    },
  },
}

export async function getAuthRedirect(): Promise<string> {
  const isProd = process.env.NODE_ENV === "production";
  
  // In Produktion: Prüfe Hostname für Sprach-Subdomain
  if (isProd && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.startsWith('de.')) {
      return '/de/login';
    }
  }
  
  // Standard: Login-Seite ohne Sprach-Präfix
  return '/login';
}

// Helper function to get client IP address
function getClientIP(req: any): string | null {
  if (!req) return null;
  
  // Check various headers for IP address
  const forwarded = req.headers?.['x-forwarded-for'];
  const realIP = req.headers?.['x-real-ip'];
  const cfConnectingIP = req.headers?.['cf-connecting-ip'];
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || cfConnectingIP || req.connection?.remoteAddress || null;
}

// Helper function to log login attempts
async function logLoginAttempt({
  email,
  success,
  reason,
  ipAddress,
  userAgent,
  userId = null,
}: {
  email: string;
  success: boolean;
  reason: 'missing_credentials' | 'user_not_found' | 'invalid_password' | 'success';
  ipAddress: string | null;
  userAgent: string | null;
  userId?: string | null;
}) {
  try {
    // Note: Current LoginLog model only supports basic fields
    // TODO: Extend LoginLog model to include success, reason, email fields
    if (userId) {
      await prisma.loginLog.create({
        data: {
          userId,
          ip: ipAddress,
          userAgent,
        },
      });
    }
  } catch (error) {
    // Don't fail authentication if logging fails
    console.error('Failed to log login attempt:', error);
  }
} 