import React, { useState } from 'react';
import { useAbhaStore } from '../../abha/stores/abhaStore';
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
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ABHA } from '../../../../../utils/api';

export default function AadhaarLoginScreen() {
  const [aadhaar, setAadhaar] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const setTxnId = useAbhaStore((state: any) => state.setTxnId);

  const theme = {
    accent: '#1E3A8A',
    lightBg: '#EFF6FF',
  };

  const handleAadhaarChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 12);
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += cleaned[i];
    }
    setAadhaar(formatted);
    setMessage('');
    setMessageType('');
  };

  const handleclick = async () => {
    if (isLoading) return;
    const aadhaarNumber = aadhaar.replace(/\s/g, '');
    setMessage('');
    setMessageType('');

    if (aadhaarNumber.length !== 12) {
      setMessage('Please enter a valid 12-digit Aadhaar number.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ABHA.post('verify/aadhar/request/otp', {
        aadhar: aadhaarNumber,
      });

      const txnId = response.data?.Response?.txnId;
      const mobileMessage = response.data?.Response?.message || 'OTP sent to your Aadhaar registered mobile number';

      if (response.status === 200 || response.status === 202) {
        if (!txnId) {
          setMessage('Transaction ID missing in response.');
          setMessageType('error');
          return;
        }
        setTxnId(txnId);
        router.push({
          pathname: '/abha/login/aadharOTP',
          params: { mobile: mobileMessage },
        });
      } else {
        setMessage('Unable to send OTP. Please try again.');
        setMessageType('error');
      }
    } catch (error: any) {
      const backendMessage = error.response?.data?.Response?.message || error.response?.data?.message;
      setMessage(backendMessage || 'Failed to send OTP. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = aadhaar.replace(/\s/g, '').length !== 12 || isLoading;

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
          <Text style={styles.title}>Enter your Aadhaar number</Text>
          <Text style={styles.subtitle}>Your Aadhaar will be used to verify your identity and login to your ABHA.</Text>

          <Text style={styles.inputLabelAbove}>Aadhaar number</Text>

          <View style={[styles.inputContainer, isLoading && { opacity: 0.6 }]}>
            <View style={[styles.leftIconBox, { backgroundColor: theme.lightBg }]}>
              <Feather name="credit-card" size={20} color={theme.accent} />
            </View>

            <View style={styles.inputContent}>
              <Text style={styles.floatingLabel}>Aadhaar number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="XXXX XXXX XXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={aadhaar}
                onChangeText={handleAadhaarChange}
                maxLength={14}
                editable={!isLoading}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>

          <View style={styles.microcopyContainer}>
            <Feather name="lock" size={12} color={theme.accent} />
            <Text style={styles.microcopyText}>Your information is used for identity verification.</Text>
          </View>

          <View style={[styles.infoBox, { backgroundColor: theme.lightBg, borderColor: theme.accent }]}>
            <Feather name="info" size={16} color={theme.accent} style={styles.infoIcon} />
            <Text style={styles.infoText}>Your Aadhaar information is highly confidential and will never be stored without consent.</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent }, isButtonDisabled && styles.buttonDisabled]}
            activeOpacity={0.8}
            onPress={handleclick}
            disabled={isButtonDisabled}
          >
            {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>

          {message !== '' && (
            <View style={[styles.messageContainer, messageType === 'success' ? styles.successMessage : styles.errorMessage]}>
              <Feather name={messageType === 'success' ? 'check-circle' : 'alert-circle'} size={17} color={messageType === 'success' ? '#15803D' : '#DC2626'} />
              <Text style={[styles.messageText, messageType === 'success' ? styles.successText : styles.errorText]}>{message}</Text>
            </View>
          )}

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8} onPress={() => router.push('/abha/create')}>
            <Text style={styles.outlineButtonText}>Create a new ABHA</Text>
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
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 25, lineHeight: 20 },
  inputLabelAbove: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, elevation: 2 },
  leftIconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  inputContent: { flex: 1, justifyContent: 'center' },
  floatingLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
  textInput: { fontSize: 16, color: '#111827', padding: 0, fontWeight: '500', letterSpacing: 1, outlineStyle: 'none' as any },
  microcopyContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 20, paddingHorizontal: 4 },
  microcopyText: { fontSize: 12, color: '#6B7280', marginLeft: 6 },
  infoBox: { flexDirection: 'row', borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 25, alignItems: 'flex-start' },
  infoIcon: { marginTop: 2, marginRight: 10 },
  infoText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 18 },
  button: { borderRadius: 10, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  messageContainer: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 10, marginTop: 12, marginBottom: 10 },
  successMessage: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  errorMessage: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  messageText: { flex: 1, fontSize: 13, marginLeft: 8, lineHeight: 19 },
  successText: { color: '#15803D' },
  errorText: { color: '#DC2626' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 15, color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
  outlineButton: { borderWidth: 1, borderColor: '#0A58CA', borderRadius: 10, paddingVertical: 16, alignItems: 'center', backgroundColor: '#FFFFFF' },
  outlineButtonText: { color: '#0A58CA', fontSize: 16, fontWeight: '600' },
  spacer: { flex: 1, minHeight: 40 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 30, marginTop: 20 },
  linkText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  dot: { marginHorizontal: 8, color: '#9CA3AF' },
});