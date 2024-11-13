import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { BaseResponse, ErrorBaseResponse } from 'src/commons/res/base.res';

type ResponseType = Type<unknown> | Type<unknown>[];

export function CdnApiResponse({ type, created }: { type?: ResponseType; created?: boolean }) {
  return applyDecorators(
    ApiExtraModels(
      BaseResponse,
      (type && Array.isArray(type) && (type[0] as Type<unknown>)) || (type as Type<unknown>) || Object,
    ),
    ApiResponse({
      description: (created && 'Tạo thành công') || 'Thành công',
      status: (created && HttpStatus.CREATED) || HttpStatus.OK,
      example: {
        status: (created && HttpStatus.CREATED) || HttpStatus.OK,
        message: 'string',
        data: (type && Array.isArray(type) && typeof type[0] === 'object' ? [{}] : []) || {},
      },
      ...((type && {
        schema: {
          allOf: [
            { $ref: getSchemaPath(BaseResponse) },
            {
              properties: {
                data: {
                  ...((Array.isArray(type) && {
                    type: 'array',
                    items: { $ref: getSchemaPath(type[0]) },
                  }) || {
                    type: (type as Type<unknown>).name,
                    $ref: getSchemaPath(type as Type<unknown>),
                  }),
                },
              },
            },
          ],
        },
      }) || {
        type: () => BaseResponse,
      }),
    }),
  );
}

export function CdnErrorResponse() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Yêu cầu không hợp lệ',
      example: {
        status: HttpStatus.BAD_REQUEST,
        message: 'string',
        errors: {},
        system_message: 'error',
      },
      type: () => ErrorBaseResponse,
    }),
    ApiInternalServerErrorResponse({
      description: 'Lỗi máy chủ nội bộ',
      example: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
        errors: {},
        system_message: 'error',
      },
      type: () => ErrorBaseResponse,
    }),
  );
}

export function CdnAuthorizedResponse() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Chưa đăng nhập',
      example: {
        status: HttpStatus.UNAUTHORIZED,
        message: 'Tài khoản đang đăng nhập không tồn tại trong hệ thống',
        errors: {},
        system_message: 'User và Account không khớp dữ liệu',
      },
      type: () => ErrorBaseResponse,
    }),
    ApiForbiddenResponse({
      description: 'Không có quyền truy cập',
      example: {
        status: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền truy cập vào đây',
        errors: {},
        system_message: 'error',
      },
      type: () => ErrorBaseResponse,
    }),
  );
}

export function CdnLoggedApiResponse(config?: { summary?: string; created?: boolean; type?: ResponseType }) {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: config?.summary,
    }),
    CdnApiResponse({ type: config?.type, created: config?.created }),
    CdnAuthorizedResponse(),
    CdnErrorResponse(),
  );
}

export function CdnPublicApiResponse(config?: { summary?: string; created?: boolean; type?: ResponseType }) {
  return applyDecorators(
    ApiOperation({
      summary: config?.summary,
    }),
    CdnApiResponse({ type: config?.type, created: config?.created }),
    CdnErrorResponse(),
  );
}
