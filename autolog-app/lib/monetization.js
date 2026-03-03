/**
 * Glovebox Monetization Layer
 * 
 * Manages Pro status, ad placement logic, and paywall triggers.
 * Ad SDK (AdMob) is NOT integrated yet — this provides the structure
 * so the app knows WHEN and WHERE to show ads, and what's Pro-gated.
 * 
 * When ready to integrate AdMob:
 * 1. npm install react-native-google-mobile-ads
 * 2. Replace AdPlaceholder components with real AdMob components
 * 3. Add ad unit IDs from AdMob dashboard
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PRO_KEY = '@glovebox_pro_status';
const AD_COUNTER_KEY = '@glovebox_ad_counter';

// --- Pro Status ---

export const ProStatus = {
  isPro: async () => {
    try {
      const status = await AsyncStorage.getItem(PRO_KEY);
      return status === 'true';
    } catch { return false; }
  },

  setPro: async (value) => {
    await AsyncStorage.setItem(PRO_KEY, value ? 'true' : 'false');
  },

  // For testing — toggle Pro on/off
  togglePro: async () => {
    const current = await ProStatus.isPro();
    await ProStatus.setPro(!current);
    return !current;
  },
};

// --- Ad Placement Logic ---

export const AdLogic = {
  // Track service logs to determine when to show interstitial
  incrementServiceLogCount: async () => {
    try {
      const count = await AsyncStorage.getItem(AD_COUNTER_KEY);
      const newCount = (parseInt(count || '0') + 1);
      await AsyncStorage.setItem(AD_COUNTER_KEY, newCount.toString());
      return newCount;
    } catch { return 0; }
  },

  // Should we show an interstitial ad? (every 3rd service log)
  shouldShowInterstitial: async () => {
    try {
      const isPro = await ProStatus.isPro();
      if (isPro) return false;

      const count = await AsyncStorage.getItem(AD_COUNTER_KEY);
      return (parseInt(count || '0') % 3 === 0) && parseInt(count || '0') > 0;
    } catch { return false; }
  },

  // Should we show the banner ad? (not Pro)
  shouldShowBanner: async () => {
    const isPro = await ProStatus.isPro();
    return !isPro;
  },
};

// --- Pro Feature Gates ---

export const ProFeatures = {
  // Features that require Pro
  COST_COMPARISON: 'cost_comparison',        // Cost vs make/model average
  INTERVAL_OPTIMIZATION: 'interval_optimization', // Smart interval suggestions  
  TWELVE_MONTH_FORECAST: 'twelve_month_forecast', // Detailed 12-month forecast
  PDF_EXPORT: 'pdf_export',                  // Export for resale/warranty
  
  // Check if a specific feature is unlocked
  isUnlocked: async (feature) => {
    return await ProStatus.isPro();
  },

  // Get all Pro features with their lock status
  getAll: async () => {
    const isPro = await ProStatus.isPro();
    return [
      { id: 'cost_comparison', name: 'Cost Comparison', description: 'See how your costs compare to other owners of the same car', locked: !isPro },
      { id: 'interval_optimization', name: 'Smart Intervals', description: 'Get personalized service intervals based on your driving', locked: !isPro },
      { id: 'twelve_month_forecast', name: '12-Month Forecast', description: 'Detailed upcoming maintenance with specific dates and costs', locked: !isPro },
      { id: 'pdf_export', name: 'PDF Export', description: 'Export service records for resale or warranty claims', locked: !isPro },
    ];
  },
};

// --- Paywall Config ---

export const PaywallConfig = {
  productId: 'glovebox_pro_yearly',
  price: '$9.99',
  period: 'year',
  trialDays: 0,
  
  // Copy for different paywall contexts
  copy: {
    fromInsights: {
      title: 'unlock smarter insights',
      subtitle: 'see how your car stacks up and save money on maintenance.',
      cta: 'go pro — $9.99/year',
    },
    fromExport: {
      title: 'export your records',
      subtitle: 'generate PDF reports for warranty claims, resale, or your mechanic.',
      cta: 'go pro — $9.99/year',
    },
    removeAds: {
      title: 'enjoy glovebox ad-free',
      subtitle: 'plus unlock advanced analytics and PDF export.',
      cta: 'go pro — $9.99/year',
    },
  },
};
