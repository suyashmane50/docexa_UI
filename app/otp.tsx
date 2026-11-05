import React, { memo, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  BackHandler,
  StyleSheet,
  Pressable,
} from "react-native";
import { withTheme } from "react-native-paper";
import { OtpInput } from "react-native-otp-entry";
import { useRouter } from "expo-router";
// import messaging from "@react-native-firebase/messaging";
import { useDispatch, useSelector } from "react-redux";
import { VerifyMobileNumber, setAuth } from "../store/auth/authReducer";
import { VerifyOtp } from "../store/auth/otpReducer";
import { saveToLocalStorage } from "../utils/common";
import { AppDispatch } from "@/store";

function Otp({ theme }: any) {
  const router = useRouter();
  const otpRef: any = useRef<any>(null);
  const dispatch: AppDispatch = useDispatch();
  const { mobileNumber } = useSelector((state: any) => state.auth);
  const { isSuccess, isError, data, isRegisterd } = useSelector(
    (state: any) => state.otp,
  );

  // y -- timer for otp resend -- (T)
  const [timer, setTimer] = React.useState(30);
  const [isResendDisabled, setIsResendDisabled] = React.useState(true);
  useEffect(() => {
    if (timer === 0) {
      setIsResendDisabled(false);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);
  const handleResendOtp = () => {
    dispatch(VerifyMobileNumber());

    setTimer(30);
    setIsResendDisabled(true);
  };
  // y -- timer for otp resend -- (B)

  useEffect(() => {
    const backAction = () => {
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  const save = async () => {
    try {
      if (isRegisterd) {
        console.log("data: ", data);
        console.warn("is_registered: ", isRegisterd);

        saveToLocalStorage("id", data.id);
        saveToLocalStorage("user_mobile", mobileNumber);
        console.log("id for local storage: ", data.id);

        dispatch(setAuth(data.id));
        router.dismiss(2);
        router.navigate("/(home)/(tabs)/home");
      } else {
        router.push("/register");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      save();
    } else if (isError) {
      // Toast.show({
      //   type: ALERT_TYPE.WARNING,
      //   title: "Error",
      //   textBody: message,
      // });
    }
    if (otpRef.current) {
      otpRef.current.value = "";
    }

    return () => {};
  }, [isSuccess, isError]);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", height: "100%" }}>
        <View>
          <Text
            style={{
              color: "black",
              fontFamily: "Nunito_700Bold",
              fontSize: 26,
              textAlign: "center",
            }}
          >
            OTP Verification
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "black",
                fontFamily: "Nunito_400Regular",
                fontSize: 15,
                marginVertical: 8,
              }}
            >
              OTP just sent to ******{mobileNumber.slice(6, 10)}
            </Text>
          </View>
        </View>
        <View style={{ marginVertical: 30, width: "100%" }}>
          <OtpInput
            ref={otpRef}
            type="numeric"
            numberOfDigits={6}
            focusColor={theme.colors.primary}
            focusStickBlinkingDuration={500}
            onFilled={(text) => {
              dispatch(VerifyOtp(text));
            }}
            theme={{
              pinCodeContainerStyle: {
                backgroundColor: "#f2f2f2",
                borderColor: theme.colors.primary,
                width: "15.5%",
              },
              pinCodeTextStyle: {
                color: "black",
                fontFamily: "Nunito_400Regular",
              },
            }}
          />
        </View>

        {/* y -- resend otp -- (T) */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color: "black",
              textAlign: "center",
              fontFamily: "Nunito_600SemiBold",
              fontSize: 15,
              marginVertical: 8,
            }}
          >
            Didn't get the otp?
          </Text>

          {isResendDisabled ? (
            <Text
              style={{
                marginHorizontal: 5,
                fontSize: 16,
                color: "red",
                fontFamily: "Nunito_700Bold",
              }}
            >
              Resend in {timer}s
            </Text>
          ) : (
            <Pressable onPress={handleResendOtp}>
              <Text
                style={{
                  textDecorationLine: "underline",
                  fontFamily: "Nunito_700Bold",
                  color: theme.colors.primary,
                  marginHorizontal: 5,
                  fontSize: 16,
                }}
              >
                Resend
              </Text>
            </Pressable>
          )}
        </View>
        {/* y -- resend otp -- (B) */}

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color: "black",
              textAlign: "center",
              fontFamily: "Nunito_600SemiBold",
              fontSize: 14,
              marginVertical: 12,
            }}
          >
            Do you want to change Mobile Number?
          </Text>
          <Pressable onPress={() => router.push("/auth")}>
            <Text
              style={{
                textDecorationLine: "underline",
                fontFamily: "Nunito_700Bold",
                color: theme.colors.primary,
                marginHorizontal: 5,
                fontSize: 16,
              }}
            >
              Click here
            </Text>
          </Pressable>
        </View>
        {/* <View style={{ flexDirection: 'row', marginVertical: 26, width: '100%', justifyContent: 'center' }}>
                    <Button mode="contained" icon="phone-remove"
                        labelStyle={{
                            // fontSize: 15,
                            fontFamily: 'Nunito_700Bold'
                        }}
                        style={{
                            width: '48%',
                            padding: 8,
                            borderRadius: 50,
                        }}
                        onPress={() => {
                            setEditPhoneNumberVisible(true)
                        }}>
                        Edit Mobile
                    </Button>
                </View> */}
        {/* <Portal>
          <Dialog
            visible={EditPhoneNumberVisible}
            dismissable={false}
            style={{ backgroundColor: "#ffffff", paddingHorizontal: 25 }}
          >
            <Dialog.Icon icon="alert" color="orange" size={40} />
            <Dialog.Title
              style={{
                textAlign: "left",
                color: "black",
                fontFamily: "Nunito_700Bold",
              }}
            >
              Edit Mobile Number
            </Dialog.Title>
            <Dialog.Content>
              <Text
                style={{
                  textAlign: "left",
                  fontFamily: "Nunito_400Regular",
                  color: "black",
                }}
                variant="bodyMedium"
              >
                Are you sure you want to Edit Mobile Number?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                style={{
                  width: "25%",
                  padding: 2,
                  borderRadius: 50,
                }}
                // onPress={() => setEditPhoneNumberVisible(false)}
              >
                No
              </Button>
              <Button
                style={{
                  width: "25%",
                  padding: 2,
                  borderRadius: 50,
                }}
                mode="contained"
                onPress={() => {
                  navigation.goBack();
                }}
              >
                Yes
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal> */}
      </View>
    </View>
  );
}

export default memo(withTheme(Otp));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 22,
    backgroundColor: "white",
  },
});
