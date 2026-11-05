import { Stack } from "expo-router";
import React, { memo } from "react";
import { withTheme } from "react-native-paper";

function _layout({ theme }: any) {
  return <Stack screenOptions={{ headerShown: false, }} />;
}

export default memo(withTheme(_layout));
