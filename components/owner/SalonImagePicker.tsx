import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { themeFonts } from '@/constants/theme';
import { storage } from '@/lib/firebase';

type SalonImagePickerProps = {
  salonId: string;
  imageUrl: string;
  error?: string;
  onImageUrlChange: (imageUrl: string) => void;
};

export function SalonImagePicker({
  salonId,
  imageUrl,
  error,
  onImageUrlChange,
}: SalonImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const pickImage = async () => {
    setUploadError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setUploadError('Gallery permission is required to choose a salon image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setIsUploading(true);

    try {
      const asset = result.assets[0];
      const uploadedUrl = await uploadSalonImage(
        salonId,
        asset.uri,
        asset.mimeType,
      );
      onImageUrlChange(uploadedUrl);
    } catch {
      setUploadError('Image upload failed. Check Firebase Storage and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Salon image</Text>

      <View style={[styles.preview, error ? styles.previewError : null]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.emptyPreview}>
            <Ionicons name="image-outline" size={28} color="#DB2777" />
          </View>
        )}
      </View>

      <Pressable
        style={[styles.button, isUploading && styles.buttonDisabled]}
        onPress={pickImage}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#DB2777" />
        ) : (
          <>
            <Ionicons name="images-outline" size={18} color="#DB2777" />
            <Text style={styles.buttonText}>Choose from gallery</Text>
          </>
        )}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {uploadError ? <Text style={styles.error}>{uploadError}</Text> : null}
    </View>
  );
}

async function uploadSalonImage(
  salonId: string,
  uri: string,
  mimeType: string | undefined,
) {
  const response = await fetch(uri);
  const blob = await response.blob();
  const extension = getImageExtension(uri, mimeType);
  const imageRef = ref(storage, `salons/${salonId}/${Date.now()}.${extension}`);

  await uploadBytes(imageRef, blob, {
    contentType: mimeType ?? blob.type ?? 'image/jpeg',
  });

  return getDownloadURL(imageRef);
}

function getImageExtension(uri: string, mimeType: string | undefined) {
  if (mimeType?.includes('png')) {
    return 'png';
  }

  if (mimeType?.includes('webp')) {
    return 'webp';
  }

  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#831843',
  },
  preview: {
    overflow: 'hidden',
    height: 170,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 18,
    backgroundColor: '#FFF7FB',
  },
  previewError: {
    borderColor: '#E11D48',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F9A8D4',
    borderRadius: 14,
    backgroundColor: '#FFF1F7',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#DB2777',
  },
  error: {
    fontFamily: themeFonts.body,
    fontSize: 12,
    color: '#E11D48',
  },
});
