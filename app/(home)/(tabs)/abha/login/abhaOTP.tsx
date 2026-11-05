
import React, { useState, useEffect, useRef } from 'react';

import { useRouter } from 'expo-router';

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

import { Feather } from '@expo/vector-icons';

import { ABHA } from '../../../../../utils/api';

import { useAbhaStore } from '../../abha/stores/abhaStore';

export default function AbhaOtpScreen() {
  const router = useRouter();

  // Zustand transaction ID
  const txnId = useAbhaStore((state: any) => state.txnId);

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const inputRef = useRef<TextInput>(null);

  // Theme
  const theme = {
    accent: '#6D28D9',
    lightBg: '#F5F3FF',
  };

  // Countdown Timer
  useEffect(() => {
    if (!isTimerActive || timer <= 0) {
      setIsTimerActive(false);
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

  // OTP Input
  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 6);

    setOtp(cleaned);

    setMessage('');
    setMessageType('');
  };

  // Verify OTP
  const handleVerify = async () => {
    if (otp.length !== 6 || isLoading) {
      return;
    }

    if (!txnId) {
      setMessage('Transaction ID is missing. Please request OTP again.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const payload = {
        txnId: txnId,
        otp: otp,
      };

      console.log('VERIFY OTP REQUEST:', payload);

      const response = await ABHA.post(
        'verify/abha/abha-number/otp',
        payload
      );

      console.log('VERIFY OTP RESPONSE:', response.data);
      console.log('HTTP STATUS:', response.status);

      if (
  response.data?.Response?.authResult?.toLowerCase() === 'success'
) {
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
      console.log('VERIFY OTP ERROR:', error);

      console.log(
        'ERROR RESPONSE:',
        JSON.stringify(error.response?.data, null, 2)
      );

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

  // Resend OTP
  const handleResend = () => {
    if (isTimerActive) {
      return;
    }

    setTimer(30);
    setIsTimerActive(true);
    setOtp('');

    setMessage('Please request a new OTP from the previous screen.');
    setMessageType('error');
  };

  const isButtonDisabled = otp.length !== 6 || isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
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
            We have sent a 6-digit OTP to your registered mobile
            number. Please enter it below to continue.
          </Text>

          {/* OTP Input */}
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

            {/* Hidden Input */}
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

          {/* Transaction ID Information */}
          {!txnId && (
            <Text style={styles.errorText}>
              Transaction ID is missing. Please request OTP again.
            </Text>
          )}

          {/* Message */}
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

          {/* Timer and Resend */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Didn't receive the OTP?{' '}
            </Text>

            <TouchableOpacity
              onPress={handleResend}
              disabled={isTimerActive}
            >
              <Text
                style={[
                  styles.resendText,
                  isTimerActive
                    ? { color: '#9CA3AF' }
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

          {/* Verify Button */}
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
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.buttonText}>
                Verify & Login
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
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
    paddingBottom: 15,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F1FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  backIcon: {
    fontSize: 28,
    color: '#0A58CA',
    fontWeight: '300',
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
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

