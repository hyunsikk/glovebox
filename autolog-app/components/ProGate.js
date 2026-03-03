/**
 * Pro Feature Gate
 * 
 * Wraps Pro-only content. Shows a soft paywall overlay when locked.
 * Tapping the overlay opens the upgrade prompt.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../theme';
import { ProStatus, PaywallConfig } from '../lib/monetization';

// Blurred/locked overlay for Pro features
export function ProLockedCard({ feature, description, children }) {
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    ProStatus.isPro().then(setIsPro);
  }, []);

  if (isPro) return children;

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowPaywall(true);
        }}
        activeOpacity={0.9}
        style={{ position: 'relative' }}
      >
        {/* Dimmed content preview */}
        <View style={{ opacity: 0.3 }}>
          {children}
        </View>
        
        {/* Pro badge overlay */}
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.warning,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors.glassBorder,
            shadowColor: Colors.warning,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Ionicons name="lock-closed" size={14} color={Colors.background} />
            <Text style={[Typography.caption, { 
              color: Colors.background, 
              fontFamily: 'Nunito_700Bold',
              marginLeft: 6,
            }]}>
              PRO
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        context="fromInsights"
      />
    </>
  );
}

// Paywall modal
export function PaywallModal({ visible, onClose, context = 'fromInsights' }) {
  const copy = PaywallConfig.copy[context] || PaywallConfig.copy.fromInsights;

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Integrate RevenueCat or StoreKit for real purchases
    // For now, just show a message
    alert('App Store purchase integration coming soon. For testing, use Settings to toggle Pro.');
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert('Restore purchases integration coming soon.');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.7)', 
          justifyContent: 'flex-end' 
        }}
        onPress={onClose}
      >
        <Pressable style={{
          backgroundColor: Colors.surface2,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: Spacing.horizontal,
          paddingBottom: 40,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}>
          {/* Handle */}
          <View style={{ 
            width: 40, height: 4, 
            backgroundColor: Colors.textSecondary,
            borderRadius: 2, 
            alignSelf: 'center', 
            marginBottom: Spacing.xl,
            opacity: 0.3,
          }} />

          {/* Icon */}
          <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
            <View style={{
              backgroundColor: Colors.warning + '20',
              borderRadius: 32,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.warning + '30',
            }}>
              <Ionicons name="diamond" size={32} color={Colors.warning} />
            </View>
          </View>

          {/* Copy */}
          <Text style={[Typography.hero, { 
            textAlign: 'center', 
            color: Colors.textPrimary,
            marginBottom: Spacing.sm,
          }]}>
            {copy.title}
          </Text>

          <Text style={[Typography.body, { 
            textAlign: 'center', 
            color: Colors.textSecondary,
            marginBottom: Spacing.xl,
            lineHeight: 22,
          }]}>
            {copy.subtitle}
          </Text>

          {/* Features list */}
          <View style={{ marginBottom: Spacing.xl }}>
            {[
              'cost comparison vs other owners',
              'smart service interval optimization',
              'detailed 12-month maintenance forecast',
              'PDF export for resale & warranty',
              'ad-free experience',
            ].map((feature, i) => (
              <View key={i} style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 10,
                paddingHorizontal: Spacing.md,
              }}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={[Typography.body, { 
                  color: Colors.textPrimary, 
                  marginLeft: 10 
                }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handlePurchase}
            style={{
              backgroundColor: Colors.warning,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: Spacing.md,
              shadowColor: Colors.warning,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
            activeOpacity={0.9}
          >
            <Text style={[Typography.h2, { color: Colors.background }]}>
              {copy.cta}
            </Text>
          </TouchableOpacity>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} style={{ alignItems: 'center' }}>
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              restore purchase
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
