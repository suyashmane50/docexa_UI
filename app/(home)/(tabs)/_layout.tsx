import React, { useState, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Icon } from "react-native-paper";
import { Tabs, router, usePathname } from "expo-router";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import TabBar from "@/components/TabBar";
import DrawerSceneWrapper from "@/components/DrawerSceneWrapper";

export const SetupIcon = (props: any) => {
  return <Ionicons name={props.name} size={props.size} color={props.color} />;
};

export default function TabLayout() {
  const [flag, setflag] = useState(true);
  const [animation] = useState(new Animated.Value(0));
  const pathname = usePathname();

  useEffect(() => {
    console.log("path", pathname);
    const recipePathRegex = /^\/recipe\/.+/;
    console.log("recipePathRegex", recipePathRegex.test(pathname));

    if (pathname === "/appointments") {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
    }

    if (
      pathname == "/home" ||
      pathname == "/abha" ||
      pathname == "/recipe" ||
      pathname == "/appointments" ||
      pathname == "/more"
    ) {
      setflag(true);
    } else {
      setflag(false);
    }
  }, [pathname]);

  return (
    <DrawerSceneWrapper>
      <Tabs
        tabBar={(props) => flag && <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: flag ? "flex" : "none",
            height: 58,
          },
          tabBarLabelStyle: {
            fontFamily: "Nunito_600SemiBold",
            // color: "black",
            marginBottom: 6,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons size={22} name="home" color={color} />
            ),
          }}
        />

       <Tabs.Screen
          name="abha"
          options={{
            title: "ABHA",
            tabBarIcon: ({ color }) => (
              <Icon
                source="abha"
                size={22}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              if (pathname === "/abha") {
                return;
              }
              e.preventDefault();
              router.replace("/abha");
            },
          }}
        />

        <Tabs.Screen
          name="appointments"
          options={{
            title: "Appointment",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  position: "absolute",
                  bottom: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  height: 56,
                  width: 56,
                  borderRadius: 999,
                  backgroundColor: focused ? color : "#F02A4B",
                }}
              >
                <Icon
                  size={22}
                  source={focused ? "plus" : "plus"}
                  color={"white"}
                />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              // Avoid internal POP_TO_TOP when pressing the tab
              // and normalize navigation to the appointments root.
              if (pathname !== "/appointments") {
                e.preventDefault();
                router.push("/appointments");
              }
            },
          }}
        />

        {/* Temporarily hide Recipe tab */}
        {/*
        <Tabs.Screen
          name="recipe"
          options={{
            title: "Recipe",
            tabBarIcon: ({ color }) => (
              <Icon
                size={22}
                source={require("../../../assets/images/screens/recipe/calories.png")}
                color={color}
              />
            ),
          }}
        />
        */}
        <Tabs.Screen
          name="more"
          options={{
            title: "About",
            tabBarIcon: ({ color }) => (
              <Icon size={22} source="dots-horizontal-circle" color={color} />
            ),
          }}
        />
      </Tabs>
    </DrawerSceneWrapper>
  );
}
