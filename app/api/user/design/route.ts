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
    console.log('Background Color from database:', user.backgroundColor);

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
      socialPosition: (user.socialPosition as 'top' | 'middle' | 'bottom') || 'bottom',
      showBranding: user.showBranding !== undefined && user.showBranding !== null ? user.showBranding : true,
      showShareButton: user.showShareButton !== undefined && user.showShareButton !== null ? user.showShareButton : false,
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
    // Nur wenn Wert !== undefined, dann speichern. Leere Strings werden zu null.
    if (displayName !== undefined) updateData.displayName = displayName === '' ? null : displayName
    if (bio !== undefined) updateData.bio = bio === '' ? null : bio
    if (avatarImage !== undefined) updateData.avatarUrl = avatarImage === '' ? null : avatarImage
    if (originalAvatarImage !== undefined) updateData.originalAvatarUrl = originalAvatarImage === '' ? null : originalAvatarImage
    if (avatarShape !== undefined) updateData.avatarShape = avatarShape
    if (avatarBorderColor !== undefined) updateData.avatarBorderColor = avatarBorderColor
    if (selectedTheme !== undefined) updateData.theme = selectedTheme
    if (buttonStyle !== undefined) updateData.buttonStyle = buttonStyle
    if (buttonColor !== undefined) updateData.buttonColor = buttonColor
    if (buttonGradient !== undefined) updateData.buttonGradient = buttonGradient
    if (buttonTextColor !== undefined) updateData.buttonTextColor = buttonTextColor
    if (useCustomButtonTextColor !== undefined) updateData.useCustomButtonTextColor = useCustomButtonTextColor
    if (selectedFont !== undefined) updateData.fontFamily = selectedFont
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor
    if (backgroundImage !== undefined) updateData.backgroundImageUrl = backgroundImage === '' ? null : backgroundImage
    if (backgroundType !== undefined) updateData.backgroundImageActive = backgroundType === 'image'
    if (textColor !== undefined) updateData.textColor = textColor
    if (backgroundOverlayType !== undefined) updateData.backgroundOverlayType = backgroundOverlayType
    if (backgroundOverlayColor !== undefined) updateData.backgroundOverlayColor = backgroundOverlayColor
    if (backgroundOverlayOpacity !== undefined) updateData.backgroundOverlayOpacity = backgroundOverlayOpacity
    if (displayNameColor !== undefined) updateData.displayNameColor = displayNameColor
    if (bioColor !== undefined) updateData.bioColor = bioColor
    if (usernameColor !== undefined) updateData.usernameColor = usernameColor
    if (footerColor !== undefined) updateData.footerColor = footerColor
    if (showBranding !== undefined) updateData.showBranding = showBranding
    if (socialPosition !== undefined) updateData.socialPosition = socialPosition
    if (showShareButton !== undefined) updateData.showShareButton = showShareButton

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
      console.log('Updated backgroundColor in database:', updatedUser.backgroundColor)
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