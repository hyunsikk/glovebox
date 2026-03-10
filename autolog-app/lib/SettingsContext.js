import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UNITS_KEY = '@autolog_units';
const CURRENCY_KEY = '@autolog_currency';

const CURRENCY_CONFIG = {
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  KRW: { symbol: '₩', locale: 'ko-KR' },
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

  // Listen for changes from settings screen
  useEffect(() => {
    const interval = setInterval(async () => {
      const [u, c] = await Promise.all([
        AsyncStorage.getItem(UNITS_KEY),
        AsyncStorage.getItem(CURRENCY_KEY),
      ]);
      if (u && u !== units) setUnits(u);
      if (c && c !== currency) setCurrency(c);
    }, 2000); // poll every 2s — lightweight
    return () => clearInterval(interval);
  }, [units, currency]);

  const isMetric = units === 'metric';
  const cc = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;

  const formatCost = (amount) => {
    if (amount == null || isNaN(amount)) return `${cc.symbol}0.00`;
    if (currency === 'KRW') return `${cc.symbol}${Math.round(amount).toLocaleString()}`;
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

  if (!ready) return null;

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
