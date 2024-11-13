import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const client_id = req.headers['x-original-forwarded-for'] || req.headers['cf-connecting-ip'];
    console.log(`🚀 ~ ThrottlerBehindProxyGuard ~ getTracker ~ req.headers:`, req.headers);
    console.log(`🚀 ~ ThrottlerBehindProxyGuard ~ getTracker ~ client_id:`, client_id);
    // if (!clientId && req.tokenInfo) {
    //     console.log("🚀 ~ ThrottlerBehindProxyGuard ~ getTracker ~ req.tokenInfo.owner_id:", req.tokenInfo.owner_id);
    //     return req.tokenInfo.owner_id;
    // }
    return client_id || req.tokenInfo?.owner_id;
  }
}
