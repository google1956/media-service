import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsString, IsUrl, Matches } from 'class-validator';
import { FILENAME_REGEX } from 'src/commons/constants/regex';

export class GetPutObjectSignedUrlDto {
  @IsString()
  @IsNotEmpty()
  @Matches(FILENAME_REGEX, { message: 'Tên File không hợp lệ!!' })
  filename: string;
}

export class GetPutObjectsSignedUrlDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @Matches(FILENAME_REGEX, { message: 'Tên File không hợp lệ!!', each: true })
  filenames: string[];
}

export class UploadFileFromUrlsDto {
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  urls: string[];
}

export class UploadFileFromUrlDto {
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  url: string;

  @IsNotEmpty()
  @IsString()
  folder: string;

  @IsNotEmpty()
  @IsString()
  file_ext: string;
}
