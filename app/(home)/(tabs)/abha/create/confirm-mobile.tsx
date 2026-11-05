
import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import { ABHA } from '../../../../../utils/api';

type OptionCardProps = {
  id: 'yes' | 'no';
  title: string;
  subtitle: string;
};

export default function ConfirmMobileScreen() {
  const router = useRouter();

  const [selected, setSelected] = useState<'yes' | 'no'>('yes');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { txnId, mobile } = useLocalSearchParams<{
    txnId: string;
    mobile: string;
  }>();

  const handleContinue = async () => {
  
    if (loading) {
      return;
    }

    setErrorMessage('');
    if (selected === 'no') {
      router.push('/abha/create/mobile-input');
      return;
    }
    if (!txnId || !mobile) {
      setErrorMessage(
        'Transaction ID or mobile number is missing. Please go back and try again.'
      );
      return;
    }

    setLoading(true);

    try {
      console.log('Requesting OTP...');
      console.log('Transaction ID:', txnId);

      const response = await ABHA.post(
        'enrollment/request/updateMobile/otp',
        {
          txnId,
          mobile,
        }
      );

      console.log('OTP API status:', response.status);
      console.log('OTP API response:', response.data);

      if (response.status === 200) {
        const data = response.data;

        const message = String(
          data?.Response?.message ?? ''
        );

        console.log('OTP request message:', message);
        const txnId = String(
          data?.Response?.txnId ?? ''
        );
        console.log('New Transaction ID:', txnId);
        // Extract the final four digits from the API message.
        const mobileMatch = message.match(/(\d{4})\s*$/);

        const maskedMobile = mobileMatch
          ? `******${mobileMatch[1]}`
          : '******';

        // console.log('Masked mobile number:', maskedMobile);
        router.push({
          pathname: '/abha/create/abha_mobile-otp',
          params: {
            maskedMobile,
            transactionId: txnId,
          },
        });

        return;
      }

      setErrorMessage(
        'Unable to send OTP. Please try again.'
      );
    } catch (error: any) {
      console.error(
        'OTP request failed:',
        error?.response?.data ?? error?.message ?? error
      );

      const message =
        error?.response?.data?.message ??
        error?.response?.data?.Response?.message ??
        error?.message ??
        'An unexpected error occurred. Please try again.';

      setErrorMessage(String(message));
    } finally {
      setLoading(false);
    }
  };

  const OptionCard = ({
    id,
    title,
    subtitle,
  }: OptionCardProps) => {
    const isSelected = selected === id;

    return (
      <TouchableOpacity
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected,
        ]}
        onPress={() => {
          if (!loading) {
            setSelected(id);
            setErrorMessage('');
          }
        }}
        activeOpacity={0.8}
        disabled={loading}
      >
        <View style={styles.radioContainer}>
          {isSelected ? (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#0A5898"
            />
          ) : (
            <View style={styles.radioUnselected} />
          )}
        </View>

        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>
            {title}
          </Text>

          <Text style={styles.optionSubtitle}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        Confirm your communication number
      </Text>

      <Text style={styles.subtitle}>
        Is your communication mobile number the same as your
        Aadhaar-linked mobile number?
      </Text>

      <View style={styles.optionsContainer}>
        <OptionCard
          id="yes"
          title="Yes, use the same number"
          subtitle="Use my Aadhaar-linked mobile number for communication."
        />

        <OptionCard
          id="no"
          title="No, use a different number"
          subtitle="I want to register another mobile number."
        />
      </View>

      {errorMessage !== '' && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color="#DC2626"
          />

          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          loading && styles.primaryButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              Sending OTP...
            </Text>
          </View>
        ) : (
          <Text style={styles.primaryButtonText}>
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 32,
  },

  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },

  optionCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },

  optionCardSelected: {
    borderColor: '#0A5898',
    backgroundColor: '#F0F6FA',
  },

  radioContainer: {
    marginRight: 12,
    marginTop: 2,
  },

  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },

  optionTextContainer: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  optionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: '#0A5898',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});

