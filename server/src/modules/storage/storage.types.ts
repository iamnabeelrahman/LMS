export type StorageConfig =
  | { provider: "aws_s3"; config: S3Config }
  | { provider: "google_drive"; config: GoogleDriveConfig }
  | { provider: "cloudinary"; config: CloudinaryConfig };

export type StorageProvider = "aws_s3" | "cloudinary" | "google_drive";

export type S3Config = {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
};

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
  region: string;
};

export type GoogleDriveConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  folderId?: string;
  region: string;
};

export interface StorageIntegration {
  id: number;
  organizationId: number;
  provider: StorageProvider;
  config: any;
  isActive: boolean;
  createdAt: Date;
}

export interface UploadUrlResult {
  uploadUrl: string;
  key: string;
}

export interface StorageAdapter {
  generateUploadUrl(
    fileName: string,
    fileType: string,
  ): Promise<UploadUrlResult>;

  generateDownloadUrl(key: string): Promise<string>;
}
