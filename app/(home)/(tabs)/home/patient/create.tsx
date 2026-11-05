import {
  blurhash,
  convertDateToYYYYMMDD,
  gender_data,
  scale,
  verticalScale,
  responsiveFontSize,
  isSmallDevice,
} from "@/utils/common";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  Appbar,
  Button,
  HelperText,
  Icon,
  TextInput,
  withTheme,
} from "react-native-paper";
import { DatePickerInput } from "react-native-paper-dates";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import {
  AddPatient,
  resetPatient,
  setDob,
  setFirstName,
  setFormValid,
  resetFormValid,
  setGender,
  setLastName,
} from "@/store/features/appointments/patient/AddPatientSlice";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { getPatinet } from "@/store/features/appointments/patient/getPatientSlice";
import { fetchDashboard } from "@/store/features/appointments/AppointmentSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserInfo } from "@/store/auth/UserSlice";

const numColumns = 2;
const today = new Date();
today.setHours(0, 0, 0, 0);

function create({ theme }: any) {
  const { width } = useWindowDimensions();
  const size = width / numColumns;
  const dispatch: AppDispatch = useDispatch();

  // ---- SAFE selectors (NO fullState) ----
  const {
    isLoading,
    isSuccess,
    firstname,
    firstNameError,
    lastname,
    lastNameError,
    gender,
    genderError,
    dob,
    dobError,
    formValid,
  } = useSelector((state: RootState) => state.addPatient);

  const appointmentData = useSelector(
    (state: RootState) => state.appointment?.data,
  );
  const mobileNumber = useSelector(
    (state: RootState) => state.auth.mobileNumber,
  );
  const headPatientId = useSelector((state: RootState) => state.otp?.data?.id);
  const email = useSelector((state: RootState) => state.user?.data?.email);

  const [date, setdate] = useState<Date | undefined>(undefined);

  const pharmaclient_id = appointmentData?.doctors?.[0]?.pharmaclient_id;

  // ---------------- SUBMIT HANDLING ----------------
  useEffect(() => {
    console.log("locally called...");

    // Fire API only once
    if (formValid) {
      const body = {
        patient_name: `${firstname} ${lastname}`,
        gender,
        dob,
        doctor_id: pharmaclient_id,
        patient_head_id: headPatientId,
        mobile_no: mobileNumber,
        email_id: email || null,
      };
      console.log("API body: ", body);

      dispatch(AddPatient(body));
      dispatch(resetFormValid()); // 🔥 prevent second call
      fetchSuperPatient();
    }

    // Handle success
    if (isSuccess) {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: "Family member added",
      });
      getPatientRefresh();
      router.back(); // go to home
    }
  }, [formValid, isSuccess]);

  async function fetchSuperPatient() {
    console.warn("fetching user super info...");

    const value = await AsyncStorage.getItem("id");
    const user_map_id_from_local = await AsyncStorage.getItem("user_map_id");
    const data = {
      user_map_id: Number(user_map_id_from_local),
      id: Number(value),
    };

    console.log("user_map_id_from_local +  : ", user_map_id_from_local);

    dispatch(getUserInfo(data));
  }
  // ---------------- LOADER ----------------
  const PageLoader = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loaderOverlay}>
        <View style={styles.loaderBox}>
          <Icon source="loading" size={40} color="white" />
          <Text style={styles.loaderText}>Saving...</Text>
        </View>
      </View>
    );
  };

  async function getPatientRefresh() {
    await dispatch(getPatinet()); // refresh home list
    await dispatch(fetchDashboard());
    dispatch(resetPatient()); // clear form
  }

  // ---------------- GENDER ITEM ----------------
  const Item = ({ item }: any) => {
    const itemSize = size - scale(60);
    return (
      <LinearGradient
        colors={
          gender === item.id
            ? [
                theme.colors.primary,
                theme.colors.primaryContainer,
                theme.colors.onPrimary,
              ]
            : ["transparent", "transparent"]
        }
        style={styles.gender_item}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => dispatch(setGender(item.id))}
          style={{ width: "100%", alignItems: "center", padding: scale(8) }}
        >
          <Text style={styles.text}>{item.label}</Text>
          <Image
            style={[styles.image, { width: itemSize, height: itemSize }]}
            source={item.img}
            contentFit="contain"
          />
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <PageLoader />

      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add Family Member" />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={{
          padding: scale(16),
          paddingBottom: verticalScale(32),
          maxWidth: 600,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <FlatList
          scrollEnabled={false}
          data={gender_data}
          renderItem={Item}
          keyExtractor={(item: any) => item.id.toString()}
          numColumns={2}
        />
        <HelperText type="error" visible={genderError}>
          Choose gender
        </HelperText>

        <TextInput
          label="First Name"
          value={firstname}
          onChangeText={(t) => dispatch(setFirstName(t))}
        />
        <HelperText type="error" visible={firstNameError}>
          Invalid first name
        </HelperText>

        <TextInput
          label="Last Name"
          value={lastname}
          onChangeText={(t) => dispatch(setLastName(t))}
        />
        <HelperText type="error" visible={lastNameError}>
          Invalid last name
        </HelperText>

        <DatePickerInput
          mode="outlined"
          locale="en"
          inputMode="start"
          label="DOB"
          value={date}
          onChange={(v) => {
            setdate(v);
            dispatch(setDob(convertDateToYYYYMMDD(v)));
          }}
          validRange={{
            startDate: new Date(1900, 0, 1),
            endDate: today,
          }}
          style={{ fontSize: responsiveFontSize(16) }}
        />

        <HelperText type="error" visible={dobError}>
          Invalid DOB
        </HelperText>

        <Button
          loading={isLoading}
          disabled={isLoading}
          mode="contained"
          onPress={() => dispatch(setFormValid())}
        >
          Submit
        </Button>
      </ScrollView>
    </View>
  );
}

export default memo(withTheme(create));

const styles = StyleSheet.create({
  gender_item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    margin: scale(4),
    minHeight: scale(120),
    borderRadius: scale(25),
  },
  text: {
    fontSize: responsiveFontSize(16),
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
  },
  image: {
    resizeMode: "contain",
    borderRadius: scale(15),
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 99999,
    elevation: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    backgroundColor: "#000",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  loaderText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
});
