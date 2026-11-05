import Loading from "@/components/Loading";
import * as Speech from "expo-speech";

import {
  resetClinic,
  selectClinic,
} from "@/store/features/appointments/ClinicSelectSlice";
import { Portal, Dialog, Appbar } from "react-native-paper";
import {
  getSlot,
  resetClinicSlot,
} from "@/store/features/appointments/ClinicSlotSlice";
import { getAppointment } from "@/store/features/appointments/FetchAppointmentSlice";
import { getPatinet } from "@/store/features/appointments/patient/getPatientSlice";
import {
  PostAppointment,
  resetPostAppointment,
  setPatient,
  setPatientError,
} from "@/store/features/appointments/PostAppointmentSlice";

import { AppDispatch, RootState } from "@/store";
import { convertDateToYYYYMMDD, whatsapp } from "@/utils/common";
import { router, useLocalSearchParams } from "expo-router";

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Pressable,
} from "react-native";
import {
  Card,
  Avatar,
  Button,
  Text,
  IconButton,
  withTheme,
  HelperText,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { white } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

type SlotPeriod = "morning" | "afternoon" | "evening";

interface DaySlot {
  morningSlots: string[];
  afternoonSlots: string[];
  eveningSlots: string[];
}

/* Enable smooth expand on Android */
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

/* Simple Expandable */
const Expandable = ({ expanded, children }: any) => {
  return expanded ? <View>{children}</View> : null;
};

/* Age calculator */
export function calculateAgeFromDOB(dob: string): string | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return null;

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) return `${days}D`;
  if (years === 0) return `${months}M`;
  return `${(years + months / 12).toFixed(1)}Y`;
}

const CreateAppointment = ({ theme }: any) => {
  const { doctor_id, clinic_id }: any = useLocalSearchParams();
  const dispatch: AppDispatch = useDispatch();

  const { datats, isLoading, isSuccess, doctorInfo, clinicInfo } = useSelector(
    (state: RootState) => state.clinicSlot
  );

  const [slideAnim] = useState(new Animated.Value(300));

  const clinicsData = useSelector((state: RootState) => state.clinics?.data);
  const sku_data = clinicsData?.skuData?.find(
    (sku: any) => sku.clinic_id == clinic_id
  );
  // console.log("Dr: ", doctorInfo);

  const { data: patientData } = useSelector(
    (state: RootState) => state.patients
  );

  const { patinetError, ispostloading, ispostssuccess, selectPatient } =
    useSelector((state: RootState) => state.postappointment);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [openPatientModal, setOpenPatientModal] = useState(false);
  const [expanded, setExpanded] = useState<Record<SlotPeriod, boolean>>({
    morning: false,
    afternoon: false,
    evening: false,
  });

  const rawDayData: any = datats?.[0];

  const dayData: DaySlot | null = rawDayData
    ? {
        morningSlots: rawDayData.morningSlots || [],
        afternoonSlots: rawDayData.afternoonSlots || [],
        eveningSlots: rawDayData.eveningSlots || [],
      }
    : null;

  const toggleExpand = (key: SlotPeriod) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((p) => ({ ...p, [key]: !p[key] }));
  };

  useEffect(() => {
    dispatch(
      getSlot({
        doctor_id: Number(doctor_id),
        clinic_id: Number(clinic_id),
      })
    );
    dispatch(getPatinet());
  }, []);

  useEffect(() => {
    if (!datats || datats.length === 0) return;

    const rawDayData: any = datats[0];

    const data: DaySlot = {
      morningSlots: rawDayData.morningSlots || [],
      afternoonSlots: rawDayData.afternoonSlots || [],
      eveningSlots: rawDayData.eveningSlots || [],
    };

    const session = getCurrentSession(data);

    setExpanded({
      morning: session === "morning",
      afternoon: session === "afternoon",
      evening: session === "evening",
    });
  }, [datats]); // important

  useEffect(() => {
    if (openPatientModal) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [openPatientModal]);
  function getCurrentSession(dayData: DaySlot | null): SlotPeriod {
    if (!dayData) return "morning";

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const getMinutes = (time: string) => {
      try {
        const [t, modifier] = time.split(" ");
        let [hours, minutes] = t.split(":").map(Number);

        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        return hours * 60 + minutes;
      } catch {
        return 0;
      }
    };

    // Check each session range
    if (dayData.morningSlots.length) {
      const first = getMinutes(dayData.morningSlots[0]);
      const last = getMinutes(
        dayData.morningSlots[dayData.morningSlots.length - 1]
      );
      if (currentMinutes >= first && currentMinutes <= last) return "morning";
    }

    if (dayData.afternoonSlots.length) {
      const first = getMinutes(dayData.afternoonSlots[0]);
      const last = getMinutes(
        dayData.afternoonSlots[dayData.afternoonSlots.length - 1]
      );
      if (currentMinutes >= first && currentMinutes <= last) return "afternoon";
    }

    if (dayData.eveningSlots.length) {
      const first = getMinutes(dayData.eveningSlots[0]);
      const last = getMinutes(
        dayData.eveningSlots[dayData.eveningSlots.length - 1]
      );
      if (currentMinutes >= first && currentMinutes <= last) return "evening";
    }

    // fallback logic
    if (dayData.afternoonSlots.length) return "afternoon";
    if (dayData.eveningSlots.length) return "evening";
    return "morning";
  }

  function getSlotRangeFromList(
    slots: string[],
    index: number,
    fallbackSlotSize: number
  ) {
    const startTime = slots[index];

    // If next slot exists → use next slot as end time
    if (index < slots.length - 1) {
      return `${startTime} - ${slots[index + 1]}`;
    }

    // Last slot fallback (use slot_size)
    const parts = startTime.split(":");
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);

    let endMinutes = minutes + fallbackSlotSize;
    let endHours = hours + Math.floor(endMinutes / 60);
    endMinutes = endMinutes % 60;

    const format = (h: number, m: number) =>
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

    return `${startTime} - ${format(endHours, endMinutes)}`;
  }

  /* Booking success */
  useEffect(() => {
    if (ispostssuccess) {
      setOpenPatientModal(false);
      dispatch(setPatient(null));
      dispatch(setPatientError(false));
      setShowSuccessDialog(true);
      Speech.speak("Your appointment has been booked successfully", {
        rate: 0.9,
      });
    }
  }, [ispostssuccess]);

  function isPastSlot(slotTime: string) {
    try {
      const now = new Date();

      // Example slotTime = "12:30 PM"
      const [time, modifier] = slotTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier?.toUpperCase() === "PM" && hours !== 12) {
        hours += 12;
      }

      if (modifier?.toUpperCase() === "AM" && hours === 12) {
        hours = 0;
      }

      const slotDate = new Date();
      slotDate.setHours(hours);
      slotDate.setMinutes(minutes);
      slotDate.setSeconds(0);
      slotDate.setMilliseconds(0);

      return slotDate.getTime() <= now.getTime();
    } catch {
      return false;
    }
  }

  const RenderSlot = ({ item, index, slots }: any) => {
    const disabled = isPastSlot(item);
    console.log("Slot:", item, "Disabled:", isPastSlot(item));

    return (
      <View style={{ width: "50%", padding: 4 }}>
        <Button
          mode="outlined"
          disabled={disabled}
          style={[
            styles.slotButton,
            disabled && { backgroundColor: "#f2f2f2", opacity: 0.5 },
          ]}
          labelStyle={styles.slotButtonLabel}
          onPress={() => {
            if (!disabled) {
              setSelectedSlot(item);
              setOpenPatientModal(true);
            }
          }}
        >
          {getSlotRangeFromList(slots, index, clinicInfo?.slot_size || 10)}
        </Button>
      </View>
    );
  };

  const BookPatient = () => {
    if (!selectPatient || !selectedSlot) {
      dispatch(setPatientError(true));
      return;
    }

    const selected = patientData?.find(
      (p: any) => p.patient_id === selectPatient
    );
    const age = selected?.age || calculateAgeFromDOB(selected?.dob);

    dispatch(
      PostAppointment({
        doctor_id: Number(doctor_id),
        sku_id: sku_data?.sku_id,
        patient_id: selectPatient,
        clinic_id: clinicInfo.id,
        schedule_date: convertDateToYYYYMMDD(),
        schedule_time: selectedSlot,
        payment_amount: 500,
        gender: selected.gender,
        age,
        patient_name: selected?.patient_name,
        patient_mobile_no: selected?.mobile_no,
        email: selected?.email_id,
        slot_size: clinicInfo.slot_size,
        source: "",
        schedule_remark: null,
      })
    );
  };

  if (isLoading) return <Loading />;

  if (isLoading) return <Loading />;

  if (isLoading) return <Loading />;

  const noSlotsAvailable =
    !dayData ||
    (dayData.morningSlots.length === 0 &&
      dayData.afternoonSlots.length === 0 &&
      dayData.eveningSlots.length === 0);

  return (
    <View style={{ flex: 1 }}>
      {/* Sticky Header */}
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
        <Appbar.Header>
          <Appbar.BackAction
            iconColor={theme.colors.primary}
            onPress={() => {
              dispatch(selectClinic(null));
              router.back();
            }}
          />
          <Appbar.Content
            title="Select Slot"
            titleStyle={{
              fontFamily: "Nunito_700Bold",
              color: theme.colors.primary,
            }}
          />
        </Appbar.Header>

        {/* Scrollable Content */}
        {isSuccess && (
          <FlatList
            data={[1]}
            keyExtractor={() => "slots"}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={() => (
              <>
                {/* Doctor Card */}
                {/* <Card style={styles.card}>
                  <Card.Title
                    title={doctorInfo?.name}
                    subtitle={doctorInfo?.speciality}
                    left={(props) => <Avatar.Icon {...props} icon="doctor" />}
                  />
                  <Card.Content>
                    <Text>{clinicInfo?.clinic_name}</Text>
                  </Card.Content>
                </Card> */}
                <Card style={styles.card}>
                  <Card.Content>
                    <View style={styles.headerRow}>
                      <Avatar.Icon
                        size={50}
                        icon="doctor"
                        style={styles.avatar}
                      />

                      <View style={styles.textContainer}>
                        <Text style={styles.doctorName}>
                          {clinicInfo?.clinic_name + " " || " "}
                        </Text>

                        <Text style={styles.speciality}>
                          {doctorInfo?.pharmaclient_name + " " || " "}
                          {doctorInfo?.last_name + " " || ""}
                        </Text>

                        <Text style={styles.speciality}>
                          {doctorInfo?.qualification + " " || " "}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.clinicRow}>
                      <Text style={styles.label}>In-Clinic Consultation</Text>
                      {/* <Text style={styles.clinicName}>
                        {clinicInfo?.clinic_name || "Clinic Name"}
                      </Text> */}
                    </View>
                  </Card.Content>
                </Card>

                {/* Slots */}
                {/* Slots */}
                {isSuccess && (
                  <>
                    {noSlotsAvailable ? (
                      <Card style={styles.noSlotCard}>
                        <Card.Content style={styles.noSlotContent}>
                          <Avatar.Icon
                            size={60}
                            icon="calendar-remove"
                            style={styles.noSlotIcon}
                          />

                          <Text style={styles.noSlotTitle}>
                            No Slots Available
                          </Text>

                          <Text style={styles.noSlotSubtitle}>
                            Slots are not available for today. Please try
                            another day.
                          </Text>
                        </Card.Content>
                      </Card>
                    ) : (
                      dayData &&
                      [
                        {
                          key: "morning",
                          label: "Morning",
                          icon: "weather-sunset",
                          data: dayData.morningSlots,
                        },
                        {
                          key: "afternoon",
                          label: "Afternoon",
                          icon: "weather-partly-cloudy",
                          data: dayData.afternoonSlots,
                        },
                        {
                          key: "evening",
                          label: "Evening",
                          icon: "weather-night",
                          data: dayData.eveningSlots,
                        },
                      ].map((period) => (
                        <Card key={period.key} style={styles.slotCard}>
                          <View style={styles.slotHeader}>
                            <View style={styles.slotTitleRow}>
                              <Avatar.Icon
                                size={32}
                                icon={period.icon}
                                style={styles.slotIcon}
                              />
                              <Text style={styles.heading}>{period.label}</Text>
                            </View>

                            <IconButton
                              icon={
                                expanded[period.key as SlotPeriod]
                                  ? "chevron-up"
                                  : "chevron-down"
                              }
                              onPress={() =>
                                toggleExpand(period.key as SlotPeriod)
                              }
                            />
                          </View>

                          <Expandable
                            expanded={expanded[period.key as SlotPeriod]}
                          >
                            {period.data.length > 0 ? (
                              <FlatList
                                data={period.data}
                                keyExtractor={(item, index) =>
                                  `${period.key}-${index}`
                                }
                                renderItem={({ item, index }) => (
                                  <RenderSlot
                                    item={item}
                                    index={index}
                                    slots={period.data}
                                  />
                                )}
                                numColumns={2}
                                scrollEnabled={false}
                              />
                            ) : (
                              <Text style={styles.noSlots}>
                                No slots in this session
                              </Text>
                            )}
                          </Expandable>
                        </Card>
                      ))
                    )}
                  </>
                )}
              </>
            )}
          />
        )}

        {/* Patient picker */}
        <Portal>
          {openPatientModal && (
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.3)",
                justifyContent: "flex-end",
              }}
            >
              {/* Click outside */}
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setOpenPatientModal(false)}
              />

              {/* Bottom Sheet */}
              <Animated.View
                style={{
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: "#fff",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 16,
                  maxHeight: "80%",
                }}
              >
                {/* Drag handle */}
                <View
                  style={{
                    alignSelf: "center",
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "#ccc",
                    marginBottom: 10,
                  }}
                />

                {/* Title */}
                <Text
                  style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}
                >
                  👤 Select Patient
                </Text>

                {/* SCROLLABLE LIST */}
                <FlatList
                  data={patientData}
                  keyExtractor={(item) => item.patient_id.toString()}
                  numColumns={2}
                  columnWrapperStyle={{ justifyContent: "space-between" }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 80 }}
                  renderItem={({ item }) => {
                    const isSelected = item.patient_id === selectPatient;

                    return (
                      <Card
                        style={[
                          styles.patientCard,
                          isSelected && styles.patientCardSelected,
                        ]}
                        onPress={() => {
                          dispatch(setPatient(item.patient_id));
                          dispatch(setPatientError(false));
                        }}
                      >
                        <View style={styles.patientCardContent}>
                          <Text
                            style={[
                              styles.patientName,
                              isSelected && { color: "#000" },
                            ]}
                          >
                            {item.patient_name}
                          </Text>
                        </View>
                      </Card>
                    );
                  }}
                />

                {/* FIXED BUTTONS */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 16,
                    right: 16,
                    marginBottom: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    onPress={() => {
                      setOpenPatientModal(false);
                      dispatch(setPatient(null));
                      dispatch(setPatientError(false));
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    mode="contained"
                    loading={ispostloading}
                    onPress={BookPatient}
                  >
                    Confirm Booking
                  </Button>
                </View>
              </Animated.View>
            </Animated.View>
          )}
        </Portal>

        {/* Success Dialog */}
        <Portal>
          <Dialog
            visible={showSuccessDialog}
            dismissable={false}
            style={styles.successDialog}
          >
            <Dialog.Content style={styles.successContent}>
              <Avatar.Icon size={60} icon="check" style={styles.successIcon} />

              <Text style={styles.successTitle}>Appointment Confirmed</Text>

              <Text style={styles.successMessage}>
                Your appointment has been booked successfully.
              </Text>
            </Dialog.Content>

            <Dialog.Actions style={styles.successActions}>
              <Button
                mode="contained"
                onPress={() => {
                  setShowSuccessDialog(false);
                  dispatch(resetPostAppointment());
                  dispatch(resetClinicSlot());
                  dispatch(resetClinic());
                  router.dismissAll();
                  router.push("/(home)/(tabs)/home");
                }}
              >
                Okey
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // card: { margin: 12, padding: 12, borderRadius: 12 },
  slotCard: { margin: 12, padding: 12, borderRadius: 12 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  heading: { fontSize: 16, fontWeight: "bold" },
  // patientGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  patientButton: { borderRadius: 20 },
  patientButtonSelected: { backgroundColor: "#0066cc" },
  card: {
    margin: 12,
    borderRadius: 12,
    elevation: 4,
    paddingVertical: 8,
  },

  /* ================= PATIENT LIST ================= */
  patientCard: {
    width: "48%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgb(17 117 193);",
    marginBottom: 10,
    elevation: 1,
  },

  patientCardSelected: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#1976D2",
  },

  patientCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  patientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    backgroundColor: "#4A90E2",
  },

  textContainer: {
    marginLeft: 12,
    flex: 1,
  },

  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
  },

  speciality: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },

  clinicRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 14,
    color: "#888",
  },

  clinicName: {
    fontSize: 15,
    fontWeight: "500",
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  slotTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  slotIcon: {
    backgroundColor: "#eef4ff",
  },

  slotButton: {
    borderRadius: 10,
    borderColor: "#d0d7ff",
  },

  slotButtonLabel: {
    fontSize: 14,
  },

  noSlots: {
    textAlign: "center",
    paddingVertical: 10,
    color: "#888",
  },
  patientDialog: {
    borderRadius: 16,
  },

  dialogTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  dialogActions: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },

  patientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  disabledSlot: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },

  disabledSlotText: {
    color: "#999",
  },

  successDialog: {
    borderRadius: 16,
  },

  successContent: {
    alignItems: "center",
    paddingVertical: 10,
  },

  successIcon: {
    backgroundColor: "#2ecc71",
    marginBottom: 12,
  },

  successTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },

  successMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  successActions: {
    justifyContent: "center",
    paddingBottom: 10,
  },
  noSlotCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 3,
  },

  noSlotContent: {
    alignItems: "center",
    paddingVertical: 20,
  },

  noSlotIcon: {
    backgroundColor: "#ffecec",
    marginBottom: 12,
  },

  noSlotTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  noSlotSubtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },

  bottomDialog: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    margin: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#fff",
  },
});

export default withTheme(CreateAppointment);
