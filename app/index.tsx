import React, { memo, useEffect } from "react";
import {
  ImageBackground,
  Text,
  View,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { landingImages } from "@/config/imageRegistry";
import { Button, withTheme } from "react-native-paper";
import { router, useGlobalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import {
  setAuth,
  setAuthMobileNumber,
  setDoctorId,
} from "../store/auth/authReducer";
import { scale, verticalScale, responsiveFontSize } from "@/utils/common";
import config from "@/config";
function Home() {
  const { width, height } = useWindowDimensions();
  const dispatch = useDispatch();
  const { key } = useGlobalSearchParams<{ key?: string }>();

  useEffect(() => {
    const authenticate = async () => {
      // dispatch(setDoctorId(1));
      dispatch(setDoctorId(config.app_id));
      console.warn("sat doctor id to : ", config.app_id);

      const value: any = await AsyncStorage.getItem("id");

      const mobile_no_backup: any = await AsyncStorage.getItem("user_mobile");
      console.log("value of patinet", value);
      console.log("value of mobile number", mobile_no_backup);
      if (value && mobile_no_backup) {
        dispatch(setAuth(value));
        dispatch(setAuthMobileNumber(mobile_no_backup));
        router.push("/(home)/(tabs)/appointments");
      }
    };

    authenticate();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        // source={require("../assets/images/landing_page/image.png")}
        source={landingImages[config.app_id]}
        style={[styles.image, { width: width, height: height }]}
      >
        <View style={styles.content}>
          <View style={styles.nameContainer}>
            {/* <Text style={styles.doctorPrefix}>Dr.</Text>
            <Text style={styles.doctorName}>Surendra</Text>
            <Text style={styles.doctorName}>Dahatonde</Text> */}
            <Text style={styles.doctorPrefix}>{config.info.Dr_prefix}</Text>
            <Text style={styles.doctorName}>{config.info.Dr_name}</Text>
            <Text style={styles.doctorName}>{config.info.Dr_surname}</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {/* <Link href="auth" asChild>  */}
            <Button
              mode="contained"
              style={{
                width: "100%",
                maxWidth: 400,
                borderRadius: scale(12),
                marginBottom: 40,
              }}
              labelStyle={{
                fontFamily: "Nunito_800ExtraBold",
                color: "white",
                fontSize: responsiveFontSize(16),
              }}
              contentStyle={[
                styles.btncontent,
                { paddingVertical: verticalScale(5) },
              ]}
              // onPress={() => navigation.navigate("Auth")}
              onPress={() => router.push("/auth")}
            >
              Log in or Sign up
            </Button>
            {/* </Link> */}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

export default memo(withTheme(Home));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    // height: ,
  },
  image: {
    justifyContent: "flex-end",
    alignItems: "center",
    objectFit: "cover",
    // width and height applied inline
  },
  content: {
    padding: scale(12),
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  heading: {
    color: "black",
    fontSize: responsiveFontSize(40),
    textAlign: "left",
    fontFamily: "Nunito_600SemiBold",
    width: "100%",
    marginVertical: verticalScale(28),
  },
  btncontent: {
    // paddingVertical applied inline
    borderRadius: scale(12),
  },
  description: {
    // marginVertical: 28,
    textAlign: "left",
    fontFamily: "Nunito_500Medium",
    color: "white",
    fontSize: responsiveFontSize(17),
  },
  nameContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.85)", // white transparent background
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: scale(12),

    // shadow for better look
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,

    elevation: 4, // android shadow
    marginStart: scale(8),
    marginBottom: verticalScale(10),
  },

  doctorPrefix: {
    color: "#000",
    fontSize: responsiveFontSize(18),
    fontFamily: "Nunito_600SemiBold",
    letterSpacing: 1,
  },

  doctorName: {
    color: "#000",
    fontSize: responsiveFontSize(36),
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 1,
    lineHeight: 40,
  },

  doctorSurname: {
    color: "#000",
    fontSize: responsiveFontSize(36),
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 1,
    lineHeight: 40,

    // makes text pop on image
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
});

// import * as React from "react";
// import { StyleSheet, View, StatusBar, Image } from "react-native";

// const FlashScreen = () => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.logoContainer}>
//         <Image
//           source={require("../assets/images/screens/background-image.png")}
//           style={styles.logo}
//         />
//       </View>
//     </View>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "white",
//   },
//   logo: {
//     width: "100%",
//     height: "100%",
//   },
//   logoContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     width: "100%",
//     height: "100%",
//     // backgroundColor: 'red'
//   },
//   text: {
//     color: "white",
//     fontSize: 20,
//   },
// });

// export default FlashScreen;
