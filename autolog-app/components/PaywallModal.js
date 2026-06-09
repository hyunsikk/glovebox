import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared, Radii, IconSize } from '../theme';
import { usePurchases } from '../lib/PurchaseContext';

// Every benefit listed here is actually gated behind the Pro entitlement.
// Backup/restore and photo attachments stay free for all users by design, so
// they are deliberately not advertised here.
const BENEFITS = [
  { icon: 'car-sport', title: 'Unlimited vehicles', sub: 'Track your whole garage, not just one car' },
  { icon: 'shield-checkmark', title: 'Recall alerts', sub: 'Automatic NHTSA safety recall checks for your cars' },
  { icon: 'trending-up', title: 'Cost forecast & benchmarks', sub: 'See what maintenance will cost and how you compare' },
  { icon: 'document-text', title: 'PDF service report', sub: 'Export records for resale or warranty claims' },
];

// Headline tailored to where the paywall was triggered from.
const CONTEXT_COPY = {
  vehicle_limit: 'Add unlimited vehicles',
  export: 'Export a full service report',
  insights: 'Unlock forecasts & benchmarks',
  recalls: 'Check for safety recalls',
  default: 'Unlock Car Story Pro',
};

export default function PaywallModal({ visible, onClose, context = 'default' }) {
  const { purchasePro, restore, priceString, isStub, isPro } = usePurchases();
  const [busy, setBusy] = useState(false);

  const headline = CONTEXT_COPY[context] || CONTEXT_COPY.default;

  const handleUnlock = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBusy(true);
    const res = await purchasePro();
    setBusy(false);
    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose?.();
    } else if (res.error) {
      Alert.alert('Purchase failed', res.error);
    }
    // cancelled: silently dismiss nothing
  };

  const handleRestore = async () => {
    setBusy(true);
    const res = await restore();
    setBusy(false);
    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose?.();
    } else if (res.error) {
      Alert.alert('Restore failed', 'Could not reach the store. Check your connection and try again.');
    } else {
      Alert.alert('Nothing to restore', 'No previous Pro purchase was found for this account.');
    }
  };

  // fullScreen (not pageSheet) so it presents correctly even when opened from
  // inside another modal — iOS forbids a sheet over a sheet.
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={Shared.modalHeader}>
          <View style={{ width: 32 }} />
          <Text style={[Typography.caption, { color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }]}>
            car story pro
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={IconSize.lg} color={Colors.textSecondary} accessibilityRole="button" accessibilityLabel="Close" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.horizontalLarge, paddingBottom: Spacing.section }}>
          {/* Hero */}
          <View style={{ alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.xl }}>
            <View style={{
              width: 72, height: 72, borderRadius: Radii.pill,
              backgroundColor: Colors.primary + '1A',
              borderWidth: 1, borderColor: Colors.primary + '40',
              justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
            }}>
              <Ionicons name="star" size={36} color={Colors.primary} />
            </View>
            <Text style={[Typography.hero, { color: Colors.textPrimary, textAlign: 'center' }]}>{headline}</Text>
            <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
              One payment. Yours forever. No subscription.
            </Text>
          </View>

          {/* Benefits */}
          <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
            {BENEFITS.map((b, i) => (
              <View
                key={b.icon}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: Spacing.md,
                  borderBottomWidth: i < BENEFITS.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.glassBorder,
                }}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: Radii.pill,
                  backgroundColor: Colors.success + '18',
                  justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
                }}>
                  <Ionicons name={b.icon} size={IconSize.md} color={Colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.h2, { color: Colors.textPrimary }]}>{b.title}</Text>
                  <Text style={[Typography.caption, { color: Colors.textSecondary }]}>{b.sub}</Text>
                </View>
              </View>
            ))}
          </View>

          {isStub && (
            <Text style={[Typography.small, { color: Colors.warning, textAlign: 'center', marginTop: Spacing.md }]}>
              dev mode — unlock simulated locally (no real charge)
            </Text>
          )}
        </ScrollView>

        {/* Footer CTA */}
        <View style={{ paddingHorizontal: Spacing.horizontalLarge, paddingBottom: Spacing.xxl, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.glassBorder }}>
          <TouchableOpacity style={[Shared.buttonPrimary, { opacity: isPro ? 0.6 : 1 }]} onPress={handleUnlock} disabled={busy || isPro} activeOpacity={0.85}>
            {busy ? (
              <ActivityIndicator color={Colors.pearlWhite} />
            ) : (
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#FFFFFF' }}>
                {isPro ? 'You have Pro ✓' : `Unlock Pro — ${priceString}`}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRestore} disabled={busy} style={{ paddingVertical: Spacing.md, alignItems: 'center' }}>
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Restore purchase</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
