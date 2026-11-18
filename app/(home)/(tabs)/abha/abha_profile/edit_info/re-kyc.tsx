import React, { useMemo, useState } from 'react';
import { useReKYCStore } from '../../stores/re-KYCStore';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import Svg, { Path, Polyline } from 'react-native-svg';
import { useRouter } from 'expo-router';

import { ABHA } from '@/utils/api';
import { useAbhaStore } from '../../stores/abhaStore';


const setTransactionId = useReKYCStore(
  (state : any) => state.setTransactionId
);

const Icon = ({ name, size = 24, color = '#000' }: any) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'arrowLeft':
      return (
        <Svg {...props}>
          <Path d="M19 12H5M12 19l-7-7 7-7" />
        </Svg>
      );
    case 'shield':
      return (
        <Svg {...props}>
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <Polyline points="9 12 11 14 15 10" />
        </Svg>
      );
    case 'info':
      return (
        <Svg {...props}>
          <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <Path d="M12 16v-4" />
          <Path d="M12 8h.01" />
        </Svg>
      );
    default:
      return null;
  }
};

// Extract account from Zustand data
const getStoredAccount = (profileData: any, savedAccounts: any) => {
  const responseRoot =
    profileData?.Response ??
    profileData?.response ??
    profileData?.data?.Response ??
    profileData?.data ??
    profileData;

  const candidates = [
    responseRoot?.ABHAProfile,
    responseRoot?.account,
    responseRoot?.Account,
    responseRoot?.accounts?.[0],
    responseRoot?.profile,
    responseRoot?.Profile,
    Array.isArray(responseRoot) ? responseRoot[0] : responseRoot,
  ];

  const profileAccount = candidates.find(
    (candidate) =>
      candidate &&
      typeof candidate === 'object' &&
      (candidate.name ||
        candidate.firstName ||
        candidate.first_name ||
        candidate.ABHANumber ||
        candidate.abhaNumber ||
        candidate.preferredAbhaAddress ||
        candidate.abhaAddress)
  );

  const loginAccount = Array.isArray(savedAccounts)
    ? savedAccounts[0]
    : savedAccounts;

  return profileAccount ?? loginAccount ?? null;
};

export default function ReKYCScreen() {
  const router = useRouter();

  // Zustand data
  const token = useAbhaStore((state) => state.token);
  const profileData = useAbhaStore((state) => state.profileData);
  const savedAccounts = useAbhaStore((state) => state.data);

  // Extract account
  const account = useMemo(
    () => getStoredAccount(profileData, savedAccounts),
    [profileData, savedAccounts]
  );

  // Extract ABHA number
  const abhaNumber =
    account?.ABHANumber ??
    account?.abhaNumber ??
    account?.abha_number ??
    null;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Start Re-KYC
  const handleStartReKYC = async () => {
    if (loading) return;

    setErrorMessage('');
    setSuccessMessage('');

    if (!token) {
      setErrorMessage('Token not found. Please login again.');
      return;
    }

    if (!abhaNumber) {
      setErrorMessage(
        'ABHA number not found. Please refresh your ABHA profile.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await ABHA.post(
        'profile/account/re-kyc/request/otp',
        {
          token: token,
          'abha-number': abhaNumber,
        }
      );

      console.log('Re-KYC OTP response:', response.data);
      if (response.status === 200) {

  console.log('Re-KYC OTP response:', response.data);

  // Extract transaction ID
  const transactionId =
    response.data?.txnId ??
    response.data?.transactionId ??
    response.data?.Response?.txnId ??
    response.data?.Response?.transactionId;

      if (!transactionId) {
        setErrorMessage('Transaction ID not received from server.');
        return;
      }

      // Save transaction ID in Zustand
      setTransactionId(transactionId);

      console.log('Saved Re-KYC Transaction ID:', transactionId);

      setSuccessMessage(
        response.data?.Message ||
        response.data?.message ||
        'OTP sent successfully.'
      );

      router.push('/abha/abha_profile/edit_info/re-kyc_OTP');

    } else {
      setErrorMessage(
        response.data?.Message ||
        response.data?.message ||
        'Unable to send Re-KYC OTP.'
      );
    }
    } catch (error: any) {
      console.log('Re-KYC OTP error:', error.response?.data);

      setErrorMessage(
        error.response?.data?.Message ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrowLeft" size={24} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Re-KYC</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Icon name="shield" size={32} color="#0F71C2" />
          </View>
        </View>

        {/* Titles */}
        <Text style={styles.title}>
          Verify your identity
        </Text>

        <Text style={styles.subtitle}>
          To keep your ABHA account secure, we need to re-verify your identity using your Aadhaar-linked mobile number.
        </Text>

        {/* ABHA Number Card */}
        <View style={styles.abhaCard}>
          <Text style={styles.abhaLabel}>ABHA Number</Text>
          <Text style={styles.abhaNumber}>
            {abhaNumber || 'Not available'}
          </Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="info" size={18} color="#64748B" />
          <Text style={styles.infoText}>
            You will receive a 6-digit OTP on your Aadhaar-linked mobile to complete this process.
          </Text>
        </View>

        {/* Error Message */}
        {!!errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Success Message */}
        {!!successMessage && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              {successMessage}
            </Text>
          </View>
        )}

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleStartReKYC}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.startButtonText}>
              Start Verification
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Your personal information is protected and securely processed.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  backButton: {
    padding: 4,
    marginLeft: -4,
    marginRight: 8,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },

  abhaCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  abhaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },

  abhaNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.5,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    marginBottom: 32,
    alignItems: 'flex-start',
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },

  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  successContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  successText: {
    color: '#15803D',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  startButton: {
    backgroundColor: '#94A3B8', // 👈 Changed to the grayish color from your image
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },

  disabledButton: {
    opacity: 0.6,
  },

  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});