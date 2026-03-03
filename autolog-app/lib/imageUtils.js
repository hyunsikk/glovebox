import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

// Resize image to max width while maintaining aspect ratio
export const resizeImageUri = async (uri, maxWidth = 800) => {
  try {
    // For web compatibility, we'll use a simple approach
    if (Platform.OS === 'web') {
      return uri; // Return as-is for web, browsers handle resizing well
    }

    // For native platforms, we'd implement proper resizing
    // For now, returning as-is since expo-image-picker already provides reasonable sizes
    return uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    return uri;
  }
};

// Convert image to base64 for storage
export const convertToBase64 = async (uri) => {
  try {
    if (Platform.OS === 'web') {
      // For web, we need to handle differently
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // For native platforms, use FileSystem or similar
      // For now, we'll store the URI directly and handle base64 conversion later if needed
      return uri;
    }
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Pick image from library
export const pickImageAsync = async () => {
  try {
    // Request permission for media library access
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Needed',
        'We need access to your photo library to add images. Please enable this in your device settings.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      // Resize image if needed
      const resizedUri = await resizeImageUri(asset.uri);
      
      return {
        uri: resizedUri,
        width: asset.width,
        height: asset.height,
        type: asset.type || 'image/jpeg',
      };
    }

    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
    return null;
  }
};

// Save image for a service record
export const saveServiceImage = async (imageData, serviceId) => {
  try {
    // Convert to base64 for storage in AsyncStorage
    const base64Data = await convertToBase64(imageData.uri);
    
    return {
      id: `service_${serviceId}_${Date.now()}`,
      serviceId,
      uri: imageData.uri,
      base64: base64Data,
      width: imageData.width,
      height: imageData.height,
      type: imageData.type,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error saving service image:', error);
    throw error;
  }
};

// Save image for a vehicle
export const saveVehicleImage = async (imageData, vehicleId) => {
  try {
    // Convert to base64 for storage in AsyncStorage
    const base64Data = await convertToBase64(imageData.uri);
    
    return {
      id: `vehicle_${vehicleId}_${Date.now()}`,
      vehicleId,
      uri: imageData.uri,
      base64: base64Data,
      width: imageData.width,
      height: imageData.height,
      type: imageData.type,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error saving vehicle image:', error);
    throw error;
  }
};

// Generate thumbnail URI from base64 data
export const getThumbnailUri = (imageData) => {
  if (!imageData) return null;
  
  // If we have a base64 data URI, return it
  if (imageData.base64 && imageData.base64.startsWith('data:')) {
    return imageData.base64;
  }
  
  // Otherwise, return the original URI
  return imageData.uri;
};

// Validate image file size (in MB)
export const validateImageSize = (imageData, maxSizeMB = 5) => {
  // For now, we'll assume images picked from the library are reasonable size
  // In a production app, you'd check the actual file size
  return true;
};

export default {
  pickImageAsync,
  saveServiceImage,
  saveVehicleImage,
  getThumbnailUri,
  validateImageSize,
  resizeImageUri,
  convertToBase64,
};