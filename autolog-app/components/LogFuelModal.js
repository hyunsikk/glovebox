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
import DatePickerField from './DatePickerField';

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
  const [costMode, setCostMode] = useState('total');
  const [updateOdometer, setUpdateOdometer] = useState(true);
  const [octane, setOctane] = useState(null);
  const [chargerType, setChargerType] = useState(null);

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
        setCostMode(editLog.pricePerGallon ? 'per_unit' : 'total');
        setUpdateOdometer(false); // Don't update odometer when editing existing
        setOctane(editLog.octane || null);
        setChargerType(editLog.chargerType || null);
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
        setCostMode('total');
        setUpdateOdometer(true);
        setOctane(null);
        setChargerType(null);
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
    
    // Odometer is optional
    if (odometer) {
      const odo = parseInt(odometer);
      if (isNaN(odo) || odo < 0) errors.push('Invalid odometer reading');
    }

    // Cost is optional
    if (costMode === 'per_unit') {
      if (type === 'fuel' && gallons && !pricePerGallon && !totalCost) {
        errors.push('Enter price per gallon or total cost');
      }
      if (type === 'ev_charge' && kWh && !costPerKWh && !totalCost) {
        errors.push('Enter cost per kWh or total cost');
      }
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
      odometer: odometer ? parseInt(odometer) : null,
      totalCost: totalCost ? parseFloat(totalCost) : null,
      station: station.trim() || null,
      notes: notes.trim() || null,
      fullTank,
    };

    if (type === 'fuel') {
      logData.gallons = gallons ? parseFloat(gallons) : null;
      logData.pricePerGallon = parseFloat(pricePerGallon) || null;
      logData.octane = octane;
    } else {
      logData.kWh = kWh ? parseFloat(kWh) : null;
      logData.costPerKWh = parseFloat(costPerKWh) || null;
      logData.chargerType = chargerType;
    }

    logData._updateOdometer = updateOdometer;

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
              {isEditing ? 'Edit Entry' : 'Log Fuel'}
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
                <SectionLabel>Date</SectionLabel>
                <DatePickerField
                  value={date}
                  onChange={setDate}
                />
              </View>
              <View style={{ flex: 1 }}>
                <SectionLabel>Odometer</SectionLabel>
                <TextInput
                  style={Shared.input}
                  placeholder={vehicle?.currentMileage?.toString() || '25000'}
                  placeholderTextColor={Colors.arcticSilver}
                  value={odometer}
                  onChangeText={setOdometer}
                  keyboardType="number-pad"
                />
                {vehicle?.currentMileage && !isEditing && (
                  <Text style={[Typography.small, { color: Colors.textTertiary, marginTop: 2 }]}>
                    Last: {vehicle.currentMileage.toLocaleString()} mi
                  </Text>
                )}
              </View>
            </View>

            {/* Total Cost (always shown — the simple path) */}
            <View style={{ marginBottom: Spacing.lg }}>
              <SectionLabel>Total Cost</SectionLabel>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[Shared.input, { paddingLeft: 32 }]}
                  placeholder={type === 'fuel' ? '48.63' : '14.01'}
                  placeholderTextColor={Colors.arcticSilver}
                  value={totalCost}
                  onChangeText={setTotalCost}
                  keyboardType="decimal-pad"
                />
                <Text style={[Typography.body, {
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: [{ translateY: -10 }],
                  color: Colors.textSecondary,
                }]}>
                  $
                </Text>
              </View>
            </View>

            {/* Detailed breakdown (optional, expandable) */}
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setCostMode(costMode === 'total' ? 'per_unit' : 'total');
              }}
              style={{ 
                marginBottom: Spacing.lg, 
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons 
                name={costMode === 'per_unit' ? 'chevron-up' : 'chevron-down'} 
                size={14} 
                color={Colors.primary} 
                style={{ marginRight: 4 }} 
              />
              <Text style={[Typography.caption, { color: Colors.primary }]}>
                {costMode === 'per_unit' ? 'hide details' : type === 'fuel' ? 'add gallons & price per gallon' : 'add kWh & cost per kWh'}
              </Text>
            </TouchableOpacity>

            {/* Detailed quantity/unit price fields */}
            {costMode === 'per_unit' && (
              <>
                {type === 'fuel' ? (
                  <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }}>
                    <View style={{ flex: 1 }}>
                      <SectionLabel>Gallons</SectionLabel>
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
                      <SectionLabel>Price/Gal</SectionLabel>
                      <TextInput
                        style={Shared.input}
                        placeholder="3.89"
                        placeholderTextColor={Colors.arcticSilver}
                        value={pricePerGallon}
                        onChangeText={setPricePerGallon}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }}>
                    <View style={{ flex: 1 }}>
                      <SectionLabel>kWh</SectionLabel>
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
                      <SectionLabel>Cost/kWh</SectionLabel>
                      <TextInput
                        style={Shared.input}
                        placeholder="0.31"
                        placeholderTextColor={Colors.arcticSilver}
                        value={costPerKWh}
                        onChangeText={setCostPerKWh}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                )}

                {/* Computed total from details */}
                {totalCost && parseFloat(totalCost) > 0 && (
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
              </>
            )}

            {type === 'fuel' ? (
              <>
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

                {/* Octane Grade (optional) */}
                <SectionLabel>Octane Grade (optional)</SectionLabel>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg }}>
                  {[
                    { key: '87', label: '87 Regular' },
                    { key: '89', label: '89 Mid' },
                    { key: '91', label: '91 Premium' },
                    { key: '93', label: '93 Super' },
                    { key: 'diesel', label: 'Diesel' },
                    { key: 'e85', label: 'E85' },
                  ].map((opt) => {
                    const isSelected = octane === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setOctane(isSelected ? null : opt.key);
                        }}
                        style={{
                          paddingHorizontal: Spacing.md,
                          paddingVertical: Spacing.sm,
                          borderRadius: 16,
                          backgroundColor: isSelected ? Colors.warning + '20' : Colors.surface1,
                          borderWidth: 1,
                          borderColor: isSelected ? Colors.warning + '60' : Colors.glassBorder,
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[Typography.caption, {
                          color: isSelected ? Colors.warning : Colors.textSecondary,
                          fontFamily: isSelected ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
                        }]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                {/* Charger Type (optional) */}
                <SectionLabel>Charger Type (optional)</SectionLabel>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg }}>
                  {[
                    { key: 'level1', label: 'Level 1 (120V)' },
                    { key: 'level2', label: 'Level 2 (240V)' },
                    { key: 'dcfc', label: 'DC Fast' },
                    { key: 'supercharger', label: 'Supercharger' },
                  ].map((opt) => {
                    const isSelected = chargerType === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setChargerType(isSelected ? null : opt.key);
                        }}
                        style={{
                          paddingHorizontal: Spacing.md,
                          paddingVertical: Spacing.sm,
                          borderRadius: 16,
                          backgroundColor: isSelected ? Colors.success + '20' : Colors.surface1,
                          borderWidth: 1,
                          borderColor: isSelected ? Colors.success + '60' : Colors.glassBorder,
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[Typography.caption, {
                          color: isSelected ? Colors.success : Colors.textSecondary,
                          fontFamily: isSelected ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
                        }]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Update Odometer Toggle */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: Colors.surface1,
              padding: Spacing.md,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: updateOdometer ? Colors.primary + '40' : Colors.glassBorder,
              marginBottom: Spacing.lg,
            }}>
              <View>
                <Text style={[Typography.body, { color: Colors.textPrimary }]}>Update odometer</Text>
                <Text style={[Typography.small, { color: Colors.textSecondary }]}>
                  {vehicle?.currentMileage ? `Currently ${vehicle.currentMileage.toLocaleString()} mi` : 'Set vehicle mileage'}
                </Text>
              </View>
              <Switch
                value={updateOdometer}
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setUpdateOdometer(val);
                }}
                trackColor={{ false: Colors.surface1, true: Colors.primary + '60' }}
                thumbColor={updateOdometer ? Colors.primary : Colors.textSecondary}
              />
            </View>

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
