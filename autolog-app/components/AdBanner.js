/**
 * Ad Banner Placeholder
 * 
 * Shows a placeholder where AdMob banner will go.
 * When AdMob is integrated, replace the View with:
 * <BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
 */

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { AdLogic } from '../lib/monetization';

export default function AdBanner() {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    checkAdStatus();
  }, []);

  const checkAdStatus = async () => {
    const shouldShow = await AdLogic.shouldShowBanner();
    setShowAd(shouldShow);
  };

  if (!showAd) return null;

  // TODO: Replace with real AdMob BannerAd component
  return (
    <View style={{
      height: 50,
      backgroundColor: Colors.surface1,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: Spacing.horizontal,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      borderStyle: 'dashed',
    }}>
      <Text style={[Typography.small, { color: Colors.textTertiary, opacity: 0.5 }]}>
        ad placeholder — AdMob integration pending
      </Text>
    </View>
  );
}
