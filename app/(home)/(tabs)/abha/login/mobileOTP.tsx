import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ABHA } from '../../../../../utils/api'; 
import { useAbhaStore } from '../../abha/stores/abhaStore';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Pressable, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons'; 

export default function MobileOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
const setTxnId = useAbhaStore((state: any) => state.setTxnId);
  // Extract params passed from the previous screen
  const mobileNumber = params.mobile as string;
  const txnId = params.txnId as string;
    const [message, setMessage] = useState('');
const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRef = useRef<TextInput>(null);

  // Match the Green Theme from the Mobile Login screen
  const theme = {
    accent: '#059669', // Green
    lightBg: '#ECFDF5', // Very light green
  };

  // Countdown Timer for Resend
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

  const handleOtpChange = (text: string) => {
    setErrorMsg('');
    const cleaned = text.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
  };
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

    console.log('MOBILE OTP VERIFY REQUEST:', payload);

    const response = await ABHA.post(
      'verify/abha/mobile-number/otp',
      payload
    );

    console.log('MOBILE OTP VERIFY RESPONSE:', response.data);
    console.log('HTTP STATUS:', response.status);

    // Check authentication result
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
    console.log('MOBILE OTP VERIFY ERROR:', error);

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
  const handleResend = async () => {
    if (isTimerActive || isLoading) return;
    
    setIsLoading(true);
    try {
      const payload = { 'mobile-number': mobileNumber }; 
      const response=await ABHA.post('verify/abha/mobile-number/request/otp', payload);
      console.log('MOBILE OTP RESEND RESPONSE:', response.data);
      setTimer(30);
      setIsTimerActive(true);
      setOtp('');
      Alert.alert('OTP Resent', 'A new OTP has been sent to your mobile number.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  const isButtonDisabled = otp.length !== 6 || isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login with ABHA</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            We have sent a 6-digit OTP to your registered mobile number <Text style={{fontWeight: '600', color: '#111827'}}>+91 {mobileNumber}</Text>.
          </Text>

          {/* OTP Input Boxes Container */}
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
                    errorMsg ? { borderColor: '#DC2626' } : {} // Red border on error
                  ]}
                >
                  <Text style={[styles.otpText, hasValue && { color: theme.accent }]}>
                    {otp[index] || ''}
                  </Text>
                </View>
              );
            })}

            {/* Hidden TextInput to capture keystrokes */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={handleOtpChange}
              maxLength={6}
              keyboardType="number-pad"
              textContentType="oneTimeCode" // iOS SMS Auto-fill
              autoComplete="sms-otp"        // Android SMS Auto-fill
              autoFocus
              editable={!isLoading}
            />
          </Pressable>

          {/* Error Message Display */}
          {errorMsg !== '' && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Timer & Resend */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Didn't receive the OTP? </Text>
            <TouchableOpacity onPress={handleResend} disabled={isTimerActive || isLoading}>
              <Text style={[styles.resendText, isTimerActive ? { color: '#9CA3AF' } : { color: theme.accent, fontWeight: '700' }]}>
                {isTimerActive ? `Resend in 00:${timer.toString().padStart(2, '0')}` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: theme.accent },
              isButtonDisabled && styles.buttonDisabled
            ]} 
            activeOpacity={0.8} 
            onPress={handleVerify} 
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify & Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.spacer} />

          {/* Footer */}
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F1FA', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  backIcon: { fontSize: 28, color: '#0A58CA', fontWeight: '300', marginTop: -4 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 10 },
  
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 30, lineHeight: 20 },

  // --- OTP INPUT STYLES ---
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  otpText: { fontSize: 22, fontWeight: '700', color: '#111827' },
  hiddenInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0 },

  // --- ERROR & TIMER ---
  errorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 4 },
  errorText: { fontSize: 13, color: '#DC2626', marginLeft: 6 },
  timerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  timerText: { fontSize: 14, color: '#6B7280' },
  resendText: { fontSize: 14, fontWeight: '600' },

  // --- BUTTON ---
  button: { borderRadius: 10, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  // --- FOOTER ---
  spacer: { flex: 1, minHeight: 40 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 30, marginTop: 20 },
  linkText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  dot: { marginHorizontal: 8, color: '#9CA3AF' },
});