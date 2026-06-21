import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/blink_box',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  appOrigin: process.env.APP_ORIGIN ?? '*',
  otpProvider: process.env.OTP_PROVIDER ?? 'mock',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  redisUrl: process.env.REDIS_URL ?? '',
};
