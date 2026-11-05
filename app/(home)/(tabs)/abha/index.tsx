import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

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
        color="#0A5898"
      />
    </TouchableOpacity>
  );
};

export default function AbhaLandingScreen() {
  const router = useRouter();

  return (
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
        {/* LOGO SECTION */}

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});