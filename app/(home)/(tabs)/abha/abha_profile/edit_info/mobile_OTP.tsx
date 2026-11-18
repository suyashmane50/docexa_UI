import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ABHA } from '@/utils/api';
import { useAbhaStore } from '../../stores/abhaStore';

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <Path d="M12 18h.01" />
  </Svg>
);

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ txnId?: string; message?: string }>();

  const txnId = useMemo(
    () => (Array.isArray(params.txnId) ? params.txnId[0] : params.txnId),
    [params.txnId]
  );
  const otpMessage = useMemo(
    () => (Array.isArray(params.message) ? params.message[0] : params.message),
    [params.message]
  );

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = numericText;
    setOtp(nextOtp);
    setErrorMessage('');
    setSuccessMessage('');

    if (numericText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  const handleVerifyOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const enteredOtp = otp.join('');
    if (!/^\d{6}$/.test(enteredOtp)) {
      setErrorMessage('Please enter the complete 6-digit OTP.');
      return;
    }

    if (!txnId) {
      setErrorMessage('Transaction ID is missing. Please request OTP again.');
      console.error('Update mobile OTP verification: txnId missing from route params.');
      return;
    }

    try {
      setLoading(true);

      // Make sure persisted Zustand data is hydrated, then get the latest token.
      await useAbhaStore.persist.rehydrate();
      const token = useAbhaStore.getState().token;

      if (!token) {
        setErrorMessage('Authentication token is missing. Please login again.');
        console.error('Update mobile OTP verification: token missing from Zustand.');
        return;
      }

      const requestBody = {
        txnId,
        otp: enteredOtp,
        token,
      };

      console.log('Verifying update-mobile OTP. Transaction ID present:', Boolean(txnId));

      const response = await ABHA.post(
        'profile/account/update-mobile/verify/otp',
        requestBody
      );

      const responseData = response?.data ?? response;
      console.log('========== UPDATE MOBILE VERIFY OTP RESPONSE ==========');
      console.log('HTTP status:', response?.status ?? responseData?.status);
      console.log('Response:', JSON.stringify(responseData, null, 2));
      console.log('========================================================');

      const responseBody = responseData?.Response ?? responseData?.response?.Response ?? responseData;
      const message =
        responseBody?.message ??
        responseData?.message ??
        responseData?.Message ??
        'OTP verification request completed.';

      // Navigate to the ABHA profile only when the backend confirms success.
      // Axios resolves for HTTP 2xx responses, but also check any status/flag
      // returned inside the response body in case the API reports an error there.
      const httpStatus = Number(response?.status);
      const apiStatusValue =
        responseData?.Status ??
        responseData?.status ??
        responseBody?.Status ??
        responseBody?.status;
      const apiStatus = Number(apiStatusValue);

      const successFlag =
        responseData?.Success ??
        responseData?.success ??
        responseBody?.Success ??
        responseBody?.success;

      const failureMessage = /invalid|incorrect|wrong|failed|failure|not verified|verification error/i.test(
        String(message)
      );

      const isOtpVerifiedSuccessfully =
        httpStatus >= 200 &&
        httpStatus < 300 &&
        (!Number.isFinite(apiStatus) || (apiStatus >= 200 && apiStatus < 300)) &&
        successFlag !== false &&
        !failureMessage;

      if (isOtpVerifiedSuccessfully) {
        console.log('Mobile number OTP verified successfully. Navigating to ABHA profile.');
        router.replace({
          pathname: '/(home)/(tabs)/abha/abha_profile',
          params: { contactUpdated: 'mobile' },
        });
      } else {
        setErrorMessage(
          message || 'OTP verification failed. Please try again.'
        );
      }
    } catch (error: any) {
      const errorData = error?.response?.data;
      console.error(
        'Update mobile verify OTP error:',
        JSON.stringify(errorData ?? { message: error?.message }, null, 2)
      );
      setErrorMessage(
        errorData?.Response?.message ??
          errorData?.message ??
          errorData?.Message ??
          error?.message ??
          'OTP verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.back()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify OTP</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>We've sent a 6-digit OTP to</Text>

          <View style={styles.infoBox}>
            <PhoneIcon />
            <Text style={styles.infoText}>
              {otpMessage || 'OTP sent to your registered mobile number.'}
            </Text>
          </View>

          {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[styles.otpInput, focusedIndex === index && styles.otpInputFocused]}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </View>

          <Text style={styles.timerText}>Enter the OTP received on your new mobile number.</Text>

          <TouchableOpacity
            style={[styles.verifyButton, isOtpComplete && !loading ? styles.verifyButtonActive : {}]}
            activeOpacity={0.8}
            disabled={!isOtpComplete || loading}
            onPress={handleVerifyOtp}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            Enter the OTP received on your new communication mobile number.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLink}>Terms of Service</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 16 
  },
  backButton: { 
    marginRight: 12,
    padding: 4,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333333' 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#111827', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666666', 
    marginBottom: 20 
  },
  infoBox: { 
    flexDirection: 'row', 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 24, 
    alignItems: 'flex-start' 
  },
  infoText: { 
    flex: 1, 
    fontSize: 14, 
    color: '#4B5563', 
    marginLeft: 10, 
    lineHeight: 20 
  },
  otpContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  otpInput: { 
    width: 45, 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 6, 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#111827', 
    textAlign: 'center', 
    backgroundColor: '#ffffff' 
  },
  otpInputFocused: { 
    borderColor: '#007AFF', 
    borderWidth: 2, 
  },
  timerText: { 
    textAlign: 'center', 
    fontSize: 13, 
    color: '#6B7280', 
    marginBottom: 24 
  },
  verifyButton: { 
    backgroundColor: '#D1D5DB', 
    borderRadius: 8, 
    height: 50, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16 
  },
  verifyButtonActive: { 
    backgroundColor: '#007AFF' 
  },
  verifyButtonText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  disclaimerText: { 
    textAlign: 'center', 
    fontSize: 13, 
    color: '#6B7280', 
    lineHeight: 18, 
    paddingHorizontal: 20 
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingBottom: 20 
  },
  footerLink: { 
    fontSize: 12, 
    color: '#6B7280', 
    fontWeight: '400' 
  },
  footerDot: { 
    fontSize: 12, 
    color: '#9CA3AF', 
    marginHorizontal: 8 
  },
  errorText: { 
    color: '#DC2626', 
    fontSize: 13, 
    marginBottom: 12 
  },
  successText: { 
    color: '#16A34A', 
    fontSize: 13, 
    marginBottom: 12 
  },
});