import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Alert, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Typography, Spacing, Shared } from '../../theme';
import { VehicleStorage, ServiceStorage, IssueStorage, FuelStorage, SettingsStorage, DataUtils } from '../../lib/storage';
import { HealthScore, ServiceDue } from '../../lib/analytics';
import { addSampleData } from '../../lib/sampleData';
import AddVehicleModal from '../../components/AddVehicleModal';
import VehicleDetailModal from '../../components/VehicleDetailModal';
import LogServiceModal from '../../components/LogServiceModal';
import OnboardingModal from '../../components/OnboardingModal';
import { HealthScoreDialSmall } from '../../components/HealthScoreDial';
import { Modal, Switch } from 'react-native';

const VehicleCard = ({ vehicle, onPress, onToggleFavorite }) => {
  const [overdueServices, setOverdueServices] = useState([]);
  const [dueSoonServices, setDueSoonServices] = useState([]);
  const [nextService, setNextService] = useState(null);
  const [openIssuesCount, setOpenIssuesCount] = useState(0);
  const scaleValue = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadVehicleData();
  }, [vehicle.id]);

  const loadVehicleData = async () => {
    try {
      const upcoming = await ServiceDue.getUpcomingServices(vehicle.id, 30);
      const overdue = upcoming.filter(s => s.isOverdue);
      const dueSoon = upcoming.filter(s => !s.isOverdue && s.daysUntilDue <= 14);
      
      setOverdueServices(overdue);
      setDueSoonServices(dueSoon);
      setNextService(upcoming[0] || null);

      // Load open issues count
      const openIssues = await IssueStorage.getOpenByVehicleId(vehicle.id);
      setOpenIssuesCount(openIssues.length);
    } catch (error) {
      console.error('Error loading vehicle data:', error);
    }
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    
    // Premium spring animation on press
    Animated.spring(scaleValue, {
      toValue: 0.98,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    });

    onPress(vehicle);
  };

  const getServiceStatusColor = () => {
    if (overdueServices.length > 0) return Colors.danger;
    if (dueSoonServices.length > 0) return Colors.warning;
    if (!nextService) return Colors.success;
    return Colors.success;
  };

  const getServiceStatusText = () => {
    if (!nextService) return 'all caught up! 🎉';
    if (nextService.isOverdue) return `${nextService.service} overdue`;
    if (nextService.daysUntilDue === 0) return `${nextService.service} due today`;
    if (nextService.daysUntilDue <= 7) return `${nextService.service} due in ${nextService.daysUntilDue}d`;
    return `next: ${nextService.service}`;
  };

  const getVehicleIcon = () => {
    // Make-specific emoji or first letter in colored circle
    const makeColors = {
      'Toyota': '#FF0000',
      'Honda': '#0066CC', 
      'Ford': '#0066FF',
      'Chevrolet': '#FFD700',
      'BMW': '#000000',
      'Mercedes': '#C0C0C0',
      'Audi': '#FF0000',
    };
    
    const color = makeColors[vehicle.make] || Colors.primary;
    const firstLetter = (vehicle.make || 'C')[0].toUpperCase();
    
    return (
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: color + '20',
        borderWidth: 1,
        borderColor: color + '40',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={[Typography.caption, { 
          color: color, 
          fontFamily: 'Nunito_700Bold',
        }]}>
          {firstLetter}
        </Text>
      </View>
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={[Shared.cardPrimary, { marginBottom: Spacing.lg }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Favorite Star */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite && onToggleFavorite(vehicle);
          }}
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            zIndex: 10,
            padding: 4,
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={vehicle.isFavorite ? 'star' : 'star-outline'}
            size={18}
            color={vehicle.isFavorite ? Colors.warning : Colors.textTertiary}
          />
        </TouchableOpacity>

        {/* Subtle gradient accent line at top */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: getServiceStatusColor(),
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          opacity: 0.7,
        }} />
        
        {/* Vehicle Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
              {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <MaterialCommunityIcons 
                name="speedometer" 
                size={12} 
                color={Colors.textSecondary} 
                style={{ marginRight: 4 }}
              />
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                {vehicle.currentMileage?.toLocaleString() || '---'} miles
              </Text>
            </View>
          </View>
          
          {/* Vehicle Photo */}
          {vehicle.photoUri && (
            <Image
              source={{ uri: vehicle.photoUri }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: Colors.glassBorder,
              }}
            />
          )}

          {/* Open Issues Badge */}
          {openIssuesCount > 0 && (
            <View style={{ 
              marginLeft: Spacing.sm,
              alignItems: 'center',
              backgroundColor: '#EF4444' + '15',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: '#EF4444' + '30',
              minWidth: 32,
            }}>
              <Text style={{
                fontFamily: 'Nunito_700Bold',
                fontSize: 12,
                color: '#EF4444',
                lineHeight: 14,
              }}>
                🚨
              </Text>
              <Text style={{
                fontFamily: 'Nunito_600SemiBold',
                fontSize: 8,
                color: '#EF4444',
                lineHeight: 10,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                {openIssuesCount} issue{openIssuesCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          
          {/* Service Status Badge */}
          <View style={{ 
            marginLeft: Spacing.md, 
            alignItems: 'center',
            backgroundColor: getServiceStatusColor() + '15',
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: getServiceStatusColor() + '30',
          }}>
            {overdueServices.length > 0 ? (
              <>
                <Text style={{
                  fontFamily: 'Nunito_700Bold',
                  fontSize: 18,
                  color: Colors.danger,
                  lineHeight: 22,
                }}>
                  {overdueServices.length}
                </Text>
                <Text style={{
                  fontFamily: 'Nunito_500Medium',
                  fontSize: 9,
                  color: Colors.danger,
                  lineHeight: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  overdue
                </Text>
              </>
            ) : dueSoonServices.length > 0 ? (
              <>
                <Text style={{
                  fontFamily: 'Nunito_700Bold',
                  fontSize: 18,
                  color: Colors.warning,
                  lineHeight: 22,
                }}>
                  {dueSoonServices.length}
                </Text>
                <Text style={{
                  fontFamily: 'Nunito_500Medium',
                  fontSize: 9,
                  color: Colors.warning,
                  lineHeight: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  due soon
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color={Colors.success} />
                <Text style={{
                  fontFamily: 'Nunito_500Medium',
                  fontSize: 9,
                  color: Colors.success,
                  lineHeight: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  good
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Next Service Status */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surface1 + '60',
          padding: Spacing.md,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: getServiceStatusColor(),
            marginRight: Spacing.sm,
          }} />
          
          <View style={{ flex: 1 }}>
            <Text style={[Typography.body, { color: Colors.textPrimary }]}>
              {getServiceStatusText()}
            </Text>
            
            {nextService && nextService.daysUntilDue > 0 && (
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                in {nextService.daysUntilDue} days
              </Text>
            )}
          </View>

          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={Colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = ({ onAddVehicle, onLoadSampleData }) => {
  const breathingValue = useState(new Animated.Value(0.98))[0];

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingValue, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingValue, {
          toValue: 0.98,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    breathingAnimation.start();
    
    return () => breathingAnimation.stop();
  }, []);

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.horizontalLarge,
      // Subtle radial gradient background effect using overlays
    }}>
      {/* Atmospheric background gradient effect */}
      <View style={{
        position: 'absolute',
        top: '30%',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: Colors.primary,
        opacity: 0.03,
      }} />
      
      <Animated.View style={[{ 
        transform: [{ scale: breathingValue }],
        marginBottom: Spacing.xl,
      }]}>
        <Text style={{ fontSize: 60 }}>🚗</Text>
      </Animated.View>
      
      <Text style={[Typography.hero, { 
        textAlign: 'center', 
        marginBottom: Spacing.md,
        color: Colors.textPrimary,
      }]}>
        what do you drive?
      </Text>
      
      <Text style={[Typography.body, { 
        textAlign: 'center', 
        color: Colors.textSecondary, 
        marginBottom: Spacing.section,
        lineHeight: 22,
      }]}>
        get instant access to manufacturer maintenance schedules and smart cost tracking.
      </Text>

      <TouchableOpacity
        style={[Shared.buttonPrimary, { width: '100%', maxWidth: 280 }]}
        onPress={onAddVehicle}
        activeOpacity={0.9}
      >
        <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
          add your vehicle
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[Shared.buttonSecondary, { marginTop: Spacing.md, width: '100%', maxWidth: 280 }]}
        onPress={onLoadSampleData}
        activeOpacity={0.9}
      >
        <Text style={[Typography.h2, { color: Colors.primary }]}>
          try sample data
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const DashboardSummary = ({ vehicles }) => {
  const [summaryData, setSummaryData] = useState({
    totalVehicles: 0,
    openIssuesCount: 0,
    nextServiceDue: null,
    thisMonthSpending: 0
  });

  useEffect(() => {
    loadSummaryData();
  }, [vehicles]);

  const loadSummaryData = async () => {
    try {
      const totalVehicles = vehicles.length;
      
      // Count open issues across all vehicles
      let openIssuesCount = 0;
      for (const vehicle of vehicles) {
        const issues = await IssueStorage.getOpenByVehicleId(vehicle.id);
        openIssuesCount += issues.length;
      }

      // Find next service due (soonest across all vehicles)
      let nextServiceDue = null;
      let soonestDays = Infinity;

      for (const vehicle of vehicles) {
        try {
          const upcoming = await ServiceDue.getUpcomingServices(vehicle.id, 30);
          if (upcoming.length > 0) {
            const service = upcoming[0];
            const daysUntil = service.isOverdue ? 0 : service.daysUntilDue || 0;
            if (daysUntil < soonestDays) {
              soonestDays = daysUntil;
              nextServiceDue = {
                service: service.service,
                vehicleName: vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                daysUntilDue: daysUntil,
                isOverdue: service.isOverdue
              };
            }
          }
        } catch (error) {
          console.error('Error loading upcoming services:', error);
        }
      }

      // Calculate this month's spending (services + fuel)
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      let thisMonthSpending = 0;

      for (const vehicle of vehicles) {
        // Services this month
        const services = await ServiceStorage.getByVehicleId(vehicle.id);
        const thisMonthServices = services.filter(s => {
          const serviceDate = new Date(s.date);
          return serviceDate.getMonth() === thisMonth && serviceDate.getFullYear() === thisYear;
        });
        thisMonthSpending += thisMonthServices.reduce((sum, s) => sum + (s.cost || 0), 0);

        // Fuel this month
        const fuelLogs = await FuelStorage.getByVehicleId(vehicle.id);
        const thisMonthFuel = fuelLogs.filter(f => {
          const fuelDate = new Date(f.date);
          return fuelDate.getMonth() === thisMonth && fuelDate.getFullYear() === thisYear;
        });
        thisMonthSpending += thisMonthFuel.reduce((sum, f) => sum + (f.totalCost || 0), 0);
      }

      setSummaryData({
        totalVehicles,
        openIssuesCount,
        nextServiceDue,
        thisMonthSpending
      });
    } catch (error) {
      console.error('Error loading summary data:', error);
    }
  };

  if (vehicles.length === 0) return null;

  return (
    <View style={[Shared.cardPrimary, { marginBottom: Spacing.xl }]}>
      <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.lg }]}>
        dashboard summary
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Total Vehicles */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[Typography.h1, { color: Colors.primary }]}>
            {summaryData.totalVehicles}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary, textAlign: 'center' }]}>
            vehicles
          </Text>
        </View>

        {/* Open Issues */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[Typography.h1, { color: summaryData.openIssuesCount > 0 ? Colors.danger : Colors.success }]}>
            {summaryData.openIssuesCount}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary, textAlign: 'center' }]}>
            open issues
          </Text>
        </View>

        {/* This Month Spending */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[Typography.h1, { color: Colors.textPrimary }]}>
            ${summaryData.thisMonthSpending.toFixed(0)}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary, textAlign: 'center' }]}>
            this month
          </Text>
        </View>
      </View>

      {/* Next Service Due */}
      {summaryData.nextServiceDue && (
        <View style={{
          marginTop: Spacing.lg,
          padding: Spacing.md,
          backgroundColor: Colors.surface1 + '60',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: summaryData.nextServiceDue.isOverdue ? Colors.danger : Colors.warning,
              marginRight: Spacing.sm,
            }} />
            <View style={{ flex: 1 }}>
              <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                {summaryData.nextServiceDue.service} • {summaryData.nextServiceDue.vehicleName}
              </Text>
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                {summaryData.nextServiceDue.isOverdue ? 'Overdue' : `Due in ${summaryData.nextServiceDue.daysUntilDue} days`}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const SettingsModal = ({ visible, onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTiming, setNotificationTiming] = useState(7);

  useEffect(() => {
    loadThemePreference();
    loadNotificationSettings();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme_mode');
      setIsDarkMode(savedTheme !== 'light');
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settings = await SettingsStorage.get();
      setNotificationsEnabled(settings.notifications !== false);
      setNotificationTiming(settings.notificationTiming || 7);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleThemeToggle = async (value) => {
    try {
      setIsDarkMode(value);
      await AsyncStorage.setItem('@theme_mode', value ? 'dark' : 'light');
      Haptics.selectionAsync();
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const handleNotificationToggle = async (value) => {
    try {
      setNotificationsEnabled(value);
      await SettingsStorage.update({ notifications: value });
      Haptics.selectionAsync();
      if (value) {
        const { scheduleServiceNotifications } = require('../../lib/notifications');
        await scheduleServiceNotifications();
      } else {
        const { cancelAllNotifications } = require('../../lib/notifications');
        await cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  const handleTimingChange = async (days) => {
    try {
      setNotificationTiming(days);
      await SettingsStorage.update({ notificationTiming: days });
      Haptics.selectionAsync();
      if (notificationsEnabled) {
        const { scheduleServiceNotifications } = require('../../lib/notifications');
        await scheduleServiceNotifications();
      }
    } catch (error) {
      console.error('Error saving notification timing:', error);
    }
  };

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExportData = async () => {
    try {
      setExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const data = await DataUtils.exportData();
      const jsonString = JSON.stringify(data, null, 2);

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `car-story-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Export Complete', 'Backup file downloaded.');
      } else {
        const fileName = `car-story-backup-${new Date().toISOString().split('T')[0]}.json`;
        const filePath = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, jsonString, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Save Car Story Backup',
          UTI: 'public.json',
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) return;

      setImporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const data = JSON.parse(content);

      if (!DataUtils.validateImportData(data)) {
        Alert.alert('Invalid File', 'This file does not contain valid Car Story backup data.');
        setImporting(false);
        return;
      }

      Alert.alert(
        'Restore Backup',
        `This will replace your current data with the backup from ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'unknown date'}.\n\n${data.vehicles?.length || 0} vehicles, ${data.services?.length || 0} services, ${data.fuelLogs?.length || 0} fuel logs.\n\nThis cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setImporting(false) },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                await DataUtils.importData(data);
                Alert.alert('Import Complete', 'Your data has been restored successfully.');
                onClose();
              } catch (err) {
                Alert.alert('Import Failed', 'Could not restore the backup.');
              } finally {
                setImporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Import Failed', 'Could not read the backup file.');
      setImporting(false);
    }
  };

  const TIMING_OPTIONS = [3, 7, 14, 30];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.horizontalLarge,
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: Spacing.xl,
          borderBottomWidth: 1,
          borderBottomColor: Colors.surface1,
          marginBottom: Spacing.xl,
        }}>
          <TouchableOpacity
            onPress={onClose}
            style={{ padding: 4 }}
          >
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            settings
          </Text>

          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Appearance */}
          <View style={[Shared.cardPrimary, { marginBottom: Spacing.lg }]}>
            <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.lg }]}>
              appearance
            </Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: Spacing.md,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                  dark mode
                </Text>
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: 2 }]}>
                  coming soon - stored preference for future update
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: Colors.surface3, true: Colors.primary + '40' }}
                thumbColor={isDarkMode ? Colors.primary : Colors.textSecondary}
                ios_backgroundColor={Colors.surface3}
              />
            </View>
          </View>

          {/* Notifications */}
          <View style={[Shared.cardPrimary, { marginBottom: Spacing.lg }]}>
            <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.lg }]}>
              notifications
            </Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: Spacing.md,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                  maintenance reminders
                </Text>
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: 2 }]}>
                  get notified when services are due
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: Colors.surface3, true: Colors.primary + '40' }}
                thumbColor={notificationsEnabled ? Colors.primary : Colors.textSecondary}
                ios_backgroundColor={Colors.surface3}
              />
            </View>

            {notificationsEnabled && (
              <View style={{ marginTop: Spacing.md }}>
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                  remind me before service is due
                </Text>
                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  {TIMING_OPTIONS.map((days) => (
                    <TouchableOpacity
                      key={days}
                      onPress={() => handleTimingChange(days)}
                      style={{
                        flex: 1,
                        paddingVertical: Spacing.sm,
                        borderRadius: 12,
                        backgroundColor: notificationTiming === days ? Colors.primary + '20' : Colors.surface1,
                        borderWidth: 1,
                        borderColor: notificationTiming === days ? Colors.primary : Colors.glassBorder,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={[Typography.caption, {
                        color: notificationTiming === days ? Colors.primary : Colors.textSecondary,
                        fontFamily: notificationTiming === days ? 'Nunito_600SemiBold' : 'Nunito_400Regular',
                      }]}>
                        {days}d
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Data Backup */}
          <View style={[Shared.cardPrimary, { marginBottom: Spacing.lg }]}>
            <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.lg }]}>
              data backup
            </Text>

            <TouchableOpacity
              style={[Shared.buttonPrimary, { marginBottom: Spacing.md }]}
              onPress={handleExportData}
              disabled={exporting}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="cloud-upload-outline" size={20} color={Colors.textPrimary} style={{ marginRight: Spacing.sm }} />
                <Text style={[Typography.body, { color: Colors.textPrimary, fontFamily: 'Nunito_600SemiBold' }]}>
                  {exporting ? 'exporting...' : 'export backup'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[Shared.buttonSecondary]}
              onPress={handleImportData}
              disabled={importing}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="cloud-download-outline" size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
                <Text style={[Typography.body, { color: Colors.primary, fontFamily: 'Nunito_600SemiBold' }]}>
                  {importing ? 'importing...' : 'import backup'}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={[Typography.caption, { color: Colors.textTertiary, marginTop: Spacing.md, textAlign: 'center' }]}>
              export saves all vehicles, services, fuel logs, issues, and settings as a JSON file
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default function GarageScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(false);
  const [showLogServiceModal, setShowLogServiceModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // Removed FAB multi-action state - now simple Add Vehicle button

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
      checkOnboarding();
    }, [])
  );

  const checkOnboarding = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      if (!onboardingComplete) {
        setShowOnboardingModal(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehicleList = await VehicleStorage.getAll();
      
      // Get most recent service date for each vehicle
      const vehiclesWithRecency = await Promise.all(
        vehicleList.map(async (v) => {
          const services = await ServiceStorage.getByVehicleId(v.id);
          const latestDate = services.length > 0 ? services[0].date : null;
          return { ...v, _latestServiceDate: latestDate };
        })
      );

      // Sort: favorites first (by recency), then non-favorites (by recency)
      vehiclesWithRecency.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        const dateA = a._latestServiceDate ? new Date(a._latestServiceDate).getTime() : 0;
        const dateB = b._latestServiceDate ? new Date(b._latestServiceDate).getTime() : 0;
        return dateB - dateA;
      });

      setVehicles(vehiclesWithRecency);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (vehicle) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await VehicleStorage.update(vehicle.id, { isFavorite: !vehicle.isFavorite });
      loadVehicles();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Removed FAB toggle logic - now simple button

  const handleAddVehicle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAddVehicleModal(true);
  };

  const handleVehicleAdded = (newVehicle) => {
    // Refresh vehicles list
    loadVehicles();
  };

  const handleLoadSampleData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      setLoading(true);
      const success = await addSampleData();
      if (success) {
        Alert.alert(
          'Sample Data Loaded',
          'Added 2 vehicles with service history to demonstrate the app',
          [{ text: 'OK', style: 'default' }]
        );
        loadVehicles(); // Reload vehicles to show the new data
      } else {
        Alert.alert(
          'Error',
          'Failed to load sample data',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load sample data: ' + error.message,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVehiclePress = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDetailModal(true);
  };

  const handleVehicleUpdated = () => {
    // Refresh vehicles list
    loadVehicles();
  };

  // Removed handleLogServiceFromFAB - no longer needed

  const [preselectedServiceType, setPreselectedServiceType] = useState(null);

  const handleLogServiceFromDetail = (vehicle, serviceName) => {
    setSelectedVehicle(vehicle);
    setPreselectedServiceType(serviceName || null);
    setShowVehicleDetailModal(false);
    setShowLogServiceModal(true);
  };

  const handleServiceLogged = () => {
    // Refresh vehicles list to update any mileage changes
    loadVehicles();
    // Re-schedule notifications since service dates changed
    const { scheduleServiceNotifications } = require('../../lib/notifications');
    scheduleServiceNotifications();
  };

  const handleOnboardingAddVehicle = () => {
    setShowAddVehicleModal(true);
  };

  const handleOnboardingClose = () => {
    setShowOnboardingModal(false);
  };

  if (loading) {
    return (
      <View style={[Shared.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[Typography.body, { color: Colors.textSecondary }]}>
          Loading your garage...
        </Text>
      </View>
    );
  }

  if (vehicles.length === 0) {
    return (
      <View style={Shared.container}>
        <EmptyState onAddVehicle={handleAddVehicle} onLoadSampleData={handleLoadSampleData} />

        <AddVehicleModal
          visible={showAddVehicleModal}
          onClose={() => setShowAddVehicleModal(false)}
          onVehicleAdded={handleVehicleAdded}
        />

        <OnboardingModal
          visible={showOnboardingModal}
          onClose={handleOnboardingClose}
          onAddVehicle={handleOnboardingAddVehicle}
        />
      </View>
    );
  }

  return (
    <View style={Shared.container}>
      {/* Header with Settings */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
      }}>
        <Text style={[Typography.hero, { color: Colors.textPrimary }]}>
          garage
        </Text>
        
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            setShowSettingsModal(true);
          }}
          style={{ padding: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.lg, paddingBottom: 100 }}
      >
        <DashboardSummary vehicles={vehicles} />
        
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onPress={handleVehiclePress}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </ScrollView>

      {/* Simplified FAB - Add Vehicle only */}

      {/* FAB Button - Add Vehicle */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: Colors.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}
        onPress={handleAddVehicle}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color={Colors.textPrimary} />
      </TouchableOpacity>

      <AddVehicleModal
        visible={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
        onVehicleAdded={handleVehicleAdded}
      />

      <VehicleDetailModal
        visible={showVehicleDetailModal}
        onClose={() => setShowVehicleDetailModal(false)}
        vehicle={selectedVehicle}
        onVehicleUpdated={handleVehicleUpdated}
        onLogService={handleLogServiceFromDetail}
      />

      <LogServiceModal
        visible={showLogServiceModal}
        onClose={() => { setShowLogServiceModal(false); setPreselectedServiceType(null); }}
        onServiceLogged={handleServiceLogged}
        preselectedVehicle={selectedVehicle}
        preselectedServiceType={preselectedServiceType}
      />

      <OnboardingModal
        visible={showOnboardingModal}
        onClose={handleOnboardingClose}
        onAddVehicle={handleOnboardingAddVehicle}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </View>
  );
}