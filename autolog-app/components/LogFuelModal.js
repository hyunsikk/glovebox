import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography, Shared } from '../theme';

const FUEL_TYPES = [
  { key: 'fuel', label: 'Gas / Diesel', emoji: '⛽' },
  { key: 'ev_charge', label: 'EV Charging', emoji: '⚡' },
];

export default function LogFuelModal({ visible, onClose, onSave, vehicle, editLog }) {
  const isEditing = !!editLog;
  const [type, setType] = useState('fuel');
  const [date, setDate] = useState('');
  const [odometer, setOdometer] = useState('');
  const [gallons, setGallons] = useState('');
  const [pricePerGallon, setPricePerGallon] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [fullTank, setFullTank] = useState(true);
  const [station, setStation] = useState('');
  const [kWh, setKWh] = useState('');
  const [costPerKWh, setCostPerKWh] = useState('');
  const [notes, setNotes] = useState('');
  const [costMode, setCostMode] = useState('per_unit'); // 'per_unit' or 'total'

  useEffect(() => {
    if (visible) {
      if (editLog) {
        setType(editLog.type || 'fuel');
        setDate(editLog.date || '');
        setOdometer(editLog.odometer?.toString() || '');
        setGallons(editLog.gallons?.toString() || '');
        setPricePerGallon(editLog.pricePerGallon?.toString() || '');
        setTotalCost(editLog.totalCost?.toString() || '');
        setFullTank(editLog.fullTank !== false);
        setStation(editLog.station || '');
        setKWh(editLog.kWh?.toString() || '');
        setCostPerKWh(editLog.costPerKWh?.toString() || '');
        setNotes(editLog.notes || '');
        setCostMode(editLog.totalCost && !editLog.pricePerGallon ? 'total' : 'per_unit');
      } else {
        // Defaults for new entry
        setType('fuel');
        const today = new Date();
        setDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
        setOdometer(vehicle?.currentMileage?.toString() || '');
        setGallons('');
        setPricePerGallon('');
        setTotalCost('');
        setFullTank(true);
        setStation('');
        setKWh('');
        setCostPerKWh('');
        setNotes('');
        setCostMode('per_unit');
      }
    }
  }, [visible, editLog, vehicle]);

  // Auto-calculate total cost from unit price × quantity
  useEffect(() => {
    if (costMode === 'per_unit') {
      if (type === 'fuel' && gallons && pricePerGallon) {
        const calc = (parseFloat(gallons) * parseFloat(pricePerGallon)).toFixed(2);
        setTotalCost(calc);
      } else if (type === 'ev_charge' && kWh && costPerKWh) {
        const calc = (parseFloat(kWh) * parseFloat(costPerKWh)).toFixed(2);
        setTotalCost(calc);
      }
    }
  }, [gallons, pricePerGallon, kWh, costPerKWh, costMode, type]);

  // Reverse-calculate unit price from total
  useEffect(() => {
    if (costMode === 'total' && totalCost) {
      if (type === 'fuel' && gallons) {
        const g = parseFloat(gallons);
        if (g > 0) setPricePerGallon((parseFloat(totalCost) / g).toFixed(3));
      } else if (type === 'ev_charge' && kWh) {
        const k = parseFloat(kWh);
        if (k > 0) setCostPerKWh((parseFloat(totalCost) / k).toFixed(3));
      }
    }
  }, [totalCost, gallons, kWh, costMode, type]);

  const formatDateInput = (text) => {
    const nums = text.replace(/[^0-9]/g, '');
    if (nums.length <= 4) return nums;
    if (nums.length <= 6) return nums.slice(0, 4) + '-' + nums.slice(4);
    return nums.slice(0, 4) + '-' + nums.slice(4, 6) + '-' + nums.slice(6, 8);
  };

  const validate = () => {
    const errors = [];
    if (!date) errors.push('Date is required');
    if (!odometer) errors.push('Odometer reading is required');
    
    const odo = parseInt(odometer);
    if (isNaN(odo) || odo < 0) errors.push('Invalid odometer reading');

    if (type === 'fuel') {
      if (!gallons) errors.push('Gallons is required');
      if (!totalCost && !pricePerGallon) errors.push('Enter price or total cost');
    } else {
      if (!kWh) errors.push('kWh is required');
      if (!totalCost && !costPerKWh) errors.push('Enter cost per kWh or total cost');
    }

    return errors;
  };

  const handleSave = () => {
    const errors = validate();
    if (errors.length > 0) {
      Alert.alert('Missing Info', errors.join('\n'));
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const logData = {
      vehicleId: vehicle.id,
      type,
      date,
      odometer: parseInt(odometer),
      totalCost: parseFloat(totalCost) || 0,
      station: station.trim() || null,
      notes: notes.trim() || null,
      fullTank,
    };

    if (type === 'fuel') {
      logData.gallons = parseFloat(gallons);
      logData.pricePerGallon = parseFloat(pricePerGallon) || null;
    } else {
      logData.kWh = parseFloat(kWh);
      logData.costPerKWh = parseFloat(costPerKWh) || null;
    }

    if (isEditing) {
      logData.id = editLog.id;
    }

    onSave(logData);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this fuel log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          if (onSave) onSave({ ...editLog, _delete: true });
          onClose();
        },
      },
    ]);
  };

  const SectionLabel = ({ children }) => (
    <Text style={[Typography.caption, {
      color: Colors.textSecondary,
      marginBottom: Spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    }]}>
      {children}
    </Text>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end',
        }}
      >
        <View style={{
          backgroundColor: Colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '90%',
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: Spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: Colors.glassBorder,
          }}>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
              {isEditing ? 'Edit Entry' : 'Log Fill-Up'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={{ padding: 4 }}>
              <Text style={[Typography.body, { color: Colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: Spacing.lg }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Fuel Type Toggle */}
            <SectionLabel>Type</SectionLabel>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg }}>
              {FUEL_TYPES.map((ft) => (
                <TouchableOpacity
                  key={ft.key}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: type === ft.key ? Colors.primary + '20' : Colors.surface1,
                    paddingVertical: Spacing.md,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: type === ft.key ? Colors.primary + '60' : Colors.glassBorder,
                  }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setType(ft.key);
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: Spacing.xs }}>{ft.emoji}</Text>
                  <Text style={[Typography.body, {
                    color: type === ft.key ? Colors.primary : Colors.textSecondary,
                    fontFamily: type === ft.key ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
                  }]}>
                    {ft.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date & Odometer Row */}
            <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }}>
              <View style={{ flex: 1 }}>
                <SectionLabel>Date *</SectionLabel>
                <TextInput
                  style={Shared.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.arcticSilver}
                  value={date}
                  onChangeText={(t) => setDate(formatDateInput(t))}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
              <View style={{ flex: 1 }}>
                <SectionLabel>Odometer *</SectionLabel>
                <TextInput
                  style={Shared.input}
                  placeholder={vehicle?.currentMileage?.toString() || '25000'}
                  placeholderTextColor={Colors.arcticSilver}
                  value={odometer}
                  onChangeText={setOdometer}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Quantity */}
            {type === 'fuel' ? (
              <>
                <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }}>
                  <View style={{ flex: 1 }}>
                    <SectionLabel>Gallons *</SectionLabel>
                    <TextInput
                      style={Shared.input}
                      placeholder="12.5"
                      placeholderTextColor={Colors.arcticSilver}
                      value={gallons}
                      onChangeText={setGallons}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SectionLabel>{costMode === 'per_unit' ? 'Price/Gal' : 'Total Cost *'}</SectionLabel>
                    <TextInput
                      style={Shared.input}
                      placeholder={costMode === 'per_unit' ? '3.89' : '48.63'}
                      placeholderTextColor={Colors.arcticSilver}
                      value={costMode === 'per_unit' ? pricePerGallon : totalCost}
                      onChangeText={costMode === 'per_unit' ? setPricePerGallon : setTotalCost}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Full Tank Toggle */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: Colors.surface1,
                  padding: Spacing.md,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.glassBorder,
                  marginBottom: Spacing.lg,
                }}>
                  <View>
                    <Text style={[Typography.body, { color: Colors.textPrimary }]}>Full tank</Text>
                    <Text style={[Typography.small, { color: Colors.textSecondary }]}>
                      needed for MPG calculation
                    </Text>
                  </View>
                  <Switch
                    value={fullTank}
                    onValueChange={(val) => {
                      Haptics.selectionAsync();
                      setFullTank(val);
                    }}
                    trackColor={{ false: Colors.surface1, true: Colors.primary + '60' }}
                    thumbColor={fullTank ? Colors.primary : Colors.textSecondary}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }}>
                  <View style={{ flex: 1 }}>
                    <SectionLabel>kWh *</SectionLabel>
                    <TextInput
                      style={Shared.input}
                      placeholder="45.2"
                      placeholderTextColor={Colors.arcticSilver}
                      value={kWh}
                      onChangeText={setKWh}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SectionLabel>{costMode === 'per_unit' ? 'Cost/kWh' : 'Total Cost *'}</SectionLabel>
                    <TextInput
                      style={Shared.input}
                      placeholder={costMode === 'per_unit' ? '0.31' : '14.01'}
                      placeholderTextColor={Colors.arcticSilver}
                      value={costMode === 'per_unit' ? costPerKWh : totalCost}
                      onChangeText={costMode === 'per_unit' ? setCostPerKWh : setTotalCost}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Cost Mode Toggle */}
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setCostMode(costMode === 'per_unit' ? 'total' : 'per_unit');
              }}
              style={{ marginBottom: Spacing.lg, alignSelf: 'flex-start' }}
            >
              <Text style={[Typography.caption, { color: Colors.primary }]}>
                {costMode === 'per_unit' ? 'enter total cost instead →' : 'enter per-unit price instead →'}
              </Text>
            </TouchableOpacity>

            {/* Computed Total (when in per_unit mode) */}
            {costMode === 'per_unit' && totalCost && parseFloat(totalCost) > 0 && (
              <View style={{
                backgroundColor: Colors.primary + '10',
                padding: Spacing.md,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.primary + '20',
                marginBottom: Spacing.lg,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Text style={[Typography.body, { color: Colors.textSecondary }]}>total cost</Text>
                <Text style={[Typography.h2, { color: Colors.primary }]}>${parseFloat(totalCost).toFixed(2)}</Text>
              </View>
            )}

            {/* Station / Location */}
            <SectionLabel>Station (optional)</SectionLabel>
            <TextInput
              style={[Shared.input, { marginBottom: Spacing.lg }]}
              placeholder={type === 'fuel' ? 'Costco Gas, Shell, etc.' : 'Tesla Supercharger, ChargePoint, etc.'}
              placeholderTextColor={Colors.arcticSilver}
              value={station}
              onChangeText={setStation}
            />

            {/* Notes */}
            <SectionLabel>Notes (optional)</SectionLabel>
            <TextInput
              style={[Shared.input, { minHeight: 60, textAlignVertical: 'top', paddingTop: Spacing.md, marginBottom: Spacing.lg }]}
              placeholder="Premium gas, road trip, etc."
              placeholderTextColor={Colors.arcticSilver}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            {/* Delete button for editing */}
            {isEditing && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: Spacing.xl,
                  paddingVertical: Spacing.md,
                }}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.deepRed} style={{ marginRight: Spacing.sm }} />
                <Text style={[Typography.body, { color: Colors.deepRed }]}>Delete Entry</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
