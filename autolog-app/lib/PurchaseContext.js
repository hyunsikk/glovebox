/**
 * Purchase / entitlement layer for the one-time "Pro" unlock.
 *
 * Designed as a seam: the full paywall + gating experience works today on a
 * local dev-stub. When you create the RevenueCat project and an App Store
 * Connect IAP, fill in the API keys below and it switches to the real SDK with
 * no other code changes.
 *
 * To go live:
 *   1. Create a RevenueCat project, add your iOS app, copy the public SDK key.
 *   2. In App Store Connect, create a non-consumable IAP with product id
 *      PRODUCT_ID below, priced at $4.99.
 *   3. In RevenueCat: attach that product to an entitlement called "pro" and
 *      add it to the default offering.
 *   4. Paste the key(s) into RC_API_KEY_IOS / RC_API_KEY_ANDROID.
 *   5. Build with EAS (this is a native module — not Expo Go / web).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- configuration -----------------------------------------------------------
export const RC_API_KEY_IOS = 'appl_OIyNCXXdwgontzBWsnzGilUMskm';  // RevenueCat public Apple SDK key (safe to ship in client)
export const RC_API_KEY_ANDROID = '';   // e.g. 'goog_xxxxxxxx'
export const ENTITLEMENT_ID = 'pro';
export const PRODUCT_ID = 'dev.teamam.glovebox.pro';
export const PRO_PRICE_STRING = '$4.99';

const DEV_UNLOCK_KEY = '@autolog_dev_pro';
const PRO_CACHE_KEY = '@autolog_pro_cached'; // last-known entitlement (offline/error fallback)
// Mirror of the live entitlement, readable by non-React code (the recall
// notification scheduler in lib/recalls.js) that can't reach this context.
const PRO_FLAG_KEY = '@autolog_pro_entitled';

// Use the real SDK only on a native platform with a configured key.
const apiKey = Platform.select({ ios: RC_API_KEY_IOS, android: RC_API_KEY_ANDROID, default: '' });
const useRealSDK = Platform.OS !== 'web' && !!apiKey;

// Lazy-load the native module only when it will actually be used. On web or in
// dev-stub mode this require never executes, so bundling/runtime stay clean.
let Purchases = null;
if (useRealSDK) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch (e) {
    Purchases = null;
  }
}

const PurchaseContext = createContext({
  isPro: false,
  loading: true,
  isStub: true,
  priceString: PRO_PRICE_STRING,
  purchasePro: async () => ({ success: false }),
  restore: async () => ({ success: false }),
});

export function PurchaseProvider({ children }) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priceString, setPriceString] = useState(PRO_PRICE_STRING);

  // Keep the non-React flag mirror in sync with every entitlement change so the
  // recall notification scheduler gates correctly on the next background run.
  useEffect(() => {
    AsyncStorage.setItem(PRO_FLAG_KEY, isPro ? 'true' : 'false').catch(() => {});
  }, [isPro]);

  const applyCustomerInfo = useCallback(async (info) => {
    const active = !!info?.entitlements?.active?.[ENTITLEMENT_ID];
    setIsPro(active);
    // Cache the last-known entitlement so a later offline/error launch doesn't
    // wrongly lock out a paying user.
    try { await AsyncStorage.setItem(PRO_CACHE_KEY, active ? 'true' : 'false'); } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    let listener;
    (async () => {
      try {
        if (Purchases) {
          // Optimistically restore last-known entitlement before the network call.
          const cached = await AsyncStorage.getItem(PRO_CACHE_KEY).catch(() => null);
          if (cached === 'true') setIsPro(true);
          Purchases.configure({ apiKey });
          const info = await Purchases.getCustomerInfo();
          await applyCustomerInfo(info);
          listener = (info) => applyCustomerInfo(info);
          Purchases.addCustomerInfoUpdateListener(listener);
          // Pull live price string from the offering when available.
          try {
            const offerings = await Purchases.getOfferings();
            const pkg = offerings?.current?.availablePackages?.[0];
            if (pkg?.product?.priceString) setPriceString(pkg.product.priceString);
          } catch (e) { /* keep default price string */ }
        } else {
          // dev-stub: entitlement persisted locally
          const unlocked = await AsyncStorage.getItem(DEV_UNLOCK_KEY);
          setIsPro(unlocked === 'true');
        }
      } catch (e) {
        console.warn('Purchase init failed, falling back to cached entitlement:', e?.message);
        const cached = await AsyncStorage.getItem(PRO_CACHE_KEY).catch(() => null);
        setIsPro(cached === 'true');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (Purchases && listener) Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [applyCustomerInfo]);

  const purchasePro = useCallback(async () => {
    try {
      if (Purchases) {
        const offerings = await Purchases.getOfferings();
        const pkg = offerings?.current?.availablePackages?.[0];
        if (!pkg) return { success: false, error: 'No product available' };
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        applyCustomerInfo(customerInfo);
        const active = !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
        return { success: active };
      }
      // dev-stub: unlock locally so the gated experience is testable
      await AsyncStorage.setItem(DEV_UNLOCK_KEY, 'true');
      setIsPro(true);
      return { success: true, stub: true };
    } catch (e) {
      if (e?.userCancelled) return { success: false, cancelled: true };
      return { success: false, error: e?.message || 'Purchase failed' };
    }
  }, [applyCustomerInfo]);

  const restore = useCallback(async () => {
    try {
      if (Purchases) {
        const info = await Purchases.restorePurchases();
        applyCustomerInfo(info);
        return { success: !!info?.entitlements?.active?.[ENTITLEMENT_ID] };
      }
      const unlocked = await AsyncStorage.getItem(DEV_UNLOCK_KEY);
      const active = unlocked === 'true';
      setIsPro(active);
      return { success: active };
    } catch (e) {
      return { success: false, error: e?.message || 'Restore failed' };
    }
  }, [applyCustomerInfo]);

  return (
    <PurchaseContext.Provider value={{ isPro, loading, isStub: !Purchases, priceString, purchasePro, restore }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchases() {
  return useContext(PurchaseContext);
}

export default PurchaseContext;
