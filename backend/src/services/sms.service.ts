import { env } from '../config/env.js';
import { pool } from '../config/db.js';

export async function logOtpOutcome(phone: string, provider: string, messageId: string | null, status: string, error?: string) {
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO otp_logs (phone, provider, provider_message_id, delivery_status, error_message)
         VALUES ($1, $2, $3, $4, $5)`,
        [phone, provider, messageId, status, error || null]
      );
    } catch (err: any) {
      console.warn('[DB SMS Log] Failed to insert log:', err.message);
    }
  }
}

export async function sendSmsOtp(phone: string, code: string): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  // SMS text using retrieval tag for auto-OTP reads on Android
  const message = `<#> Your Chapra Basket verification code is: ${code}. abcd1234XYZ`;
  const provider = env.otpProvider || 'mock';

  // 1. Fast2SMS India Integration
  if (provider === 'fast2sms') {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      const err = 'FAST2SMS_API_KEY is not configured';
      await logOtpOutcome(phone, 'fast2sms', null, 'failed', err);
      return { success: false, provider: 'fast2sms', error: err };
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10); // Standard 10-digit format for India
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${code}&numbers=${cleanPhone}`;
      const response = await fetch(url);
      const resData = await response.json() as any;

      if (resData.return) {
        const messageId = resData.request_id || `f2s-${Date.now()}`;
        await logOtpOutcome(phone, 'fast2sms', messageId, 'delivered');
        return { success: true, provider: 'fast2sms', messageId };
      } else {
        const errMsg = resData.message || 'Fast2SMS API failed';
        await logOtpOutcome(phone, 'fast2sms', null, 'failed', errMsg);
        return { success: false, provider: 'fast2sms', error: errMsg };
      }
    } catch (err: any) {
      await logOtpOutcome(phone, 'fast2sms', null, 'failed', err.message);
      return { success: false, provider: 'fast2sms', error: err.message };
    }
  }

  // 2. Twilio Integration
  if (provider === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      const err = 'Twilio credentials (ACCOUNT_SID, AUTH_TOKEN, FROM_NUMBER) are incomplete';
      await logOtpOutcome(phone, 'twilio', null, 'failed', err);
      return { success: false, provider: 'twilio', error: err };
    }

    try {
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: phone,
            From: fromNumber,
            Body: message,
          }),
        }
      );

      const resData = await response.json() as any;
      if (response.ok) {
        const messageId = resData.sid;
        await logOtpOutcome(phone, 'twilio', messageId, 'delivered');
        return { success: true, provider: 'twilio', messageId };
      } else {
        const errMsg = resData.message || 'Twilio API failure';
        await logOtpOutcome(phone, 'twilio', null, 'failed', errMsg);
        return { success: false, provider: 'twilio', error: errMsg };
      }
    } catch (err: any) {
      await logOtpOutcome(phone, 'twilio', null, 'failed', err.message);
      return { success: false, provider: 'twilio', error: err.message };
    }
  }

  // 3. MSG91 Integration
  if (provider === 'msg91') {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      const err = 'MSG91 credentials (AUTH_KEY, TEMPLATE_ID) are missing';
      await logOtpOutcome(phone, 'msg91', null, 'failed', err);
      return { success: false, provider: 'msg91', error: err };
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'authkey': authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          mobile: cleanPhone,
          otp: code,
        }),
      });

      const resData = await response.json() as any;
      if (resData.type === 'success') {
        const messageId = resData.request_id || `msg91-${Date.now()}`;
        await logOtpOutcome(phone, 'msg91', messageId, 'delivered');
        return { success: true, provider: 'msg91', messageId };
      } else {
        const errMsg = resData.message || 'MSG91 API failure';
        await logOtpOutcome(phone, 'msg91', null, 'failed', errMsg);
        return { success: false, provider: 'msg91', error: errMsg };
      }
    } catch (err: any) {
      await logOtpOutcome(phone, 'msg91', null, 'failed', err.message);
      return { success: false, provider: 'msg91', error: err.message };
    }
  }

  // Default Mock/Development
  console.log(`[SMS MOCK SENDER] OTP: ${code} to Phone: ${phone}`);
  await logOtpOutcome(phone, 'mock', `mock-${Date.now()}`, 'delivered');
  return { success: true, provider: 'mock', messageId: `mock-${Date.now()}` };
}
