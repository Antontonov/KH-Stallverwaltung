import { createUploadthing, type FileRouter } from "uploadthing/express";
import type { Request } from "express";

const f = createUploadthing();

export const uploadRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }: { req: Request }) => {
      if (!(req as any).isAuthenticated?.()) throw new Error("Unauthorized");
      return { userId: (req as any).user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),

  document: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  })
    .middleware(async ({ req }: { req: Request }) => {
      if (!(req as any).isAuthenticated?.()) throw new Error("Unauthorized");
      return { userId: (req as any).user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
