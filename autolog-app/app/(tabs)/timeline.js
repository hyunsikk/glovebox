import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../../theme';
import { ServiceStorage, VehicleStorage, FuelStorage, IssueStorage, SnapshotStorage, ImageStorage } from '../../lib/storage';
import { getThumbnailUri } from '../../lib/imageUtils';
import LogServiceModal from '../../components/LogServiceModal';
import EditServiceModal from '../../components/EditServiceModal';
import { shareSnapshot } from '../../lib/shareSnapshot';

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

  const formatCost = (cost) => {
    return cost ? `$${cost.toFixed(2)}` : '---';
  };

  const serviceColor = getServiceCategoryColor(service.serviceType);

  return (
    <TouchableOpacity
      style={[Shared.card, { 
        marginBottom: Spacing.md,
        position: 'relative',
      }]}
      onPress={() => onEdit(service)}
      activeOpacity={0.9}
    >
      <View style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: serviceColor,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
      }} /><View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
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
            {vehicle?.nickname || `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}
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
            {service.mileage?.toLocaleString() || '---'} miles
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
          <Text style={{ fontSize: 20 }}>{isFuel ? '⛽' : '⚡'}</Text>
        </View>

        {/* Details */}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {isFuel
              ? `${fuelLog.gallons} gal${fuelLog.fullTank ? '' : ' (partial)'}`
              : `${fuelLog.kWh} kWh`}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {vehicle?.nickname || (vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown')}
            {fuelLog.station ? ` · ${fuelLog.station}` : ''}
          </Text>
        </View>

        {/* Cost & Date */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            ${fuelLog.totalCost?.toFixed(2) || '0.00'}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {fuelLog.odometer?.toLocaleString()} mi
          </Text>
        </View>
      </View>
    </View>
  );
};

const IssueCard = ({ issue, vehicle }) => {
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
          <Text style={{ fontSize: 20 }}>🚨</Text>
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
        {issue.cost && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[Typography.h2, { color: Colors.primary }]}>
              ${issue.cost.toFixed(2)}
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
  const conditionColors = {
    excellent: Colors.success || '#10B981',
    good: Colors.primary,
    fair: Colors.warning || '#EAB308',
    poor: Colors.danger || '#EF4444',
  };
  const conditionEmojis = { excellent: '✨', good: '👍', fair: '👌', poor: '⚠️' };

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
          <Text style={{ fontSize: 20 }}>📸</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {snapshot.title}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
            {vehicle?.nickname || (vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown')}
            {' · '}{snapshot.odometer?.toLocaleString()} mi
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
                {conditionEmojis[snapshot.condition]} {snapshot.condition}
              </Text>
            </View>
            {snapshot.openIssuesCount > 0 && (
              <Text style={[Typography.small, { color: Colors.danger }]}>
                {snapshot.openIssuesCount} open issue{snapshot.openIssuesCount !== 1 ? 's' : ''}
              </Text>
            )}
            {snapshot.totalSpent > 0 && (
              <Text style={[Typography.small, { color: Colors.textSecondary }]}>
                ${snapshot.totalSpent.toFixed(0)} spent
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
    <Text style={{ fontSize: 60, marginBottom: Spacing.xl }}>🔧</Text>
    
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

const MonthSection = ({ month, services, vehicles, onEditService }) => {
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
            ${totalCost.toFixed(0)}
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

export default function TimelineScreen() {
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
  const [activeFilters, setActiveFilters] = useState(new Set());
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

      // Load photos for all services
      const photosMap = {};
      for (const service of allServices) {
        const photos = await ImageStorage.getByServiceId(service.id);
        if (photos.length > 0) photosMap[service.id] = photos;
      }
      setServicePhotosMap(photosMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filter) => {
    Haptics.selectionAsync();
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  const clearFilters = () => {
    Haptics.selectionAsync();
    setActiveFilters(new Set());
    setSearchQuery('');
  };

  const cycleSortMode = () => {
    Haptics.selectionAsync();
    const modes = ['newest', 'oldest', 'expensive'];
    const idx = modes.indexOf(sortMode);
    setSortMode(modes[(idx + 1) % modes.length]);
  };

  const hasActiveFilters = activeFilters.size > 0 || searchQuery.trim().length > 0;

  // Filter and sort services
  const filteredServices = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;
    const query = searchQuery.trim().toLowerCase();

    let result = services.filter(s => {
      // Vehicle filter
      if (selectedVehicleId !== 'all' && s.vehicleId !== selectedVehicleId) {
        return false;
      }

      // Search query
      if (query) {
        const vehicle = vehicles.find(v => v.id === s.vehicleId);
        const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.nickname || ''}` : '';
        const searchable = [
          s.serviceType,
          s.vendor,
          s.notes,
          vehicleName,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      // Filters (OR within same category would be complex; these are AND)
      if (activeFilters.has('thisYear')) {
        if (new Date(s.date).getFullYear() !== thisYear) return false;
      }
      if (activeFilters.has('lastYear')) {
        if (new Date(s.date).getFullYear() !== lastYear) return false;
      }
      if (activeFilters.has('oil')) {
        if (!s.serviceType?.toLowerCase().includes('oil')) return false;
      }
      if (activeFilters.has('brakes')) {
        if (!s.serviceType?.toLowerCase().includes('brake')) return false;
      }
      if (activeFilters.has('expensive')) {
        if (!s.cost || s.cost <= 200) return false;
      }

      return true;
    });

    // Sort
    if (sortMode === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortMode === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortMode === 'expensive') {
      result.sort((a, b) => (b.cost || 0) - (a.cost || 0));
    }

    return result;
  }, [services, searchQuery, activeFilters, sortMode]);

  // Merge services, fuel logs, issues, and snapshots into unified timeline entries
  const allTimelineEntries = useMemo(() => {
    const serviceEntries = filteredServices.map(s => ({ ...s, _type: 'service' }));
    const fuelEntries = fuelLogs.filter(f => selectedVehicleId === 'all' || f.vehicleId === selectedVehicleId)
                               .map(f => ({ ...f, _type: 'fuel', cost: f.totalCost || 0 }));
    const issueEntries = issues.filter(i => selectedVehicleId === 'all' || i.vehicleId === selectedVehicleId)
                               .map(i => ({ ...i, _type: 'issue', cost: i.cost || 0 }));
    const snapshotEntries = snapshots.filter(s => selectedVehicleId === 'all' || s.vehicleId === selectedVehicleId)
                                     .map(s => ({ ...s, _type: 'snapshot', cost: 0 }));
    return [...serviceEntries, ...fuelEntries, ...issueEntries, ...snapshotEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredServices, fuelLogs, issues, snapshots, selectedVehicleId]);

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

  const totalCostAll = services.reduce((sum, s) => sum + (s.cost || 0), 0)
    + fuelLogs.reduce((sum, f) => sum + (f.totalCost || 0), 0)
    + issues.reduce((sum, i) => sum + (i.cost || 0), 0)
    + snapshots.reduce((sum, s) => sum + 0, 0); // snapshots don't have cost
  // Snapshots don't have cost, they're just point-in-time records
  const totalCostFiltered = allTimelineEntries.reduce((sum, e) => sum + (e.cost || e.totalCost || 0), 0);

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Summary Header */}
        <View style={[Shared.card, { marginTop: Spacing.lg, marginBottom: Spacing.md }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
                {hasActiveFilters || selectedVehicleId !== 'all'
                  ? `${allTimelineEntries.length} of ${services.length + fuelLogs.length + issues.length + snapshots.length} entries`
                  : `${services.length + fuelLogs.length + issues.length + snapshots.length} entries logged`}
              </Text>
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                {hasActiveFilters || selectedVehicleId !== 'all'
                  ? `filtered results`
                  : `across ${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''}`}
              </Text>
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[Typography.hero, { 
                color: Colors.success,
                fontSize: 24,
              }]}>
                ${totalCostFiltered.toFixed(0)}
              </Text>
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                {hasActiveFilters || selectedVehicleId !== 'all' ? `of $${totalCostAll.toFixed(0)}` : 'total spent'}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle Filter */}
        {vehicles.length > 1 && (
          <VehicleFilterChips
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onVehicleSelect={setSelectedVehicleId}
          />
        )}

        {/* Search Bar */}
        <View style={{ marginBottom: Spacing.sm }}>
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
              placeholder="Search services, vendors, notes..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

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

          <FilterChip label="This Year" active={activeFilters.has('thisYear')} onPress={() => toggleFilter('thisYear')} />
          <FilterChip label="Last Year" active={activeFilters.has('lastYear')} onPress={() => toggleFilter('lastYear')} />
          <FilterChip label="Oil Changes" active={activeFilters.has('oil')} onPress={() => toggleFilter('oil')} />
          <FilterChip label="Brakes" active={activeFilters.has('brakes')} onPress={() => toggleFilter('brakes')} />
          <FilterChip label=">$200" active={activeFilters.has('expensive')} onPress={() => toggleFilter('expensive')} />
          
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

        {/* Results */}
        {allTimelineEntries.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: Spacing.section }}>
            <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
            <Text style={[Typography.body, { color: Colors.textSecondary, marginTop: Spacing.md, textAlign: 'center' }]}>
              No entries match your filters
            </Text>
          </View>
        ) : (
          <View>
          {Object.entries(groupedEntries).map(([month, entries]) => {
            const monthCost = entries.reduce((sum, e) => sum + (e.cost || e.totalCost || 0), 0);
            return (
              <View key={month} style={{ marginBottom: Spacing.section }}>
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
                    {month}
                  </Text>
                  {monthCost > 0 && (
                    <Text style={[Typography.h2, { color: Colors.success }]}>
                      ${monthCost.toFixed(0)}
                    </Text>
                  )}
                </View>
                
                {entries.map((entry) => {
                  const vehicle = vehicles.find(v => v.id === entry.vehicleId);
                  if (entry._type === 'fuel') {
                    return <FuelCard key={entry.id} fuelLog={entry} vehicle={vehicle} />;
                  } else if (entry._type === 'issue') {
                    return <IssueCard key={entry.id} issue={entry} vehicle={vehicle} />;
                  } else if (entry._type === 'snapshot') {
                    return <SnapshotCard key={entry.id} snapshot={entry} vehicle={vehicle} />;
                  }
                  return (
                    <ServiceCard
                      key={entry.id}
                      service={entry}
                      vehicle={vehicle}
                      onEdit={handleEditService}
                      servicePhotos={servicePhotosMap[entry.id] || []}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
      )}
      </ScrollView>

      {/* Floating Add Button */}
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
        onPress={handleLogService}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color={Colors.textPrimary} />
      </TouchableOpacity>

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
