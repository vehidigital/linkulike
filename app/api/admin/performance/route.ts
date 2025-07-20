import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { cache } from '@/lib/cache';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you might want to add an isAdmin field to User model)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isPremium: true } // For demo, we'll use premium users as admins
    });

    if (!user?.isPremium) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get cache statistics
    const cacheStats = cache.getStats();

    // Get database statistics
    const [
      totalUsers,
      totalLinks,
      totalClicks,
      activeUsers,
      recentRegistrations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.link.count(),
      prisma.linkClick.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    // Get system performance metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Get recent errors (you might want to implement error logging)
    const recentErrors: any[] = []; // Placeholder for error logs

    const performanceData = {
      timestamp: new Date().toISOString(),
      cache: cacheStats,
      database: {
        totalUsers,
        totalLinks,
        totalClicks,
        activeUsers,
        recentRegistrations
      },
      system: {
        memoryUsage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024) // MB
        },
        uptime: Math.round(uptime), // seconds
        nodeVersion: process.version,
        platform: process.platform
      },
      errors: recentErrors
    };

    return NextResponse.json(performanceData);

  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isPremium: true }
    });

    if (!user?.isPremium) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action } = await request.json();

    switch (action) {
      case 'clearCache':
        cache.clear();
        return NextResponse.json({ success: true, message: 'Cache cleared' });

      case 'getCacheStats':
        return NextResponse.json({ stats: cache.getStats() });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in performance admin action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 