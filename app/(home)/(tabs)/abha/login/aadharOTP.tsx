import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import { Feather, Ionicons } from '@expo/vector-icons';
import { ABHA } from '../../../../../utils/api';
import { useAbhaStore } from '../../abha/stores/abhaStore';

export default function AadhaarOtpScreen() {
  const router = useRouter();

  const { mobile, aadhaar } = useLocalSearchParams<{
    mobile: string;
    aadhaar: string;
  }>();

  // Zustand store
  const txnId = useAbhaStore((state: any) => state.txnId);
  const setTxnId = useAbhaStore((state: any) => state.setTxnId);
  const setData = useAbhaStore((state: any) => state.setData);
  const setToken = useAbhaStore((state: any) => state.setToken);
  const setProfileData = useAbhaStore((state: any) => state.setProfileData);
  const addPatient = useAbhaStore((state: any) => state.addPatient);

  // OTP transaction
  const [currentTxnId, setCurrentTxnId] = useState(txnId);

  // OTP state
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Timer state
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isVerifyLocked, setIsVerifyLocked] = useState(false);

  // Resend state
  const [resendCount, setResendCount] = useState(0);

  // Message state
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>(
    '',
  );

  const inputRef = useRef<TextInput>(null);

  const theme = {
    accent: '#1E3A8A',
    lightBg: '#EFF6FF',
  };
  useEffect(() => {
    if (!isTimerActive || timer <= 0) {
      setIsTimerActive(false);
      setIsVerifyLocked(false);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);
  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 6);

    setOtp(cleaned);
    setMessage('');
    setMessageType('');
  };

  const getFirstAccount = (accounts: any) => {
    if (Array.isArray(accounts)) {
      return accounts[0] ?? {};
    }

    if (accounts && typeof accounts === 'object') {
      return accounts;
    }

    return {};
  };

  const getPatientName = (
    account: any,
    profile: any,
  ): string => {
    return (
      account?.name ||
      account?.fullName ||
      account?.Name ||
      profile?.name ||
      profile?.fullName ||
      profile?.profile?.name ||
      profile?.data?.name ||
      'ABHA Patient'
    );
  };

  const getAbhaIdentifier = (
    account: any,
    profile: any,
  ): string | null => {
    return (
      account?.ABHANumber ||
      account?.abhaNumber ||
      account?.abhaNo ||
      account?.ABHA_NUMBER ||
      account?.preferredAbhaAddress ||
      account?.abhaAddress ||
      account?.abha_address ||
      profile?.ABHANumber ||
      profile?.abhaNumber ||
      profile?.preferredAbhaAddress ||
      profile?.abhaAddress ||
      profile?.profile?.ABHANumber ||
      profile?.profile?.abhaNumber ||
      null
    );
  };

  const createPatientId = (identifier: string): string => {
    return identifier
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  };
  const handleVerify = async () => {
    if (otp.length !== 6 || isLoading || isVerifyLocked) {
      return;
    }

    if (!currentTxnId) {
      setMessage('Transaction ID is missing. Please request OTP again.');
      setMessageType('error');
      return;
    }
    setIsVerifyLocked(true);
    setTimer(30);
    setIsTimerActive(true);

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await ABHA.post('verify/aadhar/otp', {
        txnId: currentTxnId,
        otp,
      });

      const responseData = response.data?.Response;

      if (
        responseData?.authResult?.toLowerCase() !== 'success'
      ) {
        setMessage(
          responseData?.message || 'OTP verification failed.',
        );

        setMessageType('error');
        return;
      }
      const accounts = responseData?.accounts ?? [];

      const authToken =
        responseData?.token ||
        responseData?.accessToken ||
        responseData?.access_token;

      // Save authenticated session information
      setData(accounts);

      if (authToken) {
        setToken(authToken);
      }
      if (!authToken) {
        throw new Error(
          'Authentication token was not received from the server.',
        );
      }
      const profileResponse = await ABHA.get(
        'enroll/profile/account',
        {
          headers: {
            token: authToken,
          },
        },
      );

      const profileData = profileResponse.data;

      setProfileData(profileData);
      const firstAccount = getFirstAccount(accounts);

      const patientName = getPatientName(
        firstAccount,
        profileData,
      );

      const abhaIdentifier = getAbhaIdentifier(
        firstAccount,
        profileData,
      );

      if (!abhaIdentifier) {
        console.error(
          'ABHA identifier was not found in account/profile response.',
        );

        throw new Error(
          'Unable to identify your ABHA account. Please try again.',
        );
      }

      const patientId = createPatientId(abhaIdentifier);

      if (!patientId) {
        throw new Error(
          'Unable to create a valid patient identifier.',
        );
      }
      const now = new Date().toISOString();

      addPatient({
        patientId,
        name: patientName,
        token: authToken,
        txnId: currentTxnId,
        aadhaar: null,
        data: accounts,
        profileData,
        createdAt: now,
        lastLoginAt: now,
      });
      setTxnId(currentTxnId);
      setMessage('OTP verified successfully!');
      setMessageType('success');

      router.replace('/(home)/(tabs)/abha/abha_profile');

    } catch (error: any) {
      console.error('Aadhaar OTP verification error:', error);

      const status = error.response?.status;

      const backendMessage =
        error.response?.data?.Response?.message ||
        error.response?.data?.message ||
        error.message;

      setMessage(
        backendMessage ||
          (status === 429
            ? 'Too many attempts. Please wait before trying again.'
            : 'Invalid OTP. Please try again.'),
      );

      setMessageType('error');

    } finally {
      setIsLoading(false);
    }
  };
  const handleResend = async () => {
    if (
      isTimerActive ||
      isLoading ||
      resendCount >= 2
    ) {
      return;
    }

    if (!aadhaar) {
      setMessage(
        'Aadhaar number is missing. Please go back and try again.',
      );

      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await ABHA.post(
        'verify/aadhar/request/otp',
        {
          aadhar: aadhaar,
        },
      );

      if (
        response.status === 200 ||
        response.status === 202
      ) {
        setResendCount((prev) => prev + 1);

        // Update transaction ID
        const newTxnId =
          response.data?.Response?.txnId;

        if (newTxnId) {
          setCurrentTxnId(newTxnId);
          setTxnId(newTxnId);
        }

        // Clear previous OTP
        setOtp('');

        // Restart timer
        setTimer(30);
        setIsTimerActive(true);

        // Unlock verification
        setIsVerifyLocked(false);

        setMessage(
          response.data?.Response?.message ||
            'A new OTP has been sent successfully.',
        );

        setMessageType('success');
      } else {
        setMessage(
          response.data?.Response?.message ||
            'Failed to resend OTP.',
        );

        setMessageType('error');
      }

    } catch (error: any) {
      console.error('Resend Aadhaar OTP error:', error);

      setMessage(
        error.response?.data?.Response?.message ||
          error.response?.data?.message ||
          'Failed to resend OTP. Please try again later.',
      );

      setMessageType('error');

    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    otp.length !== 6 ||
    isLoading ||
    isVerifyLocked;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="#1F2937"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Verify OTP
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            Enter verification code
          </Text>

          <Text style={styles.subtitle}>
            We've sent a 6-digit OTP to
          </Text>

          {/* MOBILE INFORMATION */}
          <View style={styles.mobileInfoBox}>
            <Feather
              name="smartphone"
              size={18}
              color="#6B7280"
            />

            <Text style={styles.mobileInfoText}>
              {mobile || 'Aadhaar registered mobile number'}
            </Text>
          </View>

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
                    messageType === 'error' && {
                      borderColor: '#DC2626',
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

          {/* MESSAGE */}
          {message !== '' && (
            <View
              style={[
                styles.messageBox,
                messageType === 'success'
                  ? styles.successBox
                  : styles.errorBox,
              ]}
            >
              <Feather
                name={
                  messageType === 'success'
                    ? 'check-circle'
                    : 'alert-circle'
                }
                size={16}
                color={
                  messageType === 'success'
                    ? '#15803D'
                    : '#DC2626'
                }
              />

              <Text
                style={[
                  styles.messageText,
                  messageType === 'success'
                    ? styles.successText
                    : styles.errorText,
                ]}
              >
                {message}
              </Text>
            </View>
          )}

          {/* RESEND TIMER */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Didn't receive the OTP?{' '}
            </Text>

            {isTimerActive ? (
              <Text
                style={[
                  styles.resendText,
                  { color: '#9CA3AF' },
                ]}
              >
                Resend in 00:
                {timer.toString().padStart(2, '0')}
              </Text>
            ) : resendCount < 2 ? (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.resendText,
                    {
                      color: theme.accent,
                      fontWeight: '700',
                    },
                  ]}
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            ) : (
              <Text
                style={[
                  styles.resendText,
                  { color: '#9CA3AF' },
                ]}
              >
                Resend limit reached
              </Text>
            )}
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
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.buttonText}>
                Verify OTP
              </Text>
            )}
          </TouchableOpacity>

          {/* INFORMATION */}
          <Text style={styles.bottomInfo}>
            Enter the OTP received on your Aadhaar registered
            mobile number.
          </Text>

          <View style={styles.spacer} />

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.linkText}>
              Terms of Service
            </Text>

            <Text style={styles.dot}>•</Text>

            <Text style={styles.linkText}>
              Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  backButton: {
    padding: 4,
    marginRight: 12,
    marginLeft: -4,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
    lineHeight: 20,
  },

  mobileInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 25,
    gap: 10,
  },

  mobileInfoText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
    flex: 1,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    position: 'relative',
  },

  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  otpText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },

  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },

  successBox: {
    backgroundColor: '#DCFCE7',
  },

  errorBox: {
    backgroundColor: '#FEE2E2',
  },

  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  successText: {
    color: '#15803D',
  },

  errorText: {
    color: '#DC2626',
  },

  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },

  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },

  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },

  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  bottomInfo: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },

  spacer: {
    flex: 1,
    minHeight: 40,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
    marginTop: 20,
  },

  linkText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  dot: {
    marginHorizontal: 8,
    color: '#9CA3AF',
  },
});