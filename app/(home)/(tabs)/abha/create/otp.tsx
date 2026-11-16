import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import { useAbhaStore } from '../../abha/stores/abhaStore';
import { ABHA } from '../../../../../utils/api';

const OTP_TIMER = 30;
const MAX_RESEND_ATTEMPTS = 2;

export default function AadhaarOtpScreen() {
  const router = useRouter();

  // Zustand
  const txnId = useAbhaStore((state) => state.txnId);
  const aadhaar = useAbhaStore((state) => state.aadhaar);
  const setTxnId = useAbhaStore((state) => state.setTxnId);
  const setToken = useAbhaStore((state) => state.setToken);

  // Route parameters
  const { mobile } = useLocalSearchParams<{
    mobile?: string;
  }>();

  // OTP state
  const [otp, setOtp] = useState<string[]>(
    Array(6).fill('')
  );

  const [timer, setTimer] = useState(OTP_TIMER);
  const [resendAttempts, setResendAttempts] = useState(0);

  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Enable verify when all 6 digits are entered.
  const isOtpComplete = otp.every(
    (digit) => digit !== ''
  );

  const isVerifyDisabled =
    !isOtpComplete || verifying;

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP input and paste
  const handleOtpChange = (
    text: string,
    index: number
  ) => {
    setErrorMessage('');

    if (!/^\d*$/.test(text)) {
      return;
    }

    // Handle pasted OTP
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, 6);

      const newOtp = Array(6)
        .fill('')
        .map((_, i) => digits[i] ?? '');

      setOtp(newOtp);

      const nextIndex = Math.min(digits.length, 5);

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    const newOtp = [...otp];

    newOtp[index] = text;

    setOtp(newOtp);

    // Focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyPress = (
    event: any,
    index: number
  ) => {
    if (
      event.nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // RESEND OTP
  const handleResendOtp = async () => {
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      setErrorMessage(
        'Maximum resend OTP attempts reached please try after some time.'
      );
      return;
    }

    if (!aadhaar) {
      setErrorMessage(
        'Aadhaar number is missing. Please go back and enter Aadhaar again.'
      );
      return;
    }

    try {
      setResending(true);
      setErrorMessage('');

      const response = await ABHA.post(
        'enrollment/request/otp',
        {
          loginId: aadhaar,
        }
      );

      const data = response.data;

      console.log('Resend OTP response:', data);

      if (
        data?.status === 200 &&
        data?.ResponseJSON?.txnId
      ) {
        // Update transaction ID in Zustand
        setTxnId(data.ResponseJSON.txnId);

        // Increment resend attempts
        setResendAttempts((previous) => previous + 1);

        // Restart 30-second timer
        setTimer(OTP_TIMER);

        // Clear previous OTP
        setOtp(Array(6).fill(''));

        // Focus first OTP input
        inputRefs.current[0]?.focus();

        setErrorMessage('');
      } else {
        setErrorMessage(
          data?.Message ||
          data?.message ||
          'Unable to resend OTP. Please try again.'
        );
      }
    } catch (error: any) {
      const errorData = error?.response?.data;

      console.error(
        'Resend OTP error:',
        errorData ?? error?.message
      );

      setErrorMessage(
        errorData?.Message ||
        errorData?.message ||
        'Unable to resend OTP. Please try again.'
      );
    } finally {
      setResending(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');

    setErrorMessage('');

    if (enteredOtp.length !== 6) {
      setErrorMessage(
        'Please enter the complete 6-digit OTP.'
      );
      return;
    }

    if (!txnId) {
      setErrorMessage(
        'Transaction ID is missing. Please request a new OTP.'
      );
      return;
    }

    try {
      setVerifying(true);

      const response = await ABHA.post(
        'enrollment/enrol/byAadhaar',
        {
          txnId: txnId,
          otp: enteredOtp,

          // Your existing mobile value
          mobile: '8262943747',
        }
      );

      const data = response.data;

      console.log(
        'OTP verification response:',
        data
      );

      const responseMobile =
        data?.Response?.ABHAProfile?.mobile;

      const txnIdFromResponse =
        data?.Response?.txnId;

      const token =
        data?.Response?.tokens?.token;

      // Save token in Zustand
      if (token) {
        setToken(token);
      }

      // Successful verification
      if (data?.Status === 200) {
        if (
          !txnIdFromResponse ||
          !responseMobile
        ) {
          setErrorMessage(
            'Mobile number or transaction ID is missing from the response.'
          );
          return;
        }

        router.replace({
          pathname:
            '/(home)/(tabs)/abha/create/confirm-mobile',
          params: {
            txnId: String(txnIdFromResponse),
            mobile: String(responseMobile),
          },
        });
      } else {
        const message =
          data?.Response?.error?.message ||
          data?.Message ||
          data?.message ||
          'OTP verification failed. Please try again.';

        setErrorMessage(
          data?.Status === 422
            ? 'Please enter the correct OTP.'
            : message
        );
      }
    } catch (error: any) {
      const errorData = error?.response?.data;

      console.error(
        'OTP verification error:',
        errorData ?? error?.message
      );

      if (
        error?.response?.status === 422 ||
        errorData?.Status === 422
      ) {
        setErrorMessage(
          'Please enter the correct OTP.'
        );
      } else {
        const message =
          errorData?.Response?.error?.message ||
          errorData?.Message ||
          errorData?.message ||
          'Unable to verify OTP. Please try again.';

        setErrorMessage(message);
      }
    } finally {
      setVerifying(false);
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
        We've sent a 6-digit OTP to your Aadhaar-linked
        mobile number.
      </Text>

      {/* Masked mobile number */}
      <View style={styles.phoneBadge}>
        <Ionicons
          name="phone-portrait-outline"
          size={16}
          color="#0A5898"
        />

        <Text style={styles.phoneText}>
          +91 {mobile || '******'}
        </Text>
      </View>

      {/* OTP inputs */}
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
              errorMessage !== '' &&
                styles.otpInputError,
            ]}
            value={digit}
            onChangeText={(text) =>
              handleOtpChange(text, index)
            }
            onKeyPress={(event) =>
              handleKeyPress(event, index)
            }
            keyboardType="number-pad"
            maxLength={6}
            blurOnSubmit={false}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Error message */}
      {errorMessage !== '' && (
        <View
          style={styles.errorContainer}
          accessibilityRole="alert"
        >
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color="#DC2626"
          />

          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* Countdown and resend */}
      <View style={styles.resendContainer}>
        {timer > 0 ? (
          <Text style={styles.resendText}>
            Resend OTP in{' '}
            <Text style={styles.boldText}>
              00:{timer < 10 ? `0${timer}` : timer}
            </Text>
          </Text>
        ) : resendAttempts < MAX_RESEND_ATTEMPTS ? (
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={resending}
            activeOpacity={0.7}
          >
            {resending ? (
              <ActivityIndicator color="#0A5898" />
            ) : (
              <Text style={styles.resendButtonText}>
                Resend OTP
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <Text style={styles.resendDisabledText}>
            Maximum resend attempts reached
          </Text>
        )}
      </View>

      <Text style={styles.attemptText}>
        Resend attempt {resendAttempts} of {MAX_RESEND_ATTEMPTS}
      </Text>

      {/* Verify OTP button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          isVerifyDisabled &&
            styles.primaryButtonDisabled,
      ]}
        onPress={handleVerifyOtp}
        disabled={isVerifyDisabled}
        activeOpacity={0.8}
      >
        {verifying ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Verify OTP
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Enter the OTP sent to your Aadhaar-linked mobile
        number.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 40,
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
    marginBottom: 24,
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
    marginBottom: 16,
  },

  otpInput: {
    width: 48,
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

  otpInputError: {
    borderColor: '#DC2626',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    lineHeight: 18,
  },

  resendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    marginTop: 4,
  },

  resendText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },

  resendButtonText: {
    color: '#0A5898',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  resendDisabledText: {
    color: '#9CA3AF',
    fontSize: 13,
  },

  boldText: {
    fontWeight: '700',
    color: '#1F2937',
  },

  attemptText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 32,
  },

  primaryButton: {
    backgroundColor: '#0A5898',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },

  primaryButtonDisabled: {
    backgroundColor: '#86ACCC',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});
