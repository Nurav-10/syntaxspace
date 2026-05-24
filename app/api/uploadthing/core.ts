import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Define your FileRouter, containing File Routes
export const ourFileRouter = {
  // Define an image uploader with specific constraints
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload completed. URL:", file.url);
      
      // Whatever value is returned here will be sent to the client-side callback
      return { url: file.url, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
