import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../theme';

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
          width: 44, height: 44, borderRadius: 14,
          backgroundColor: Colors.primary + '1A',
          borderWidth: 1, borderColor: Colors.primary + '33',
          justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
        }}>
          <Ionicons name={icon} size={22} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[Typography.h2, { color: Colors.textPrimary, fontSize: 16 }]}>{title}</Text>
            <View style={{ backgroundColor: Colors.primary + '20', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: Spacing.sm }}>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 9, color: Colors.primary, letterSpacing: 0.5 }}>PRO</Text>
            </View>
          </View>
          {!!sub && (
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: 2 }]}>{sub}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}
