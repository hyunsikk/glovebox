import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared, Radii, IconSize } from '../theme';

/**
 * Teaser card shown in place of a Pro-gated feature for free users. Tapping it
 * opens the paywall via `onUnlock`. Keeps gating consistent and honest: the user
 * sees exactly what they'd unlock before paying.
 */
export default function ProLockedCard({ icon = 'lock-closed', title, sub, onUnlock }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUnlock?.();
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress} style={[Shared.card]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 44, height: 44, borderRadius: Radii.pill,
          backgroundColor: Colors.primary + '1A',
          borderWidth: 1, borderColor: Colors.primary + '33',
          justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
        }}>
          <Ionicons name={icon} size={IconSize.lg} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[Typography.h2, { color: Colors.textPrimary }]}>{title}</Text>
            <View style={{ backgroundColor: Colors.primary + '20', borderRadius: Radii.sm, paddingHorizontal: 6, paddingVertical: 2, marginLeft: Spacing.sm }}>
              <Text style={[Typography.micro, { fontFamily: 'Nunito_700Bold', color: Colors.primary }]}>PRO</Text>
            </View>
          </View>
          {!!sub && (
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: 2 }]}>{sub}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={IconSize.md} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}
