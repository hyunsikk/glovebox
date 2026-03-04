import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, Shared } from '../../theme';
import { VehicleStorage, ServiceStorage } from '../../lib/storage';
import { HealthScore, ServiceDue } from '../../lib/analytics';
import { addSampleData } from '../../lib/sampleData';
import AddVehicleModal from '../../components/AddVehicleModal';
import VehicleDetailModal from '../../components/VehicleDetailModal';
import LogServiceModal from '../../components/LogServiceModal';
import OnboardingModal from '../../components/OnboardingModal';
import { HealthScoreDialSmall } from '../../components/HealthScoreDial';

const VehicleCard = ({ vehicle, onPress, onToggleFavorite }) => {
  const [overdueServices, setOverdueServices] = useState([]);
  const [dueSoonServices, setDueSoonServices] = useState([]);
  const [nextService, setNextService] = useState(null);
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

export default function GarageScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(false);
  const [showLogServiceModal, setShowLogServiceModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const fabRotation = useState(new Animated.Value(0))[0];
  const menuSlide = useState(new Animated.Value(0))[0];

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

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.spring(fabRotation, { toValue, tension: 300, friction: 15, useNativeDriver: true }),
      Animated.spring(menuSlide, { toValue, tension: 300, friction: 15, useNativeDriver: true }),
    ]).start();
    setFabOpen(!fabOpen);
  };

  const closeFab = () => {
    if (!fabOpen) return;
    Animated.parallel([
      Animated.spring(fabRotation, { toValue: 0, tension: 300, friction: 15, useNativeDriver: true }),
      Animated.spring(menuSlide, { toValue: 0, tension: 300, friction: 15, useNativeDriver: true }),
    ]).start();
    setFabOpen(false);
  };

  const handleAddVehicle = () => {
    closeFab();
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

  const handleLogServiceFromFAB = () => {
    closeFab();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLogServiceModal(true);
  };

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.lg, paddingBottom: 100 }}
      >
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onPress={handleVehiclePress}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </ScrollView>

      {/* FAB Menu Backdrop */}
      {fabOpen && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          activeOpacity={1}
          onPress={closeFab}
        />
      )}

      {/* FAB Menu Items */}
      {fabOpen && (
        <View style={{ position: 'absolute', bottom: 88, right: 20, alignItems: 'flex-end' }}>
          <Animated.View style={{
            opacity: menuSlide,
            transform: [{ translateY: menuSlide.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            marginBottom: Spacing.md,
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.surface2,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.md,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Colors.glassBorder,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={handleLogServiceFromFAB}
              activeOpacity={0.9}
            >
              <Ionicons name="build-outline" size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
              <Text style={[Typography.body, { color: Colors.textPrimary }]}>Log Service</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{
            opacity: menuSlide,
            transform: [{ translateY: menuSlide.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.surface2,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.md,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Colors.glassBorder,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={handleAddVehicle}
              activeOpacity={0.9}
            >
              <Ionicons name="car-outline" size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
              <Text style={[Typography.body, { color: Colors.textPrimary }]}>Add Vehicle</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* FAB Button */}
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
        onPress={toggleFab}
        activeOpacity={0.9}
      >
        <Animated.View style={{
          transform: [{ rotate: fabRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }],
        }}>
          <Ionicons name="add" size={28} color={Colors.textPrimary} />
        </Animated.View>
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
    </View>
  );
}