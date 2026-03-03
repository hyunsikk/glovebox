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
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, Shared } from '../theme';
import { VehicleStorage, ServiceStorage, ImageStorage } from '../lib/storage';
import { pickImageAsync, saveServiceImage, getThumbnailUri } from '../lib/imageUtils';
import { AdLogic } from '../lib/monetization';
import { getVehicleSchedule } from '../lib/vehicleDB';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Star Rating Component
const StarRating = ({ rating, onRate, size = 28 }) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => onRate(star)} activeOpacity={0.7}>
        <Ionicons
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={Colors.warning}
        />
      </TouchableOpacity>
    ))}
  </View>
);

// Chip/Pill Component
const Chip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
      backgroundColor: selected ? Colors.primary + '20' : Colors.surface1,
      borderWidth: 1,
      borderColor: selected ? Colors.primary : Colors.glassBorder,
      marginRight: Spacing.sm,
      marginBottom: Spacing.sm,
    }}
  >
    <Text style={[Typography.caption, { color: selected ? Colors.primary : Colors.textSecondary }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Urgency labels for reminders
const URGENCY_DATES = {
  'Soon': 14,           // 2 weeks
  'Next Visit': 90,     // 3 months
  'When Convenient': 180, // 6 months
};

const ServiceTypeItem = ({ serviceType, estimatedCost, onSelect, isSelected }) => {
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

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: isSelected ? Colors.steelBlue + '20' : 'transparent',
        borderRadius: 8,
        marginBottom: Spacing.sm,
        borderWidth: isSelected ? 1 : 0,
        borderColor: isSelected ? Colors.steelBlue : 'transparent',
      }}
      onPress={() => onSelect(serviceType)}
      activeOpacity={0.7}
    >
      <View style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 6,
        marginRight: Spacing.md,
      }}>
        <MaterialCommunityIcons
          name={getServiceIcon(serviceType)}
          size={20}
          color={isSelected ? Colors.steelBlue : Colors.arcticSilver}
        />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={[Typography.body, { 
          color: isSelected ? Colors.steelBlue : Colors.text 
        }]}>
          {serviceType}
        </Text>

      </View>
      
      {isSelected && (
        <Ionicons name="checkmark-circle" size={20} color={Colors.steelBlue} />
      )}
    </TouchableOpacity>
  );
};

export default function LogServiceModal({ visible, onClose, onServiceLogged, preselectedVehicle = null, preselectedServiceType = null }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(preselectedVehicle);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(preselectedVehicle ? 'service' : 'vehicle'); // 'vehicle' or 'service' or 'details' or 'custom'
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [customServiceType, setCustomServiceType] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    serviceType: '',
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    cost: '',
    vendor: '',
    notes: '',
  });

  // DIY / Shop Review state
  const [isDIY, setIsDIY] = useState(false);
  const [shopReview, setShopReview] = useState({ rating: 0, review: '', wouldReturn: null });
  const [diyLog, setDiyLog] = useState({ difficulty: '', timeSpent: '', notes: '' });

  // Shop Recommendations state
  const [shopRecsOpen, setShopRecsOpen] = useState(false);
  const [shopSummary, setShopSummary] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (visible) {
      loadVehicles();
      if (preselectedVehicle) {
        setSelectedVehicle(preselectedVehicle);
        loadServiceTypes(preselectedVehicle);
        if (preselectedServiceType) {
          setFormData(prev => ({ ...prev, serviceType: preselectedServiceType }));
          setStep('details');
        } else {
          setStep('service');
        }
      }
    }
  }, [visible, preselectedVehicle, preselectedServiceType]);

  const loadVehicles = async () => {
    try {
      const vehicleList = await VehicleStorage.getAll();
      setVehicles(vehicleList);
      
      // If only one vehicle, auto-select it
      if (vehicleList.length === 1 && !preselectedVehicle) {
        setSelectedVehicle(vehicleList[0]);
        loadServiceTypes(vehicleList[0]);
        setStep('service');
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadServiceTypes = (vehicle) => {
    // Get service types from manufacturer data
    const manufacturerServices = getVehicleSchedule(vehicle.make, vehicle.model, vehicle.years);
    
    // Add common custom services
    const customServices = [
      { service: 'Custom Service', estimatedCost: [0, 0] },
      { service: 'Repair', estimatedCost: [0, 0] },
      { service: 'Inspection', estimatedCost: [0, 0] },
    ];

    setServiceTypes([...manufacturerServices, ...customServices]);
  };

  const resetForm = () => {
    setStep(preselectedVehicle ? 'service' : 'vehicle');
    setSelectedVehicle(preselectedVehicle);
    setSelectedPhotos([]);
    setFormData({
      serviceType: '',
      date: new Date().toISOString().split('T')[0],
      mileage: '',
      cost: '',
      vendor: '',
      notes: '',
    });
    setIsDIY(false);
    setShopReview({ rating: 0, review: '', wouldReturn: null });
    setDiyLog({ difficulty: '', timeSpent: '', notes: '' });
    setShopRecsOpen(false);
    setShopSummary('');
    setRecommendations([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleVehicleSelect = (vehicle) => {
    Haptics.selectionAsync();
    setSelectedVehicle(vehicle);
    loadServiceTypes(vehicle);
    setStep('service');
  };

  const handleServiceTypeSelect = (serviceType) => {
    Haptics.selectionAsync();
    
    if (serviceType === 'Custom Service') {
      setCustomServiceType('');
      setStep('custom');
    } else {
      setFormData(prev => ({ ...prev, serviceType }));
      setStep('details');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const validateForm = () => {
    const errors = [];
    
    if (!formData.serviceType) errors.push('Service type is required');
    if (!formData.date) errors.push('Date is required');
    if (!formData.mileage) errors.push('Mileage is required');

    // Validate mileage
    const mileage = parseInt(formData.mileage);
    if (isNaN(mileage) || mileage < 0) {
      errors.push('Please enter a valid mileage');
    }

    // Validate cost if provided
    if (formData.cost) {
      const cost = parseFloat(formData.cost);
      if (isNaN(cost) || cost < 0) {
        errors.push('Please enter a valid cost');
      }
    }

    // Validate date
    const serviceDate = new Date(formData.date);
    const today = new Date();
    if (serviceDate > today) {
      errors.push('Service date cannot be in the future');
    }

    return errors;
  };

  const handleSaveService = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Please fix the following:', errors.join('\n'));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setLoading(true);

      const serviceToSave = {
        vehicleId: selectedVehicle.id,
        serviceType: formData.serviceType,
        date: formData.date,
        mileage: parseInt(formData.mileage),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        vendor: isDIY ? undefined : (formData.vendor.trim() || undefined),
        notes: formData.notes.trim() || undefined,
        // DIY or Shop Review
        ...(isDIY && (diyLog.difficulty || diyLog.timeSpent || diyLog.notes) ? {
          diyLog: {
            difficulty: diyLog.difficulty || undefined,
            timeSpent: diyLog.timeSpent.trim() || undefined,
            notes: diyLog.notes.trim() || undefined,
          },
        } : {}),
        ...(!isDIY && shopReview.rating > 0 ? {
          shopReview: {
            rating: shopReview.rating,
            review: shopReview.review.trim() || undefined,
            wouldReturn: shopReview.wouldReturn,
          },
        } : {}),
        // Shop Recommendations
        ...(shopSummary.trim() ? { shopSummary: shopSummary.trim() } : {}),
        ...(recommendations.filter(r => r.service.trim()).length > 0 ? {
          recommendations: recommendations.filter(r => r.service.trim()).map(r => ({ service: r.service.trim(), urgency: r.urgency })),
        } : {}),
      };

      const savedService = await ServiceStorage.add(serviceToSave);
      
      // Save photos if any were selected
      for (const photo of selectedPhotos) {
        try {
          const imageData = await saveServiceImage(photo, savedService.id);
          await ImageStorage.add({
            ...imageData,
            serviceId: savedService.id,
            vehicleId: selectedVehicle.id,
          });
        } catch (photoError) {
          console.error('Error saving service photo:', photoError);
        }
      }
      
      // Update vehicle's current mileage if this is the highest
      if (parseInt(formData.mileage) > selectedVehicle.currentMileage) {
        await VehicleStorage.update(selectedVehicle.id, {
          currentMileage: parseInt(formData.mileage)
        });
      }
      
      // Track for interstitial ad logic
      const logCount = await AdLogic.incrementServiceLogCount();
      const showAd = await AdLogic.shouldShowInterstitial();
      
      // TODO: When AdMob integrated, show interstitial here if showAd === true
      // InterstitialAd.show() — natural break after completing a service log

      Alert.alert(
        'Service Logged! 🔧',
        `${formData.serviceType} for ${selectedVehicle.nickname || `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`} has been recorded.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onServiceLogged(savedService);
              handleClose();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Failed to save service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderVehicleStep = () => (
    <View style={{ flex: 1 }}>
      <Text style={[Typography.h1, { color: Colors.text, marginBottom: Spacing.md }]}>
        Select Vehicle
      </Text>
      
      <Text style={[Typography.body, { 
        color: Colors.textSecondary, 
        marginBottom: Spacing.xl 
      }]}>
        Which vehicle did you service?
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={[Shared.card, { marginBottom: Spacing.md }]}
            onPress={() => handleVehicleSelect(vehicle)}
            activeOpacity={0.9}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: Spacing.md }}>🚗</Text>
              
              <View style={{ flex: 1 }}>
                <Text style={[Typography.h2, { color: Colors.text }]}>
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </Text>
                <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                  {vehicle.currentMileage?.toLocaleString() || '---'} miles
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={Colors.arcticSilver} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderServiceStep = () => (
    <View style={{ flex: 1 }}>
      <Text style={[Typography.h1, { color: Colors.text, marginBottom: Spacing.md }]}>
        Service Type
      </Text>
      
      <Text style={[Typography.body, { 
        color: Colors.textSecondary, 
        marginBottom: Spacing.xl 
      }]}>
        What service was performed on {selectedVehicle?.nickname || `${selectedVehicle?.year} ${selectedVehicle?.make} ${selectedVehicle?.model}`}?
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {serviceTypes.map((serviceItem, index) => (
          <ServiceTypeItem
            key={index}
            serviceType={serviceItem.service}
            estimatedCost={serviceItem.estimatedCost}
            onSelect={handleServiceTypeSelect}
            isSelected={formData.serviceType === serviceItem.service}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderCustomServiceStep = () => (
    <View style={{ flex: 1 }}>
      <Text style={[Typography.h1, { color: Colors.text, marginBottom: Spacing.md }]}>
        Custom Service
      </Text>
      
      <Text style={[Typography.body, { 
        color: Colors.textSecondary, 
        marginBottom: Spacing.xl 
      }]}>
        What service was performed?
      </Text>

      <TextInput
        style={Shared.input}
        placeholder="e.g. Wheel Alignment, Battery Replacement..."
        placeholderTextColor={Colors.arcticSilver}
        value={customServiceType}
        onChangeText={setCustomServiceType}
        autoCapitalize="words"
        autoFocus={true}
      />

      <TouchableOpacity
        style={[Shared.buttonPrimary, { 
          marginTop: Spacing.xl,
          backgroundColor: customServiceType.trim() ? Colors.steelBlue : Colors.arcticSilver,
        }]}
        onPress={() => {
          if (customServiceType.trim()) {
            Haptics.selectionAsync();
            setFormData(prev => ({ ...prev, serviceType: customServiceType.trim() }));
            setStep('details');
          }
        }}
        disabled={!customServiceType.trim()}
        activeOpacity={0.9}
      >
        <Text style={[Typography.h2, { color: Colors.pearlWhite }]}>
          Continue →
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDetailsStep = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <Text style={[Typography.h1, { color: Colors.text, marginBottom: Spacing.md }]}>
        Service Details
      </Text>

      <View style={{
        backgroundColor: Colors.surface,
        borderRadius: 8,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
      }}>
        <Text style={[Typography.body, { color: Colors.text }]}>
          {formData.serviceType}
        </Text>
        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
          {selectedVehicle?.nickname || `${selectedVehicle?.year} ${selectedVehicle?.make} ${selectedVehicle?.model}`}
        </Text>
      </View>

      {/* Date Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Service Date *
        </Text>
        <TextInput
          style={Shared.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.arcticSilver}
          value={formData.date}
          onChangeText={(value) => updateFormData('date', value)}
        />
      </View>

      {/* Mileage Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Mileage *
        </Text>
        <TextInput
          style={Shared.input}
          placeholder={selectedVehicle?.currentMileage?.toString() || "25000"}
          placeholderTextColor={Colors.arcticSilver}
          value={formData.mileage}
          onChangeText={(value) => updateFormData('mileage', value)}
          keyboardType="numeric"
        />
      </View>

      {/* Cost Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Cost (Optional)
        </Text>
        <TextInput
          style={Shared.input}
          placeholder="0.00"
          placeholderTextColor={Colors.arcticSilver}
          value={formData.cost}
          onChangeText={(value) => updateFormData('cost', value)}
          keyboardType="decimal-pad"
        />
      </View>

      {/* DIY Toggle */}
      <View style={{ marginBottom: Spacing.lg }}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            setIsDIY(!isDIY);
          }}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm + 2,
            borderRadius: 20,
            backgroundColor: isDIY ? Colors.primary + '20' : Colors.surface1,
            borderWidth: 1,
            borderColor: isDIY ? Colors.primary : Colors.glassBorder,
            alignSelf: 'flex-start',
            marginBottom: Spacing.md,
          }}
        >
          <MaterialCommunityIcons
            name="wrench"
            size={16}
            color={isDIY ? Colors.primary : Colors.textSecondary}
            style={{ marginRight: Spacing.sm }}
          />
          <Text style={[Typography.caption, { color: isDIY ? Colors.primary : Colors.textSecondary }]}>
            I did this myself
          </Text>
        </TouchableOpacity>

        {isDIY ? (
          <>
            {/* Difficulty */}
            <View style={{ marginBottom: Spacing.md }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                Difficulty
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {['Easy', 'Medium', 'Hard'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => { Haptics.selectionAsync(); setDiyLog(prev => ({ ...prev, difficulty: prev.difficulty === level ? '' : level })); }}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: Spacing.lg,
                      paddingVertical: Spacing.sm,
                      borderRadius: 20,
                      backgroundColor: diyLog.difficulty === level ? Colors.primary + '20' : Colors.surface1,
                      borderWidth: 1,
                      borderColor: diyLog.difficulty === level ? Colors.primary : Colors.glassBorder,
                      marginRight: Spacing.sm,
                    }}
                  >
                    <Text style={[Typography.caption, { color: diyLog.difficulty === level ? Colors.primary : Colors.textSecondary }]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Spent */}
            <View style={{ marginBottom: Spacing.md }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                Time Spent
              </Text>
              <TextInput
                style={Shared.input}
                placeholder="e.g. 2 hours"
                placeholderTextColor={Colors.arcticSilver}
                value={diyLog.timeSpent}
                onChangeText={(value) => setDiyLog(prev => ({ ...prev, timeSpent: value }))}
              />
            </View>

            {/* DIY Notes */}
            <View style={{ marginBottom: Spacing.sm }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                DIY Notes
              </Text>
              <TextInput
                style={[Shared.input, { height: 70, textAlignVertical: 'top', paddingTop: Spacing.md }]}
                placeholder="Tips for next time"
                placeholderTextColor={Colors.arcticSilver}
                value={diyLog.notes}
                onChangeText={(value) => setDiyLog(prev => ({ ...prev, notes: value }))}
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        ) : (
          <>
            {/* Vendor Input */}
            <Text style={[Typography.caption, { 
              color: Colors.textSecondary, 
              marginBottom: Spacing.sm 
            }]}>
              Shop/Vendor (Optional)
            </Text>
            <TextInput
              style={Shared.input}
              placeholder="Toyota Service, Joe's Auto, etc."
              placeholderTextColor={Colors.arcticSilver}
              value={formData.vendor}
              onChangeText={(value) => updateFormData('vendor', value)}
              autoCapitalize="words"
            />

            {/* Shop Review (shown when vendor has text) */}
            {formData.vendor.trim().length > 0 && (
              <View style={{ marginTop: Spacing.lg }}>
                {/* Star Rating */}
                <View style={{ marginBottom: Spacing.md }}>
                  <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                    Rating
                  </Text>
                  <StarRating
                    rating={shopReview.rating}
                    onRate={(star) => { Haptics.selectionAsync(); setShopReview(prev => ({ ...prev, rating: prev.rating === star ? 0 : star })); }}
                    size={28}
                  />
                </View>

                {/* Review Text */}
                <View style={{ marginBottom: Spacing.md }}>
                  <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                    Review (Optional)
                  </Text>
                  <TextInput
                    style={[Shared.input, { height: 70, textAlignVertical: 'top', paddingTop: Spacing.md }]}
                    placeholder="How was your experience?"
                    placeholderTextColor={Colors.arcticSilver}
                    value={shopReview.review}
                    onChangeText={(value) => setShopReview(prev => ({ ...prev, review: value }))}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Would Return */}
                <View style={{ marginBottom: Spacing.sm }}>
                  <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                    Would return?
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map((opt) => (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() => { Haptics.selectionAsync(); setShopReview(prev => ({ ...prev, wouldReturn: prev.wouldReturn === opt.value ? null : opt.value })); }}
                        activeOpacity={0.7}
                        style={{
                          paddingHorizontal: Spacing.lg,
                          paddingVertical: Spacing.sm,
                          borderRadius: 20,
                          backgroundColor: shopReview.wouldReturn === opt.value ? Colors.primary + '20' : Colors.surface1,
                          borderWidth: 1,
                          borderColor: shopReview.wouldReturn === opt.value ? Colors.primary : Colors.glassBorder,
                          marginRight: Spacing.sm,
                        }}
                      >
                        <Text style={[Typography.caption, { color: shopReview.wouldReturn === opt.value ? Colors.primary : Colors.textSecondary }]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {/* Notes Input */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[Typography.caption, { 
          color: Colors.textSecondary, 
          marginBottom: Spacing.sm 
        }]}>
          Notes (Optional)
        </Text>
        <TextInput
          style={[Shared.input, { 
            height: 80,
            textAlignVertical: 'top',
            paddingTop: Spacing.md,
          }]}
          placeholder="Additional details about the service..."
          placeholderTextColor={Colors.arcticSilver}
          value={formData.notes}
          onChangeText={(value) => updateFormData('notes', value)}
          multiline={true}
          numberOfLines={3}
        />
      </View>

      {/* Shop Recommendations (collapsible) */}
      <View style={{ marginBottom: Spacing.lg }}>
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setShopRecsOpen(!shopRecsOpen); }}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            backgroundColor: Colors.surface1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.glassBorder,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={18} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
            <Text style={[Typography.body, { color: Colors.textSecondary }]}>
              Shop Recommendations
            </Text>
          </View>
          <Ionicons name={shopRecsOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        {shopRecsOpen && (
          <View style={{ marginTop: Spacing.md, paddingHorizontal: Spacing.xs }}>
            {/* Summary */}
            <View style={{ marginBottom: Spacing.md }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.sm }]}>
                Shop Summary
              </Text>
              <TextInput
                style={[Shared.input, { height: 70, textAlignVertical: 'top', paddingTop: Spacing.md }]}
                placeholder="What did the shop say about your car?"
                placeholderTextColor={Colors.arcticSilver}
                value={shopSummary}
                onChangeText={setShopSummary}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Recommended services list */}
            {recommendations.map((rec, index) => (
              <View key={rec.id || index} style={{
                backgroundColor: Colors.surface1,
                borderRadius: 12,
                padding: Spacing.md,
                marginBottom: Spacing.sm,
                borderWidth: 1,
                borderColor: Colors.glassBorder,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                  <TextInput
                    style={[Shared.input, { flex: 1, height: 40, marginRight: Spacing.sm }]}
                    placeholder="Service name"
                    placeholderTextColor={Colors.arcticSilver}
                    value={rec.service}
                    onChangeText={(value) => {
                      setRecommendations(prev => prev.map((r, i) => i === index ? { ...r, service: value } : r));
                    }}
                  />
                  {/* Bell icon to save reminder */}
                  <TouchableOpacity
                    onPress={async () => {
                      if (!rec.service.trim()) return;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      try {
                        const key = `reminders_${selectedVehicle.id}`;
                        const raw = await AsyncStorage.getItem(key);
                        const existing = raw ? JSON.parse(raw) : [];
                        const days = URGENCY_DATES[rec.urgency] || 90;
                        const reminderDate = new Date();
                        reminderDate.setDate(reminderDate.getDate() + days);
                        const reminder = {
                          id: generateId(),
                          service: rec.service.trim(),
                          urgency: rec.urgency || 'Next Visit',
                          reminderDate: reminderDate.toISOString(),
                          serviceLogId: null, // will be set after save
                          createdAt: new Date().toISOString(),
                        };
                        existing.push(reminder);
                        await AsyncStorage.setItem(key, JSON.stringify(existing));
                        Alert.alert('Reminder Set', `Reminder for "${rec.service}" in ${days} days.`);
                      } catch (e) {
                        console.error('Error saving reminder:', e);
                      }
                    }}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  {/* Remove button */}
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      setRecommendations(prev => prev.filter((_, i) => i !== index));
                    }}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="close-circle-outline" size={20} color={Colors.deepRed} />
                  </TouchableOpacity>
                </View>

                {/* Urgency pills */}
                <View style={{ flexDirection: 'row' }}>
                  {Object.keys(URGENCY_DATES).map((urgency) => (
                    <TouchableOpacity
                      key={urgency}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setRecommendations(prev => prev.map((r, i) => i === index ? { ...r, urgency } : r));
                      }}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: Spacing.md,
                        paddingVertical: Spacing.xs + 1,
                        borderRadius: 14,
                        backgroundColor: rec.urgency === urgency ? Colors.primary + '20' : Colors.surface1,
                        borderWidth: 1,
                        borderColor: rec.urgency === urgency ? Colors.primary : Colors.glassBorder,
                        marginRight: Spacing.xs,
                      }}
                    >
                      <Text style={[Typography.small, { color: rec.urgency === urgency ? Colors.primary : Colors.textSecondary }]}>
                        {urgency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* Add recommendation button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setRecommendations(prev => [...prev, { id: generateId(), service: '', urgency: 'Next Visit' }]);
              }}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: Spacing.md,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.glassBorder,
                borderStyle: 'dashed',
                backgroundColor: Colors.surface1,
              }}
            >
              <Ionicons name="add" size={18} color={Colors.primary} style={{ marginRight: Spacing.xs }} />
              <Text style={[Typography.caption, { color: Colors.primary }]}>
                Add recommendation
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Photo Section */}
      <View style={{ marginBottom: Spacing.section }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            Photos (Optional)
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
                source={{ uri: photo.uri }}
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
          textAlign: 'center' 
        }]}>
          Add receipts, work photos, or any relevant images
        </Text>
      </View>
    </ScrollView>
  );

  if (vehicles.length === 0 && !preselectedVehicle) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: Colors.background,
          paddingHorizontal: Spacing.horizontalLarge,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 60, marginBottom: Spacing.xl }}>🚗</Text>
          
          <Text style={[Typography.h1, { textAlign: 'center', marginBottom: Spacing.md }]}>
            No Vehicles Yet
          </Text>
          
          <Text style={[Typography.body, { 
            textAlign: 'center', 
            color: Colors.textSecondary, 
            marginBottom: Spacing.section 
          }]}>
            Add a vehicle to your garage first before logging services.
          </Text>

          <TouchableOpacity
            style={Shared.buttonPrimary}
            onPress={handleClose}
            activeOpacity={0.9}
          >
            <Text style={[Typography.h2, { color: Colors.pearlWhite }]}>
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
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
              onPress={handleClose}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[Typography.h2, { color: Colors.text }]}>
              Log Service
            </Text>

            <View style={{ width: 32 }} />
          </View>

          {/* Content */}
          {step === 'vehicle' && renderVehicleStep()}
          {step === 'service' && renderServiceStep()}
          {step === 'custom' && renderCustomServiceStep()}
          {step === 'details' && renderDetailsStep()}

          {/* Bottom Actions */}
          <View style={{
            paddingVertical: Spacing.xl,
            borderTopWidth: 1,
            borderTopColor: Colors.surface,
          }}>
            {step === 'details' ? (
              <TouchableOpacity
                style={[Shared.buttonPrimary, { 
                  backgroundColor: loading ? Colors.arcticSilver : Colors.steelBlue 
                }]}
                onPress={handleSaveService}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={[Typography.h2, { color: Colors.pearlWhite }]}>
                  {loading ? 'Logging Service...' : '📝 Log Service'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            {step !== 'vehicle' && (
              <TouchableOpacity
                style={Shared.buttonSecondary}
                onPress={() => {
                  if (step === 'service') {
                    setStep(preselectedVehicle ? 'service' : 'vehicle');
                  } else if (step === 'custom') {
                    setStep('service');
                  } else if (step === 'details') {
                    setStep('service');
                  }
                }}
                activeOpacity={0.9}
              >
                <Text style={[Typography.h2, { color: Colors.steelBlue }]}>
                  ← Back
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}