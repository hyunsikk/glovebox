import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, SectionList, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../../theme';
import { ServiceStorage, VehicleStorage, FuelStorage, IssueStorage, SnapshotStorage, ImageStorage } from '../../lib/storage';
import { getThumbnailUri } from '../../lib/imageUtils';
import LogServiceModal from '../../components/LogServiceModal';
import EditServiceModal from '../../components/EditServiceModal';
import { shareSnapshot } from '../../lib/shareSnapshot';
import { useSettings } from '../../lib/SettingsContext';

const VehicleFilterChips = ({ vehicles, selectedVehicleId, onVehicleSelect }) => (
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: Spacing.horizontal, paddingBottom: Spacing.lg, alignItems: 'center' }}
  >
    <TouchableOpacity
      key="all"
      style={{
        paddingHorizontal: 16,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        backgroundColor: selectedVehicleId === 'all' ? Colors.primary : Colors.surface1,
        borderWidth: 1,
        borderColor: selectedVehicleId === 'all' ? Colors.primary : Colors.glassBorder,
        marginRight: Spacing.sm,
      }}
      onPress={() => {
        Haptics.selectionAsync();
        onVehicleSelect('all');
      }}
      activeOpacity={0.8}
    >
      <Text style={[Typography.caption, { 
        color: selectedVehicleId === 'all' ? Colors.pearlWhite : Colors.textSecondary,
        fontFamily: selectedVehicleId === 'all' ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
      }]}>
        All
      </Text>
    </TouchableOpacity>
    
    {vehicles.map((vehicle) => (
      <TouchableOpacity
        key={vehicle.id}
        style={{
          paddingHorizontal: 16,
          height: 36,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 18,
          backgroundColor: selectedVehicleId === vehicle.id ? Colors.primary : Colors.surface1,
          borderWidth: 1,
          borderColor: selectedVehicleId === vehicle.id ? Colors.primary : Colors.glassBorder,
          marginRight: Spacing.sm,
        }}
        onPress={() => {
          Haptics.selectionAsync();
          onVehicleSelect(vehicle.id);
        }}
        activeOpacity={0.8}
      >
        <Text style={[Typography.caption, { 
          color: selectedVehicleId === vehicle.id ? Colors.pearlWhite : Colors.textSecondary,
          fontFamily: selectedVehicleId === vehicle.id ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
        }]}>
          {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const ServiceCard = ({ service, vehicle, onEdit, servicePhotos = [] }) => {
  const { formatCost, formatDistance } = useSettings();
  const getServiceIcon = (serviceType) => {
    const iconMap = {
      'Oil Change': 'construct-outline',
      'Tire Rotation': 'disc-outline',
      'Brake Inspection': 'warning-outline',
      'Multi-Point Inspection': 'clipboard-outline',
      'Air Filter': 'leaf-outline',
      'Cabin Filter': 'leaf-outline',
      'Transmission Fluid': 'water-outline',
      'Coolant Flush': 'thermometer-outline',
      'Spark Plugs': 'flash-outline',
      'Battery Check': 'battery-half-outline',
    };
    
    return iconMap[serviceType] || 'build-outline';
  };

  const getServiceCategoryColor = (serviceType) => {
    const categoryColors = {
      'Oil Change': Colors.primary,
      'Air Filter': Colors.primary,
      'Spark Plugs': Colors.primary,
      'Tire Rotation': Colors.success,
      'Brake Inspection': Colors.warning,
      'Transmission Fluid': Colors.warning,
      'Coolant Flush': Colors.primary,
      'Battery Check': Colors.success,
      'Multi-Point Inspection': Colors.primary,
    };
    
    return categoryColors[serviceType] || Colors.primary;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const serviceColor = getServiceCategoryColor(service.serviceType);

  return (
    <TouchableOpacity
      style={[Shared.card, {
        marginBottom: Spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: serviceColor,
      }]}
      onPress={() => onEdit(service)}
      activeOpacity={0.9}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
        <View style={{
          backgroundColor: serviceColor + '20',
          borderRadius: 24,
          padding: 10,
          marginRight: Spacing.md,
          borderWidth: 1,
          borderColor: serviceColor + '30',
        }}>
          <Ionicons
            name={getServiceIcon(service.serviceType)}
            size={24}
            color={serviceColor}
          />
        </View><View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {service.serviceType}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {vehicle?.nickname || (vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown')}
          </Text>
        </View>

        {servicePhotos.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: Spacing.sm }}>
            <Ionicons name="camera" size={16} color={Colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[Typography.small, { color: Colors.textSecondary, marginRight: 4 }]}>
              {servicePhotos.length}
            </Text>
            {servicePhotos.slice(0, 2).map((photo, index) => (
              <Image
                key={photo.id || index}
                source={{ uri: getThumbnailUri(photo) }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: Colors.glassBorder,
                  marginLeft: 2,
                }}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[Typography.h2, { color: Colors.success, fontSize: 20 }]}>
            {formatCost(service.cost)}
          </Text>
          <Text style={[Typography.caption, { 
            color: Colors.textPrimary, 
            fontFamily: 'Nunito_600SemiBold',
          }]}>
            {formatDate(service.date)}
          </Text>
        </View>
      </View><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="speedometer-outline" size={16} color={Colors.textSecondary} />
          <Text style={[Typography.caption, { color: Colors.textSecondary, marginLeft: 4 }]}>
            {service.mileage ? formatDistance(service.mileage) : '---'}
          </Text>
        </View>{service.vendor && (
          <Text style={[Typography.caption, { 
            color: Colors.textSecondary,
            fontStyle: 'italic',
          }]}>
            {service.vendor}
          </Text>
        )}
      </View>{service.notes && (
        <View style={{
          marginTop: Spacing.md,
          padding: Spacing.md,
          backgroundColor: Colors.surface1 + '60',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}>
          <Text style={[Typography.body, { color: Colors.textSecondary }]}>
            {service.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const FuelCard = ({ fuelLog, vehicle }) => {
  const { formatCost, formatDistance, formatVolume } = useSettings();
  const isFuel = fuelLog.type !== 'ev_charge';
  
  return (
    <View style={[Shared.card, { marginBottom: Spacing.md }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Icon */}
        <View style={{
          backgroundColor: (isFuel ? Colors.warning : Colors.success) + '20',
          borderRadius: 24,
          padding: 12,
          marginRight: Spacing.md,
          borderWidth: 1,
          borderColor: (isFuel ? Colors.warning : Colors.success) + '30',
        }}>
          {isFuel
            ? <MaterialCommunityIcons name="gas-station" size={20} color={Colors.warning} />
            : <Ionicons name="flash" size={20} color={Colors.success} />}
        </View>

        {/* Details */}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {isFuel
              ? `${formatVolume(fuelLog.gallons)}${fuelLog.fullTank ? '' : ' (partial)'}`
              : `${fuelLog.kWh != null ? fuelLog.kWh : '--'} kWh`}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {vehicle?.nickname || (vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown')}
            {fuelLog.station ? ` · ${fuelLog.station}` : ''}
          </Text>
        </View>

        {/* Cost & Date */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {formatCost(fuelLog.totalCost || 0)}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {fuelLog.odometer ? formatDistance(fuelLog.odometer) : ''}
          </Text>
        </View>
      </View>
    </View>
  );
};

const IssueCard = ({ issue, vehicle }) => {
  const { formatCost } = useSettings();
  const severityColors = {
    minor: '#3B82F6',
    moderate: '#EAB308',
    serious: '#F97316',
    critical: '#EF4444',
  };
  const statusColors = {
    open: '#EF4444',
    in_progress: '#EAB308',
    resolved: '#10B981',
  };

  return (
    <View style={[Shared.card, { marginBottom: Spacing.md }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Icon */}
        <View style={{
          backgroundColor: severityColors[issue.severity] + '20',
          borderRadius: 24,
          padding: 12,
          marginRight: Spacing.md,
          borderWidth: 1,
          borderColor: severityColors[issue.severity] + '30',
        }}>
          <Ionicons name="alert-circle" size={20} color={severityColors[issue.severity]} />
        </View>

        {/* Details */}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {issue.title}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
            {vehicle?.nickname || (vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown')}
          </Text>
          <Text style={[Typography.body, { color: Colors.textSecondary, marginBottom: Spacing.sm }]} numberOfLines={2}>
            {issue.description}
          </Text>
          
          {/* Severity and Status badges */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: severityColors[issue.severity] + '20',
              borderWidth: 1,
              borderColor: severityColors[issue.severity] + '40',
              marginRight: Spacing.sm,
            }}>
              <Text style={[Typography.small, { 
                color: severityColors[issue.severity],
                fontSize: 10,
                fontFamily: 'Nunito_600SemiBold',
                textTransform: 'uppercase',
              }]}>
                {issue.severity}
              </Text>
            </View>
            <View style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: statusColors[issue.status] + '20',
              borderWidth: 1,
              borderColor: statusColors[issue.status] + '40',
            }}>
              <Text style={[Typography.small, { 
                color: statusColors[issue.status],
                fontSize: 10,
                fontFamily: 'Nunito_600SemiBold',
                textTransform: 'uppercase',
              }]}>
                {issue.status === 'in_progress' ? 'in progress' : issue.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Cost */}
        {issue.cost != null && issue.cost > 0 && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[Typography.h2, { color: Colors.primary }]}>
              {formatCost(issue.cost)}
            </Text>
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              {issue.status === 'resolved' ? 'actual' : 'estimated'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const SnapshotCard = ({ snapshot, vehicle }) => {
  const { formatCostShort, formatDistance } = useSettings();
  const conditionColors = {
    excellent: Colors.success || '#10B981',
    good: Colors.primary,
    fair: Colors.warning || '#EAB308',
    poor: Colors.danger || '#EF4444',
  };

  return (
    <View style={[Shared.card, { marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: conditionColors[snapshot.condition] || Colors.primary }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{
          backgroundColor: Colors.primary + '20',
          borderRadius: 24,
          padding: 12,
          marginRight: Spacing.md,
          borderWidth: 1,
          borderColor: Colors.primary + '30',
        }}>
          <Ionicons name="camera" size={20} color={Colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {snapshot.title}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
            {vehicle?.nickname || (vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown')}
            {' · '}{snapshot.odometer ? formatDistance(snapshot.odometer) : ''}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.sm }}>
            <View style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: conditionColors[snapshot.condition] + '20',
              borderWidth: 1,
              borderColor: conditionColors[snapshot.condition] + '40',
            }}>
              <Text style={[Typography.small, {
                color: conditionColors[snapshot.condition],
                fontSize: 10,
                fontFamily: 'Nunito_600SemiBold',
              }]}>
                {snapshot.condition}
              </Text>
            </View>
            {snapshot.openIssuesCount > 0 && (
              <Text style={[Typography.small, { color: Colors.danger }]}>
                {snapshot.openIssuesCount} open issue{snapshot.openIssuesCount !== 1 ? 's' : ''}
              </Text>
            )}
            {snapshot.totalSpent > 0 && (
              <Text style={[Typography.small, { color: Colors.textSecondary }]}>
                {formatCostShort(snapshot.totalSpent)} spent
              </Text>
            )}
          </View>

          {snapshot.notes && (
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: Spacing.sm }]} numberOfLines={2}>
              {snapshot.notes}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const EmptyState = ({ onLogService }) => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.horizontalLarge,
  }}>
    <Ionicons name="construct" size={60} color={Colors.textTertiary} style={{ marginBottom: Spacing.xl }} />
    
    <Text style={[Typography.hero, { 
      textAlign: 'center', 
      marginBottom: Spacing.md,
      color: Colors.textPrimary,
    }]}>
      no service history yet
    </Text>
    
    <Text style={[Typography.body, { 
      textAlign: 'center', 
      color: Colors.textSecondary, 
      marginBottom: Spacing.section,
      lineHeight: 22,
    }]}>
      start tracking your maintenance by logging your last service. we'll help you stay on schedule.
    </Text>

    <TouchableOpacity
      style={[Shared.buttonPrimary, { width: '100%', maxWidth: 280 }]}
      onPress={onLogService}
      activeOpacity={0.9}
    >
      <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
        log first service
      </Text>
    </TouchableOpacity>
  </View>
);

// NOTE: currently unused (the SectionList renders entries directly). Kept
// defensive — servicePhotosMap defaulted so it can't crash if wired in later.
const MonthSection = ({ month, services, vehicles, onEditService, servicePhotosMap = {} }) => {
  const { formatCostShort } = useSettings();
  const totalCost = services.reduce((sum, s) => sum + (s.cost || 0), 0);
  
  return (
    <View style={{ marginBottom: Spacing.section }}>
      <View style={{
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: Spacing.md,
        backgroundColor: Colors.background + 'E6',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.horizontal,
        marginHorizontal: -Spacing.horizontal,
        borderRadius: 0,
      }}>
        <Text style={[Typography.h1, { color: Colors.textPrimary }]}>
          {month}
        </Text>
        
        {totalCost > 0 && (
          <Text style={[Typography.h2, { color: Colors.success }]}>
            {formatCostShort(totalCost)}
          </Text>
        )}
      </View>
      
      {services.map((service) => {
        const vehicle = vehicles.find(v => v.id === service.vehicleId);
        return (
          <ServiceCard
            key={service.id}
            service={service}
            vehicle={vehicle}
            onEdit={onEditService}
            servicePhotos={servicePhotosMap[service.id] || []}
          />
        );
      })}
    </View>
  );
};

// Filter chip component
const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
      marginRight: Spacing.sm,
      marginBottom: Spacing.sm,
      backgroundColor: active ? Colors.primary : Colors.glassBackground,
      borderWidth: 1,
      borderColor: active ? Colors.primary : Colors.glassBorder,
    }}
  >
    <Text style={[Typography.caption, { 
      color: active ? Colors.textPrimary : Colors.textSecondary,
      fontFamily: active ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
    }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Sort options
const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest', icon: 'arrow-down' },
  { key: 'oldest', label: 'Oldest', icon: 'arrow-up' },
  { key: 'expensive', label: 'Cost ↓', icon: 'cash' },
];

// Stable, module-scope header for the timeline SectionList. Passed as an element
// (ListHeaderComponent={<TimelineHeader .../>}) so it reconciles by type and the
// search TextInput keeps focus across re-renders — an inline arrow header would
// remount on every keystroke and drop focus.
const TimelineHeader = ({
  vehicles, selectedVehicleId, setSelectedVehicleId,
  searchQuery, setSearchQuery,
  services, fuelLogs, issues, snapshots,
  activeTypeFilters, toggleTypeFilter,
  hasActiveFilters, allTimelineEntries,
  currentSortLabel, cycleSortMode,
  clearFilters,
}) => (
  <View>
    {/* Vehicle Filter */}
    {vehicles.length > 1 && (
      <View style={{ marginTop: Spacing.md }}>
        <VehicleFilterChips
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={setSelectedVehicleId}
        />
      </View>
    )}

    {/* Search Bar */}
    <View style={{ marginTop: Spacing.md, marginBottom: Spacing.sm }}>
      <View style={[Shared.input, {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
      }]}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
        <TextInput
          style={{
            flex: 1,
            color: Colors.textPrimary,
            fontSize: 15,
            fontFamily: 'Nunito_400Regular',
            height: '100%',
          }}
          placeholder="Search all records..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>

    {/* Type Filter Chips */}
    <View style={{ flexDirection: 'row', marginBottom: Spacing.sm }}>
      {[
        { key: 'service', label: 'Services', count: services.length },
        { key: 'fuel', label: 'Fuel', count: fuelLogs.length },
        { key: 'issue', label: 'Issues', count: issues.length },
        { key: 'snapshot', label: 'Snapshots', count: snapshots.length },
      ].map(({ key, label, count }) => {
        const isActive = activeTypeFilters.has(key);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => toggleTypeFilter(key)}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
              borderRadius: 20,
              marginRight: Spacing.xs,
              backgroundColor: isActive ? Colors.primary : Colors.glassBackground,
              borderWidth: 1,
              borderColor: isActive ? Colors.primary : Colors.glassBorder,
            }}
          >
            <Text style={[Typography.caption, {
              color: isActive ? Colors.textPrimary : Colors.textSecondary,
              fontFamily: isActive ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
              fontSize: 11,
            }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

    {/* Results count */}
    {hasActiveFilters && (
      <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
        {allTimelineEntries.length} of {services.length + fuelLogs.length + issues.length + snapshots.length} entries
      </Text>
    )}

    {/* Filter Chips + Sort */}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: Spacing.md }}>
      {/* Sort toggle */}
      <TouchableOpacity
        onPress={cycleSortMode}
        activeOpacity={0.8}
        style={{
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: 20,
          marginRight: Spacing.sm,
          marginBottom: Spacing.sm,
          backgroundColor: Colors.surface2,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons name="swap-vertical" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
        <Text style={[Typography.caption, { color: Colors.primary, fontFamily: 'Nunito_600SemiBold' }]}>
          {currentSortLabel}
        </Text>
      </TouchableOpacity>

      {hasActiveFilters && (
        <TouchableOpacity
          onPress={clearFilters}
          activeOpacity={0.8}
          style={{
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            borderRadius: 20,
            marginBottom: Spacing.sm,
            backgroundColor: Colors.danger + '20',
            borderWidth: 1,
            borderColor: Colors.danger + '40',
          }}
        >
          <Text style={[Typography.caption, { color: Colors.danger, fontFamily: 'Nunito_600SemiBold' }]}>
            Clear All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function TimelineScreen() {
  const { formatCost, formatCostShort, formatDistance, formatVolume } = useSettings();
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [issues, setIssues] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogServiceModal, setShowLogServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [servicePhotosMap, setServicePhotosMap] = useState({});

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilters, setActiveTypeFilters] = useState(new Set()); // service, fuel, issue, snapshot
  const [sortMode, setSortMode] = useState('newest'); // newest | oldest | expensive
  const [selectedVehicleId, setSelectedVehicleId] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [allServices, allVehicles, allFuelLogs, allIssues, allSnapshots] = await Promise.all([
        ServiceStorage.getAll(),
        VehicleStorage.getAll(),
        FuelStorage.getAll(),
        IssueStorage.getAll(),
        SnapshotStorage.getAll(),
      ]);
      
      setServices(allServices);
      setVehicles(allVehicles);
      setFuelLogs(allFuelLogs);
      setIssues(allIssues);
      setSnapshots(allSnapshots);

      // Load photos once and group by serviceId (avoids re-reading the whole
      // image blob once per service on every tab focus).
      const photosMap = {};
      const allImages = await ImageStorage.getAll();
      for (const img of allImages) {
        if (!img.serviceId) continue;
        (photosMap[img.serviceId] = photosMap[img.serviceId] || []).push(img);
      }
      setServicePhotosMap(photosMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTypeFilter = (type) => {
    Haptics.selectionAsync();
    setActiveTypeFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const clearFilters = () => {
    Haptics.selectionAsync();
    setActiveTypeFilters(new Set());
    setSearchQuery('');
  };

  const cycleSortMode = () => {
    Haptics.selectionAsync();
    const modes = ['newest', 'oldest', 'expensive'];
    const idx = modes.indexOf(sortMode);
    setSortMode(modes[(idx + 1) % modes.length]);
  };

  const hasActiveFilters = activeTypeFilters.size > 0 || searchQuery.trim().length > 0;

  // Unified global search + filter across ALL entry types
  const allTimelineEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Build all entries with type tags
    const serviceEntries = services.map(s => ({ ...s, _type: 'service' }));
    const fuelEntries = fuelLogs.map(f => ({ ...f, _type: 'fuel', cost: f.totalCost || 0 }));
    const issueEntries = issues.map(i => ({ ...i, _type: 'issue', cost: i.cost || 0 }));
    const snapshotEntries = snapshots.map(s => ({ ...s, _type: 'snapshot', cost: 0 }));
    
    let allEntries = [...serviceEntries, ...fuelEntries, ...issueEntries, ...snapshotEntries];

    // Vehicle filter
    if (selectedVehicleId !== 'all') {
      allEntries = allEntries.filter(e => e.vehicleId === selectedVehicleId);
    }

    // Type filter
    if (activeTypeFilters.size > 0) {
      allEntries = allEntries.filter(e => activeTypeFilters.has(e._type));
    }

    // Search query — searches across all entry types
    if (query) {
      allEntries = allEntries.filter(entry => {
        const vehicle = vehicles.find(v => v.id === entry.vehicleId);
        const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.nickname || ''}` : '';
        
        let searchable = vehicleName;
        if (entry._type === 'service') {
          searchable += ` ${entry.serviceType || ''} ${entry.vendor || ''} ${entry.notes || ''}`;
        } else if (entry._type === 'fuel') {
          searchable += ` ${entry.station || ''} ${entry.notes || ''} fuel gas charge`;
        } else if (entry._type === 'issue') {
          searchable += ` ${entry.title || ''} ${entry.description || ''}`;
        } else if (entry._type === 'snapshot') {
          searchable += ` ${entry.title || ''} ${entry.notes || ''} snapshot`;
        }
        
        return searchable.toLowerCase().includes(query);
      });
    }

    // Sort
    if (sortMode === 'newest') {
      allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortMode === 'oldest') {
      allEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortMode === 'expensive') {
      allEntries.sort((a, b) => (b.cost || 0) - (a.cost || 0));
    }

    return allEntries;
  }, [services, fuelLogs, issues, snapshots, vehicles, searchQuery, activeTypeFilters, sortMode, selectedVehicleId]);

  // Group by month
  const groupedEntries = useMemo(() => {
    return allTimelineEntries.reduce((groups, entry) => {
      const date = new Date(entry.date);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      
      groups[monthKey].push(entry);
      return groups;
    }, {});
  }, [allTimelineEntries]);

  // SectionList shape: month → entries, with each month's total cost. Object key
  // order preserves the already-sorted order of allTimelineEntries.
  const sections = useMemo(
    () => Object.entries(groupedEntries).map(([month, entries]) => ({
      title: month,
      cost: entries.reduce((sum, e) => sum + (e.cost || 0), 0),
      data: entries,
    })),
    [groupedEntries]
  );

  const renderEntry = (entry) => {
    const vehicle = vehicles.find(v => v.id === entry.vehicleId);
    if (entry._type === 'fuel') return <FuelCard fuelLog={entry} vehicle={vehicle} />;
    if (entry._type === 'issue') return <IssueCard issue={entry} vehicle={vehicle} />;
    if (entry._type === 'snapshot') return <SnapshotCard snapshot={entry} vehicle={vehicle} />;
    return (
      <ServiceCard
        service={entry}
        vehicle={vehicle}
        onEdit={handleEditService}
        servicePhotos={servicePhotosMap[entry.id] || []}
      />
    );
  };

  // No longer showing cost summary here — that's Insights' job

  const handleLogService = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLogServiceModal(true);
  };

  const handleServiceLogged = (newService) => {
    loadData();
  };

  const handleEditService = (service) => {
    Haptics.selectionAsync();
    setSelectedService(service);
    setShowEditServiceModal(true);
  };

  const handleServiceUpdated = () => {
    loadData();
  };

  if (loading) {
    return (
      <View style={[Shared.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[Typography.body, { color: Colors.textSecondary }]}>
          Loading service history...
        </Text>
      </View>
    );
  }

  if (services.length === 0 && fuelLogs.length === 0) {
    return (
      <View style={Shared.container}>
        <EmptyState onLogService={handleLogService} />
      </View>
    );
  }

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortMode)?.label || 'Newest';

  return (
    <View style={Shared.container}>
      {/* All content in ScrollView to prevent chips from being hidden */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item._type || 'service'}_${item.id}`}
        renderItem={({ item }) => renderEntry(item)}
        renderSectionHeader={({ section }) => (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Spacing.md,
            backgroundColor: Colors.background + 'E6',
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.horizontal,
            marginHorizontal: -Spacing.horizontal,
          }}>
            <Text style={[Typography.h1, { color: Colors.textPrimary }]}>
              {section.title}
            </Text>
            {section.cost > 0 && (
              <Text style={[Typography.h2, { color: Colors.success }]}>
                {formatCostShort(section.cost)}
              </Text>
            )}
          </View>
        )}
        renderSectionFooter={() => <View style={{ height: Spacing.section }} />}
        ListHeaderComponent={
          <TimelineHeader
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            setSelectedVehicleId={setSelectedVehicleId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            services={services}
            fuelLogs={fuelLogs}
            issues={issues}
            snapshots={snapshots}
            activeTypeFilters={activeTypeFilters}
            toggleTypeFilter={toggleTypeFilter}
            hasActiveFilters={hasActiveFilters}
            allTimelineEntries={allTimelineEntries}
            currentSortLabel={currentSortLabel}
            cycleSortMode={cycleSortMode}
            clearFilters={clearFilters}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: Spacing.section }}>
            <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
            <Text style={[Typography.body, { color: Colors.textSecondary, marginTop: Spacing.md, textAlign: 'center' }]}>
              No entries match your filters
            </Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      />

      <LogServiceModal
        visible={showLogServiceModal}
        onClose={() => setShowLogServiceModal(false)}
        onServiceLogged={handleServiceLogged}
      />

      <EditServiceModal
        visible={showEditServiceModal}
        onClose={() => setShowEditServiceModal(false)}
        service={selectedService}
        onServiceUpdated={handleServiceUpdated}
      />
    </View>
  );
}
