import { fetchCallsForBoth } from "@/store/features/appointments/oncall/CallsSlice";
import { AppDispatch, RootState } from "@/store";
import { router } from "expo-router";
import React, { memo, useEffect, useCallback, useState } from "react";
// import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import * as Speech from "expo-speech";
import { Divider, Chip } from "react-native-paper";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";

import {
  Appbar,
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  withTheme,
} from "react-native-paper";

import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useDispatch, useSelector } from "react-redux";
import Loading from "@/components/Loading";
import NoDataFound from "@/components/NoDataFound";
import {
  cancelAppointment,
  fetchAppointment,
} from "@/store/features/appointments/FetchAppointmentSlice";
import Id from "../patient/[id]";
import {
  fetchPatientSelectedVitals,
  fetchVitals,
} from "@/store/features/appointments/VitalsSlice";
import {
  fetchPatientSelectedSymptoms,
  fetchSymptoms,
} from "@/store/features/appointments/SymptomSlice";
import { fetchClinics } from "@/store/features/appointments/ClinicSelectSlice";

const speakCancel = () => {
  Speech.speak("आपकी अपॉइंटमेंट रद्द कर दी गई है", {
    language: "hi-IN",
    rate: 0.9,
    pitch: 0.9,
  });
};

interface AppointmentItem {
  patient_name?: string;
  patient_id?: number;
  date?: string;
  clinic_id?: string | number | null;
  start_time?: string;
}
import { scale, verticalScale, responsiveFontSize } from "@/utils/common";

function index({ theme }: any) {
  const [vitalsForView, setVitalsForView] = useState<any | []>([]);
  const [vitalsLoading, setVitalsLoading] = useState(false);

  const [symptomsForView, setSymptomsForView] = useState<any[]>([]);
  const [symptomsLoading, setSymptomsLoading] = useState(false);

  const [viewVisible, setViewVisible] = useState(false);
  const [patientForView, setPatientForView] = useState<AppointmentItem | null>(
    null,
  );

  const formatDate = (dateString: any) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const showViewModal = async (item: any) => {
    try {
      setVitalsLoading(true);
      setSymptomsLoading(true);
      const user_map_id =
        fullState?.appointment?.data?.doctors[0]?.medical_user_map?.id || null;
      const data = {
        doctor_id:
          fullState?.appointment?.data?.doctors[0]?.pharmaclient_id || null,
        user_map_id: user_map_id,
        booking_id: item.appt_id,
      };
      console.log(
        "doctor_id: ",
        fullState?.appointment?.data?.doctors[0]?.pharmaclient_id,
      );

      const response = await dispatch(
        fetchPatientSelectedVitals(data),
      ).unwrap();
      const SymptomResponse = await dispatch(
        fetchPatientSelectedSymptoms(data),
      ).unwrap();
      console.log("response: ", response);
      console.log("SymptomResponse: ", SymptomResponse);

      setVitalsForView(response?.data ?? []);
      setSymptomsForView(SymptomResponse?.data ?? []);
      setViewVisible(true);
      console.log("selected appointment details: ", item);
      const selected_clinic_name = fullState.clinics;
      console.log(selected_clinic_name);

      setPatientForView(item);
    } catch (error) {
    } finally {
      setVitalsLoading(false);
      setSymptomsLoading(false);
    }
  };
  const hideViewModal = () => setViewVisible(false);
  const dispatch: AppDispatch = useDispatch();
  const { callsData, isLoading, isError, isSuccess, isNotFound, message } =
    useSelector((state: RootState) => state.FetchCallsForBoth);
  const patientData = useSelector((state: RootState) => state.patients?.data);
  const patient_ids: any = [];

  useEffect(() => {
    console.log(patientData);
    for (let i = 0; i < patientData?.length; i++) {
      patient_ids.push(patientData[i]?.patient_id);
    }
    const patient_key_string = JSON.stringify(patient_ids);
    console.log("patient_id: ", patient_key_string);
    // dispatch(fetchCallsForBoth());
    dispatch(fetchAppointment({ patient_id: patient_key_string }));
  }, []);
  const {
    data: appointmentData,
    isLoading: apptLoading,
    isError: apptError,
    isSuccess: apptSuccess,
    message: apptMessage,
  } = useSelector((state: RootState) => state.getAppointment);

  function navigateToVitals(item: any) {
    // router.push("/(home)/(tabs)/home/appointments/add_vitals/add_vitals");
    console.log("selected patient: ", item);

    router.push({
      pathname: "/(home)/(tabs)/home/appointments/add_vitals/add_vitals",
      params: {
        booking_id: item.appt_id,
        patient_id: item.patient_id,
      },
    });
  }
  const fullState = useSelector((state: RootState) => state);
  useEffect(() => {
    const user_map_id =
      fullState?.appointment?.data?.doctors[0]?.medical_user_map?.id || null;

    dispatch(fetchVitals(user_map_id));
    dispatch(fetchSymptoms(user_map_id));
    console.log("full state: ", fullState);

    if (isError) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: message ? message : "Try again later",
      });
    }
  }, [isError, isSuccess, message]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  const showDialog = (Booking_id: number) => {
    setSelectedBookingId(Booking_id);
    setVisible(true);
  };
  const hideDialog = () => {
    setVisible(false);
    setSelectedBookingId(null);
  };
  // y -- Speak Message -- (T)

  const speakMessage = async (hindiText: string, englishText: string) => {
    const voices = await Speech.getAvailableVoicesAsync();

    const hindi = voices.find((v) => v.language === "hi-IN");
    const enIN = voices.find((v) => v.language === "en-IN");
    const enUS = voices.find((v) => v.language === "en-US");

    const selectedVoice = hindi || enIN || enUS;

    if (!selectedVoice) return;

    Speech.speak(hindi ? hindiText : englishText, {
      language: selectedVoice.language,
      voice: selectedVoice.identifier,
      rate: 0.9,
    });
  };

  
  // y -- Speak Message -- (B)
  const onCancelAppointment = () => {
    hideDialog();
    console.log("Appointment cancelled");
    console.log(selectedBookingId);
    dispatch(
      cancelAppointment({
        bookingID: selectedBookingId!,
        remark: null,
        scheduletimestamp: null,
        slot_size: null,
        status: 3,
      }),
    ).then(() => {
      speakMessage(
        "आपकी अपॉइंट मेंट रद्द कर दी गई है",
        "Your appointment has been cancelled.",
      );
      dispatch(fetchAppointment({ patient_id: "" }));
    });
  };
  const formatTime12Hour = (time24?: string): string => {
    if (!time24) return "";

    const [hourStr, minuteStr] = time24.split(":");
    let hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (isNaN(hour) || isNaN(minute)) return time24;

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    hour = hour === 0 ? 12 : hour;

    return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const RenderAppointment = useCallback(
    ({ item }: any) => (
      <Card mode="contained" style={{ marginBottom: 12 }}>
        <Card.Content>
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
                fontSize: 14.5,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {item?.patient_name || "Unknown Patient"}
            </Text>

            <IconButton
              icon="eye"
              size={20}
              onPress={() => {
                console.log("view btn called");
                showViewModal(item);
              }}
            />
          </View>

          <Text style={{ fontSize: 14.5 }}>
            {item.date} | {formatTime12Hour(item.start_time)}
          </Text>

          <View
            style={{
              flexDirection: "row",
              marginTop: 12,
              justifyContent: "space-between",
            }}
          >
            <Button
              mode="outlined"
              labelStyle={{ fontFamily: "Nunito_700Bold" }}
              style={{ borderRadius: 10, width: "45%" }}
              onPress={() => showDialog(item.booking_id)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              labelStyle={{ fontFamily: "Nunito_700Bold" }}
              style={{ borderRadius: 10, width: "45%" }}
              onPress={() => navigateToVitals(item)}
            >
              Add Details
            </Button>
          </View>
        </Card.Content>
      </Card>
    ),
    [],
  );

  const NoAppointmentsTodayUI = () => (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        marginTop: 80,
      }}
    >
      <IconButton
        icon="calendar-remove-outline"
        size={80}
        iconColor="#9CA3AF"
      />

      <Text
        style={{
          fontSize: 18,
          fontFamily: "Nunito_700Bold",
          marginTop: 12,
          color: "#374151",
        }}
      >
        No Appointments Today
      </Text>

      <Text
        style={{
          fontSize: 14,
          textAlign: "center",
          marginTop: 6,
          color: "#6B7280",
        }}
      >
        You don’t have any scheduled appointments for today.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction
          color={theme.colors.primary}
          onPress={() => {
            router.back();
          }}
        />
        <Appbar.Content
          color={theme.colors.primary}
          titleStyle={{ fontFamily: "Nunito_700Bold" }}
          title="Appointments"
        />
      </Appbar.Header>
      {apptLoading ? (
        <Loading />
      ) : (
        <>
          <FlatList
            style={{ padding: scale(16) }}
            keyExtractor={(item, index) => index.toString()}
            data={apptSuccess ? appointmentData : []}
            renderItem={RenderAppointment}
            ListEmptyComponent={
              apptSuccess && appointmentData?.length === 0 ? (
                <NoAppointmentsTodayUI />
              ) : null
            }
          />
          {/* <FlatList
            style={{ padding: 16 }}
            keyExtractor={(item, index) => index.toString()}
            data={apptSuccess ? appointmentData : []}
                          renderItem={RenderAppointment}
                      ListEmptyComponent={
                          isNotFound ? (
                              <View className='flex-1' style={{ padding: scale(16) }}>
                          <NoDataFound />
                      </View>
                          ) : null
                  }
                  /> */}
        </>
      )}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Cancel Appointment</Dialog.Title>
          <Dialog.Content>
            <Text>Do you want to cancel this appointment?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>No</Button>
            <Button onPress={onCancelAppointment} textColor="red">
              Yes, Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Dialog
          visible={viewVisible}
          onDismiss={hideViewModal}
          style={{
            borderRadius: 16,
            width: "95%",
            alignSelf: "center",
            maxHeight: "85%",
          }}
        >
          <Dialog.Title style={{ fontWeight: "700" }}>
            Appointment Details
          </Dialog.Title>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
          >
            {/* Patient */}
            <View style={styles.patientCard}>
              <IconButton icon="account-circle" size={28} />

              <View style={{ flex: 1 }}>
                <Text style={styles.patientName} numberOfLines={2}>
                  {patientForView?.patient_name}
                </Text>

                <Text style={styles.subtitle}>Patient Appointment</Text>
              </View>
            </View>

            {/* Appointment Info */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Appointment</Text>

              <View style={styles.row}>
                <IconButton icon="calendar" size={18} />
                <Text style={styles.rowText}>
                  {formatDate(patientForView?.date)}
                </Text>
              </View>

              <View style={styles.row}>
                <IconButton icon="clock-outline" size={18} />
                <Text style={styles.rowText}>
                  {formatTime12Hour(patientForView?.start_time)}
                </Text>
              </View>
            </View>

            {/* Vitals */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Vitals</Text>

              {vitalsLoading ? (
                <Text>Loading vitals...</Text>
              ) : vitalsForView?.length > 0 ? (
                <View style={styles.chipContainer}>
                  {vitalsForView.map((vital: any, index: number) => (
                    <Chip
                      key={index}
                      style={styles.vitalChip}
                      textStyle={{ flexShrink: 1 }}
                    >
                      {vital.vital_name}: {vital.value} {vital.unit}
                    </Chip>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No vitals recorded</Text>
              )}
            </View>

            {/* Symptoms */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Symptoms</Text>

              {symptomsLoading ? (
                <Text>Loading symptoms...</Text>
              ) : symptomsForView?.length > 0 ? (
                <View style={styles.chipContainer}>
                  {symptomsForView.map((symptom: any) => (
                    <Chip
                      key={symptom.id}
                      style={styles.symptomChip}
                      textStyle={{ flexShrink: 1 }}
                    >
                      {symptom.name}
                    </Chip>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No symptoms recorded</Text>
              )}
            </View>
          </ScrollView>

          <Dialog.Actions>
            <Button onPress={hideViewModal}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

export default memo(withTheme(index));

const styles = StyleSheet.create({
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7ff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },

  patientName: {
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },

  subtitle: {
    fontSize: 12,
    color: "#777",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    elevation: 1,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowText: {
    flexShrink: 1,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  vitalChip: {
    backgroundColor: "#eef2ff",
    marginBottom: 6,
  },

  symptomChip: {
    backgroundColor: "#e8f5e9",
    marginBottom: 6,
  },

  emptyText: {
    color: "#777",
  },
});
