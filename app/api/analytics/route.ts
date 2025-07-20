import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '7d';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '365d':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get user's links
    const links = await prisma.link.findMany({
      where: { userId: user.id },
      include: {
        clicks: {
          where: {
            clickedAt: {
              gte: startDate
            }
          }
        }
      }
    });

    // Calculate KPIs
    const totalClicks = links.reduce((sum: number, link: any) => sum + link.clicks.length, 0);
    const activeLinks = links.filter((link: any) => link.isActive).length;
    const profileViews = Math.floor(totalClicks * 0.3); // Estimate based on clicks
    const clickRate = activeLinks > 0 ? Math.round((totalClicks / activeLinks) * 10) / 10 : 0;

    // Top performing links
    const topLinks = links
      .filter((link: any) => link.isActive)
      .sort((a: any, b: any) => b.clicks.length - a.clicks.length)
      .slice(0, 10)
      .map((link: any) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        clicks: link.clicks.length,
        isActive: link.isActive
      }));

    // Click trends (daily for the selected range)
    const clickTrends = [];
    const days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayClicks = links.reduce((sum: number, link: any) => {
        return sum + link.clicks.filter((click: any) => 
          click.clickedAt >= dayStart && click.clickedAt < dayEnd
        ).length;
      }, 0);
      
      clickTrends.push({
        date: dayStart.toISOString().split('T')[0],
        clicks: dayClicks
      });
    }

    // Device analytics (if available)
    const deviceStats = await prisma.linkClick.groupBy({
      by: ['device'],
      where: {
        link: {
          userId: user.id
        },
        clickedAt: {
          gte: startDate
        },
        device: {
          not: null
        }
      },
      _count: {
        device: true
      }
    });

    // Geographic analytics (if available)
    const geoStats = await prisma.linkClick.groupBy({
      by: ['country'],
      where: {
        link: {
          userId: user.id
        },
        clickedAt: {
          gte: startDate
        },
        country: {
          not: null
        }
      },
      _count: {
        country: true
      }
    });

    return NextResponse.json({
      kpis: {
        totalClicks,
        activeLinks,
        profileViews,
        clickRate
      },
      topLinks,
      clickTrends,
      deviceStats: deviceStats.map((stat: any) => ({
        device: stat.device || 'Unknown',
        count: stat._count.device
      })),
      geoStats: geoStats.map((stat: any) => ({
        country: stat.country || 'Unknown',
        count: stat._count.country
      }))
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 