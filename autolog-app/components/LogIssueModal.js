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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../theme';
import { IssueStorage, ServiceStorage } from '../lib/storage';

const SEVERITY_OPTIONS = [
  { key: 'minor', label: 'Minor', color: '#3B82F6', description: 'Small cosmetic or convenience issue' },
  { key: 'moderate', label: 'Moderate', color: '#EAB308', description: 'Affects comfort or minor functionality' },
  { key: 'serious', label: 'Serious', color: '#F97316', description: 'Affects safety or major functionality' },
  { key: 'critical', label: 'Critical', color: '#EF4444', description: 'Immediate safety concern' },
];

const STATUS_OPTIONS = [
  { key: 'open', label: 'Open', description: 'Issue identified, not yet being worked on' },
  { key: 'in_progress', label: 'In Progress', description: 'Actively working on resolving' },
  { key: 'resolved', label: 'Resolved', description: 'Issue has been fixed' },
];

const SeverityPicker = ({ value, onSelect }) => (
  <View>
    <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
      Severity
    </Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
      {SEVERITY_OPTIONS.map((option) => {
        const isSelected = value === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(option.key);
            }}
            style={{
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
              borderRadius: 20,
              backgroundColor: isSelected ? option.color + '20' : Colors.surface1,
              borderWidth: 1.5,
              borderColor: isSelected ? option.color : Colors.glassBorder,
              minWidth: 80,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text style={[Typography.caption, { 
              color: isSelected ? option.color : Colors.textSecondary,
              fontFamily: isSelected ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
            }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
    {value && (
      <Text style={[Typography.small, { 
        color: Colors.textTertiary, 
        marginTop: Spacing.xs,
        fontStyle: 'italic',
      }]}>
        {SEVERITY_OPTIONS.find(o => o.key === value)?.description}
      </Text>
    )}
  </View>
);

const StatusPicker = ({ value, onSelect, disabled = false }) => (
  <View style={{ opacity: disabled ? 0.6 : 1 }}>
    <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
      Status
    </Text>
    <View style={{ gap: Spacing.sm }}>
      {STATUS_OPTIONS.map((option) => {
        const isSelected = value === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => {
              if (!disabled) {
                Haptics.selectionAsync();
                onSelect(option.key);
              }
            }}
            style={{
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.lg,
              borderRadius: 12,
              backgroundColor: isSelected ? Colors.primary + '20' : Colors.surface1,
              borderWidth: 1,
              borderColor: isSelected ? Colors.primary : Colors.glassBorder,
            }}
            activeOpacity={disabled ? 1 : 0.8}
            disabled={disabled}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={[Typography.body, { 
                  color: isSelected ? Colors.primary : Colors.textPrimary,
                  fontFamily: isSelected ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
                }]}>
                  {option.label}
                </Text>
                <Text style={[Typography.small, { color: Colors.textSecondary, marginTop: 2 }]}>
                  {option.description}
                </Text>
              </View>
              {isSelected && (
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: Colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Ionicons name="checkmark" size={12} color={Colors.pearlWhite} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default function LogIssueModal({ 
  visible, 
  onClose, 
  onIssueLogged, 
  vehicles, 
  selectedVehicle,
  editingIssue = null,
}) {
  const [form, setForm] = useState({
    vehicleId: selectedVehicle?.id || '',
    title: '',
    description: '',
    severity: 'moderate',
    status: 'open',
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    cost: '',
    resolvedServiceId: '',
  });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!editingIssue;

  useEffect(() => {
    if (visible) {
      if (editingIssue) {
        setForm({
          vehicleId: editingIssue.vehicleId,
          title: editingIssue.title || '',
          description: editingIssue.description || '',
          severity: editingIssue.severity || 'moderate',
          status: editingIssue.status || 'open',
          date: editingIssue.date?.split('T')[0] || new Date().toISOString().split('T')[0],
          odometer: editingIssue.odometer?.toString() || '',
          cost: editingIssue.cost?.toString() || '',
          resolvedServiceId: editingIssue.resolvedServiceId || '',
        });
        loadServices(editingIssue.vehicleId);
      } else {
        setForm({
          vehicleId: selectedVehicle?.id || '',
          title: '',
          description: '',
          severity: 'moderate',
          status: 'open',
          date: new Date().toISOString().split('T')[0],
          odometer: '',
          cost: '',
          resolvedServiceId: '',
        });
      }
      setErrors({});
    }
  }, [visible, editingIssue, selectedVehicle]);

  const loadServices = async (vehicleId) => {
    if (!vehicleId) return;
    try {
      const allServices = await ServiceStorage.getAll();
      const vehicleServices = allServices
        .filter(s => s.vehicleId === vehicleId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setServices(vehicleServices);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  useEffect(() => {
    if (form.vehicleId) {
      loadServices(form.vehicleId);
    }
  }, [form.vehicleId]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!form.vehicleId) {
      newErrors.vehicleId = 'Please select a vehicle';
    }
    if (form.odometer && (isNaN(parseInt(form.odometer)) || parseInt(form.odometer) < 0)) {
      newErrors.odometer = 'Please enter a valid mileage';
    }
    if (form.cost && (isNaN(parseFloat(form.cost)) || parseFloat(form.cost) < 0)) {
      newErrors.cost = 'Please enter a valid cost';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const issueData = {
        vehicleId: form.vehicleId,
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
        status: form.status,
        date: form.date + 'T00:00:00.000Z',
        odometer: form.odometer ? parseInt(form.odometer) : undefined,
        cost: form.cost ? parseFloat(form.cost) : undefined,
        resolvedServiceId: form.resolvedServiceId || undefined,
      };

      if (isEditing) {
        await IssueStorage.update(editingIssue.id, issueData);
      } else {
        await IssueStorage.add(issueData);
      }

      onIssueLogged && onIssueLogged();
      onClose();
    } catch (error) {
      console.error('Error saving issue:', error);
      Alert.alert('Error', 'Failed to save issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicleObject = vehicles.find(v => v.id === form.vehicleId);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          {/* Header */}
          <View style={[Shared.modalHeader, { 
            borderBottomWidth: 1, 
            borderBottomColor: Colors.glassBorder,
            paddingBottom: Spacing.lg,
          }]}>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <Text style={[Typography.h1, { color: Colors.textPrimary }]}>
              {isEditing ? 'Edit Issue' : 'Log Issue'}
            </Text>
            
            <TouchableOpacity 
              onPress={handleSave}
              style={{ padding: 4, opacity: loading ? 0.6 : 1 }}
              disabled={loading}
            >
              <Ionicons name="checkmark" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flex: 1, padding: Spacing.horizontal }}
            showsVerticalScrollIndicator={false}
          >
            {/* Vehicle Selector */}
            {!isEditing && vehicles.length > 1 && (
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                  Vehicle
                </Text>
                <View style={{ gap: Spacing.sm }}>
                  {vehicles.map((vehicle) => (
                    <TouchableOpacity
                      key={vehicle.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setForm(prev => ({ ...prev, vehicleId: vehicle.id }));
                      }}
                      style={{
                        paddingVertical: Spacing.md,
                        paddingHorizontal: Spacing.lg,
                        borderRadius: 12,
                        backgroundColor: form.vehicleId === vehicle.id ? Colors.primary + '20' : Colors.surface1,
                        borderWidth: 1,
                        borderColor: form.vehicleId === vehicle.id ? Colors.primary : Colors.glassBorder,
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[Typography.body, { 
                        color: form.vehicleId === vehicle.id ? Colors.primary : Colors.textPrimary 
                      }]}>
                        {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.vehicleId && (
                  <Text style={[Typography.small, { color: Colors.danger, marginTop: Spacing.xs }]}>
                    {errors.vehicleId}
                  </Text>
                )}
              </View>
            )}

            {selectedVehicleObject && (
              <View style={[Shared.card, { marginBottom: Spacing.lg }]}>
                <Text style={[Typography.body, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                  Selected Vehicle
                </Text>
                <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
                  {selectedVehicleObject.nickname || `${selectedVehicleObject.year} ${selectedVehicleObject.make} ${selectedVehicleObject.model}`}
                </Text>
              </View>
            )}

            {/* Title */}
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                Issue Title *
              </Text>
              <TextInput
                style={[Shared.input, errors.title && { borderColor: Colors.danger }]}
                placeholder="e.g., Strange noise when braking"
                placeholderTextColor={Colors.textTertiary}
                value={form.title}
                onChangeText={(value) => setForm(prev => ({ ...prev, title: value }))}
                autoCapitalize="sentences"
              />
              {errors.title && (
                <Text style={[Typography.small, { color: Colors.danger, marginTop: Spacing.xs }]}>
                  {errors.title}
                </Text>
              )}
            </View>

            {/* Description */}
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                Description *
              </Text>
              <TextInput
                style={[Shared.input, { 
                  height: 100, 
                  textAlignVertical: 'top', 
                  paddingTop: Spacing.md 
                }, errors.description && { borderColor: Colors.danger }]}
                placeholder="Describe the issue in detail..."
                placeholderTextColor={Colors.textTertiary}
                value={form.description}
                onChangeText={(value) => setForm(prev => ({ ...prev, description: value }))}
                multiline
                autoCapitalize="sentences"
              />
              {errors.description && (
                <Text style={[Typography.small, { color: Colors.danger, marginTop: Spacing.xs }]}>
                  {errors.description}
                </Text>
              )}
            </View>

            {/* Severity */}
            <View style={{ marginBottom: Spacing.lg }}>
              <SeverityPicker 
                value={form.severity}
                onSelect={(severity) => setForm(prev => ({ ...prev, severity }))}
              />
            </View>

            {/* Status (only when editing) */}
            {isEditing && (
              <View style={{ marginBottom: Spacing.lg }}>
                <StatusPicker 
                  value={form.status}
                  onSelect={(status) => setForm(prev => ({ ...prev, status }))}
                />
              </View>
            )}

            {/* Date and Odometer */}
            <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                  Date
                </Text>
                <TextInput
                  style={Shared.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textTertiary}
                  value={form.date}
                  onChangeText={(value) => setForm(prev => ({ ...prev, date: value }))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                  Odometer
                </Text>
                <TextInput
                  style={[Shared.input, errors.odometer && { borderColor: Colors.danger }]}
                  placeholder="Miles"
                  placeholderTextColor={Colors.textTertiary}
                  value={form.odometer}
                  onChangeText={(value) => setForm(prev => ({ ...prev, odometer: value }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
            {errors.odometer && (
              <Text style={[Typography.small, { color: Colors.danger, marginTop: -Spacing.md, marginBottom: Spacing.lg }]}>
                {errors.odometer}
              </Text>
            )}

            {/* Estimated/Actual Cost */}
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                {form.status === 'resolved' ? 'Actual Cost' : 'Estimated Cost'}
              </Text>
              <TextInput
                style={[Shared.input, errors.cost && { borderColor: Colors.danger }]}
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
                value={form.cost}
                onChangeText={(value) => setForm(prev => ({ ...prev, cost: value }))}
                keyboardType="numeric"
              />
              {errors.cost && (
                <Text style={[Typography.small, { color: Colors.danger, marginTop: Spacing.xs }]}>
                  {errors.cost}
                </Text>
              )}
            </View>

            {/* Service Link (when resolved) */}
            {isEditing && form.status === 'resolved' && services.length > 0 && (
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                  Link to Service Record (Optional)
                </Text>
                <View style={{ gap: Spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      setForm(prev => ({ ...prev, resolvedServiceId: '' }));
                    }}
                    style={{
                      paddingVertical: Spacing.md,
                      paddingHorizontal: Spacing.lg,
                      borderRadius: 12,
                      backgroundColor: !form.resolvedServiceId ? Colors.primary + '20' : Colors.surface1,
                      borderWidth: 1,
                      borderColor: !form.resolvedServiceId ? Colors.primary : Colors.glassBorder,
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[Typography.body, { 
                      color: !form.resolvedServiceId ? Colors.primary : Colors.textPrimary 
                    }]}>
                      No linked service
                    </Text>
                  </TouchableOpacity>
                  {services.slice(0, 10).map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setForm(prev => ({ ...prev, resolvedServiceId: service.id }));
                      }}
                      style={{
                        paddingVertical: Spacing.md,
                        paddingHorizontal: Spacing.lg,
                        borderRadius: 12,
                        backgroundColor: form.resolvedServiceId === service.id ? Colors.primary + '20' : Colors.surface1,
                        borderWidth: 1,
                        borderColor: form.resolvedServiceId === service.id ? Colors.primary : Colors.glassBorder,
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[Typography.body, { 
                        color: form.resolvedServiceId === service.id ? Colors.primary : Colors.textPrimary 
                      }]}>
                        {service.serviceType}
                      </Text>
                      <Text style={[Typography.small, { color: Colors.textSecondary, marginTop: 2 }]}>
                        {new Date(service.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {service.cost ? ` • $${service.cost.toFixed(2)}` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Bottom spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}