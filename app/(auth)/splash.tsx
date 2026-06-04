import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles } from '../../src/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;
  const circleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Pulse circle background
      Animated.timing(circleScale, { toValue: 1, duration: 600, useNativeDriver: true }),
      // Logo appears
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Tagline slides up
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // Navigate to onboarding after 2.8s
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#A04100', '#FF6B00', '#FF8C42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <Animated.View style={[styles.circle1, { transform: [{ scale: circleScale }] }]} />
      <Animated.View style={[styles.circle2, { transform: [{ scale: circleScale }] }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>🧺</Text>
        </View>
        <Text style={styles.logoText}>Chapra Basket</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity, transform: [{ translateY: taglineY }] }]}>
        <Text style={styles.tagline}>हर ज़रूरत, आपके घर तक</Text>
        <Text style={styles.taglineEn}>Har Zaroorat, Aapke Ghar Tak</Text>
      </Animated.View>

      {/* Bottom branding */}
      <View style={styles.bottomBrand}>
        <Text style={styles.bottomText}>Chapra, Bihar 🇮🇳</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  circle1: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle2: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.25,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji: { fontSize: 52 },
  logoText: {
    fontFamily: 'BeVietnamPro-ExtraBold',
    fontSize: 36,
    color: Colors.white,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  tagline: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 20,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 4,
  },
  taglineEn: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
  },
  bottomBrand: {
    position: 'absolute',
    bottom: 52,
  },
  bottomText: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
});
