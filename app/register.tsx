import React, { useState, useEffect } from "react";
import {
  withTheme,
  TextInput,
  Button,
  HelperText,
  IconButton,
} from "react-native-paper";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { blurhash } from "../utils/common";
import { useDispatch, useSelector } from "react-redux";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import {
  setShowCalender,
  setDate,
  setName,
  setDateError,
  setNameError,
  PostRegister,
} from "../store/auth/registerReducer";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { DatePickerInput } from "react-native-paper-dates";
import { encode, decode, convertDateToYYYYMMDD, saveToken } from "../utils/common";
import { router } from "expo-router";
import { resetOtp } from "../store/auth/otpReducer";
import { resetRegister } from "../store/auth/registerReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppDispatch } from "@/store";
import { setAuth } from "@/store/auth/authReducer";

const { width, height } = Dimensions.get("window");
function register() {
  const [date, setdate] = useState(undefined);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dispatch: AppDispatch = useDispatch();
  const {
    isSuccess,
    isLoading,
    isError,
    data,
    message,
    name,
    nameError,
    // date,
    dob,
    dateError,
  } = useSelector((state: any) => state.register);

  useEffect(() => {
    const authenticate = async () => {
      const value = await AsyncStorage.getItem("id");
      console.log("Value", value);
      if (value) {
        router.navigate("/home");
      }
    };
   authenticate();
  }, []);

  useEffect(() => {
    if (isError) {
      //   Toast.show({
      //     type: ALERT_TYPE.WARNING,
      //     title: "Error",
      //     textBody: message,
      //   });
    }

    // if (isSuccess) {
    //   saveToken(data.token);
    //   const payload = {
    //     id: null,
    //     authToken: data.token,
    //   };
    //   // dispatch(setAuth(id));
    //   dispatch(resetOtp());
    //   dispatch(resetRegister());
    //   router.navigate("/(home)");
    // }
    return () => { };
  }, [isError, isSuccess]);

  const { mobileNumber } = useSelector((state: any) => state.auth);

  const onConfirmDate = (value: any) => {
    setdate(value);
    const desired_date = convertDateToYYYYMMDD(value);
    dispatch(setDate(desired_date));
    hideDate();
  };

  const hideDate = () => {
    dispatch(setShowCalender(false));
  };

  const onSubmit = () => {
    try {
      let error = false;
      if (!date) {
        error = true;
        dispatch(setDateError(true));
      }
      if (!name && name?.length < 4) {
        error = true;
        dispatch(setNameError(true));
      }

      console.log(nameError, dateError);
      if (!error) {
        console.log("got error", error);
        let body = {
          mobile: mobileNumber,
          name: name.trim(),
          dob: dob,
        };
        console.log(body);
        dispatch(PostRegister(body));
      }
    } catch (error) {
      console.log("err", error);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Image
        style={styles.image}
        source={require("../assets/images/screens/background-image.png")}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={700}
      />
      <View style={styles.formContainer}>
        <View>
          <Text style={styles.heading}>
            India's #1 Devotional & Spiritual App
          </Text>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Signup</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputContainer}>
            <View>
              <TextInput
                placeholder="Full name (First and Last name)"
                contentStyle={styles.inputContent}
                mode="outlined"
                value={name}
                left={<TextInput.Icon icon="account" disabled />}
                style={{
                  marginBottom: !nameError ? 12 : 0,
                }}
                //   value={mobileNumber}
                onChangeText={(text) => dispatch(setName(text))}
              />

              <HelperText
                style={[
                  styles.helpertext,
                  { display: nameError ? "flex" : "none" },
                ]}
                type="error"
                visible={nameError}
              >
                Enter valid name
              </HelperText>
            </View>
            <View>
              <DatePickerInput
                mode="outlined"
                editable={false}
                locale="en"
                label="DOB"
                value={date}
                onChange={onConfirmDate}
                inputMode="start"
                validRange={{
                  startDate: new Date(1900, 0, 1),
                  endDate: today,
                }}
                style={{
                  marginBottom: !nameError ? 12 : 0,
                }}
              // hideValidationErrors={}
              />
              <HelperText
                type="error"
                visible={dateError}
                style={[
                  styles.helpertext,
                  { display: dateError ? "flex" : "none" },
                ]}
              >
                Choose a date
              </HelperText>
            </View>
            <Button
              loading={isLoading}
              disabled={isLoading}
              style={styles.btn}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.btncontent}
              mode="contained"
              onPress={onSubmit}
            >
              Submit
            </Button>
          </View>
        </View>

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
              style={styles.btn}
              onPress={() => {
                Linking.openURL("https://spiritualkarma.in/terms");
              }}
            >
              <Text style={styles.text}>Terms of Service</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, { marginStart: 12 }]}
              onPress={() => {
                Linking.openURL("https://spiritualkarma.in/privacy-policy");
              }}
            >
              <Text style={styles.text}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default register;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: width,
    height: height * 0.45,
  },
  formContainer: {
    padding: 18,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: "100%",
    flex: 1,
  },
  heading: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 26,
    textAlign: "center",
    // marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    justifyContent: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1.4,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 8,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#616161",
  },
  inputContainer: {
    width: "100%",
    marginVertical: 6,
  },
  inputContent: {
    fontFamily: "Nunito_700Bold",
    color: "#5C5470",
  },
  textInput: {
    // marginVertical: 8,
  },
  btn: {
    borderRadius: 14,
    marginTop: 8,
  },
  buttonLabel: {
    fontFamily: "Nunito_900Black",
    color: "white",
  },
  btncontent: {
    paddingVertical: 5,
    fontFamily: "Nunito_900Black",
  },
  helpertext: { fontFamily: "Nunito_700Bold", fontSize: 14 },
  text: {
    textDecorationLine: "underline",
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#616161",
  },
});
