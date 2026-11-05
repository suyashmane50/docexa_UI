import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import { responsiveFontSize, scale, verticalScale } from "@/utils/common";

export default function TermsAndConditions() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            Welcome to our patient application. By using this app, you agree to
            the following terms and conditions. Please read them carefully
            before using our services.
          </Text>

          <Text style={styles.sectionTitle}>1. Use of Application</Text>
          <Text style={styles.paragraph}>
            This application helps patients manage appointments, view reports,
            and communicate with healthcare providers. You must use the app only
            for lawful purposes.
          </Text>

          <Text style={styles.sectionTitle}>2. Medical Disclaimer</Text>
          <Text style={styles.paragraph}>
            The information provided in this application is not a substitute for
            professional medical advice. Always consult your doctor for medical
            concerns.
          </Text>

          <Text style={styles.sectionTitle}>3. Privacy</Text>
          <Text style={styles.paragraph}>
            Your personal and medical data is handled securely. We respect your
            privacy and do not share data without consent unless required by
            law.
          </Text>

          <Text style={styles.sectionTitle}>4. Updates to Terms</Text>
          <Text style={styles.paragraph}>
            These terms may be updated occasionally. Continued use of the app
            means you accept the updated terms.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={() => router.push("/auth")}
        >
          I Have Read & Agree
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  header: {
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(15),
    backgroundColor: "#ffffff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  headerTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: responsiveFontSize(20),
  },

  scrollContent: {
    padding: scale(16),
    paddingBottom: verticalScale(120),
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: scale(14),
    padding: scale(16),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: responsiveFontSize(15),
    marginTop: verticalScale(12),
  },

  paragraph: {
    fontFamily: "Nunito_400Regular",
    fontSize: responsiveFontSize(14),
    lineHeight: 22,
    color: "#555",
    marginTop: verticalScale(6),
  },

  bottomContainer: {
    position: "absolute",
    bottom: verticalScale(20),
    left: scale(16),
    right: scale(16),
  },

  button: {
    borderRadius: scale(12),
    paddingVertical: verticalScale(4),
  },

  buttonLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: responsiveFontSize(15),
  },
});
