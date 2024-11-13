import { Injectable } from '@nestjs/common';
import {
  StreamFileInputInterface,
  StorageService,
  UploadFromPathInputInterface,
  UploadFromUrlInputInterface,
  GetPutObjectSignedUrlInterface,
} from './storage.service';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import * as mimeTypes from 'mime-types';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigurationType } from 'src/commons/configs/configuration';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class DigitalSpaceService extends StorageService {
  private _client: S3Client;
  private _bucket: string;
  private _bucket_domain: string;

  /**
   * Constructor for DigitalSpaceService.
   *
   * This constructor initializes the DigitalSpaceService instance with the necessary
   * configuration values and dependencies. It sets up the S3Client instance with the
   * appropriate credentials and endpoint information.
   *
   * @param configService - ConfigService instance for accessing configuration values.
   * @param httpService - HttpService instance for making HTTP requests.
   */
  constructor(
    private readonly configService: ConfigService<ConfigurationType>, // Dependency injection of ConfigService instance
    private readonly httpService: HttpService, // Dependency injection of HttpService instance
  ) {
    super(); // Call the parent class constructor

    // Get the digital configuration from the config service.
    // This configuration contains information about the DigitalOcean Spaces
    // bucket and domain that we will be using.
    const digital = configService.get<ConfigurationType['digital']>('digital');
    if (digital) {
      // Set the bucket name and domain from the configuration.
      // These are used to identify the bucket and domain in DigitalOcean Spaces.
      this._bucket = digital.spaces_bucket;
      this._bucket_domain = digital.spaces_bucket_domain;

      // Create a new S3Client instance with the provided configuration.
      // This instance will be used to interact with DigitalOcean Spaces.
      // The configuration includes the endpoint (domain), region, and credentials.
      // The credentials are used to authenticate with DigitalOcean Spaces.
      this._client = new S3Client({
        forcePathStyle: false, // Set to false to use subdomain-style URLs
        endpoint: digital.spaces_domain, // The domain of the DigitalOcean Spaces endpoint
        region: digital.spaces_region, // The region of the DigitalOcean Spaces endpoint
        credentials: {
          accessKeyId: digital.spaces_key, // The access key for authenticating with DigitalOcean Spaces
          secretAccessKey: digital.spaces_secret, // The secret key for authenticating with DigitalOcean Spaces
        },
      });
    }
  }

  /**
   * Uploads a file from a specified path to DigitalOcean Spaces.
   *
   * @param {UploadFromPathInputInterface} input - The input object containing the file path, AWS options, and destination.
   * @param {string} input.file_path - The path of the file to be uploaded.
   * @param {object} [input.aws_options] - Additional options for uploading the file to DigitalOcean Spaces.
   * @param {string} input.destination - The destination path in DigitalOcean Spaces where the file will be uploaded.
   * @return {Promise<string|null>} The URL of the uploaded file, or null if an error occurred.
   */
  async uploadFromPath({ file_path, aws_options, destination }: UploadFromPathInputInterface): Promise<string | null> {
    try {
      const body = readFileSync(file_path); // Read the contents of the file
      const mime_type = mimeTypes.lookup(file_path) || ''; // Get the MIME type of the file

      // Create a PutObjectCommand instance with the provided options
      const input = new PutObjectCommand({
        Bucket: this._bucket, // The bucket name
        Key: destination, // The destination path in the bucket
        Body: body, // The contents of the file
        ACL: 'public-read', // Set the ACL to public-read
        ContentType: mime_type, // Set the MIME type of the file
        CacheControl: `public, max-age=${7 * 24 * 60 * 60}`, // Set the cache control to 1 day
        ...aws_options, // Include any additional options provided in aws_options
      });

      // Send the PutObjectCommand to DigitalOcean Spaces
      await this._client.send(input);

      // Return the URL of the uploaded file
      return `${this._bucket_domain}/${destination}`;
    } catch (error) {
      console.log(`🚀 ~ DigitalSpaceService ~ upload ~ error:`, error);
      return null; // Return null if an error occurred
    }
  }

  /**
   * Uploads a file from a specified URL to DigitalOcean Spaces.
   *
   * @param {UploadFromUrlInputInterface} input - The input object containing the file URL, AWS options, and destination.
   * @param {string} input.file_url - The URL of the file to be uploaded.
   * @param {object} [input.aws_options] - Additional options for uploading the file to DigitalOcean Spaces.
   * @param {string} input.destination - The destination path in DigitalOcean Spaces where the file will be uploaded.
   * @return {Promise<string|null>} The URL of the uploaded file, or null if an error occurred.
   */
  async uploadFromUrl({ file_url, aws_options, destination }: UploadFromUrlInputInterface): Promise<string | null> {
    // Fetch the file from the specified URL as a readable stream
    const readable = await firstValueFrom(this.httpService.get(file_url, { responseType: 'stream' }));

    // Extract the MIME type of the file from the URL
    const url = new URL(file_url);
    const mime_type = mimeTypes.lookup(url.pathname) || '';

    // Get the content length of the file (if available)
    const content_length = parseInt(readable.headers['content-length'] as string) || 0;

    // Create a StreamFileInput object with the readable stream, destination path, and AWS options
    return this.streamFile({
      destination,
      readable: readable.data,
      aws_options: {
        // Set the MIME type of the file
        ContentType: mime_type,
        // Set the content length of the file (if available)
        ...(content_length && {
          ContentLength: content_length,
        }),
        // Include any additional options provided in aws_options
        ...aws_options,
      },
    });
  }

  /**
   * Uploads a file to DigitalOcean Spaces using a readable stream.
   *
   * @param {StreamFileInputInterface} input - The input object containing the destination path, readable stream, and AWS options.
   * @param {string} input.destination - The destination path in DigitalOcean Spaces where the file will be uploaded.
   * @param {Readable} input.readable - The readable stream of the file to be uploaded.
   * @param {object} [input.aws_options] - Additional options for uploading the file to DigitalOcean Spaces.
   * @return {Promise<string|null>} The URL of the uploaded file, or null if an error occurred during the upload.
   */
  async streamFile({ destination, readable, aws_options }: StreamFileInputInterface): Promise<string | null> {
    try {
      // Construct the input for the PutObjectCommand which includes:
      // - Bucket: The name of the bucket where the file will be stored.
      // - Key: The destination path in the bucket for the file.
      // - Body: The readable stream of the file to be uploaded.
      // - ACL: Access control list setting to make the file publicly readable.
      // - CacheControl: Instructions for caching the file, set to public and max age of 24 hours.
      // - ...aws_options: Spread operator to include any additional AWS options passed.
      const input = new PutObjectCommand({
        Bucket: this._bucket, // Name of the bucket where the file will be stored.
        Key: destination, // Destination path in the bucket for the file.
        Body: readable, // Readable stream of the file to be uploaded.
        ACL: 'public-read', // Access control list setting to make the file publicly readable.
        CacheControl: `public, max-age=${7 * 24 * 60 * 60}`, // Instructions for caching the file, set to public and max age of 24 hours.
        ...aws_options, // Any additional AWS options passed.
      });

      // Send the command to the AWS SDK client to perform the file upload.
      await this._client.send(input);

      // If upload is successful, return the URL of the uploaded file.
      return `${this._bucket_domain}/${destination}`;
    } catch (error) {
      // Log any errors that occur during the upload process.
      console.log(`🚀 ~ DigitalSpaceService ~ upload ~ error:`, error);

      // Return null in case of an error which signifies the upload failed.
      return null;
    }
  }

  /**
   * Deletes multiple files from the given array of file URLs.
   *
   * @param {string[]} file_urls - An array of URLs of the files to be deleted.
   * @return {Promise<boolean>} A promise that resolves to true when all files are deleted successfully, otherwise false.
   */
  /**
   * This method deletes multiple files from the given array of file URLs.
   * It uses Promise.allSettled to wait for all deletions to complete.
   * For each file URL, it calls the deleteFileByUrl method to delete the file.
   * If any deletion fails, the promise will reject.
   * If all deletions succeed, the promise will resolve to true.
   *
   * @param {string[]} file_urls - An array of URLs of the files to be deleted.
   * @return {Promise<boolean>} A promise that resolves to true when all files are deleted successfully, otherwise false.
   */
  async deleteFilesByUrl(file_urls: string[]): Promise<boolean> {
    // Map over each file URL and call the deleteFileByUrl method for each file.
    // Use Promise.allSettled to wait for all deletions to complete.
    // If any deletion fails, the promise will reject.
    // If all deletions succeed, the promise will resolve to true.
    await Promise.allSettled(
      file_urls.map(async (file_url) => {
        // Call the deleteFileByUrl method to delete the file.
        await this.deleteFileByUrl(file_url);
      }),
    );

    // Return true to indicate that all files were successfully deleted.
    return true;
  }

  /**
   * This method deletes a file from the given file URL.
   * It extracts the file name and bucket name from the URL.
   * It creates an input object with the bucket name and file name.
   * It creates a DeleteObjectCommand with the input object.
   * It sends the command to the client to perform the deletion.
   * If the deletion is successful, it logs the success message and returns true.
   * If the deletion fails, it logs the error message and returns false.
   *
   * @param {string} file_url - The URL of the file to be deleted.
   * @return {Promise<boolean>} A promise that resolves to true if the file is deleted successfully, otherwise false.
   */
  async deleteFileByUrl(file_url: string): Promise<boolean> {
    // Parse the file URL to extract the file name and bucket name.
    const url = new URL(file_url);
    const file_name = url.pathname.slice(1); // Remove the leading slash from the pathname.
    const bucket_name = url.hostname.split('.')[0]; // Extract the bucket name from the hostname.

    // Create an input object with the bucket name and file name.
    const input = {
      Bucket: bucket_name, // The name of the bucket where the file is stored.
      Key: file_name, // The name of the file to be deleted.
    };

    try {
      // Create a DeleteObjectCommand with the input object.
      const command = new DeleteObjectCommand(input);

      // Send the command to the client to perform the deletion.
      const rs = await this._client.send(command);

      // Log the success message.
      console.log(`🚀 ~ DigitalSpaceService ~ deleteFileByName ~ rs:`, rs);
      console.log(`${bucket_name}/${file_name} deleted`);

      // Return true to indicate that the file was successfully deleted.
      return true;
    } catch (error: any) {
      // Log the error message if the deletion fails.
      console.log(`🚀 ~ DigitalSpaceService ~ deleteFileByName ~ error:`, error.message);

      // Return false to indicate that the deletion failed.
      return false;
    }
  }

  /**
   * This function generates a pre-signed URL for uploading an object to AWS S3.
   *
   * @param {GetPutObjectSignedUrlInterface} input - An object containing the destination path, AWS options, and expiration time for the URL.
   * @param {string} input.destination - The destination path in the bucket for the object.
   * @param {object} [input.aws_options] - Additional options for the PutObjectCommand.
   * @param {number} [input.expires_in] - The number of seconds until the URL expires. Defaults to 5 minutes.
   * @returns {Promise<string>} The pre-signed URL for uploading the object.
   */
  async getPutObjectSignedUrl({ destination, expires_in = 10 * 60 }: GetPutObjectSignedUrlInterface): Promise<string> {
    // Determine the MIME type of the destination file, or use an empty string if it cannot be determined.
    const mime_type = mimeTypes.lookup(destination) || '';

    // Create a PutObjectCommand with the specified options.
    const command = new PutObjectCommand({
      Bucket: this._bucket, // The name of the bucket to upload the object to.
      ACL: 'public-read', // Set the ACL to public-read, making the object accessible to anyone.
      ContentType: mime_type, // Set the MIME type of the object.
      CacheControl: `public, max-age=${24 * 60 * 60}`, // Set the cache control to 1 day.
      Key: destination, // The destination path in the bucket for the object.
    });

    // Generate a pre-signed URL for the PutObjectCommand with the specified expiration time and unhoistable headers.
    const url = await getSignedUrl(this._client, command, {
      expiresIn: expires_in, // The number of seconds until the URL expires.
      unhoistableHeaders: new Set(['x-amz-acl']), // Specify that the x-amz-acl header should not be included in the URL.
    });

    // Return the pre-signed URL for uploading the object.
    return url;
  }
}
