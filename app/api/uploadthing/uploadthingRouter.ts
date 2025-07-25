import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { nanoid } from 'nanoid';
import { UTApi } from 'uploadthing/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

const f = createUploadthing();
const utapi = new UTApi();

export const uploadRouter = {
  avatar: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      console.log('=== UPLOADTHING AVATAR MIDDLEWARE CALLED ===');
      
      // Try to get session first
      const session = await getServerSession(authOptions);
      console.log('=== UPLOADTHING SESSION:', session);
      
      let user = null;
      let userEmail = null;
      
      // Try to get user from session
      if (session?.user?.email) {
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, avatarUrl: true, originalAvatarUrl: true }
        });
        userEmail = session.user.email;
        console.log('=== UPLOADTHING USER FROM SESSION:', !!user, user?.id);
      }
      
      // If no user from session, this might be an onboarding upload
      // Create a temporary user context for onboarding
      if (!user) {
        console.log('=== UPLOADTHING NO SESSION - ONBOARDING MODE');
        // For onboarding, we'll use a temporary context
        // The actual user will be created/updated during onboarding completion
        return { 
          userId: 'onboarding-temp', 
          userEmail: 'onboarding@temp.com',
          currentAvatarUrl: null,
          currentOriginalAvatarUrl: null,
          isOnboarding: true
        };
      }
      
      console.log('=== UPLOADTHING MIDDLEWARE END ===');
      return { 
        userId: user.id, 
        userEmail: userEmail,
        currentAvatarUrl: user.avatarUrl,
        currentOriginalAvatarUrl: user.originalAvatarUrl,
        isOnboarding: false
      };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log('=== UPLOADTHING AVATAR UPLOAD COMPLETE ===');
      console.log('Uploadthing Backend: Upload completed');
      console.log('Uploadthing Backend: file object:', JSON.stringify(file, null, 2));
      console.log('Uploadthing Backend: file.ufsUrl:', file.ufsUrl);
      console.log('Uploadthing Backend: metadata:', metadata);
      
      try {
        // Use the original URL from UploadThing - no need to manipulate it
        const newUrl = file.ufsUrl;
        
        // Skip database updates if this is an onboarding upload
        if (metadata.isOnboarding) {
          console.log('=== UPLOADTHING ONBOARDING MODE - SKIPPING DB UPDATE ===');
          const result = { url: newUrl, key: file.key };
          console.log('Uploadthing Backend: Returning result for onboarding:', result);
          console.log('=== UPLOADTHING UPLOAD COMPLETE END ===');
          return result;
        }
        
        // Delete old avatar files based on the type being uploaded
        const isOriginal = file.name.includes('original');
        
        if (isOriginal) {
          // If uploading original, delete old original
          if (metadata.currentOriginalAvatarUrl) {
            try {
              const oldKey = metadata.currentOriginalAvatarUrl.split('/').pop();
              if (oldKey) {
                await utapi.deleteFiles([oldKey]);
                console.log('Old original avatar file deleted:', oldKey);
              }
            } catch (deleteError) {
              console.log('Could not delete old original avatar file:', deleteError);
            }
          }
        } else {
          // If uploading cropped, delete old cropped
          if (metadata.currentAvatarUrl) {
            try {
              const oldKey = metadata.currentAvatarUrl.split('/').pop();
              if (oldKey) {
                await utapi.deleteFiles([oldKey]);
                console.log('Old cropped avatar file deleted:', oldKey);
              }
            } catch (deleteError) {
              console.log('Could not delete old cropped avatar file:', deleteError);
            }
          }
        }
        
        // CRITICAL FIX: Update the database with the new URL
        // This ensures that subsequent uploads will see the correct current URLs
        try {
          // Determine if this is an original or cropped upload based on filename
          const isOriginal = file.name.includes('original');
          
          if (isOriginal) {
            // This is the original image upload
            await prisma.user.update({
              where: { email: metadata.userEmail },
              data: { originalAvatarUrl: newUrl }
            });
            console.log('Database updated with new original avatar URL:', newUrl);
          } else {
            // This is the cropped image upload
            await prisma.user.update({
              where: { email: metadata.userEmail },
              data: { avatarUrl: newUrl }
            });
            console.log('Database updated with new cropped avatar URL:', newUrl);
          }
        } catch (dbError) {
          console.error('Failed to update database with new avatar URL:', dbError);
          // Don't fail the upload if database update fails
        }
        
        const result = { url: newUrl, key: file.key };
        console.log('Uploadthing Backend: Returning result:', result);
        console.log('=== UPLOADTHING UPLOAD COMPLETE END ===');
        
        return result;
      } catch (error) {
        console.error('Error processing avatar upload:', error);
        return { url: file.ufsUrl, key: file.key };
      }
    }),
    
  background: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(async ({ req, files }) => {
      console.log('=== UPLOADTHING BACKGROUND MIDDLEWARE CALLED ===');
      let user = null;
      let userEmail = null;
      let userId = null;
      let currentBackgroundUrl = null;

      // 1. Versuche Session
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, email: true, backgroundImageUrl: true }
        });
        if (user) {
          userId = user.id;
          userEmail = user.email;
          currentBackgroundUrl = user.backgroundImageUrl;
        }
      }

      // 2. Fallback: userId aus Dateiname extrahieren (z.B. user_xxx/)
      if (!user && files && files.length > 0) {
        const file = files[0];
        // Dateiname: user_xxx/background_...
        const match = file.name.match(/^user_([\w-]+)\//);
        if (match && match[1]) {
          userId = match[1];
          user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, backgroundImageUrl: true }
          });
          if (user) {
            userEmail = user.email;
            currentBackgroundUrl = user.backgroundImageUrl;
          }
        }
      }

      if (!user) {
        throw new Error('Unauthorized (no session and no valid userId in filename)');
      }

      console.log('=== UPLOADTHING BACKGROUND MIDDLEWARE END ===');
      return {
        userId,
        userEmail,
        currentBackgroundUrl
      };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log('=== UPLOADTHING BACKGROUND UPLOAD COMPLETE ===');
      try {
        const newUrl = file.ufsUrl;
        // Delete old background if exists
        if (metadata.currentBackgroundUrl) {
          try {
            const oldKey = metadata.currentBackgroundUrl.split('/').pop();
            if (oldKey) {
              await utapi.deleteFiles([oldKey]);
              console.log('Old background deleted:', oldKey);
            }
          } catch (deleteError) {
            console.log('Could not delete old background:', deleteError);
          }
        }
        // Update DB: Fallback auf userId, wenn userEmail fehlt
        try {
          if (metadata.userEmail) {
            await prisma.user.update({
              where: { email: metadata.userEmail },
              data: {
                backgroundImageUrl: newUrl,
                backgroundImageActive: true
              }
            });
          } else if (metadata.userId) {
            await prisma.user.update({
              where: { id: metadata.userId },
              data: {
                backgroundImageUrl: newUrl,
                backgroundImageActive: true
              }
            });
          }
          console.log('Database updated with new background URL:', newUrl);
        } catch (dbError) {
          console.error('Failed to update database with new background URL:', dbError);
        }
        const result = { url: newUrl, key: file.key };
        console.log('Uploadthing Backend: Returning result:', result);
        console.log('=== UPLOADTHING BACKGROUND UPLOAD COMPLETE END ===');
        return result;
      } catch (error) {
        console.error('Error processing background upload:', error);
        return { url: file.ufsUrl, key: file.key };
      }
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter; 