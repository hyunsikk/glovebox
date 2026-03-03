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
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../theme';
import { ServiceStorage, VehicleStorage } from '../lib/storage';

export default function EditServiceModal({ visible, onClose, service, onServiceUpdated }) {
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    cost: '',
    mileage: '',
    vendor: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (service && visible) {
      // Pre-fill form with service data
      setFormData({
        date: service.date ? new Date(service.date).toISOString().split('T')[0] : '',
        cost: service.cost ? service.cost.toString() : '',
        mileage: service.mileage ? service.mileage.toString() : '',
        vendor: service.vendor || '',
        notes: service.notes || '',
      });

      // Load vehicle data
      loadVehicle();
      setErrors({});
      setShowErrors(false);
    }
  }, [service, visible]);

  const loadVehicle = async () => {
    if (!service?.vehicleId) return;
    
    try {
      const vehicleData = await VehicleStorage.getById(service.vehicleId);
      setVehicle(vehicleData);
    } catch (error) {
      console.error('Error loading vehicle:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    } else {
      const serviceDate = new Date(formData.date);
      const today = new Date();
      if (serviceDate > today) {
        newErrors.date = 'Service date cannot be in the future';
      }
    }

    if (formData.cost && isNaN(parseFloat(formData.cost))) {
      newErrors.cost = 'Please enter a valid cost';
    }

    if (!formData.mileage.trim()) {
      newErrors.mileage = 'Mileage is required';
    } else if (isNaN(parseInt(formData.mileage))) {
      newErrors.mileage = 'Please enter a valid mileage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setShowErrors(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const updates = {
        date: formData.date,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        vendor: formData.vendor.trim() || null,
        notes: formData.notes.trim() || null,
      };

      await ServiceStorage.update(service.id, updates);

      onServiceUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert(
        'Error',
        'Failed to update service. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await ServiceStorage.delete(service.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onServiceUpdated();
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete service');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!service) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 30,
          paddingHorizontal: Spacing.horizontal,
          paddingBottom: Spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: Colors.glassBorder,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ padding: Spacing.sm }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[Typography.h1, { color: Colors.textPrimary }]}>
                edit service
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={handleSave}
              style={{ padding: Spacing.sm }}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={[Typography.h2, { 
                color: loading ? Colors.textTertiary : Colors.primary 
              }]}>
                save
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: Spacing.horizontal, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Info Card */}
          <View style={[Shared.card, { marginTop: Spacing.lg }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
              <View style={{
                backgroundColor: Colors.primary + '20',
                borderRadius: 20,
                padding: 12,
                marginRight: Spacing.md,
                borderWidth: 1,
                borderColor: Colors.primary + '30',
              }}>
                <Ionicons name="build" size={24} color={Colors.primary} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
                  {service.serviceType}
                </Text>
                <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                  {vehicle?.nickname || `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Service Date */}
          <View style={[Shared.card]}>
            <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
              service date
            </Text>
            
            <TextInput
              style={[
                Shared.input,
                showErrors && errors.date && { borderColor: Colors.danger, borderWidth: 2 }
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textTertiary}
              value={formData.date}
              onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
              autoCorrect={false}
              keyboardType="numeric"
            />
            
            {showErrors && errors.date && (
              <Text style={[Typography.caption, { color: Colors.danger, marginTop: Spacing.xs }]}>
                {errors.date}
              </Text>
            )}
            
            {formData.date && !errors.date && (
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: Spacing.xs }]}>
                {formatDate(formData.date)}
              </Text>
            )}
          </View>

          {/* Mileage */}
          <View style={[Shared.card]}>
            <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
              mileage
            </Text>
            
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[
                  Shared.input,
                  { paddingRight: 60 },
                  showErrors && errors.mileage && { borderColor: Colors.danger, borderWidth: 2 }
                ]}
                placeholder="150000"
                placeholderTextColor={Colors.textTertiary}
                value={formData.mileage}
                onChangeText={(text) => setFormData(prev => ({ ...prev, mileage: text }))}
                keyboardType="numeric"
                returnKeyType="next"
              />
              
              <Text style={[Typography.caption, {
                position: 'absolute',
                right: Spacing.lg,
                top: '50%',
                transform: [{ translateY: -8 }],
                color: Colors.textSecondary,
              }]}>
                miles
              </Text>
            </View>
            
            {showErrors && errors.mileage && (
              <Text style={[Typography.caption, { color: Colors.danger, marginTop: Spacing.xs }]}>
                {errors.mileage}
              </Text>
            )}
          </View>

          {/* Cost */}
          <View style={[Shared.card]}>
            <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
              cost <Text style={[Typography.caption, { color: Colors.textTertiary }]}>(optional)</Text>
            </Text>
            
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[
                  Shared.input,
                  { paddingLeft: 40 },
                  showErrors && errors.cost && { borderColor: Colors.danger, borderWidth: 2 }
                ]}
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
                value={formData.cost}
                onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                keyboardType="numeric"
                returnKeyType="next"
              />
              
              <Text style={[Typography.body, {
                position: 'absolute',
                left: Spacing.lg,
                top: '50%',
                transform: [{ translateY: -10 }],
                color: Colors.textSecondary,
              }]}>
                $
              </Text>
            </View>
            
            {showErrors && errors.cost && (
              <Text style={[Typography.caption, { color: Colors.danger, marginTop: Spacing.xs }]}>
                {errors.cost}
              </Text>
            )}
          </View>

          {/* Vendor */}
          <View style={[Shared.card]}>
            <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
              service provider <Text style={[Typography.caption, { color: Colors.textTertiary }]}>(optional)</Text>
            </Text>
            
            <TextInput
              style={Shared.input}
              placeholder="e.g., Joe's Auto, Dealership, DIY"
              placeholderTextColor={Colors.textTertiary}
              value={formData.vendor}
              onChangeText={(text) => setFormData(prev => ({ ...prev, vendor: text }))}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Notes */}
          <View style={[Shared.card]}>
            <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
              notes <Text style={[Typography.caption, { color: Colors.textTertiary }]}>(optional)</Text>
            </Text>
            
            <TextInput
              style={[Shared.input, { 
                height: 80, 
                textAlignVertical: 'top',
                paddingTop: Spacing.md 
              }]}
              placeholder="Any additional details, observations, or reminders..."
              placeholderTextColor={Colors.textTertiary}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={4}
              returnKeyType="done"
            />
          </View>

          {/* Delete Button */}
          <View style={[Shared.card, { marginTop: Spacing.lg }]}>
            <TouchableOpacity
              style={[Shared.buttonDestructive, { marginBottom: 0 }]}
              onPress={handleDelete}
              activeOpacity={0.9}
              disabled={loading}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="trash-outline" size={20} color={Colors.textPrimary} style={{ marginRight: Spacing.sm }} />
                <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
                  delete service
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}