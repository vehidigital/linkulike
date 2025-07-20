import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isPremium: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isPremium) {
      return NextResponse.json({ error: 'User is already premium' }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Integrate with a payment processor (Stripe, PayPal, etc.)
    // 2. Create a subscription record
    // 3. Handle payment verification
    // 4. Update user status

    // For demo purposes, we'll just upgrade the user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        isPremium: true,
        // Add subscription record
        subscriptions: {
          create: {
            planId: 'pro-monthly',
            status: 'active',
            paymentProvider: 'demo',
            providerCustomerId: 'demo-customer',
            providerSubscriptionId: 'demo-subscription',
            start: new Date(),
            renewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully upgraded to Pro!',
      user: { isPremium: updatedUser.isPremium }
    });

  } catch (error) {
    console.error('Error upgrading to Pro:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        isPremium: true,
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      isPremium: user.isPremium,
      subscription: user.subscriptions[0] || null
    });

  } catch (error) {
    console.error('Error fetching Pro status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 