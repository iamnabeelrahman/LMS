import { StorageAdapter } from "./storage.types.js";

export class StorageService {
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  async generateUploadUrl(fileName: string, fileType: string) {
    return this.adapter.generateUploadUrl(fileName, fileType);
  }


  async generateDownloadUrl(key: string) {
    return this.adapter.generateDownloadUrl(key);
  }
}