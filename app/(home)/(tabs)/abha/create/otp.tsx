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

export default function AadhaarOtpScreen() {
  // Get the transaction ID and token setter from Zustand.
  const txnId = useAbhaStore((state) => state.txnId);
  const setToken = useAbhaStore((state) => state.setToken);

  const router = useRouter();

  // Only mobile is received through route parameters.
  // txnId is retrieved from Zustand.
  const { mobile } = useLocalSearchParams<{
    mobile?: string;
  }>();

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [timer, setTimer] = useState(58);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer.
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle OTP input and pasted OTP.
  const handleOtpChange = (
    text: string,
    index: number
  ) => {
    setErrorMessage('');

    // Allow digits only.
    if (!/^\d*$/.test(text)) {
      return;
    }

    // Support entering or pasting multiple digits.
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, 6);

      if (digits.length === 0) {
        return;
      }

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

    // Automatically focus the next input.
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace.
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

  // Verify Aadhaar OTP using txnId from Zustand.
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');

    setErrorMessage('');

    // Validate OTP.
    if (enteredOtp.length !== 6) {
      setErrorMessage(
        'Please enter the complete 6-digit OTP.'
      );
      return;
    }

    // Validate transaction ID from Zustand.
    if (!txnId) {
      setErrorMessage(
        'Transaction ID is missing. Please request a new OTP.'
      );

      console.error(
        'Transaction ID is missing from Zustand.'
      );

      return;
    }

    try {
      setVerifying(true);

      // Send the transaction ID from Zustand in the request body.
      const response = await ABHA.post(
        'enrollment/enrol/byAadhaar',
        {
          txnId: txnId,
          otp: enteredOtp,

          // Replace this with the actual mobile number
          // required by your API, if applicable.
          mobile: '8262943747',
        }
      );

      console.log(
        'OTP verification response:',
        response.data
      );

      const data = response.data;

      const responseMobile =
        data?.Response?.ABHAProfile?.mobile;

      const txnIdFromResponse =
        data?.Response?.txnId;

      const token =
        data?.Response?.tokens?.token;

      // Save the returned token in Zustand.
      if (token) {
        setToken(token);
      }

      // Navigate only when verification succeeds.
      if (data?.Status === 200) {
        if (!txnIdFromResponse || !responseMobile) {
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

      {/* Display the masked mobile number */}
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

      {/* Six OTP input boxes */}
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

      {/* Display errors on the screen */}
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

      {/* OTP countdown */}
      <Text style={styles.resendText}>
        {timer > 0 ? (
          <>
            Resend OTP{' '}
            <Text style={styles.boldText}>
              in 00:
              {timer < 10 ? `0${timer}` : timer}
            </Text>
          </>
        ) : (
          'You can request another OTP.'
        )}
      </Text>

      <Text style={styles.attemptText}>
        Resend attempt 0 of 2
      </Text>

      {/* Verify button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          verifying && { opacity: 0.6 },
        ]}
        onPress={handleVerifyOtp}
        disabled={verifying}
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

  resendText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },

  boldText: {
    fontWeight: '700',
    color: '#1F2937',
  },

  attemptText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 32,
  },

  primaryButton: {
    backgroundColor: '#0A5898',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
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