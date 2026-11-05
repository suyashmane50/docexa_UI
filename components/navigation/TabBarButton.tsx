import React, { useEffect } from "react";
import { Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Icons } from "./TabBarIcon";
import Animated, {
  useSharedValue,
} from "react-native-reanimated";
import { useTheme } from "react-native-paper";
import { isSmallDevice, responsiveFontSize } from "@/utils/common";

function TabBarButton({
  onPress,
  onLongPress,
  routerName,
  isFocused,
  label,
}: any) {
  const scale = useSharedValue(0);
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const smallDevice = isSmallDevice();
  
  useEffect(() => {
    scale.value = typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused;
  }, [scale, isFocused]);

  const iconSize = smallDevice ? 20 : width < 414 ? 21 : 22;
  const fontSize = responsiveFontSize(smallDevice ? 9 : 11);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.tabbarItem, { flex: 1 }]}
    >
      {Icons[routerName]({ 
        color: isFocused ? theme.colors.primary : "grey",
        size: iconSize,
      })}
      {!smallDevice && (
        <Animated.Text
          style={[
            {
              color: isFocused ? theme.colors.primary : "grey",
              fontFamily: "Nunito_700Bold",
              fontSize: fontSize,
              marginTop: 2,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabbarItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    minWidth: 50,
  },
});

export default TabBarButton;
