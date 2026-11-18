import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Pressable,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ABHA } from '../../../../../utils/api';
import { useAbhaStore } from '../../abha/stores/abhaStore';

export default function AbhaOtpScreen() {
  const router = useRouter();

  const { abhaNumber } = useLocalSearchParams<{
    abhaNumber: string;
  }>();

  const txnId = useAbhaStore((state: any) => state.txnId);
  const setTxnId = useAbhaStore((state: any) => state.setTxnId);
  const addPatient = useAbhaStore((state: any) => state.addPatient);

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const [resendCount, setResendCount] = useState(0);
  const [isVerifyLocked, setIsVerifyLocked] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const inputRef = useRef<TextInput>(null);

  const theme = {
    accent: '#6D28D9',
    lightBg: '#F5F3FF',
  };

  // 30-second countdown
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

  // VERIFY OTP
  const handleVerify = async () => {
    if (otp.length !== 6 || isLoading || isVerifyLocked) return;

    if (!txnId) {
      setMessage('Transaction ID is missing. Please request OTP again.');
      setMessageType('error');
      return;
    }

    // Lock Verify button for 30 seconds
    setIsVerifyLocked(true);
    setTimer(30);
    setIsTimerActive(true);

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await ABHA.post(
        'verify/abha/abha-number/otp',
        {
          txnId,
          otp,
        }
      );

      const responseData = response.data?.Response;


      if (
        responseData?.authResult?.toLowerCase() === 'success'
      ) {
      // Save the authenticated patient into the same local store as Aadhaar login.
      const accounts = responseData?.accounts ?? responseData?.account ?? [];
      const authToken =
        responseData?.token ||
        responseData?.tokens?.token ||
        responseData?.accessToken ||
        responseData?.access_token;


      let profileData: any = null;
      if (authToken) {
        try {
          const profileResponse = await ABHA.get('enroll/profile/account', {
            headers: { token: authToken },
          });
          profileData = profileResponse.data;
        } catch (profileError) {
          console.warn('ABHA login: profile fetch failed; using OTP response data.', profileError);
        }
      }

      const firstAccount = Array.isArray(accounts) ? (accounts[0] ?? {}) : (accounts ?? {});
      const patientName =
        firstAccount?.name || firstAccount?.fullName || firstAccount?.Name ||
        profileData?.name || profileData?.fullName || profileData?.profile?.name ||
        profileData?.data?.name || 'ABHA Patient';
      const identifier =
        firstAccount?.ABHANumber || firstAccount?.abhaNumber || firstAccount?.abhaNo ||
        firstAccount?.ABHA_NUMBER || firstAccount?.preferredAbhaAddress ||
        firstAccount?.abhaAddress || firstAccount?.abha_address ||
        profileData?.ABHANumber || profileData?.abhaNumber ||
        profileData?.preferredAbhaAddress || profileData?.abhaAddress ||
        profileData?.profile?.ABHANumber || profileData?.profile?.abhaNumber ||
        abhaNumber;
      const patientId = String(identifier || abhaNumber || '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();

      if (!patientId) {
        throw new Error('Unable to identify this ABHA patient.');
      }

      const now = new Date().toISOString();
      addPatient({
        patientId,
        name: patientName,
        token: authToken || null,
        txnId,
        aadhaar: null,
        data: accounts || responseData,
        profileData,
        createdAt: now,
        lastLoginAt: now,
      });
      setTxnId(txnId);

      setMessage('OTP verified successfully!');
      setMessageType('success');
      router.replace('/(home)/(tabs)/abha/abha_profile');
      } else {
        setMessage(
          response.data?.Response?.message ||
          'OTP verification failed.'
        );

        setMessageType('error');
      }
    } catch (error: any) {
      const status = error.response?.status;

      setMessage(
        error.response?.data?.Response?.message ||
        error.response?.data?.message ||
        (status === 429
          ? 'Too many attempts. Please wait before trying again.'
          : 'Invalid OTP. Please try again.')
      );

      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // RESEND OTP
  const handleResend = async () => {
    if (isTimerActive || isLoading || resendCount >= 2) return;

    if (!abhaNumber) {
      setMessage('ABHA number is missing. Please go back and try again.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await ABHA.post(
        'verify/abha/abha-number/request/otp',
        {
          'abha-number': abhaNumber,
        }
      );

      if (response.status === 200 || response.status === 202) {
        const newTxnId = response.data?.Response?.txnId;

        if (newTxnId) {
          setTxnId(newTxnId);
        }

        setResendCount((prev) => prev + 1);

        setOtp('');
        setIsVerifyLocked(false);

        setTimer(30);
        setIsTimerActive(true);

        setMessage(
          response.data?.Response?.message ||
          'OTP sent successfully.'
        );

        setMessageType('success');
      } else {
        setMessage('Unable to resend OTP. Please try again.');
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(
        error.response?.data?.Response?.message ||
        error.response?.data?.message ||
        'Unable to resend OTP. Please try again.'
      );

      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    otp.length !== 6 || isLoading || isVerifyLocked;

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
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Login with ABHA</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Verify OTP</Text>

          <Text style={styles.subtitle}>
            We have sent a 6-digit OTP to your registered mobile number.
            Please enter it below to continue.
          </Text>

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
                  ]}
                >
                  <Text
                    style={[
                      styles.otpText,
                      hasValue && { color: theme.accent },
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
            />
          </Pressable>

          {!txnId && (
            <Text style={styles.errorText}>
              Transaction ID is missing. Please request OTP again.
            </Text>
          )}

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

          {/* TIMER AND RESEND */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Didn't receive the OTP?{' '}
            </Text>

            {isTimerActive ? (
              <Text style={[styles.resendText, { color: '#9CA3AF' }]}>
                Resend in 00:{timer.toString().padStart(2, '0')}
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
              { backgroundColor: theme.accent },
              isButtonDisabled && styles.buttonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleVerify}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Verify & Login
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.spacer} />

          <View style={styles.footer}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  keyboardAvoidingView: { flex: 1 },

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
    marginBottom: 30,
    lineHeight: 20,
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
    shadowOffset: { width: 0, height: 1 },
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
    fontSize: 13,
  },

  button: {
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