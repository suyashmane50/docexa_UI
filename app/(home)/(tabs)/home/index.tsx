import React, { memo, useEffect } from "react";
import { Appbar } from "react-native-paper";
import {
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Animated, Easing } from "react-native";
import { useRef } from "react";
import { getLastSeenTime, setLastSeenTime } from "@/utils/notificationStorage";
import { View, Text } from "react-native";
import { IconButton, FAB, Card, withTheme } from "react-native-paper";
import { Image } from "expo-image";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getPatinet } from "@/store/features/appointments/patient/getPatientSlice";
import {
  blurhash,
  services,
  scale,
  verticalScale,
  responsiveFontSize,
  isSmallDevice,
} from "@/utils/common";
import EventSource from "react-native-sse";
import { useState } from "react";
import { router } from "expo-router";
// import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "react-native";
import Loading from "@/components/Loading";
import { AppDispatch, RootState } from "@/store";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DOCEXA_PATIENT_HOST,
  DOCEXA_PATIENT_HOST_SSE,
  DOCEXA_PATIENT_HOST_SSE_2,
  localMobile,
} from "@/utils/api";
// import { State } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchDashboard } from "@/store/features/appointments/AppointmentSlice";
import { theme } from "@/utils/theme";
// import * as Speech from 'expo-speech';

const requiredImage = require("../../../../assets/images/DefaultPicture.jpg");
const male_default = require("../../../../assets/images/gender/male_default.png");
const female_default = require("../../../../assets/images/gender/female_default.png");
const both_default = require("../../../../assets/images/gender/both_default.png");

const family_icon = require("../../../../assets/icons/homepageIcons/family.png");
const consultation_icon = require("../../../../assets/icons/homepageIcons/prescription.png");
const notification_icon = require("../../../../assets/icons/homepageIcons/notification.png");
type NotificationType = {
  id: number;
  patientId: number;
  reportId: number;
  doctorName: string;
  message: string;
  time: string;
};
// const demoNotifications: any = [
// {
//   id: 1,
//   patientName: "Rahul Patil",
//   doctorName: "Dr. Mehta",
//   message: "Please book tomorrow's appointment for review.",
//   time: "10 min ago",
// },
// {
//   id: 2,
//   patientName: "Anita Sharma",
//   doctorName: "Dr. Kulkarni",
//   message: "No need to visit clinic. Continue medicines.",
//   time: "1 hr ago",
// },
// {
//   id: 3,
//   patientName: "Rohit Desai",
//   doctorName: "Dr. Shah",
//   message: "Take rest and repeat test after 5 days.",
//   time: "Yesterday",
// },
// {
//   id: 4,
//   patientName: "Rohit Desai",
//   doctorName: "Dr. Shah",
//   message: "Take rest and repeat test after 5 days.",
//   time: "Yesterday",
// },
// {
//   id: 5,
//   patientName: "Rohit Desai",
//   doctorName: "Dr. Shah",
//   message: "Take rest and repeat test after 5 days.",
//   time: "Yesterday",
// },
// ];
export const RenderImage = ({ item, index }: any) => {
  const getPatientImage = (gender?: number) => {
    if (gender === 1) return male_default;
    if (gender === 2) return female_default;
    return both_default;
  };

  const { width } = Dimensions.get("window");
  const smallDevice = width < 360;
  const itemWidth = smallDevice ? width / 5 : width / 4;
  const imageSize = smallDevice ? scale(50) : scale(60);

  return (
    <TouchableOpacity
      onPress={() => {
        // console.log("item: ", item);
        router.navigate(
          `/(home)/home/patient/${String(item?.patient_id)}` as any
        );
      }}
    >
      <View
        style={{
          alignItems: "center",
          width: itemWidth,
          paddingVertical: scale(2),
        }}
      >
        <Image
          style={[
            styles.image,
            {
              width: imageSize,
              height: imageSize,
              borderRadius: imageSize / 2,
            },
          ]}
          source={getPatientImage(item?.gender)}
          placeholder={{ blurhash }}
          contentFit="cover"
        />
        <Text
          style={{
            marginVertical: verticalScale(4),
            fontFamily: "Nunito_700Bold",
            textAlign: "center",
            fontSize: responsiveFontSize(smallDevice ? 9 : 10.5),
            color: "grey",
          }}
          numberOfLines={1}
        >
          {item?.patient_name ? item.patient_name : "NA"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const RenderAppointment = ({ item }: any) => {
  return (
    <Card mode="contained" style={{ marginVertical: 8 }}>
      <Card.Content>
        <Text
          style={{
            marginVertical: 6,
            fontFamily: "Nunito_700Bold",
            fontSize: 14.5,
          }}
        >
          {item?.doctorls?.name}
        </Text>
        <Text style={{ fontSize: 14.5 }}>
          {item.date} | {item.slot}
        </Text>
      </Card.Content>
    </Card>
  );
};

function HomeScreen() {
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { data: DashboardData } = useSelector(
    (state: RootState) => state.appointment
  );
  // const fullState = useSelector((state: RootState) => state);
  const state_mobile_no = useSelector(
    (state: RootState) => state.user?.data?.mobile_no
  );

  const { data, isLoading, isSuccess } = useSelector(
    (state: RootState) => state.patients
  );

  const fullstate = useSelector((state: RootState) => state);
  useEffect(() => {
    console.log("full State: ", state_mobile_no);
    console.log("full_state: ", fullstate);

    dispatch(getPatinet());
    return () => {};
  }, []);

  // :: --  Push Pull -- (T)

  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const sseRef = useRef<EventSource | null>(null);

  async function callGetMessegeSSE(mobile_no: string) {
    if ((sseRef.current as any)?.readyState === 1) return;

    // 🟢 Get last seen time
    let lastSeen = await AsyncStorage.getItem("last_seen_reports");

    let lastSeenToSend;

    if (lastSeen) {
      // Returning user
      lastSeenToSend = lastSeen;
    } else {
      // First time user
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      lastSeenToSend = twoDaysAgo.toISOString();

      // Save current time as last seen
      // await AsyncStorage.setItem("last_seen_reports", now.toISOString());
    }

    const url = `${DOCEXA_PATIENT_HOST_SSE}patient/sse/events/patient/getReportsUpdate?mobile_no=${mobile_no}&last_seen=${encodeURIComponent(lastSeenToSend)}`;

    // console.log("url: ", url);

    const es = new EventSource(url, {
      headers: { Accept: "text/event-stream" },
    });

    sseRef.current = es;

    es.addEventListener("message", async (event: any) => {
      const data = JSON.parse(event.data);

      if (data.type === "heartbeat") return;

      if (data.type === "report_updated") {
        const newNotifications = data.reports.map((report: any) => ({
          id: report.id,
          patientId: report.patient_id,
          reportId: report.id,
          doctorName: "Doctor",
          message: report.report_data || "Report updated",
          time: new Date().toLocaleTimeString(),
        }));
        console.log("new notification: ", newNotifications);

        setNotifications((prev) => {
          const newIds = newNotifications.map((n: any) => n.reportId);

          // Remove old notifications that are being updated
          const filteredOld = prev.filter((n) => !newIds.includes(n.reportId));

          // Add new ones at top
          return [...newNotifications, ...filteredOld];
        });

        // 🟢 Update last seen to now
        if (data.latest_update_at) {
          await AsyncStorage.setItem(
            "last_seen_reports",
            data.latest_update_at
          );
        }
      }
    });
  }

  useEffect(() => {
    if (!state_mobile_no) return;

    callGetMessegeSSE(state_mobile_no);
  }, [state_mobile_no]);

  useEffect(() => {
    return () => {
      if (sseRef.current) {
        console.log("Closing SSE connection");
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, []);
  const removeNotification = (reportId: number) => {
    setNotifications((prev) =>
      prev.filter((item) => item.reportId !== reportId)
    );
  };

  // :: --  Push Pull -- (B)

  function refreshAppData() {
    console.log("refresh called");
    try {
      dispatch(fetchDashboard());
      dispatch(getPatinet());
    } catch (error) {}
  }
  const RenderService = ({ item, index }: any) => {
    const { width } = Dimensions.get("window");
    const smallDevice = width < 360;
    const itemWidth = smallDevice ? width / 5 : width / 4.5;
    const iconSize = smallDevice ? scale(40) : scale(50);

    // console.log(item);

    return (
      <TouchableOpacity onPress={() => router.navigate(item.route)}>
        <View
          style={{ alignItems: "center", width: itemWidth, padding: scale(4) }}
        >
          <Image
            style={[styles.image1, { width: iconSize, height: iconSize }]}
            source={item.icon}
            contentFit="cover"
          />
          <Text
            style={{
              marginVertical: verticalScale(4),
              fontFamily: "Nunito_700Bold",
              textAlign: "center",
              fontSize: responsiveFontSize(smallDevice ? 10 : 11.5),
              color: "grey",
            }}
            numberOfLines={1}
          >
            {item?.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getPatientName = (patientId: number) => {
    const patient = data?.find((p: any) => p.patient_id === patientId);
    return patient ? patient.patient_name : "Unknown Patient";
  };
  const RenderNotification = ({ item, onRemove }: any) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handleClose = () => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Dimensions.get("window").width,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onRemove(item.reportId);
      });
    };

    return (
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        }}
      >
        <Card style={{ marginVertical: 4, marginHorizontal: scale(10) }}>
          <Card.Content>
            {/* 🔹 Top Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontFamily: "Nunito_700Bold",
                  fontSize: responsiveFontSize(14),
                }}
              >
                {getPatientName(item.patientId)} (ID: {item.patientId})
              </Text>

              {/* ❌ Close Button */}
              <TouchableOpacity onPress={handleClose}>
                <Text style={{ fontSize: 16 }}>❌</Text>
              </TouchableOpacity>
            </View>

            {/* 🔹 Report Info */}
            <Text
              style={{
                fontSize: responsiveFontSize(12),
                color: "#666",
                marginTop: 2,
              }}
            >
              Report ID: #{item.reportId}
            </Text>

            <Text
              style={{
                fontSize: responsiveFontSize(13),
                color: "#666",
                marginVertical: 4,
              }}
            >
              {item.doctorName}
            </Text>

            <Text
              style={{ fontSize: responsiveFontSize(13), marginVertical: 6 }}
            >
              🩺 {item.message}
            </Text>

            {/* 🔹 Bottom Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 12, color: "#888" }}>{item.time}</Text>

              {/* 👁 View Report Button */}
              <TouchableOpacity
                onPress={() => {
                  onRemove(item.reportId); // remove when opened

                  router.push({
                    pathname: "/home/report/view_report",
                    params: {
                      patientId: item.patientId,
                      patientName: getPatientName(item.patientId),
                    },
                  });
                }}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontFamily: "Nunito_700Bold",
                  }}
                >
                  View Report
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const DocProfile = ({ item }: any) => {
    const { width } = Dimensions.get("window");
    const smallDevice = width < 360;
    const imageSize = smallDevice ? scale(80) : scale(120);

    // console.log("item of docProfile", item);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={{ padding: scale(12), marginRight: 0 }}
        onPress={() => {
          router.push({
            pathname: "/(home)/(tabs)/appointments/choose",
            params: { doctor_id: item.id },
          });
        }}
      >
        <Card mode="contained">
          <Card.Content
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: smallDevice ? "55%" : "60%",
              }}
            >
              <View
                style={{
                  width: "100%",
                }}
              >
                <Text
                  style={[
                    styles.bannerText,
                    { fontSize: responsiveFontSize(13) },
                  ]}
                >
                  Book an appoinment with
                </Text>
                <Text
                  style={[
                    {
                      fontSize: responsiveFontSize(smallDevice ? 18 : 22),
                      fontFamily: "Nunito_600SemiBold",
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item?.name}
                </Text>
                <Text
                  style={[
                    styles.bannerText,
                    { fontSize: responsiveFontSize(13) },
                  ]}
                  numberOfLines={1}
                >
                  {item?.speciality}
                </Text>
              </View>
            </View>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Image
                style={{
                  borderRadius: imageSize / 2,
                  height: imageSize,
                  width: imageSize,
                }}
                source="https://picsum.photos/seed/696/3000/2000"
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={1000}
              />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {isSuccess && (
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
          {/* Header */}
          <Appbar.Header>
            <Appbar.Action
              icon="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
            <Appbar.Content
              title="Home"
              titleStyle={{ fontFamily: "Nunito_700Bold" }}
            />
          </Appbar.Header>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* My Family Block */}
            <View style={styles.block}>
              <View style={styles.sectionHeader}>
                <Image
                  source={family_icon}
                  style={styles.sectionIcon}
                  contentFit="contain"
                />
                <Text style={styles.sectionTitle}>My Family</Text>
                <IconButton
                  icon="refresh"
                  size={20}
                  onPress={() => {
                    refreshAppData();
                  }}
                />
              </View>

              <FlatList
                data={data}
                renderItem={RenderImage}
                keyExtractor={(item, index) =>
                  item?.id ? item.id.toString() : `patient-${index}`
                }
                horizontal
                showsHorizontalScrollIndicator={false}
                ListFooterComponent={
                  <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() =>
                      router.navigate("/(home)/(tabs)/home/patient/create")
                    }
                  />
                }
              />
            </View>

            {/* Consultations Block */}
            <View style={styles.block}>
              <View style={styles.sectionHeader}>
                <Image
                  source={consultation_icon}
                  style={styles.sectionIcon}
                  contentFit="contain"
                />
                <Text style={styles.sectionTitle}>Consultations</Text>
              </View>

              <FlatList
                data={services}
                horizontal
                renderItem={RenderService}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
              />
            </View>

            {/* Notifications Block */}
            <View style={styles.block}>
              <View
                style={[
                  styles.sectionHeader,
                  { justifyContent: "space-between" },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={notification_icon}
                    style={styles.sectionIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.sectionTitle}>Notification</Text>
                </View>

                <IconButton
                  icon="refresh"
                  size={20}
                  onPress={() => {
                    console.log("Manual SSE refresh");

                    if (sseRef.current) {
                      sseRef.current.close();
                      sseRef.current = null;
                    }

                    callGetMessegeSSE(state_mobile_no);
                  }}
                />
              </View>

              {notifications.length === 0 ? (
                <View style={styles.emptyNotification}>
                  <Text style={{ fontSize: 26 }}>🔔</Text>
                  <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
              ) : (
                notifications.map((item) => (
                  <RenderNotification
                    key={`report-${item.reportId}`}
                    item={item}
                    onRemove={(id: number) => {
                      setNotifications((prev) =>
                        prev.filter((n) => n.reportId !== id)
                      );
                    }}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      )}

      {isLoading && <Loading />}
    </>
  );
}

export default memo(withTheme(HomeScreen));

const styles = StyleSheet.create({
  block: {
    marginHorizontal: scale(10), // ⬅ reduced side gap
    marginTop: verticalScale(8), // ⬅ reduced vertical gap
    borderRadius: 10,
    paddingVertical: 6, // ⬅ tighter inside padding
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(10), // ⬅ tighter header padding
    marginBottom: 6, // ⬅ reduce gap below header
  },

  sectionIcon: {
    width: 20, // ⬅ slightly smaller icons
    height: 20,
    marginRight: 6,
  },

  sectionTitle: {
    fontSize: responsiveFontSize(16), // ⬅ slightly smaller title
    fontFamily: "Nunito_600SemiBold",
    // color: theme.colors.primary,
    fontWeight: "bold",
  },

  emptyNotification: {
    alignItems: "center",
    paddingVertical: 14, // ⬅ reduce empty state height
  },

  emptyText: {
    marginTop: 4,
    color: "#999",
    fontFamily: "Nunito_600SemiBold",
    fontSize: responsiveFontSize(12),
  },

  fab: {
    marginHorizontal: scale(12),
    marginTop: verticalScale(4),
    borderRadius: 50,
    // padding: 8,
  },

  bannerText: {
    fontFamily: "Nunito_400Regular",
    marginVertical: verticalScale(4), // ⬅ reduce text spacing
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00730b",
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  image: {
    // Dynamic sizing applied inline
  },
  image1: {
    // Dynamic sizing applied inline
  },

  wrapper: {
    // height: 200,
  },
  slide: {
    // width applied dynamically inline
    height: 200,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    flex: 1,
  },
});
