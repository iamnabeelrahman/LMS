import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3"

import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import {
  StorageAdapter,
  UploadUrlResult
} from "../storage.types.js"

type S3Config = {

  accessKey: string
  secretKey: string
  bucket: string
  region: string

}

export class S3Adapter implements StorageAdapter {

  private client: S3Client
  private bucket: string

  constructor(config: S3Config){

    this.bucket = config.bucket

    this.client = new S3Client({
      region: config.region,
      credentials:{
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey
      }
    })

  }

  async generateUploadUrl(
    fileName:string,
    fileType:string
  ): Promise<UploadUrlResult>{

    const key = `uploads/${Date.now()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket:this.bucket,
      Key:key,
      ContentType:fileType
    })

    const url = await getSignedUrl(
      this.client,
      command,
      {expiresIn:3600}
    )

    return {
      uploadUrl:url,
      key
    }

  }

  async generateDownloadUrl(key:string):Promise<string>{

    const command = new GetObjectCommand({
      Bucket:this.bucket,
      Key:key
    })

    return getSignedUrl(
      this.client,
      command,
      {expiresIn:3600}
    )

  }

}