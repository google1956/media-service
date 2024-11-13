const redisParse = (url: string): { host: string; port: number; database: string; password: string } | null => {
  try {
    const parsed_url = new URL(url);

    return {
      host: parsed_url.hostname || 'localhost',
      port: Number(parsed_url.port || 6379),
      database: (parsed_url.pathname || '/0').substr(1) || '0',
      password: (parsed_url.password && decodeURIComponent(parsed_url.password)) || '',
    };
  } catch (e) {
    return null;
  }
};

export const configuration = () => ({
  base_uri: `${process.env.BASE_URI}:${process.env.API_GATEWAY_PORT}${process.env.BASE_PATH}`,
  gateway_port: process.env.API_GATEWAY_PORT || 1321,
  env: process.env.ENV || 'DEV',
  NODE_ENV: process.env.NODE_ENV || 'development',
  pod: process.env.CDN_POD || 'cdn',
  rabbitMq_uri: process.env.RABBITMQ_URI || '',
  UPLOAD_PREFETCH_COUNT: parseInt(process.env.UPLOAD_PREFETCH_COUNT || '20') || 20,
  /**
   * Cache
   */
  cache: {
    ttl: parseInt(process.env.APP_CACHE_TTL || '') || 5 * 60 * 1000,
  },

  /**
   * Redis
   */
  host_redis: process.env.HOST_REDIS || '',
  ws_gateway_port: process.env.WS_GATEWAY_PORT,
  redis: redisParse(process.env.HOST_REDIS || ''),
  gg_bucket: process.env.GG_BUCKET,
  digital: {
    spaces_domain: process.env.SPACES_DOMAIN || '',
    spaces_region: process.env.SPACES_REGION || '',
    spaces_key: process.env.SPACES_KEY || '',
    spaces_secret: process.env.SPACES_SECRET || '',
    spaces_bucket: process.env.SPACES_BUCKET || '',
    spaces_bucket_domain: process.env.SPACES_BUCKET_DOMAIN || '',
  },
  
  APP_SECRET_KEY: process.env.APP_SECRET_KEY || '',
  APP_EXPIRES_IN: process.env.APP_EXPIRES_IN || '',
  MONGO_DSN: process.env.MONGO_DSN || '',
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  devopsChatGroupId: process.env.TELEGRAM_DEVOPS_CHAT_GROUP_ID || '',
  CDN_UPLOAD_CREDENTIAL: process.env.CDN_UPLOAD_CREDENTIAL || '',
});

export type ConfigurationType = ReturnType<typeof configuration>;
