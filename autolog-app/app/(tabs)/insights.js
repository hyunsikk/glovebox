import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors, Typography, Spacing, Shared } from '../../theme';
import { VehicleStorage, ServiceStorage, DataUtils } from '../../lib/storage';
import { HealthScore, CostAnalytics, FleetAnalytics, ServiceDue } from '../../lib/analytics';
import AdBanner from '../../components/AdBanner';
import { ProLockedCard } from '../../components/ProGate';

const MetricCard = ({ title, value, subtitle, icon, color = Colors.primary, trend = null }) => (
  <View style={[Shared.card, { flex: 1, marginRight: Spacing.md, position: 'relative' }]}>
    {/* Subtle colored glow behind icon */}
    <View style={{
      position: 'absolute',
      top: 12,
      left: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: color,
      opacity: 0.1,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    }} />
    
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
      <View style={{
        backgroundColor: color + '20',
        borderRadius: 20,
        padding: 8,
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: color + '30',
      }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      
      <Text style={[Typography.caption, { color: Colors.textSecondary, flex: 1, fontSize: 12 }]}>
        {title}
      </Text>
      
      {trend && (
        <Ionicons 
          name={trend > 0 ? "trending-up" : "trending-down"} 
          size={16} 
          color={trend > 0 ? Colors.success : Colors.danger} 
        />
      )}
    </View>
    
    {/* Larger value text */}
    <Text style={[Typography.hero, { 
      color: Colors.textPrimary, 
      marginBottom: 4,
      fontSize: 28,
      fontFamily: 'Nunito_700Bold',
    }]}>
      {value}
    </Text>
    
    {subtitle && (
      <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
        {subtitle}
      </Text>
    )}
  </View>
);

const ChartCard = ({ title, data, type = 'bar' }) => {
  const maxValue = Math.max(...data.map(d => d.value || d.cost || d.predictedCost || 0));
  
  return (
    <View style={[Shared.card, { marginBottom: Spacing.lg }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }}>
        <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
          {title}
        </Text>
        
        <View style={{ width: 20 }} />
      </View>

      {/* Premium Bar Chart with gradients */}
      <View style={{ 
        height: 140,
        backgroundColor: Colors.surface1 + '40', 
        borderRadius: 12, 
        padding: Spacing.sm,
        position: 'relative',
      }}>
        {/* Subtle grid lines */}
        {[0.25, 0.5, 0.75, 1].map((fraction, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: Spacing.sm,
              right: Spacing.sm,
              top: Spacing.sm + (120 * (1 - fraction)),
              height: 1,
              backgroundColor: Colors.glassBorder,
              opacity: 0.3,
            }}
          />
        ))}
        
        {data.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, paddingTop: 10 }}>
            {data.slice(-6).map((item, index) => {
              const value = item.value || item.cost || item.predictedCost || 0;
              const height = maxValue > 0 ? (value / maxValue) * 100 + 5 : 5;
              
              return (
                <View key={index} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <View style={{
                    width: '70%',
                    height,
                    background: value > 0 ? `linear-gradient(to bottom, ${Colors.primary}, transparent)` : Colors.surface1,
                    backgroundColor: value > 0 ? Colors.primary : Colors.surface1,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    marginBottom: Spacing.xs,
                    opacity: value > 0 ? 0.8 : 0.3,
                  }} />
                  
                  <Text style={[Typography.small, { 
                    color: Colors.textSecondary, 
                    fontSize: 9,
                    textAlign: 'center',
                  }]}>
                    {item.label || (() => {
                      if (!item.month) return `M${index + 1}`;
                      const [y, m] = item.month.split('-');
                      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                      return `${monthNames[parseInt(m) - 1]}\n${y}`;
                    })()}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="chart-bar" size={32} color={Colors.textTertiary} style={{ marginBottom: 8 }} />
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              no data yet
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const VehicleHealthCard = ({ vehicle, overdueServices, dueSoonServices }) => {
  const overdueCount = overdueServices.length;
  const dueSoonCount = dueSoonServices.length;
  const statusColor = overdueCount > 0 ? Colors.danger : dueSoonCount > 0 ? Colors.warning : Colors.success;

  return (
    <View style={[Shared.card, { marginBottom: Spacing.lg, borderLeftWidth: 3, borderLeftColor: statusColor }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: overdueCount > 0 || dueSoonCount > 0 ? Spacing.md : 0 }}>
        {/* Status badge */}
        <View style={{
          backgroundColor: statusColor + '18',
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 6,
          marginRight: Spacing.md,
          borderWidth: 1,
          borderColor: statusColor + '30',
          alignItems: 'center',
          minWidth: 44,
        }}>
          {overdueCount > 0 ? (
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: Colors.danger }}>{overdueCount}</Text>
          ) : dueSoonCount > 0 ? (
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: Colors.warning }}>{dueSoonCount}</Text>
          ) : (
            <Ionicons name="checkmark" size={18} color={Colors.success} />
          )}
          <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 8, color: statusColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {overdueCount > 0 ? 'overdue' : dueSoonCount > 0 ? 'due' : 'good'}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {vehicle.currentMileage?.toLocaleString() || '---'} miles
          </Text>
        </View>
      </View>

      {/* List overdue/due soon services */}
      {(overdueCount > 0 || dueSoonCount > 0) && (
        <View style={{
          backgroundColor: Colors.surface1 + '60',
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}>
          {overdueServices.map((s, i) => (
            <View key={`o${i}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < overdueCount - 1 || dueSoonCount > 0 ? 4 : 0 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger, marginRight: 8 }} />
              <Text style={[Typography.caption, { color: Colors.danger }]}>{s.service} — overdue</Text>
            </View>
          ))}
          {dueSoonServices.map((s, i) => (
            <View key={`d${i}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < dueSoonCount - 1 ? 4 : 0 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.warning, marginRight: 8 }} />
              <Text style={[Typography.caption, { color: Colors.warning }]}>{s.service} — {s.daysUntilDue === 0 ? 'due today' : `in ${s.daysUntilDue}d`}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const EmptyState = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.horizontalLarge,
  }}>
    <Text style={{ fontSize: 60, marginBottom: Spacing.xl }}>📊</Text>
    
    <Text style={[Typography.hero, { 
      textAlign: 'center', 
      marginBottom: Spacing.md,
      color: Colors.textPrimary,
    }]}>
      no insights yet
    </Text>
    
    <Text style={[Typography.body, { 
      textAlign: 'center', 
      color: Colors.textSecondary, 
      marginBottom: Spacing.section,
      lineHeight: 22,
    }]}>
      add a vehicle and log some services to see your personalized maintenance analytics.
    </Text>
  </View>
);

export default function InsightsScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [fleetSummary, setFleetSummary] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [costPredictions, setCostPredictions] = useState([]);
  const [vehicleInsights, setVehicleInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [])
  );

  const loadInsights = async () => {
    try {
      setLoading(true);
      const vehicleList = await VehicleStorage.getAll();
      setVehicles(vehicleList);

      if (vehicleList.length === 0) {
        setLoading(false);
        return;
      }

      // Load fleet summary
      const summary = await FleetAnalytics.getFleetSummary();
      setFleetSummary(summary);

      // Load monthly trends for all vehicles
      const trends = await CostAnalytics.getMonthlyTrends();
      setMonthlyTrends(trends);

      // Load cost predictions for first vehicle (or combined)
      if (vehicleList.length > 0) {
        const predictions = await CostAnalytics.getCostPrediction(vehicleList[0].id);
        setCostPredictions(predictions);
      }

      // Load individual vehicle insights with overdue counts
      const insights = await Promise.all(
        vehicleList.map(async (vehicle) => {
          const upcoming = await ServiceDue.getUpcomingServices(vehicle.id, 30);
          const overdueServices = upcoming.filter(s => s.isOverdue);
          const dueSoonServices = upcoming.filter(s => !s.isOverdue && s.daysUntilDue <= 14);
          
          return {
            vehicle,
            overdueServices,
            dueSoonServices,
          };
        })
      );
      
      setVehicleInsights(insights);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Get all data for export
      const [vehiclesData, servicesData] = await Promise.all([
        VehicleStorage.getAll(),
        ServiceStorage.getAll(),
      ]);

      const exportData = {
        vehicles: vehiclesData,
        services: servicesData,
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        totalVehicles: vehiclesData.length,
        totalServices: servicesData.length,
      };

      const fileName = `glovebox-export-${new Date().toISOString().split('T')[0]}.json`;
      const jsonString = JSON.stringify(exportData, null, 2);

      if (Platform.OS === 'web') {
        // Web: Create a downloadable blob
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert(
          'Export Complete',
          'Your data has been downloaded as a JSON file.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        // Native: Use expo-sharing
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Glovebox Data',
          });
        } else {
          Alert.alert(
            'Export Complete',
            `Your data has been saved to:\n${fileUri}`,
            [{ text: 'OK', style: 'default' }]
          );
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        'There was an error exporting your data. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const calculateCostPerMile = () => {
    if (!fleetSummary || !vehicles.length) return '$0.00';
    
    const totalMiles = vehicles.reduce((sum, v) => 
      sum + (v.currentMileage - (v.initialMileage || v.currentMileage)), 0
    );
    
    return totalMiles > 0 ? `$${(fleetSummary.totalCost / totalMiles).toFixed(3)}` : '$0.00';
  };

  const getNextMaintenanceCost = () => {
    const nextMonth = costPredictions.find(p => p.predictedCost > 0);
    return nextMonth ? `$${nextMonth.predictedCost.toFixed(0)}` : '$0';
  };

  if (loading) {
    return (
      <View style={[Shared.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[Typography.body, { color: Colors.textSecondary }]}>
          Analyzing your data...
        </Text>
      </View>
    );
  }

  if (vehicles.length === 0) {
    return (
      <View style={Shared.container}>
        <EmptyState />
      </View>
    );
  }

  return (
    <View style={Shared.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.lg, paddingBottom: 100 }}
      >
        {/* Key Metrics Row */}
        <View style={{ flexDirection: 'row', marginBottom: Spacing.lg }}>
          <MetricCard
            title="total spent"
            value={`$${fleetSummary?.totalCost.toFixed(0) || '0'}`}
            subtitle="all time"
            icon="cash-outline"
            color={Colors.success}
          />
          
          <MetricCard
            title="cost per mile"
            value={calculateCostPerMile()}
            subtitle="average"
            icon="speedometer-outline"
            color={Colors.primary}
          />
        </View>

        <View style={{ flexDirection: 'row', marginBottom: Spacing.lg }}>
          <MetricCard
            title="overdue"
            value={`${vehicleInsights.reduce((sum, v) => sum + v.overdueServices.length, 0)}`}
            subtitle={vehicleInsights.reduce((sum, v) => sum + v.overdueServices.length, 0) === 0 ? 'all caught up' : 'need attention'}
            icon="alert-circle-outline"
            color={vehicleInsights.reduce((sum, v) => sum + v.overdueServices.length, 0) > 0 ? Colors.danger : Colors.success}
          />
          
          <MetricCard
            title="services"
            value={`${fleetSummary?.totalServices || 0}`}
            subtitle="all time"
            icon="build-outline"
            color={Colors.warning}
          />
        </View>

        {/* Monthly Spending Chart */}
        <ChartCard
          title="monthly spending"
          data={monthlyTrends}
          type="bar"
        />

        {/* Ad Banner */}
        <AdBanner />

        {/* Individual Vehicle Health */}
        <Text style={[Typography.h1, { color: Colors.textPrimary, marginBottom: Spacing.lg }]}>
          vehicle health
        </Text>

        {vehicleInsights.map((insight) => (
          <VehicleHealthCard
            key={insight.vehicle.id}
            vehicle={insight.vehicle}
            overdueServices={insight.overdueServices}
            dueSoonServices={insight.dueSoonServices}
          />
        ))}

        {/* Quick Stats */}
        <View style={[Shared.card, { marginBottom: Spacing.lg }]}>
          <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
            quick stats
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
            <Text style={[Typography.body, { color: Colors.textSecondary }]}>
              vehicles tracked
            </Text>
            <Text style={[Typography.body, { color: Colors.textPrimary }]}>
              {fleetSummary?.totalVehicles || 0}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
            <Text style={[Typography.body, { color: Colors.textSecondary }]}>
              needing attention
            </Text>
            <Text style={[Typography.body, { 
              color: vehicleInsights.filter(v => v.overdueServices.length > 0).length > 0 ? Colors.danger : Colors.success 
            }]}>
              {vehicleInsights.filter(v => v.overdueServices.length > 0).length} vehicle{vehicleInsights.filter(v => v.overdueServices.length > 0).length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[Typography.body, { color: Colors.textSecondary }]}>
              total miles tracked
            </Text>
            <Text style={[Typography.body, { color: Colors.textPrimary }]}>
              {vehicles.reduce((sum, v) => 
                sum + (v.currentMileage || 0), 0
              ).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Data Export */}
        <View style={[Shared.card, { marginBottom: Spacing.lg }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
            <View style={{
              backgroundColor: Colors.warning + '20',
              borderRadius: 20,
              padding: 12,
              marginRight: Spacing.md,
              borderWidth: 1,
              borderColor: Colors.warning + '30',
            }}>
              <Ionicons name="download-outline" size={24} color={Colors.warning} />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
                export your data
              </Text>
              <Text style={[Typography.body, { color: Colors.textSecondary, marginTop: 4 }]}>
                download all vehicles and service records as JSON
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[Shared.buttonSecondary, { marginBottom: 0 }]}
            onPress={handleExportData}
            activeOpacity={0.9}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="share-outline" size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
              <Text style={[Typography.h2, { color: Colors.primary }]}>
                export data
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={[Typography.caption, { 
            color: Colors.textTertiary, 
            marginTop: Spacing.sm, 
            textAlign: 'center',
            lineHeight: 16,
          }]}>
            backup your data or transfer to another device • includes {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} & {fleetSummary?.totalServices || 0} service{(fleetSummary?.totalServices || 0) !== 1 ? 's' : ''}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}