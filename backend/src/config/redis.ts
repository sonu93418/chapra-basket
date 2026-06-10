import { env } from './env.js';

let redisClient: any = null;
let isRedisAvailable = false;

async function initRedis() {
  if (redisClient) return redisClient;
  if (!env.redisUrl) {
    console.log('[Redis] REDIS_URL not configured. Dynamic tracking caching will use memory fallback.');
    return null;
  }

  try {
    const packageName = 'ioredis';
    const RedisModule = await import(packageName);
    const Redis = (RedisModule as any).default || (RedisModule as any);
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected to server.');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err: any) => {
      console.warn('[Redis] Connection error. Using memory fallback.', err.message);
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (err) {
    console.log('[Redis] ioredis client is not installed. Live tracking will use memory fallback.');
    return null;
  }
}

// Start initialization asynchronously
initRedis();

export async function getRedis() {
  if (redisClient) return isRedisAvailable ? redisClient : null;
  return await initRedis();
}

export function isRedisActive() {
  return isRedisAvailable && redisClient !== null;
}
