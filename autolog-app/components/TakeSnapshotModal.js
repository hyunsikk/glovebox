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
import { SnapshotStorage, IssueStorage } from '../lib/storage';
import { CostAnalytics } from '../lib/analytics';

const CONDITION_OPTIONS = [
  { 
    key: 'excellent', 
    label: 'Excellent', 
    emoji: '✨', 
    color: '#10B981',
    description: 'Like new condition, no issues',
  },
  { 
    key: 'good', 
    label: 'Good', 
    emoji: '😊', 
    color: '#3B82F6',
    description: 'Minor wear, well maintained',
  },
  { 
    key: 'fair', 
    label: 'Fair', 
    emoji: '😐', 
    color: '#EAB308',
    description: 'Some wear, few minor issues',
  },
  { 
    key: 'poor', 
    label: 'Poor', 
    emoji: '😞', 
    color: '#EF4444',
    description: 'Significant issues, needs attention',
  },
];

const ConditionPicker = ({ value, onSelect }) => (
  <View>
    <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
      Vehicle Condition *
    </Text>
    <View style={{ gap: Spacing.sm }}>
      {CONDITION_OPTIONS.map((option) => {
        const isSelected = value === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(option.key);
            }}
            style={{
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.lg,
              borderRadius: 12,
              backgroundColor: isSelected ? option.color + '20' : Colors.surface1,
              borderWidth: 1.5,
              borderColor: isSelected ? option.color : Colors.glassBorder,
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 20, marginRight: Spacing.sm }}>
                  {option.emoji}
                </Text>
                <View>
                  <Text style={[Typography.body, { 
                    color: isSelected ? option.color : Colors.textPrimary,
                    fontFamily: isSelected ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
                  }]}>
                    {option.label}
                  </Text>
                  <Text style={[Typography.small, { color: Colors.textSecondary, marginTop: 2 }]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              {isSelected && (
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: option.color,
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

export default function TakeSnapshotModal({ 
  visible, 
  onClose, 
  onSnapshotTaken, 
  vehicle,
}) {
  const [form, setForm] = useState({
    title: '',
    condition: 'good',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    odometer: '',
  });
  
  // Auto-populated data
  const [autoData, setAutoData] = useState({
    openIssuesCount: 0,
    totalSpent: 0,
    fuelEfficiency: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible && vehicle) {
      loadCurrentVehicleData();
      setForm({
        title: generateDefaultTitle(),
        condition: 'good',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        odometer: vehicle.currentMileage?.toString() || '',
      });
      setErrors({});
    }
  }, [visible, vehicle]);

  const generateDefaultTitle = () => {
    const date = new Date();
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `${monthYear} Check-in`;
  };

  const loadCurrentVehicleData = async () => {
    if (!vehicle) return;
    
    try {
      // Get open issues count
      const openIssues = await IssueStorage.getOpenByVehicleId(vehicle.id);
      
      // Get total spent
      const totalSpent = await CostAnalytics.getTotalCost(vehicle.id);
      
      // TODO: Get latest fuel efficiency - would need to calculate from recent fuel logs
      // For now, we'll leave this as null
      
      setAutoData({
        openIssuesCount: openIssues.length,
        totalSpent: totalSpent,
        fuelEfficiency: null,
      });
    } catch (error) {
      console.error('Error loading current vehicle data:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (form.odometer && (isNaN(parseInt(form.odometer)) || parseInt(form.odometer) < 0)) {
      newErrors.odometer = 'Please enter a valid mileage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const snapshotData = {
        vehicleId: vehicle.id,
        title: form.title.trim(),
        condition: form.condition,
        notes: form.notes.trim() || undefined,
        date: form.date + 'T00:00:00.000Z',
        odometer: form.odometer ? parseInt(form.odometer) : vehicle.currentMileage,
        openIssuesCount: autoData.openIssuesCount,
        totalSpent: autoData.totalSpent,
        fuelEfficiency: autoData.fuelEfficiency,
      };

      await SnapshotStorage.add(snapshotData);

      onSnapshotTaken && onSnapshotTaken();
      onClose();
    } catch (error) {
      console.error('Error saving snapshot:', error);
      Alert.alert('Error', 'Failed to take snapshot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

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
              Take Snapshot
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
            {/* Vehicle Info */}
            <View style={[Shared.card, { marginBottom: Spacing.lg }]}>
              <Text style={[Typography.body, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                Vehicle
              </Text>
              <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
                {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </Text>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: Spacing.xs }]}>
                Creating a point-in-time record of your vehicle's current state
              </Text>
            </View>

            {/* Current Vehicle Data */}
            <View style={[Shared.card, { marginBottom: Spacing.lg }]}>
              <Text style={[Typography.body, { color: Colors.textPrimary, marginBottom: Spacing.md, fontFamily: 'Nunito_600SemiBold' }]}>
                Current Vehicle Data
              </Text>
              
              <View style={{ gap: Spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                    Open Issues
                  </Text>
                  <Text style={[Typography.body, { 
                    color: autoData.openIssuesCount > 0 ? Colors.deepRed : Colors.textPrimary 
                  }]}>
                    {autoData.openIssuesCount}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                    Total Spent
                  </Text>
                  <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                    ${autoData.totalSpent.toFixed(2)}
                  </Text>
                </View>
                
                {autoData.fuelEfficiency && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                      Latest Fuel Efficiency
                    </Text>
                    <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                      {autoData.fuelEfficiency} MPG
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Title */}
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                Snapshot Title *
              </Text>
              <TextInput
                style={[Shared.input, errors.title && { borderColor: Colors.danger }]}
                placeholder="e.g., January 2026 Check-in"
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

            {/* Condition */}
            <View style={{ marginBottom: Spacing.lg }}>
              <ConditionPicker 
                value={form.condition}
                onSelect={(condition) => setForm(prev => ({ ...prev, condition }))}
              />
            </View>

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

            {/* Notes */}
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.xs }]}>
                Notes
              </Text>
              <TextInput
                style={[Shared.input, { 
                  height: 100, 
                  textAlignVertical: 'top', 
                  paddingTop: Spacing.md 
                }]}
                placeholder="What's going on with your car right now? Any recent trips, changes, or observations..."
                placeholderTextColor={Colors.textTertiary}
                value={form.notes}
                onChangeText={(value) => setForm(prev => ({ ...prev, notes: value }))}
                multiline
                autoCapitalize="sentences"
              />
            </View>

            {/* Info Box */}
            <View style={{
              backgroundColor: Colors.primary + '10',
              borderRadius: 12,
              padding: Spacing.lg,
              borderWidth: 1,
              borderColor: Colors.primary + '20',
              marginBottom: Spacing.lg,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 16, marginRight: Spacing.sm }}>💡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.body, { color: Colors.primary, marginBottom: Spacing.xs, fontFamily: 'Nunito_600SemiBold' }]}>
                    Snapshot Tips
                  </Text>
                  <Text style={[Typography.small, { color: Colors.primary, lineHeight: 18 }]}>
                    • Take regular snapshots to track your vehicle's condition over time{'\n'}
                    • Great for documentation before/after trips or major services{'\n'}
                    • Useful for insurance claims or resale value tracking
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}