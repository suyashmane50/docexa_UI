import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ABHA } from '../../../../../utils/api';
import { useAbhaStore } from '../../abha/stores/abhaStore';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Pressable, Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function MobileOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const setTxnId = useAbhaStore((state: any) => state.setTxnId);
  const addPatient = useAbhaStore((state: any) => state.addPatient);

  const mobileNumber = params.mobile as string;
  const initialTxnId = params.txnId as string;

  const [currentTxnId, setCurrentTxnId] = useState(initialTxnId);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isVerifyLocked, setIsVerifyLocked] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<TextInput>(null);

  const theme = {
    accent: '#059669',
    lightBg: '#ECFDF5',
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
    setErrorMsg('');
    const cleaned = text.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
  };

  // Verify OTP
  const handleVerify = async () => {
    if (otp.length !== 6 || isLoading || isVerifyLocked) return;

    if (!currentTxnId) {
      setMessage('Transaction ID is missing. Please request OTP again.');
      setMessageType('error');
      return;
    }

    // Lock verify button for 30 seconds
    setIsVerifyLocked(true);
    setTimer(30);
    setIsTimerActive(true);

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await ABHA.post(
        'verify/abha/mobile-number/otp',
        {
          txnId: currentTxnId,
          otp,
        }
      );

      const responseData = response.data?.Response;

      if (responseData?.authResult?.toLowerCase() === 'success') {
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
            console.warn('Mobile login: profile fetch failed; using OTP response data.', profileError);
          }
        }

        const firstAccount = Array.isArray(accounts) ? (accounts[0] ?? {}) : (accounts ?? {});
        const patientName =
          firstAccount?.name || firstAccount?.fullName || firstAccount?.Name ||
          profileData?.name || profileData?.fullName || profileData?.profile?.name ||
          profileData?.data?.name || 'Mobile Patient';
        const identifier =
          firstAccount?.ABHANumber || firstAccount?.abhaNumber || firstAccount?.abhaNo ||
          firstAccount?.ABHA_NUMBER || firstAccount?.preferredAbhaAddress ||
          firstAccount?.abhaAddress || firstAccount?.abha_address ||
          profileData?.ABHANumber || profileData?.abhaNumber ||
          profileData?.preferredAbhaAddress || profileData?.abhaAddress ||
          profileData?.profile?.ABHANumber || profileData?.profile?.abhaNumber ||
          mobileNumber;
        const patientId = String(identifier || mobileNumber || '')
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase();

        if (!patientId) {
          throw new Error('Unable to identify this patient.');
        }

        const now = new Date().toISOString();
        addPatient({
          patientId,
          name: patientName,
          token: authToken || null,
          txnId: currentTxnId,
          aadhaar: null,
          data: accounts || responseData,
          profileData,
          createdAt: now,
          lastLoginAt: now,
        });
        setTxnId(currentTxnId);

        setMessage('OTP verified successfully!');
        setMessageType('success');
        router.replace('/(home)/(tabs)/abha/abha_profile');
      } else {
        setMessage(
          response.data?.Response?.message || 'OTP verification failed.'
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

  // Resend OTP - maximum 2 successful requests
  const handleResend = async () => {
    if (isTimerActive || isLoading || resendCount >= 2) return;

    if (!mobileNumber) {
      setMessage('Mobile number is missing. Please go back and try again.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await ABHA.post(
        'verify/abha/mobile-number/request/otp',
        {
          'mobile-number': mobileNumber,
        }
      );

      // Count only successful resend requests
      if (response.status === 200 || response.status === 202) {
        setResendCount((prev) => prev + 1);

        // Update transaction ID if the backend returns a new one
        const newTxnId = response.data?.Response?.txnId;

        if (newTxnId) {
          setCurrentTxnId(newTxnId);
          setTxnId(newTxnId);
        }

        setOtp('');
        setErrorMsg('');

        // Start another 30-second resend cooldown
        setTimer(30);
        setIsTimerActive(true);

        // Allow verification with the newly received OTP
        setIsVerifyLocked(false);

        Alert.alert(
          'OTP Resent',
          'A new OTP has been sent to your mobile number.'
        );
      } else {
        setMessage(
          response.data?.Response?.message || 'Failed to resend OTP.'
        );
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(
        error.response?.data?.Response?.message ||
        error.response?.data?.message ||
        'Failed to resend OTP. Please try again later.'
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>

        {/* UPDATED HEADER WITH IONICONS */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login with ABHA</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            We have sent a 6-digit OTP to your registered mobile number <Text style={{ fontWeight: '600', color: '#111827' }}>+91 {mobileNumber}</Text>.
          </Text>

          <Pressable style={styles.otpContainer} onPress={() => inputRef.current?.focus()}>
            {[...Array(6)].map((_, index) => {
              const isFocused = otp.length === index;
              const hasValue = otp.length > index;

              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    isFocused && { borderColor: theme.accent, backgroundColor: theme.lightBg },
                    hasValue && { borderColor: theme.accent },
                    errorMsg ? { borderColor: '#DC2626' } : {}
                  ]}
                >
                  <Text style={[styles.otpText, hasValue && { color: theme.accent }]}>
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

          {errorMsg !== '' && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {message !== '' && (
            <View style={styles.errorContainer}>
              <Feather
                name={messageType === 'success' ? 'check-circle' : 'alert-circle'}
                size={14}
                color={messageType === 'success' ? '#15803D' : '#DC2626'}
              />
              <Text
                style={[
                  styles.errorText,
                  messageType === 'success' && { color: '#15803D' }
                ]}
              >
                {message}
              </Text>
            </View>
          )}

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Didn't receive the OTP? </Text>

            {isTimerActive ? (
              <Text style={[styles.resendText, { color: '#9CA3AF' }]}>
                Resend in 00:{timer.toString().padStart(2, '0')}
              </Text>
            ) : resendCount < 2 ? (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isLoading}
              >
                <Text style={[styles.resendText, { color: theme.accent, fontWeight: '700' }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.resendText, { color: '#9CA3AF' }]}>
                Resend limit reached
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent }, isButtonDisabled && styles.buttonDisabled]}
            activeOpacity={0.8}
            onPress={handleVerify}
            disabled={isButtonDisabled}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.buttonText}>Verify & Login</Text>
            }
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

  // UPDATED STYLES
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
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },

  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 30, lineHeight: 20 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, position: 'relative' },
  otpBox: { width: 45, height: 55, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  otpText: { fontSize: 22, fontWeight: '700', color: '#111827' },
  hiddenInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 4 },
  errorText: { fontSize: 13, color: '#DC2626', marginLeft: 6 },
  timerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  timerText: { fontSize: 14, color: '#6B7280' },
  resendText: { fontSize: 14, fontWeight: '600' },
  button: { borderRadius: 10, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  spacer: { flex: 1, minHeight: 40 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 30, marginTop: 20 },
  linkText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  dot: { marginHorizontal: 8, color: '#9CA3AF' },
});