import React from 'react';

import {

  StyleSheet,

  Text,

  Image,

  View,

  ScrollView,

  TouchableOpacity,

  SafeAreaView,

  StatusBar,

  BackHandler,

} from 'react-native';

import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';

import { LinearGradient } from 'expo-linear-gradient';

import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';

// Update this relative path only if your store is located somewhere else.

import { useAbhaStore } from '../stores/abhaStore';

import { ABHA } from '../../../../../utils/api';

type IconProps = {

  name: string;

  size?: number;

  color?: string;

};

const Icon = ({ name, size = 24, color = '#000' }: IconProps) => {

  const props = {

    width: size,

    height: size,

    viewBox: '0 0 24 24',

    fill: 'none' as const,

    stroke: color,

    strokeWidth: 2,

    strokeLinecap: 'round' as const,

    strokeLinejoin: 'round' as const,

  };

  switch (name) {

    case 'plus':

      return <Svg {...props}><Path d="M12 5v14M5 12h14" /></Svg>;

    case 'bell':

      return <Svg {...props}><Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></Svg>;

    case 'user':

      return <Svg {...props}><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></Svg>;

    case 'idCard':

      return <Svg {...props}><Rect x="3" y="5" width="18" height="14" rx="2" /><Path d="M7 10h4M7 14h8" /></Svg>;

    case 'share':

      return <Svg {...props}><Circle cx="18" cy="5" r="3" /><Circle cx="6" cy="12" r="3" /><Circle cx="18" cy="19" r="3" /><Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></Svg>;

    case 'fileText':

      return <Svg {...props}><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><Polyline points="14 2 14 8 20 8" /><Line x1="16" y1="13" x2="8" y2="13" /><Line x1="16" y1="17" x2="8" y2="17" /><Polyline points="10 9 9 9 8 9" /></Svg>;

    case 'shield':

      return <Svg {...props}><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><Polyline points="9 12 11 14 15 10" /></Svg>;

    case 'link':

      return <Svg {...props}><Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></Svg>;

    case 'chevronRight':

      return <Svg {...props}><Polyline points="9 18 15 12 9 6" /></Svg>;

    case 'check':

      return <Svg {...props}><Polyline points="20 6 9 17 4 12" /></Svg>;

    case 'settings':

      return <Svg {...props}><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></Svg>;

    case 'home':

      return <Svg {...props}><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><Polyline points="9 22 9 12 15 12 15 22" /></Svg>;

    case 'arrowLeft':

      return <Svg {...props}><Line x1="19" y1="12" x2="5" y2="12" /><Polyline points="12 19 5 12 12 5" /></Svg>;

    case 'abha':

  return (

    <Svg {...props} viewBox="0 0 24 24">

      {/* Outer circle */}

      <Circle

        cx="12"

        cy="12"

        r="10"

        strokeWidth="1.8"

      />

      {/* ABHA stylized A */}

      <Path

        d="M5.5 17.5L12 4.5L18.5 17.5"

        strokeWidth="1.8"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

      {/* Medical card */}

      <Path

        d="M8 9H16V14H8Z"

        strokeWidth="1.5"

        strokeLinejoin="round"

      />

      {/* Medical plus */}

      <Path

        d="M12 10.5V12.5M11 11.5H13"

        strokeWidth="1.5"

        strokeLinecap="round"

      />

    </Svg>

  );

    default:

      return null;

  }

};

const getStoredAccount = (profileData: any, savedAccounts: any) => {

  const responseRoot =

    profileData?.Response ??

    profileData?.response ??

    profileData?.data?.Response ??

    profileData?.data ??

    profileData;

  const candidates = [

    responseRoot?.ABHAProfile,

    responseRoot?.account,

    responseRoot?.Account,

    responseRoot?.accounts?.[0],

    responseRoot?.profile,

    responseRoot?.Profile,

    Array.isArray(responseRoot) ? responseRoot[0] : responseRoot,

  ];

  const profileAccount = candidates.find(

    (candidate) =>

      candidate &&

      typeof candidate === 'object' &&

      (candidate.name ||

        candidate.firstName ||

        candidate.first_name ||

        candidate.ABHANumber ||

        candidate.abhaNumber ||

        candidate.preferredAbhaAddress ||

        candidate.abhaAddress)

  );

  const loginAccount = Array.isArray(savedAccounts)

    ? savedAccounts[0]

    : savedAccounts;

  return profileAccount ?? loginAccount ?? null;

};

// Search nested API/store responses because the ABHA address may be stored

// separately from the object containing the ABHA number.

const findAbhaAddress = (value: any, depth = 0): string | null => {

  if (!value || depth > 7 || typeof value !== 'object') return null;

  const keys = [

    'preferredAbhaAddress',

    'preferred_abha_address',

    'abhaAddress',

    'abha_address',

    'ABHAAddress',

  ];

  for (const key of keys) {

    const candidate = value[key];

    if (typeof candidate === 'string' && candidate.trim()) {

      return candidate.trim();

    }

  }

  const children = Array.isArray(value) ? value : Object.values(value);

  for (const child of children) {

    const found = findAbhaAddress(child, depth + 1);

    if (found) return found;

  }

  return null;

};

const getProfileImageUri = (photo: unknown): string | null => {

  if (typeof photo !== 'string') return null;

  const value = photo.trim();

  if (!value) return null;

  if (/^(data:image\/|https?:\/\/|file:|content:|blob:)/i.test(value)) {

    return value;

  }

  const base64 = value.replace(/\s/g, '');

  const mimeType = base64.startsWith('iVBOR')

    ? 'image/png'

    : base64.startsWith('R0lGOD')

      ? 'image/gif'

      : 'image/jpeg';

  return `data:${mimeType};base64,${base64}`;

};

export default function App() {

  const router = useRouter();

  // Prevent native-stack swipe/back gestures from returning to the OTP screen.
  // Once a back action is requested, allow this screen to be replaced by ABHA home.
  const [allowNavigation, setAllowNavigation] = React.useState(false);

  const goToAbhaHome = React.useCallback(() => {
    setAllowNavigation(true);
    requestAnimationFrame(() => {
      router.replace('/(home)/(tabs)/abha');
    });
  }, [router]);

  usePreventRemove(!allowNavigation, goToAbhaHome);

  // Android hardware back uses BackHandler; iOS swipe-back is handled above.
  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        goToAbhaHome();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      );

      return () => subscription.remove();
    }, [goToAbhaHome])
  );

  const { rekycSuccess, abhaExists, contactUpdated } = useLocalSearchParams<{

    rekycSuccess?: string;

    abhaExists?: string;

    contactUpdated?: string;

  }>();

  const [showReKYCSuccess, setShowReKYCSuccess] = React.useState(false);

  const [showExistingAbhaPopup, setShowExistingAbhaPopup] = React.useState(false);

  const [contactUpdateMessage, setContactUpdateMessage] = React.useState('');

  const rekycPopupHandled = React.useRef(false);

  const existingAbhaPopupHandled = React.useRef(false);

  const contactPopupHandled = React.useRef(false);

  // Show the Re-KYC confirmation once after arriving from OTP verification.

  React.useEffect(() => {

    if (rekycSuccess === 'true' && !rekycPopupHandled.current) {

      rekycPopupHandled.current = true;

      setShowReKYCSuccess(true);

      const timer = setTimeout(() => {

        setShowReKYCSuccess(false);

      }, 2000);

      return () => clearTimeout(timer);

    }

  }, [rekycSuccess]);

  // Show a one-time message when Aadhaar verification finds an existing ABHA.

  React.useEffect(() => {

    if (abhaExists === 'true' && !existingAbhaPopupHandled.current) {

      existingAbhaPopupHandled.current = true;

      setShowExistingAbhaPopup(true);

      const timer = setTimeout(() => {

        setShowExistingAbhaPopup(false);

      }, 2500);

      return () => clearTimeout(timer);

    }

  }, [abhaExists]);

  React.useEffect(() => {

    if (

      (contactUpdated === 'mobile' || contactUpdated === 'email') &&

      !contactPopupHandled.current

    ) {

      contactPopupHandled.current = true;

      setContactUpdateMessage(

        contactUpdated === 'mobile'

          ? 'Mobile number is updated successfully.'

          : 'Email ID is updated successfully.'

      );

      const timer = setTimeout(() => setContactUpdateMessage(''), 2500);

      return () => clearTimeout(timer);

    }

  }, [contactUpdated]);

  const profileData = useAbhaStore((state) => state.profileData);

  const savedAccounts = useAbhaStore((state) => state.data);

  const token = useAbhaStore((state) => state.token);

  const setProfileData = useAbhaStore((state) => state.setProfileData);

  const [accountApiData, setAccountApiData] = React.useState<any>(null);

  const profileFetchAttempted = React.useRef(false);

  // The direct "ABHA already exists" route may not contain preferredAbhaAddress.

  // Fetch the account details with the token returned during Aadhaar verification.

  React.useEffect(() => {

    const currentAddress =

      findAbhaAddress(profileData) ??

      findAbhaAddress(savedAccounts) ??

      findAbhaAddress(accountApiData);

    if (currentAddress || !token || profileFetchAttempted.current) {

      return;

    }

    profileFetchAttempted.current = true;

    const fetchAccountDetails = async () => {

      try {

        const response = await ABHA.get('enroll/profile/account', {

          headers: { token },

        });

        const responseData = response?.data ?? response;

        console.log('ABHA profile/account response:', responseData);

        setAccountApiData(responseData);

        setProfileData(responseData);

      } catch (error: any) {

        console.error(

          'Unable to fetch ABHA profile/account:',

          error?.response?.data ?? error?.message

        );

      }

    };

    fetchAccountDetails();

  }, [token, profileData, savedAccounts, accountApiData, setProfileData]);

  const account = React.useMemo(

    () =>

      getStoredAccount(profileData, savedAccounts) ??

      getStoredAccount(accountApiData, null),

    [profileData, savedAccounts, accountApiData]

  );

  const profileImageUri = getProfileImageUri(

    account?.kycPhoto ?? account?.profilePhoto ?? account?.photo

  );

  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);

  React.useEffect(() => {

    setImageLoadFailed(false);

  }, [profileImageUri]);

  const firstName = account?.firstName ?? account?.first_name ?? '';

  const lastName = account?.lastName ?? account?.last_name ?? '';

  const fallbackName = [firstName, lastName].filter(Boolean).join(' ');

  const fullName = account?.name ?? fallbackName ?? 'ABHA User';

  const safeFullName = fullName.trim() || 'ABHA User';

  const nameParts = safeFullName.split(/\s+/);

  const userName =

    nameParts.length >= 2

      ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`

      : safeFullName;

  const initials =

    userName

      .split(' ')

      .filter(Boolean)

      .slice(0, 2)

      .map((part: string) => part[0]?.toUpperCase())

      .join('') || 'AU';

  const abhaNumber =

    account?.ABHANumber ??

    account?.abhaNumber ??

    account?.abha_number ??

    'Not available';

  const abhaAddress =

    findAbhaAddress(accountApiData) ??

    findAbhaAddress(profileData) ??

    findAbhaAddress(savedAccounts) ??

    findAbhaAddress(account) ??

    'Not available';

  const quickActions = [

    { label: 'View ABHA\nCard', icon: 'idCard' },

    { label: 'Share Profile', icon: 'share' },

    { label: 'Link\nFacilities', icon: 'fileText' },

  ];

  const tabs = [

    { name: 'Home', icon: 'home' },

    { name: 'Link Facilities', icon: 'fileText' },

    { name: 'Consents', icon: 'shield' },

    { name: 'Profile', icon: 'user' },

  ];

  return (

    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* RE-KYC SUCCESS POPUP */}

      {showReKYCSuccess && (

        <View style={styles.successPopup}>

          <View style={styles.successIconCircle}>

            <Icon name="check" size={16} color="#FFFFFF" />

          </View>

          <Text style={styles.successPopupText}>

            Re-KYC is completed successfully.

          </Text>

        </View>

      )}

      {showExistingAbhaPopup && (

        <View style={styles.successPopup}>

          <View style={styles.successIconCircle}>

            <Icon name="check" size={16} color="#FFFFFF" />

          </View>

          <Text style={styles.successPopupText}>

            Your ABHA is already exists.

          </Text>

        </View>

      )}

            {!!contactUpdateMessage && (

        <View style={styles.successPopup}>

          <View style={styles.successIconCircle}>

            <Icon name="check" size={16} color="#FFFFFF" />

          </View>

          <Text style={styles.successPopupText}>{contactUpdateMessage}</Text>

        </View>

      )}

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.logoArea}>

          <TouchableOpacity

            onPress={goToAbhaHome}

            style={{ marginRight: 12, padding: 4 }}

            activeOpacity={0.7}

          >

            <Icon name="arrowLeft" size={24} color="#111827" />

          </TouchableOpacity>

          <View style={styles.logoIcon}>

            <Icon name="plus" size={16} color="#ffffff" />

          </View>

          <Text style={styles.logoText}>ABHA</Text>

        </View>

        <View style={styles.headerActions}>

          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>

            <Icon name="bell" size={20} color="#111827" />

          </TouchableOpacity>

          <TouchableOpacity

            style={styles.iconBtn}

            activeOpacity={0.7}

            onPress={() => router.push('/(home)/(tabs)/abha/abha_profile/settings')}

          >

            <Icon name="settings" size={20} color="#111827" />

          </TouchableOpacity>

        </View>

      </View>

      <ScrollView

        style={styles.scrollView}

        contentContainerStyle={styles.scrollContent}

        showsVerticalScrollIndicator={false}

      >

        {/* PREMIUM PROFILE CARD - PLATINUM/SILVER */}

        <LinearGradient

          colors={['#FFFFFF', '#F3F4F6', '#E5E7EB']} // Pearlescent light silver gradient

          start={{ x: 0, y: 0 }}

          end={{ x: 1, y: 1 }}

          style={styles.profileCard}

        >

          {/* Ambient Background Glows */}

          <View style={styles.cardGlowTopRight} />

          <View style={styles.cardGlowBottomLeft} />

          <View style={styles.cardTop}>

            <View style={styles.avatarRing}>

              <View style={styles.avatarCircle}>

                {profileImageUri && !imageLoadFailed ? (

                  <Image

                    source={{ uri: profileImageUri }}

                    style={styles.avatarImage}

                    resizeMode="cover"

                    onError={() => setImageLoadFailed(true)}

                  />

                ) : (

                  <Text style={styles.avatarText}>{initials}</Text>

                )}

              </View>

            </View>

            <View style={styles.userInfo}>

              <Text style={styles.userName}>{userName}</Text>

              <View style={styles.verifiedBadge}>

                <View style={styles.checkCircle}>

                  <Icon name="check" size={10} color="#FFFFFF" />

                </View>

                <Text style={styles.verifiedText}>ABHA Verified</Text>

              </View>

            </View>

          </View>

          <LinearGradient

            colors={['transparent', 'rgba(156, 163, 175, 0.4)', 'transparent']}

            start={{ x: 0, y: 0 }}

            end={{ x: 1, y: 0 }}

            style={styles.cardDivider}

          />

          <View style={styles.cardBottom}>

            <View style={styles.infoBlockVertical}>

              <Text style={styles.infoLabel}>ABHA NUMBER</Text>

              <Text style={styles.infoValue}>{abhaNumber}</Text>

            </View>

            <View style={styles.infoBlockVertical}>

              <Text style={styles.infoLabel}>ABHA ADDRESS</Text>

              <Text style={styles.infoValue}>{abhaAddress}</Text>

            </View>

          </View>

        </LinearGradient>

        {/* QUICK ACTIONS */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Quick actions</Text>

          <View style={styles.quickActionsGrid}>

            {quickActions.map((action, index) => (

              <TouchableOpacity

                key={index}

                style={styles.quickActionBtn}

                activeOpacity={0.8}

              >

                <View style={styles.actionIconWrapper}>

                  <Icon name={action.icon} size={20} color="#0f71c2" />

                </View>

                <Text style={styles.actionLabel}>{action.label}</Text>

              </TouchableOpacity>

            ))}

          </View>

        </View>

      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}

      <View style={styles.bottomTabContainer}>

        {tabs.map((tab) => {

          const isActive = tab.name === 'Home';

          return (

            <TouchableOpacity key={tab.name} style={styles.tabItem} activeOpacity={0.7}>

              <Icon

                name={tab.icon}

                size={22}

                color={isActive ? '#0f71c2' : '#6b7280'}

              />

              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>

                {tab.name}

              </Text>

            </TouchableOpacity>

          );

        })}

      </View>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#f7f9fc' },

  header: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingHorizontal: 24,

    paddingVertical: 16,

    backgroundColor: '#ffffff',

  },

  logoArea: { flexDirection: 'row', alignItems: 'center' },

  logoIcon: {

    width: 32,

    height: 32,

    backgroundColor: '#0f71c2',

    borderRadius: 8,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 8,

  },

  logoText: {

    fontSize: 18,

    fontWeight: '800',

    color: '#111827',

    letterSpacing: -0.5,

  },

  headerActions: { flexDirection: 'row', gap: 12 },

  iconBtn: {

    width: 36,

    height: 36,

    borderRadius: 18,

    backgroundColor: '#f3f4f6',

    alignItems: 'center',

    justifyContent: 'center',

  },

  scrollView: { flex: 1 },

  scrollContent: {

    paddingHorizontal: 24,

    paddingTop: 16,

    paddingBottom: 20,

  },

  // --- PREMIUM LIGHT GRAY CARD STYLES ---

  profileCard: {

    borderRadius: 20,

    padding: 22,

    marginBottom: 28,

    position: 'relative',

    overflow: 'hidden',

    borderWidth: 1,

    borderColor: '#E5E7EB',

    shadowColor: '#9CA3AF',

    shadowOffset: { width: 0, height: 12 },

    shadowOpacity: 0.25,

    shadowRadius: 20,

    elevation: 8,

  },

  cardGlowTopRight: {

    position: 'absolute',

    top: -40,

    right: -20,

    width: 140,

    height: 140,

    borderRadius: 70,

    backgroundColor: 'rgba(255, 255, 255, 0.6)',

  },

  cardGlowBottomLeft: {

    position: 'absolute',

    bottom: -60,

    left: -30,

    width: 160,

    height: 160,

    borderRadius: 80,

    backgroundColor: 'rgba(209, 213, 219, 0.3)',

  },

  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },

  avatarRing: {

    padding: 3,

    borderRadius: 32,

    borderWidth: 1,

    borderColor: 'rgba(156, 163, 175, 0.4)',

    backgroundColor: 'rgba(255, 255, 255, 0.5)',

    marginRight: 16,

  },

  avatarCircle: {

    width: 56,

    height: 56,

    borderRadius: 28,

    backgroundColor: '#E5E7EB',

    alignItems: 'center',

    justifyContent: 'center',

    overflow: 'hidden',

  },

  avatarImage: {

    width: 56,

    height: 56,

    borderRadius: 28,

  },

  avatarText: { color: '#4B5563', fontSize: 22, fontWeight: '700' },

  userInfo: { flex: 1 },

  userName: {

    color: '#111827',

    fontSize: 22,

    fontWeight: '800',

    letterSpacing: 0.5,

    marginBottom: 8,

  },

  // --- GREEN VERIFIED BADGE STYLES ---

  verifiedBadge: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Soft emerald glass background

    borderWidth: 1,

    borderColor: 'rgba(16, 185, 129, 0.3)', // Soft emerald border

    paddingHorizontal: 12,

    paddingVertical: 5,

    borderRadius: 20,

    alignSelf: 'flex-start',

  },

  checkCircle: {

    width: 16,

    height: 16,

    borderRadius: 8,

    backgroundColor: '#10B981', // Vibrant emerald green

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 6,

  },

  verifiedText: {

    color: '#047857', // Dark emerald green text for readability on light bg

    fontSize: 12,

    fontWeight: '600',

    letterSpacing: 0.2

  },

  cardDivider: {

    height: 1,

    width: '100%',

    marginBottom: 18,

  },

  cardBottom: { flexDirection: 'column', gap: 14 },

  infoBlockVertical: { width: '100%' },

  infoLabel: {

    color: '#6B7280',

    fontSize: 10,

    fontWeight: '600',

    letterSpacing: 1.2,

    marginBottom: 5,

    textTransform: 'uppercase',

  },

  infoValue: {

    color: '#1F2937',

    fontSize: 16,

    fontWeight: '700',

    letterSpacing: 1,

  },

  // --- REST OF THE PAGE STYLES ---

  section: { marginBottom: 28 },

  sectionTitle: {

    fontSize: 16,

    fontWeight: '700',

    color: '#111827',

    marginBottom: 16,

    letterSpacing: -0.2,

  },

  quickActionsGrid: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    gap: 12,

  },

  quickActionBtn: {

    flex: 1,

    backgroundColor: '#ffffff',

    borderWidth: 1,

    borderColor: '#edf2f7',

    borderRadius: 12,

    paddingVertical: 16,

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.02,

    shadowRadius: 4,

    elevation: 2,

  },

  actionIconWrapper: {

    width: 40,

    height: 40,

    borderRadius: 20,

    backgroundColor: '#e8f2fc',

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 12,

  },

  actionLabel: {

    fontSize: 12,

    fontWeight: '600',

    color: '#374151',

    textAlign: 'center',

    lineHeight: 16,

  },

  menuList: {

    backgroundColor: '#ffffff',

    borderWidth: 1,

    borderColor: '#edf2f7',

    borderRadius: 16,

    overflow: 'hidden',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.02,

    shadowRadius: 4,

    elevation: 2,

  },

  menuItem: {

    flexDirection: 'row',

    alignItems: 'center',

    padding: 16,

    borderBottomWidth: 1,

    borderBottomColor: '#edf2f7',

  },

  menuIconWrapper: {

    width: 36,

    height: 36,

    borderRadius: 10,

    backgroundColor: '#e8f2fc',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 16,

  },

  menuContent: { flex: 1 },

  menuTitle: {

    fontSize: 14,

    fontWeight: '600',

    color: '#111827',

    marginBottom: 2,

  },

  menuSubtitle: { fontSize: 12, color: '#6b7280' },

  menuChevron: { marginLeft: 12 },

  bottomTabContainer: {

    flexDirection: 'row',

    backgroundColor: '#ffffff',

    borderTopWidth: 1,

    borderTopColor: '#edf2f7',

    paddingBottom: 20,

    paddingTop: 12,

    paddingHorizontal: 10,

  },

  tabItem: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    gap: 4,

  },

  tabLabel: { fontSize: 10, fontWeight: '500', color: '#6b7280' },

  tabLabelActive: { color: '#0f71c2', fontWeight: '700' },

  // RE-KYC SUCCESS POPUP

  successPopup: {

    position: 'absolute',

    top: 65,

    left: 20,

    right: 20,

    zIndex: 9999,

    elevation: 10,

    backgroundColor: '#F0FDF4',

    borderColor: '#BBF7D0',

    borderWidth: 1,

    borderRadius: 12,

    paddingVertical: 15,

    paddingHorizontal: 16,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 3 },

    shadowOpacity: 0.12,

    shadowRadius: 5,

  },

  successIconCircle: {

    width: 24,

    height: 24,

    borderRadius: 12,

    backgroundColor: '#16A34A',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 10,

  },

  successPopupText: {

    color: '#15803D',

    fontSize: 14,

    fontWeight: '600',

  },

});
