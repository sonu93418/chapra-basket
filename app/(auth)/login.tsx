import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = phone.length === 10 && /^[6-9]\d{9}$/.test(phone);

  const handleSendOTP = async () => {
    if (!isValid) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    router.push({ pathname: '/(auth)/otp-verify', params: { phone } });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧺</Text>
          <Text style={styles.brand}>Chapra Basket</Text>
          <Text style={styles.title}>Welcome back! 👋</Text>
          <Text style={styles.subtitle}>Enter your mobile number to continue</Text>
        </View>

        {/* Phone Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={[styles.inputWrapper, error && styles.inputError]}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>🇮🇳  +91</Text>
            </View>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit number"
              placeholderTextColor={Colors.textPlaceholder}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => { setPhone(t); setError(''); }}
              autoFocus
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* OTP Button */}
        <Button
          label={isLoading ? 'Sending OTP...' : 'Get OTP →'}
          onPress={handleSendOTP}
          isLoading={isLoading}
          disabled={!isValid}
          fullWidth
          size="lg"
          style={styles.ctaBtn}
        />

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>

        {/* Rider Link */}
        <View style={styles.riderSection}>
          <View style={styles.riderCard}>
            <Text style={styles.riderEmoji}>🛵</Text>
            <View>
              <Text style={styles.riderTitle}>Delivery Partner?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/user-type')}>
                <Text style={styles.riderLink}>Sign up as Rider →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: 80, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 56, marginBottom: 12 },
  brand: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 24, color: Colors.primary, marginBottom: 24 },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 28, color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { ...TextStyles.bodyLg, color: Colors.textSecondary, textAlign: 'center' },

  inputSection: { marginBottom: 24 },
  label: { ...TextStyles.labelBold, color: Colors.textSecondary, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  inputError: { borderColor: Colors.error },
  prefix: { paddingHorizontal: 16, paddingVertical: 16 },
  prefixText: { ...TextStyles.bodyLgSemiBold, color: Colors.textPrimary },
  divider: { width: 1, height: 28, backgroundColor: Colors.border },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  errorText: { ...TextStyles.bodySm, color: Colors.error, marginTop: 6 },

  ctaBtn: { marginBottom: 20 },

  terms: { ...TextStyles.bodySm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  link: { color: Colors.primary, fontFamily: 'BeVietnamPro-SemiBold' },

  riderSection: { marginTop: 32 },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.surfaceVariant,
    padding: 16,
    borderRadius: Radius.xl,
  },
  riderEmoji: { fontSize: 36 },
  riderTitle: { ...TextStyles.bodyLgSemiBold, color: Colors.textPrimary, marginBottom: 2 },
  riderLink: { ...TextStyles.bodySm, color: Colors.primary, fontFamily: 'BeVietnamPro-SemiBold' },
});
