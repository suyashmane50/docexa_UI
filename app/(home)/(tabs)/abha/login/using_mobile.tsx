import React, { useState } from 'react';
import { ABHA } from '@/utils/api';
import { useRouter } from 'expo-router';
import { useAbhaStore } from '../../abha/stores/abhaStore';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons'; 

export default function MobileLoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const setTxnId = useAbhaStore((state: any) => state.setTxnId);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  
  const theme = {
    accent: '#059669',
    lightBg: '#ECFDF5',
  };

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(cleaned);
  };

  const handleclick = async () => {
    if (mobileNumber.length !== 10 || isLoading) return;
    setIsLoading(true);
    try {
      const payload = { 'mobile-number': mobileNumber, }; 
      const response = await ABHA.post('verify/abha/mobile-number/request/otp', payload);
      const txnId = response.data?.Response?.txnId;
      if (txnId) setTxnId(txnId);
      if (response.status === 200 || response.status === 202) {
        if (!txnId) return;
        router.push({
          pathname: '/abha/login/mobileOTP',
          params: { txnId: txnId, mobile: mobileNumber },
        });
      }
    } catch (error: any) {
      console.log('MOBILE OTP ERROR:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = mobileNumber.length < 10 || isLoading;

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
          <Text style={styles.title}>Enter your mobile number</Text>
          <Text style={styles.subtitle}>Enter the mobile number registered with your ABHA.</Text>

          <Text style={styles.inputLabelAbove}>Mobile number</Text>
          
          <View style={[styles.inputContainer, isFocused && { borderColor: theme.accent }, isLoading && { opacity: 0.6 }]}>
            <View style={[styles.leftIconBox, { backgroundColor: theme.lightBg }]}>
              <Feather name="smartphone" size={20} color={theme.accent} />
            </View>

            <View style={styles.inputContent}>
              <Text style={styles.floatingLabel}>Mobile number</Text>
              <View style={styles.inputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.prefix}>+91</Text>
                  <Feather name="chevron-down" size={12} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={mobileNumber}
                  onChangeText={handleMobileChange}
                  maxLength={10}
                  editable={!isLoading}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
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
            <Text style={styles.infoText}>We will send a One Time Password to this mobile number.</Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.accent }, isButtonDisabled && styles.buttonDisabled]} 
            activeOpacity={0.8} 
            onPress={handleclick} 
            disabled={isButtonDisabled}
          >
            {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
          
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} /><Text style={styles.dividerText}>OR</Text><View style={styles.dividerLine} />
          </View>
          
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
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  countryCodeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  prefix: { fontSize: 16, color: '#111827', fontWeight: '600', marginRight: 4 },
  textInput: { flex: 1, fontSize: 16, color: '#111827', padding: 0, fontWeight: '500', letterSpacing: 1.5, outlineStyle: 'none' as any },
  rightIcon: { marginLeft: 10, marginRight: 4 },
  microcopyContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 20, paddingHorizontal: 4 },
  microcopyText: { fontSize: 12, color: '#6B7280', marginLeft: 6 },
  infoBox: { flexDirection: 'row', borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 25, alignItems: 'flex-start' },
  infoIcon: { marginTop: 2, marginRight: 10 },
  infoText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 18 },
  button: { borderRadius: 10, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
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