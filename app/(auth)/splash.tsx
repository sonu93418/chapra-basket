import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    // Smooth fade and scale animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Transition to onboarding after 2.8 seconds
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        {/* Full-screen high-quality hero illustration */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../../assets/splash_hero.png')} 
            style={styles.heroImage} 
            resizeMode="contain" 
          />
        </View>

        {/* Centered Branding Group */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoRow}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>Blink Box</Text>
          </View>
          <Text style={styles.tagline}>Fast Delivery. Everyday Essentials.</Text>
        </View>

        {/* Subtle loading indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Warm light-peach tone used across app (#FFF8F6)
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 56,
  },
  illustrationContainer: {
    flex: 1,
    width: width * 0.82,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary, // Orange accent (#FF6B00)
  },
  logoText: {
    fontFamily: 'BeVietnamPro-ExtraBold',
    fontSize: 34,
    color: Colors.textPrimary, // Charcoal brown (#261812)
    letterSpacing: -0.8,
  },
  tagline: {
    fontFamily: 'BeVietnamPro-Medium',
    fontSize: 14,
    color: Colors.textSecondary, // Secondary warm brown (#5A4136)
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  loadingContainer: {
    height: 24,
    justifyContent: 'center',
  },
});
