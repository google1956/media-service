import { Body, Controller, ForbiddenException, Get, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { UploadService } from './upload.service';
import { Authorization, TokenInfo, TokenInfoInterface } from 'src/guards/authorization/authorization.decorator';
import { RateLimit } from 'src/guards/rate-limit/rate-limit.decorator';
import { GetPutObjectSignedUrlDto, GetPutObjectsSignedUrlDto, UploadFileFromUrlDto } from './dto/upload.dto';
import { seconds } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CdnLoggedApiResponse } from 'src/decorator/api-response.decorator';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from 'src/commons/configs/configuration';
const Minio = require('minio')

@ApiTags('media')
@Controller('media')
export class UploadController {
  private readonly _cdn_credentials =
    this.configService.get<ConfigurationType['CDN_UPLOAD_CREDENTIAL']>('CDN_UPLOAD_CREDENTIAL') || '';

  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService<ConfigurationType>,
  ) { }

  @Get('/presignedUrl')
  async presignedUrl(
    @Query() data: GetPutObjectSignedUrlDto,
    @Res() res: Response,
  ) {
    const { filename } = data

    const minioClient = new Minio.Client({
      endPoint: '192.168.1.15',
      port: 9000,
      useSSL: false,
      accessKey: '9EvJQ8Unv9AOBSyZeSjI',
      secretKey: 'HcgLmRETQMwDEuTBxHDDyjSfYJ5iwbio2fC4pE9K',
    })

    try {
      const time = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

      await minioClient.presignedPutObject('uploads', filename + "-" + time, (err: any, url: any) => {
        if (err) throw err
        return res.status(HttpStatus.OK).json({
          url
        });

        // res.end(url)
      })

    } catch (err) {
      console.log('err', err)
      return res.status(HttpStatus.BAD_REQUEST).json({});
    }

  }

  @Post('register-put-signed-url')
  @CdnLoggedApiResponse()
  @RateLimit({ default: { limit: 20, ttl: seconds(30) } })
  // @Authorization()
  async getPutObjectSignedUrl(
    @Body() body: GetPutObjectSignedUrlDto,
    @Res() res: Response,
  ) {
    const data = await this.uploadService.getPutObjectSignedUrl({ filename: body.filename });
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data,
    });
  }

  @Post('register-put-signed-urls')
  @CdnLoggedApiResponse()
  @RateLimit({ default: { limit: 10, ttl: seconds(30) } })
  @Authorization()
  async getPutObjectsSignedUrl(
    @Body() body: GetPutObjectsSignedUrlDto,
    @Res() res: Response,
  ) {
    const data = await this.uploadService.getPutObjectsSignedUrl({ filenames: body.filenames });
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data,
    });
  }

  @Post('upload-file-from-url')
  @CdnLoggedApiResponse()
  async uploadFileFromUrl(@Body() body: UploadFileFromUrlDto, @Res() res: Response, @Query() query: any) {
    const { token } = query;

    if (!token || token !== this._cdn_credentials) {
      throw new ForbiddenException();
    }

    const { url, file_ext, folder } = body;
    const data = await this.uploadService.uploadFileToCloud(folder, url, file_ext);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data,
    });
  }
}
