import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Line, Polyline, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Polyline points="12 19 5 12 12 5" />
  </Svg>
);

const InfoIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#0f71c2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="16" x2="12" y2="12" />
    <Line x1="12" y1="8" x2="12.01" y2="8" />
  </Svg>
);

export default function ReKYCScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Re-KYC</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        
        {/* TITLE & SUBTITLE */}
        <Text style={styles.title}>Verify your identity again</Text>
        <Text style={styles.subtitle}>
          Use your Aadhaar-linked mobile number to securely complete re-KYC.
        </Text>

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconWrapper}>
            <InfoIcon />
          </View>
          <Text style={styles.infoText}>
            Your Aadhaar number remains masked.{'\n'}
            Only an OTP sent to your Aadhaar-linked mobile is required.
          </Text>
        </View>

        {/* START RE-KYC BUTTON */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start Re-KYC</Text>
        </TouchableOpacity>

      </View>
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
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff', // Light blue background
    borderWidth: 1,
    borderColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  infoIconWrapper: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  button: {
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f71c2', // Active primary blue
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});