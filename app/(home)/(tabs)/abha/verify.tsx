import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type VerificationCardProps = {
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
};

const VerificationCard = ({
  title,
  subtitle,
  iconName,
  onPress,
}: VerificationCardProps) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={iconName}
          size={24}
          color="#0A5898"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>

        <Text style={styles.cardSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#9CA3AF"
      />
    </TouchableOpacity>
  );
};

type ListItemProps = {
  title: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  isLast?: boolean;
};

const ListItem = ({
  title,
  iconName,
  onPress,
  isLast,
}: ListItemProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.listItem,
        !isLast && styles.listItemBorder,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.listItemLeft}>
        <Ionicons
          name={iconName}
          size={20}
          color="#0A5898"
          style={styles.listIcon}
        />

        <Text style={styles.listTitle}>
          {title}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#9CA3AF"
      />
    </TouchableOpacity>
  );
};

export default function VerificationMethodScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="#1F2937"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Verify your ABHA
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>
          Choose a verification method
        </Text>

        <Text style={styles.mainSubtitle}>
          Select how you want to securely access your ABHA.
        </Text>

        {/* VERIFICATION CARDS */}

        <View style={styles.cardsSection}>
          <VerificationCard
            title="Using Aadhaar"
            subtitle="Verify using your Aadhaar number."
            iconName="finger-print-outline"
            onPress={() =>
              router.push('/abha/login/using_adhar')
            }
          />

          <VerificationCard
            title="Using ABHA Number"
            subtitle="Verify using your ABHA Number."
            iconName="phone-portrait-outline"
            onPress={() =>
              router.push('/abha/login/using_abha')
            }
          />

          <VerificationCard
            title="Find ABHA Using mobile number"
            subtitle="Find ABHA using your communication mobile number."
            iconName="search-outline"
            onPress={() =>
              router.push('/abha/login/using_mobile')
            }
          />
        </View>

        {/* OTHER OPTIONS */}

        <Text style={styles.sectionTitle}>
          Other verification options
        </Text>

        <View style={styles.listContainer}>
          <ListItem
            title="ABHA Number or Address"
            iconName="card-outline"
          />

          <ListItem
            title="Scan ABHA QR code"
            iconName="qr-code-outline"
            isLast={true}
          />
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

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

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },

  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },

  mainSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
    paddingRight: 20,
  },

  cardsSection: {
    gap: 12,
    marginBottom: 32,
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
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  textContainer: {
    flex: 1,
    paddingRight: 8,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },

  listContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  listIcon: {
    marginRight: 12,
  },

  listTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
});