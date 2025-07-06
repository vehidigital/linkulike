import { notFound } from "next/navigation"
import { Metadata } from "next"
import { prisma } from "@/lib/db"
import ProfilePage from "@/components/profile/ProfilePage"

interface ProfilePageProps {
  params: { username: string }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
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
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      links: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        include: {
          clicks: {
            orderBy: { clickedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return <ProfilePage user={user} />
} 