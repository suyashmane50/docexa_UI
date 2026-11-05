/* eslint-disable react-native/no-inline-styles */
import React, { memo } from "react";
import { View, Dimensions } from "react-native";
import { withTheme, ActivityIndicator, MD3Theme } from "react-native-paper";

function Loading({ theme }: { theme: MD3Theme }) {
  return (
    <View
      style={{
        height: Dimensions.get("window").height,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
      </View>
    </View>
  );
}

export default memo(withTheme(Loading));
