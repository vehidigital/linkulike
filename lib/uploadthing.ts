import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/uploadthingRouter";

export const UploadButton = generateUploadButton<UploadRouter>();
export const UploadDropzone = generateUploadDropzone<UploadRouter>();

// Generate the React helpers with the router
const { useUploadThing } = generateReactHelpers<UploadRouter>();

export { useUploadThing }; 