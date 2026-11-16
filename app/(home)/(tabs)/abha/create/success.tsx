import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ABHA } from '../../../../../utils/api';
import { useAbhaStore } from '../stores/abhaStore';

// Convert binary image data to Base64.
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

export default function SuccessScreen() {
  const router = useRouter();

  const { ABHANumber, abha_address } = useLocalSearchParams<{
    ABHANumber?: string;
    abha_address?: string;
  }>();

  // Get the authentication token from your Zustand store.
  const token = useAbhaStore((state) => state.token);

  const [loadingCard, setLoadingCard] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  console.log('ABHA Number:', ABHANumber);
  console.log('ABHA Address:', abha_address);

  const handleViewAbhaCard = async () => {
    if (!token?.trim()) {
      setErrorMessage('Authentication token is missing.');
      return;
    }

    try {
      setLoadingCard(true);
      setErrorMessage('');

      // Request the ABHA card as binary image data.
      const response = await ABHA.get(
        'profile/account/abha-card',
        {
          headers: {
            token: token.trim(),
          },
          responseType: 'arraybuffer',
        }
      );

      console.log(
        'ABHA card Content-Type:',
        response.headers?.['content-type']
      );

      console.log(
        'ABHA card received successfully. Bytes:',
        response.data?.byteLength
      );

      // Convert the PNG response to Base64.
      const base64Image = arrayBufferToBase64(response.data);

      // Open your existing download_abha.tsx screen.
      router.push({
        pathname: '/abha/create/download_abha',
        params: {
          cardImage: base64Image,
        },
      });
    } catch (error: any) {
      console.error(
        'ABHA card API error:',
        error?.response?.data ?? error?.message
      );

      setErrorMessage(
        error?.response?.data?.Message ??
          error?.response?.data?.message ??
          'Unable to retrieve your ABHA card. Please try again.'
      );
    } finally {
      setLoadingCard(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="checkmark"
            size={40}
            color="#10B981"
          />
        </View>
      </View>

      {/* Completion Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          Step 4 of 4 - Complete
        </Text>
      </View>

      <Text style={styles.title}>
        Your ABHA is ready!
      </Text>

      <Text style={styles.subtitle}>
        Your Ayushman Bharat Health Account has been successfully created.
      </Text>

      {/* ABHA Information */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>
          ABHA Number
        </Text>

        <Text style={styles.infoValue}>
          {ABHANumber || 'ABHA number not received'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.infoLabel}>
          ABHA Address
        </Text>

        <Text style={styles.infoLink}>
          {abha_address || 'ABHA address not received'}
        </Text>
      </View>

      {/* API Error */}
      {errorMessage !== '' && (
        <Text style={styles.errorText}>
          {errorMessage}
        </Text>
      )}

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            loadingCard && styles.disabledButton,
          ]}
          onPress={handleViewAbhaCard}
          disabled={loadingCard}
          activeOpacity={0.8}
        >
          {loadingCard ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              View ABHA Card
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/abha/abha_profile')}
          disabled={loadingCard}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            Go to Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20, // Reduced slightly to fit the header
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    padding: 8,
    marginLeft: -8, // Pulls icon to align with the left edge of the screen
  },

  iconContainer: {
    marginBottom: 24,
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  badge: {
    backgroundColor: '#F0F6FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A5898',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },

  infoCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },

  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: 1,
  },

  infoLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A5898',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  errorText: {
    width: '100%',
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 16,
  },

  bottomContainer: {
    width: '100%',
    marginTop: 'auto',
    gap: 12,
  },

  primaryButton: {
    backgroundColor: '#0A5898',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },

  disabledButton: {
    opacity: 0.7,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0A5898',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  secondaryButtonText: {
    color: '#0A5898',
    fontSize: 16,
    fontWeight: '600',
  },
});