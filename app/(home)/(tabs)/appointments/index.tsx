import React, { memo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  scale,
  verticalScale,
  responsiveFontSize,
  isSmallDevice,
  saveToLocalStorage,
} from "@/utils/common";
import { FontAwesome } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, Icon, IconButton, withTheme } from "react-native-paper";
import { router, useNavigation, useRouter } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "@/store/features/appointments/AppointmentSlice";
import { AppDispatch, RootState } from "@/store";
import Loading from "@/components/Loading";
import { Image } from "expo-image";
import * as Speech from "expo-speech";
import { fetchAppointment } from "@/store/features/appointments/FetchAppointmentSlice";
import config from "@/config";
import { setDoctorId } from "@/store/auth/authReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserInfo } from "@/store/auth/UserSlice";

const Tab = createMaterialTopTabNavigator();

const { width } = Dimensions.get("window");
function Appointment() {
  const full_state = useSelector((state: RootState) => state);
  const navigation = useNavigation();
  const dispatch: AppDispatch = useDispatch();

  const { data, message, isLoading, isSuccess, isError } = useSelector(
    (state: any) => state.appointment,
  );

  const speak = () => {
    const thingToSay = "1";
    Speech.speak(thingToSay);
  };

  const fetchdashboard = async () => {
    try {
      const result = await dispatch(fetchDashboard());
      console.warn(
        "created_by_doctor: ",
        full_state?.appointment?.data?.doctors?.[0]?.medical_user_map?.id,
      );
      const data = result.payload; // ✅ use fresh data
      console.log("data:new::: ", data);

      const userMapId = data?.doctors?.[0]?.medical_user_map?.id;
      await saveToLocalStorage("user_map_id", userMapId);
      await fetchSuperPatient();
    } catch (error) {}
  };

  const fetchAppt = () => {
    try {
      dispatch(fetchAppointment({ patient_id: "[]" }));
    } catch (error) {}
  };

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

  useEffect(() => {
    fetchdashboard();
    // fetchAppt();
  }, []);

  const { width } = useWindowDimensions();
  const smallDevice = isSmallDevice();
  const iconSize = smallDevice ? scale(40) : scale(50);

  const RenderDoctor = ({ item }: any) => {
    return (
      <>
        <Card
          mode="contained"
          style={{
            margin: scale(16),
            padding: scale(16),
            borderRadius: scale(12),
          }}
        >
          <Card.Content style={{ flexDirection: "row" }}>
            <FontAwesome
              name="user-md"
              size={iconSize}
              color="gray"
              style={[styles.profileIcon, { marginRight: scale(16) }]}
            />

            <View style={{ flexDirection: "column" }}>
              <Text style={styles.doctorName}>
                Dr. {item?.pharmaclient_name} {item?.last_name}
              </Text>

              {/* <View style={{ flexDirection: "row", marginBottom: 5 }}>
                <Icon
                  size={22}
                  source={require("../../../../assets/images/screens/graduation-hat.png")}
                />
                <Text style={styles.doctorQualification}>
                  {item?.qualification}
                </Text>
              </View> */}

              <View style={{ marginBottom: 5 }}>
                {item?.qualification
                  ?.split(",")
                  .map((q: string, index: number) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Icon
                        size={22}
                        source={require("../../../../assets/images/screens/graduation-hat.png")}
                      />
                      <Text style={styles.doctorQualification}>{q.trim()}</Text>
                    </View>
                  ))}
              </View>

              {item?.role && (
                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 5,
                    alignItems: "center",
                  }}
                >
                  <Icon
                    size={22}
                    source={require("../../../../assets/images/screens/graduation-hat.png")}
                  />
                  <Text style={styles.doctorQualification}>{item.role}</Text>
                </View>
              )}
            </View>
          </Card.Content>

          <Button
            mode="contained"
            style={{
              marginVertical: verticalScale(12),
              width: "100%",
              borderRadius: scale(10),
            }}
            contentStyle={{ paddingVertical: verticalScale(5) }}
            labelStyle={{ fontSize: responsiveFontSize(14) }}
            onPress={() => {
              router.push({
                pathname: "/appointments/choose",
                params: { doctor_id: item.pharmaclient_id },
              });
              console.log("Dr. Id: ", item.pharmaclient_id);
            }}
          >
            Next
          </Button>
        </Card>
      </>
    );
  };

  function TopTab() {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "white",
          tabBarLabelStyle: {
            fontSize: 14,
            fontFamily: "Nunito_700Bold",
            fontWeight: "bold",
          },
          tabBarStyle: {
            backgroundColor: "#7b1fa2",
          },
          tabBarAndroidRipple: { borderless: false },
          // swipeEnabled: true,
        }}
      >
        <Tab.Screen name="Doctors" component={Doctors} />
        <Tab.Screen name="Details" component={Details} />
        <Tab.Screen name="Services" component={ServicesScreen} />
      </Tab.Navigator>
    );
  }

  const Details = () => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: 12,
          }}
        >
          <Text style={styles.locationText}>{data?.doctors[0]?.address}</Text>
          <IconButton
            mode="contained"
            icon="map-marker"
            size={28}
            // onPress={() => console.log("Pressed")}
          />
        </View>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <Icon source="map-marker-right" size={28} color="#7b1fa2" />
          <Text style={styles.landmark}>Landmark: NA</Text>
        </View>

        <View style={{ marginTop: 22 }}>
          {/* <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16 }}>
            Contact
          </Text> */}
          <View
            style={{
              flexDirection: "row",
              marginTop: 12,
            }}
          >
            {/* <Button
              icon="phone"
              mode="contained"
              style={{ marginRight: 12 }}
              onPress={() => call()}
            >
              Call
            </Button>
            <Button
              icon="whatsapp"
              mode="contained"
              style={{ marginRight: 12 }}
              onPress={() => whatsapp()}
            >
              Whats App
            </Button>
            <Button
              icon="email"
              mode="contained"
              onPress={() => mail()}
            >
              Mail
            </Button> */}
          </View>
        </View>
      </View>
    );
  };

  const Doctors = () => {
    return (
      <>
        {data?.doctors?.length != 0 ? (
          <FlatList
            data={data.doctors}
            renderItem={RenderDoctor}
            keyExtractor={(item, index) =>
              item?.pharmaclient_id?.toString() ||
              item?.id?.toString() ||
              `doctor-${index}`
            }
          />
        ) : (
          <View>
            <Card
              mode="contained"
              style={{
                margin: 20,
                padding: 20,
              }}
            >
              <Text style={styles.cardTitle}>No doctors found</Text>
            </Card>
          </View>
        )}
      </>
    );
  };

  function ServicesScreen() {
    return (
      <Card
        mode="contained"
        style={{
          margin: 20,
          padding: 20,
        }}
      >
        <Text style={styles.cardTitle}>No services found</Text>
      </Card>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#00A1E4", "#006397", "#003F66"]}>
        <IconButton
          icon="sort-variant"
          iconColor={"white"}
          size={20}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
        {/* -- Hospital Name -- Static */}
        <Text style={styles.hospitalName}>
          {/* {data?.app_info?.app_name ? `${data?.app_info?.title}` : "NA"} */}
          Aashay Clinic
        </Text>
        {/* -- Hospital Name -- Dynamic */}
        {/* <Text style={styles.hospitalName}>
          {data?.app_info?.app_name ? `${data?.app_info?.title}` : "NA"}
        </Text> */}
      </LinearGradient>

      {isSuccess && (
        <View style={{ flex: 1 }}>
          {/* <TopTab /> */}
          <Doctors />
        </View>
      )}

      {isLoading && <Loading />}

      {isError && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: scale(20),
          }}
        >
          <Image
            style={{
              width: width - scale(40),
              height: width - scale(40),
              maxWidth: 300,
              maxHeight: 300,
            }}
            source={require("../../../../assets/images/screens/fixing.png")}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: responsiveFontSize(20),
              fontFamily: "Nunito_700Bold",
              marginBottom: verticalScale(15),
              marginTop: verticalScale(10),
            }}
          >
            Something went wrong
          </Text>
          <Button
            mode="contained"
            style={{ width: "90%", maxWidth: 300, borderRadius: scale(15) }}
            contentStyle={{ paddingVertical: verticalScale(5) }}
            labelStyle={{ fontSize: responsiveFontSize(14) }}
            onPress={fetchdashboard}
          >
            Try again
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    height: 120,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  backIcon: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  hospitalName: {
    fontSize: responsiveFontSize(18),
    fontWeight: "bold",
    marginVertical: verticalScale(20),
    textAlign: "center",
    fontFamily: "Nunito_700Bold",
    color: "white",
    paddingHorizontal: scale(16),
  },
  tabNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    // backgroundColor: "#E8F4F8",
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "transparent",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileIcon: {
    // marginRight applied inline
  },
  doctorName: {
    fontSize: responsiveFontSize(18),
    fontWeight: "bold",
    fontFamily: "Nunito_600SemiBold",
    marginBottom: verticalScale(4),
  },
  doctorQualification: {
    fontSize: responsiveFontSize(14),
    color: "#707070",
    fontFamily: "Nunito_600SemiBold",
    marginLeft: scale(8),
    flex: 1,
    flexWrap: "wrap",
  },
  doctorSpecialty: {
    fontSize: 16,
    color: "#707070",
    fontFamily: "Nunito_600SemiBold",
  },
  doctorLocation: {
    fontSize: 14,
    color: "#909090",
    marginTop: 5,
    fontFamily: "Nunito_600SemiBold",
  },
  doctorExperience: {
    fontSize: 14,
    color: "#909090",
    marginTop: 5,
    fontFamily: "Nunito_600SemiBold",
  },
  proceedButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  locationText: {
    fontSize: 16,
    color: "#757575",
    fontFamily: "Nunito_700Bold",
    marginRight: 5,
  },
  landmark: {
    color: "#9e9e9e",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    marginLeft: 8,
  },
  locationIcon: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
  },
});

export default memo(withTheme(Appointment));
