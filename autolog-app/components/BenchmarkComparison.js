import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shared } from '../theme';
import { ServiceStorage, FuelStorage } from '../lib/storage';
import { getBenchmark } from '../lib/costBenchmarks';
import { useSettings } from '../lib/SettingsContext';

const ComparisonBar = ({ label, userValue, avgValue, formatValue, lowerIsBetter = true }) => {
  const maxVal = Math.max(userValue, avgValue, 0.01);
  const userPct = (userValue / maxVal) * 100;
  const avgPct = (avgValue / maxVal) * 100;
  const isBetter = lowerIsBetter ? userValue <= avgValue : userValue >= avgValue;

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>{label}</Text>
        <Text style={[Typography.caption, { color: isBetter ? Colors.success : Colors.danger, fontFamily: 'Nunito_600SemiBold' }]}>
          {isBetter ? 'below avg' : 'above avg'}
        </Text>
      </View>
      {/* User bar */}
      <View style={{ marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={[Typography.small, { color: Colors.textSecondary, width: 40 }]}>you</Text>
          <View style={{ flex: 1, height: 16, backgroundColor: Colors.surface3, borderRadius: 8, overflow: 'hidden' }}>
            <View style={{
              height: 16, borderRadius: 8,
              backgroundColor: isBetter ? Colors.success : Colors.danger,
              width: `${Math.max(userPct, 3)}%`,
              justifyContent: 'center', paddingHorizontal: 6,
            }}>
              <Text style={{ fontSize: 9, color: '#fff', fontFamily: 'Nunito_600SemiBold' }}>
                {formatValue(userValue)}
              </Text>
            </View>
          </View>
        </View>
        {/* Average bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[Typography.small, { color: Colors.textTertiary, width: 40 }]}>avg</Text>
          <View style={{ flex: 1, height: 16, backgroundColor: Colors.surface3, borderRadius: 8, overflow: 'hidden' }}>
            <View style={{
              height: 16, borderRadius: 8,
              backgroundColor: Colors.textTertiary,
              opacity: 0.5,
              width: `${Math.max(avgPct, 3)}%`,
              justifyContent: 'center', paddingHorizontal: 6,
            }}>
              <Text style={{ fontSize: 9, color: Colors.textPrimary, fontFamily: 'Nunito_600SemiBold' }}>
                {formatValue(avgValue)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const BenchmarkComparison = ({ vehicles, selectedVehicleId }) => {
  const { formatCostShort, formatDistanceUnit } = useSettings();
  const [benchmarkData, setBenchmarkData] = useState(null);

  useEffect(() => {
    calculateBenchmarks();
  }, [vehicles, selectedVehicleId]);

  const calculateBenchmarks = async () => {
    try {
      const filterVehicles = selectedVehicleId === 'all'
        ? vehicles
        : vehicles.filter(v => v.id === selectedVehicleId);

      // Find a vehicle with a known make benchmark
      let targetVehicle = null;
      let benchmark = null;
      for (const v of filterVehicles) {
        const b = getBenchmark(v.make);
        if (b) {
          targetVehicle = v;
          benchmark = b;
          break;
        }
      }

      if (!targetVehicle || !benchmark) {
        setBenchmarkData(null);
        return;
      }

      // Calculate user's cost per mile
      const services = await ServiceStorage.getByVehicleId(targetVehicle.id);
      const fuelLogs = await FuelStorage.getByVehicleId(targetVehicle.id);

      const totalServiceCost = services.reduce((sum, s) => sum + (s.cost || 0), 0);
      const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (f.totalCost || 0), 0);
      const totalCost = totalServiceCost + totalFuelCost;

      const milesDriven = Math.max(0, (targetVehicle.currentMileage || 0) - (targetVehicle.initialMileage || 0));
      const userCostPerMile = milesDriven > 100 ? totalCost / milesDriven : null;

      // Calculate user's annual maintenance (annualize from data span)
      const allDates = [
        ...services.map(s => new Date(s.date)),
        ...fuelLogs.map(f => new Date(f.date)),
      ].filter(d => !isNaN(d.getTime()));

      let userAnnualMaintenance = null;
      if (allDates.length >= 2) {
        const earliest = Math.min(...allDates.map(d => d.getTime()));
        const latest = Math.max(...allDates.map(d => d.getTime()));
        const yearsSpan = (latest - earliest) / (365.25 * 24 * 60 * 60 * 1000);
        if (yearsSpan >= 0.25) {
          userAnnualMaintenance = totalServiceCost / yearsSpan;
        }
      }

      setBenchmarkData({
        vehicle: targetVehicle,
        benchmark,
        userCostPerMile,
        userAnnualMaintenance,
      });
    } catch (error) {
      console.error('Error calculating benchmarks:', error);
    }
  };

  if (!benchmarkData) return null;

  const { vehicle, benchmark, userCostPerMile, userAnnualMaintenance } = benchmarkData;
  const distUnit = formatDistanceUnit();

  return (
    <View style={[Shared.card, { marginBottom: Spacing.lg }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
        <View style={{
          backgroundColor: Colors.primary + '20',
          borderRadius: 20, padding: 10, marginRight: Spacing.md,
          borderWidth: 1, borderColor: Colors.primary + '30',
        }}>
          <Ionicons name="stats-chart-outline" size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            cost benchmarks
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            your {vehicle.make} vs national average
          </Text>
        </View>
        {/* Reliability badge */}
        <View style={{
          backgroundColor: benchmark.reliability >= 7 ? Colors.success + '15' : benchmark.reliability >= 5 ? Colors.warning + '15' : Colors.danger + '15',
          borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
          borderWidth: 1,
          borderColor: benchmark.reliability >= 7 ? Colors.success + '30' : benchmark.reliability >= 5 ? Colors.warning + '30' : Colors.danger + '30',
        }}>
          <Text style={[Typography.small, {
            color: benchmark.reliability >= 7 ? Colors.success : benchmark.reliability >= 5 ? Colors.warning : Colors.danger,
            fontFamily: 'Nunito_600SemiBold',
          }]}>
            {benchmark.reliability}/10 reliability
          </Text>
        </View>
      </View>

      {userCostPerMile !== null && (
        <ComparisonBar
          label={`cost per ${distUnit}`}
          userValue={userCostPerMile}
          avgValue={benchmark.avgCostPerMile}
          formatValue={(v) => formatCostShort(v)}
        />
      )}

      {userAnnualMaintenance !== null && (
        <ComparisonBar
          label="estimated annual maintenance"
          userValue={userAnnualMaintenance}
          avgValue={benchmark.avgAnnualMaintenance}
          formatValue={(v) => formatCostShort(v)}
        />
      )}

      {/* Quick headline */}
      {userCostPerMile !== null && (
        <View style={{
          backgroundColor: Colors.surface1 + '60', borderRadius: 12,
          padding: Spacing.md, borderWidth: 1, borderColor: Colors.glassBorder,
        }}>
          <Text style={[Typography.caption, { color: Colors.textSecondary, textAlign: 'center' }]}>
            your {vehicle.make} costs{' '}
            <Text style={{ color: Colors.textPrimary, fontFamily: 'Nunito_600SemiBold' }}>
              {formatCostShort(userCostPerMile)}/{distUnit}
            </Text>
            {' — '}average is{' '}
            <Text style={{ color: Colors.textPrimary, fontFamily: 'Nunito_600SemiBold' }}>
              {formatCostShort(benchmark.avgCostPerMile)}/{distUnit}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
};

export default BenchmarkComparison;
