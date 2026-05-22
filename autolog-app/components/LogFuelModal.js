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
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography, Shared } from '../theme';
import DatePickerField from './DatePickerField';
import { useSettings } from '../lib/SettingsContext';
import { ImageStorage } from '../lib/storage';
import { pickImageAsync, persistImage, getThumbnailUri } from '../lib/imageUtils';

const FUEL_TYPES = [
  { key: 'fuel', label: 'Gas / Diesel', icon: 'gas-station' },
  { key: 'ev_charge', label: 'EV Charging', icon: 'ev-station' },
];

export default function LogFuelModal({ visible, onClose, onSave, vehicle, editLog }) {
  const { currencySymbol } = useSettings();
  const isEditing = !!editLog;
  const [type, setType] = useState('fuel');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
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
  const [fieldErrors, setFieldErrors] = useState({});
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
        ImageStorage.getByFuelLogId(editLog.id)
          .then(photos => setSelectedPhotos(photos || []))
          .catch(() => setSelectedPhotos([]));
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
        setSelectedPhotos([]);
      }
      setFieldErrors({});
    }
  }, [visible, editLog, vehicle]);

  // Auto-calculate total cost from unit price × quantity
  useEffect(() => {
    if (costMode === 'per_unit') {
      // Guard against NaN: bad input would otherwise store the string "NaN"
      // as totalCost and silently corrupt cost analytics.
      if (type === 'fuel' && gallons && pricePerGallon) {
        const g = parseFloat(gallons), p = parseFloat(pricePerGallon);
        if (!isNaN(g) && !isNaN(p)) setTotalCost((g * p).toFixed(2));
      } else if (type === 'ev_charge' && kWh && costPerKWh) {
        const k = parseFloat(kWh), c = parseFloat(costPerKWh);
        if (!isNaN(k) && !isNaN(c)) setTotalCost((k * c).toFixed(2));
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

    // Reject future dates. Parse at local noon and compare against end-of-today
    // so "today" isn't rejected due to a UTC-vs-local offset.
    if (date) {
      const entryDate = new Date(date + 'T12:00:00');
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      if (entryDate > endOfToday) errors.push('Date cannot be in the future');
    }

    // Odometer is optional
    if (odometer) {
      const odo = parseInt(odometer);
      if (isNaN(odo) || odo < 0) errors.push('Invalid odometer reading');
    }

    // Quantity must be a valid number if entered (prevents NaN reaching storage)
    if (type === 'fuel' && gallons && (isNaN(parseFloat(gallons)) || parseFloat(gallons) < 0)) {
      errors.push('Enter a valid amount of fuel');
    }
    if (type === 'ev_charge' && kWh && (isNaN(parseFloat(kWh)) || parseFloat(kWh) < 0)) {
      errors.push('Enter a valid kWh amount');
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

  const handlePickPhoto = async () => {
    if (selectedPhotos.length >= 5) return;
    Haptics.selectionAsync();
    try {
      const imageData = await pickImageAsync();
      if (imageData) {
        setSelectedPhotos(prev => [...prev, imageData]);
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
    }
  };

  const handleRemovePhoto = (index) => {
    Haptics.selectionAsync();
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!vehicle?.id) {
      Alert.alert('Error', 'No vehicle selected.');
      return;
    }

    // Build field-level errors for inline highlighting
    const newFieldErrors = {};
    if (!date) {
      newFieldErrors.date = 'Date is required';
    } else {
      const entryDate = new Date(date + 'T12:00:00');
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      if (entryDate > endOfToday) newFieldErrors.date = 'Date cannot be in the future';
    }
    setFieldErrors(newFieldErrors);

    const errors = validate();
    if (errors.length > 0) {
      Alert.alert('Missing Info', errors.join('\n'));
      return;
    }

    setFieldErrors({});

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

    // Keep a literal 0 (e.g. free/employer-paid fuel); only null out blank/NaN.
    const num = (v) => (v !== '' && v != null && !isNaN(parseFloat(v)) ? parseFloat(v) : null);
    if (type === 'fuel') {
      logData.gallons = num(gallons);
      logData.pricePerGallon = num(pricePerGallon);
      logData.octane = octane;
    } else {
      logData.kWh = num(kWh);
      logData.costPerKWh = num(costPerKWh);
      logData.chargerType = chargerType;
    }

    logData._updateOdometer = updateOdometer;

    if (isEditing) {
      logData.id = editLog.id;
    }

    const saved = await onSave(logData);
    const fuelLogId = logData.id || saved?.id;

    if (fuelLogId) {
      for (const photo of selectedPhotos) {
        if (photo.id) continue; // already persisted
        try {
          const storedUri = await persistImage(photo.uri);
          await ImageStorage.add({
            id: `fuel_${fuelLogId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            uri: storedUri,
            width: photo.width,
            height: photo.height,
            type: photo.type,
            createdAt: new Date().toISOString(),
            fuelLogId,
            vehicleId: vehicle.id,
          });
        } catch (photoError) {
          console.error('Error saving fuel photo:', photoError);
        }
      }
    }

    onClose();
    // Confirm after the modal dismisses (deferred to avoid the alert/modal race).
    setTimeout(() => {
      Alert.alert(
        isEditing ? 'Fuel updated' : 'Fuel logged',
        isEditing ? 'Your fuel entry has been updated.' : 'Your fuel entry has been recorded.',
      );
    }, 450);
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

  const SectionLabel = ({ children, required }) => (
    <Text style={[Typography.caption, {
      color: Colors.textSecondary,
      marginBottom: Spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    }]}>
      {children}
      {required && <Text style={{ color: Colors.danger }}> *</Text>}
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
              <Ionicons name="close" size={24} color={Colors.textSecondary} accessibilityRole="button" accessibilityLabel="Close" />
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
                  <MaterialCommunityIcons name={ft.icon} size={18} color={type === ft.key ? Colors.primary : Colors.textSecondary} style={{ marginRight: Spacing.xs }} />
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
                <SectionLabel required>Date</SectionLabel>
                <DatePickerField
                  value={date}
                  onChange={setDate}
                  error={fieldErrors.date}
                />
              </View>
              <View style={{ flex: 1 }}>
                <SectionLabel>Odometer (optional)</SectionLabel>
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
              <SectionLabel>Total Cost (optional)</SectionLabel>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[Shared.input, { paddingLeft: 32 }]}
                  placeholder="0.00"
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
                  {currencySymbol}
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
                      <SectionLabel>Gallons (optional)</SectionLabel>
                      <TextInput
                        style={Shared.input}
                        placeholder="0.0"
                        placeholderTextColor={Colors.arcticSilver}
                        value={gallons}
                        onChangeText={setGallons}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <SectionLabel>Price/Gal (optional)</SectionLabel>
                      <TextInput
                        style={Shared.input}
                        placeholder="0.00"
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
                      <SectionLabel>kWh (optional)</SectionLabel>
                      <TextInput
                        style={Shared.input}
                        placeholder="0.0"
                        placeholderTextColor={Colors.arcticSilver}
                        value={kWh}
                        onChangeText={setKWh}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <SectionLabel>Cost/kWh (optional)</SectionLabel>
                      <TextInput
                        style={Shared.input}
                        placeholder="0.00"
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
                    <Text style={[Typography.h2, { color: Colors.primary }]}>{currencySymbol}{parseFloat(totalCost).toFixed(2)}</Text>
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
              placeholder={type === 'fuel' ? 'Premium gas, road trip, etc.' : 'Supercharging, road trip, etc.'}
              placeholderTextColor={Colors.arcticSilver}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            {/* Photos */}
            <View style={{ marginBottom: Spacing.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
                <Text style={[Typography.caption, {
                  color: Colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }]}>
                  Photos (optional)
                </Text>
                <Text style={[Typography.caption, { color: Colors.arcticSilver }]}>
                  {selectedPhotos.length}/5 photos
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: Spacing.sm }}
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}
              >
                {selectedPhotos.map((photo, index) => (
                  <View key={index} style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: getThumbnailUri(photo) }}
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: Colors.glassBorder,
                      }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: Colors.deepRed,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="close" size={12} color={Colors.pearlWhite} />
                    </TouchableOpacity>
                  </View>
                ))}

                {selectedPhotos.length < 5 && (
                  <TouchableOpacity
                    onPress={handlePickPhoto}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: Colors.glassBorder,
                      borderStyle: 'dashed',
                      backgroundColor: Colors.surface1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera-outline" size={24} color={Colors.steelBlue} />
                  </TouchableOpacity>
                )}
              </ScrollView>

              <Text style={[Typography.caption, {
                color: Colors.arcticSilver,
                marginTop: 4,
                textAlign: 'center',
              }]}>
                Add receipts, work photos, or any relevant images
              </Text>
            </View>

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
