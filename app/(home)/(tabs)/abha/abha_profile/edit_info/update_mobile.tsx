import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { useRouter } from 'expo-router';

import { ABHA } from '@/utils/api';
import { useAbhaStore } from '../../stores/abhaStore';

const BackIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0f172a"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Polyline points="12 19 5 12 12 5" />
  </Svg>
);

export default function UpdateMobileScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isValid = /^[0-9]{10}$/.test(mobileNumber);

  const handleMobileChange = (value: string) => {
    setMobileNumber(value.replace(/\D/g, '').slice(0, 10));
    setErrorMessage('');
  };

  const handleSendOtp = async () => {
    setErrorMessage('');

    if (!isValid) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);

      // Ensure persisted Zustand state is available before reading the token.
      await useAbhaStore.persist.rehydrate();
      const token = useAbhaStore.getState().token;

      if (!token) {
        setErrorMessage('Authentication token is missing. Please login again.');
        console.log('Update mobile OTP: token is missing from Zustand.');
        return;
      }

      const requestBody = {
        token,
        mobile: mobileNumber,
      };

      console.log('Requesting OTP for update mobile number:', mobileNumber);

      const response = await ABHA.post(
        'profile/account/update-mobile/request/otp',
        requestBody
      );

      const responseData = response?.data ?? response;
      const responseBody = responseData?.Response ?? responseData?.response?.Response ?? responseData;
      const txnId = responseBody?.txnId;
      const message =
        responseBody?.message ??
        responseData?.message ??
        responseData?.Message ??
        'OTP sent successfully.';

      console.log('========== UPDATE MOBILE REQUEST RESPONSE ==========');
      console.log('HTTP status:', response?.status ?? responseData?.status);
      console.log('Response:', JSON.stringify(responseData, null, 2));
      console.log('=====================================================');

      if (!txnId) {
        setErrorMessage(message || 'OTP was requested, but transaction ID was not received.');
        console.error('Transaction ID missing from update-mobile request response.');
        return;
      }

      // Keep txnId in Zustand during this flow and also pass it to the OTP route.
      useAbhaStore.getState().setTxnId(txnId);

      router.push({
        pathname: '/(home)/(tabs)/abha/abha_profile/edit_info/mobile_OTP',
        params: {
          txnId,
          message,
        },
      });
    } catch (error: any) {
      const errorData = error?.response?.data;
      console.error(
        'Update mobile request OTP error:',
        JSON.stringify(errorData ?? { message: error?.message }, null, 2)
      );
      setErrorMessage(
        errorData?.Response?.message ??
          errorData?.message ??
          errorData?.Message ??
          error?.message ??
          'Unable to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update mobile number</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Enter new mobile number</Text>
          <Text style={styles.subtitle}>
            We'll verify your new communication mobile number using an OTP.
          </Text>

          <Text style={styles.inputLabel}>New mobile number</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <View style={styles.divider} />
            <TextInput
              style={styles.textInput}
              placeholder="Mobile Number"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={10}
              value={mobileNumber}
              onChangeText={handleMobileChange}
              editable={!loading}
            />
          </View>

          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, isValid && !loading ? styles.buttonActive : styles.buttonDisabled]}
            disabled={!isValid || loading}
            onPress={handleSendOtp}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 32 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, height: 52, marginBottom: 24, backgroundColor: '#ffffff' },
  countryCode: { paddingHorizontal: 16, fontSize: 16, color: '#0f172a', fontWeight: '500' },
  divider: { width: 1, height: '60%', backgroundColor: '#e2e8f0' },
  textInput: { flex: 1, height: '100%', paddingHorizontal: 16, fontSize: 16, color: '#0f172a' },
  button: { height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonActive: { backgroundColor: '#0f71c2' },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#dc2626', fontSize: 13, marginBottom: 12 },
});
