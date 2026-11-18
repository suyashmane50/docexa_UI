import React, { useState, useEffect, useRef } from 'react';

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
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import Svg, { Line, Polyline } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { ABHA } from '@/utils/api';

import { useAbhaStore } from '../../stores/abhaStore';
import { useReKYCStore } from '../../stores/re-KYCStore';

// Back Icon
const BackIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0f172a"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Polyline points="12 19 5 12 12 5" />
  </Svg>
);

// Extract ABHA account from stored Zustand data
const getStoredAccount = (
  profileData: any,
  savedAccounts: any
) => {
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
    Array.isArray(responseRoot)
      ? responseRoot[0]
      : responseRoot,
  ];

  const profileAccount = candidates.find(
    (candidate) =>
      candidate &&
      typeof candidate === 'object' &&
      (
        candidate.name ||
        candidate.firstName ||
        candidate.first_name ||
        candidate.ABHANumber ||
        candidate.abhaNumber ||
        candidate.preferredAbhaAddress ||
        candidate.abhaAddress
      )
  );

  const loginAccount = Array.isArray(savedAccounts)
    ? savedAccounts[0]
    : savedAccounts;

  return profileAccount ?? loginAccount ?? null;
};

export default function RekycOtpScreen() {
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const inputRef = useRef<TextInput>(null);

  // Existing ABHA store
  const token = useAbhaStore(
    (state) => state.token
  );

  const profileData = useAbhaStore(
    (state) => state.profileData
  );

  const savedAccounts = useAbhaStore(
    (state) => state.data
  );

  // Separate Re-KYC store
  const txnId = useReKYCStore(
    (state) => state.transactionId
  );

  // Extract account
  const account = React.useMemo(
    () => getStoredAccount(profileData, savedAccounts),
    [profileData, savedAccounts]
  );

  // Extract ABHA number
  const abhaNumber =
    account?.ABHANumber ??
    account?.abhaNumber ??
    account?.abha_number ??
    null;

  const theme = {
    accent: '#0f71c2',
    lightBg: '#f0f9ff',
  };

  // Countdown Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // OTP Input Handler
  const handleOtpChange = (text: string) => {
    setErrorMsg('');
    setSuccessMsg('');

    const cleaned = text.replace(/\D/g, '').slice(0, 6);

    setOtp(cleaned);
  };

  // ==========================================
  // VERIFY OTP API
  // ==========================================

  const handleVerify = async () => {
    if (otp.length !== 6 || isLoading) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (!token) {
      setErrorMsg('Token not found. Please login again.');
      return;
    }

    if (!txnId) {
      setErrorMsg(
        'Transaction ID not found. Please request OTP again.'
      );
      return;
    }

    if (!abhaNumber) {
      setErrorMsg(
        'ABHA number not found in your profile.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        txnId: txnId,
        otp: otp,
        token: token,
        'abha-number': abhaNumber,
      };

      console.log('Re-KYC Verify OTP Payload:', {
        ...payload,
        token: 'TOKEN_HIDDEN',
      });

      const response = await ABHA.post(
        'profile/account/re-kyc/verify/otp',
        payload
      );

      console.log(
        'Re-KYC Verify OTP Response:',
        response.data
      );

      // SUCCESS: navigate to profile and pass a flag to show the popup there.
      if (response.status === 200) {
        setOtp('');
        setErrorMsg('');
        setSuccessMsg('');

        console.log('Re-KYC completed successfully.');

        router.replace({
          pathname: '/abha/abha_profile',
          params: {
            rekycSuccess: 'true',
          },
        });

      } else {
        // FAILURE
        setErrorMsg(
          response.data?.Message ||
          response.data?.message ||
          'OTP verification failed.'
        );
      }

    } catch (error: any) {
      console.log(
        'Re-KYC Verify OTP Error:',
        error.response?.data
      );

      setErrorMsg(
        error.response?.data?.Message ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid OTP. Please try again.'
      );

    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResend = async () => {
    if (isTimerActive || isLoading) return;

    setErrorMsg('');
    setSuccessMsg('');
    setOtp('');

    if (!token || !abhaNumber) {
      setErrorMsg(
        'Token or ABHA number not found.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await ABHA.post(
        'profile/account/re-kyc/request/otp',
        {
          token,
          'abha-number': abhaNumber,
        }
      );

      console.log(
        'Re-KYC Resend Response:',
        response.data
      );

      if (response.status === 200) {

        // Extract new transaction ID
        const newTxnId =
          response.data?.txnId ??
          response.data?.transactionId ??
          response.data?.Response?.txnId ??
          response.data?.Response?.transactionId ??
          response.data?.data?.txnId ??
          response.data?.data?.transactionId;

        // Update Re-KYC Zustand store
        if (newTxnId) {
          useReKYCStore
            .getState()
            .setTransactionId(newTxnId);

          console.log(
            'Updated Re-KYC Transaction ID:',
            newTxnId
          );
        }

        // Reset timer
        setTimer(30);
        setIsTimerActive(true);

        setSuccessMsg(
          response.data?.Message ||
          response.data?.message ||
          'OTP sent successfully.'
        );

      } else {
        setErrorMsg(
          response.data?.Message ||
          response.data?.message ||
          'Unable to resend OTP.'
        );
      }

    } catch (error: any) {
      console.log(
        'Re-KYC Resend Error:',
        error.response?.data
      );

      setErrorMsg(
        error.response?.data?.Message ||
        error.response?.data?.message ||
        'Unable to resend OTP. Please try again.'
      );

    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    otp.length !== 6 || isLoading;

  // ==========================================
  // UI
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <BackIcon />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Re-KYC Verification
        </Text>

        <View style={{ width: 24 }} />

      </View>

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={{ flex: 1 }}
      >

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <Text style={styles.title}>
            Enter OTP
          </Text>

          <Text style={styles.subtitle}>
            We have sent a 6-digit OTP to your Aadhaar-linked mobile
            number. Please enter it below to continue.
          </Text>

          {/* OTP INPUT */}
          <Pressable
            style={styles.otpContainer}
            onPress={() => inputRef.current?.focus()}
          >

            {[...Array(6)].map((_, index) => {
              const isFocused = otp.length === index;
              const hasValue = otp.length > index;

              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,

                    isFocused && {
                      borderColor: theme.accent,
                      backgroundColor: theme.lightBg,
                    },

                    hasValue && {
                      borderColor: theme.accent,
                    },

                    errorMsg && {
                      borderColor: '#dc2626',
                    },
                  ]}
                >

                  <Text
                    style={[
                      styles.otpText,

                      hasValue && {
                        color: theme.accent,
                      },
                    ]}
                  >
                    {otp[index] || ''}
                  </Text>

                </View>
              );
            })}

            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={handleOtpChange}
              maxLength={6}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              autoFocus
              editable={!isLoading}
            />

          </Pressable>

          {/* ERROR MESSAGE */}
          {!!errorMsg && (
            <View style={styles.errorContainer}>

              <Feather
                name="alert-circle"
                size={14}
                color="#dc2626"
              />

              <Text style={styles.errorText}>
                {errorMsg}
              </Text>

            </View>
          )}

          {/* SUCCESS MESSAGE */}
          {!!successMsg && (
            <View style={styles.successContainer}>

              <Feather
                name="check-circle"
                size={14}
                color="#16a34a"
              />

              <Text style={styles.successText}>
                {successMsg}
              </Text>

            </View>
          )}

          {/* TIMER */}
          <View style={styles.timerContainer}>

            <Text style={styles.timerText}>
              Didn't receive the OTP?{' '}
            </Text>

            <TouchableOpacity
              onPress={handleResend}
              disabled={isTimerActive || isLoading}
            >

              <Text
                style={[
                  styles.resendText,

                  isTimerActive
                    ? { color: '#94a3b8' }
                    : {
                        color: theme.accent,
                        fontWeight: '700',
                      },
                ]}
              >

                {isTimerActive
                  ? `Resend in 00:${timer
                      .toString()
                      .padStart(2, '0')}`
                  : 'Resend OTP'}

              </Text>

            </TouchableOpacity>

          </View>

          {/* VERIFY BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              isButtonDisabled && styles.buttonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleVerify}
            disabled={isButtonDisabled}
          >

            {isLoading ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />
            ) : (
              <Text style={styles.buttonText}>
                Verify & Complete
              </Text>
            )}

          </TouchableOpacity>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================

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

  backBtn: {
    marginRight: 16,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 32,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    position: 'relative',
  },

  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  otpText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },

  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  errorText: {
    fontSize: 13,
    color: '#dc2626',
    marginLeft: 6,
    flex: 1,
  },

  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },

  successText: {
    fontSize: 13,
    color: '#15803d',
    marginLeft: 6,
    flex: 1,
  },

  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },

  timerText: {
    fontSize: 14,
    color: '#64748b',
  },

  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },

  button: {
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f71c2',
  },

  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

});