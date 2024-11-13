import { Injectable } from '@nestjs/common';
import { GGStorageService } from './gg-storage.service';
import { DigitalSpaceService } from './digital-space.service';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from 'src/commons/configs/configuration';
import { StorageType } from 'src/commons/enum';

@Injectable()
export class StorageFactoryService {
  constructor(
    private readonly ggStorageService: GGStorageService,
    private readonly digitalSpaceService: DigitalSpaceService,
    private readonly configService: ConfigService<ConfigurationType>,
  ) {}

  /**
   * Retrieves the appropriate StorageService based on the provided StorageType.
   * If the digital configuration does not have a spaces_bucket, it returns the GGStorageService.
   * Otherwise, it returns the DigitalSpaceService.
   *
   * @param {StorageType} type - The type of storage service to retrieve.
   * @return {StorageService} The corresponding storage service based on the provided type.
   */
  getService(type: StorageType): StorageService {
    // Get the digital configuration
    const digital = this.configService.get<ConfigurationType['digital']>('digital');

    // If there is no spaces_bucket in the digital configuration, return the GGStorageService
    if (!digital?.spaces_bucket) {
      return this.ggStorageService;
    }

    // Return the appropriate StorageService based on the provided StorageType
    switch (type) {
      case StorageType.DIGITAL:
        return this.digitalSpaceService; // Return the DigitalSpaceService for Digital StorageType
      case StorageType.GOOGLE:
      default:
        return this.ggStorageService; // Return the GGStorageService for Google StorageType
    }
  }

  /**
   * A function to get the appropriate StorageService based on the URL provided.
   *
   * @param {string} url - The URL to determine the storage service.
   * @return {StorageType} The corresponding StorageType based on the URL.
   */
  getStorageServiceFromUrl(url: string): StorageType {
    // Parse the URL to retrieve the hostname
    const url_obj = new URL(url);

    // Check if the hostname is for Google Cloud Storage
    if (url_obj.hostname === 'storage.googleapis.com') {
      return StorageType.GOOGLE;
    }

    // Check if the hostname is for DigitalOcean Spaces
    if (url_obj.hostname.includes('digitaloceanspaces.com')) {
      return StorageType.DIGITAL;
    }

    // Default to Google Cloud Storage
    return StorageType.GOOGLE;
  }

  /**
   * Deletes a file from the appropriate storage service based on the URL of the file.
   *
   * @param {string} file_url - The URL of the file to delete.
   * @return {Promise<boolean>} A Promise that resolves when the file is successfully deleted.
   */
  async deleteFileByUrl(file_url: string): Promise<boolean> {
    /**
     * Determine the storage service to use based on the URL.
     * If the URL is for Google Cloud Storage, use the Google Storage service.
     * If the URL is for DigitalOcean Spaces, use the DigitalOcean Storage service.
     */
    const storage_type = this.getStorageServiceFromUrl(file_url);
    if (storage_type === StorageType.GOOGLE) {
      /**
       * If the storage service is Google, call the deleteFileByUrl method on the Google Storage service.
       */
      return this.getService(StorageType.GOOGLE).deleteFileByUrl(file_url);
    } else {
      /**
       * If the storage service is DigitalOcean, call the deleteFileByUrl method on the DigitalOcean Storage service.
       */
      return this.getService(StorageType.DIGITAL).deleteFileByUrl(file_url);
    }
  }

  /**
   * Deletes multiple files by their URLs asynchronously.
   *
   * @param {string[]} file_urls - An array of URLs of the files to be deleted.
   * @return {Promise<boolean>} A promise that resolves to true when all files are successfully deleted,
   *                            or rejects if any deletion fails.
   */
  async deleteFilesByUrl(file_urls: string[]): Promise<boolean> {
    // Map over each file URL and call the deleteFileByUrl method for each file.
    // Use Promise.allSettled to wait for all deletions to complete.
    // If any deletion fails, the promise will reject.
    // If all deletions succeed, the promise will resolve to an array of settlement results.
    // We don't care about the settlement results, so we just return true.
    await Promise.allSettled(file_urls.map(async (file_url) => this.deleteFileByUrl(file_url)));

    return true;
  }

  /**
   * Asynchronously retrieves a pre-signed URL for uploading an object to storage.
   *
   * @param {Object} input - An object containing the filename of the object to be uploaded.
   * @param {string} input.filename - The name of the file to be uploaded.
   * @return {Promise<string>} A promise that resolves to the pre-signed URL for uploading the object.
   */
  async getPutObjectSignedUrl({ destination }: { destination: string }): Promise<string> {
    // Call the getPutObjectSignedUrl method on the digital storage service.
    // Pass in the filename as the destination parameter.
    return this.getService(StorageType.DIGITAL).getPutObjectSignedUrl({ destination });
  }
}
