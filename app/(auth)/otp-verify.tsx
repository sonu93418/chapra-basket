import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { useAppDispatch } from '../../src/hooks/useAppDispatch';
import { loginSuccess } from '../../src/features/auth/authSlice';
import { ArrowLeft, Phone, RefreshCw, CheckCircle, AlertCircle, Info } from '../../src/components/ui/Icon';
import { formatPhone } from '../../src/utils/format';
import { useVerifyOtpMutation } from '../../src/api/authApi';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OTPVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const dispatch = useAppDispatch();
  const [verifyOtpCall] = useVerifyOtpMutation();

  // Shake animation for wrong OTP
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (value && index === OTP_LENGTH - 1) {
      const fullOtp = [...newOtp.slice(0, -1), value.slice(-1)].join('');
      if (fullOtp.length === OTP_LENGTH) verifyOtp(fullOtp);
    }
  };

  const handleBackspace = (index: number) => {
    const newOtp = [...otp];
    if (newOtp[index]) {
      newOtp[index] = '';
      setOtp(newOtp);
    } else if (index > 0) {
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code?: string) => {
    const enteredOtp = code || otp.join('');
    if (enteredOtp.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit OTP');
      shake();
      return;
    }
    setIsLoading(true);
    try {
      const res = await verifyOtpCall({ phone: phone || '', code: enteredOtp }).unwrap();
      setSuccess(true);
      await new Promise(r => setTimeout(r, 600));

      dispatch(loginSuccess({
        user: res.data.user,
        token: res.data.token,
      }));

      setIsLoading(false);
      router.replace('/(customer)' as any);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.data?.error || 'Invalid OTP. Please try again.');
      shake();
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    inputRefs.current[0]?.focus();
  };

  const filledCount = otp.filter(Boolean).length;
  const progress = filledCount / OTP_LENGTH;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* Icon */}
        <View style={[styles.iconCircle, success && styles.iconCircleSuccess]}>
          {success
            ? <CheckCircle size={36} color={Colors.success} strokeWidth={2} />
            : <Phone size={36} color={Colors.primary} strokeWidth={1.8} />
          }
        </View>

        <Text style={styles.title}>
          {success ? 'Verified' : 'OTP Verification'}
        </Text>
        <Text style={styles.subtitle}>
          {success
            ? 'Welcome to Chapra Basket!'
            : <>Enter the 6-digit code sent to{'\n'}<Text style={styles.phone}>{formatPhone(phone || '9876543210')}</Text></>
          }
        </Text>

        {/* OTP Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>

        {/* OTP Boxes */}
        <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              style={[
                styles.otpBox,
                digit && styles.otpBoxFilled,
                error && styles.otpBoxError,
                success && styles.otpBoxSuccess,
              ]}
              value={digit}
              onChangeText={v => handleOtpChange(v, index)}
              onKeyPress={({ nativeEvent }) =>
                nativeEvent.key === 'Backspace' && handleBackspace(index)
              }
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              autoFocus={index === 0}
              editable={!success}
            />
          ))}
        </Animated.View>

        {/* Error */}
        {error ? (
          <View style={styles.errorRow}>
            <AlertCircle size={14} color={Colors.error} strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0} activeOpacity={0.8}>
            {resendTimer > 0 ? (
              <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
            ) : (
              <View style={styles.resendBtn}>
                <RefreshCw size={13} color={Colors.primary} strokeWidth={2.5} />
                <Text style={styles.resendBtnText}>Resend OTP</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View style={styles.demoHint}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Info size={14} color={Colors.warning} strokeWidth={2.5} />
            <Text style={styles.demoText}>Demo mode: Enter any 6 digits to login</Text>
          </View>
        </View>

        <Button
          label={isLoading ? 'Verifying...' : success ? 'Taking you in...' : 'Verify & Continue'}
          onPress={() => verifyOtp()}
          isLoading={isLoading}
          disabled={filledCount < OTP_LENGTH || success}
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

  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: 8 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },

  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: 20, alignItems: 'center' },

  iconCircle: { width: 90, height: 90, borderRadius: 30, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 20, ...Shadows.sm },
  iconCircleSuccess: { backgroundColor: Colors.successContainer },

  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 28, color: Colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontFamily: 'BeVietnamPro-Regular', fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  phone: { fontFamily: 'BeVietnamPro-Bold', color: Colors.primary },

  progressBar: { width: '100%', height: 3, backgroundColor: Colors.borderLight, borderRadius: 2, marginBottom: 28, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },

  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  otpBox: {
    width: 48, height: 58, borderRadius: Radius.lg,
    borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.white,
    fontFamily: 'BeVietnamPro-Bold', fontSize: 24, color: Colors.textPrimary,
    ...Shadows.sm,
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  otpBoxError: { borderColor: Colors.error, backgroundColor: Colors.errorContainer },
  otpBoxSuccess: { borderColor: Colors.success, backgroundColor: Colors.successContainer },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  errorText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.error },

  resendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  resendLabel: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.textMuted },
  resendTimer: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.textMuted },
  resendBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  resendBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.primary },

  demoHint: { marginTop: 20, backgroundColor: Colors.warningContainer, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 10, width: '100%' },
  demoText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.warning, textAlign: 'center' },
});
