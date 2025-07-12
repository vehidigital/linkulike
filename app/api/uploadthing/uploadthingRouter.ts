import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { nanoid } from 'nanoid'; // Wird nicht mehr benötigt, aber bleibt für spätere Erweiterungen

const f = createUploadthing();

export const uploadRouter = {
  avatar: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async () => {
      console.log('=== UPLOADTHING MIDDLEWARE CALLED ===');
      console.log('Uploadthing Backend: Middleware called');
      console.log('Uploadthing Backend: APP_ID exists:', !!process.env.UPLOADTHING_APP_ID);
      console.log('Uploadthing Backend: SECRET exists:', !!process.env.UPLOADTHING_SECRET);
      console.log('Uploadthing Backend: APP_ID value:', process.env.UPLOADTHING_APP_ID?.substring(0, 20) + '...');
      console.log('Uploadthing Backend: SECRET value:', process.env.UPLOADTHING_SECRET?.substring(0, 20) + '...');
      console.log('=== UPLOADTHING MIDDLEWARE END ===');
      return {};
    })
    // .onUploadBegin entfernt, da in Uploadthing v5+ nicht mehr unterstützt
    .onUploadComplete(async ({ file, metadata }) => {
      console.log('=== UPLOADTHING UPLOAD COMPLETE ===');
      console.log('Uploadthing Backend: Upload completed');
      console.log('Uploadthing Backend: file object:', JSON.stringify(file, null, 2));
      console.log('Uploadthing Backend: file.url:', file.url);
      console.log('Uploadthing Backend: metadata:', metadata);
      
      const result = { url: file.url };
      console.log('Uploadthing Backend: Returning result:', result);
      console.log('=== UPLOADTHING UPLOAD COMPLETE END ===');
      
      return result;
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter; 