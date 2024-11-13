import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { CreateWriteStreamOptions, UploadOptions } from '@google-cloud/storage';
import { Readable } from 'stream';

/**
 * Abstract class representing a Storage Service.
 * Contains methods for uploading files from path or URL, streaming files, and deleting files.
 */
export abstract class StorageService {
  abstract uploadFromPath(input: UploadFromPathInputInterface): Promise<string | null>;
  abstract uploadFromUrl(input: UploadFromUrlInputInterface): Promise<string | null>;
  abstract streamFile(input: StreamFileInputInterface): Promise<string | null>;
  abstract deleteFileByUrl(input: string): Promise<boolean>;
  abstract deleteFilesByUrl(input: string[]): Promise<boolean>;
  abstract getPutObjectSignedUrl(input: GetPutObjectSignedUrlInterface): Promise<string>;
}

/**
 * An object representing input for uploading a file from a specified path.
 *
 * @interface UploadFromPathInput
 * @property {string} file_path - The path of the file on the device.
 * @property {string} destination - The destination path in the storage.
 * @property {Omit<UploadOptions, 'destination'>} [gg_options] - Additional options for uploading the file to Google Cloud Storage.
 * @property {Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body' | 'ACL' | 'ContentType'>} [aws_options] - Additional options for uploading the file to AWS S3.
 */
export interface UploadFromPathInputInterface {
  file_path: string;
  destination: string;
  gg_options?: Omit<UploadOptions, 'destination'>;
  aws_options?: Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body' | 'ACL' | 'ContentType'>;
}

/**
 * An object representing input for uploading a file from a specified URL.
 *
 * @interface UploadFromUrlInput
 * @property {string} file_url - The URL of the file to be uploaded.
 * @property {string} destination - The destination path in the storage where the file will be uploaded.
 * @property {Omit<UploadOptions, 'destination'>} [gg_options] - Additional options for uploading the file to Google Cloud Storage.
 * @property {Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body' | 'ACL' | 'ContentType'>} [aws_options] - Additional options for uploading the file to AWS S3.
 */
export interface UploadFromUrlInputInterface {
  file_url: string;
  destination: string;
  gg_options?: Omit<UploadOptions, 'destination'>;
  aws_options?: Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body' | 'ACL' | 'ContentType'>;
}

/**
 * An object representing input for streaming a file to storage.
 *
 * @interface StreamFileInput
 * @property {string} destination - The destination path in the storage where the file will be streamed.
 * @property {Readable} readable - The readable stream of the file to be streamed.
 * @property {CreateWriteStreamOptions} [gg_options] - Additional options for streaming the file to Google Cloud Storage.
 * @property {Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body' | 'ACL'>} [aws_options] - Additional options for streaming the file to AWS S3.
 */
export interface StreamFileInputInterface {
  destination: string;
  readable: Readable;
  gg_options?: CreateWriteStreamOptions;
  aws_options?: Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body' | 'ACL'>;
}

/**
 * An object representing input for getting a signed URL for uploading a file to storage.
 *
 * @interface GetPutObjectSignedUrlInterface
 * @property {string} destination - The destination path in the storage where the file will be uploaded.
 * @property {number} [expires_in] - The duration in seconds for which the signed URL should be valid.
 */
export interface GetPutObjectSignedUrlInterface {
  destination: string;
  expires_in?: number;
}
