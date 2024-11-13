import * as fs from 'fs';
import * as sharp from 'sharp';
import { BYTES_PER_KB, BYTES_PER_MB } from '../constants/constant';
import axios from 'axios';

/**
 * This function calculates the size of a file located at a given path in megabytes.
 *
 * @param {Object} options - An object containing the path to the file.
 * @param {string} options.path - The path to the file.
 * @return {number} The size of the file in megabytes.
 */
export function fileSizePathMB({ path }: { path: string }): number {
  // Use the `fs` module to get the file stats of the file at the given path.
  // The `fs.statSync` method is a synchronous version of `fs.stat`,
  // which means it returns the file stats immediately and does not return a promise.
  // The `fileStats` object contains a `size` property, which is the size of the file in bytes.
  const fileStats = fs.statSync(path);

  // Convert the file size from bytes to megabytes by dividing it by the number of bytes in a megabyte (1024 * 1024 bytes).
  // The `BYTES_PER_MB` constant is imported from `../constants/constant.ts` and is equal to 1024 * 1024.
  const fileSizeInMb = fileStats.size / BYTES_PER_MB;

  // Return the size of the file in megabytes.
  return fileSizeInMb;
}

/**
 * This function calculates the size of a file located at a given path in kilobytes.
 *
 * @param {Object} options - An object containing the path to the file.
 * @param {string} options.path - The path to the file.
 * @return {number} The size of the file in kilobytes.
 */
export function fileSizePathKB({ path }: { path: string }): number {
  // Use the `fs` module to get the file stats of the file at the given path.
  // The `fs.statSync` method is a synchronous version of `fs.stat`,
  // which means it returns the file stats immediately and does not return a promise.
  // The `fileStats` object contains a `size` property, which is the size of the file in bytes.
  const fileStats = fs.statSync(path);

  // Convert the file size from bytes to kilobytes by dividing it by the number of bytes in a kilobyte (1024 bytes).
  const fileSizeInKb = fileStats.size / BYTES_PER_KB;

  // Return the size of the file in kilobytes.
  return fileSizeInKb;
}

/**
 * This function takes a URL as an argument and returns the size of the resource
 * located at that URL in megabytes.
 *
 * It uses the axios library to send a HEAD request to the URL and retrieve the
 * "Content-Length" header, which contains the size of the resource in bytes.
 *
 * The function then converts the size from bytes to megabytes by dividing it by
 * the number of bytes in a megabyte (1048576 bytes).
 *
 * @param {Object} options - An object containing the URL of the resource.
 * @param {string} options.url - The URL of the resource.
 * @return {Promise<number>} A promise that resolves to the size of the resource
 * in megabytes.
 */
export async function urlSizeMB({ url }: { url: string }): Promise<number> {
  // Send a HEAD request to the URL and retrieve the response headers.
  const { headers } = await axios.head(url);

  // Retrieve the value of the "Content-Length" header, which contains the size
  // of the resource in bytes.
  const content_length: string = headers['content-length'];

  // Convert the size from bytes to megabytes by dividing it by the number of
  // bytes in a megabyte (1048576 bytes).
  const fileSizeInMb = parseInt(content_length) / BYTES_PER_MB;

  // Return the size of the resource in megabytes.
  return fileSizeInMb;
}

/**
 * This function takes a URL as an argument and returns the size of the resource
 * located at that URL in kilobytes.
 *
 * It uses the axios library to send a HEAD request to the URL and retrieve the
 * "Content-Length" header, which contains the size of the resource in bytes.
 *
 * The function then converts the size from bytes to kilobytes by dividing it by
 * the number of bytes in a kilobyte (1024 bytes).
 *
 * @param {Object} options - An object containing the URL of the resource.
 * @param {string} options.url - The URL of the resource.
 * @return {Promise<number>} A promise that resolves to the size of the resource
 * in kilobytes.
 */
export async function urlSizeKB({ url }: { url: string }): Promise<number> {
  // Send a HEAD request to the URL and retrieve the response headers.
  const { headers } = await axios.head(url);

  // Retrieve the value of the "Content-Length" header, which contains the size
  // of the resource in bytes.
  const content_length: string = headers['content-length'];

  // Convert the size from bytes to kilobytes by dividing it by the number of
  // bytes in a kilobyte (1024 bytes).
  const fileSizeInKb = parseInt(content_length) / BYTES_PER_KB;

  // Return the size of the resource in kilobytes.
  return fileSizeInKb;
}

const qualityMB = (size: number) => {
  if (size <= 5) return 75;
  if (size <= 7) return 60;
  if (size <= 10) return 45;
  return 25;
};

/**
 * This function compresses an image file located at the specified path.
 * It takes two arguments: an object containing the paths of the original image
 * file and the compressed image file, and returns a Promise that resolves to
 * the path of the compressed image file.
 *
 * The function uses the sharp library to compress the image file. It reads the
 * original image file, applies a JPEG compression algorithm to it, and then saves
 * the compressed image file to the specified path.
 *
 * The compression quality is determined based on the size of the original image
 * file. If the size of the original image file is less than or equal to 5 MB, the
 * compression quality is set to 75. If the size of the original image file is
 * between 5 and 7 MB, the compression quality is set to 60. If the size of the
 * original image file is between 7 and 10 MB, the compression quality is set to
 * 45. Otherwise, the compression quality is set to 25.
 *
 * @param {Object} options - An object containing the paths of the original image
 * file and the compressed image file.
 * @param {string} options.path - The path of the original image file.
 * @param {string} options.resize_path - The path where the compressed image file
 * will be saved.
 * @return {Promise<string>} A Promise that resolves to the path of the
 * compressed image file.
 */
export async function compressImage({ path, resize_path }: { path: string; resize_path: string }): Promise<string> {
  // Determine the size of the original image file in megabytes.
  const fileSizeInMb = fileSizePathMB({ path });

  // Use the sharp library to read the original image file.
  // Apply JPEG compression to the image with a quality determined by the
  // file size.
  // Save the compressed image file to the specified path.
  await sharp(path)
    .jpeg({
      // Set the quality of the compressed image file based on the size of the
      // original image file.
      quality: qualityMB(fileSizeInMb),
      // Use MozJPEG encoding for the compressed image file.
      mozjpeg: true,
      // Use 4:4:4 chroma subsampling for the compressed image file.
      chromaSubsampling: '4:4:4',
      // Use progressive encoding for the compressed image file.
      progressive: true,
      // Use trellis quantization for the compressed image file.
      trellisQuantisation: true,
      // Use overshoot deringing for the compressed image file.
      overshootDeringing: true,
    })
    // Save the compressed image file to the specified path.
    .toFile(resize_path);

  // Return the path of the compressed image file.
  return resize_path;
}

/**
 * Downloads an image from a specified URL, compresses it using the sharp library,
 * and saves it to a specified path.
 *
 * The function takes an object with two properties as an argument: `path` and `url`.
 * The `path` property is the path where the compressed image file will be saved,
 * and the `url` property is the URL of the image file to be downloaded.
 *
 * The function returns a promise that resolves to the path of the compressed image file.
 *
 * The function first uses the axios library to send a GET request to the specified URL
 * and retrieve the image file as an array buffer. It then uses the sharp library to
 * compress the image file using JPEG compression with a quality determined by the
 * size of the original image file.
 *
 * The function then saves the compressed image file to the specified path using the
 * sharp library's `toFile` method.
 *
 * Finally, the function returns a promise that resolves to the path of the compressed
 * image file.
 */
export async function downloadAndCompressImage({ path, url }: { path: string; url: string }): Promise<string> {
  // Send a GET request to the specified URL and retrieve the image file as an array buffer.
  const { data, headers } = await axios.get(url, { responseType: 'arraybuffer' });

  // Extract the "Content-Length" header from the response headers, which contains the size of the image file in bytes.
  const content_length: string = headers['content-length'];

  // Calculate the size of the image file in megabytes.
  const fileSizeInMb = parseInt(content_length) / BYTES_PER_MB;

  // Use the sharp library to compress the image file using JPEG compression with a quality determined by the size of the original image file.
  await sharp(data)
    .jpeg({
      // Set the quality of the compressed image file based on the size of the original image file.
      quality: qualityMB(fileSizeInMb),
      // Use MozJPEG encoding for the compressed image file.
      mozjpeg: true,
      // Use 4:4:4 chroma subsampling for the compressed image file.
      chromaSubsampling: '4:4:4',
      // Use progressive encoding for the compressed image file.
      progressive: true,
      // Use trellis quantization for the compressed image file.
      trellisQuantisation: true,
      // Use overshoot deringing for the compressed image file.
      overshootDeringing: true,
    })
    // Save the compressed image file to the specified path.
    .toFile(path);

  // Return the path of the compressed image file.
  return path;
}
