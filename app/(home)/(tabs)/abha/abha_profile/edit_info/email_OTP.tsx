import React, { useRef, useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import Svg, { Path, Polyline } from 'react-native-svg';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import { ABHA } from '@/utils/api';

import { useAbhaStore } from '../../stores/abhaStore';

// Custom Icons
const BackIcon = () => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#4F46E5"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

const MailIcon = () => (
  <Svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#4B5563"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

export default function EmailOtpScreen() {
  const router = useRouter();

  // Receive transaction ID, email and backend message.
  const params = useLocalSearchParams<{
    txnId?: string;
    email?: string;
    message?: string;
  }>();

  const txnId = Array.isArray(params.txnId)
    ? params.txnId[0]
    : params.txnId;

  const email = Array.isArray(params.email)
    ? params.email[0]
    : params.email;

  const backendMessage = Array.isArray(params.message)
    ? params.message[0]
    : params.message;

  // Get authentication token from Zustand.
  const token = useAbhaStore((state) => state.token);

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Validate OTP.
  const isOtpComplete = otp.every((digit) => digit !== '');

  // Mask email address.
  const maskedEmail = email
    ? (() => {
        const parts = email.split('@');

        if (parts.length !== 2) {
          return email;
        }

        const username = parts[0];
        const domain = parts[1];

        return `${username.charAt(0)}******@${domain}`;
      })()
    : 'your registered email address';

  // Handle OTP input.
  const handleChangeText = (text: string, index: number) => {
    setErrorMessage('');

    const numericText = text.replace(/[^0-9]/g, '');

    // Support pasting the complete OTP.
    if (numericText.length > 1) {
      const digits = numericText.slice(0, 6);

      const newOtp = Array(6)
        .fill('')
        .map((_, i) => digits[i] ?? '');

      setOtp(newOtp);

      const nextIndex = Math.min(digits.length, 5);

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    const newOtp = [...otp];

    newOtp[index] = numericText;

    setOtp(newOtp);

    // Automatically focus the next input.
    if (numericText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace.
  const handleKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify Email OTP.
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');

    setErrorMessage('');

    // Validate OTP.
    if (enteredOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP.');
      return;
    }

    // Validate transaction ID.
    if (!txnId) {
      setErrorMessage(
        'Transaction ID is missing. Please request a new OTP.'
      );

      console.error('Email OTP transaction ID is missing.');

      return;
    }

    try {
      setVerifying(true);

      // Ensure Zustand persisted data has loaded.
      if (!useAbhaStore.persist.hasHydrated()) {
        await useAbhaStore.persist.rehydrate();
      }

      // Retrieve the latest token from Zustand.
      const storedToken =
        useAbhaStore.getState().token || token;

      if (!storedToken) {
        setErrorMessage(
          'Authentication token is missing. Please login again.'
        );

        console.error('Authentication token not found in Zustand.');

        return;
      }

      // Request body.
      const requestBody = {
        txnId: txnId,
        otp: enteredOtp,
        token: storedToken,
      };

      console.log('Sending Email OTP verification request...');

      console.log('Request details:', {
        txnId,
        otpLength: enteredOtp.length,
        tokenAvailable: Boolean(storedToken),
      });

      // Call Email OTP verification API.
      const response = await ABHA.post(
        'profile/account/update-email/verify/otp',
        requestBody
      );

      // Backend response.
      const responseData = response?.data ?? response;

      console.log(
        '========== EMAIL OTP VERIFICATION RESPONSE =========='
      );

      console.log('HTTP Status:', response?.status);

      console.log(
        'Response:',
        JSON.stringify(responseData, null, 2)
      );

      console.log(
        '======================================================'
      );

      // Check backend response status.
      const backendStatus = Number(
        responseData?.Status ??
        responseData?.status ??
        responseData?.Response?.status ??
        response?.status
      );

      const successFlag =
        responseData?.Success ??
        responseData?.Response?.Success;

      const responseMessage =
        responseData?.Response?.message ??
        responseData?.Response?.Message ??
        responseData?.message ??
        responseData?.Message ??
        '';

      const isSuccessful =
        response?.status >= 200 &&
        response?.status < 300 &&
        backendStatus >= 200 &&
        backendStatus < 300 &&
        successFlag !== false &&
        !/invalid|incorrect|failed|failure/i.test(
          String(responseMessage)
        );

      if (!isSuccessful) {
        setErrorMessage(
          responseMessage ||
          'Email OTP verification failed. Please try again.'
        );

        return;
      }

      console.log('Email OTP verified successfully.');

      // Navigate to ABHA Profile after successful verification.
      router.replace(
        '/(home)/(tabs)/abha/abha_profile'
      );

    } catch (error: any) {
      const errorData = error?.response?.data;

      console.error(
        '========== EMAIL OTP VERIFICATION ERROR =========='
      );

      console.error(
        'HTTP Status:',
        error?.response?.status
      );

      console.error(
        'Backend Error:',
        JSON.stringify(errorData, null, 2)
      );

      console.error('Error message:', error?.message);

      console.error(
        '==================================================='
      );

      setErrorMessage(
        errorData?.Response?.message ||
        errorData?.Response?.Message ||
        errorData?.message ||
        errorData?.Message ||
        'Unable to verify email OTP. Please try again.'
      );

    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <BackIcon />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Verify OTP
          </Text>
        </View>

        <View style={styles.content}>

          {/* TITLE SECTION */}
          <Text style={styles.title}>
            Enter verification code
          </Text>

          <Text style={styles.subtitle}>
            We've sent a 6-digit OTP to
          </Text>

          {/* INFO BOX */}
          <View style={styles.infoBox}>
            <MailIcon />

            <Text style={styles.infoText}>
              {backendMessage
                ? backendMessage
                : 'OTP sent to your email address '}
              {' '}
              {!backendMessage && (
                <Text style={styles.boldText}>
                  {maskedEmail}
                </Text>
              )}
            </Text>
          </View>

          {/* OTP INPUTS */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  focusedIndex === index &&
                    styles.otpInputFocused,
                ]}
                value={digit}
                onChangeText={(text) =>
                  handleChangeText(text, index)
                }
                onKeyPress={(e) =>
                  handleKeyPress(e, index)
                }
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                editable={!verifying}
              />
            ))}
          </View>

          {/* ERROR MESSAGE */}
          {errorMessage !== '' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* VERIFY BUTTON */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              isOtpComplete &&
                styles.verifyButtonActive,
              verifying && { opacity: 0.7 },
            ]}
            activeOpacity={0.8}
            disabled={!isOtpComplete || verifying}
            onPress={handleVerifyOtp}
          >
            {verifying ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.verifyButtonText}>
                Verify OTP
              </Text>
            )}
          </TouchableOpacity>

          {/* DISCLAIMER */}
          <Text style={styles.disclaimerText}>
            Enter the OTP received on your registered email address.
          </Text>

        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLink}>
            Terms of Service
          </Text>

          <Text style={styles.footerDot}>
            •
          </Text>

          <Text style={styles.footerLink}>
            Privacy Policy
          </Text>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'flex-start',
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 12,
    lineHeight: 20,
  },

  boldText: {
    fontWeight: '700',
    color: '#111827',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },

  otpInputFocused: {
    borderColor: '#6366F1',
    borderWidth: 1.5,
    backgroundColor: '#F8FAFC',
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
    lineHeight: 18,
  },

  verifyButton: {
    backgroundColor: '#9CA3AF',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  verifyButtonActive: {
    backgroundColor: '#4F46E5',
  },

  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  disclaimerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    paddingHorizontal: 20,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },

  footerLink: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  footerDot: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
});