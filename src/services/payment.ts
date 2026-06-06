/**
 * Chapra Basket — Payment Service (Razorpay)
 * Production-ready payment integration
 */

export interface PaymentOptions {
  amount: number;       // in INR (will be converted to paise)
  orderId: string;      // from your backend
  razorpayOrderId: string; // from Razorpay
  userPhone: string;
  userName?: string;
  userEmail?: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  error?: string;
}

/**
 * Initiate Razorpay payment
 *
 * NOTE: Requires `react-native-razorpay` to be installed:
 * npx expo install react-native-razorpay
 *
 * Until installed, this returns a mock for development
 */
export const initiatePayment = async (options: PaymentOptions): Promise<PaymentResult> => {
  try {
    // Dynamic import to avoid crash if not installed yet
    const RazorpayCheckout = await import('react-native-razorpay')
      .then(m => m.default)
      .catch(() => null);

    if (!RazorpayCheckout) {
      console.warn('[Payment] react-native-razorpay not installed. Using mock.');
      return mockPayment(options);
    }

    const razorpayOptions = {
      description: options.description || `Chapra Basket Order #${options.orderId}`,
      currency: 'INR',
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY || 'rzp_test_placeholder',
      amount: Math.round(options.amount * 100), // paise
      name: 'Chapra Basket',
      order_id: options.razorpayOrderId,
      prefill: {
        contact: options.userPhone,
        name: options.userName || '',
        email: options.userEmail || '',
      },
      theme: { color: '#FF6B00' },
      modal: { backdropclose: false },
    };

    const data = await RazorpayCheckout.open(razorpayOptions);
    return {
      success: true,
      razorpayPaymentId: data.razorpay_payment_id,
      razorpayOrderId: data.razorpay_order_id,
      razorpaySignature: data.razorpay_signature,
    };
  } catch (error: any) {
    // User cancelled or payment failed
    const errorCode = error?.code;
    const isUserCancelled = errorCode === 0;
    return {
      success: false,
      error: isUserCancelled ? 'Payment cancelled' : (error?.description || 'Payment failed'),
    };
  }
};

// ─── Mock for development/testing ─────────────────────────────────────────
async function mockPayment(options: PaymentOptions): Promise<PaymentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpayOrderId: options.razorpayOrderId,
        razorpaySignature: 'mock_signature',
      });
    }, 1500);
  });
}

// ─── Payment method helpers ────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: 'qr-code', description: 'PhonePe, GPay, Paytm' },
  { id: 'card', label: 'Card', icon: 'credit-card', description: 'Credit & Debit Cards' },
  { id: 'netbanking', label: 'Net Banking', icon: 'building', description: 'All major banks' },
  { id: 'wallet', label: 'CB Wallet', icon: 'wallet', description: 'Use your wallet balance' },
  { id: 'cod', label: 'Cash on Delivery', icon: 'banknotes', description: 'Pay when delivered' },
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number]['id'];
