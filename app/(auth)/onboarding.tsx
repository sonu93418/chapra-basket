import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Animated, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../../src/theme';
import { ArrowRight } from '../../src/components/ui/Icon';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('../../assets/onboarding1.png'),
    headline: 'Everything You Need, Delivered Fast',
    subtext: 'Order groceries, fruits, vegetables, medicines, and daily essentials in minutes.',
    cta: 'Continue',
  },
  {
    id: '2',
    image: require('../../assets/onboarding2.png'),
    headline: 'Fresh Products from Trusted Local Stores',
    subtext: 'Support local businesses while enjoying fast and reliable delivery.',
    cta: 'Next',
  },
  {
    id: '3',
    image: require('../../assets/onboarding3.png'),
    headline: 'Track Every Order in Real Time',
    subtext: 'Follow your order from pickup to doorstep with accurate ETA updates.',
    cta: 'Get Started',
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
      Animated.spring(anim, {
        toValue: i === index ? 1 : 0,
        tension: 40,
        friction: 8,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
      updateDots(next);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      updateDots(index);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Top Header - Skip Action */}
      <View style={styles.header}>
        {currentIndex < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ height: 40 }} />
        )}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Visual Illustration Container */}
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>

            {/* Typography content */}
            <View style={styles.textContainer}>
              <Text style={styles.headline}>{item.headline}</Text>
              <Text style={styles.subtext}>{item.subtext}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls Bar */}
      <View style={styles.controlsContainer}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotAnimations[i].interpolate({ inputRange: [0, 1], outputRange: [8, 20] }),
                  opacity: dotAnimations[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
                  backgroundColor: i === currentIndex ? Colors.primary : Colors.border,
                },
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        <TouchableOpacity onPress={handleNext} style={styles.ctaBtn} activeOpacity={0.85}>
          <View style={styles.ctaButtonContent}>
            <Text style={styles.ctaText}>{SLIDES[currentIndex].cta}</Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Warm peach off-white (#FFF8F6)
  },
  header: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.xs,
  },
  skipText: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  imageContainer: {
    width: width * 0.82,
    height: height * 0.38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 72,
  },
  headline: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  subtext: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  controlsContainer: {
    paddingBottom: 48,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: Colors.primary, // Brand orange (#FF6B00)
    borderRadius: Radius.button, // 14
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  ctaText: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
