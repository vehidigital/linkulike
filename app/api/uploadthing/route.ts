import { createRouteHandler } from 'uploadthing/next';
import { uploadRouter } from './uploadthingRouter';

// Export handler for /api/uploadthing
export const { GET, POST } = createRouteHandler({ router: uploadRouter });

// Add logging to see if the route is being called
console.log('=== UPLOADTHING ROUTE LOADED ===');
console.log('Route handler created with router:', !!uploadRouter);
console.log('APP_ID available:', !!process.env.UPLOADTHING_APP_ID);
console.log('SECRET available:', !!process.env.UPLOADTHING_SECRET);
console.log('=== UPLOADTHING ROUTE LOADED END ==='); 