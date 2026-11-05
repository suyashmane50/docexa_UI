import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';

import { Stack, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CreateAbhaLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide the enrollment header and progress bar on these screens.
  const isSuccessScreen = pathname.endsWith('/success');
  const isAbhaCardScreen = pathname.endsWith('/download_abha');

  const hideEnrollmentHeader =
    isSuccessScreen || isAbhaCardScreen;

  // Determine the current enrollment step.
  const getStepDetails = () => {
    // Step 1: Aadhaar entry and Aadhaar OTP.
    if (
      pathname.endsWith('/index') ||
      pathname.endsWith('/otp')
    ) {
      return {
        step: 1,
        title: 'Create your ABHA',
        label: 'Aadhaar',
      };
    }

    // Step 2: Mobile verification.
    if (
      pathname.includes('confirm-mobile') ||
      pathname.includes('mobile-input') ||
      pathname.includes('mobile-otp')
    ) {
      return {
        step: 2,
        title: 'Verify Mobile',
        label: 'Mobile',
      };
    }

    // Step 3: Create ABHA address.
    if (pathname.includes('/address')) {
      return {
        step: 3,
        title: 'Create ABHA Address',
        label: 'ABHA Address',
      };
    }

    // Default enrollment step.
    return {
      step: 1,
      title: 'Create your ABHA',
      label: 'Aadhaar',
    };
  };

  const details = getStepDetails();

  return (
    <SafeAreaView
      style={[
        styles.container,
        isAbhaCardScreen && styles.cardScreenContainer,
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* Hide the enrollment header and progress bar on
          the success screen and ABHA card screen. */}
      {!hideEnrollmentHeader && (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color="#1F2937"
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {details.title}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.stepText}>
                Step {details.step} of 4
              </Text>

              <Text style={styles.stepLabel}>
                {details.label}
              </Text>
            </View>

            <View style={styles.progressBarBg}>
              {[1, 2, 3, 4].map((num) => (
                <View
                  key={num}
                  style={[
                    styles.progressSegment,
                    {
                      backgroundColor:
                        num <= (details.step ?? 1)
                          ? '#0A5898'
                          : '#E5E7EB',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </>
      )}

      <View style={styles.stackContainer}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#FFFFFF',
            },
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  cardScreenContainer: {
    paddingTop: 0,
  },

  stackContainer: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 16,
  },

  backButton: {
    padding: 4,
    marginRight: 12,
    marginLeft: -4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },

  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A5898',
  },

  stepLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  progressBarBg: {
    flexDirection: 'row',
    gap: 8,
  },

  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});

