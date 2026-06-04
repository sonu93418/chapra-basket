import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';

export default function OrderConfirmedScreen() {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#006E2F', '#00B050', '#4ADE80']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View style={[styles.checkCircle, { transform: [{ scale }] }]}>
          <Text style={styles.checkEmoji}>✅</Text>
        </Animated.View>

        <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
          <Text style={styles.title}>Order Confirmed! 🎉</Text>
          <Text style={styles.orderNum}>Order #CB-2024-00157</Text>
          <Text style={styles.eta}>⚡ Estimated delivery: 28 minutes</Text>

          {/* ETA Card */}
          <View style={styles.etaCard}>
            <View style={styles.etaStep}>
              <View style={[styles.etaDot, styles.etaDotActive]} />
              <Text style={styles.etaLabel}>Order Confirmed</Text>
              <Text style={styles.etaTime}>Just now</Text>
            </View>
            <View style={styles.etaLine} />
            <View style={styles.etaStep}>
              <View style={styles.etaDot} />
              <Text style={styles.etaLabelPending}>Rider Assigned</Text>
              <Text style={styles.etaTimePending}>~5 min</Text>
            </View>
            <View style={styles.etaLine} />
            <View style={styles.etaStep}>
              <View style={styles.etaDot} />
              <Text style={styles.etaLabelPending}>Out for Delivery</Text>
              <Text style={styles.etaTimePending}>~15 min</Text>
            </View>
            <View style={styles.etaLine} />
            <View style={styles.etaStep}>
              <View style={styles.etaDot} />
              <Text style={styles.etaLabelPending}>Delivered 🏠</Text>
              <Text style={styles.etaTimePending}>~28 min</Text>
            </View>
          </View>

          <Button
            label="Track Your Order →"
            onPress={() => router.replace('/(customer)/orders')}
            style={{ marginBottom: 12 }}
            fullWidth
          />
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(customer)/' as any)}>
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.success },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },

  checkCircle: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  checkEmoji: { fontSize: 64 },

  title: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 30, color: Colors.white, textAlign: 'center', marginBottom: 8 },
  orderNum: { ...TextStyles.bodyLgSemiBold, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 4 },
  eta: { ...TextStyles.bodyLgSemiBold, color: Colors.white, textAlign: 'center', marginBottom: 28 },

  etaCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.xxl, padding: 20,
    width: '100%', marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  etaStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  etaDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  etaDotActive: { backgroundColor: Colors.white },
  etaLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white, flex: 1 },
  etaLabelPending: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.65)', flex: 1 },
  etaTime: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.white },
  etaTimePending: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  etaLine: { width: 2, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', marginLeft: 6 },

  homeBtn: { alignItems: 'center', paddingVertical: 12 },
  homeBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.8)' },
});
