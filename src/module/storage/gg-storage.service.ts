import {
  StreamFileInputInterface,
  StorageService,
  UploadFromPathInputInterface,
  UploadFromUrlInputInterface,
  GetPutObjectSignedUrlInterface,
} from './storage.service';
import { getStorage } from 'firebase-admin/storage';
import { Bucket } from '@google-cloud/storage';
import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mimeTypes from 'mime-types';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigurationType } from 'src/commons/configs/configuration';
import { FirebaseAccountService } from 'src/firebase-account';

@Injectable()
export class GGStorageService extends StorageService {
  static _instance: GGStorageService;
  private _bucket: Bucket;

  // Constructor for GGStorageService class
  constructor(
    // Injecting ConfigService instance for retrieving configuration values
    private readonly configService: ConfigService<ConfigurationType>,
    // Injecting HttpService instance for making requests
    private readonly httpService: HttpService,
  ) {
    super(); // Call the parent constructor

    /* Firebase Setup */
    // Check if there are no Firebase apps initialized
    if (admin.apps.length === 0) {
      // Initialize the Firebase Admin App using the credentials from the Firebase Account Service
      admin.initializeApp({
        credential: admin.credential.cert({
          clientEmail: FirebaseAccountService.client_email,
          privateKey: FirebaseAccountService.private_key,
          projectId: FirebaseAccountService.project_id,
        }),
      });
    }
    // Create a reference to the Google Cloud Storage bucket based on the configuration value
    this._bucket = getStorage().bucket(configService.get<ConfigurationType['gg_bucket']>('gg_bucket'));
  }

  /**
   * Uploads a file from a specified path to Google Cloud Storage.
   *
   * @param {UploadFromPathInputInterface} input - The input object containing the file path, Google Cloud Storage options, and destination.
   * @param {string} input.file_path - The path of the file to be uploaded.
   * @param {object} [input.gg_options] - Additional options for uploading the file to Google Cloud Storage.
   * @param {object} [input.gg_options.metadata] - Metadata to be associated with the uploaded file.
   * @param {string} input.destination - The destination path in Google Cloud Storage where the file will be uploaded.
   * @return {Promise<string|null>} The URL of the uploaded file, or null if an error occurred.
   */
  async uploadFromPath({ file_path, gg_options, destination }: UploadFromPathInputInterface): Promise<string | null> {
    try {
      // Determine the MIME type of the file
      const mime_type = mimeTypes.lookup(file_path) || '';

      // Upload the file to Google Cloud Storage
      const [result] = await this._bucket.upload(file_path, {
        destination, // The destination path in Google Cloud Storage where the file will be uploaded
        contentType: mime_type, // The MIME type of the file
        gzip: true, // Enable gzip compression
        metadata: {
          'Cache-Control': `public, max-age=${7 * 24 * 60 * 60}`, // Set the cache control to 1 day
          ...gg_options?.metadata, // Include any additional metadata provided in gg_options
        },
        ...gg_options, // Include any additional options provided in gg_options
      });

      // Return the URL of the uploaded file
      return `${result.storage.apiEndpoint}/${result.bucket.name}/${result.name}`;
    } catch (error) {
      // Log any errors that occur during the upload process
      console.log(`🚀 ~ GGStorageService ~ uploadFromPath ~ error:`, error);
      console.log('-----------------------');
      return null;
    }
  }

  /**
   * Uploads a file from a specified URL to Google Cloud Storage.
   *
   * @param {UploadFromUrlInputInterface} input - The input object containing the file URL, Google Cloud Storage options, and destination.
   * @param {string} input.file_url - The URL of the file to be uploaded.
   * @param {object} [input.gg_options] - Additional options for uploading the file to Google Cloud Storage.
   * @param {string} input.destination - The destination path in Google Cloud Storage where the file will be uploaded.
   * @return {Promise<string|null>} The URL of the uploaded file, or null if an error occurred.
   */
  async uploadFromUrl({ file_url, gg_options, destination }: UploadFromUrlInputInterface): Promise<string | null> {
    // Fetch the file from the specified URL as a readable stream
    const readable = await firstValueFrom(this.httpService.get(file_url, { responseType: 'stream' }));

    // Upload the file to Google Cloud Storage using the streamFile method
    return this.streamFile({
      destination, // The destination path in Google Cloud Storage where the file will be uploaded
      readable: readable.data, // The readable stream of the file to be uploaded
      gg_options, // Additional options for uploading the file to Google Cloud Storage
    });
  }

  /**
   * Streams a file to Google Cloud Storage.
   *
   * @param {StreamFileInputInterface} input - The input object containing the file destination, Google Cloud Storage options, and readable stream.
   * @param {string} input.destination - The destination path in Google Cloud Storage where the file will be uploaded.
   * @param {object} [input.gg_options] - Additional options for uploading the file to Google Cloud Storage.
   * @param {Readable} input.readable - The readable stream of the file to be uploaded.
   * @return {Promise<string|null>} The URL of the uploaded file, or null if an error occurred.
   */
  async streamFile({ destination, gg_options, readable }: StreamFileInputInterface): Promise<string | null> {
    // Create a write stream for the destination file in Google Cloud Storage
    const write_stream = this._bucket.file(destination).createWriteStream({
      gzip: true, // Enable gzip compression
      public: true, // Set the file to be publicly readable
      metadata: {
        'Cache-Control': `public, max-age=${7 * 24 * 60 * 60}`, // Set the cache control to 1 day
        ...gg_options?.metadata, // Include any additional metadata provided in gg_options
      },
      ...gg_options, // Include any additional options provided in gg_options
    });

    // Pipe the readable stream to the write stream and listen for errors and finish events
    const upload_status = await new Promise<boolean>((resolve) =>
      readable
        .pipe(write_stream)
        .on('error', function (err) {
          // Log any errors that occur during the upload process
          console.log(`🚀 ~ GGStorageService ~ err:`, err);
          return resolve(false);
        })
        .on('finish', function () {
          // Resolve the promise with true if the upload is successful
          return resolve(true);
        }),
    );

    // Return the URL of the uploaded file if successful, or null if an error occurred
    return upload_status ? `${this._bucket.storage.apiEndpoint}/${this._bucket.name}/${destination}` : null;
  }

  /**
   * Deletes multiple files from Google Cloud Storage asynchronously.
   *
   * @param {string[]} file_urls - An array of URLs of the files to be deleted.
   * @return {Promise<boolean>} A promise that resolves to true when all files are successfully deleted,
   *                            or rejects if any deletion fails.
   */
  async deleteFilesByUrl(file_urls: string[]): Promise<boolean> {
    // Use Promise.allSettled to wait for all deletions to complete.
    // If any deletion fails, the promise will reject.
    // If all deletions succeed, the promise will resolve to an array of settlement results.
    // We don't care about the settlement results, so we just return true.
    await Promise.allSettled(file_urls.map(async (file_url) => this.deleteFileByUrl(file_url)));

    return true;
  }

  /**
   * Deletes a file from Google Cloud Storage asynchronously.
   *
   * @param {string} file_url - The URL of the file to be deleted.
   * @return {Promise<boolean>} A promise that resolves to true if the file is deleted successfully,
   *                            otherwise false.
   */
  async deleteFileByUrl(file_url: string): Promise<boolean> {
    // Parse the file URL to extract the file name and bucket name.
    const url = new URL(file_url);
    const path_name = url.pathname.slice(1);
    const bucket_name = path_name.split('/')[0]; // Extract the bucket name from the pathname.
    const file_name = path_name.replace(bucket_name, '').slice(1); // Extract the file name from the pathname.
    const bucket = this._bucket.name !== bucket_name ? getStorage().bucket(bucket_name) : this._bucket; // Get the bucket object.

    try {
      // Delete the file from the bucket.
      await bucket.file(file_name).delete();

      // Log the success message.
      console.log(`${bucket.name}/${file_name} deleted`);

      // Return true to indicate that the file was successfully deleted.
      return true;
    } catch (error: any) {
      // Log the error message if the deletion fails.
      console.log(`🚀 ~ GGStorageService ~ error:`, error.message);

      // Return false to indicate that the deletion failed.
      return false;
    }
  }

  /**
   * Asynchronously retrieves a pre-signed URL for uploading an object to Google Cloud Storage.
   *
   * @param {Object} input - An object containing the filename of the object to be uploaded and the expiration time for the pre-signed URL.
   * @param {string} input.destination - The name of the file to be uploaded.
   * @param {number} [input.expires_in] - The duration in seconds for which the pre-signed URL should be valid. Defaults to 10 minutes.
   * @return {Promise<string>} A promise that resolves to the pre-signed URL for uploading the object.
   */
  async getPutObjectSignedUrl({ destination, expires_in = 10 * 60 }: GetPutObjectSignedUrlInterface): Promise<string> {
    // Get the file object from the bucket.
    const file = this._bucket.file(destination);

    // Get the signed URL for writing to the file.
    // The signed URL is a URL that can be used to upload the file to the bucket without needing to authenticate.
    // The signed URL is valid for the specified duration (in milliseconds).
    // The signed URL is generated with the x-amz-acl header set to "public-read", which makes the object publicly accessible.
    const [signed_url] = await file.getSignedUrl({
      action: 'write', // The action is to write to the file.
      version: 'v4', // The version of the signed URL.
      expires: Date.now() + expires_in * 1000, // The duration for which the signed URL is valid.
      extensionHeaders: { 'x-amz-acl': 'public-read' }, // The x-amz-acl header is set to "public-read".
    });

    // Return the signed URL.
    return signed_url;
  }
}
