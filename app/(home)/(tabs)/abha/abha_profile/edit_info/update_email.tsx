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

export default function UpdateEmailScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Read token from Zustand
  const token = useAbhaStore((state) => state.token);

  // Email validation
  const normalizedEmail = email.trim().toLowerCase();

  const isValidEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  // Handle email input
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrorMessage('');
  };

  // Send email OTP request
  const handleSendOtp = async () => {
    setErrorMessage('');

    if (!isValidEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      // Wait for Zustand persisted storage to hydrate.
      if (!useAbhaStore.persist.hasHydrated()) {
        await useAbhaStore.persist.rehydrate();
      }

      // Get the latest token from Zustand.
      const storedToken = useAbhaStore.getState().token;

      if (!storedToken) {
        setErrorMessage(
          'Authentication token not found. Please login again.'
        );

        console.log('Token available:', false);
        return;
      }

      // Request body
      const requestBody = {
        email: normalizedEmail,
        token: storedToken,
      };

      console.log('Sending Update Email OTP request...');
      console.log('Request email:', normalizedEmail);
      console.log('Token available:', Boolean(storedToken));

      // API request
      const response = await ABHA.post(
        'profile/account/update-email/request/otp',
        requestBody
      );

      // Extract backend response
      const responseData = response?.data ?? response;

      const responseBody =
        responseData?.Response ??
        responseData?.response ??
        responseData;

      console.log('========== UPDATE EMAIL OTP RESPONSE ==========');
      console.log('HTTP Status:', response?.status);
      console.log(
        'Response:',
        JSON.stringify(responseData, null, 2)
      );
      console.log('===============================================');

      const txnId = responseBody?.txnId;
      const message = responseBody?.message;

      if (!txnId) {
        setErrorMessage(
          message || 'Transaction ID was not received from the server.'
        );
        return;
      }

      // Navigate to email OTP screen and pass transaction details.
      router.push({
        pathname:
          '/(home)/(tabs)/abha/abha_profile/edit_info/email_OTP',
        params: {
          txnId: txnId,
          email: normalizedEmail,
          message: message || 'OTP sent successfully.',
        },
      });

    } catch (error: any) {
      console.log('========== UPDATE EMAIL OTP ERROR ==========');
      console.log('HTTP Status:', error?.response?.status);
      console.log(
        'Backend Response:',
        JSON.stringify(error?.response?.data, null, 2)
      );
      console.log('Error:', error?.message);
      console.log('=============================================');

      setErrorMessage(
        error?.response?.data?.Response?.message ||
        error?.response?.data?.Message ||
        error?.response?.data?.message ||
        'Unable to send email OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <BackIcon />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Update Email</Text>

        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>

          {/* TITLE & SUBTITLE */}
          <Text style={styles.title}>
            Enter your email address
          </Text>

          <Text style={styles.subtitle}>
            We'll send a verification code to this email address.
          </Text>

          {/* INPUT LABEL */}
          <Text style={styles.inputLabel}>
            Email address
          </Text>

          {/* INPUT FIELD */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="name@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              value={email}
              onChangeText={handleEmailChange}
              editable={!loading}
            />
          </View>

          {/* ERROR MESSAGE */}
          {errorMessage !== '' && (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          )}

          {/* SEND OTP BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              isValidEmail && !loading
                ? styles.buttonActive
                : styles.buttonDisabled,
            ]}
            disabled={!isValidEmail || loading}
            onPress={handleSendOtp}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                Send OTP
              </Text>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  backBtn: {
    marginRight: 16,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 32,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    height: 52,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },

  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#0f172a',
    // This removes the default yellow/blue focus ring on Web
    outlineStyle: 'none', 
  } as any,

  button: {
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  buttonActive: {
    backgroundColor: '#0f71c2',
  },

  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 12,
  },
});