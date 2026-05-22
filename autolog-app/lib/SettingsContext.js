import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UNITS_KEY = '@autolog_units';
const CURRENCY_KEY = '@autolog_currency';

const CURRENCY_CONFIG = {
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  JPY: { symbol: '¥', locale: 'ja-JP', zeroDecimal: true },
  CNY: { symbol: '¥', locale: 'zh-CN' },
  INR: { symbol: '₹', locale: 'en-IN' },
  CAD: { symbol: 'CA$', locale: 'en-CA' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
  KRW: { symbol: '₩', locale: 'ko-KR', zeroDecimal: true },
};

const SettingsContext = createContext({
  units: 'imperial',
  currency: 'USD',
  // Formatting helpers
  formatCost: (amount) => `$${amount?.toFixed(2) || '0.00'}`,
  formatCostShort: (amount) => `$${Math.round(amount || 0)}`,
  formatDistance: (miles) => `${miles?.toLocaleString() || '0'} mi`,
  formatDistanceUnit: () => 'mi',
  formatEfficiency: (mpg) => `${mpg} MPG`,
  formatEfficiencyUnit: () => 'MPG',
  formatVolume: (gallons) => `${gallons} gal`,
  formatVolumeUnit: () => 'gal',
  distanceLabel: 'miles',
  volumeLabel: 'gallons',
  efficiencyLabel: 'MPG',
});

export function SettingsProvider({ children }) {
  const [units, setUnits] = useState('imperial');
  const [currency, setCurrency] = useState('USD');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(UNITS_KEY),
      AsyncStorage.getItem(CURRENCY_KEY),
    ]).then(([u, c]) => {
      if (u) setUnits(u);
      if (c) setCurrency(c);
      setReady(true);
    });
  }, []);

  // Listen for changes written by the settings screen. Empty deps so the
  // interval is created once (no churn); functional updates compare against the
  // latest value without needing units/currency in the dependency array.
  useEffect(() => {
    const interval = setInterval(async () => {
      const [u, c] = await Promise.all([
        AsyncStorage.getItem(UNITS_KEY),
        AsyncStorage.getItem(CURRENCY_KEY),
      ]);
      if (u) setUnits(prev => (u !== prev ? u : prev));
      if (c) setCurrency(prev => (c !== prev ? c : prev));
    }, 2000); // poll every 2s — lightweight
    return () => clearInterval(interval);
  }, []);

  const isMetric = units === 'metric';
  const cc = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;

  const formatCost = (amount) => {
    if (amount == null || isNaN(amount)) return cc.zeroDecimal ? `${cc.symbol}0` : `${cc.symbol}0.00`;
    if (cc.zeroDecimal) return `${cc.symbol}${Math.round(amount).toLocaleString()}`;
    return `${cc.symbol}${Number(amount).toFixed(2)}`;
  };

  const formatCostShort = (amount) => {
    if (amount == null || isNaN(amount)) return `${cc.symbol}0`;
    return `${cc.symbol}${Math.round(amount).toLocaleString()}`;
  };

  const MI_TO_KM = 1.60934;
  const GAL_TO_L = 3.78541;

  const formatDistance = (miles) => {
    if (miles == null) return isMetric ? '0 km' : '0 mi';
    const val = isMetric ? Math.round(miles * MI_TO_KM) : Math.round(miles);
    return `${val.toLocaleString()} ${isMetric ? 'km' : 'mi'}`;
  };

  const formatDistanceUnit = () => isMetric ? 'km' : 'mi';
  const distanceLabel = isMetric ? 'kilometers' : 'miles';

  const formatEfficiency = (mpg) => {
    if (mpg == null) return isMetric ? '0 km/L' : '0 MPG';
    if (isMetric) {
      const kmPerL = mpg * MI_TO_KM / GAL_TO_L;
      return `${kmPerL.toFixed(1)} km/L`;
    }
    return `${Number(mpg).toFixed(1)} MPG`;
  };

  const formatEfficiencyUnit = () => isMetric ? 'km/L' : 'MPG';
  const efficiencyLabel = isMetric ? 'km/L' : 'MPG';

  const formatVolume = (gallons) => {
    if (gallons == null) return isMetric ? '0 L' : '0 gal';
    if (isMetric) return `${(gallons * GAL_TO_L).toFixed(1)} L`;
    return `${Number(gallons).toFixed(1)} gal`;
  };

  const formatVolumeUnit = () => isMetric ? 'L' : 'gal';
  const volumeLabel = isMetric ? 'liters' : 'gallons';

  const currencySymbol = cc.symbol;

  return (
    <SettingsContext.Provider value={{
      units, currency, currencySymbol,
      formatCost, formatCostShort,
      formatDistance, formatDistanceUnit, distanceLabel,
      formatEfficiency, formatEfficiencyUnit, efficiencyLabel,
      formatVolume, formatVolumeUnit, volumeLabel,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export default SettingsContext;
