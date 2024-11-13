import { ExecutionContext, SetMetadata, UseGuards, applyDecorators, createParamDecorator } from '@nestjs/common';
import { AuthorizationGuard } from './authorization.guard';

export const AUTH_KEY = 'CDN_AUTHOR2';

export const Authorization = (secured = true) =>
  applyDecorators(SetMetadata(AUTH_KEY, secured), UseGuards(AuthorizationGuard));

export enum LoginRole {
  USER = 'USER',
  STAFF = 'STAFF',
}

export const TokenInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const { tokenInfo } = request;
  return tokenInfo as TokenInfoInterface;
});

export interface JwtInterface {
  _id: string;
  exp: Date;
  phone: string;
}

export interface TokenInfoInterface {
  token_string: string;
  type: LoginRole;
  owner_id: string;
  account_id: string;
}
