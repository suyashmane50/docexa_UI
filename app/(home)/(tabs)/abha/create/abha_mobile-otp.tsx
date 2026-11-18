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

import { ABHA } from '../../../../../utils/api';

import { useAbhaStore } from '../../abha/stores/abhaStore';

const OTP_TIMER = 30;
const MAX_RESEND_ATTEMPTS = 2;

export default function MobileOtpScreen() {
  const router = useRouter();
  const storedTransactionId = useAbhaStore(
    (state) => state.txnId
  );

  const setTxnId = useAbhaStore(
    (state) => state.setTxnId
  );
  const {
    mobile: routeMobile,
    txnId: routeTxnId,
  } = useLocalSearchParams<{
    mobile?: string;
    txnId?: string;
  }>();

  const mobile = routeMobile || '';

  // Keep latest transaction ID after resend
  const [transactionId, setTransactionId] = useState(
    routeTxnId || storedTransactionId || ''
  );
  const [otp, setOtp] = useState<string[]>(
    Array(6).fill('')
  );

  const [timer, setTimer] = useState(OTP_TIMER);

  const [resendAttempts, setResendAttempts] =
    useState(0);

  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Actual expiry timestamp
  const otpExpiryRef = useRef(
    Date.now() + OTP_TIMER * 1000
  );
  const isOtpComplete = otp.every(
    (digit) => digit !== ''
  );

  const isOtpExpired = timer <= 0;

  const isVerifyDisabled =
    !isOtpComplete ||
    loading ||
    resending ||
    isOtpExpired;
  const maskMobileNumber = (
    mobileNumber: string
  ) => {
    const digits = mobileNumber.replace(/\D/g, '');

    if (digits.length < 10) {
      return '******';
    }

    return `******${digits.slice(-4)}`;
  };
  useEffect(() => {
    const interval = setInterval(() => {

      const remainingTime = Math.max(
        0,
        Math.ceil(
          (otpExpiryRef.current - Date.now()) / 1000
        )
      );

      setTimer(remainingTime);

      if (remainingTime <= 0) {

        setOtp(Array(6).fill(''));

        setErrorMessage(
          'OTP has expired. Please request a new OTP.'
        );

        clearInterval(interval);
      }

    }, 250);

    return () => clearInterval(interval);

  }, [resendAttempts]);
  const handleOtpChange = (
    text: string,
    index: number
  ) => {

    // Prevent entering OTP after expiry
    if (Date.now() >= otpExpiryRef.current) {

      setTimer(0);

      setOtp(Array(6).fill(''));

      setErrorMessage(
        'OTP has expired. Please request a new OTP.'
      );

      return;
    }

    if (!/^\d*$/.test(text)) return;

    setErrorMessage('');

    const newOtp = [...otp];

    // Handle pasted OTP
    if (text.length > 1) {

      const digits = text
        .replace(/\D/g, '')
        .slice(0, 6);

      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] ?? '';
      }

      setOtp(newOtp);

      inputRefs.current[
        Math.min(digits.length, 5)
      ]?.focus();

      return;
    }

    newOtp[index] = text;

    setOtp(newOtp);

    // Focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
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
  const handleResendOtp = async () => {

    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {

      setErrorMessage(
        'Maximum resend OTP attempts reached. Please try after some time.'
      );

      return;
    }

    if (!transactionId || !mobile) {

      setErrorMessage(
        'Transaction ID or mobile number is missing.'
      );

      return;
    }

    try {

      setResending(true);

      setErrorMessage('');

      const response = await ABHA.post(
        'enrollment/request/updateMobile/otp',
        {
          txnId: transactionId,
          mobile: mobile,
        }
      );

      const data = response.data;

      console.log(
        'Mobile resend response:',
        data
      );

      if (
        response.status === 200 ||
        response.status === 202
      ) {

        const newTxnId =
          data?.Response?.txnId ??
          data?.ResponseJSON?.txnId ??
          data?.txnId;

        // Update transaction ID
        if (newTxnId) {

          const updatedTxnId = String(newTxnId);

          setTransactionId(updatedTxnId);

          setTxnId(updatedTxnId);
        }

        // Restart actual expiry timestamp
        otpExpiryRef.current =
          Date.now() + OTP_TIMER * 1000;

        // Reset timer
        setTimer(OTP_TIMER);

        // Increment resend attempts
        setResendAttempts(
          (previous) => previous + 1
        );

        // Clear previous OTP
        setOtp(Array(6).fill(''));

        // Focus first input
        inputRefs.current[0]?.focus();

        setErrorMessage('');

        console.log(
          'Mobile OTP timer restarted.'
        );

      } else {

        setErrorMessage(
          data?.Response?.message ||
          data?.Message ||
          data?.message ||
          'Unable to resend OTP. Please try again.'
        );
      }

    } catch (error: any) {

      const errorData = error?.response?.data;

      console.error(
        'Mobile resend OTP error:',
        errorData ?? error?.message
      );

      setErrorMessage(
        errorData?.Response?.message ||
        errorData?.Message ||
        errorData?.message ||
        'Unable to resend OTP. Please try again.'
      );

    } finally {

      setResending(false);

    }
  };
  const handleVerifyOtp = async () => {

    if (loading) return;

    // Check actual OTP expiry
    if (Date.now() >= otpExpiryRef.current) {

      setTimer(0);

      setOtp(Array(6).fill(''));

      setErrorMessage(
        'OTP has expired. Please request a new OTP.'
      );

      return;
    }

    setErrorMessage('');

    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {

      setErrorMessage(
        'Please enter the complete 6-digit OTP.'
      );

      return;
    }

    if (!transactionId) {

      setErrorMessage(
        'Transaction ID is missing. Please request OTP again.'
      );

      return;
    }

    try {

      setLoading(true);
      const response = await ABHA.post(
        '/enrollment/auth/byAbdm',
        {
          txnId: transactionId,
          otp: enteredOtp,
        }
      );

      const data = response.data;

      console.log(
        'Mobile OTP verification response:',
        JSON.stringify(data, null, 2)
      );

      const authResult =
        data?.Response?.authResult ??
        data?.response?.authResult ??
        data?.authResult;

      const message = String(
        data?.Response?.message ??
        data?.Response?.Message ??
        data?.response?.message ??
        data?.message ??
        data?.Message ??
        ''
      );

      const resultText = String(
        authResult ?? ''
      ).toLowerCase();

      const explicitSuccess = [
        'success',
        'successful',
        'verified',
      ].includes(resultText);

      const explicitFailure = [
        'failed',
        'failure',
        'error',
        'invalid',
      ].includes(resultText);

      const successMessage =
        /successfully linked|mobile number.*verified|mobile.*successfully.*linked|otp verified successfully/.test(
          message.toLowerCase()
        );

      const verificationSucceeded =
        (
          response.status === 200 ||
          response.status === 202
        ) &&
        !explicitFailure &&
        (
          explicitSuccess ||
          successMessage
        );

      if (!verificationSucceeded) {

        setErrorMessage(
          message ||
          'OTP verification failed. Please enter the correct OTP.'
        );

        return;
      }
      const suggestionResponse = await ABHA.get(
        '/enrollment/enrol/suggestion',
        {
          headers: {
            txnId: transactionId,
          },
        }
      );

      const suggestionData =
        suggestionResponse.data;

      console.log(
        'ABHA suggestion response:',
        JSON.stringify(suggestionData, null, 2)
      );

      const responseBody =
        suggestionData?.Response ??
        suggestionData?.response ??
        suggestionData?.data?.Response ??
        suggestionData?.data ??
        suggestionData;

      const possibleLists = [
        responseBody?.abhaAddressList,
        responseBody?.suggestions,
        responseBody?.abhaAddressSuggestions,
        responseBody?.addressList,
        responseBody?.abhaAddresses,
        suggestionData?.abhaAddressList,
        suggestionData?.suggestions,
      ];

      const addressList =
        possibleLists.find(Array.isArray);

      if (
        !Array.isArray(addressList) ||
        addressList.length === 0
      ) {

        setErrorMessage(
          'Mobile verified successfully, but ABHA suggestions were not returned.'
        );

        return;
      }
      router.replace({
        pathname: '/abha/create/address',

        params: {
          abha_address: JSON.stringify(
            addressList.slice(0, 3)
          ),

          transactionId:
            responseBody?.txnId ??
            responseBody?.transactionId ??
            transactionId,
        },
      });

    } catch (error: any) {

      const errorData = error?.response?.data;

      console.error(
        'Mobile OTP verification error:',
        errorData ?? error?.message
      );

      setErrorMessage(
        errorData?.Response?.message ||
        errorData?.Message ||
        errorData?.message ||
        'Unable to verify OTP. Please try again.'
      );

    } finally {

      setLoading(false);

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
        We've sent a 6-digit OTP to your mobile number.
      </Text>

      {/* MASKED MOBILE NUMBER */}

      <View style={styles.phoneBadge}>

        <Ionicons
          name="phone-portrait-outline"
          size={16}
          color="#0A5898"
        />

        <Text style={styles.phoneText}>
          +91 {maskMobileNumber(mobile)}
        </Text>

      </View>

      {/* OTP INPUT BOXES */}

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

            editable={
              timer > 0 &&
              !loading &&
              !resending
            }
          />

        ))}

      </View>

      {/* ERROR MESSAGE */}

      {errorMessage !== '' && (

        <View style={styles.errorContainer}>

          <Ionicons
            name="alert-circle-outline"
            size={20}
            color="#DC2626"
          />

          <Text style={styles.errorText}>
            {errorMessage}
          </Text>

        </View>

      )}

      {/* COUNTDOWN AND RESEND OTP */}

      <View style={styles.resendContainer}>

        {timer > 0 ? (

          <Text style={styles.resendText}>
            OTP expires in{' '}

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

      {/* RESEND ATTEMPTS */}

      <Text style={styles.attemptText}>
        Resend attempt {resendAttempts} of {MAX_RESEND_ATTEMPTS}
      </Text>

      {/* VERIFY OTP BUTTON */}

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

        {loading ? (

          <ActivityIndicator color="#FFFFFF" />

        ) : (

          <Text style={styles.primaryButtonText}>
            Verify OTP
          </Text>

        )}

      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Enter the OTP sent to your registered mobile number.
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 24,
    flexGrow: 1,
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
    marginBottom: 24,
    gap: 6,
  },

  otpInput: {
    flex: 1,
    minWidth: 0,
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
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    lineHeight: 20,
  },

  resendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    marginTop: 4,
  },

  resendText: {
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
    justifyContent: 'center',
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
