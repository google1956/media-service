import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export const MongoIdParams = createParamDecorator((data: unknown[], cxt: ExecutionContext) => {
  const request = cxt.switchToHttp().getRequest();
  const errors: string[] = [];
  const params: string[] = [];

  data.forEach((name) => {
    const id = request?.params[`${name}`] ?? '';
    params.push(id);
    if (!id || !isValidObjectId(id)) {
      errors.push(`${name}`);
    }
  });

  if (errors.length) {
    throw new BadRequestException({
      error: 'Bad Request',
      message: `Invalid MongoDB objectID (reading ${errors.join(', ')} params)`,
      status: 400,
    });
  }

  return [...params];
});

/**
 * Examples:
 *  @Get('something/:staff_id/:shop_id')
 *  async handler(
      @Req() req: Request,
      @MongoIdParams(['staff_id', 'shop_id']) [staff_id, shop_id]: string[],
      @Res() res: Response
    ) {}
 */
