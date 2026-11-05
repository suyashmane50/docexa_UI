import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAbhaStore } from '../../abha/stores/abhaStore';
import { Ionicons } from '@expo/vector-icons';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import { ABHA } from '../../../../../utils/api';

export default function MobileOtpScreen() {
  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [timer, setTimer] = useState(57);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

 const router = useRouter();

  // Retrieve the transaction ID from Zustand.
  const transactionId = useAbhaStore(
    (state) => state.txnId
  );

  // Retrieve the entered mobile number from route parameters.
  const { mobile } = useLocalSearchParams<{
    mobile?: string;
  }>();

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  const handleOtpChange = (
    text: string,
    index: number
  ) => {
    if (!/^\d*$/.test(text)) {
      return;
    }

    setErrorMessage('');

    const newOtp = [...otp];

    // Support pasting the entire OTP into an input.
    if (text.length > 1) {
      const digits = text.slice(0, 6).split('');

      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] ?? '';
      }

      setOtp(newOtp);

      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      return;
    }

    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: any,
    index: number
  ) => {
    if (
      e.nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

const handleVerifyOtp = async () => {
  if (loading) return;

  setErrorMessage('');
  const enteredOtp = otp.join('');

  if (enteredOtp.length !== 6) {
    setErrorMessage('Please enter the complete 6-digit OTP.');
    return;
  }

  if (!transactionId) {
    setErrorMessage('Transaction ID is missing. Please request OTP again.');
    return;
  }

  setLoading(true);

  try {
    console.log('Verifying mobile OTP...');

    const response = await ABHA.post('/enrollment/auth/byAbdm', {
      txnId: transactionId,
      otp: enteredOtp,
    });

    const data = response.data;
    console.log('OTP verification HTTP status:', response.status);
    console.log('OTP verification response:', JSON.stringify(data, null, 2));

    // Backends may return the result/message in different fields.
    const authResult =
      data?.Response?.authResult ??
      data?.response?.authResult ??
      data?.authResult;
    const verificationMessage = String(
      data?.Response?.message ??
      data?.Response?.Message ??
      data?.response?.message ??
      data?.message ??
      data?.Message ??
      ''
    );
    const resultText = String(authResult ?? '').trim().toLowerCase();
    const messageText = verificationMessage.toLowerCase();

    const explicitSuccessResult = ['success', 'successful', 'verified'].includes(resultText);
    const explicitFailureResult = ['failed', 'failure', 'error', 'invalid'].includes(resultText);
    const successMessage =
      /successfully linked|mobile number.*verified|mobile.*successfully.*linked|otp verified successfully/.test(messageText);

    // Do not allow a success-looking message to override an explicit failure result.
    const verificationSucceeded =
      (response.status === 200 || response.status === 202) &&
      !explicitFailureResult &&
      (explicitSuccessResult || successMessage);

    if (!verificationSucceeded) {
      console.log('OTP verification was not confirmed.', {
        authResult,
        verificationMessage,
      });
      setErrorMessage(
        verificationMessage ||
          'OTP verification was not confirmed by the server. Please check the response in the console.'
      );
      return;
    }

    console.log('OTP/mobile verification confirmed. Requesting ABHA suggestions...');

    const suggestionResponse = await ABHA.get('/enrollment/enrol/suggestion', {
      headers: { txnId: transactionId },
    });

    const suggestionData = suggestionResponse.data;
    console.log(
      'ABHA address suggestion HTTP status:',
      suggestionResponse.status
    );
    console.log(
      'ABHA address suggestion response:',
      JSON.stringify(suggestionData, null, 2)
    );

    // Accommodate common response wrappers while preserving the actual list.
    const responseBody =
      suggestionData?.Response ??
      suggestionData?.response ??
      suggestionData?.data?.Response ??
      suggestionData?.data ??
      suggestionData;

    const possibleLists = [
      responseBody?.abhaAddressList,
      responseBody?.suggestions,
      responseBody?.abhaAddressSuggestions,
      responseBody?.addressList,
      responseBody?.abhaAddresses,
      suggestionData?.abhaAddressList,
      suggestionData?.suggestions,
    ];

    const addressList = possibleLists.find(Array.isArray);

    if (!Array.isArray(addressList) || addressList.length === 0) {
      console.error('Suggestion response did not contain a non-empty address list.');
      setErrorMessage(
        'Mobile verification succeeded, but the suggestion API did not return an address list. Check the console response and its field name.'
      );
      return;
    }

    console.log('Navigating to ABHA address suggestions screen...');
    router.replace({
      pathname: '/abha/create/address',
      params: {
        abha_address: JSON.stringify(addressList.slice(0, 3)),
        transactionId:
          responseBody?.txnId ?? responseBody?.transactionId ?? transactionId,
      },
    });
  } catch (error: any) {
    const errorData = error?.response?.data;
    console.error(
      'OTP verification or suggestion request failed:',
      JSON.stringify(errorData ?? error?.message ?? error, null, 2)
    );

    setErrorMessage(
      errorData?.Response?.message ||
        errorData?.response?.message ||
        errorData?.message ||
        errorData?.Message ||
        'The request failed. Check the console for the API error.'
    );
  } finally {
    setLoading(false);
  }
};



  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        Enter verification code
      </Text>

      <Text style={styles.subtitle}>
        We've sent a 6-digit OTP to
      </Text>

      <View style={styles.phoneBadge}>
        <Ionicons
          name="phone-portrait-outline"
          size={16}
          color="#0A5898"
        />

      <Text style={styles.phoneText}>
        +91 {mobile || 'Mobile number unavailable'}
      </Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              index === 0 &&
                !digit &&
                styles.otpInputActive,
            ]}
            value={digit}
            onChangeText={(text) =>
              handleOtpChange(text, index)
            }
            onKeyPress={(e) =>
              handleKeyPress(e, index)
            }
            keyboardType="number-pad"
            maxLength={6}
            blurOnSubmit={false}
            editable={!loading}
            accessibilityLabel={`OTP digit ${index + 1}`}
          />
        ))}
      </View>

      <Text style={styles.resendText}>
        Resend OTP in{' '}
        <Text style={styles.boldText}>
          00:{timer < 10 ? `0${timer}` : timer}
        </Text>
      </Text>

      <Text style={styles.attemptText}>
        Resend attempt 0 of 2
      </Text>

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
        onPress={handleVerifyOtp}
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
              Verifying OTP...
            </Text>
          </View>
        ) : (
          <Text style={styles.primaryButtonText}>
            Verify OTP
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Enter the OTP sent to your registered mobile number.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    flexGrow: 1,
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
    marginBottom: 16,
  },

  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },

  phoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 6,
  },

  otpInput: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    color: '#1F2937',
  },

  otpInputActive: {
    borderColor: '#0A5898',
    borderWidth: 2,
  },

  resendText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },

  boldText: {
    fontWeight: '700',
    color: '#1F2937',
  },

  attemptText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 32,
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
    marginBottom: 16,
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

  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});

