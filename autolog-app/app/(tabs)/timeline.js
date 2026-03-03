import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../../theme';
import { ServiceStorage, VehicleStorage } from '../../lib/storage';
import LogServiceModal from '../../components/LogServiceModal';
import EditServiceModal from '../../components/EditServiceModal';

const ServiceCard = ({ service, vehicle, onEdit }) => {
  const getServiceIcon = (serviceType) => {
    const iconMap = {
      'Oil Change': 'car-cog',
      'Tire Rotation': 'tire',
      'Brake Inspection': 'car-brake-alert',
      'Multi-Point Inspection': 'clipboard-check',
      'Air Filter': 'air-filter',
      'Cabin Filter': 'air-filter',
      'Transmission Fluid': 'car-shift-pattern',
      'Coolant Flush': 'coolant-temperature',
      'Spark Plugs': 'spark-plug',
      'Battery Check': 'car-battery',
    };
    
    return iconMap[serviceType] || 'wrench';
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
      }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
        <View style={{
          backgroundColor: serviceColor + '20',
          borderRadius: 24,
          padding: 10,
          marginRight: Spacing.md,
          borderWidth: 1,
          borderColor: serviceColor + '30',
        }}>
          <MaterialCommunityIcons
            name={getServiceIcon(service.serviceType)}
            size={24}
            color={serviceColor}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {service.serviceType}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {vehicle?.nickname || `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}
          </Text>
        </View>

        {service.photos && service.photos.length > 0 && (
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: Colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: Spacing.sm,
          }}>
            <Ionicons name="camera" size={12} color={Colors.primary} />
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
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="speedometer-outline" size={16} color={Colors.textSecondary} />
          <Text style={[Typography.caption, { color: Colors.textSecondary, marginLeft: 4 }]}>
            {service.mileage?.toLocaleString() || '---'} miles
          </Text>
        </View>

        {service.vendor && (
          <Text style={[Typography.caption, { 
            color: Colors.textSecondary,
            fontStyle: 'italic',
          }]}>
            {service.vendor}
          </Text>
        )}
      </View>

      {service.notes && (
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
  const [loading, setLoading] = useState(true);
  const [showLogServiceModal, setShowLogServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [sortMode, setSortMode] = useState('newest'); // newest | oldest | expensive

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [allServices, allVehicles] = await Promise.all([
        ServiceStorage.getAll(),
        VehicleStorage.getAll(),
      ]);
      
      setServices(allServices);
      setVehicles(allVehicles);
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
      // Search query
      if (query) {
        const searchable = [
          s.serviceType,
          s.vendor,
          s.notes,
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

  // Group filtered services by month
  const groupedServices = useMemo(() => {
    return filteredServices.reduce((groups, service) => {
      const date = new Date(service.date);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      
      groups[monthKey].push(service);
      return groups;
    }, {});
  }, [filteredServices]);

  const totalCostAll = services.reduce((sum, s) => sum + (s.cost || 0), 0);
  const totalCostFiltered = filteredServices.reduce((sum, s) => sum + (s.cost || 0), 0);

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

  if (services.length === 0) {
    return (
      <View style={Shared.container}>
        <EmptyState onLogService={handleLogService} />
      </View>
    );
  }

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortMode)?.label || 'Newest';

  return (
    <View style={Shared.container}>
      {/* Summary Header */}
      <View style={[Shared.card, { marginTop: Spacing.lg, marginBottom: Spacing.md }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
              {hasActiveFilters
                ? `${filteredServices.length} of ${services.length} services`
                : `${services.length} services logged`}
            </Text>
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              {hasActiveFilters
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
              {hasActiveFilters ? `of $${totalCostAll.toFixed(0)}` : 'total spent'}
            </Text>
          </View>
        </View>
      </View>

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
      {filteredServices.length === 0 ? (
        <View style={{ alignItems: 'center', paddingTop: Spacing.section }}>
          <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
          <Text style={[Typography.body, { color: Colors.textSecondary, marginTop: Spacing.md, textAlign: 'center' }]}>
            No services match your filters
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {Object.entries(groupedServices).map(([month, monthServices]) => (
            <MonthSection
              key={month}
              month={month}
              services={monthServices}
              vehicles={vehicles}
              onEditService={handleEditService}
            />
          ))}
        </ScrollView>
      )}

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
