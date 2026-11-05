import React, { useCallback, useEffect } from "react";
import StoreProvider from "../store/StoreProvider";
import { Slot } from "expo-router";
import "react-native-reanimated";
import * as Updates from "expo-updates";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
// GoogleSignin.configure();
import "../global.css";
import { registerTranslation } from "react-native-paper-dates";
// registerTranslation("en-GB", enGB);
// import { registerTranslation } from 'react-native-paper-dates'

registerTranslation("en", {
  save: "Save",
  selectSingle: "Select date",
  selectMultiple: "Select dates",
  selectRange: "Select period",
  notAccordingToDateFormat: (inputFormat) =>
    `Date format must be ${inputFormat}`,
  mustBeHigherThan: (date) => `Must be later than ${date}`,
  mustBeLowerThan: (date) => `Must be earlier than ${date}`,
  mustBeBetween: () => `Invalid date`,
  dateIsDisabled: "Day is not allowed",
  previous: "Previous",
  next: "Next",
  typeInDate: "Type in date",
  pickDateFromCalendar: "Pick date from calendar",
  close: "Close",
  hour: "Hour",
  minute: "Minute",
});

import {
  useFonts,
  Nunito_200ExtraLight,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  Nunito_200ExtraLight_Italic,
  Nunito_300Light_Italic,
  Nunito_400Regular_Italic,
  Nunito_500Medium_Italic,
  Nunito_600SemiBold_Italic,
  Nunito_700Bold_Italic,
  Nunito_800ExtraBold_Italic,
  Nunito_900Black_Italic,
} from "@expo-google-fonts/nunito";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/utils/theme";

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    Nunito_200ExtraLight,
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Nunito_200ExtraLight_Italic,
    Nunito_300Light_Italic,
    Nunito_400Regular_Italic,
    Nunito_500Medium_Italic,
    Nunito_600SemiBold_Italic,
    Nunito_700Bold_Italic,
    Nunito_800ExtraBold_Italic,
    Nunito_900Black_Italic,
  });

  // Check for OTA updates
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        // You can also add an alert() to see the error message in case of an error when fetching updates.
        console.log(`Error fetching update: ${error}`);
      }
    }

    // Only check for updates in production builds
    if (!__DEV__ && Updates.isEnabled) {
      onFetchUpdateAsync();
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <StoreProvider>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
            {fontsLoaded && (
              // <Stack screenOptions={{ headerShown: false }}>
              //   <Stack.Screen name="index" />
              //   <Stack.Screen name="auth" />
              //   <Stack.Screen name="otp" />
              //   <Stack.Screen name="(home)" />
              //   <Stack.Screen name="+not-found" />
              // </Stack>
              <Slot />
            )}
          </SafeAreaView>
        </PaperProvider>
      </SafeAreaProvider>
    </StoreProvider>
  );
}
