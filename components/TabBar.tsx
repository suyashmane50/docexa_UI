import { View, StyleSheet, useWindowDimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBarButton from "./navigation/TabBarButton";
import { useTheme } from "react-native-paper";
import { scale, verticalScale } from "@/utils/common";
import { TabIconName } from "@/assets/icons";

function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  
  return (
    <View style={styles.container}>
      <View style={[styles.tabbar, { paddingHorizontal: scale(12), paddingVertical: verticalScale(8) }]}>
        {state.routes
          // Hide recipe tab from bottom navigation (can still be accessed via deep links)
          .filter((route) => route.name !== "recipe")
          .map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title ?? route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TabBarButton
              key={route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              isFocused={isFocused}
              routerName={route.name as TabIconName}
              color={isFocused ? theme.colors.primary : "#222"}
              label={label}
            />
          );
        })}
      </View>
    </View>
  );
}

export default TabBar;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(8),
    paddingBottom: verticalScale(6),
  },
  tabbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  tabbarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
