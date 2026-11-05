import Loading from "@/components/Loading";
import NoDataFound from "@/components/NoDataFound";
import { getAppointment } from "@/store/features/appointments/FetchAppointmentSlice";
import { fetchOnCallSlot } from "@/store/features/appointments/oncall/FetchOnCallSlotSlice";
import {
  oncallAppoitment,
  PostOnCallAppointment,
  resetPostAppointment,
  setPatient,
  setPatientError,
  setSelectedTelephonicSlot,
} from "@/store/features/appointments/oncall/PostOnCallSlotSlice";
import { getPatinet } from "@/store/features/appointments/patient/getPatientSlice";
import { AppDispatch, RootState } from "@/store";
import {
  convertDateToYYYYMMDD,
  currentWeekday,
  daytime,
  nighttime,
  to12hr,
  whatsapp,
} from "@/utils/common";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { addMinutes, format, isBefore } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import React, { memo, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Chip,
  HelperText,
  Icon,
  IconButton,
  withTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

const LeftContent = (props: any) => (
  <Avatar.Icon {...props} icon="doctor" size={48} />
);

const { width } = Dimensions.get("window");

function Index({ theme }: any) {
  const { doctor_id }: any = useLocalSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const current = currentWeekday();

  const [slot, setSlot] = useState<any>();
  const [expandedItems, setExpandedItems] = useState<any>({});

  useEffect(() => {
    dispatch(fetchOnCallSlot(doctor_id));
    dispatch(getPatinet());
  }, [doctor_id]);

  const { datats, isLoading, isSuccess, doctorInfo, clinicInfo } = useSelector(
    (state: RootState) => state.getoncallslot,
  );

  const {
    patinetError,
    ispostloading,
    ispostssuccess,
    isposterror,
    selectPatient,
    telephonic_id,
  } = useSelector((state: RootState) => state.postoncallslot);

  const { data: patientData } = useSelector(
    (state: RootState) => state.patients,
  );

  const toggleExpand = (id: number) => {
    setExpandedItems((prev: any) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = ["75%"];

  const generateTimeSlots = (
    id: number | string,
    startTime: string,
    endTime: string,
    interval = 10,
  ) => {
    const slots = [];
    let currentTime = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    while (isBefore(currentTime, end)) {
      const slotStart = format(currentTime, "HH:mm");
      currentTime = addMinutes(currentTime, interval);
      const slotEnd = isBefore(currentTime, end)
        ? format(currentTime, "HH:mm")
        : format(end, "HH:mm");
      slots.push({ id, start_time: slotStart, end_time: slotEnd });
    }

    return slots;
  };

  // ✅ Expo-safe phone call
  const call = async (phone: string) => {
    if (!phone) return;
    await Linking.openURL(`tel:${phone}`);
  };

  const BookPatient = () => {
    if (!selectPatient) {
      dispatch(setPatientError(true));
      return;
    }

    const body: oncallAppoitment = {
      patient_id: selectPatient,
      phone: patientData?.[0]?.phone || "NA",
      doctor_id,
      call_type: "direct",
      telephonic_id,
      status: "0",
      request_date_time: `${convertDateToYYYYMMDD()} ${slot}`,
    };

    dispatch(PostOnCallAppointment(body));
  };

  useEffect(() => {
    if (ispostssuccess) {
      dispatch(getAppointment());
      router.dismissAll();
      router.push(
        "/(home)/(tabs)/appointments/choose/clinic/create/confirm",
      );
    }

    return () => {
      if (ispostssuccess) dispatch(resetPostAppointment());
    };
  }, [ispostssuccess, isposterror]);

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "#edf2f4" }}>
        {isSuccess && (
          <View style={styles.container}>
            <Card mode="contained">
              <IconButton
                icon="keyboard-backspace"
                onPress={() => router.back()}
              />
            </Card>

            <Card style={styles.card} mode="contained">
              <Card.Title
                title={doctorInfo?.name}
                subtitle={doctorInfo?.speciality}
                left={LeftContent}
              />
              <Card.Content>
                <Text>{clinicInfo?.clinic_name}</Text>
                <View style={{ flexDirection: "row", marginTop: 12 }}>
                  <Button
                    icon="phone"
                    mode="contained"
                    onPress={() => call(doctorInfo?.phone)}
                  >
                    Call
                  </Button>
                  <Button
                    icon="whatsapp"
                    mode="contained"
                    onPress={() => whatsapp(doctorInfo?.whatsapp)}
                  >
                    WhatsApp
                  </Button>
                </View>
              </Card.Content>
            </Card>

            <FlatList
              data={datats}
              keyExtractor={(i) => `${i.id}`}
              renderItem={({ item, index }) => (
                <Card style={{ marginBottom: 12 }} mode="contained">
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>
                      {to12hr(item.start_time)} - {to12hr(item.end_time)}
                    </Text>
                    <IconButton
                      icon={
                        expandedItems[item.id] ? "chevron-up" : "chevron-down"
                      }
                      onPress={() => toggleExpand(item.id)}
                    />
                  </View>

                  {expandedItems[item.id] && (
                    <FlatList
                      data={generateTimeSlots(
                        item.id,
                        item.start_time,
                        item.end_time,
                      )}
                      numColumns={2}
                      renderItem={({ item }) => (
                        <Button
                          onPress={() => {
                            setSlot(item.start_time);
                            dispatch(setSelectedTelephonicSlot(item.id));
                            bottomSheetRef.current?.expand();
                          }}
                        >
                          {to12hr(item.start_time)} - {to12hr(item.end_time)}
                        </Button>
                      )}
                    />
                  )}
                </Card>
              )}
            />
          </View>
        )}

        {isLoading && <Loading />}
      </ScrollView>

      <BottomSheetModalProvider>
        <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={-1}>
          <View style={{ padding: 16 }}>
            <Text>Select Patient</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {patientData?.map((p: any) => (
                <Chip
                  key={p.id}
                  selected={p.id === selectPatient}
                  onPress={() => dispatch(setPatient(p.id))}
                >
                  {p.patient_name}
                </Chip>
              ))}
            </View>

            <Button mode="contained" onPress={BookPatient}>
              Book
            </Button>
          </View>
        </BottomSheet>
      </BottomSheetModalProvider>
    </>
  );
}

export default memo(withTheme(Index));

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 10 },
});
