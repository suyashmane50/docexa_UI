import Loading from "@/components/Loading";
import { AppDispatch, RootState } from "@/store";
import { getPatinetByid } from "@/store/features/appointments/patient/getPatientByIdSlice";
import {
  StdToDDMMMMYY,
  scale,
  verticalScale,
  responsiveFontSize,
} from "@/utils/common";
import { router, useLocalSearchParams } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import {
  Appbar,
  Card,
  Icon,
  Button,
  Dialog,
  Portal,
  TextInput,
  withTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { DatePickerInput } from "react-native-paper-dates";
import { fetchDashboard } from "@/store/features/appointments/AppointmentSlice";
import { getPatinet } from "@/store/features/appointments/patient/getPatientSlice";
import { EditPatient } from "@/store/features/appointments/patient/EditPatientSlice";

/* ---------- GENDER AVATARS ---------- */
const GENDER_AVATAR: any = {
  "1": require("../../../../../assets/images/gender/male_default.png"),
  "2": require("../../../../../assets/images/gender/female_default.png"),
  default: require("../../../../../assets/images/gender/both_default.png"),
};

function view({ theme }: { theme: any }) {
  const { id } = useLocalSearchParams();
  const dispatch: AppDispatch = useDispatch();

  const {
    isError,
    isLoading,
    isSuccess,
    message,
    name,
    dob,
    height,
    weight,
    gender,
  } = useSelector((state: RootState) => state.getpatient);

  const [saving, setSaving] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);

  /* ---------- EDIT STATES ---------- */
  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState<Date | undefined>();
  const [editHeight, setEditHeight] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editGender, setEditGender] = useState<string>("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const genderLabel =
    gender == "1" ? "Male" : gender == "2" ? "Female" : "Not Available";

  const defaultAvatar =
    GENDER_AVATAR[gender as "1" | "2"] || GENDER_AVATAR.default;

  /* ---------- FETCH ---------- */
  useEffect(() => {
    dispatch(getPatinetByid(id));
  }, [id]);

  /* ---------- PREFILL MODAL ---------- */
  useEffect(() => {
    if (isSuccess) {
      setEditName(name || "");
      setEditDob(dob ? new Date(dob) : undefined);
      setEditHeight(height?.toString() || "");
      setEditWeight(weight?.toString() || "");
      setEditGender(gender || "");
    }
  }, [isSuccess]);

  /* ---------- IMAGE PICKER ---------- */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Permission Required",
        textBody: "Please allow gallery access",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const fetchdashboard = () => {
    try {
      dispatch(fetchDashboard());
      dispatch(getPatinet());
    } catch (error) {}
  };

  /* ---------- SAVE EDIT ---------- */
  const handleSaveEdit = async () => {
    const updatedPatient = {
      id,
      name: editName,
      dob: editDob ? editDob.toISOString().split("T")[0] : null,
      height: editHeight ? Number(editHeight) : null,
      weight: editWeight ? Number(editWeight) : null,
      gender: editGender,
      profileImage,
    };

    console.log("🧾 Updated Patient Payload:", updatedPatient);

    try {
      setSaving(true);
      const result = await dispatch(EditPatient(updatedPatient)).unwrap();

      console.log("✅ API Response:", result);

      if (result?.status === true) {
        await fetchdashboard(); // 🔁 refresh data
        setEditVisible(false); // close edit modal
        setShowSuccessModal(true); // show success modal
      }
    } catch (err: any) {
      console.log("❌ Edit failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {(isLoading || saving) && <Loading />}

      {isSuccess && (
        <>
          <Appbar.Header>
            <Appbar.BackAction
              color={theme.colors.primary}
              onPress={router.back}
            />
            <Appbar.Content
              title="Patient Details"
              titleStyle={{
                fontWeight: "bold",
              }}
            />
            <Appbar.Action icon="pencil" onPress={() => setEditVisible(true)} />
          </Appbar.Header>

          <View style={{ padding: 16 }}>
            <Card style={styles.card}>
              <Card.Content>
                {/* PROFILE */}
                <View style={styles.profileRow}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={
                        profileImage ? { uri: profileImage } : defaultAvatar
                      }
                      style={styles.avatar}
                    />
                    <TouchableOpacity
                      style={styles.editIcon}
                      onPress={pickImage}
                    >
                      <Icon source="pencil" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <View style={{ marginLeft: 16 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.genderChip}>{genderLabel}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* DETAILS */}
                <Info label="DOB" value={StdToDDMMMMYY(dob)} />
                <Info
                  label="Height"
                  value={height ? `${height} Cm` : "Not Measured"}
                />
                <Info
                  label="Weight"
                  value={weight ? `${weight} Kg` : "Not Measured"}
                />
              </Card.Content>
            </Card>
          </View>
        </>
      )}

      {/* ---------- EDIT MODAL ---------- */}
      <Portal>
        <Dialog
          visible={editVisible}
          onDismiss={() => setEditVisible(false)}
          style={styles.dialog}
        >
          {/* HEADER */}
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Edit Patient</Text>
            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Icon source="close" size={22} />
            </TouchableOpacity>
          </View>

          {/* BODY */}
          <Dialog.ScrollArea style={styles.scrollArea}>
            <Dialog.Content style={styles.dialogContent}>
              <View style={styles.fieldWrap}>
                <TextInput
                  mode="outlined"
                  label="Full Name"
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />
              </View>

              <View style={styles.fieldWrap}>
                <DatePickerInput
                  mode="outlined"
                  label="Date of Birth"
                  locale="en"
                  inputMode="start"
                  value={editDob}
                  onChange={setEditDob}
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldWrap}>
                <TextInput
                  mode="outlined"
                  label="Height (cm)"
                  value={editHeight}
                  keyboardType="numeric"
                  onChangeText={setEditHeight}
                  style={styles.input}
                  left={<TextInput.Icon icon="human-male-height" />}
                />
              </View>

              <View style={styles.fieldWrap}>
                <TextInput
                  mode="outlined"
                  label="Weight (kg)"
                  value={editWeight}
                  keyboardType="numeric"
                  onChangeText={setEditWeight}
                  style={styles.input}
                  left={<TextInput.Icon icon="scale-bathroom" />}
                />
              </View>
            </Dialog.Content>
          </Dialog.ScrollArea>

          {/* FOOTER */}
          <Dialog.Actions style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => setEditVisible(false)}
              style={styles.cancelBtn}
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={handleSaveEdit}
              style={styles.saveBtn}
            >
              Save Changes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {isError && (
        <View>
          <Text>{message}</Text>
        </View>
      )}

      <Portal>
        <Dialog
          visible={showSuccessModal}
          onDismiss={() => setShowSuccessModal(false)}
          style={{ borderRadius: 20 }}
        >
          <Dialog.Content style={{ alignItems: "center", paddingVertical: 20 }}>
            <Icon source="check-circle" size={48} color="#22c55e" />
            <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 12 }}>
              Updated Successfully
            </Text>
            <Text style={{ marginTop: 6, color: "#666", textAlign: "center" }}>
              Patient details have been saved.
            </Text>
          </Dialog.Content>

          <Dialog.Actions style={{ justifyContent: "center" }}>
            <Button
              mode="contained"
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/home"); // 🔁 go to home
              }}
              style={{ borderRadius: 10, paddingHorizontal: 24 }}
            >
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

/* ---------- SMALL COMPONENT ---------- */
const Info = ({ label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "Not Available"}</Text>
  </View>
);

export default memo(withTheme(view));

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  dialog: {
    borderRadius: 20,
    paddingTop: 8,
    maxHeight: "90%",
  },
  scrollArea: {
    maxHeight: "75%",
  },

  dialogContent: {
    paddingBottom: 80,
  },

  fieldWrap: {
    marginBottom: 16,
  },

  input: {
    marginTop: 0,
  },

  /* 🔥 This fixes DatePicker overlap */
  dateInput: {
    marginTop: 12,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    borderRadius: 20,
    elevation: 3,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#0051a7",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  genderChip: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: verticalScale(6),
  },
  label: {
    fontWeight: "600",
    fontFamily: "Nunito_600SemiBold",
    fontSize: responsiveFontSize(14),
    color: "#616161",
  },
  value: {
    fontFamily: "Nunito_700Bold",
    fontSize: responsiveFontSize(14),
    color: "#212121",
    flex: 1,
    textAlign: "right",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // dialog: {
  //   borderRadius: 20,
  //   paddingTop: 8,
  // },

  dialogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  // input: {
  //   marginTop: 10,
  // },

  // row: {
  //   flexDirection: "row",
  //   flexWrap: "wrap", // 🔥 prevents overlap
  //   justifyContent: "space-between",
  //   gap: 10,
  // },

  half: {
    width: "48%", // 🔥 stable width on phones
    minWidth: "48%",
  },

  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  cancelBtn: {
    borderRadius: 10,
  },

  saveBtn: {
    borderRadius: 10,
  },
  toastWrapper: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },

  toastBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  toastText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
});
