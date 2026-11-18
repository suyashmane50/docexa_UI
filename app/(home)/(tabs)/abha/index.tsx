import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { useRouter, useFocusEffect } from 'expo-router';

import { useAbhaStore } from './stores/abhaStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* =========================================================
   ACTION CARD
========================================================= */

type ActionCardProps = {
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBgColor: string;
  onPress: () => void;
};

const ActionCard = ({
  title,
  subtitle,
  iconName,
  iconColor,
  iconBgColor,
  onPress,
}: ActionCardProps) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconBgColor },
        ]}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={iconColor}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>

        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#9CA3AF"
      />
    </TouchableOpacity>
  );
};
export default function AbhaLandingScreen() {
  const router = useRouter();
  const patients = useAbhaStore((state) => state.patients);
  const selectPatient = useAbhaStore((state) => state.selectPatient);
  const [hydrated, setHydrated] = useState(
    useAbhaStore.persist.hasHydrated()
  );

  const [showPatientSelector, setShowPatientSelector] =
    useState(false);

  const [screenFocused, setScreenFocused] = useState(false);
  const patientList = Object.values(patients || {});

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setScreenFocused(true);
      setShowPatientSelector(false);

      const checkPatients = async () => {
        try {
          // Rehydrate persisted Zustand data
          await useAbhaStore.persist.rehydrate();

          if (!isActive) return;

          const store = useAbhaStore.getState();

          const storedPatients = Object.values(
            store.patients || {}
          );

          if (storedPatients.length > 0) {
            setShowPatientSelector(true);
          } else {
            setShowPatientSelector(false);
          }

          setHydrated(true);
        } catch (error) {
          console.error(
            'Error loading stored patients:',
            error
          );

          if (isActive) {
            setShowPatientSelector(false);
          }
        }
      };

      checkPatients();

      return () => {
        isActive = false;
        setScreenFocused(false);
        setShowPatientSelector(false);
      };
    }, [])
  );

  const handleClearPatients = async () => {
    // This log runs immediately when the button is tapped.
    console.log('[ABHA CLEAR] Button pressed');

    try {
      // Reset the live Zustand store. Persist middleware writes the reset state.
      useAbhaStore.getState().clearStore();
      setShowPatientSelector(false);

      // Confirm the live store is cleared.
      const livePatients = useAbhaStore.getState().patients;
      console.log('[ABHA CLEAR] Patients in Zustand after reset:', livePatients);

      // Explicitly synchronize the persisted key with the empty store state.
      const emptyState = useAbhaStore.getState();
      await AsyncStorage.setItem(
        'abha-local-storage',
        JSON.stringify({
          state: {
            patients: {},
            activePatientId: null,
            token: null,
            txnId: null,
            aadhaar: null,
            data: null,
            profileData: null,
          },
          version: 0,
        })
      );

      // Verify the persisted data directly.
      const rawStorage = await AsyncStorage.getItem('abha-local-storage');
      console.log('[ABHA CLEAR] AsyncStorage after reset:', rawStorage);

      Alert.alert('Saved patients cleared', 'Local patient data has been cleared.');
    } catch (error) {
      console.error('[ABHA CLEAR] Failed:', error);
      Alert.alert('Clear failed', 'Unable to clear saved patients.');
    }
  };

  /* =======================================================
     SELECT EXISTING PATIENT
  ======================================================= */

  const handlePatientSelect = (patientId: string) => {
  try {
    const store = useAbhaStore.getState();
    const patient = store.patients?.[patientId];

    if (!patient) {
      Alert.alert('Error', 'Patient not found.');
      return;
    }

    // Check this patient's ACCESS TOKEN
    const accessToken = patient.token;

    if (!accessToken || !accessToken.trim()) {
      Alert.alert(
        'Login Required',
        'Your saved access token is missing. Please log in again.',
      );
      return;
    }

    // Restore selected patient's session in Zustand
    selectPatient(patientId);

    // Close the Welcome Back popup
    setShowPatientSelector(false);

    // Navigate to the patient's profile
    router.replace('/(home)/(tabs)/abha/abha_profile');

  } catch (error) {
    console.error('Error selecting patient:', error);
    Alert.alert('Error', 'Unable to open patient profile.');
  }
};

  /* =======================================================
     ADD NEW PATIENT
  ======================================================= */

  const handleAddNewPatient = () => {
    setShowPatientSelector(false);
  };

  /* =======================================================
     GET PATIENT NAME
  ======================================================= */

  const getPatientName = (patient: any) => {
    if (patient?.name?.trim()) {
      return patient.name.trim();
    }

    const profile = patient?.profileData;

    if (profile) {
      const name =
        profile?.name ||
        profile?.fullName ||
        profile?.patientName ||
        profile?.Name;

      if (typeof name === 'string' && name.trim()) {
        return name.trim();
      }

      if (typeof name === 'object' && name !== null) {
        const firstName =
          name?.firstName ||
          name?.firstname ||
          name?.givenName ||
          '';

        const lastName =
          name?.lastName ||
          name?.lastname ||
          name?.surname ||
          '';

        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) {
          return fullName;
        }
      }
    }

    return 'Patient';
  };

  /* =======================================================
     SCREEN
  ======================================================= */

  return (
    <View style={styles.mainContainer}>
      {/* ==================================================
          NORMAL ABHA LANDING SCREEN
      ================================================== */}

      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.header} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* LOGO */}

          <View style={styles.logoSection}>
            <Image
              source={require('../../../../assets/images/aabha1.webp')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>ABHA</Text>

              <Text style={styles.logoSubtitle}>
                Ayushman Bharat Health Account
              </Text>
            </View>
          </View>

          {/* HERO CARD */}

          <LinearGradient
            colors={['#0A4D8C', '#0A7BA8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            <View style={styles.heroIconBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.heroTitle}>
              Access your ABHA
            </Text>

            <Text style={styles.heroSubtitle}>
              Create or securely access your Ayushman
              {'\n'}
              Bharat Health Account.
            </Text>
          </LinearGradient>

          {/* ACTION CARDS */}

          <View style={styles.actionSection}>
            <ActionCard
              title="Login / Verify ABHA"
              subtitle="Securely access an existing ABHA"
              iconName="shield-checkmark"
              iconColor="#FFFFFF"
              iconBgColor="#0A5898"
              onPress={() => router.push('/abha/verify')}
            />

            <ActionCard
              title="Create ABHA"
              subtitle="Create a new digital health account"
              iconName="heart-outline"
              iconColor="#2E8B57"
              iconBgColor="#E8F5E9"
              onPress={() => router.push('/abha/create')}
            />
          </View>

          {/* INFORMATION BOX */}

          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color="#0A5898"
              />

              <Text style={styles.infoTitle}>
                Secure digital healthcare
              </Text>
            </View>

            <Text style={styles.infoText}>
              Your health information is securely managed
              through the ABDM ecosystem.
            </Text>
          </View>

          <TouchableOpacity
              onPress={handleClearPatients}
              style={styles.clearPatientsButton}
              activeOpacity={0.7}
            >
              <Text>For Temp:</Text>
              <Ionicons
                name="trash-outline"
                size={15}
                color="#DC2626"
              />

              <Text style={styles.clearPatientsText}>
                Clear saved patients
              </Text>
            </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* ==================================================
          PATIENT SELECTION OVERLAY
      ================================================== */}

      {hydrated &&
        screenFocused &&
        showPatientSelector &&
        patientList.length > 0 && (
          <View style={styles.overlayContainer}>
            {/* REDUCED BLURRED BACKGROUND */}

            <BlurView
              intensity={5}
              tint="light"
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.overlayTint} />

            {/* PATIENT MODAL */}

            <View style={styles.patientModal}>
              {/* HEADER */}

              <View style={styles.modalHeader}>
                <View style={styles.headerIcon}>
                  <Ionicons
                    name="people-outline"
                    size={26}
                    color="#0A5898"
                  />
                </View>

                <Text style={styles.modalTitle}>
                  Welcome Back
                </Text>

                <Text style={styles.modalSubtitle}>
                  Select a patient to continue
                </Text>
              </View>

              {/* PATIENT LIST */}

              <ScrollView
                style={styles.patientList}
                showsVerticalScrollIndicator={false}
              >
                {patientList.map((patient: any) => (
                  <TouchableOpacity
                    key={patient.patientId}
                    style={styles.patientItem}
                    activeOpacity={0.75}
                    onPress={() =>
                      handlePatientSelect(patient.patientId)
                    }
                  >
                    {/* AVATAR */}

                    <View style={styles.patientAvatar}>
                      <Ionicons
                        name="person"
                        size={23}
                        color="#0A5898"
                      />
                    </View>

                    {/* PATIENT NAME */}

                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>
                        {getPatientName(patient)}
                      </Text>

                      <Text style={styles.patientSubtitle}>
                        Saved patient
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* OR SEPARATOR */}

              <View style={styles.orContainer}>
                <View style={styles.orLine} />

                <Text style={styles.orText}>OR</Text>

                <View style={styles.orLine} />
              </View>

              {/* ADD NEW PATIENT */}

              <TouchableOpacity
                style={styles.addPatientButton}
                activeOpacity={0.85}
                onPress={handleAddNewPatient}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color="#FFFFFF"
                />

                <Text style={styles.addPatientText}>
                  Login with New Patient
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 16,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 24,
    marginTop: 10,
  },

  logoImage: {
    width: 45,
    height: 45,
    marginRight: 10,
  },

  logoTextContainer: {},

  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.3,
  },

  logoSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  heroCard: {
    borderRadius: 16,
    padding: 22,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },

  heroIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  heroSubtitle: {
    fontSize: 14,
    color: '#D1E0EA',
    lineHeight: 20,
  },

  circle1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  circle2: {
    position: 'absolute',
    bottom: -60,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  actionSection: {
    gap: 16,
    marginBottom: 24,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  textContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  infoBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  infoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  clearPatientsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    gap: 8,
  },

  clearPatientsText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },

  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 999,
    elevation: 999,
  },

  overlayTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,35,55,0.12)',
  },

  patientModal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    maxHeight: '85%',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },
  },

  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EAF4FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: '#17324D',
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },

  patientList: {
    maxHeight: 300,
  },

  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },

  patientAvatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#E5F1FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  patientInfo: {
    flex: 1,
  },

  patientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },

  patientSubtitle: {
    fontSize: 12,
    color: '#8A94A3',
    marginTop: 4,
  },

  /* OR SEPARATOR */

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  orText: {
    marginHorizontal: 14,
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },

  /* ADD NEW PATIENT BUTTON */

  addPatientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A5898',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 12,
    gap: 8,
  },

  addPatientText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 16,
    lineHeight: 16,
  },
});