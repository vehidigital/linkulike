import { notFound } from "next/navigation"
import { Metadata } from "next"
import { prisma } from "@/lib/db"
import ProfilePage from "@/components/profile/ProfilePage"
import { getTranslations } from "@/lib/i18n"
import { getLangFromHost } from "@/lib/server-utils"
import { LangDropdown } from "@/components/LangDropdown"

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      displayName: true,
      bio: true,
      username: true,
    },
  })

  if (!user) {
    return {
      title: "Profile Not Found",
    }
  }

  return {
    title: `${user.displayName || user.username} | Bio Links`,
    description: user.bio || `Check out ${user.displayName || user.username}'s bio links`,
    openGraph: {
      title: `${user.displayName || user.username} | Bio Links`,
      description: user.bio || `Check out ${user.displayName || user.username}'s bio links`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.displayName || user.username} | Bio Links`,
      description: user.bio || `Check out ${user.displayName || user.username}'s bio links`,
    },
  }
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const lang = await getLangFromHost()
  const t = getTranslations(lang)

  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      links: {
        include: {
          clicks: true
        },
        orderBy: { position: 'asc' }
      }
    }
  })

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
        <p className="text-gray-600">This profile doesn't exist.</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LangDropdown currentLang={lang} pathname={`/${username}`} />
      </div>
      
      {/* Profile Content */}
      <ProfilePage user={user as any} />
    </div>
  )
} 