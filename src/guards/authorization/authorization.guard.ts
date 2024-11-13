import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AUTH_KEY, LoginRole, TokenInfoInterface } from './authorization.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    //Ktra xem co can auth ko?
    const secured = this.reflector.get<string[]>(AUTH_KEY, context.getHandler());
    if (!secured) {
      return true;
    }

    //Lay request va bearer token
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    //Ktra neu ko co token => bao loi
    if (!authorization || !(authorization as string).split(' ')[1]) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Vui lòng đăng nhập trước khi thực hiện chức năng này',
          data: null,
          system_message: 'Thiếu token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = (authorization as string).split(' ')[1];
    if (!token) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Vui lòng đăng nhập trước khi thực hiện chức năng này',
          data: null,
          system_message: 'Thiếu token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    //Phan tich du lieu token
    const decodedJwtAccessToken: any = this.jwtService.decode(token);
    if (!decodedJwtAccessToken) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Bạn không có quyền thực hiện chức năng này',
          data: null,
          system_message: 'Token sai định dạng',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    switch (decodedJwtAccessToken.type) {
      case LoginRole.USER: {
        //Ktra user
        break;
      }
      case LoginRole.STAFF: {
        //Ktra staff
        break;
      }
    }

    const token_info: TokenInfoInterface = {
      token_string: token,
      type: decodedJwtAccessToken.type,
      owner_id: decodedJwtAccessToken.owner_id,
      account_id: decodedJwtAccessToken.account_id
    };
    request.tokenInfo = token_info;

    return true;
  }
}
