import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, Shared } from '../theme';

const { width } = Dimensions.get('window');

// Individual Screen Components
const WelcomeScreen = ({ onNext }) => {
  const breathingValue = useState(new Animated.Value(0.98))[0];

  React.useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingValue, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingValue, {
          toValue: 0.98,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    breathingAnimation.start();
    
    return () => breathingAnimation.stop();
  }, []);

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.horizontalLarge,
    }}>
      <Animated.View style={[{ 
        transform: [{ scale: breathingValue }],
        marginBottom: Spacing.section,
      }]}>
        <Text style={{ fontSize: 80 }}>🚗</Text>
      </Animated.View>
      
      <Text style={[Typography.hero, { 
        textAlign: 'center', 
        marginBottom: Spacing.lg,
        color: Colors.textPrimary,
      }]}>
        welcome to glovebox
      </Text>
      
      <Text style={[Typography.body, { 
        textAlign: 'center', 
        color: Colors.textSecondary, 
        marginBottom: Spacing.section,
        lineHeight: 24,
        fontSize: 17,
      }]}>
        smart car maintenance tracking made simple. never miss a service, track costs, and keep your vehicle running like new.
      </Text>

      <TouchableOpacity
        style={[Shared.buttonPrimary, { width: '100%', maxWidth: 280 }]}
        onPress={onNext}
        activeOpacity={0.9}
      >
        <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
          let's get started
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const FeaturesScreen = ({ onNext, onBack }) => {
  const features = [
    {
      icon: 'calendar-outline',
      title: 'maintenance schedules',
      description: 'manufacturer-based reminders so you never miss an oil change or inspection',
      color: Colors.primary,
    },
    {
      icon: 'cash-outline',
      title: 'cost tracking',
      description: 'see exactly how much you spend on maintenance with smart analytics',
      color: Colors.success,
    },
    {
      icon: 'time-outline',
      title: 'service history',
      description: 'complete timeline of all services with photos, receipts, and notes',
      color: Colors.warning,
    },
  ];

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.horizontalLarge,
    }}>
      <View style={{ marginBottom: Spacing.section }}>
        <Text style={[Typography.hero, { 
          textAlign: 'center', 
          marginBottom: Spacing.lg,
          color: Colors.textPrimary,
        }]}>
          everything you need
        </Text>
        
        <Text style={[Typography.body, { 
          textAlign: 'center', 
          color: Colors.textSecondary, 
          marginBottom: Spacing.section,
          lineHeight: 22,
        }]}>
          powerful features designed to keep your car healthy and your wallet happy
        </Text>
      </View>

      <View style={{ marginBottom: Spacing.section }}>
        {features.map((feature, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: Spacing.xl,
              backgroundColor: Colors.glassBackground,
              padding: Spacing.lg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.glassBorder,
            }}
          >
            <View style={{
              backgroundColor: feature.color + '20',
              borderRadius: 20,
              padding: 12,
              marginRight: Spacing.md,
              borderWidth: 1,
              borderColor: feature.color + '30',
            }}>
              <Ionicons name={feature.icon} size={24} color={feature.color} />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h2, { 
                color: Colors.textPrimary,
                marginBottom: Spacing.xs,
              }]}>
                {feature.title}
              </Text>
              <Text style={[Typography.body, { 
                color: Colors.textSecondary,
                lineHeight: 20,
              }]}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[Shared.buttonPrimary, { width: '100%' }]}
        onPress={onNext}
        activeOpacity={0.9}
      >
        <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
          sounds great!
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const GetStartedScreen = ({ onAddVehicle, onBack }) => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.horizontalLarge,
    }}>
      <View style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primary + '15',
        borderWidth: 2,
        borderColor: Colors.primary + '30',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.section,
      }}>
        <MaterialCommunityIcons name="car-plus" size={48} color={Colors.primary} />
      </View>
      
      <Text style={[Typography.hero, { 
        textAlign: 'center', 
        marginBottom: Spacing.lg,
        color: Colors.textPrimary,
      }]}>
        you're all set!
      </Text>
      
      <Text style={[Typography.body, { 
        textAlign: 'center', 
        color: Colors.textSecondary, 
        marginBottom: Spacing.section,
        lineHeight: 22,
      }]}>
        now let's add your first vehicle so we can start tracking its maintenance and keeping it in perfect condition.
      </Text>

      <TouchableOpacity
        style={[Shared.buttonPrimary, { width: '100%', maxWidth: 280 }]}
        onPress={onAddVehicle}
        activeOpacity={0.9}
      >
        <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
          add your first vehicle
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function OnboardingModal({ visible, onClose, onAddVehicle }) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));

  const screens = ['welcome', 'features', 'getstarted'];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      Haptics.selectionAsync();
      
      // Slide animation
      Animated.timing(slideAnim, {
        toValue: -(currentScreen + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      Haptics.selectionAsync();
      
      // Slide animation
      Animated.timing(slideAnim, {
        toValue: -(currentScreen - 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleAddVehicle = async () => {
    try {
      // Mark onboarding as complete
      await AsyncStorage.setItem('onboarding_complete', 'true');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Close this modal and open Add Vehicle modal
      onClose();
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        onAddVehicle();
      }, 300);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleSkip = async () => {
    try {
      // Mark onboarding as complete without adding vehicle
      await AsyncStorage.setItem('onboarding_complete', 'true');
      onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 30,
          paddingHorizontal: Spacing.horizontal,
          paddingBottom: Spacing.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Back button (only show if not on first screen) */}
          <TouchableOpacity
            onPress={currentScreen > 0 ? handleBack : null}
            style={{
              opacity: currentScreen > 0 ? 1 : 0,
              padding: Spacing.sm,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Progress dots */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {screens.map((_, index) => (
              <View
                key={index}
                style={{
                  width: currentScreen === index ? 16 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: currentScreen === index ? Colors.primary : Colors.textTertiary,
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>

          {/* Skip button */}
          <TouchableOpacity
            onPress={handleSkip}
            style={{ padding: Spacing.sm }}
            activeOpacity={0.7}
          >
            <Text style={[Typography.body, { color: Colors.textSecondary }]}>
              skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animated Screen Container */}
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <Animated.View
            style={{
              flexDirection: 'row',
              transform: [{ translateX: slideAnim }],
              width: width * screens.length,
            }}
          >
            {/* Welcome Screen */}
            <View style={{ width, flex: 1 }}>
              <WelcomeScreen onNext={handleNext} />
            </View>

            {/* Features Screen */}
            <View style={{ width, flex: 1 }}>
              <FeaturesScreen onNext={handleNext} onBack={handleBack} />
            </View>

            {/* Get Started Screen */}
            <View style={{ width, flex: 1 }}>
              <GetStartedScreen onAddVehicle={handleAddVehicle} onBack={handleBack} />
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}