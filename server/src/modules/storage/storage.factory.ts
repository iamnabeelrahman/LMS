import { StorageIntegration } from "./storage.types.js"
import { S3Adapter } from "./adapters/s3.adapter.js"
import { CloudinaryAdapter } from "./adapters/cloudinary.adapter.js"
import { GDriveAdapter } from "./adapters/gdrive.adapter.js"

export const storageFactory = (integration: StorageIntegration) => {

  switch(integration.provider){

    case "aws_s3":
      return new S3Adapter(integration.config)

    case "cloudinary":
      return new CloudinaryAdapter(integration.config)

    case "google_drive":
      return new GDriveAdapter(integration.config)

    default:
      throw new Error("Unsupported storage provider")

  }

}