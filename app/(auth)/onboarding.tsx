import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing } from '../../src/theme';
import { Zap, Package, Map, ArrowRight } from '../../src/components/ui/Icon';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    Icon: Zap,
    titleEn: 'Delivered in 30 Minutes',
    subtitle: 'Groceries, vegetables, medicines — everything at your doorstep. Super fast!',
    gradient: ['#FF6B00', '#A04100'] as [string, string],
  },
  {
    id: '2',
    Icon: Package,
    titleEn: '10+ Categories, One App',
    subtitle: 'Grocery, Fruits, Vegetables, Dairy, Medicines, Snacks and much more!',
    gradient: ['#00B050', '#005321'] as [string, string],
  },
  {
    id: '3',
    Icon: Map,
    titleEn: 'Track Every Order Live',
    subtitle: 'See your delivery partner on the map in real time. Know exactly when it arrives.',
    gradient: ['#3B82F6', '#1D4ED8'] as [string, string],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const dotAnim0 = useRef(new Animated.Value(1)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnimations = [dotAnim0, dotAnim1, dotAnim2];

  const updateDots = (index: number) => {
    dotAnimations.forEach((anim, i) => {
      Animated.timing(anim, { toValue: i === index ? 1 : 0, duration: 200, useNativeDriver: false }).start();
    });
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next });
      setCurrentIndex(next);
      updateDots(next);
    } else {
      router.replace('/(auth)/login' as any);
    }
  };

  const skip = () => router.replace('/(auth)/login' as any);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={styles.slide}>
            {/* Main Icon */}
            <View style={styles.iconContainer}>
              <item.Icon size={56} color={Colors.white} strokeWidth={2} />
            </View>

            {/* Text */}
            <View style={styles.textContainer}>
              <Text style={styles.titleEn}>{item.titleEn}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </LinearGradient>
        )}
      />

      {/* Bottom controls */}
      <View style={styles.controls}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotAnimations[i].interpolate({ inputRange: [0, 1], outputRange: [8, 24] }),
                  opacity: dotAnimations[i].interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
                  backgroundColor: Colors.white,
                },
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
            <Text style={styles.nextText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  textContainer: { alignItems: 'center' },
  titleEn: { fontFamily: 'BeVietnamPro-Bold', fontSize: 28, color: Colors.white, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontFamily: 'BeVietnamPro-Regular', fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24 },

  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 52,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: 28,
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },

  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  skipText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.7)' },

  nextBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: Radius.button,
    minWidth: 160,
    alignItems: 'center',
  },
  nextText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.primary },
});
