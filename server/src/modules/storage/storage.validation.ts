import { z } from "zod";

const s3ConfigSchema = z.object({
  accessKeyId: z.string().min(1, "Access key ID is required"),
  secretAccessKey: z.string().min(1, "Secret access key is required"),
  bucket: z.string().min(1, "Bucket name is required"),
  region: z.string().min(1, "Region is required"),
});

const cloudinaryConfigSchema = z.object({
  cloudName: z.string().min(1, "Cloud name is required"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().min(1, "API secret is required"),
  folder: z.string().optional(),
  region: z.string().min(1, "Region is required"),
});

const googleDriveConfigSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client secret is required"),
  refreshToken: z.string().min(1, "Refresh token is required"),
  accessToken: z.string().optional(),
  folderId: z.string().optional(),
  region: z.string().min(1, "Region is required"),
});

// Main storage connection schema
export const connectStorageSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("aws_s3"),
    config: s3ConfigSchema,
  }),
  z.object({
    provider: z.literal("cloudinary"),
    config: cloudinaryConfigSchema,
  }),
  z.object({
    provider: z.literal("google_drive"),
    config: googleDriveConfigSchema,
  }),
]);

// For generateUploadUrl validation
export const uploadUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
});

// For generateDownloadUrl validation
export const downloadUrlSchema = z.object({
  key: z.string().min(1, "File key is required"),
});
