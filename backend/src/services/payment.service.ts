import { env } from '../config/env.js';

export async function createPaymentOrder(amount: number, receipt: string) {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return {
      id: `rzp_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      mock: true,
    };
  }

  const Razorpay = (await import('razorpay')).default;
  const razorpay = new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });

  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
  });
}
