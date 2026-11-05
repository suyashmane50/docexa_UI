import React, { useState, useEffect, useRef } from 'react';
import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

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
export default function AadhaarOtpScreen() {
  const router = useRouter();

  // Mobile message received from Aadhaar OTP request
  const { mobile } = useLocalSearchParams<{
    mobile: string;
  }>();

  // Transaction ID from Zustand
  const txnId = useAbhaStore((state: any) => state.txnId);
  const setData = useAbhaStore((state: any) => state.setData);
  const setToken = useAbhaStore((state: any) => state.setToken);
  const setProfileData = useAbhaStore((state: any) => state.setProfileData);
  const [otp, setOtp] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] =
    useState<'success' | 'error' | ''>('');

  const inputRef = useRef<TextInput>(null);

  const theme = {
    accent: '#1E3A8A',
    lightBg: '#EFF6FF',
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

  // OTP input
  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 6);

    setOtp(cleaned);

    setMessage('');
    setMessageType('');
  };

  // Verify Aadhaar OTP
  const handleVerify = async () => {
    if (otp.length !== 6 || isLoading) {
      return;
    }

    if (!txnId) {
      setMessage(
        'Transaction ID is missing. Please request OTP again.'
      );
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

      console.log('AADHAAR VERIFY REQUEST:', payload);

      const response = await ABHA.post(
        'verify/aadhar/otp',
        payload
      );
      const responseData = response.data?.Response;
      console.log('AADHAAR VERIFY RESPONSE:', response.data);

      console.log('HTTP STATUS:', response.status);

      // Success condition
      if (
        responseData?.authResult?.toLowerCase() === 'success'
      ) {
        // Save only the accounts array for the profile screen.
        setData(responseData.accounts ?? []);

        // Save access token separately in Zustand.
        if (responseData.token) {
          setToken(responseData.token);
        }

        // Read the token from Zustand and send it in the request header.
        const storedToken = useAbhaStore.getState().token;

        if (!storedToken) {
          throw new Error('Authentication token is missing from Zustand.');
        }

        // Fetch the authenticated ABHA profile/account details.
        const profileResponse = await ABHA.get(
          'enroll/profile/account',
          {
            headers: {
              token: storedToken,
            },
          }
        );

        console.log('ENROLL PROFILE ACCOUNT RESPONSE:', profileResponse.data);

        // Persist the complete profile/account API response in Zustand.
        setProfileData(profileResponse.data);

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
      console.log('AADHAAR VERIFY ERROR:', error);

      const status = error.response?.status;

      const backendMessage =
        error.response?.data?.Response?.message ||
        error.response?.data?.message;

      setMessage(
        backendMessage ||
          (status === 429
            ? 'Too many attempts. Please wait before trying again.'
            : 'Invalid OTP. Please try again.')
      );

      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend timer
  const handleResend = () => {
    if (isTimerActive || isLoading) {
      return;
    }

    setTimer(30);
    setIsTimerActive(true);
    setOtp('');

    setMessage(
      'Please request a new OTP from the previous screen.'
    );

    setMessageType('error');
  };

  const isButtonDisabled =
    otp.length !== 6 || isLoading;

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

          {/* Registered Mobile Number */}
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

          {/* OTP Input Boxes */}
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

            {/* Hidden TextInput */}
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

          {/* Error / Success Message */}
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

          {/* Resend OTP */}
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

          {/* Verify OTP Button */}
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

          <Text style={styles.bottomInfo}>
            Enter the OTP received on your Aadhaar
            registered mobile number.
          </Text>

          {/* Footer */}
          <View style={styles.spacer} />

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