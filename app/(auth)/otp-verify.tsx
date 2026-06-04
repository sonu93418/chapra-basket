import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { useAppDispatch } from '../../src/hooks/useAppDispatch';
import { loginSuccess } from '../../src/features/auth/authSlice';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OTPVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-verify when all filled
    if (value && index === OTP_LENGTH - 1) {
      const fullOtp = [...newOtp.slice(0, -1), value.slice(-1)].join('');
      if (fullOtp.length === OTP_LENGTH) verifyOtp(fullOtp);
    }
  };

  const handleBackspace = (index: number) => {
    if (otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code?: string) => {
    const enteredOtp = code || otp.join('');
    if (enteredOtp.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    // Mock verification — any OTP works for demo
    dispatch(loginSuccess({
      user: {
        id: 'user-1',
        phone: phone || '+919876543210',
        name: 'Anup Kumar',
        role: 'customer',
        referralCode: 'ANUP2024',
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token',
    }));

    setIsLoading(false);
    router.replace('/(customer)' as any);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <StatusBar style="dark" />

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.emoji}>📱</Text>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phone}>+91 {phone}</Text>
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={el => (inputRefs.current[index] = el)}
              style={[styles.otpBox, digit && styles.otpBoxFilled, error && styles.otpBoxError]}
              value={digit}
              onChangeText={(v) => handleOtpChange(v, index)}
              onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Backspace' && handleBackspace(index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
            <Text style={[styles.resendBtn, resendTimer > 0 && styles.resendDisabled]}>
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View style={styles.demoHint}>
          <Text style={styles.demoText}>🔧 Demo: Enter any 6 digits to login</Text>
        </View>

        <Button
          label="Verify & Continue"
          onPress={() => verifyOtp()}
          isLoading={isLoading}
          disabled={otp.join('').length < OTP_LENGTH}
          fullWidth
          size="lg"
          style={{ marginTop: 24 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: { paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: 8 },
  backText: { ...TextStyles.bodyLgSemiBold, color: Colors.primary },

  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: 32 },

  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 28, color: Colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { ...TextStyles.bodyLg, color: Colors.textSecondary, textAlign: 'center', lineHeight: 26, marginBottom: 40 },
  phone: { fontFamily: 'BeVietnamPro-Bold', color: Colors.primary },

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
  otpBox: {
    width: 48, height: 58,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 22,
    color: Colors.textPrimary,
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  otpBoxError: { borderColor: Colors.error },

  error: { ...TextStyles.bodySm, color: Colors.error, textAlign: 'center', marginBottom: 8 },

  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  resendLabel: { ...TextStyles.bodySm, color: Colors.textMuted },
  resendBtn: { ...TextStyles.bodySmSemiBold, color: Colors.primary },
  resendDisabled: { color: Colors.textMuted },

  demoHint: {
    marginTop: 20,
    backgroundColor: Colors.warningContainer,
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
  },
  demoText: { ...TextStyles.bodySm, color: Colors.warning, fontFamily: 'BeVietnamPro-SemiBold' },
});
