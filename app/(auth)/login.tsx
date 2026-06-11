import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { Phone, Shield, Bike, ChevronRight, ShoppingBag, Check } from '../../src/components/ui/Icon';
import { useSendOtpMutation } from '../../src/api/authApi';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [sendOtpCall] = useSendOtpMutation();

  const isValid = phone.length === 10 && /^[6-9]\d{9}$/.test(phone);

  const handleSendOTP = async () => {
    if (!isValid) { setError('Please enter a valid 10-digit mobile number'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await sendOtpCall({ phone }).unwrap();
      setIsLoading(false);
      router.push({
        pathname: '/(auth)/otp-verify',
        params: { phone, devOtp: res.data?.devOtp || '' }
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.data?.error || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <StatusBar style="dark" />

      {/* Background gradient top decoration */}
      <LinearGradient
        colors={[Colors.primaryLighter, Colors.background]}
        style={styles.bgGradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo Block */}
        <View style={styles.logoBlock}>
          <View style={styles.logoCircle}>
            <ShoppingBag size={36} color={Colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.brand}>Chapra Basket</Text>
          <Text style={styles.tagline}>Your daily needs, delivered at your door</Text>
        </View>

        {/* Hero Text */}
        <View style={styles.heroText}>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Enter your mobile number to continue shopping</Text>
        </View>

        {/* Phone Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={[
            styles.inputWrapper,
            isFocused && styles.inputFocused,
            error && styles.inputError,
            Shadows.sm,
          ]}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit number"
              placeholderTextColor={Colors.textPlaceholder}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={t => { setPhone(t); setError(''); }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus
            />
            {isValid && (
              <View style={styles.validMark}>
                <Check size={16} color={Colors.success} strokeWidth={3} />
              </View>
            )}
          </View>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : phone.length > 0 && !isValid ? (
            <Text style={styles.hintText}>{10 - phone.length} more digit{phone.length < 9 ? 's' : ''} required</Text>
          ) : null}
        </View>

        {/* CTA Button */}
        <Button
          label={isLoading ? 'Sending OTP...' : 'Get OTP'}
          onPress={handleSendOTP}
          isLoading={isLoading}
          disabled={!isValid}
          fullWidth
          size="lg"
          style={styles.ctaBtn}
        />

        {/* Trust Signals */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Shield size={13} color={Colors.success} strokeWidth={2.5} />
            <Text style={styles.trustText}>100% Secure</Text>
          </View>
          <View style={styles.trustDot} />
          <View style={styles.trustItem}>
            <Phone size={13} color={Colors.success} strokeWidth={2.5} />
            <Text style={styles.trustText}>OTP on SMS</Text>
          </View>
          <View style={styles.trustDot} />
          <View style={styles.trustItem}>
            <Text style={styles.trustText}>No password needed</Text>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>

        {/* Rider CTA */}
        <TouchableOpacity
          style={styles.riderCard}
          onPress={() => router.push('/(auth)/user-type')}
          activeOpacity={0.85}
        >
          <View style={styles.riderIconWrap}>
            <Bike size={22} color={Colors.primary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.riderTitle}>Delivery Partner?</Text>
            <Text style={styles.riderSub}>Earn up to ₹800/day in Chapra</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} strokeWidth={2} />
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: 70, paddingBottom: 40 },

  logoBlock: { alignItems: 'center', marginBottom: 36 },
  logoCircle: { width: 80, height: 80, borderRadius: 28, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...Shadows.md },
  brand: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 26, color: Colors.primary, marginBottom: 4 },
  tagline: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.textMuted },

  heroText: { marginBottom: 32, alignItems: 'center' },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 30, color: Colors.textPrimary, marginBottom: 6 },
  subtitle: { fontFamily: 'BeVietnamPro-Regular', fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  inputSection: { marginBottom: 20 },
  label: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden',
  },
  inputFocused: { borderColor: Colors.primary },
  inputError: { borderColor: Colors.error },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 18 },
  flag: { fontSize: 20 },
  prefixText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  divider: { width: 1, height: 28, backgroundColor: Colors.border },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 18, fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary, letterSpacing: 2 },
  validMark: { paddingRight: 14 },
  errorText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.error, marginTop: 6 },
  hintText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, marginTop: 6 },

  ctaBtn: { marginBottom: 20 },

  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted },
  trustDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.border },

  terms: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  link: { color: Colors.primary, fontFamily: 'BeVietnamPro-SemiBold' },

  riderCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    padding: 16, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm,
  },
  riderIconWrap: { width: 46, height: 46, borderRadius: 18, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  riderTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  riderSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted },
});
