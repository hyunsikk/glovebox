import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';

/** Directory where persisted images live, under the current app container. */
export const imagesDir = () => `${FileSystem.documentDirectory}images/`;

/**
 * Persist a picked image durably and cheaply:
 * - Native: copy the file into the app's documentDirectory and return that
 *   stable path. The picker's original URI points at a cache the OS can purge,
 *   and we must NOT inline image bytes into AsyncStorage.
 * - Web: fall back to a base64 data URL (no FileSystem available).
 * On any failure, returns the original URI so the flow never hard-fails.
 */
export const persistImage = async (uri) => {
  try {
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      return await convertToBase64(uri);
    }
    const dir = imagesDir();
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
    const ext = (uri.split('.').pop() || 'jpg').split('?')[0].slice(0, 5);
    const dest = `${dir}img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch (error) {
    console.error('Error persisting image, using original uri:', error);
    return uri;
  }
};

/**
 * Downscale + recompress a picked image so attachments don't bloat storage and
 * (now that images travel inside the backup blob) keep that blob a sane size.
 * Caps the long edge at maxWidth and recompresses to JPEG. Skips the resize for
 * images already within bounds, but still recompresses. Web is left untouched
 * (browsers size on display). On failure returns the original uri.
 */
export const resizeImageUri = async (uri, maxWidth = 1600, sourceWidth = null) => {
  try {
    if (Platform.OS === 'web') return uri;
    const actions = sourceWidth && sourceWidth <= maxWidth ? [] : [{ resize: { width: maxWidth } }];
    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return result.uri;
  } catch (error) {
    console.error('Error resizing image, using original:', error);
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
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      // Downscale/recompress before it gets persisted and backed up.
      const resizedUri = await resizeImageUri(asset.uri, 1600, asset.width);

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

export default {
  pickImageAsync,
  getThumbnailUri,
  resizeImageUri,
  convertToBase64,
  persistImage,
  imagesDir,
};