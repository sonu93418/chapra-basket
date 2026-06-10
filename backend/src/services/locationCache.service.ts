import { pool } from '../config/db.js';
import { getRedis, isRedisActive } from '../config/redis.js';
import { riderLocations } from '../data/demoStore.js';
import { RiderLocation } from '../types/domain.js';

export async function saveRiderLocation(location: RiderLocation): Promise<void> {
  const { orderId, riderId, lat, lng, heading, eta, updatedAt, speed, battery, networkStatus } = location;

  // 1. Fallback / Main In-Memory cache
  riderLocations[orderId] = location;

  // 2. Redis Cache
  if (isRedisActive()) {
    try {
      const redis = await getRedis();
      if (redis) {
        const key = `rider:location:${orderId}`;
        await redis.hset(key, {
          orderId,
          riderId,
          lat: String(lat),
          lng: String(lng),
          heading: heading !== undefined ? String(heading) : '',
          eta: eta !== undefined ? String(eta) : '',
          updatedAt,
          speed: speed !== undefined ? String(speed) : '',
          battery: battery !== undefined ? String(battery) : '',
          networkStatus: networkStatus || '',
        });
        await redis.expire(key, 3600); // 1 hour TTL

        // Geospatial Indexing
        await redis.geoadd('active_riders', lng, lat, riderId);
      }
    } catch (err: any) {
      console.warn('[Redis] Failed to cache rider location:', err.message);
    }
  }

  // 3. PostgreSQL Telemetry History (run in background, non-blocking)
  if (pool) {
    pool.query(
      `INSERT INTO rider_telemetry_history (rider_id, order_id, lat, lng, heading, speed, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        riderId,
        orderId,
        lat,
        lng,
        heading !== undefined ? heading : null,
        speed !== undefined ? speed : null,
        updatedAt,
      ]
    ).catch((err: any) => {
      console.error('[Database] Failed to write telemetry:', err.message);
    });
  }
}

export async function getRiderLocation(orderId: string): Promise<RiderLocation | null> {
  if (isRedisActive()) {
    try {
      const redis = await getRedis();
      if (redis) {
        const data = await redis.hgetall(`rider:location:${orderId}`);
        if (data && data.orderId) {
          return {
            orderId: data.orderId,
            riderId: data.riderId,
            lat: Number(data.lat),
            lng: Number(data.lng),
            heading: data.heading ? Number(data.heading) : undefined,
            eta: data.eta ? Number(data.eta) : undefined,
            updatedAt: data.updatedAt,
            speed: data.speed ? Number(data.speed) : undefined,
            battery: data.battery ? Number(data.battery) : undefined,
            networkStatus: data.networkStatus || undefined,
          };
        }
      }
    } catch (err: any) {
      console.warn('[Redis] Failed to fetch rider location:', err.message);
    }
  }

  // Fallback to memory
  return riderLocations[orderId] || null;
}
