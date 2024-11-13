import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { StorageFactoryService } from '../storage/storage-factory.service';
import { Environment, StorageType } from 'src/commons/enum';
import { TokenInfoInterface } from 'src/guards/authorization/authorization.decorator';
import { genRandomString, removeVietnameseTones } from 'src/commons/utils/string.utils';
import { downloadAndCompressImage } from 'src/commons/utils/file-handler.utils';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from 'src/commons/configs/configuration';
import axios from 'axios';

interface SignedUrlInterface {
  signed_url: string;
  public_url: string;
  filename: string;
}

@Injectable()
export class UploadService {
  private readonly _cdn_credentials =
    this.configService.get<ConfigurationType['CDN_UPLOAD_CREDENTIAL']>('CDN_UPLOAD_CREDENTIAL') || '';

  private readonly _cdn_media_services = [
    // 'https://beta-upload-social-media-api.fabopos.com',
    'https://upload-social-media-api.fabopos.com',
    // 'https://upload-social-media-api.chotdonnhanh.vn',
  ];

  constructor(
    private readonly storageFactoryService: StorageFactoryService,
    private readonly configService: ConfigService<ConfigurationType>,
  ) {}

  async uploadFileToCloudByOtherEnv({
    attachment_url,
    file_ext,
    topic,
  }: {
    topic: string;
    attachment_url: string;
    file_ext: string;
  }) {
    try {
      const random = Math.floor(Math.random() * this._cdn_media_services.length);

      const media_service = this._cdn_media_services[random];
      console.log(`🚀 ~ UploadService ~ media_service:`, media_service);

      const { data } = await axios.post(`${media_service}/media/upload-file-from-url?token=${this._cdn_credentials}`, {
        url: attachment_url,
        folder: topic,
        file_ext: file_ext,
      });
      console.log(`🚀 ~ UploadService ~ data:`, data);

      const url = data.data || data.url;
      console.log(`🚀 ~ UploadService ~ url:`, url);
      return url;
    } catch (error) {
      console.log(`🚀 ~ UploadService ~ error:`, error);
      return null;
    }
  }

  /**
   * This function uploads a file from a given URL to Google Cloud Storage.
   *
   * @param {string} topic - The topic of the file to be uploaded.
   * @param {string} attachment_url - The URL of the file to be uploaded.
   * @param {string} file_ext - The extension of the file to be uploaded.
   * @returns {Promise<string|null>} - A promise that resolves to the URL of the uploaded file in Storage.
   */
  async uploadFileToCloud(topic: string, attachment_url: string, file_ext: string): Promise<string | null> {
    if (this.configService.get('NODE_ENV') === Environment.PROD) {
      const url = await this.uploadFileToCloudByOtherEnv({ topic, attachment_url, file_ext });
      if (url) {
        return url;
      }
    }

    // Create a folder to temporarily store the file on the server
    const upload_folder = './upload';
    if (!fs.existsSync(upload_folder)) {
      // Create the folder if it does not exist
      fs.mkdirSync(upload_folder);
    }

    // Generate a random filename for the uploaded file
    const file_name = `${genRandomString(20)}_${Date.now()}.${file_ext}`;
    const file_path = `${upload_folder}/${file_name}`;

    // Check if the file is an image
    if (['jpg', 'jpeg', 'png'].includes(file_ext)) {
      // Download the image from the given URL and compress it
      try {
        await downloadAndCompressImage({ url: attachment_url, path: file_path });
      } catch (error) {
        console.log(`🚀 ~ UploadService ~ uploadFileToCloud ~ attachment_url:`, attachment_url);
        console.log(`🚀 ~ UploadService ~ uploadFileToCloud ~ error:`, error);
        return null;
      }
      // Upload the compressed image to Storage
      const url = await this.storageFactoryService.getService(StorageType.DIGITAL).uploadFromPath({
        file_path,
        destination: `${topic}/${file_name}`,
      });

      // Remove the temporary file on the server
      if (fs.existsSync(file_path)) {
        fs.unlinkSync(file_path);
      }

      // Return the URL of the uploaded file
      return url;
    } else {
      // Upload the file to Storage without compressing it
      const url = await this.storageFactoryService.getService(StorageType.DIGITAL).uploadFromUrl({
        file_url: attachment_url,
        destination: `${topic}/${file_name}`,
      });
      // Return the URL of the uploaded file
      return url;
    }
  }

  /**
   * This function generates a pre-signed URL for uploading an object to storage.
   *
   * @param {Object} input - An object containing the filename of the object to be uploaded and the token information of the account uploading the file.
   * @param {string} input.filename - The name of the file to be uploaded.
   * @param {TokenInfoInterface} input.token_info - The token information of the account uploading the file.
   * @returns {Promise<SignedUrlInterface>} - A promise that resolves to an object containing the pre-signed URL, public URL, and filename for the object being uploaded.
   */
  async getPutObjectSignedUrl({
    filename
  }: {
    filename: string;
  }): Promise<SignedUrlInterface> {
    // TAO KEY TREN STORAGE
    // 1. Lay account_id tu token
    // 2. Lay filename va chuyen thanh chu in thuong
    // 3. Loai bo khoang trang trong filename
    // 4. Them thoi gian hien tai vao filename
    // 5. Them phan mo rong cua file vao filename
    const time = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

    const key = `event/medias/${time}/${removeVietnameseTones(filename).replaceAll(' ', '-').split('.')[0]}-${Date.now()}.${
      filename.split('.')[1]
    }`;

    // TAO PRE-SIGNED URL
    // 1. Goi ham getPutObjectSignedUrl cua storage factory service
    // 2. Truyen vao key vua tao
    const signed_url = await this.storageFactoryService.getPutObjectSignedUrl({
      destination: key,
    });

    // TRA VE KET QUA
    // 1. Tra ve mot doi tuong chua pre-signed URL, public URL, va filename
    return {
      // Pre-signed URL dung de upload file
      signed_url: signed_url,
      // Public URL dung de lay file
      public_url: signed_url.split('?')[0],
      // Ten file
      filename: filename,
    };


    /*
    API upload used after reture
    curl --location --request PUT 'https://chodonnhanhpro.sgp1.digitaloceanspaces.com/cdn-account/665d3abffe3344a8696db663/2024-9/okieeaha-1726728623914.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DO00RX3ZGD3KZZVVFDLD%2F20240919%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20240919T065023Z&X-Amz-Expires=600&X-Amz-Signature=f5507c31b5cb6662658993ae2aa8ffc85b501fceb7758c9bc1cb0715f8336aa3&X-Amz-SignedHeaders=host%3Bx-amz-acl&x-id=PutObject' \
    --header 'x-amz-acl: public-read' \ // add more
    --header 'Cache-Control: public, max-age=86400' \ //add more
    --header 'Content-Type: image/png' \
    --data '@/Users/thinguyen/Documents/xe2.png' // use binary type
    */
  }

  /**
   * This function generates pre-signed URLs for uploading multiple objects to storage.
   *
   * @param {Object} input - An object containing an array of filenames and token information.
   * @param {string[]} input.filenames - An array of filenames to be uploaded.
   * @param {TokenInfoInterface} input.token_info - The token information of the account uploading the files.
   * @returns {Promise<SignedUrlInterface[]>} - A promise that resolves to an array of objects containing the pre-signed URLs,
   * public URLs, and filenames for each file being uploaded.
   */
  async getPutObjectsSignedUrl({
    filenames
  }: {
    filenames: string[];
  }): Promise<SignedUrlInterface[]> {
    // Remove duplicate filenames from the array
    const unique_filenames = [...new Set(filenames)];

    // Generate pre-signed URLs for each unique filename
    const pre_signed_urls = await Promise.all(
      unique_filenames.map(async (filename) => {
        return this.getPutObjectSignedUrl({ filename });
      }),
    );

    // Return an array of objects containing the pre-signed URLs, public URLs, and filenames
    return pre_signed_urls;
  }
}
