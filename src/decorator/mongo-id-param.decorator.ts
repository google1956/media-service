import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export const MongoIdParam = createParamDecorator((data: unknown, cxt: ExecutionContext) => {
  const request = cxt.switchToHttp().getRequest();
  const id = request?.params[`${data}`] ?? '';

  if (!id || !isValidObjectId(id)) {
    throw new BadRequestException({
      error: 'Bad Request',
      message: `Invalid MongoDB objectID (reading ${data} param)`,
      status: 400,
    });
  }

  return id;
});

/**
 * Examples:
 *  @Get('something/:id')
 *  @ApiParam({
      name: 'id',
      type: String,
      required: true,
    })
 *  async handler(
      @Req() req: Request,
      @MongoIdParam('id') id: string,
      @Res() res: Response
    ) {}
 */
