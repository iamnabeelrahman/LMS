import { v2 as cloudinary } from "cloudinary";
import { StorageAdapter, UploadUrlResult } from "../storage.types.js";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export class CloudinaryAdapter implements StorageAdapter {
  constructor(config: CloudinaryConfig) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
  }

  async generateUploadUrl(): Promise<UploadUrlResult> {
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      cloudinary.config().api_secret!,
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/upload`,
      key: signature,
    };
  }

  async generateDownloadUrl(publicId: string) {
    return cloudinary.url(publicId);
  }
}
