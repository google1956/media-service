import { UseFilters, UseGuards, applyDecorators } from '@nestjs/common';
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';
import { Resolvable, Throttle, ThrottlerGenerateKeyFunction, ThrottlerGetTrackerFunction } from '@nestjs/throttler';
import { RateLimitExceptionFilter } from '../../exception/throttle.exception.filter';

interface ThrottlerMethodOrControllerOptionsInterface {
  limit?: Resolvable<number>;
  ttl?: Resolvable<number>;
  getTracker?: ThrottlerGetTrackerFunction;
  generateKey?: ThrottlerGenerateKeyFunction;
}

export const RateLimit = (options: Record<string, ThrottlerMethodOrControllerOptionsInterface>) =>
  applyDecorators(UseFilters(RateLimitExceptionFilter), UseGuards(ThrottlerBehindProxyGuard), Throttle(options));
