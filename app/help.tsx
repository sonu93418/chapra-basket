import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { ArrowLeft, Headphones, Phone, MessageCircle, ChevronUp, ChevronDown, CheckCircle } from '../src/components/ui/Icon';

const FAQ = [
  {
    q: 'How long does delivery take?',
    a: 'We deliver within 30 minutes in most areas of Chapra. Express delivery is available from 8 AM to 10 PM.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'You can cancel within 5 minutes of placing the order. After that, contact our support team directly.',
  },
  {
    q: 'What is the minimum order value?',
    a: 'There is no minimum order. However, orders below ₹299 attract a ₹25 delivery fee.',
  },
  {
    q: 'How do I use my wallet balance?',
    a: 'Select "Chapra Basket Wallet" as payment method during checkout. Balance is deducted automatically.',
  },
  {
    q: 'What if I receive a wrong or damaged product?',
    a: 'Contact us within 24 hours with a photo. We will arrange a replacement or full refund.',
  },
];

const CONTACT = [
  { IconComponent: Phone, label: 'Call Support', sub: '+91 7654 321 098', action: 'Call' },
  { IconComponent: MessageCircle, label: 'WhatsApp Chat', sub: 'Chat with us instantly', action: 'Chat' },
  { IconComponent: Headphones, label: 'Email Us', sub: 'support@chaprabasket.com', action: 'Email' },
];

export default function HelpScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={18} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <Headphones size={48} color={Colors.primary} style={{ marginBottom: 4 }} />
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>We're here 7 days a week, 8 AM – 10 PM</Text>
        </View>

        {/* Contact Options */}
        <View style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {CONTACT.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.contactRow, i < CONTACT.length - 1 && styles.rowBorder]}
              activeOpacity={0.85}
            >
              <View style={styles.contactIcon}>
                <item.IconComponent size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>{item.label}</Text>
                <Text style={styles.contactSub}>{item.sub}</Text>
              </View>
              <View style={styles.actionChip}>
                <Text style={styles.actionChipText}>{item.action}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <View style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.faqItem, i < FAQ.length - 1 && styles.rowBorder]}
              onPress={() => setOpenFaq(openFaq === i ? null : i)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQ}>{item.q}</Text>
                {openFaq === i ? (
                  <ChevronUp size={16} color={Colors.textMuted} />
                ) : (
                  <ChevronDown size={16} color={Colors.textMuted} />
                )}
              </View>
              {openFaq === i && (
                <Text style={styles.faqA}>{item.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Send Message */}
        <View style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>Send Us a Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Describe your issue or feedback..."
            placeholderTextColor={Colors.textPlaceholder}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {sent ? (
            <View style={[styles.sentBanner, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
              <CheckCircle size={16} color={Colors.successDark} strokeWidth={2.5} />
              <Text style={styles.sentText}>Message sent! We'll respond within 2 hours.</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.85}>
              <Text style={styles.sendBtnText}>Send Message</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.textPrimary },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },

  scroll: { gap: 14, padding: Spacing.md, paddingBottom: 30 },

  hero: {
    alignItems: 'center', backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.xxl, padding: 28, gap: 8,
  },
  heroEmoji: { fontSize: 48 },
  heroTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 22, color: Colors.textPrimary },
  heroSub: { ...TextStyles.bodySm, color: Colors.textSecondary, textAlign: 'center' },

  section: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 16 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },

  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  contactIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  contactIconText: { fontSize: 24 },
  contactLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  contactSub: { ...TextStyles.bodySm, color: Colors.textMuted },
  actionChip: { backgroundColor: Colors.primary, borderRadius: Radius.button, paddingHorizontal: 14, paddingVertical: 7 },
  actionChipText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.white },

  faqItem: { paddingVertical: 14 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  faqQ: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  faqArrow: { fontSize: 12, color: Colors.textMuted },
  faqA: { ...TextStyles.bodySm, color: Colors.textSecondary, marginTop: 10, lineHeight: 20 },

  messageInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.xl,
    padding: 14, fontFamily: 'BeVietnamPro-Regular', fontSize: 14,
    color: Colors.textPrimary, minHeight: 100, marginBottom: 12,
  },
  sendBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.button,
    paddingVertical: 14, alignItems: 'center',
  },
  sendBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white },
  sentBanner: {
    backgroundColor: Colors.successContainer, borderRadius: Radius.xl,
    padding: 14, alignItems: 'center',
  },
  sentText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.successDark },
});
