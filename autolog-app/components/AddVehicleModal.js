import React, { useState } from 'react';
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
import VehicleSearch from './VehicleSearch';
import { VehicleStorage } from '../lib/storage';
import vehicleData from '../content/v1/vehicles.json';

export default function AddVehicleModal({ visible, onClose, onVehicleAdded }) {
  const [step, setStep] = useState('search'); // 'search' or 'manual' or 'details'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showConditionSection, setShowConditionSection] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [decodingVIN, setDecodingVIN] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    trim: '',
    nickname: '',
    vin: '',
    location: '',
    initialMileage: '',
    currentMileage: '',
    purchaseDate: '',
    conditionWhenPurchased: '',
    purchasePrice: '',
    knownIssues: '',
    accidentHistory: '',
    modifications: '',
    smokerVehicle: '',
    petsTransported: '',
    primaryUse: [],
  });

  const resetForm = () => {
    setStep('search');
    setSelectedVehicle(null);
    setIsManualEntry(false);
    setShowConditionSection(false);
    setShowErrors(false);
    setValidationErrors([]);
    setFormData({
      year: '',
      make: '',
      model: '',
      trim: '',
      nickname: '',
      vin: '',
      location: '',
      initialMileage: '',
      currentMileage: '',
      purchaseDate: '',
      conditionWhenPurchased: '',
      purchasePrice: '',
      knownIssues: '',
      accidentHistory: '',
      modifications: '',
      smokerVehicle: '',
      petsTransported: '',
      primaryUse: [],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleVehicleSelect = (vehicle) => {
    Haptics.selectionAsync();
    setSelectedVehicle(vehicle);
    setIsManualEntry(false);
    
    // Pre-fill form with selected vehicle data
    setFormData({
      ...formData,
      make: vehicle.make,
      model: vehicle.model,
      year: '', // User needs to specify exact year
    });
    setStep('details');
  };

  const handleManualEntry = () => {
    Haptics.selectionAsync();
    setIsManualEntry(true);
    setSelectedVehicle(null);
    setStep('details');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const decodeVIN = async () => {
    const vin = formData.vin.trim();
    if (vin.length !== 17) {
      Alert.alert('Invalid VIN', 'VIN must be exactly 17 characters');
      return;
    }

    setDecodingVIN(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
      
      if (!response.ok) {
        throw new Error('Failed to decode VIN');
      }

      const data = await response.json();
      const results = data.Results || [];

      // Extract relevant information
      const getField = (variableName) => {
        const field = results.find(r => r.Variable === variableName);
        return field ? field.Value : null;
      };

      const year = getField('Model Year');
      const make = getField('Make');
      const model = getField('Model');

      if (year && make && model) {
        setFormData(prev => ({
          ...prev,
          year: year,
          make: make,
          model: model
        }));

        Alert.alert(
          'VIN Decoded Successfully',
          `Found: ${year} ${make} ${model}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'VIN Decoded',
          'Some vehicle information could not be determined from the VIN',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('VIN decode error:', error);
      Alert.alert(
        'VIN Decode Failed',
        'Could not decode VIN. Please verify the VIN is correct or enter vehicle details manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setDecodingVIN(false);
    }
  };

  const isFieldError = (field) => showErrors && !formData[field];
  const requiredInputStyle = (field) => isFieldError(field) ? { borderColor: Colors.deepRed || '#EF4444', borderWidth: 1.5 } : {};

  const getYearRange = () => {
    if (selectedVehicle && selectedVehicle.years) {
      const [startStr, endStr] = selectedVehicle.years.split('-');
      return { min: parseInt(startStr), max: parseInt(endStr) };
    }
    return { min: 1976, max: new Date().getFullYear() + 1 };
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.year) errors.push('Year is required');
    if (!formData.make) errors.push('Make is required');
    if (!formData.model) errors.push('Model is required');
    if (!formData.currentMileage) errors.push('Current mileage is required');

    // Validate year
    const year = parseInt(formData.year);
    const { min: minYear, max: maxYear } = getYearRange();
    if (isNaN(year) || year < minYear || year > maxYear) {
      if (selectedVehicle) {
        errors.push(`Year must be between ${minYear} and ${maxYear} for ${selectedVehicle.make} ${selectedVehicle.model}`);
      } else {
        errors.push(`Year must be between ${minYear} and ${maxYear}`);
      }
    }

    // Validate mileage
    const currentMileage = parseInt(formData.currentMileage);
    const initialMileage = parseInt(formData.initialMileage || '0');
    
    if (isNaN(currentMileage) || currentMileage < 0) {
      errors.push('Current mileage must be a positive number');
    } else if (currentMileage > 999999) {
      errors.push('Current mileage seems too high — please double-check');
    }

    if (isNaN(initialMileage) || initialMileage < 0) {
      errors.push('Initial mileage must be a positive number');
    }
    
    if (!isNaN(initialMileage) && !isNaN(currentMileage) && initialMileage > currentMileage) {
      errors.push('Initial mileage cannot be greater than current mileage');
    }

    // Validate VIN format if provided
    const vin = formData.vin?.trim();
    if (vin && vin.length > 0 && vin.length !== 17) {
      errors.push('VIN must be exactly 17 characters');
    }

    // Validate purchase price if provided
    const price = formData.purchasePrice;
    if (price && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
      errors.push('Purchase price must be a positive number');
    }

    return errors;
  };

  const handleSaveVehicle = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setShowErrors(true);
      setValidationErrors(errors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setLoading(true);

      const vehicleToSave = {
        year: parseInt(formData.year),
        make: formData.make.trim(),
        model: formData.model.trim(),
        trim: formData.trim.trim() || undefined,
        nickname: formData.nickname.trim() || undefined,
        vin: formData.vin.trim() || undefined,
        location: formData.location.trim() || undefined,
        initialMileage: parseInt(formData.initialMileage || '0'),
        currentMileage: parseInt(formData.currentMileage),
        purchaseDate: formData.purchaseDate.trim() || undefined,
        conditionWhenPurchased: formData.conditionWhenPurchased || undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        knownIssues: formData.knownIssues.trim() || undefined,
        accidentHistory: formData.accidentHistory || undefined,
        modifications: formData.modifications.trim() || undefined,
        smokerVehicle: formData.smokerVehicle || undefined,
        petsTransported: formData.petsTransported || undefined,
        primaryUse: formData.primaryUse.length > 0 ? formData.primaryUse : undefined,
      };

      const savedVehicle = await VehicleStorage.add(vehicleToSave);
      
      onVehicleAdded(savedVehicle);
      handleClose();

    } catch (error) {
      console.error('Error saving vehicle:', error);
      Alert.alert('Error', 'Failed to save vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSearchStep = () => (
    <View style={{ flex: 1 }}>
      <Text style={[Typography.h1, { color: Colors.text, marginBottom: Spacing.md }]}>
        Find Your Vehicle
      </Text>
      
      <Text style={[Typography.body, { 
        color: Colors.textSecondary, 
        marginBottom: Spacing.xl 
      }]}>
        Search our database for instant access to manufacturer maintenance schedules.
      </Text>

      <VehicleSearch
        onVehicleSelect={handleVehicleSelect}
        placeholder="Type your car's make and model..."
      />

      {/* Manual Entry Option */}
      <View style={{
        borderTopWidth: 1,
        borderTopColor: Colors.surface,
        paddingTop: Spacing.lg,
        marginTop: Spacing.xl,
      }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          textAlign: 'center',
          marginBottom: Spacing.md 
        }]}>
          Can't find your vehicle?
        </Text>

        <TouchableOpacity
          style={Shared.buttonSecondary}
          onPress={handleManualEntry}
          activeOpacity={0.9}
        >
          <Text style={[Typography.h2, { color: Colors.steelBlue }]}>
            ✏️ Enter Manually
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <Text style={[Typography.h1, { color: Colors.text, marginBottom: Spacing.md }]}>
        Vehicle Details
      </Text>
      
      {selectedVehicle && (
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: 8,
          padding: Spacing.lg,
          marginBottom: Spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: Colors.forestGreen + '20',
            borderRadius: 20,
            padding: 8,
            marginRight: Spacing.md,
          }}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.forestGreen} />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h2, { color: Colors.text }]}>
              {selectedVehicle.make} {selectedVehicle.model}
            </Text>
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              Full maintenance schedule available
            </Text>
          </View>
        </View>
      )}

      {/* Year Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: isFieldError('year') ? (Colors.deepRed || '#EF4444') : Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Year <Text style={{ color: Colors.deepRed || '#EF4444' }}>*</Text>
        </Text>
        <TextInput
          style={[Shared.input, requiredInputStyle('year')]}
          placeholder={selectedVehicle ? `${getYearRange().min}–${getYearRange().max}` : '2022'}
          placeholderTextColor={Colors.arcticSilver}
          value={formData.year}
          onChangeText={(value) => { 
            const cleaned = value.replace(/[^0-9]/g, '');
            updateFormData('year', cleaned); 
            if (showErrors) setShowErrors(false); 
          }}
          keyboardType="numeric"
          maxLength={4}
        />
        {selectedVehicle && (
          <Text style={[Typography.caption, { color: Colors.arcticSilver, marginTop: 4 }]}>
            Valid years: {getYearRange().min}–{getYearRange().max}
          </Text>
        )}
      </View>

      {/* Make Input (if manual entry) */}
      {isManualEntry && (
        <View style={{ marginBottom: Spacing.lg }}>
          <Text style={[Typography.caption, { 
            color: isFieldError('make') ? (Colors.deepRed || '#EF4444') : Colors.textSecondary, 
            marginBottom: Spacing.sm 
          }]}>
            Make <Text style={{ color: Colors.deepRed || '#EF4444' }}>*</Text>
          </Text>
          <TextInput
            style={[Shared.input, requiredInputStyle('make')]}
            placeholder="Toyota"
            placeholderTextColor={Colors.arcticSilver}
            value={formData.make}
            onChangeText={(value) => { updateFormData('make', value); if (showErrors) setShowErrors(false); }}
            autoCapitalize="words"
          />
        </View>
      )}

      {/* Model Input (if manual entry) */}
      {isManualEntry && (
        <View style={{ marginBottom: Spacing.lg }}>
          <Text style={[Typography.caption, { 
            color: isFieldError('model') ? (Colors.deepRed || '#EF4444') : Colors.textSecondary, 
            marginBottom: Spacing.sm 
          }]}>
            Model <Text style={{ color: Colors.deepRed || '#EF4444' }}>*</Text>
          </Text>
          <TextInput
            style={[Shared.input, requiredInputStyle('model')]}
            placeholder="Camry"
            placeholderTextColor={Colors.arcticSilver}
            value={formData.model}
            onChangeText={(value) => { updateFormData('model', value); if (showErrors) setShowErrors(false); }}
            autoCapitalize="words"
          />
        </View>
      )}

      {/* Trim Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Trim (Optional)
        </Text>
        <TextInput
          style={Shared.input}
          placeholder="LE, XLE, Limited..."
          placeholderTextColor={Colors.arcticSilver}
          value={formData.trim}
          onChangeText={(value) => updateFormData('trim', value)}
          autoCapitalize="words"
        />
      </View>

      {/* Nickname Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Nickname (Optional)
        </Text>
        <TextInput
          style={Shared.input}
          placeholder="Daily Driver, Weekend Car..."
          placeholderTextColor={Colors.arcticSilver}
          value={formData.nickname}
          onChangeText={(value) => updateFormData('nickname', value)}
          autoCapitalize="words"
        />
      </View>

      {/* VIN Input with Decode Button */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          VIN (Optional)
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[Shared.input, { flex: 1, marginRight: Spacing.md }]}
            placeholder="1HGBH41JXMN109186"
            placeholderTextColor={Colors.arcticSilver}
            value={formData.vin}
            onChangeText={(value) => updateFormData('vin', value.toUpperCase())}
            autoCapitalize="characters"
            maxLength={17}
          />
          {formData.vin.length === 17 && (
            <TouchableOpacity
              onPress={decodeVIN}
              disabled={decodingVIN}
              style={{
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
                backgroundColor: Colors.primary + '20',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: Colors.primary + '30',
                opacity: decodingVIN ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[Typography.caption, { color: Colors.primary, marginRight: 4 }]}>
                  🔍
                </Text>
                <Text style={[Typography.caption, { color: Colors.primary }]}>
                  {decodingVIN ? 'Decoding...' : 'Decode'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[Typography.caption, { 
          color: Colors.arcticSilver, 
          marginTop: 4 
        }]}>
          17-character Vehicle Identification Number
        </Text>
      </View>

      {/* Location Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Where Is It Parked? (Optional)
        </Text>
        <TextInput
          style={Shared.input}
          placeholder="Home garage, Street parking on Oak St..."
          placeholderTextColor={Colors.arcticSilver}
          value={formData.location}
          onChangeText={(value) => updateFormData('location', value)}
          autoCapitalize="sentences"
        />
      </View>

      {/* Purchase Date Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          When Did You Get It? (Optional)
        </Text>
        <TextInput
          style={Shared.input}
          placeholder="YYYY-MM or YYYY-MM-DD"
          placeholderTextColor={Colors.arcticSilver}
          value={formData.purchaseDate}
          onChangeText={(value) => updateFormData('purchaseDate', value)}
        />
        <Text style={[Typography.caption, { 
          color: Colors.arcticSilver, 
          marginTop: 4 
        }]}>
          Helps calculate accurate maintenance schedules
        </Text>
      </View>

      {/* Current Mileage Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: isFieldError('currentMileage') ? (Colors.deepRed || '#EF4444') : Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Current Mileage <Text style={{ color: Colors.deepRed || '#EF4444' }}>*</Text>
        </Text>
        <TextInput
          style={[Shared.input, requiredInputStyle('currentMileage')]}
          placeholder="25000"
          placeholderTextColor={Colors.arcticSilver}
          value={formData.currentMileage}
          onChangeText={(value) => { 
            const cleaned = value.replace(/[^0-9]/g, '');
            updateFormData('currentMileage', cleaned); 
            if (showErrors) setShowErrors(false); 
          }}
          keyboardType="numeric"
        />
      </View>

      {/* Initial Mileage Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Mileage When You Got It (Optional)
        </Text>
        <TextInput
          style={Shared.input}
          placeholder="0"
          placeholderTextColor={Colors.arcticSilver}
          value={formData.initialMileage}
          onChangeText={(value) => updateFormData('initialMileage', value.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
        <Text style={[Typography.caption, { 
          color: Colors.arcticSilver, 
          marginTop: 4 
        }]}>
          Used for cost-per-mile calculations
        </Text>
      </View>

      {/* Ownership Section */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.h2, { color: Colors.text, marginBottom: Spacing.md }]}>
          Ownership Details
        </Text>

        {/* Condition When Purchased */}
        <View style={{ marginBottom: Spacing.lg }}>
          <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
            Condition When Purchased
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {['New', 'Used'].map((option) => (
              <TouchableOpacity
                key={option}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: formData.conditionWhenPurchased === option ? Colors.steelBlue : Colors.surface1,
                  borderWidth: 1,
                  borderColor: formData.conditionWhenPurchased === option ? Colors.steelBlue : Colors.glassBorder,
                }}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateFormData('conditionWhenPurchased', formData.conditionWhenPurchased === option ? '' : option);
                }}
              >
                <Text style={[Typography.body, { 
                  color: formData.conditionWhenPurchased === option ? Colors.pearlWhite : Colors.textSecondary 
                }]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Purchase Price */}
        <View style={{ marginBottom: Spacing.lg }}>
          <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
            Purchase Price (Optional)
          </Text>
          <TextInput
            style={Shared.input}
            placeholder="25000"
            placeholderTextColor={Colors.arcticSilver}
            value={formData.purchasePrice}
            onChangeText={(value) => updateFormData('purchasePrice', value.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Vehicle Condition Section (Collapsible) */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: Spacing.md,
          marginBottom: Spacing.md,
          borderTopWidth: 1,
          borderTopColor: Colors.surface,
        }}
        onPress={() => {
          Haptics.selectionAsync();
          setShowConditionSection(!showConditionSection);
        }}
      >
        <Text style={[Typography.h2, { color: Colors.text }]}>
          Vehicle Condition
        </Text>
        <Ionicons
          name={showConditionSection ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>

      {showConditionSection && (
        <View style={{ marginBottom: Spacing.lg }}>
          {/* Known Mechanical Issues */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
              Known Mechanical Issues
            </Text>
            <TextInput
              style={[Shared.input, { height: 80, textAlignVertical: 'top', paddingTop: Spacing.md }]}
              placeholder="Any known issues when you got the car?"
              placeholderTextColor={Colors.arcticSilver}
              value={formData.knownIssues}
              onChangeText={(value) => updateFormData('knownIssues', value)}
              multiline
            />
          </View>

          {/* Accident History */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
              Accident History
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['None', 'Minor', 'Major'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: formData.accidentHistory === option ? Colors.steelBlue : Colors.surface1,
                    borderWidth: 1,
                    borderColor: formData.accidentHistory === option ? Colors.steelBlue : Colors.glassBorder,
                  }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateFormData('accidentHistory', formData.accidentHistory === option ? '' : option);
                  }}
                >
                  <Text style={[Typography.body, { 
                    color: formData.accidentHistory === option ? Colors.pearlWhite : Colors.textSecondary 
                  }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Modifications */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
              Modifications
            </Text>
            <TextInput
              style={[Shared.input, { height: 80, textAlignVertical: 'top', paddingTop: Spacing.md }]}
              placeholder="Aftermarket parts, upgrades, etc."
              placeholderTextColor={Colors.arcticSilver}
              value={formData.modifications}
              onChangeText={(value) => updateFormData('modifications', value)}
              multiline
            />
          </View>

          {/* Smoker Vehicle */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
              Smoker Vehicle
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['Yes', 'No'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: formData.smokerVehicle === option ? Colors.steelBlue : Colors.surface1,
                    borderWidth: 1,
                    borderColor: formData.smokerVehicle === option ? Colors.steelBlue : Colors.glassBorder,
                  }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateFormData('smokerVehicle', formData.smokerVehicle === option ? '' : option);
                  }}
                >
                  <Text style={[Typography.body, { 
                    color: formData.smokerVehicle === option ? Colors.pearlWhite : Colors.textSecondary 
                  }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pets Transported */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
              Pets Transported
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['Yes', 'No'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: formData.petsTransported === option ? Colors.steelBlue : Colors.surface1,
                    borderWidth: 1,
                    borderColor: formData.petsTransported === option ? Colors.steelBlue : Colors.glassBorder,
                  }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateFormData('petsTransported', formData.petsTransported === option ? '' : option);
                  }}
                >
                  <Text style={[Typography.body, { 
                    color: formData.petsTransported === option ? Colors.pearlWhite : Colors.textSecondary 
                  }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Primary Use */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
              Primary Use (select all that apply)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
              {['Daily Commute', 'Weekend', 'Road Trips', 'Work'].map((option) => {
                const isSelected = formData.primaryUse.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={{
                      paddingHorizontal: Spacing.lg,
                      height: 36,
                      borderRadius: 18,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isSelected ? Colors.steelBlue : Colors.surface1,
                      borderWidth: 1,
                      borderColor: isSelected ? Colors.steelBlue : Colors.glassBorder,
                    }}
                    onPress={() => {
                      Haptics.selectionAsync();
                      const newUse = isSelected
                        ? formData.primaryUse.filter(u => u !== option)
                        : [...formData.primaryUse, option];
                      updateFormData('primaryUse', newUse);
                    }}
                  >
                    <Text style={[Typography.caption, { 
                      color: isSelected ? Colors.pearlWhite : Colors.textSecondary 
                    }]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      <View style={{ height: Spacing.section }} />
    </ScrollView>
  );

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
              onPress={handleClose}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[Typography.h2, { color: Colors.text }]}>
              Add Vehicle
            </Text>

            <View style={{ width: 32 }} />
          </View>

          {/* Content */}
          {step === 'search' ? renderSearchStep() : renderDetailsStep()}

          {/* Bottom Actions */}
          {step === 'details' && (
            <View style={{
              paddingVertical: Spacing.xl,
              borderTopWidth: 1,
              borderTopColor: Colors.surface,
            }}>
              {/* Validation Error Banner */}
              {showErrors && validationErrors.length > 0 && (
                <View style={{
                  backgroundColor: (Colors.deepRed || '#EF4444') + '15',
                  borderRadius: 12,
                  padding: Spacing.md,
                  marginBottom: Spacing.md,
                  borderWidth: 1,
                  borderColor: (Colors.deepRed || '#EF4444') + '30',
                }}>
                  {validationErrors.map((err, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < validationErrors.length - 1 ? 4 : 0 }}>
                      <Ionicons name="alert-circle" size={14} color={Colors.deepRed || '#EF4444'} style={{ marginRight: 6 }} />
                      <Text style={[Typography.caption, { color: Colors.deepRed || '#EF4444' }]}>{err}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[Shared.buttonPrimary, { 
                  backgroundColor: loading ? Colors.arcticSilver : Colors.steelBlue 
                }]}
                onPress={handleSaveVehicle}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={[Typography.h2, { color: Colors.pearlWhite }]}>
                  {loading ? 'Adding Vehicle...' : '🚗 Add to Garage'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={Shared.buttonSecondary}
                onPress={() => setStep('search')}
                activeOpacity={0.9}
              >
                <Text style={[Typography.h2, { color: Colors.steelBlue }]}>
                  ← Back to Search
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}