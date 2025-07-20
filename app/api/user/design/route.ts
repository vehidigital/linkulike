import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('=== DESIGN API GET CALLED ===')
    console.log('USERID (GET):', userId)
    
    let user = null;
    
    // Try to get user by userId
    if (userId) {
      try {
        console.log('[DESIGN] Searching for user with userId:', userId);
        user = await prisma.user.findUnique({
          where: { id: userId },
        });
        console.log('[DESIGN] User found via userId:', !!user, user?.displayName);
        if (user) {
          console.log('[DESIGN] User data:', {
            displayName: user.displayName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            theme: user.theme,
            backgroundColor: user.backgroundColor,
            buttonStyle: user.buttonStyle,
            buttonColor: user.buttonColor,
            textColor: user.textColor,
            fontFamily: user.fontFamily,
          });
        }
      } catch (error) {
        console.error('[DESIGN] Error finding user via userId:', error);
      }
    }

    if (!user) {
      console.log('No user found, returning default settings');
      // Return default design settings
      const defaultSettings = {
        displayName: '',
        bio: '',
        avatarImage: '',
        originalAvatarImage: '',
        avatarShape: 'circle' as const,
        avatarBorderColor: '#ffffff',
        selectedTheme: 'basics',
        isCustomTheme: false,
        buttonStyle: 'filled' as const,
        buttonColor: '#000000',
        buttonTextColor: '#ffffff',
        useCustomButtonTextColor: false,
        selectedFont: 'Inter',
        socialPosition: 'bottom' as const,
        showBranding: true,
        showShareButton: false,
        backgroundType: 'color' as const,
        backgroundImage: '',
        backgroundColor: '#1e3a8a',
        textColor: '#ffffff',
        backgroundOverlayType: 'dark',
        backgroundOverlayColor: '#000000',
        backgroundOverlayOpacity: 0.2,
        displayNameColor: '#ffffff',
        bioColor: '#ffffff',
        usernameColor: '#ffffff',
        footerColor: '#ffffff',
      }
      return NextResponse.json(defaultSettings)
    }

    console.log('Raw user data from database:', user);
    console.log('Avatar URL from database:', user.avatarUrl);
    console.log('Original Avatar URL from database:', user.originalAvatarUrl);
    console.log('Avatar Shape from database:', user.avatarShape);
    console.log('Avatar Border Color from database:', user.avatarBorderColor);

    // Transform to match our frontend interface - only use fields that exist in the schema
    const designSettings = {
      displayName: user.displayName || '',
      bio: user.bio || '',
      avatarImage: user.avatarUrl || '',
      originalAvatarImage: user.originalAvatarUrl || '',
      avatarShape: (user.avatarShape as 'circle' | 'rectangle') || 'circle',
      avatarBorderColor: user.avatarBorderColor || '#ffffff',
      selectedTheme: user.theme || 'basics',
      isCustomTheme: (user.theme || 'basics') === 'create-your-own',
      buttonStyle: (user.buttonStyle as 'filled' | 'outlined' | 'gradient') || 'filled',
      buttonColor: user.buttonColor || '#000000',
      buttonGradient: user.buttonGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      buttonTextColor: user.buttonTextColor || '#ffffff',
      useCustomButtonTextColor: user.useCustomButtonTextColor || false,
      selectedFont: user.fontFamily || 'Inter',
      socialPosition: 'bottom' as const,
      showBranding: user.showBranding !== undefined && user.showBranding !== null ? user.showBranding : true,
      showShareButton: true,
      backgroundType: user.backgroundImageActive ? 'image' : 'color',
      backgroundImage: user.backgroundImageUrl || '',
      backgroundColor: user.backgroundColor || '#1e3a8a',
      textColor: user.textColor || '#ffffff',
      backgroundOverlayType: user.backgroundOverlayType || 'dark',
      backgroundOverlayColor: user.backgroundOverlayColor || '#000000',
      backgroundOverlayOpacity: user.backgroundOverlayOpacity || 0.2,
      displayNameColor: user.displayNameColor || '#ffffff',
      bioColor: user.bioColor || '#ffffff',
      usernameColor: user.usernameColor || '#ffffff',
      footerColor: user.footerColor || '#ffffff',
    }

    console.log('Returning design settings:', designSettings)
    console.log('Final avatarImage value:', designSettings.avatarImage)
    console.log('=== DESIGN API GET END ===')
    return NextResponse.json(designSettings)
  } catch (error) {
    console.error('Error fetching design settings:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('=== DESIGN API PUT CALLED ===')
    console.log('USERID (PUT):', userId)
    console.log('REQUEST URL:', request.url)
    
    let user = null;
    
    // Try to get user by userId first (for unauthenticated access)
    if (userId) {
      try {
        console.log('[DESIGN PUT] Searching for user with userId:', userId);
        user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true }
        });
        console.log('[DESIGN PUT] User found via userId:', !!user, user?.id);
      } catch (error) {
        console.error('[DESIGN PUT] Error finding user via userId:', error);
      }
    }
    
    // If no user from userId, try session (for authenticated access)
    if (!user) {
      try {
        const session = await getServerSession(authOptions)
        console.log('SESSION (PUT):', session)
        
        if (session?.user?.email) {
          user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true }
          });
          console.log('User found via session:', !!user, user?.email);
        }
      } catch (error) {
        console.error('[DESIGN PUT] Error with session:', error);
      }
    }
    
    if (!user) {
      console.log('[DESIGN PUT] No user found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    console.log('BODY (PUT):', body)
    console.log('BODY displayName:', body.displayName)
    console.log('BODY bio:', body.bio)
    
    const {
      displayName,
      bio,
      avatarImage,
      originalAvatarImage,
      avatarShape,
      avatarBorderColor,
      selectedTheme,
      buttonStyle,
      buttonColor,
      buttonGradient,
      buttonTextColor,
      useCustomButtonTextColor,
      selectedFont,
      socialPosition,
      showBranding,
      showShareButton,
      backgroundType,
      backgroundImage,
      backgroundColor,
      textColor,
      backgroundOverlayType,
      backgroundOverlayColor,
      backgroundOverlayOpacity,
      displayNameColor,
      bioColor,
      usernameColor,
      footerColor,
    } = body

    // Prepare update data - only use fields that exist in the schema
    const updateData: any = {}
    
    // Only update fields that are actually provided
    if (displayName !== undefined) updateData.displayName = displayName || null
    if (bio !== undefined) updateData.bio = bio || null
    if (avatarImage !== undefined) updateData.avatarUrl = avatarImage || null
    if (originalAvatarImage !== undefined) updateData.originalAvatarUrl = originalAvatarImage || null
    if (avatarShape !== undefined) updateData.avatarShape = avatarShape || 'circle'
    if (avatarBorderColor !== undefined) updateData.avatarBorderColor = avatarBorderColor || '#ffffff'
    if (selectedTheme !== undefined) updateData.theme = selectedTheme || 'basics'
    if (buttonStyle !== undefined) updateData.buttonStyle = buttonStyle || 'filled'
    if (buttonColor !== undefined) updateData.buttonColor = buttonColor || '#000000'
    if (buttonGradient !== undefined) updateData.buttonGradient = buttonGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    if (buttonTextColor !== undefined) updateData.buttonTextColor = buttonTextColor || '#ffffff'
    if (useCustomButtonTextColor !== undefined) updateData.useCustomButtonTextColor = useCustomButtonTextColor || false
    if (selectedFont !== undefined) updateData.fontFamily = selectedFont || 'Inter'
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor || '#1e3a8a'
    if (backgroundImage !== undefined) updateData.backgroundImageUrl = backgroundImage || null
    if (backgroundType !== undefined) updateData.backgroundImageActive = backgroundType === 'image'
    if (textColor !== undefined) updateData.textColor = textColor || '#ffffff'
    if (backgroundOverlayType !== undefined) updateData.backgroundOverlayType = backgroundOverlayType || 'dark'
    if (backgroundOverlayColor !== undefined) updateData.backgroundOverlayColor = backgroundOverlayColor || '#000000'
    if (backgroundOverlayOpacity !== undefined) updateData.backgroundOverlayOpacity = backgroundOverlayOpacity || 0.2
    if (displayNameColor !== undefined) updateData.displayNameColor = displayNameColor || '#ffffff'
    if (bioColor !== undefined) updateData.bioColor = bioColor || '#ffffff'
    if (usernameColor !== undefined) updateData.usernameColor = usernameColor || '#ffffff'
    if (footerColor !== undefined) updateData.footerColor = footerColor || '#ffffff'
    if (showBranding !== undefined) updateData.showBranding = showBranding !== undefined ? showBranding : true

    console.log('Updating user with data:', updateData)
    console.log('Avatar border color being saved:', avatarBorderColor)
    console.log('displayName being saved:', updateData.displayName)
    console.log('bio being saved:', updateData.bio)

    try {
      // Update user with new design settings
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })

      console.log('User updated successfully:', updatedUser.id)
      console.log('Updated avatar border color in database:', updatedUser.avatarBorderColor)
      console.log('Updated displayName in database:', updatedUser.displayName)
      console.log('Updated bio in database:', updatedUser.bio)
      return NextResponse.json({ success: true, user: updatedUser })
    } catch (dbError) {
      console.error('Database update error:', dbError)
      console.error('Error details:', {
        userId: user.id,
        updateData: updateData,
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      })
      return NextResponse.json({ 
        error: 'Database update failed', 
        details: dbError instanceof Error ? dbError.message : 'Unknown error' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating design settings:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 