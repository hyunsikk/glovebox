import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Colors, Typography, Spacing, Shared } from '../theme';
import { VehicleStorage, ServiceStorage, FuelStorage } from '../lib/storage';
import { getBenchmark, compareToBenchmark } from '../lib/costBenchmarks';
import { useSettings } from '../lib/SettingsContext';

const VERDICT_CONFIG = {
  excellent: { color: Colors.success, emoji: '🏆', label: 'well below average' },
  good: { color: Colors.success, emoji: '✅', label: 'below average' },
  average: { color: Colors.warning, emoji: '📊', label: 'about average' },
  high: { color: Colors.danger, emoji: '⚠️', label: 'above average' },
  'very high': { color: Colors.danger, emoji: '🔴', label: 'well above average' },
};

const ComparisonBar = ({ label, userValue, benchmarkValue, formatFn, color }) => {
  const max = Math.max(userValue, benchmarkValue, 1) * 1.2;
  const userPct = (userValue / max) * 100;
  const benchPct = (benchmarkValue / max) * 100;
  
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={[Typography.caption, { color: Colors.textPrimary }]}>{label}</Text>
        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
          yours: {formatFn(userValue)} · avg: {formatFn(benchmarkValue)}
        </Text>
      </View>
      {/* User bar */}
      <View style={{ height: 8, backgroundColor: Colors.surface3 || Colors.glassBorder, borderRadius: 4, marginBottom: 3 }}>
        <View style={{
          height: 8, borderRadius: 4,
          backgroundColor: color || Colors.primary,
          width: `${Math.min(userPct, 100)}%`,
          minWidth: userValue > 0 ? 4 : 0,
        }} />
      </View>
      {/* Benchmark bar (dimmer) */}
      <View style={{ height: 4, backgroundColor: Colors.surface3 || Colors.glassBorder, borderRadius: 2 }}>
        <View style={{
          height: 4, borderRadius: 2,
          backgroundColor: Colors.textTertiary,
          opacity: 0.5,
          width: `${Math.min(benchPct, 100)}%`,
          minWidth: benchmarkValue > 0 ? 4 : 0,
        }} />
      </View>
    </View>
  );
};

export default function BenchmarkComparison({ vehicles, selectedVehicleId }) {
  const { formatCostShort, currencySymbol } = useSettings();
  const [comparisons, setComparisons] = useState([]);

  useEffect(() => {
    computeBenchmarks();
  }, [vehicles, selectedVehicleId]);

  const computeBenchmarks = async () => {
    try {
      const filterVehicles = selectedVehicleId === 'all'
        ? vehicles
        : vehicles.filter(v => v.id === selectedVehicleId);

      const results = [];

      for (const vehicle of filterVehicles) {
        const services = await ServiceStorage.getByVehicleId(vehicle.id);
        const fuelLogs = await FuelStorage.getByVehicleId(vehicle.id);

        const serviceCost = services.reduce((sum, s) => sum + (s.cost || 0), 0);
        const fuelCost = fuelLogs.reduce((sum, f) => sum + (f.totalCost || 0), 0);
        const totalCost = serviceCost + fuelCost;

        // Calculate time span for annualization
        const allDates = [
          ...services.filter(s => s.date).map(s => new Date(s.date)),
          ...fuelLogs.filter(f => f.date).map(f => new Date(f.date)),
        ];

        if (allDates.length < 2) continue;

        const earliest = new Date(Math.min(...allDates.map(d => d.getTime())));
        const latest = new Date(Math.max(...allDates.map(d => d.getTime())));
        const years = Math.max((latest - earliest) / (365.25 * 24 * 60 * 60 * 1000), 0.25);
        const annualizedCost = totalCost / years;

        // Calculate cost per mile
        const allOdometers = [
          ...services.filter(s => s.mileage > 0).map(s => ({ odo: s.mileage })),
          ...fuelLogs.filter(f => f.odometer > 0).map(f => ({ odo: f.odometer })),
        ].sort((a, b) => a.odo - b.odo);
        
        let costPerMile = null;
        if (allOdometers.length >= 2) {
          const miles = allOdometers[allOdometers.length - 1].odo - allOdometers[0].odo;
          if (miles > 100) costPerMile = totalCost / miles;
        }

        const comparison = compareToBenchmark(vehicle.make, annualizedCost, costPerMile);
        results.push({
          vehicle,
          comparison,
          annualizedCost,
          costPerMile,
          serviceCost,
          fuelCost,
        });
      }

      setComparisons(results);
    } catch (error) {
      console.error('Error computing benchmarks:', error);
    }
  };

  if (comparisons.length === 0) return null;

  return (
    <View style={[Shared.card]}>
      <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
        cost benchmark
      </Text>

      {comparisons.map((item, i) => {
        const { vehicle, comparison, annualizedCost, costPerMile } = item;
        const bench = comparison.benchmark;
        const verdictConfig = VERDICT_CONFIG[comparison.verdict] || VERDICT_CONFIG.average;
        const vName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

        return (
          <View key={vehicle.id} style={{ 
            marginBottom: i < comparisons.length - 1 ? Spacing.lg : 0,
            paddingBottom: i < comparisons.length - 1 ? Spacing.lg : 0,
            borderBottomWidth: i < comparisons.length - 1 ? 1 : 0,
            borderBottomColor: Colors.glassBorder,
          }}>
            {comparisons.length > 1 && (
              <Text style={[Typography.caption, { color: Colors.primary, marginBottom: Spacing.sm }]}>
                {vName}
              </Text>
            )}

            {/* Verdict badge */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: verdictConfig.color + '15',
              borderRadius: 8, padding: Spacing.sm,
              marginBottom: Spacing.md,
            }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>{verdictConfig.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                  {comparison.annualPct > 0 ? '+' : ''}{comparison.annualPct.toFixed(0)}% {verdictConfig.label}
                </Text>
                <Text style={[Typography.small, { color: Colors.textSecondary }]}>
                  your {vehicle.make}: {formatCostShort(annualizedCost)}/yr · avg {vehicle.make}: {formatCostShort(bench.avgAnnualMaintenance)}/yr
                </Text>
              </View>
            </View>

            {/* Comparison bars */}
            <ComparisonBar
              label="annual cost"
              userValue={annualizedCost}
              benchmarkValue={bench.avgAnnualMaintenance}
              formatFn={formatCostShort}
              color={comparison.annualPct > 15 ? Colors.danger : comparison.annualPct < -5 ? Colors.success : Colors.primary}
            />

            {costPerMile != null && bench.avgCostPerMile > 0 && (
              <ComparisonBar
                label="cost per mile"
                userValue={costPerMile}
                benchmarkValue={bench.avgCostPerMile}
                formatFn={(v) => `${currencySymbol}${v.toFixed(2)}`}
                color={comparison.milePct > 15 ? Colors.danger : comparison.milePct < -5 ? Colors.success : Colors.primary}
              />
            )}

            {/* Reliability note */}
            {bench.reliability && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm }}>
                <Text style={[Typography.small, { color: Colors.textTertiary }]}>
                  {vehicle.make} reliability: {'⭐'.repeat(Math.min(Math.round(bench.reliability / 2), 5))} ({bench.reliability}/10)
                </Text>
              </View>
            )}
          </View>
        );
      })}

      <Text style={[Typography.small, { color: Colors.textTertiary, marginTop: Spacing.sm }]}>
        benchmarks based on AAA & RepairPal industry averages
      </Text>
    </View>
  );
}
