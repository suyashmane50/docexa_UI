import { theme } from "@/utils/theme";
import { Stack } from "expo-router";

import React from "react";
import { useTheme } from "react-native-paper";

function _layout() {
  const theme = useTheme();
  return <Stack
    screenOptions={{
      headerShown: false
    }} />

  // <Stack screenOptions={{
  //   headerShown: true, headerTitle: "Telephonic Appointment", headerTintColor: theme.colors.primary,
  //   headerTitleStyle: {
  //     fontSize: 19,
  //     fontFamily: "Nunito_700Bold",
  //   },
  // }} />;
}

export default _layout;
