import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../theme';
import { VehicleStorage, ServiceStorage, ImageStorage, FuelStorage, IssueStorage, SnapshotStorage, ReminderStorage } from '../lib/storage';
import LogServiceModal from './LogServiceModal';
import LogFuelModal from './LogFuelModal';
import LogIssueModal from './LogIssueModal';
import TakeSnapshotModal from './TakeSnapshotModal';
import { HealthScore, ServiceDue, CostAnalytics } from '../lib/analytics';
import { pickImageAsync, convertToBase64, getThumbnailUri } from '../lib/imageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import manufacturerDB from '../content/v1/vehicles.json';
import { getVehicleSchedule } from '../lib/vehicleDB';
import { generateReport } from './ReportGenerator';
import DatePickerField from './DatePickerField';

// CollapsibleSection component defined at top of file
const CollapsibleSection = ({ title, children, defaultExpanded = false, hasContent = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!hasContent) return null;

  return (
    <View style={[Shared.card, { marginBottom: Spacing.lg }]}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: isExpanded ? Spacing.lg : 0,
          borderBottomWidth: isExpanded ? 1 : 0,
          borderBottomColor: Colors.glassBorder,
        }}
        onPress={() => {
          Haptics.selectionAsync();
          setIsExpanded(!isExpanded);
        }}
        activeOpacity={0.8}
      >
        <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
          {title}
        </Text>
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-forward'}
          size={20}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={{ paddingTop: isExpanded ? Spacing.lg : 0 }}>
          {children}
        </View>
      )}
    </View>
  );
};



const ServiceHistoryItem = ({ service, onEdit, servicePhotos = [] }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const getServiceIcon = (serviceType) => {
    const iconMap = {
      'Oil Change': 'car-cog',
      'Tire Rotation': 'tire',
      'Brake Inspection': 'car-brake-alert',
      'Multi-Point Inspection': 'clipboard-check',
      'Air Filter': 'air-filter',
      'Engine Air Filter': 'air-filter',
      'Cabin Filter': 'air-filter',
      'Cabin Air Filter': 'air-filter',
      'Transmission Fluid': 'car-shift-pattern',
      'Transmission Service': 'car-shift-pattern',
      'CVT Fluid': 'car-shift-pattern',
      'Coolant Flush': 'coolant-temperature',
      'Coolant': 'coolant-temperature',
      'Spark Plugs': 'spark-plug',
      'Battery Check': 'car-battery',
      'Brake Fluid': 'car-brake-fluid',
      'AWD Service': 'car-4wd',
      'Differential Service': 'car-4wd',
      'A/C Service': 'air-conditioner',
      'A/C Desiccant': 'air-conditioner',
      'Battery Coolant': 'battery-charging',
      'Inspection I': 'clipboard-check',
      'Inspection II': 'clipboard-check',
    };
    
    return iconMap[serviceType] || 'wrench';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[Shared.card, { marginBottom: Spacing.md }]}
      onPress={() => onEdit && onEdit(service)}
      activeOpacity={0.9}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          padding: 6,
          marginRight: Spacing.md,
        }}>
          <MaterialCommunityIcons
            name={getServiceIcon(service.serviceType)}
            size={20}
            color={Colors.steelBlue}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[Typography.body, { color: Colors.text }]}>
            {service.serviceType}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {formatDate(service.date)} • {service.mileage?.toLocaleString() || '---'} miles
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[Typography.body, { color: Colors.forestGreen }]}>
            ${service.cost?.toFixed(2) || '---'}
          </Text>
          {service.vendor && (
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              {service.vendor}
            </Text>
          )}
          
          {/* Photo thumbnails */}
          {servicePhotos.length > 0 && (
            <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
              <MaterialCommunityIcons name="camera" size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[Typography.small, { color: Colors.textSecondary }]}>
                {servicePhotos.length}
              </Text>
              {servicePhotos.slice(0, 2).map((photo, index) => (
                <TouchableOpacity 
                  key={photo.id || index} 
                  onPress={() => setPreviewImage(getThumbnailUri(photo))}
                  activeOpacity={0.8}
                  style={{ marginLeft: 4 }}
                >
                  <Image
                    source={{ uri: getThumbnailUri(photo) }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: Colors.glassBorder,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Shop Review Stars / DIY Badge */}
      {(service.shopReview || service.diyLog) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm }}>
          {service.shopReview && service.shopReview.rating > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={s <= service.shopReview.rating ? 'star' : 'star-outline'}
                  size={14}
                  color={Colors.warning}
                />
              ))}
            </View>
          )}
          {service.diyLog && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: Spacing.sm + 2,
              paddingVertical: 2,
              borderRadius: 10,
              backgroundColor: service.diyLog.difficulty === 'Hard' ? Colors.deepRed + '20'
                : service.diyLog.difficulty === 'Medium' ? Colors.warning + '20'
                : Colors.forestGreen + '20',
            }}>
              <MaterialCommunityIcons name="wrench" size={12} color={
                service.diyLog.difficulty === 'Hard' ? Colors.deepRed
                  : service.diyLog.difficulty === 'Medium' ? Colors.warning
                  : Colors.forestGreen
              } style={{ marginRight: 3 }} />
              <Text style={[Typography.small, { color:
                service.diyLog.difficulty === 'Hard' ? Colors.deepRed
                  : service.diyLog.difficulty === 'Medium' ? Colors.warning
                  : Colors.forestGreen
              }]}>
                DIY{service.diyLog.difficulty ? ` · ${service.diyLog.difficulty}` : ''}
              </Text>
            </View>
          )}
        </View>
      )}

      {service.notes && (
        <View style={{
          marginTop: Spacing.sm,
          padding: Spacing.sm,
          backgroundColor: Colors.surface,
          borderRadius: 6,
        }}>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {service.notes}
          </Text>
        </View>
      )}

      {servicePhotos.length > 0 && (
        <View style={{ flexDirection: 'row', marginTop: Spacing.sm, gap: Spacing.xs }}>
          {servicePhotos.map((photo) => (
            <TouchableOpacity 
              key={photo.id} 
              onPress={() => setPreviewImage(photo.uri || photo.base64)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: photo.uri || photo.base64 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: Colors.glassBorder,
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={previewImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setPreviewImage(null)}
        >
          <TouchableOpacity
            style={{ position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 8 }}
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="close-circle" size={32} color={Colors.pearlWhite} />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={{ width: '90%', height: '70%', borderRadius: 12 }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
};


const MaintenanceScheduleItem = ({ scheduleItem, status, lastService, nextDueDate, onSnooze, onQuickLog, snoozedUntil }) => {
  const [showActions, setShowActions] = useState(false);
  const getServiceIcon = (serviceType) => {
    const iconMap = {
      'Oil Change': 'car-cog',
      'Tire Rotation': 'tire',
      'Brake Inspection': 'car-brake-alert',
      'Multi-Point Inspection': 'clipboard-check',
      'Air Filter': 'air-filter',
      'Engine Air Filter': 'air-filter',
      'Cabin Filter': 'air-filter',
      'Cabin Air Filter': 'air-filter',
      'Transmission Fluid': 'car-shift-pattern',
      'Transmission Service': 'car-shift-pattern',
      'CVT Fluid': 'car-shift-pattern',
      'Coolant Flush': 'coolant-temperature',
      'Coolant': 'coolant-temperature',
      'Spark Plugs': 'spark-plug',
      'Battery Check': 'car-battery',
      'Brake Fluid': 'car-brake-fluid',
      'AWD Service': 'car-4wd',
      'Differential Service': 'car-4wd',
      'A/C Service': 'air-conditioner',
      'A/C Desiccant': 'air-conditioner',
      'Battery Coolant': 'battery-charging',
      'Inspection I': 'clipboard-check',
      'Inspection II': 'clipboard-check',
    };
    
    return iconMap[serviceType] || 'wrench';
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return '✅';
      case 'due_soon': return '⚠️';
      case 'overdue': return '🔴';
      default: return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return Colors.forestGreen;
      case 'due_soon': return Colors.amberAlert;
      case 'overdue': return Colors.deepRed;
      default: return Colors.steelBlue;
    }
  };

  const formatInterval = () => {
    const miles = scheduleItem.mileInterval.toLocaleString();
    const months = scheduleItem.monthInterval;
    return `Every ${miles} miles or ${months} months`;
  };

  const formatDueDate = () => {
    if (!nextDueDate) return '';
    const date = new Date(nextDueDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isSnoozed = snoozedUntil && new Date(snoozedUntil) > new Date();
  const effectiveStatus = isSnoozed ? 'snoozed' : status;

  const effectiveStatusColor = () => {
    if (isSnoozed) return Colors.arcticSilver;
    return getStatusColor();
  };

  return (
    <TouchableOpacity 
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 8,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: effectiveStatusColor(),
        opacity: isSnoozed ? 0.6 : 1,
      }}
      onPress={() => setShowActions(!showActions)}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
        <View style={{
          backgroundColor: Colors.elevated,
          borderRadius: 16,
          padding: 6,
          marginRight: Spacing.md,
        }}>
          <MaterialCommunityIcons
            name={getServiceIcon(scheduleItem.service)}
            size={20}
            color={effectiveStatusColor()}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[Typography.body, { color: Colors.text, flex: 1 }]}>
              {scheduleItem.service}
            </Text>
            {isSnoozed ? (
              <Ionicons name="notifications-off-outline" size={16} color={Colors.arcticSilver} />
            ) : (
              <Text style={{ fontSize: 16, marginLeft: Spacing.sm }}>
                {getStatusIcon()}
              </Text>
            )}
          </View>
          
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {formatInterval()}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          {lastService && (
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              Last: {new Date(lastService.date).toLocaleDateString()}
            </Text>
          )}
          {isSnoozed && (
            <Text style={[Typography.caption, { color: Colors.arcticSilver }]}>
              Snoozed until {new Date(snoozedUntil).toLocaleDateString()}
            </Text>
          )}
        </View>

        {!isSnoozed && nextDueDate && status !== 'completed' && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[Typography.caption, { color: getStatusColor() }]}>
              {status === 'overdue' ? 'Overdue' : 'Due ' + formatDueDate()}
            </Text>
          </View>
        )}
      </View>

      {/* Action buttons — shown on tap */}
      {showActions && (
        <View style={{ 
          flexDirection: 'row', 
          marginTop: Spacing.md, 
          paddingTop: Spacing.md,
          borderTopWidth: 1,
          borderTopColor: Colors.glassBorder,
        }}>
          {/* Quick Log */}
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.forestGreen + '20',
              borderRadius: 10,
              paddingVertical: 8,
              marginRight: Spacing.sm,
              borderWidth: 1,
              borderColor: Colors.forestGreen + '30',
            }}
            onPress={() => {
              Haptics.selectionAsync();
              onQuickLog && onQuickLog(scheduleItem.service);
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.forestGreen} />
            <Text style={[Typography.caption, { color: Colors.forestGreen, marginLeft: 4, fontFamily: 'Nunito_600SemiBold' }]}>
              Log Done
            </Text>
          </TouchableOpacity>

          {/* Snooze — only for overdue or due_soon */}
          {(status === 'overdue' || status === 'due_soon') && (
            <>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.surface2 || Colors.elevated,
                  borderRadius: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  marginRight: Spacing.sm,
                  borderWidth: 1,
                  borderColor: Colors.glassBorder,
                }}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSnooze && onSnooze(scheduleItem.service, 7);
                }}
              >
                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginLeft: 4 }]}>
                  1w
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.surface2 || Colors.elevated,
                  borderRadius: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: Colors.glassBorder,
                }}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSnooze && onSnooze(scheduleItem.service, 30);
                }}
              >
                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginLeft: 4 }]}>
                  1mo
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Unsnooze */}
          {isSnoozed && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.surface2 || Colors.elevated,
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: Colors.glassBorder,
              }}
              onPress={() => {
                Haptics.selectionAsync();
                onSnooze && onSnooze(scheduleItem.service, 0);
              }}
            >
              <Ionicons name="notifications-outline" size={14} color={Colors.textSecondary} />
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginLeft: 4 }]}>
                Unsnooze
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const RecallCheck = ({ vehicleId, vin, make, model, year }) => {
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCachedRecalls();
  }, [vehicleId]);

  const loadCachedRecalls = async () => {
    try {
      const cached = await AsyncStorage.getItem(`recalls_${vehicleId}`);
      if (cached) {
        const data = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(data.timestamp).getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (cacheAge < oneDayMs) {
          setRecalls(data.recalls);
          setLastChecked(new Date(data.timestamp));
          return;
        }
      }
      // If no cache or cache expired, check recalls
      checkRecalls();
    } catch (error) {
      console.error('Error loading cached recalls:', error);
    }
  };

  const checkRecalls = async () => {
    if (!make || !model || !year) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recalls');
      }

      const data = await response.json();
      const recallData = data.results || [];

      // Cache results
      await AsyncStorage.setItem(`recalls_${vehicleId}`, JSON.stringify({
        recalls: recallData,
        timestamp: new Date().toISOString()
      }));

      setRecalls(recallData);
      setLastChecked(new Date());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error checking recalls:', error);
      setError('Failed to check recalls');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric', 
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={{
      marginTop: Spacing.lg,
      backgroundColor: Colors.surface1,
      borderRadius: 12,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: recalls.length > 0 ? Colors.warning + '40' : Colors.glassBorder,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
        <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
          recall alerts {recalls.length > 0 && '⚠️'}
        </Text>
        
        <TouchableOpacity
          onPress={checkRecalls}
          disabled={loading}
          style={{
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            backgroundColor: Colors.primary + '20',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.primary + '30',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={[Typography.caption, { color: Colors.primary }]}>
            {loading ? 'Checking...' : 'Check Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={{
          backgroundColor: Colors.danger + '15',
          borderRadius: 8,
          padding: Spacing.md,
          marginBottom: Spacing.md,
        }}>
          <Text style={[Typography.caption, { color: Colors.danger }]}>
            {error}
          </Text>
        </View>
      )}

      {recalls.length > 0 ? (
        <View>
          <View style={{
            backgroundColor: Colors.warning + '15',
            borderRadius: 8,
            padding: Spacing.md,
            marginBottom: Spacing.md,
            borderWidth: 1,
            borderColor: Colors.warning + '30',
          }}>
            <Text style={[Typography.body, { color: Colors.warning, fontFamily: 'Nunito_600SemiBold' }]}>
              {recalls.length} active recall{recalls.length !== 1 ? 's' : ''} found
            </Text>
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: 2 }]}>
              Contact your dealer for service
            </Text>
          </View>

          {recalls.slice(0, 3).map((recall, index) => (
            <View key={index} style={{
              backgroundColor: Colors.surface2,
              borderRadius: 8,
              padding: Spacing.md,
              marginBottom: index < Math.min(recalls.length, 3) - 1 ? Spacing.sm : 0,
            }}>
              <Text style={[Typography.body, { color: Colors.textPrimary, marginBottom: Spacing.xs }]}>
                {recall.Summary || 'Recall Notice'}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                  {recall.Component || 'Component not specified'}
                </Text>
                <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                  {formatDate(recall.ReportReceivedDate)}
                </Text>
              </View>

              {recall.Remedy && (
                <Text style={[Typography.small, { color: Colors.textSecondary, marginTop: Spacing.xs }]}>
                  Remedy: {recall.Remedy}
                </Text>
              )}
            </View>
          ))}

          {recalls.length > 3 && (
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center' }]}>
              +{recalls.length - 3} more recall{recalls.length - 3 !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      ) : !loading && (
        <Text style={[Typography.caption, { color: Colors.success }]}>
          No active recalls found ✓
        </Text>
      )}

      {lastChecked && (
        <Text style={[Typography.small, { color: Colors.textTertiary, marginTop: Spacing.sm, textAlign: 'center' }]}>
          Last checked: {formatDate(lastChecked.toISOString())}
        </Text>
      )}
    </View>
  );
};

const MaintenanceReminders = ({ vehicleId }) => {
  const [reminders, setReminders] = useState([]);
  const [newReminderForm, setNewReminderForm] = useState({
    serviceType: '',
    intervalMiles: '',
    intervalMonths: '',
    enabled: true
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const commonServices = [
    'Oil Change',
    'Tire Rotation', 
    'Brake Inspection',
    'Multi-Point Inspection',
    'Air Filter',
    'Cabin Air Filter',
    'Transmission Fluid',
    'Coolant Flush',
    'Spark Plugs',
    'Battery Check',
    'Brake Fluid'
  ];

  useEffect(() => {
    loadReminders();
  }, [vehicleId]);

  const loadReminders = async () => {
    try {
      const vehicleReminders = await ReminderStorage.getByVehicleId(vehicleId);
      setReminders(vehicleReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminderForm.serviceType || (!newReminderForm.intervalMiles && !newReminderForm.intervalMonths)) {
      Alert.alert('Error', 'Please fill in service type and at least one interval');
      return;
    }

    try {
      await ReminderStorage.add({
        vehicleId,
        serviceType: newReminderForm.serviceType,
        intervalMiles: newReminderForm.intervalMiles ? parseInt(newReminderForm.intervalMiles) : null,
        intervalMonths: newReminderForm.intervalMonths ? parseInt(newReminderForm.intervalMonths) : null,
        enabled: newReminderForm.enabled
      });

      setNewReminderForm({
        serviceType: '',
        intervalMiles: '',
        intervalMonths: '',
        enabled: true
      });
      setShowAddForm(false);
      loadReminders();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error adding reminder:', error);
      Alert.alert('Error', 'Failed to add reminder');
    }
  };

  const handleToggleReminder = async (reminderId, enabled) => {
    try {
      await ReminderStorage.update(reminderId, { enabled });
      loadReminders();
      Haptics.selectionAsync();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await ReminderStorage.delete(reminderId);
      loadReminders();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  return (
    <View>
      {/* Existing Reminders */}
      {reminders.map((reminder) => (
        <View key={reminder.id} style={{
          backgroundColor: Colors.surface1,
          borderRadius: 12,
          padding: Spacing.md,
          marginBottom: Spacing.md,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
          opacity: reminder.enabled ? 1 : 0.6
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                {reminder.serviceType}
              </Text>
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                Every {reminder.intervalMiles?.toLocaleString() || '---'} miles{reminder.intervalMonths ? ` or ${reminder.intervalMonths} months` : ''}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Switch
                value={reminder.enabled}
                onValueChange={(enabled) => handleToggleReminder(reminder.id, enabled)}
                trackColor={{ false: Colors.surface3, true: Colors.primary + '40' }}
                thumbColor={reminder.enabled ? Colors.primary : Colors.textSecondary}
                ios_backgroundColor={Colors.surface3}
                style={{ marginRight: Spacing.sm }}
              />
              
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Delete Reminder',
                    `Remove reminder for ${reminder.serviceType}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => handleDeleteReminder(reminder.id) }
                    ]
                  );
                }}
                style={{ padding: 4 }}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* Add New Reminder */}
      {!showAddForm ? (
        <TouchableOpacity
          style={[Shared.buttonSecondary, { marginTop: reminders.length > 0 ? Spacing.md : 0 }]}
          onPress={() => setShowAddForm(true)}
          activeOpacity={0.8}
        >
          <Text style={[Typography.body, { color: Colors.primary }]}>
            add maintenance reminder
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{
          backgroundColor: Colors.surface2,
          borderRadius: 12,
          padding: Spacing.lg,
          marginTop: reminders.length > 0 ? Spacing.md : 0,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.lg }]}>
            New Reminder
          </Text>

          {/* Service Type Picker */}
          <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
            Service Type
          </Text>
          <View style={{ marginBottom: Spacing.md }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {commonServices.map((service) => (
                  <TouchableOpacity
                    key={service}
                    onPress={() => setNewReminderForm(prev => ({ ...prev, serviceType: service }))}
                    style={{
                      paddingHorizontal: Spacing.md,
                      paddingVertical: Spacing.sm,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: newReminderForm.serviceType === service ? Colors.primary : Colors.glassBorder,
                      backgroundColor: newReminderForm.serviceType === service ? Colors.primary + '20' : Colors.surface1,
                    }}
                  >
                    <Text style={[Typography.caption, { 
                      color: newReminderForm.serviceType === service ? Colors.primary : Colors.textPrimary 
                    }]}>
                      {service}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Intervals */}
          <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                Miles Interval
              </Text>
              <TextInput
                style={[Shared.input, { textAlign: 'center' }]}
                placeholder="5000"
                placeholderTextColor={Colors.textTertiary}
                value={newReminderForm.intervalMiles}
                onChangeText={(value) => setNewReminderForm(prev => ({ ...prev, intervalMiles: value }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                Months Interval
              </Text>
              <TextInput
                style={[Shared.input, { textAlign: 'center' }]}
                placeholder="6"
                placeholderTextColor={Colors.textTertiary}
                value={newReminderForm.intervalMonths}
                onChangeText={(value) => setNewReminderForm(prev => ({ ...prev, intervalMonths: value }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <TouchableOpacity
              style={[Shared.buttonSecondary, { flex: 1 }]}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={[Typography.body, { color: Colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[Shared.buttonPrimary, { flex: 1 }]}
              onPress={handleAddReminder}
            >
              <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {reminders.length === 0 && !showAddForm && (
        <Text style={[Typography.caption, { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md }]}>
          No maintenance reminders set up yet
        </Text>
      )}
    </View>
  );
};

export default function VehicleDetailModal({ visible, onClose, vehicle, onVehicleUpdated, onLogService, onServiceLogged }) {
  const [vehicleData, setVehicleData] = useState(null);
  const [services, setServices] = useState([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [isGenericSchedule, setIsGenericSchedule] = useState(false);
  const [snoozeData, setSnoozeData] = useState({});
  const [healthScore, setHealthScore] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    currentMileage: '',
    vin: '',
    location: '',
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    conditionWhenPurchased: '',
    purchasePrice: '',
    knownIssues: '',
    accidentHistory: '',
    modifications: '',
    smokerVehicle: '',
    petsTransported: '',
    primaryUse: [],
  });
  const [servicePhotosMap, setServicePhotosMap] = useState({});
  const [fuelLogs, setFuelLogs] = useState([]);
  const [issues, setIssues] = useState([]);
  const [showLogServiceModal, setShowLogServiceModal] = useState(false);
  const [preselectedServiceType, setPreselectedServiceType] = useState(null);
  const [showLogFuelModal, setShowLogFuelModal] = useState(false);
  const [editingFuelLog, setEditingFuelLog] = useState(null);
  const [showLogIssueModal, setShowLogIssueModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [showTakeSnapshotModal, setShowTakeSnapshotModal] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [editServicePhotos, setEditServicePhotos] = useState([]);
  const [serviceEditForm, setServiceEditForm] = useState({
    date: '',
    mileage: '',
    cost: '',
    vendor: '',
    notes: '',
  });

  useEffect(() => {
    if (visible && vehicle) {
      loadVehicleData();
    }
  }, [visible, vehicle]);

  const loadSnoozeData = async (vehicleId) => {
    try {
      const raw = await AsyncStorage.getItem(`snooze_${vehicleId}`);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };

  const handleSnooze = async (serviceName, days) => {
    try {
      const key = `snooze_${vehicle.id}`;
      const current = await loadSnoozeData(vehicle.id);
      
      if (days === 0) {
        delete current[serviceName];
      } else {
        const snoozeUntil = new Date();
        snoozeUntil.setDate(snoozeUntil.getDate() + days);
        current[serviceName] = snoozeUntil.toISOString();
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(current));
      setSnoozeData(current);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error saving snooze:', error);
    }
  };

  const handleQuickLog = (serviceName) => {
    handleLogService(serviceName);
  };

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      
      // Load snooze data
      const snoozed = await loadSnoozeData(vehicle.id);
      setSnoozeData(snoozed);
      
      // Load fresh vehicle data
      const freshVehicle = await VehicleStorage.getById(vehicle.id);
      setVehicleData(freshVehicle);
      
      // Load services
      const vehicleServices = await ServiceStorage.getByVehicleId(vehicle.id);
      setServices(vehicleServices);

      // Load fuel logs
      const vehicleFuelLogs = await FuelStorage.getByVehicleId(vehicle.id);
      setFuelLogs(vehicleFuelLogs);

      // Load issues
      const vehicleIssues = await IssueStorage.getByVehicleId(vehicle.id);
      setIssues(vehicleIssues);

      // Load snapshots
      const vehicleSnapshots = await SnapshotStorage.getByVehicleId(vehicle.id);
      setSnapshots(vehicleSnapshots);

      // Load photos for all services
      const photosMap = {};
      for (const svc of vehicleServices) {
        const photos = await ImageStorage.getByServiceId(svc.id);
        if (photos.length > 0) photosMap[svc.id] = photos;
      }
      setServicePhotosMap(photosMap);

      // Load reminders
      try {
        const remRaw = await AsyncStorage.getItem(`reminders_${vehicle.id}`);
        setReminders(remRaw ? JSON.parse(remRaw) : []);
      } catch { setReminders([]); }

      // Load maintenance schedule (manufacturer-specific or generic fallback)
      const { schedule: vehicleSchedule, isGeneric } = getVehicleSchedule(
        freshVehicle.make,
        freshVehicle.model,
        null
      );
      setIsGenericSchedule(isGeneric);
      
      if (vehicleSchedule.length > 0) {
        // Calculate status for each scheduled service
        const scheduleWithStatus = await Promise.all(
          vehicleSchedule.map(async (scheduleItem) => {
            const lastService = vehicleServices
              .filter(s => s.serviceType === scheduleItem.service)
              .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            let status = 'upcoming';
            let nextDueDate = null;

            if (lastService) {
              // Calculate next due date using actual driving pattern
              const lastServiceDate = new Date(lastService.date);
              const milesDriven = freshVehicle.currentMileage - (freshVehicle.initialMileage || 0);
              const daysSinceCreated = Math.max(1, Math.ceil((new Date() - new Date(freshVehicle.createdAt)) / (24*60*60*1000)));
              const dailyMiles = milesDriven > 0 ? milesDriven / daysSinceCreated : 37;
              const mileageDue = new Date();
              mileageDue.setDate(lastServiceDate.getDate() + 
                Math.round(scheduleItem.mileInterval / dailyMiles));
              
              const timeDue = new Date(lastServiceDate);
              timeDue.setMonth(timeDue.getMonth() + scheduleItem.monthInterval);
              
              nextDueDate = mileageDue < timeDue ? mileageDue : timeDue;
              
              const daysUntilDue = Math.ceil((nextDueDate - new Date()) / (24 * 60 * 60 * 1000));
              
              if (daysUntilDue < 0) {
                status = 'overdue';
              } else if (daysUntilDue <= 30) {
                status = 'due_soon';
              } else {
                status = 'completed';
              }
            }

            return {
              ...scheduleItem,
              status,
              lastService,
              nextDueDate,
            };
          })
        );
        
        setMaintenanceSchedule(scheduleWithStatus);
      }

      // Calculate analytics
      const [score, cost] = await Promise.all([
        HealthScore.calculate(freshVehicle.id),
        CostAnalytics.getTotalCost(freshVehicle.id),
      ]);
      
      setHealthScore(score);
      setTotalCost(cost);

      // Set edit form data
      setEditForm({
        nickname: freshVehicle.nickname || '',
        currentMileage: freshVehicle.currentMileage.toString(),
        vin: freshVehicle.vin || '',
        location: freshVehicle.location || '',
      });
      setProfileForm({
        conditionWhenPurchased: freshVehicle.conditionWhenPurchased || '',
        purchasePrice: freshVehicle.purchasePrice?.toString() || '',
        knownIssues: freshVehicle.knownIssues || '',
        accidentHistory: freshVehicle.accidentHistory || '',
        modifications: freshVehicle.modifications || '',
        smokerVehicle: freshVehicle.smokerVehicle || '',
        petsTransported: freshVehicle.petsTransported || '',
        primaryUse: freshVehicle.primaryUse || [],
      });

    } catch (error) {
      console.error('Error loading vehicle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    Haptics.selectionAsync();
  };

  const handleSaveEdit = async () => {
    try {
      const mileage = parseInt(editForm.currentMileage);
      if (isNaN(mileage) || mileage < 0) {
        Alert.alert('Error', 'Please enter a valid mileage');
        return;
      }

      const updates = {
        nickname: editForm.nickname.trim() || undefined,
        currentMileage: mileage,
        vin: editForm.vin.trim() || undefined,
        location: editForm.location.trim() || undefined,
      };

      await VehicleStorage.update(vehicleData.id, updates);
      
      setEditMode(false);
      loadVehicleData(); // Refresh data
      onVehicleUpdated && onVehicleUpdated();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      Alert.alert('Error', 'Failed to update vehicle');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditForm({
      nickname: vehicleData?.nickname || '',
      currentMileage: vehicleData?.currentMileage.toString() || '',
    });
  };

  const handleLogService = (serviceName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPreselectedServiceType(serviceName || null);
    setShowLogServiceModal(true);
  };

  const handleEditService = async (service) => {
    setEditingService(service);
    setServiceEditForm({
      date: service.date ? service.date.split('T')[0] : '',
      mileage: service.mileage?.toString() || '',
      cost: service.cost?.toString() || '',
      vendor: service.vendor || '',
      notes: service.notes || '',
    });
    // Load existing photos for this service
    try {
      const photos = await ImageStorage.getByServiceId(service.id);
      setEditServicePhotos(photos || []);
    } catch { setEditServicePhotos([]); }
    Haptics.selectionAsync();
  };

  const handleSaveServiceEdit = async () => {
    try {
      const mileage = parseInt(serviceEditForm.mileage);
      const cost = parseFloat(serviceEditForm.cost);
      
      if (!serviceEditForm.date) {
        Alert.alert('Error', 'Please enter a valid date');
        return;
      }

      const updates = {
        date: serviceEditForm.date,
        mileage: isNaN(mileage) ? undefined : mileage,
        cost: isNaN(cost) ? undefined : cost,
        vendor: serviceEditForm.vendor.trim() || undefined,
        notes: serviceEditForm.notes.trim() || undefined,
      };

      await ServiceStorage.update(editingService.id, updates);
      setEditingService(null);
      loadVehicleData();
      onVehicleUpdated && onVehicleUpdated();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service');
    }
  };

  const handleAddServicePhoto = async () => {
    if (editServicePhotos.length >= 5) return;
    try {
      Haptics.selectionAsync();
      const imageData = await pickImageAsync();
      if (imageData) {
        const base64 = await convertToBase64(imageData.uri);
        const photoRecord = {
          uri: base64 || imageData.uri,
          serviceId: editingService.id,
          vehicleId: vehicleData.id,
        };
        const saved = await ImageStorage.add(photoRecord);
        setEditServicePhotos(prev => [...prev, saved]);
      }
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  const handleRemoveServicePhoto = async (photoId) => {
    try {
      Haptics.selectionAsync();
      await ImageStorage.delete(photoId);
      setEditServicePhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  const handleDeleteService = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Delete this ${editingService.serviceType} record?`)
      : await new Promise(resolve => {
          Alert.alert(
            'Delete Service',
            `Are you sure you want to delete this ${editingService.serviceType} record?`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmed) return;

    try {
      await ServiceStorage.delete(editingService.id);
      setEditingService(null);
      loadVehicleData();
      onVehicleUpdated && onVehicleUpdated();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert('Error', 'Failed to delete service');
    }
  };

  const handleDeleteVehicle = async () => {
    const name = vehicleData.nickname || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`;
    
    // Use window.confirm on web (Alert with destructive buttons doesn't work reliably on web)
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Delete "${name}" and all its service records? This cannot be undone.`)
      : await new Promise(resolve => {
          Alert.alert(
            'Delete Vehicle',
            `Are you sure you want to delete "${name}" and all its service records? This cannot be undone.`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmed) return;

    try {
      await VehicleStorage.delete(vehicleData.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onClose();
      onVehicleUpdated && onVehicleUpdated();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      Alert.alert('Error', 'Failed to delete vehicle');
    }
  };

  const handleSaveFuelLog = async (logData) => {
    try {
      if (logData._delete) {
        await FuelStorage.delete(logData.id);
      } else if (logData.id) {
        await FuelStorage.update(logData.id, logData);
      } else {
        await FuelStorage.add(logData);
      }
      // Update vehicle odometer if toggle was on
      if (logData._updateOdometer && logData.odometer > 0) {
        await VehicleStorage.update(vehicle.id, { currentMileage: logData.odometer });
        setVehicleData(prev => ({ ...prev, currentMileage: logData.odometer }));
      }
      const updatedLogs = await FuelStorage.getByVehicleId(vehicle.id);
      setFuelLogs(updatedLogs);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving fuel log:', error);
      Alert.alert('Error', 'Failed to save fuel log');
    }
  };

  const handleLogIssue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingIssue(null);
    setShowLogIssueModal(true);
  };

  const handleEditIssue = (issue) => {
    Haptics.selectionAsync();
    setEditingIssue(issue);
    setShowLogIssueModal(true);
  };

  const handleIssueLogged = async () => {
    try {
      const updatedIssues = await IssueStorage.getByVehicleId(vehicle.id);
      setIssues(updatedIssues);
      setShowLogIssueModal(false);
      setEditingIssue(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error refreshing issues:', error);
    }
  };

  const handleSnapshotSave = async (snapshotData) => {
    try {
      await SnapshotStorage.add(snapshotData);
      const updatedSnapshots = await SnapshotStorage.getByVehicleId(vehicle.id);
      setSnapshots(updatedSnapshots);
      setShowTakeSnapshotModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving snapshot:', error);
    }
  };

  if (!vehicleData) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            borderBottomColor: Colors.surface,
            marginBottom: Spacing.xl,
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[Typography.h2, { color: Colors.text }]}>
              Vehicle Details
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              {!editMode && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    generateReport(vehicle.id);
                  }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="share-outline" size={22} color={Colors.steelBlue} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={editMode ? handleSaveEdit : handleEdit}
                style={{ padding: 4 }}
              >
                <Ionicons 
                  name={editMode ? "checkmark" : "create-outline"} 
                  size={24} 
                  color={editMode ? Colors.forestGreen : Colors.steelBlue} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Vehicle Info Section (Collapsible - Default Expanded) */}
            <CollapsibleSection 
              title="Vehicle Info" 
              defaultExpanded={true}
              hasContent={true}
            >
              <View style={{ marginBottom: Spacing.lg }}>
                {/* Photo and Basic Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
                  <TouchableOpacity
                    onPress={async () => {
                      const imageData = await pickImageAsync();
                      if (imageData) {
                        try {
                          const base64Uri = await convertToBase64(imageData.uri);
                          await VehicleStorage.update(vehicleData.id, { photoUri: base64Uri });
                          setVehicleData(prev => ({ ...prev, photoUri: base64Uri }));
                          onVehicleUpdated && onVehicleUpdated();
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch (e) {
                          console.error('Error saving photo:', e);
                        }
                      }
                    }}
                    activeOpacity={0.8}
                    style={{ marginRight: Spacing.lg }}
                  >
                    {vehicleData.photoUri ? (
                      <Image
                        source={{ uri: vehicleData.photoUri }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: Colors.glassBorder,
                        }}
                      />
                    ) : (
                      <View style={{
                        width: 80,
                        height: 80,
                        borderRadius: 16,
                        backgroundColor: Colors.surface1,
                        borderWidth: 1,
                        borderColor: Colors.glassBorder,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Ionicons name="camera-outline" size={28} color={Colors.textTertiary} />
                        <Text style={[Typography.small, { color: Colors.textTertiary, marginTop: 2 }]}>
                          Add Photo
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  <View style={{ flex: 1 }}>
                    {editMode ? (
                      <>
                        <TextInput
                          style={[Shared.input, { marginBottom: Spacing.md }]}
                          placeholder="Nickname (optional)"
                          placeholderTextColor={Colors.arcticSilver}
                          value={editForm.nickname}
                          onChangeText={(value) => setEditForm(prev => ({ ...prev, nickname: value }))}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
                          <TextInput
                            style={[Shared.input, { flex: 1, marginRight: Spacing.sm }]}
                            placeholder="Current mileage"
                            placeholderTextColor={Colors.arcticSilver}
                            value={editForm.currentMileage}
                            onChangeText={(value) => setEditForm(prev => ({ ...prev, currentMileage: value }))}
                            keyboardType="numeric"
                          />
                          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                            miles
                          </Text>
                        </View>
                        <TextInput
                          style={[Shared.input, { marginBottom: Spacing.md }]}
                          placeholder="VIN (optional)"
                          placeholderTextColor={Colors.arcticSilver}
                          value={editForm.vin}
                          onChangeText={(value) => setEditForm(prev => ({ ...prev, vin: value.toUpperCase() }))}
                          autoCapitalize="characters"
                          maxLength={17}
                        />
                        <TextInput
                          style={[Shared.input]}
                          placeholder="Location (e.g. Home garage)"
                          placeholderTextColor={Colors.arcticSilver}
                          value={editForm.location}
                          onChangeText={(value) => setEditForm(prev => ({ ...prev, location: value }))}
                          autoCapitalize="sentences"
                        />
                      </>
                    ) : (
                      <>
                        <Text style={[Typography.h1, { color: Colors.text }]}>
                          {vehicleData.nickname || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`}
                        </Text>
                        {vehicleData.nickname && (
                          <Text style={[Typography.body, { color: Colors.textSecondary }]}>
                            {vehicleData.year} {vehicleData.make} {vehicleData.model}
                          </Text>
                        )}
                        {vehicleData.trim && (
                          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                            {vehicleData.trim}
                          </Text>
                        )}
                        <Text style={[Typography.h2, { color: Colors.steelBlue, marginTop: Spacing.sm }]}>
                          {vehicleData.currentMileage?.toLocaleString() || '---'} miles
                        </Text>
                        {vehicleData.vin && (
                          <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: 4 }]}>
                            VIN: {vehicleData.vin}
                          </Text>
                        )}
                        {vehicleData.location && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                            <Text style={[Typography.caption, { color: Colors.textSecondary, marginLeft: 4 }]}>
                              {vehicleData.location}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </View>

                {editMode && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginBottom: Spacing.lg }}>
                    <TouchableOpacity
                      style={[Shared.buttonSecondary, { flex: 0, paddingHorizontal: Spacing.lg }]}
                      onPress={handleCancelEdit}
                    >
                      <Text style={[Typography.body, { color: Colors.steelBlue }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[Shared.buttonPrimary, { flex: 0, paddingHorizontal: Spacing.xl }]}
                      onPress={handleSaveEdit}
                    >
                      <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Vehicle Profile Fields (Merged into Vehicle Info) */}
                {(() => {
                  const v = vehicleData;
                  const hasProfile = v.conditionWhenPurchased || v.purchasePrice || v.knownIssues || v.accidentHistory || v.modifications || v.smokerVehicle || v.petsTransported || (v.primaryUse && v.primaryUse.length > 0);
                  
                  const ProfileRow = ({ label, value, isEditing, onPress, multiline = false }) => {
                    if (!value && !isEditing) return null;
                    return (
                      <View style={{ 
                        flexDirection: isEditing && multiline ? 'column' : 'row', 
                        justifyContent: 'space-between', 
                        alignItems: isEditing && multiline ? 'flex-start' : 'center',
                        paddingVertical: Spacing.sm,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.glassBorder,
                        marginBottom: Spacing.sm,
                      }}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: isEditing && multiline ? Spacing.xs : 0 }]}>
                          {label}
                        </Text>
                        {isEditing ? (
                          multiline ? (
                            <TextInput
                              style={[Shared.input, { height: 70, textAlignVertical: 'top', paddingTop: Spacing.md }]}
                              placeholder={`Enter ${label.toLowerCase()}`}
                              placeholderTextColor={Colors.arcticSilver}
                              value={value}
                              onChangeText={onPress}
                              multiline
                            />
                          ) : (
                            <TextInput
                              style={[Shared.input, { flex: 1, marginLeft: Spacing.md }]}
                              placeholder={`Enter ${label.toLowerCase()}`}
                              placeholderTextColor={Colors.arcticSilver}
                              value={value}
                              onChangeText={onPress}
                              keyboardType={label.includes('Price') ? 'numeric' : 'default'}
                            />
                          )
                        ) : (
                          <Text style={[Typography.body, { color: Colors.text, flex: 1, textAlign: 'right' }]}>
                            {label.includes('Price') && value ? `$${Number(value).toLocaleString()}` : 
                             Array.isArray(value) ? value.join(', ') : value || '—'}
                          </Text>
                        )}
                      </View>
                    );
                  };

                  if (!hasProfile && !editingProfile) return null;

                  return (
                    <View style={{ marginTop: Spacing.lg }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }}>
                        <Text style={[Typography.h2, { color: Colors.text }]}>Profile Details</Text>
                        <TouchableOpacity onPress={() => {
                          if (editingProfile) {
                            // Save profile changes
                            const updates = {
                              conditionWhenPurchased: profileForm.conditionWhenPurchased || undefined,
                              purchasePrice: profileForm.purchasePrice ? parseFloat(profileForm.purchasePrice) : undefined,
                              knownIssues: profileForm.knownIssues.trim() || undefined,
                              accidentHistory: profileForm.accidentHistory || undefined,
                              modifications: profileForm.modifications.trim() || undefined,
                              smokerVehicle: profileForm.smokerVehicle || undefined,
                              petsTransported: profileForm.petsTransported || undefined,
                              primaryUse: Array.isArray(profileForm.primaryUse) ? (profileForm.primaryUse.length > 0 ? profileForm.primaryUse : undefined) : undefined,
                            };
                            VehicleStorage.update(vehicleData.id, updates).then(() => {
                              setEditingProfile(false);
                              loadVehicleData();
                              onVehicleUpdated && onVehicleUpdated();
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }).catch((e) => console.error('Error saving profile:', e));
                          } else {
                            setEditingProfile(true);
                            Haptics.selectionAsync();
                          }
                        }} style={{ padding: 4 }}>
                          <Ionicons name={editingProfile ? 'checkmark' : 'create-outline'} size={20} color={editingProfile ? Colors.forestGreen : Colors.steelBlue} />
                        </TouchableOpacity>
                      </View>

                      <ProfileRow 
                        label="Condition" 
                        value={editingProfile ? profileForm.conditionWhenPurchased : v.conditionWhenPurchased}
                        isEditing={editingProfile}
                        onPress={(val) => setProfileForm(p => ({ ...p, conditionWhenPurchased: val }))}
                      />
                      <ProfileRow 
                        label="Purchase Price" 
                        value={editingProfile ? profileForm.purchasePrice : v.purchasePrice}
                        isEditing={editingProfile}
                        onPress={(val) => setProfileForm(p => ({ ...p, purchasePrice: val }))}
                      />
                      <ProfileRow 
                        label="Known Issues" 
                        value={editingProfile ? profileForm.knownIssues : v.knownIssues}
                        isEditing={editingProfile}
                        onPress={(val) => setProfileForm(p => ({ ...p, knownIssues: val }))}
                        multiline={true}
                      />
                      <ProfileRow 
                        label="Accident History" 
                        value={editingProfile ? profileForm.accidentHistory : v.accidentHistory}
                        isEditing={editingProfile}
                        onPress={(val) => setProfileForm(p => ({ ...p, accidentHistory: val }))}
                      />
                      <ProfileRow 
                        label="Modifications" 
                        value={editingProfile ? profileForm.modifications : v.modifications}
                        isEditing={editingProfile}
                        onPress={(val) => setProfileForm(p => ({ ...p, modifications: val }))}
                        multiline={true}
                      />
                      <ProfileRow 
                        label="Smoker Vehicle" 
                        value={editingProfile ? profileForm.smokerVehicle : v.smokerVehicle}
                        isEditing={editingProfile}
                        onPress={(val) => setProfileForm(p => ({ ...p, smokerVehicle: val }))}
                      />
                      <ProfileRow 
                        label="Pets Transported" 
                        value={editingProfile ? profileForm.petsTransported : v.petsTransported}
                        isEditing={editingProfile}
                        onPress={(val) => setProfileForm(p => ({ ...p, petsTransported: val }))}
                      />
                      <ProfileRow 
                        label="Primary Use" 
                        value={editingProfile ? profileForm.primaryUse : v.primaryUse}
                        isEditing={editingProfile}
                        onPress={(val) => setProfileForm(p => ({ ...p, primaryUse: val }))}
                      />

                      {editingProfile && (
                        <TouchableOpacity 
                          onPress={() => { 
                            setEditingProfile(false); 
                            setProfileForm({
                              conditionWhenPurchased: v.conditionWhenPurchased || '',
                              purchasePrice: v.purchasePrice?.toString() || '',
                              knownIssues: v.knownIssues || '',
                              accidentHistory: v.accidentHistory || '',
                              modifications: v.modifications || '',
                              smokerVehicle: v.smokerVehicle || '',
                              petsTransported: v.petsTransported || '',
                              primaryUse: v.primaryUse || []
                            });
                          }}
                          style={[Shared.buttonSecondary, { marginTop: Spacing.sm }]}
                        >
                          <Text style={[Typography.body, { color: Colors.steelBlue }]}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })()}

                {/* Cost Summary */}
                {!editMode && (
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-around',
                    paddingTop: Spacing.lg,
                    marginTop: Spacing.lg,
                    borderTopWidth: 1,
                    borderTopColor: Colors.surface,
                  }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[Typography.h2, { color: Colors.forestGreen }]}>
                        ${totalCost.toFixed(2)}
                      </Text>
                      <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                        Total Cost
                      </Text>
                    </View>
                    
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[Typography.h2, { color: Colors.steelBlue }]}>
                        {services.length}
                      </Text>
                      <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                        Services
                      </Text>
                    </View>
                    
                    <View style={{ alignItems: 'center' }}>
                      {(() => {
                        const openIssuesCount = issues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
                        if (openIssuesCount > 0) {
                          return (
                            <>
                              <Text style={[Typography.h2, { color: Colors.deepRed }]}>
                                {openIssuesCount}
                              </Text>
                              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                                Open Issue{openIssuesCount !== 1 ? 's' : ''}
                              </Text>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <Text style={[Typography.h2, { color: Colors.amberAlert }]}>
                                {services.length + fuelLogs.length + issues.length}
                              </Text>
                              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                                Entries
                              </Text>
                            </>
                          );
                        }
                      })()}
                    </View>
                  </View>
                )}

                {/* Recall Check */}
                {vehicleData.vin && (
                  <RecallCheck 
                    vehicleId={vehicleData.id}
                    vin={vehicleData.vin}
                    make={vehicleData.make}
                    model={vehicleData.model}
                    year={vehicleData.year}
                  />
                )}
              </View>
            </CollapsibleSection>

            {!editMode && (
              <>
                {/* Action Buttons — all 3 in one row */}
                <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: Colors.surface1,
                      borderRadius: 16,
                      paddingVertical: Spacing.md,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: Colors.primary + '30',
                    }}
                    onPress={handleLogService}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 22, marginBottom: 4 }}>🔧</Text>
                    <Text style={[Typography.caption, { color: Colors.primary, fontFamily: 'Nunito_600SemiBold' }]}>
                      Service
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: Colors.surface1,
                      borderRadius: 16,
                      paddingVertical: Spacing.md,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: Colors.warning + '30',
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setEditingFuelLog(null);
                      setShowLogFuelModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 22, marginBottom: 4 }}>⛽</Text>
                    <Text style={[Typography.caption, { color: Colors.warning, fontFamily: 'Nunito_600SemiBold' }]}>
                      Fuel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: Colors.surface1,
                      borderRadius: 16,
                      paddingVertical: Spacing.md,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#EF4444' + '30',
                    }}
                    onPress={handleLogIssue}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 22, marginBottom: 4 }}>🚨</Text>
                    <Text style={[Typography.caption, { color: '#EF4444', fontFamily: 'Nunito_600SemiBold' }]}>
                      Issue
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Maintenance Section (Collapsible - Default Collapsed) - Schedule + Reminders merged */}
                <CollapsibleSection 
                  title="Maintenance" 
                  defaultExpanded={false}
                  hasContent={maintenanceSchedule.length > 0 || true}
                >
                  {/* Service Status Summary */}
                  {(() => {
                    const overdueItems = maintenanceSchedule.filter(s => s.status === 'overdue');
                    const dueSoonItems = maintenanceSchedule.filter(s => s.status === 'due_soon');
                    const overdueCount = overdueItems.length;
                    const dueSoonCount = dueSoonItems.length;
                    const statusColor = overdueCount > 0 ? Colors.deepRed : dueSoonCount > 0 ? Colors.amberAlert : Colors.forestGreen;
                    
                    return (
                      <View style={{ 
                        marginBottom: Spacing.lg,
                        backgroundColor: Colors.surface1,
                        borderRadius: 16,
                        padding: Spacing.lg,
                        borderWidth: 1,
                        borderColor: statusColor + '30',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: overdueCount > 0 || dueSoonCount > 0 ? Spacing.md : 0 }}>
                          {overdueCount > 0 ? (
                            <View style={{
                              width: 48, height: 48, borderRadius: 24,
                              backgroundColor: Colors.deepRed + '20',
                              justifyContent: 'center', alignItems: 'center',
                              marginRight: Spacing.md,
                            }}>
                              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 22, color: Colors.deepRed }}>
                                {overdueCount}
                              </Text>
                            </View>
                          ) : dueSoonCount > 0 ? (
                            <View style={{
                              width: 48, height: 48, borderRadius: 24,
                              backgroundColor: Colors.amberAlert + '20',
                              justifyContent: 'center', alignItems: 'center',
                              marginRight: Spacing.md,
                            }}>
                              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 22, color: Colors.amberAlert }}>
                                {dueSoonCount}
                              </Text>
                            </View>
                          ) : (
                            <View style={{
                              width: 48, height: 48, borderRadius: 24,
                              backgroundColor: Colors.forestGreen + '20',
                              justifyContent: 'center', alignItems: 'center',
                              marginRight: Spacing.md,
                            }}>
                              <Ionicons name="checkmark" size={24} color={Colors.forestGreen} />
                            </View>
                          )}
                          
                          <View style={{ flex: 1 }}>
                            <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
                              {overdueCount > 0 
                                ? `${overdueCount} service${overdueCount > 1 ? 's' : ''} overdue`
                                : dueSoonCount > 0
                                  ? `${dueSoonCount} service${dueSoonCount > 1 ? 's' : ''} due soon`
                                  : 'All caught up'}
                            </Text>
                            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                              {overdueCount > 0 
                                ? overdueItems.map(s => s.service).join(', ')
                                : dueSoonCount > 0
                                  ? dueSoonItems.map(s => s.service).join(', ')
                                  : 'No maintenance needed right now'}
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={[Typography.small, { 
                          color: Colors.textTertiary, 
                          marginTop: overdueCount > 0 || dueSoonCount > 0 ? 0 : Spacing.sm,
                        }]}>
                          {services.length} service{services.length !== 1 ? 's' : ''} logged • {isGenericSchedule ? 'based on standard schedule' : 'based on manufacturer schedule'}
                        </Text>
                      </View>
                    );
                  })()}

                  {maintenanceSchedule.length > 0 ? (
                    <>
                      {isGenericSchedule && (
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: Colors.steelBlue + '15',
                          borderRadius: 8,
                          padding: Spacing.md,
                          marginBottom: Spacing.md,
                          borderWidth: 1,
                          borderColor: Colors.steelBlue + '25',
                        }}>
                          <Text style={{ fontSize: 14, marginRight: Spacing.sm }}>📋</Text>
                          <Text style={[Typography.caption, { color: Colors.steelBlue, flex: 1, fontFamily: 'Nunito_400Regular' }]}>
                            Standard maintenance schedule (not model-specific)
                          </Text>
                        </View>
                      )}
                      {maintenanceSchedule.map((scheduleItem, index) => (
                        <MaintenanceScheduleItem
                          key={index}
                          scheduleItem={scheduleItem}
                          status={scheduleItem.status}
                          lastService={scheduleItem.lastService}
                          nextDueDate={scheduleItem.nextDueDate}
                          snoozedUntil={snoozeData[scheduleItem.service]}
                          onSnooze={handleSnooze}
                          onQuickLog={handleQuickLog}
                        />
                      ))}
                    </>
                  ) : (
                    <View style={{
                      backgroundColor: Colors.surface,
                      borderRadius: 8,
                      padding: Spacing.xl,
                      alignItems: 'center',
                    }}>
                      <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center' }]}>
                        No manufacturer maintenance schedule available for this vehicle.
                      </Text>
                    </View>
                  )}
                  {/* Custom Reminders */}
                  <View style={{ marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.glassBorder }}>
                    <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
                      Custom Reminders
                    </Text>
                    <MaintenanceReminders vehicleId={vehicleData.id} />
                  </View>
                </CollapsibleSection>

                {/* Activity Log Section (Collapsible - Default Collapsed) - Merged Fuel + Service History */}
                <CollapsibleSection 
                  title="Activity Log" 
                  defaultExpanded={false}
                  hasContent={services.length > 0 || fuelLogs.length > 0 || issues.length > 0 || snapshots.length > 0}
                >
                  {/* Combined Activity List */}
                  {(() => {
                    // Combine services, fuel logs, issues, and snapshots into one chronologically sorted list
                    const serviceEntries = services.map(s => ({ ...s, _type: 'service' }));
                    const fuelEntries = fuelLogs.map(f => ({ ...f, _type: 'fuel' }));
                    const issueEntries = issues.map(i => ({ ...i, _type: 'issue' }));
                    const snapshotEntries = snapshots.map(s => ({ ...s, _type: 'snapshot' }));
                    const allEntries = [...serviceEntries, ...fuelEntries, ...issueEntries, ...snapshotEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

                    if (allEntries.length === 0) {
                      return (
                        <View style={{
                          backgroundColor: Colors.surface,
                          borderRadius: 8,
                          padding: Spacing.xl,
                          alignItems: 'center',
                        }}>
                          <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }]}>
                            No activity logged yet.
                          </Text>
                          
                          <TouchableOpacity
                            style={Shared.buttonSecondary}
                            onPress={handleLogService}
                            activeOpacity={0.9}
                          >
                            <Text style={[Typography.body, { color: Colors.steelBlue }]}>
                              Log First Activity
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }

                    return allEntries.map((entry) => {
                      if (entry._type === 'fuel') {
                        return (
                          <TouchableOpacity
                            key={`fuel-${entry.id}`}
                            style={[Shared.card, { marginBottom: Spacing.sm }]}
                            onPress={() => {
                              Haptics.selectionAsync();
                              setEditingFuelLog(entry);
                              setShowLogFuelModal(true);
                            }}
                            activeOpacity={0.9}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Text style={{ fontSize: 20, marginRight: Spacing.sm }}>
                                  {entry.type === 'ev_charge' ? '⚡' : '⛽'}
                                </Text>
                                <View>
                                  <Text style={[Typography.body, { color: Colors.textPrimary, fontFamily: 'Nunito_600SemiBold' }]}>
                                    {entry.type === 'ev_charge'
                                      ? `${entry.kWh} kWh`
                                      : `${entry.gallons} gal${entry.fullTank ? '' : ' (partial)'}`}
                                  </Text>
                                  <Text style={[Typography.small, { color: Colors.textSecondary }]}>
                                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    {entry.station ? ` · ${entry.station}` : ''}
                                    {' · '}{entry.odometer?.toLocaleString()} mi
                                  </Text>
                                </View>
                              </View>
                              <Text style={[Typography.h2, { color: Colors.primary }]}>
                                ${entry.totalCost?.toFixed(2)}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      } else if (entry._type === 'issue') {
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
                          <TouchableOpacity
                            key={`issue-${entry.id}`}
                            style={[Shared.card, { marginBottom: Spacing.sm }]}
                            onPress={() => handleEditIssue(entry)}
                            activeOpacity={0.9}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
                                <Text style={{ fontSize: 20, marginRight: Spacing.sm, marginTop: 2 }}>
                                  🚨
                                </Text>
                                <View style={{ flex: 1 }}>
                                  <Text style={[Typography.body, { color: Colors.textPrimary, fontFamily: 'Nunito_600SemiBold' }]}>
                                    {entry.title}
                                  </Text>
                                  <Text style={[Typography.small, { color: Colors.textSecondary, marginTop: 2, lineHeight: 18 }]} numberOfLines={2}>
                                    {entry.description}
                                  </Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs }}>
                                    <View style={{
                                      paddingHorizontal: 8,
                                      paddingVertical: 2,
                                      borderRadius: 8,
                                      backgroundColor: severityColors[entry.severity] + '20',
                                      borderWidth: 1,
                                      borderColor: severityColors[entry.severity] + '40',
                                      marginRight: Spacing.sm,
                                    }}>
                                      <Text style={[Typography.small, { 
                                        color: severityColors[entry.severity],
                                        fontSize: 10,
                                        fontFamily: 'Nunito_600SemiBold',
                                        textTransform: 'uppercase',
                                      }]}>
                                        {entry.severity}
                                      </Text>
                                    </View>
                                    <View style={{
                                      paddingHorizontal: 8,
                                      paddingVertical: 2,
                                      borderRadius: 8,
                                      backgroundColor: statusColors[entry.status] + '20',
                                      borderWidth: 1,
                                      borderColor: statusColors[entry.status] + '40',
                                    }}>
                                      <Text style={[Typography.small, { 
                                        color: statusColors[entry.status],
                                        fontSize: 10,
                                        fontFamily: 'Nunito_600SemiBold',
                                        textTransform: 'uppercase',
                                      }]}>
                                        {entry.status === 'in_progress' ? 'in progress' : entry.status}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text style={[Typography.small, { color: Colors.textSecondary, marginTop: 2 }]}>
                                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    {entry.odometer ? ` • ${entry.odometer.toLocaleString()} mi` : ''}
                                    {entry.history && entry.history.length > 1 ? ` • ${entry.history.length} updates` : ''}
                                  </Text>
                                  {/* Show latest history note if exists */}
                                  {(() => {
                                    const latestNote = entry.history && [...entry.history].reverse().find(h => h.type === 'note');
                                    if (latestNote) {
                                      return (
                                        <View style={{ 
                                          marginTop: Spacing.xs, 
                                          paddingTop: Spacing.xs, 
                                          borderTopWidth: 1, 
                                          borderTopColor: Colors.glassBorder,
                                        }}>
                                          <Text style={[Typography.small, { color: Colors.textTertiary, fontStyle: 'italic' }]} numberOfLines={1}>
                                            💬 {latestNote.note}
                                          </Text>
                                        </View>
                                      );
                                    }
                                    return null;
                                  })()}
                                </View>
                              </View>
                              {entry.cost && (
                                <Text style={[Typography.h2, { color: Colors.primary }]}>
                                  ${entry.cost.toFixed(2)}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      } else if (entry._type === 'snapshot') {
                        const conditionColors = {
                          excellent: Colors.success,
                          good: Colors.primary,
                          fair: Colors.warning,
                          poor: Colors.danger,
                        };
                        return (
                          <View
                            key={`snapshot-${entry.id}`}
                            style={[Shared.card, { marginBottom: Spacing.sm, borderLeftWidth: 3, borderLeftColor: conditionColors[entry.condition] || Colors.primary }]}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                              <Text style={{ fontSize: 24, marginRight: Spacing.sm }}>📸</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: 2 }]}>
                                  {entry.title}
                                </Text>
                                <Text style={[Typography.small, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  {' · '}{entry.odometer?.toLocaleString()} mi
                                  {' · '}{entry.condition}
                                </Text>
                                {entry.notes && (
                                  <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                                    {entry.notes}
                                  </Text>
                                )}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.sm }}>
                                  {entry.openIssuesCount > 0 && (
                                    <Text style={[Typography.small, { color: Colors.danger }]}>
                                      {entry.openIssuesCount} open issue{entry.openIssuesCount !== 1 ? 's' : ''}
                                    </Text>
                                  )}
                                  {entry.totalSpent > 0 && (
                                    <Text style={[Typography.small, { color: Colors.textSecondary }]}>
                                      ${entry.totalSpent.toFixed(0)} spent
                                    </Text>
                                  )}
                                  {entry.fuelEfficiency && (
                                    <Text style={[Typography.small, { color: Colors.success }]}>
                                      {entry.fuelEfficiency.toFixed(1)} MPG
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      } else {
                        return (
                          <ServiceHistoryItem
                            key={`service-${entry.id}`}
                            service={entry}
                            onEdit={handleEditService}
                            servicePhotos={servicePhotosMap[entry.id] || []}
                          />
                        );
                      }
                    });
                  })()}
                </CollapsibleSection>

                {/* Reports & Export Section (Collapsible - Default Collapsed) */}
                <CollapsibleSection 
                  title="Reports & Export" 
                  defaultExpanded={false}
                  hasContent={true}
                >
                  <TouchableOpacity
                    style={[Shared.buttonSecondary, { marginBottom: Spacing.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setShowTakeSnapshotModal(true);
                    }}
                    activeOpacity={0.9}
                  >
                    <Text style={{ fontSize: 18, marginRight: Spacing.sm }}>📸</Text>
                    <Text style={[Typography.h2, { color: Colors.primary }]}>
                      Take Snapshot
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[Shared.buttonSecondary, { marginBottom: Spacing.lg, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      generateReport(vehicleData.id);
                    }}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="document-text-outline" size={20} color={Colors.steelBlue} style={{ marginRight: Spacing.sm }} />
                    <Text style={[Typography.h2, { color: Colors.steelBlue }]}>
                      Generate Report
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Delete Vehicle */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: Spacing.lg,
                    }}
                    onPress={handleDeleteVehicle}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.deepRed} style={{ marginRight: Spacing.sm }} />
                    <Text style={[Typography.body, { color: Colors.deepRed }]}>
                      Delete Vehicle
                    </Text>
                  </TouchableOpacity>
                </CollapsibleSection>

                {/* Bottom spacing */}
                <View style={{ height: 100 }} />
              </>
            )}
          </ScrollView>

          {/* Edit Service Modal */}
          <Modal
            visible={editingService !== null}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setEditingService(null)}
          >
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  borderBottomColor: Colors.surface,
                  marginBottom: Spacing.xl,
                }}>
                  <TouchableOpacity
                    onPress={() => setEditingService(null)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>

                  <Text style={[Typography.h2, { color: Colors.text }]}>
                    Edit Service
                  </Text>

                  <TouchableOpacity
                    onPress={handleSaveServiceEdit}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="checkmark" size={24} color={Colors.forestGreen} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {editingService && (
                    <View style={[Shared.card]}>
                      {/* Service Type (read-only) */}
                      <View style={{ marginBottom: Spacing.lg }}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                          Service Type
                        </Text>
                        <View style={{
                          backgroundColor: Colors.surface,
                          borderRadius: 16,
                          height: 48,
                          paddingHorizontal: Spacing.lg,
                          justifyContent: 'center',
                        }}>
                          <Text style={[Typography.body, { color: Colors.textSecondary }]}>
                            {editingService.serviceType}
                          </Text>
                        </View>
                      </View>

                      {/* Date */}
                      <View style={{ marginBottom: Spacing.lg }}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                          Date
                        </Text>
                        <DatePickerField
                          value={serviceEditForm.date}
                          onChange={(v) => setServiceEditForm(prev => ({ ...prev, date: v }))}
                        />
                      </View>

                      {/* Mileage */}
                      <View style={{ marginBottom: Spacing.lg }}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                          Mileage
                        </Text>
                        <TextInput
                          style={Shared.input}
                          placeholder="50000"
                          placeholderTextColor={Colors.arcticSilver}
                          value={serviceEditForm.mileage}
                          onChangeText={(v) => setServiceEditForm(prev => ({ ...prev, mileage: v }))}
                          keyboardType="numeric"
                        />
                      </View>

                      {/* Cost */}
                      <View style={{ marginBottom: Spacing.lg }}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                          Cost ($)
                        </Text>
                        <TextInput
                          style={Shared.input}
                          placeholder="75.00"
                          placeholderTextColor={Colors.arcticSilver}
                          value={serviceEditForm.cost}
                          onChangeText={(v) => setServiceEditForm(prev => ({ ...prev, cost: v }))}
                          keyboardType="decimal-pad"
                        />
                      </View>

                      {/* Vendor */}
                      <View style={{ marginBottom: Spacing.lg }}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                          Vendor
                        </Text>
                        <TextInput
                          style={Shared.input}
                          placeholder="Shop name"
                          placeholderTextColor={Colors.arcticSilver}
                          value={serviceEditForm.vendor}
                          onChangeText={(v) => setServiceEditForm(prev => ({ ...prev, vendor: v }))}
                        />
                      </View>

                      {/* Notes */}
                      <View style={{ marginBottom: Spacing.xl }}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                          Notes
                        </Text>
                        <TextInput
                          style={[Shared.input, { height: 80, textAlignVertical: 'top', paddingTop: Spacing.md }]}
                          placeholder="Additional notes..."
                          placeholderTextColor={Colors.arcticSilver}
                          value={serviceEditForm.notes}
                          onChangeText={(v) => setServiceEditForm(prev => ({ ...prev, notes: v }))}
                          multiline
                        />
                      </View>

                      {/* Photos */}
                      <View style={{ marginBottom: Spacing.xl }}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                          Photos ({editServicePhotos.length}/5)
                        </Text>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {editServicePhotos.map((photo) => (
                            <View key={photo.id} style={{ marginRight: Spacing.sm, position: 'relative' }}>
                              <Image
                                source={{ uri: photo.uri }}
                                style={{
                                  width: 70,
                                  height: 70,
                                  borderRadius: 10,
                                  borderWidth: 1,
                                  borderColor: Colors.glassBorder,
                                }}
                              />
                              <TouchableOpacity
                                style={{
                                  position: 'absolute',
                                  top: -6,
                                  right: -6,
                                  width: 22,
                                  height: 22,
                                  borderRadius: 11,
                                  backgroundColor: Colors.deepRed,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                                onPress={() => handleRemoveServicePhoto(photo.id)}
                              >
                                <Ionicons name="close" size={14} color={Colors.textPrimary} />
                              </TouchableOpacity>
                            </View>
                          ))}
                          
                          {editServicePhotos.length < 5 && (
                            <TouchableOpacity
                              style={{
                                width: 70,
                                height: 70,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: Colors.glassBorder,
                                borderStyle: 'dashed',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: Colors.surface1,
                              }}
                              onPress={handleAddServicePhoto}
                            >
                              <Ionicons name="camera-outline" size={22} color={Colors.textSecondary} />
                              <Text style={[Typography.small, { color: Colors.textSecondary, marginTop: 2 }]}>
                                Add
                              </Text>
                            </TouchableOpacity>
                          )}
                        </ScrollView>
                      </View>

                      {/* Delete Service Button */}
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: Spacing.lg,
                          borderTopWidth: 1,
                          borderTopColor: Colors.surface,
                          marginTop: Spacing.md,
                        }}
                        onPress={handleDeleteService}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color={Colors.deepRed} style={{ marginRight: Spacing.sm }} />
                        <Text style={[Typography.body, { color: Colors.deepRed }]}>
                          Delete Service Record
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Log Fuel Modal */}
          <LogServiceModal
            visible={showLogServiceModal}
            onClose={() => { setShowLogServiceModal(false); setPreselectedServiceType(null); }}
            onServiceLogged={(savedService) => {
              setShowLogServiceModal(false);
              setPreselectedServiceType(null);
              // Refresh data
              loadVehicleData();
              // Notify parent to refresh
              onServiceLogged && onServiceLogged();
            }}
            preselectedVehicle={vehicleData}
            preselectedServiceType={preselectedServiceType}
          />

          <LogFuelModal
            visible={showLogFuelModal}
            onClose={() => { setShowLogFuelModal(false); setEditingFuelLog(null); }}
            onSave={handleSaveFuelLog}
            vehicle={vehicleData}
            editLog={editingFuelLog}
          />

          <LogIssueModal
            visible={showLogIssueModal}
            onClose={() => { setShowLogIssueModal(false); setEditingIssue(null); }}
            onIssueLogged={handleIssueLogged}
            vehicles={[vehicleData]}
            selectedVehicle={vehicleData}
            editingIssue={editingIssue}
          />

          <TakeSnapshotModal
            visible={showTakeSnapshotModal}
            onClose={() => setShowTakeSnapshotModal(false)}
            onSave={handleSnapshotSave}
            vehicle={vehicleData}
            vehicleStats={{
              openIssuesCount: issues.filter(i => i.status !== 'resolved').length,
              totalSpent: totalCost,
              latestMPG: null,
            }}
          />

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

