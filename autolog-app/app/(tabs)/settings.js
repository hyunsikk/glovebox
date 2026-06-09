import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Typography, Spacing, Shared, Radii } from '../../theme';
import { useTheme } from '../../lib/ThemeContext';
import { usePurchases } from '../../lib/PurchaseContext';
import PaywallModal from '../../components/PaywallModal';
import AppSwitch from '../../components/AppSwitch';
import { VehicleStorage, ServiceStorage, FuelStorage } from '../../lib/storage';
import { checkForUpdate, getDataMeta } from '../../lib/vehicleDB';
import { escapeHtml } from '../../lib/htmlUtils';
import { backupNow, restoreSnapshot, listSnapshots, getBackupMeta, setAutoBackup, buildBackupPayload, MAX_MANUAL_SNAPSHOTS } from '../../lib/backup';
import { contactSupport, openHelp, SUPPORT_EMAIL } from '../../lib/support';
import * as Application from 'expo-application';

const UNITS_KEY = '@autolog_units';
const CURRENCY_KEY = '@autolog_currency';

// Leading row icon — defined once so every settings row's icon "box" is
// byte-for-byte identical (size, corner, tint). Previously each section
// hand-rolled this View, which let the boxes drift out of sync.
const RowIcon = ({ icon, colors, color }) => {
  const c = color || colors.primary;
  return (
    <View style={{
      width: 36,
      height: 36,
      borderRadius: Radii.pill,
      backgroundColor: c + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    }}>
      <Ionicons name={icon} size={18} color={c} />
    </View>
  );
};

// `last` drops the divider on the final row of a card so it doesn't leave a
// stray line floating above the card's bottom padding.
const SettingRow = ({ icon, label, value, onPress, rightElement, colors, last }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: colors.glassBorder,
    }}
  >
    <RowIcon icon={icon} colors={colors} />
    <View style={{ flex: 1 }}>
      <Text style={[Typography.body, { color: colors.textPrimary }]}>{label}</Text>
      {value && <Text style={[Typography.small, { color: colors.textSecondary, marginTop: 2 }]}>{value}</Text>}
    </View>
    {rightElement || (onPress && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />)}
  </TouchableOpacity>
);

const OptionPicker = ({ options, selected, onSelect, colors }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
          borderRadius: Radii.pill,
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
  const { isPro, isStub, priceString, restore, loading: purchasesLoading } = usePurchases();
  const [units, setUnits] = useState('imperial'); // imperial | metric
  const [stats, setStats] = useState({ vehicles: 0, services: 0, fuelLogs: 0 });
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallContext, setPaywallContext] = useState('default');
  const [dbMeta, setDbMeta] = useState(getDataMeta());
  const [dbUpdating, setDbUpdating] = useState(false);

  // The background launch check may finish after this screen mounts; re-read.
  useEffect(() => {
    const t = setTimeout(() => setDbMeta(getDataMeta()), 2000);
    return () => clearTimeout(t);
  }, []);

  const [backup, setBackup] = useState({ lastBackupAt: null, iCloud: false, autoEnabled: true });
  const [backingUp, setBackingUp] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const loadSnapshots = useCallback(async () => {
    try { setSnapshots(await listSnapshots()); } catch (e) {}
  }, []);
  useEffect(() => { getBackupMeta().then(setBackup); loadSnapshots(); }, [loadSnapshots]);

  const runBackup = useCallback(async (label) => {
    setBackingUp(true);
    const r = await backupNow({ kind: 'manual', label });
    setBackingUp(false);
    setBackup(await getBackupMeta());
    loadSnapshots();
    if (r.success) Alert.alert('Backed up', `Saved ${r.vehicleCount} vehicle(s) and ${r.photoCount ?? 0} photo(s)${r.location === 'icloud' ? ' to iCloud' : ' on this device'}.`);
    else if (r.reason === 'empty') Alert.alert('Nothing to back up', 'Add a vehicle first.');
    else Alert.alert('Backup failed', 'Could not save a backup. Try again.');
  }, [loadSnapshots]);

  // Manual "Back up now" → name the snapshot (iOS prompt). Kept up to 3.
  const handleBackupNow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt(
        'Name this backup',
        'Add a short description so you can tell snapshots apart.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Back up', onPress: (text) => runBackup((text || '').trim() || 'Latest') },
        ],
        'plain-text',
        'Latest',
      );
    } else {
      runBackup('Latest');
    }
  }, [runBackup]);

  const handleRestoreSnapshot = useCallback((snap) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const when = snap.ts > 1 ? ` (saved ${new Date(snap.ts).toLocaleString()})` : '';
    Alert.alert(
      'Restore this backup?',
      `This replaces the data on this device with "${snap.label}"${when}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive', onPress: async () => {
          const r = await restoreSnapshot(snap.file);
          if (r.success) { Alert.alert('Restored', `Recovered ${r.vehicleCount} vehicle(s) and ${r.photoCount ?? 0} photo(s).`); loadStats(); }
          else if (r.reason === 'none') Alert.alert('Couldn’t read backup', 'That snapshot couldn’t be read — make sure you’re signed into the same iCloud account.');
          else Alert.alert('Restore failed', 'Could not restore. Your current data is unchanged.');
        } },
      ],
    );
  }, []);

  const handleToggleAutoBackup = useCallback(async (val) => {
    await setAutoBackup(val);
    setBackup((b) => ({ ...b, autoEnabled: val }));
  }, []);

  const handleContact = useCallback(async (kind) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const r = await contactSupport(kind);
    if (!r.success) Alert.alert('No mail app set up', `Reach us anytime at ${SUPPORT_EMAIL}`);
  }, []);

  const handleHelp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openHelp();
  }, []);

  const handleUpdateDB = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDbUpdating(true);
    const r = await checkForUpdate({ force: true });
    setDbUpdating(false);
    setDbMeta(getDataMeta());
    if (r.updated) Alert.alert('Database updated', `Now at version ${r.version} (${r.vehicleCount} vehicles).`);
    else if (r.upToDate) Alert.alert('Up to date', 'You already have the latest vehicle database.');
    else Alert.alert('Update failed', 'Could not reach the data server. Your existing data is unchanged.');
  }, []);

  useEffect(() => {
    loadPreferences();
    loadStats();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedUnits = await AsyncStorage.getItem(UNITS_KEY);
      if (savedUnits) setUnits(savedUnits);
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


  const handleExportData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Complete, re-importable snapshot (all record types + photo bytes) — the
      // same payload the backup uses, so an export is never a partial copy.
      const exportData = await buildBackupPayload();
      if (!exportData || (exportData.vehicles || []).length === 0) {
        Alert.alert('Nothing to export', 'Add a vehicle first.');
        return;
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

  // --- Report Generation ---
  const [reportVehicleId, setReportVehicleId] = useState('all');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [allVehicles, setAllVehicles] = useState([]);

  useEffect(() => {
    VehicleStorage.getAll().then(setAllVehicles);
  }, []);

  const generateReport = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isPro) {
      // Block export for non-Pro. While entitlement is still loading, just
      // wait (don't generate) so a free user can't slip through the window.
      if (!purchasesLoading) { setPaywallContext('export'); setShowPaywall(true); }
      return;
    }
    setGeneratingReport(true);
    try {
      const vehicles = await VehicleStorage.getAll();
      const filtered = reportVehicleId === 'all' 
        ? vehicles 
        : vehicles.filter(v => v.id === reportVehicleId);

      if (filtered.length === 0) {
        Alert.alert('no vehicles', 'add a vehicle first to generate a report');
        setGeneratingReport(false);
        return;
      }

      const now = new Date();
      const reportDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Car Story Report — ${reportDate}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f3ef;color:#1a1a1a;padding:24px;max-width:800px;margin:0 auto}
h1{font-size:28px;margin-bottom:4px}
h2{font-size:20px;margin:32px 0 12px;padding-bottom:8px;border-bottom:2px solid #2563eb}
h3{font-size:16px;margin:20px 0 8px;color:#2563eb}
.subtitle{color:#737373;margin-bottom:24px}
.card{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px}
.stat{background:#f9f8f5;border-radius:8px;padding:16px;text-align:center}
.stat .value{font-size:24px;font-weight:700;color:#2563eb}
.stat .label{font-size:12px;color:#737373;margin-top:4px}
table{width:100%;border-collapse:collapse;margin:8px 0}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}
th{font-weight:600;color:#4a4a4a;background:#f9f8f5}
.overdue{color:#dc2626;font-weight:600}
.due-soon{color:#d97706}
.good{color:#059669}
.footer{text-align:center;color:#737373;font-size:12px;margin-top:40px;padding-top:16px;border-top:1px solid #eee}
@media print{body{background:#fff;padding:0}.card{box-shadow:none;border:1px solid #eee}}
</style></head><body>
<h1>🚗 Car Story Report</h1>
<p class="subtitle">Generated ${reportDate} · ${filtered.length} vehicle${filtered.length > 1 ? 's' : ''}</p>`;

      let grandTotalServices = 0;
      let grandTotalFuel = 0;
      let grandTotalCost = 0;

      for (const vehicle of filtered) {
        const services = await ServiceStorage.getByVehicleId(vehicle.id);
        const fuelLogs = await FuelStorage.getByVehicleId(vehicle.id);
        
        const serviceCost = services.reduce((sum, s) => sum + (s.cost || 0), 0);
        const fuelCost = fuelLogs.reduce((sum, f) => sum + (f.totalCost || 0), 0);
        const totalCost = serviceCost + fuelCost;
        const totalGallons = fuelLogs.reduce((sum, f) => sum + (f.gallons || 0), 0);
        
        grandTotalServices += services.length;
        grandTotalFuel += fuelLogs.length;
        grandTotalCost += totalCost;

        const vName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        
        html += `<h2>${escapeHtml(vName)}</h2>`;
        html += `<div class="card"><div class="grid">`;
        html += `<div class="stat"><div class="value">${vehicle.currentMileage?.toLocaleString() || '—'}</div><div class="label">Current Mileage</div></div>`;
        html += `<div class="stat"><div class="value">$${totalCost.toFixed(0)}</div><div class="label">Total Spent</div></div>`;
        html += `<div class="stat"><div class="value">${services.length}</div><div class="label">Services</div></div>`;
        html += `<div class="stat"><div class="value">${fuelLogs.length}</div><div class="label">Fill-ups</div></div>`;
        if (totalGallons > 0) {
          html += `<div class="stat"><div class="value">$${(fuelCost / totalGallons).toFixed(2)}</div><div class="label">Avg $/gal</div></div>`;
        }
        html += `</div></div>`;

        // Service history table
        if (services.length > 0) {
          html += `<h3>Service History</h3><div class="card"><table>`;
          html += `<tr><th>Date</th><th>Service</th><th>Cost</th><th>Mileage</th><th>Notes</th></tr>`;
          const sorted = [...services].sort((a, b) => new Date(b.date) - new Date(a.date));
          for (const s of sorted) {
            const date = s.date ? new Date(s.date).toLocaleDateString() : '—';
            html += `<tr><td>${date}</td><td>${escapeHtml(s.serviceType || s.type || '—')}</td><td>$${(s.cost || 0).toFixed(2)}</td><td>${s.mileage?.toLocaleString() || '—'}</td><td>${escapeHtml(s.notes || '')}</td></tr>`;
          }
          html += `</table></div>`;
        }

        // Fuel history table
        if (fuelLogs.length > 0) {
          html += `<h3>Fuel History</h3><div class="card"><table>`;
          html += `<tr><th>Date</th><th>Gallons</th><th>Cost</th><th>$/gal</th><th>Odometer</th></tr>`;
          const sortedFuel = [...fuelLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
          for (const f of sortedFuel) {
            const date = f.date ? new Date(f.date).toLocaleDateString() : '—';
            const ppg = f.gallons > 0 ? (f.totalCost / f.gallons).toFixed(2) : '—';
            html += `<tr><td>${date}</td><td>${f.gallons?.toFixed(1) || '—'}</td><td>$${(f.totalCost || 0).toFixed(2)}</td><td>$${ppg}</td><td>${f.odometer?.toLocaleString() || '—'}</td></tr>`;
          }
          html += `</table></div>`;
        }

        // Monthly cost breakdown
        const monthlyMap = {};
        services.forEach(s => {
          if (!s.date) return;
          const key = s.date.slice(0, 7);
          monthlyMap[key] = (monthlyMap[key] || 0) + (s.cost || 0);
        });
        fuelLogs.forEach(f => {
          if (!f.date) return;
          const key = f.date.slice(0, 7);
          monthlyMap[key] = (monthlyMap[key] || 0) + (f.totalCost || 0);
        });
        const monthlyEntries = Object.entries(monthlyMap).sort((a, b) => b[0].localeCompare(a[0]));
        if (monthlyEntries.length > 0) {
          html += `<h3>Monthly Cost Summary</h3><div class="card"><table>`;
          html += `<tr><th>Month</th><th>Total Spent</th></tr>`;
          for (const [month, cost] of monthlyEntries) {
            const label = new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            html += `<tr><td>${label}</td><td>$${cost.toFixed(2)}</td></tr>`;
          }
          html += `</table></div>`;
        }
      }

      // Fleet summary if multiple vehicles
      if (filtered.length > 1) {
        html += `<h2>Fleet Summary</h2><div class="card"><div class="grid">`;
        html += `<div class="stat"><div class="value">${filtered.length}</div><div class="label">Vehicles</div></div>`;
        html += `<div class="stat"><div class="value">$${grandTotalCost.toFixed(0)}</div><div class="label">Total Spent</div></div>`;
        html += `<div class="stat"><div class="value">${grandTotalServices}</div><div class="label">Total Services</div></div>`;
        html += `<div class="stat"><div class="value">${grandTotalFuel}</div><div class="label">Total Fill-ups</div></div>`;
        html += `</div></div>`;
      }

      html += `<div class="footer">Generated by Car Story · ${reportDate}</div></body></html>`;

      const filename = `car-story-report-${now.toISOString().slice(0, 10)}.html`;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const w = window.open(url, '_blank');
        if (!w) {
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
        }
        URL.revokeObjectURL(url);
      } else {
        const path = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(path, html);
        await Sharing.shareAsync(path, { mimeType: 'text/html' });
      }
    } catch (error) {
      Alert.alert('report failed', error.message);
    } finally {
      setGeneratingReport(false);
    }
  }, [reportVehicleId, isPro, purchasesLoading]);

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
      <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
        <SettingRow
          icon="moon-outline"
          label="dark mode"
          colors={colors}
          last
          rightElement={
            <AppSwitch
              value={isDark}
              onValueChange={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleTheme();
              }}
              colors={colors}
            />
          }
        />
      </View>

      {/* Units & Currency */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        units
      </Text>
      <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
        <View style={{ paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
            <RowIcon icon="speedometer-outline" colors={colors} />
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

      </View>

      {/* Data */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        your data
      </Text>
      <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
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
          last
        />
      </View>

      {/* Reports */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        reports
      </Text>
      <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
        <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorder }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
            <RowIcon icon="car-outline" colors={colors} />
            <Text style={[Typography.body, { color: colors.textPrimary }]}>vehicle</Text>
          </View>
          <View style={{ paddingLeft: 48 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReportVehicleId('all'); }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.pill,
                    backgroundColor: reportVehicleId === 'all' ? colors.primary + '20' : colors.surface1,
                    borderWidth: 1, borderColor: reportVehicleId === 'all' ? colors.primary : colors.glassBorder,
                  }}
                >
                  <Text style={[Typography.caption, {
                    color: reportVehicleId === 'all' ? colors.primary : colors.textSecondary,
                    fontFamily: reportVehicleId === 'all' ? 'Nunito_700Bold' : 'Nunito_500Medium',
                  }]}>all vehicles</Text>
                </TouchableOpacity>
                {allVehicles.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReportVehicleId(v.id); }}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.pill,
                      backgroundColor: reportVehicleId === v.id ? colors.primary + '20' : colors.surface1,
                      borderWidth: 1, borderColor: reportVehicleId === v.id ? colors.primary : colors.glassBorder,
                    }}
                  >
                    <Text style={[Typography.caption, {
                      color: reportVehicleId === v.id ? colors.primary : colors.textSecondary,
                      fontFamily: reportVehicleId === v.id ? 'Nunito_700Bold' : 'Nunito_500Medium',
                    }]}>{v.nickname || `${v.year} ${v.make}`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          onPress={generateReport}
          disabled={generatingReport}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            paddingVertical: 14, gap: 8,
          }}
        >
          {generatingReport ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          )}
          <Text style={[Typography.body, { color: colors.primary, fontFamily: 'Nunito_600SemiBold' }]}>
            {generatingReport ? 'generating...' : 'generate report'}
          </Text>
          {!isPro && !generatingReport && (
            <View style={{ backgroundColor: colors.primary + '20', borderRadius: Radii.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={[Typography.micro, { fontFamily: 'Nunito_700Bold', color: colors.primary }]}>PRO</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Vehicle Data */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        vehicle database
      </Text>
      <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RowIcon icon="server-outline" colors={colors} />
          <View style={{ flex: 1 }}>
            <Text style={[Typography.body, { color: colors.textPrimary }]}>
              {dbMeta.vehicleCount.toLocaleString()} vehicles{dbMeta.version ? ` · v${dbMeta.version}` : ' · built-in'}
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              {dbMeta.updatedAt ? `updated ${new Date(dbMeta.updatedAt).toLocaleDateString()}` : 'tap update to fetch the latest'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleUpdateDB} disabled={dbUpdating} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.pill, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }}>
            {dbUpdating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[Typography.caption, { color: colors.primary, fontFamily: 'Nunito_700Bold' }]}>update</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Backup — one rolling auto-backup + up to MAX_MANUAL_SNAPSHOTS (3) named
          manual snapshots, stored in the user's own iCloud (mirrored on-device).
          Tap a snapshot to restore it. */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        backup
      </Text>
      <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
        <SettingRow
          icon={backup.iCloud ? 'cloud-done-outline' : 'save-outline'}
          label="auto-backup"
          value={backup.lastBackupAt ? `last: ${new Date(backup.lastBackupAt).toLocaleString()}` : 'not backed up yet'}
          rightElement={<AppSwitch value={backup.autoEnabled} onValueChange={handleToggleAutoBackup} colors={colors} />}
          colors={colors}
        />
        <View style={{ paddingTop: Spacing.md }}>
          <TouchableOpacity style={[Shared.buttonSecondary, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }]} onPress={handleBackupNow} disabled={backingUp} activeOpacity={0.8}>
            {backingUp ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />}
            <Text style={[Typography.caption, { color: colors.primary, fontFamily: 'Nunito_700Bold' }]}>back up now</Text>
          </TouchableOpacity>
        </View>

        {snapshots.length > 0 && (
          <View style={{ marginTop: Spacing.md }}>
            <Text style={[Typography.small, { color: colors.textSecondary, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
              restore a backup
            </Text>
            {snapshots.map((s) => (
              <TouchableOpacity
                key={s.file}
                onPress={() => handleRestoreSnapshot(s)}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: colors.glassBorder }}
              >
                <Ionicons name={s.kind === 'auto' ? 'sync-outline' : 'bookmark-outline'} size={16} color={colors.textSecondary} style={{ marginRight: Spacing.sm }} />
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.caption, { color: colors.textPrimary, fontFamily: 'Nunito_600SemiBold' }]}>
                    {s.label}{s.count != null ? ` · ${s.count} vehicle${s.count === 1 ? '' : 's'}` : ''}
                  </Text>
                  {s.ts > 1 && (
                    <Text style={[Typography.small, { color: colors.textTertiary }]}>{new Date(s.ts).toLocaleString()}</Text>
                  )}
                </View>
                <Text style={[Typography.caption, { color: colors.primary, fontFamily: 'Nunito_600SemiBold' }]}>Restore</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[Typography.small, { color: colors.textTertiary, marginTop: Spacing.sm }]}>
          {backup.iCloud
            ? `Backed up to iCloud — keeps your latest auto-backup plus up to ${MAX_MANUAL_SNAPSHOTS} named snapshots, synced across your devices.`
            : 'On-device backup. Sign in to iCloud (Settings → your name) to sync across devices and survive reinstalls.'}
        </Text>
      </View>

      {/* Pro */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        car story pro
      </Text>
      <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
        {isPro ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RowIcon icon="star" colors={colors} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[Typography.body, { color: colors.textPrimary, fontFamily: 'Nunito_700Bold' }]}>Pro unlocked</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Thanks for your support{isStub ? ' (dev mode)' : ''}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          </View>
        ) : (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
              <RowIcon icon="star-outline" colors={colors} />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body, { color: colors.textPrimary, fontFamily: 'Nunito_600SemiBold' }]}>Unlock everything</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Unlimited vehicles, recall alerts, forecasts, PDF reports</Text>
              </View>
            </View>
            <TouchableOpacity style={[Shared.buttonPrimary, { marginBottom: 0 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setPaywallContext('default'); setShowPaywall(true); }} activeOpacity={0.85}>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#FFFFFF' }}>Unlock Pro — {priceString}</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={purchasesLoading} onPress={async () => { if (purchasesLoading) return; const r = await restore(); Alert.alert(r.success ? 'Restored' : 'Nothing to restore', r.success ? 'Pro is now unlocked.' : (r.error ? 'Could not reach the store. Try again.' : 'No previous purchase found.')); }} style={{ paddingVertical: Spacing.md, alignItems: 'center', opacity: purchasesLoading ? 0.5 : 1 }}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Restore purchase</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Support */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        support
      </Text>
      <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
        <SettingRow
          icon="bug-outline"
          label="Report a bug"
          onPress={() => handleContact('bug')}
          colors={colors}
        />
        <SettingRow
          icon="chatbubble-ellipses-outline"
          label="Send feedback"
          onPress={() => handleContact('feedback')}
          colors={colors}
        />
        <SettingRow
          icon="help-circle-outline"
          label="Help & FAQ"
          onPress={handleHelp}
          colors={colors}
          last
        />
      </View>

      {/* About */}
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }]}>
        about
      </Text>
      <View style={[Shared.card, { paddingVertical: Spacing.sm }]}>
        <SettingRow
          icon="car-sport-outline"
          label="Car Story"
          value={`v${Application.nativeApplicationVersion || '2.1.0'}${Application.nativeBuildVersion ? ` (${Application.nativeBuildVersion})` : ''} · built by TeamAM`}
          colors={colors}
          last
        />
      </View>

      <Text style={[Typography.small, { color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.xl }]}>
        your records stay on your device. we don't run servers or collect your data.
      </Text>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} context={paywallContext} />
    </ScrollView>
  );
}
