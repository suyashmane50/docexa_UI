import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure you have expo-linear-gradient installed

export default function DownloadAbhaScreen() {
  const { cardImage } = useLocalSearchParams<{
    cardImage?: string | string[];
  }>();

  const [downloading, setDownloading] = useState(false);

  const imageData = Array.isArray(cardImage) ? cardImage[0] : cardImage;
  const imageUri = imageData ? `data:image/png;base64,${imageData}` : null;

  const handleDownload = async () => {
    if (!imageData) {
      Alert.alert('Card unavailable', 'The ABHA card image has not been received.');
      return;
    }

    try {
      setDownloading(true);
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = imageUri!;
        link.download = 'ABHA_Card.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        Alert.alert(
          'Download unavailable',
          'Native file saving needs to be configured for this device.'
        );
      }
    } catch (error) {
      console.error('ABHA card download error:', error);
      Alert.alert('Download failed', 'Unable to download your ABHA card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Stylish Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your ABHA Card</Text>
        <Text style={styles.subtitle}>Your digital health identity</Text>
      </View>

      {/* Card Display Area - Maximized */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <View style={styles.cardWrapper}>
            <Image
              source={{ uri: imageUri }}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="image-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyText}>ABHA card image is unavailable.</Text>
          </View>
        )}
      </View>

      {/* Premium Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.downloadButton, downloading && styles.disabledButton]}
          onPress={handleDownload}
          disabled={downloading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0A5898', '#0872B9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {downloading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="download-outline" size={22} color="#FFFFFF" />
                <Text style={styles.downloadButtonText}>Download ABHA Card</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Premium soft gray-blue background
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 50 : 30, 
    paddingBottom: 16, 
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  imageContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0, // Touches the edges for max size
    paddingVertical: 10,
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    padding: 10,
    // Premium deep shadow to make the card float
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  cardImage: {
    width: '100%', 
    height: '100%', 
    borderRadius: 12, // Smooth edges on the image itself
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, 
  },
  downloadButton: {
    borderRadius: 14, // Smooth rounded button
    // Button shadow
    shadowColor: '#0A5898',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 14,
  },
  downloadButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.7,
  },
});