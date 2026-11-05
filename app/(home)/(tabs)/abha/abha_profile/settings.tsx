import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { useRouter } from 'expo-router'; 

// ==========================================
// ICONS COMPONENT
// ==========================================
const Icon = ({ name, size = 24, color = '#000' }: { name: string; size?: number; color?: string }) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'chevronRight': return <Svg {...props}><Polyline points="9 18 15 12 9 6" /></Svg>;
    case 'arrowLeft': return <Svg {...props}><Line x1="19" y1="12" x2="5" y2="12" /><Polyline points="12 19 5 12 12 5" /></Svg>;
    case 'phone': return <Svg {...props}><Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Svg>;
    case 'mail': return <Svg {...props}><Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><Polyline points="22,6 12,13 2,6"/></Svg>;
    case 'shield': return <Svg {...props}><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><Polyline points="9 12 11 14 15 10"/></Svg>;
    case 'info': return <Svg {...props}><Circle cx="12" cy="12" r="10"/><Line x1="12" y1="16" x2="12" y2="12"/><Line x1="12" y1="8" x2="12.01" y2="8"/></Svg>;
    default: return null;
  }
};

// ==========================================
// SETTINGS SCREEN COMPONENT
// ==========================================
export default function SettingsScreen() {
  const router = useRouter(); 

  // 👇 Added `route` property to each item based on your file structure
  const settingsItems = [
    { title: 'Update mobile number', icon: 'phone', route: './edit_info/update_mobile' },
    { title: 'Update email', icon: 'mail', route: './edit_info/update_email' },
    { title: 'Re-KYC', icon: 'shield', route: './edit_info/re-kyc' },
    { title: 'Help & Support', icon: 'info', route: null }, // No route yet
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Icon name="arrowLeft" size={20} color="#0d529e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* ACCOUNT & SECURITY SECTION */}
        <Text style={styles.sectionTitle}>Account & security</Text>
        <View style={styles.card}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              // 👇 Navigate when clicked (if a route exists)
              onPress={() => item.route && router.push(item.route as any)}
              disabled={!item.route} // Disable if no route
              style={[
                styles.item, 
                index === settingsItems.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <View style={styles.iconWrapper}>
                <Icon name={item.icon} size={18} color="#0f71c2" />
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Icon name="chevronRight" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* DANGER ZONE SECTION */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerCardTitle}>Delete / Deactivate ABHA</Text>
          <Text style={styles.dangerCardSubtitle}>
            This action affects access to your ABHA account and connected services.
          </Text>
          <TouchableOpacity style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    marginBottom: 32,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e8f2fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 12,
  },
  dangerCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    padding: 16,
  },
  dangerCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#b91c1c',
    marginBottom: 6,
  },
  dangerCardSubtitle: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 18,
    marginBottom: 16,
  },
  dangerButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#b91c1c',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b91c1c',
  },
});