import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "@/components/navigation/CustomDrawerContent";
import { memo, useEffect } from "react";
import { withTheme, Icon } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { getUserInfo } from "@/store/auth/UserSlice";

function Layout({ theme }: any) {
  const dispatch: AppDispatch = useDispatch();
  useEffect(() => {
    const authenticate = async () => {
      const value = await AsyncStorage.getItem("id");
      const user_map_id_from_local = await AsyncStorage.getItem("user_map_id");
      console.log("Value", value);
      if (!value) {
        router.push("/auth");
      } else {
        if (user_map_id_from_local != null) {
          // dispatch(getUserInfo(Number(value)));
          const data = {
            user_map_id: Number(user_map_id_from_local),
            id: Number(value),
          };

          console.log("user_map_id_from_local +  : ", user_map_id_from_local);

          // dispatch(getUserInfo(data));
        }
      }
    };
    authenticate();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, overflow: "hidden" }}>
      <Drawer
        // screenOptions={{
        //   headerShown: false,
        //   drawerLabelStyle: {
        //     marginLeft: -20,
        //   },
        //   // overlayColor: "transparent",
        //   swipeEnabled: true,
        //   drawerType: 'slide',
        // }}
        // drawerContent={CustomDrawerContent}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveBackgroundColor: theme.colors.primary,
          drawerInactiveBackgroundColor: "transparent",
          drawerActiveTintColor: "white",
          drawerInactiveTintColor: "white",
          drawerHideStatusBarOnOpen: true,
          overlayColor: "transparent",
          drawerStyle: {
            backgroundColor: theme.colors.primary,
            width: "60%",
          },
          // sceneContainerStyle: {
          //   backgroundColor: theme.colors.primary,
          // },
          drawerType: "slide",
          drawerLabelStyle: {
            fontFamily: "Nunito_700Bold",
            fontSize: 14.5,
          },
          swipeEnabled: true,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Home",
            drawerIcon: ({ color }) => (
              <Icon source="home-outline" color={color} size={24} />
            ),
            drawerLabelStyle: {
              fontFamily: "Nunito_700Bold",
            },
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: "Settings",
            drawerIcon: ({ color }) => (
              <Icon source="cog" color={color} size={24} />
            ),
            drawerLabelStyle: {
              fontFamily: "Nunito_700Bold",
            },
          }}
        />
      </Drawer>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

export default memo(withTheme(Layout));
