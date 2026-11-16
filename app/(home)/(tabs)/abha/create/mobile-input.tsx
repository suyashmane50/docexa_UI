import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { useRouter } from 'expo-router';

import { ABHA } from '../../../../../utils/api';
import { useAbhaStore } from '../../abha/stores/abhaStore';

export default function MobileInputScreen() {
  const router = useRouter();

  const txnId = useAbhaStore(
    (state) => state.txnId
  );

  const setTxnId = useAbhaStore(
    (state) => state.setTxnId
  );

  const [mobile, setMobile] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setErrorMessage('');

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setErrorMessage(
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (!txnId) {
      setErrorMessage(
        'Transaction ID is missing. Please restart enrollment.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await ABHA.post(
        'enrollment/request/updateMobile/otp',
        {
          txnId,
          mobile,
        }
      );

      console.log(
        'Mobile input OTP response:',
        response.data
      );

      if (
        response.status === 200 ||
        response.status === 202
      ) {
        const data = response.data;

        const responseTxnId =
          data?.Response?.txnId ??
          data?.ResponseJSON?.txnId ??
          data?.txnId ??
          txnId;

        // Update Zustand if API returns a new transaction ID
        setTxnId(String(responseTxnId));

        router.push({
          pathname: '/abha/create/abha_mobile-otp',
          params: {
            mobile: mobile,
            txnId: String(responseTxnId),
          },
        });

        return;
      }

      setErrorMessage(
        response.data?.Response?.message ||
        response.data?.Message ||
        'Unable to send OTP. Please try again.'
      );
    } catch (error: any) {
      console.error(
        'Mobile input OTP error:',
        error?.response?.data ?? error?.message
      );

      setErrorMessage(
        error?.response?.data?.Response?.message ||
        error?.response?.data?.Message ||
        error?.response?.data?.message ||
        'Unable to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Enter your mobile number
      </Text>

      <Text style={styles.subtitle}>
        Enter the mobile number you want to register
        for ABHA communication.
      </Text>

      <Text style={styles.label}>
        Mobile number
      </Text>

      <View
        style={[
          styles.inputContainer,
          errorMessage !== '' && styles.inputError,
        ]}
      >
        <Text style={styles.countryCode}>
          +91
        </Text>

        <View style={styles.divider} />

        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={10}
          value={mobile}
          onChangeText={(text) => {
            setMobile(
              text.replace(/\D/g, '').slice(0, 10)
            );
            setErrorMessage('');
          }}
          editable={!loading}
        />
      </View>

      {errorMessage !== '' && (
        <Text style={styles.errorText}>
          {errorMessage}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          loading && styles.buttonDisabled,
        ]}
        onPress={handleSendOtp}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Send OTP
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
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

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  inputError: {
    borderColor: '#DC2626',
  },

  countryCode: {
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
  },

  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },

  primaryButton: {
    backgroundColor: '#0A5898',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
