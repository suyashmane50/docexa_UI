import React, { useState } from 'react';
import {ABHA} from '../../../../../utils/api' ;
import { useRouter } from 'expo-router';
import { useAbhaStore } from '../../abha/stores/abhaStore';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons'; 

export default function AbhaNumberLoginScreen() {
  const router = useRouter();
  const [abhaNumber, setAbhaNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [message, setMessage] = useState('');
const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const setTxnId = useAbhaStore((state: any) => state.setTxnId);

  // Unique Theme for ABHA
  const theme = {
    accent: '#6D28D9', // Purple
    lightBg: '#F5F3FF',
  };

  const handleAbhaChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 14);
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    if (cleaned.length > 6) formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 6) + '-' + cleaned.slice(6);
    if (cleaned.length > 10) formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 6) + '-' + cleaned.slice(6, 10) + '-' + cleaned.slice(10);
    setAbhaNumber(formatted);
  };

const handleclick = async () => {
  if (isLoading) return;

  const rawNumber = abhaNumber;

  setMessage('');
  setMessageType('');

  if (rawNumber.replace(/-/g, '').length !== 14) {
    setMessage('Please enter a valid 14-digit ABHA number.');
    setMessageType('error');
    return;
  }

  setIsLoading(true);

  try {
    const response = await ABHA.post(
      'verify/abha/abha-number/request/otp',
      {
        'abha-number': rawNumber,
      }
    );
    console.log('ABHA NUMBER LOGIN RESPONSE:', response.data);
    console.log('HTTP STATUS:', response.status);
    const txnId = response.data?.Response?.txnId;
      if (txnId) setTxnId(txnId);
    console.log('TXN ID:', txnId);
    if (response.status === 200 || response.status === 202) {
      setMessage(
        response.data?.Response?.message ||
        'OTP sent successfully to your ABHA registered mobile.'
      );

      setMessageType('success');

      setTimeout(() => {
        router.push({
          pathname: '/abha/login/abhaOTP',
          params: {
            txnId: response.data?.Response?.txnId,
            abhaNumber: rawNumber,
          },
        });
      }, 1000);
    } else {
      setMessage('Unable to send OTP. Please try again.');
      setMessageType('error');
    }

} catch (error: any) {
  const status = error.response?.status;
  const backendMessage =
    error.response?.data?.Response?.message ||
    error.response?.data?.message;

  if (status === 429) {
    setMessage(
      backendMessage ||
      'Too many OTP requests. Please wait for some time before requesting another OTP.'
    );
  } else {
    setMessage(
      backendMessage ||
      'Unable to send OTP. Please try again later.'
    );
  }

  setMessageType('error');

  console.log('HTTP STATUS:', status);
  console.log('ERROR RESPONSE:', error.response?.data);
} finally {
  setIsLoading(false);
}


};

  const isButtonDisabled = abhaNumber.replace(/-/g, '').length !== 14 || isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login with ABHA</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.title}>Enter your ABHA number</Text>
          <Text style={styles.subtitle}>Enter your 14-digit ABHA number to verify your identity and login.</Text>

          <Text style={styles.inputLabelAbove}>ABHA number</Text>
          
          <View style={[styles.inputContainer, isFocused && { borderColor: theme.accent }, isLoading && { opacity: 0.6 }]}>
            <View style={[styles.leftIconBox, { backgroundColor: theme.lightBg }]}>
              <Feather name="heart" size={20} color={theme.accent} /> 
            </View>

            <View style={styles.inputContent}>
              <Text style={styles.floatingLabel}>ABHA number</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="XX-XXXX-XXXX-XXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={abhaNumber}
                  onChangeText={handleAbhaChange}
                  maxLength={17}
                  editable={!isLoading}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            <Feather name="shield" size={20} color={theme.accent} style={styles.rightIcon} />
          </View>

          <View style={styles.microcopyContainer}>
            <Feather name="lock" size={12} color={theme.accent} />
            <Text style={styles.microcopyText}>Your information is used for identity verification.</Text>
          </View>

          <View style={[styles.infoBox, { backgroundColor: theme.lightBg, borderColor: theme.accent }]}>
            <Feather name="info" size={16} color={theme.accent} style={styles.infoIcon} />
            <Text style={styles.infoText}>Your ABHA number is a unique identifier for your health records. Avoid sharing it unnecessarily.</Text>
          </View>

          {/* UPDATED: Primary Button now uses theme.accent color */}
          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: theme.accent }, // Applied Purple theme color
              isButtonDisabled && styles.buttonDisabled
            ]} 
            activeOpacity={0.8} 
            onPress={handleclick} 
            disabled={isButtonDisabled}
          >
            {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} /><Text style={styles.dividerText}>OR</Text><View style={styles.dividerLine} />
          </View>
          
          {/* UPDATED: Outline Button now uses theme.accent color */}
          <TouchableOpacity 
            style={[styles.outlineButton, { borderColor: theme.accent }]} 
            activeOpacity={0.8} 
            onPress={() => router.push('/(home)/(tabs)/abha/create')}
          >
            <Text style={[styles.outlineButtonText, { color: theme.accent }]}>Create a new ABHA</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
          <View style={styles.footer}>
            <Text style={styles.linkText}>Terms of Service</Text><Text style={styles.dot}>•</Text><Text style={styles.linkText}>Privacy Policy</Text>
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
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 25, lineHeight: 20 },
  inputLabelAbove: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, elevation: 2 },
  leftIconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  inputContent: { flex: 1, justifyContent: 'center' },
  floatingLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  textInput: { flex: 1, fontSize: 16, color: '#111827', padding: 0, fontWeight: '500', letterSpacing: 1.5, outlineStyle: 'none' as any },
  rightIcon: { marginLeft: 10, marginRight: 4 },
  microcopyContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 20, paddingHorizontal: 4 },
  microcopyText: { fontSize: 12, color: '#6B7280', marginLeft: 6 },
  infoBox: { flexDirection: 'row', borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 25, alignItems: 'flex-start' },
  infoIcon: { marginTop: 2, marginRight: 10 },
  infoText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 18 },
  button: { borderRadius: 10, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  buttonDisabled: { backgroundColor: '#9CA3AF' }, // Overrides theme color when disabled
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  switchMethodContainer: { alignItems: 'center', marginTop: 15 },
  switchMethodText: { fontSize: 14, fontWeight: '500' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 15, color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
  outlineButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 16, alignItems: 'center', backgroundColor: '#FFFFFF' },
  outlineButtonText: { fontSize: 16, fontWeight: '600' },
  spacer: { flex: 1, minHeight: 40 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 30, marginTop: 20 },
  linkText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  dot: { marginHorizontal: 8, color: '#9CA3AF' },
});