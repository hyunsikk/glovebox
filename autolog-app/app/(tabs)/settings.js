import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors, Typography, Spacing, Shared } from '../../theme';
import { useTheme } from '../../lib/ThemeContext';
import { VehicleStorage, ServiceStorage, FuelStorage } from '../../lib/storage';

const UNITS_KEY = '@autolog_units';
const CURRENCY_KEY = '@autolog_currency';

const SettingRow = ({ icon, label, value, onPress, rightElement, colors }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    }}
  >
    <View style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    }}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[Typography.body, { color: colors.textPrimary }]}>{label}</Text>
      {value && <Text style={[Typography.small, { color: colors.textSecondary, marginTop: 2 }]}>{value}</Text>}
    </View>
    {rightElement || (onPress && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />)}
  </TouchableOpacity>
);

const OptionPicker = ({ options, selected, onSelect, colors }) => (
  <View style={{ flexDirection: 'row', gap: 8 }}>
    {options.map(opt => (
      <TouchableOpacity
        key={opt.value}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelect(opt.value);
        }}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: selected === opt.value ? colors.primary + '20' : colors.surface1,
          borderWidth: 1,
          borderColor: selected === opt.value ? colors.primary : colors.glassBorder,
        }}
      >
        <Text style={[Typography.caption, {
          color: selected === opt.value ? colors.primary : colors.textSecondary,
          fontFamily: selected === opt.value ? 'Nunito_700Bold' : 'Nunito_500Medium',
        }]}>
          {opt.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function SettingsScreen() {
  const { isDark, colors, toggleTheme } = useTheme();
  const [units, setUnits] = useState('imperial'); // imperial | metric
  const [currency, setCurrency] = useState('USD');
  const [stats, setStats] = useState({ vehicles: 0, services: 0, fuelLogs: 0 });

  useEffect(() => {
    loadPreferences();
    loadStats();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedUnits, savedCurrency] = await Promise.all([
        AsyncStorage.getItem(UNITS_KEY),
        AsyncStorage.getItem(CURRENCY_KEY),
      ]);
      if (savedUnits) setUnits(savedUnits);
      if (savedCurrency) setCurrency(savedCurrency);
    } catch (e) {}
  };

  const loadStats = async () => {
    try {
      const vehicles = await VehicleStorage.getAll();
      let totalServices = 0;
      let totalFuel = 0;
      for (const v of vehicles) {
        const services = await ServiceStorage.getByVehicleId(v.id);
        const fuel = await FuelStorage.getByVehicleId(v.id);
        totalServices += services.length;
        totalFuel += fuel.length;
      }
      setStats({ vehicles: vehicles.length, services: totalServices, fuelLogs: totalFuel });
    } catch (e) {}
  };

  const handleSetUnits = async (value) => {
    setUnits(value);
    await AsyncStorage.setItem(UNITS_KEY, value);
  };

  const handleSetCurrency = async (value) => {
    setCurrency(value);
    await AsyncStorage.setItem(CURRENCY_KEY, value);
  };

  const handleExportData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const vehicles = await VehicleStorage.getAll();
      const exportData = { exportedAt: new Date().toISOString(), vehicles: [] };

      for (const vehicle of vehicles) {
        const services = await ServiceStorage.getByVehicleId(vehicle.id);
        const fuelLogs = await FuelStorage.getByVehicleId(vehicle.id);
        exportData.vehicles.push({ ...vehicle, services, fuelLogs });
      }

      const json = JSON.stringify(exportData, null, 2);
      
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `car-story-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('exported!', 'data downloaded as JSON');
      } else {
        const path = `${FileSystem.documentDirectory}car-story-export-${new Date().toISOString().slice(0, 10)}.json`;
        await FileSystem.writeAsStringAsync(path, json);
        await Sharing.shareAsync(path, { mimeType: 'application/json' });
      }
    } catch (error) {
      Alert.alert('export failed', error.message);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'clear all data?',
      'this will permanently delete all vehicles, services, and fuel logs. this cannot be undone.',
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'clear everything',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              const keys = await AsyncStorage.getAllKeys();
              const appKeys = keys.filter(k => k.startsWith('@autolog_') || k.startsWith('recalls_'));
              await AsyncStorage.multiRemove(appKeys);
              loadStats();
              Alert.alert('done', 'all data has been cleared');
            } catch (error) {
              Alert.alert('error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingHorizontal: Spacing.horizontal, paddingBottom: 120 }}
    >
      {/* Appearance */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        appearance
      </Text>
      <View style={[Shared.card]}>
        <SettingRow
          icon="moon-outline"
          label="dark mode"
          colors={colors}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleTheme();
              }}
              trackColor={{ false: colors.glassBorder, true: colors.primary + '60' }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* Units & Currency */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        units & currency
      </Text>
      <View style={[Shared.card]}>
        <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorder }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: colors.primary + '15',
              alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
            }}>
              <Ionicons name="speedometer-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[Typography.body, { color: colors.textPrimary }]}>distance units</Text>
          </View>
          <View style={{ paddingLeft: 48 }}>
            <OptionPicker
              options={[
                { value: 'imperial', label: 'miles / gal' },
                { value: 'metric', label: 'km / L' },
              ]}
              selected={units}
              onSelect={handleSetUnits}
              colors={colors}
            />
          </View>
        </View>

        <View style={{ paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: colors.primary + '15',
              alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
            }}>
              <Ionicons name="cash-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[Typography.body, { color: colors.textPrimary }]}>currency</Text>
          </View>
          <View style={{ paddingLeft: 48 }}>
            <OptionPicker
              options={[
                { value: 'USD', label: '$ USD' },
                { value: 'EUR', label: '€ EUR' },
                { value: 'GBP', label: '£ GBP' },
                { value: 'KRW', label: '₩ KRW' },
              ]}
              selected={currency}
              onSelect={handleSetCurrency}
              colors={colors}
            />
          </View>
        </View>
      </View>

      {/* Data */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        your data
      </Text>
      <View style={[Shared.card]}>
        <SettingRow
          icon="download-outline"
          label="export data"
          value="download all your data as JSON"
          onPress={handleExportData}
          colors={colors}
        />
        <SettingRow
          icon="trash-outline"
          label="clear all data"
          value={`${stats.vehicles} vehicles · ${stats.services} services · ${stats.fuelLogs} fuel logs`}
          onPress={handleClearData}
          colors={colors}
        />
      </View>

      {/* About */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        about
      </Text>
      <View style={[Shared.card]}>
        <SettingRow
          icon="car-sport-outline"
          label="Car Story"
          value="v1.1.0 · built by TeamAM"
          colors={colors}
        />
      </View>

      <Text style={[Typography.small, { color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.xl }]}>
        your data stays on your device. always.
      </Text>
    </ScrollView>
  );
}
