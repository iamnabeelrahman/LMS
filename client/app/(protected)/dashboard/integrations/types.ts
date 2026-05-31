export interface StorageIntegration {
  id: number;
  organizationId: number;
  provider: "aws_s3" | "google_drive" | "cloudinary";
  config: any;
  isActive: boolean;
  region: string | null;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}
