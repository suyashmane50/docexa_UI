import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

const FullScreenLoader = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>Saving...</Text>
    </View>
  );
};

export default FullScreenLoader;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 12,
    color: "#fff",
    fontSize: 16,
  },
});
