import React, { useEffect } from "react";
import { TextInput, Button, HelperText, IconButton } from "react-native-paper";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { scale, verticalScale, responsiveFontSize } from "@/utils/common";
import * as Linking from "expo-linking";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "@/config";
import {
  setAuth,
  setDoctorId,
  setMobileNumber,
} from "../store/auth/authReducer";
import { authImages } from "@/config/imageRegistry";
import { VerifyMobileNumber } from "../store/auth/authReducer";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { Image } from "expo-image";
import { router } from "expo-router";
import { AppDispatch } from "@/store";
import config_new from "@/config";
// import { color } from "@rneui/base";
export const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

function Auth({ navigation, theme }: any) {
  const { width, height } = useWindowDimensions();
  const dispatch: AppDispatch = useDispatch();
  const {
    isSuccess,
    isLoading,
    isError,
    mobileNumber,
    mobileNumberError,
    doctor_id,
    authToken,
    isLoggedIn,
    message,
    data,
  } = useSelector((state: any) => state.auth);

  // useEffect(() => {
  //   const authenticate = async () => {
  //     const value = await AsyncStorage.getItem("id");
  //     console.log("id", value);
  //     if (value) {
  //       router.navigate("/(home)/(tabs)");
  //     }
  //   };
  //   authenticate();
  // }, [authToken]);

  // useEffect(() => { console.log('doctor_id', doctor_id) }, [doctor_id])

  useEffect(() => {
    const authenticate = async () => {
      // dispatch(setDoctorId(1));
      dispatch(setDoctorId(config.app_id));
      const value: any = await AsyncStorage.getItem("id");
      console.log("value of patinet", value);
      if (value) {
        dispatch(setAuth(value));
        router.push("/(home)/(tabs)/appointments");
      }
    };

    authenticate();
    if (isError) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Error",
        textBody: message,
      });
    }

    // if (isSuccess) {
    //   router.push("/otp");
    //   dispatch({ type: "auth/resetAuthState" });
    // }
    return () => {};
  }, [isError, isSuccess]);

  const getOtp = () => {
    if (mobileNumber?.length == 10 && !mobileNumberError) {
      dispatch(VerifyMobileNumber());
      router.push("/otp");
    } else {
      // dispatch(setMobileNumber(""));
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Enter Valid Mobile Number",
      });
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Image
        style={[styles.image, { width: width, height: height * 0.45 }]}
        source={authImages[config.app_id]}
        // source={require("../assets/images/screens/inner_bg.png")}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={700}
      />
      <View style={styles.formContainer}>
        <View>
          <Text style={styles.heading}>{config.app.name}</Text>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Log in or sign up</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter Phone Number"
              contentStyle={styles.inputContent}
              mode="outlined"
              keyboardType="numeric"
              maxLength={10}
              error={mobileNumberError}
              left={<TextInput.Icon icon="phone" disabled />}
              style={styles.textInput}
              value={mobileNumber}
              onChangeText={(text) => dispatch(setMobileNumber(text))}
            />

            <HelperText
              style={[
                styles.helpertext,
                { display: mobileNumberError ? "flex" : "none" },
              ]}
              type="error"
              visible={true}
            >
              Enter Valid Mobile Number
            </HelperText>
            <Button
              loading={isLoading}
              disabled={isLoading}
              style={styles.btn}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.btncontent}
              mode="contained"
              onPress={getOtp}
            >
              Get OTP
            </Button>
          </View>
        </View>

        {/* <View style={[styles.dividerContainer]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View> */}

        {/* <WebGoogleSigninButton onPress={()=> console.log("hii")}/> */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={[
              styles.text,
              { marginVertical: 2, textDecorationLine: "none" },
            ]}
          >
            By continuing, you agree to our
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              style={styles.button}
              onPress={() => {
                router.push("/extra_pages/terms_and_conditions");
              }}
              // onPress={() => {
              //   Linking.openURL("https://spiritualkarma.in/terms");
              // }}
            >
              <Text style={styles.text}>Terms of Service</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { marginStart: 12 }]}
              onPress={() => {
                // Linking.openURL("https://spiritualkarma.in/privacy-policy");
                router.push("/extra_pages/terms_and_conditions");
              }}
            >
              <Text style={styles.text}>Privacy Policy</Text>
            </Pressable>
          </View>
          <View style={styles.backButtonContainer}>
            <IconButton
              icon="arrow-left"
              size={26}
              onPress={() => router.push("/")}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
export default Auth;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    // Dynamic sizing applied inline
  },
  formContainer: {
    padding: scale(18),
    borderTopLeftRadius: scale(25),
    borderTopRightRadius: scale(25),
    width: "100%",
    flex: 1,
    // justifyContent: "space-between",
  },
  heading: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: responsiveFontSize(26),
    textAlign: "center",
    // marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(8),
    justifyContent: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1.4,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: scale(8),
    fontFamily: "Nunito_700Bold",
    fontSize: responsiveFontSize(14),
    color: "#616161",
  },
  inputContainer: {
    width: "100%",
    marginVertical: verticalScale(6),
  },
  inputContent: {
    fontFamily: "Nunito_700Bold",
    color: "#5C5470",
    fontSize: responsiveFontSize(16),
  },
  textInput: {
    marginVertical: verticalScale(8),
  },
  btn: {
    width: "100%",
    borderRadius: scale(14),
    marginTop: verticalScale(8),
  },
  buttonLabel: {
    fontFamily: "Nunito_900Black",
    color: "white",
    fontSize: responsiveFontSize(16),
  },
  btncontent: {
    paddingVertical: verticalScale(5),
    fontFamily: "Nunito_900Black",
  },
  helpertext: {
    fontFamily: "Nunito_700Bold",
    fontSize: responsiveFontSize(12),
  },
  text: {
    textDecorationLine: "underline",
    fontFamily: "Nunito_700Bold",
    fontSize: responsiveFontSize(13),
    color: "#616161",
  },
  backButtonContainer: {
    position: "absolute",
    bottom: verticalScale(10),
    left: scale(10),
  },

  button: {},
});
