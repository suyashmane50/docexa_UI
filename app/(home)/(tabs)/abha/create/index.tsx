import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useAbhaStore } from '../../abha/stores/abhaStore';
import { useRouter } from 'expo-router';
import { ABHA } from '../../../../../utils/api';

export default function EnterAadhaarScreen() {
  const router = useRouter();
  const setTxnId = useAbhaStore((state) => state.setTxnId);
  const [errorMessage, setErrorMessage] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);

  // Format Aadhaar number into groups of four digits.
  const handleAadhaarChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 12);

    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');

    setAadhaar(formatted);
  };

const handleSendOtp = async () => {
  const aadhaarNumber = aadhaar.replace(/\D/g, '');
  setErrorMessage('');
  if (aadhaarNumber.length !== 12) {
    Alert.alert(
      'Invalid Aadhaar',
      'Please enter a valid 12-digit Aadhaar number.'
    );
    return;
  }

  setLoading(true);

  try {
    const response = await ABHA.post(
      'enrollment/request/otp',
      {
        loginId: aadhaarNumber,
      }
    );

    const data = response.data;

    console.log('OTP API response:', data);

    // Handle API errors even when HTTP status is 200.
    if (data?.Success === false || data?.success === false) {
      Alert.alert(
        'OTP Request Failed',
        data?.Message || data?.message || 'Something went wrong.'
      );
      return;
    }

    const responseJSON = data?.ResponseJSON;

if (data?.status === 200 && responseJSON?.txnId) {
  const message = responseJSON.message ?? '';

  const mobileMatch = message.match(
    /ending with \*+\s*(\d{4})/i
  );

  const maskedMobile = mobileMatch
    ? `******${mobileMatch[1]}`
    : '******';

    setTxnId(String(responseJSON.txnId));
    router.push({
      pathname: '/abha/create/otp',
      params: {
        mobile: maskedMobile,
      },
    });
}  else {
      Alert.alert(
        'OTP Request Failed',
        data?.Message ||
          data?.message ||
          'Unable to send OTP. Please try again.'
      );
    }
} catch (error: any) {
  const errorData = error?.response?.data;

  console.log('OTP API error:', errorData ?? error?.message);

  const message =
    errorData?.Message ||
    errorData?.message ||
    error?.message ||
    'Something went wrong. Please try again.';

  console.log('Message to display:', message);

  setErrorMessage(message);
} finally {
  setLoading(false);
}

};

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Enter your Aadhaar number
      </Text>

      <Text style={styles.subtitle}>
        Your Aadhaar will be used to verify your identity
        and create your ABHA.
      </Text>

      <Text style={styles.label}>
        Aadhaar number
      </Text>

      {/* Attractive Aadhaar input field */}
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons
            name="card-outline"
            size={24}
            color="#0A5898"
          />
        </View>

        <View style={styles.inputContent}>
          <Text style={styles.inputLabel}>
            Aadhaar number
          </Text>
        <TextInput
            style={styles.input}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={aadhaar}
            onChangeText={handleAadhaarChange}
            maxLength={14}
            editable={!loading}
            autoComplete="off"
            selectionColor="#0A5898"
            cursorColor="#0A5898"
            underlineColorAndroid="transparent"
          />
        </View>

        <Ionicons
          name="shield-checkmark-outline"
          size={22}
          color="#059669"
        />
      </View>

      <View style={styles.securityHint}>
        <Ionicons
          name="lock-closed-outline"
          size={14}
          color="#059669"
        />

        <Text style={styles.securityHintText}>
          Your information is used for identity verification.
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color="#0A5898"
          style={styles.infoIcon}
        />

        <Text style={styles.infoText}>
          Your Aadhaar information is used for identity
          verification. Avoid storing it unnecessarily.
        </Text>
      </View>
       {errorMessage !== '' && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={18}
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
          loading && styles.disabledButton,
        ]}
        onPress={handleSendOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Send OTP
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
    paddingTop: 40,
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
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },

  // Aadhaar input container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1E5F2',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 82,
    marginBottom: 8,

    shadowColor: '#0A5898',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },

  inputIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EAF4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  inputContent: {
    flex: 1,
    justifyContent: 'center',
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 3,
  },

input: {
  padding: 0,
  fontSize: 17,
  fontWeight: '600',
  letterSpacing: 1,
  color: '#1F2937',
  minHeight: 28,
  borderWidth: 0,
  outlineWidth: 0,
  outlineColor: 'transparent',
  backgroundColor: 'transparent',
  ...( { outlineStyle: 'none' } as any ),
},

  securityHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
    marginLeft: 4,
  },

  securityHintText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F6FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#D3E5F1',
  },

  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },

  primaryButton: {
    backgroundColor: '#0A5898',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },

  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    marginLeft: 8,
    lineHeight: 18,
  },
});