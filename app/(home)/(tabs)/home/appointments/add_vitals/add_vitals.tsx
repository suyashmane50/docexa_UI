import { AppDispatch, RootState } from "@/store";
import { postSymptoms } from "@/store/features/appointments/SymptomSlice";
import { postVitals } from "@/store/features/appointments/VitalsSlice";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  Appbar,
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Portal,
  RadioButton,
  Text,
  TextInput,
  withTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

/* ------------------ HELPERS ------------------ */
const moveToTop = <T extends { id: string }>(
  list: T[],
  id: string,
  updater: (item: T) => T,
) => {
  const index = list.findIndex((i) => i.id === id);
  if (index === -1) return list;

  const updatedItem = updater(list[index]);
  return [updatedItem, ...list.slice(0, index), ...list.slice(index + 1)];
};

/* ------------------ SCREEN ------------------ */
function AddVitals({ theme }: any) {
  /* ---------- refs ---------- */
  const vitalInputRefs = useRef<{ [key: string]: any }>({});

  /* ---------- params ---------- */
  const { booking_id, patient_id } = useLocalSearchParams();
  const appointment_id = booking_id;

  /* ---------- redux ---------- */
  const dispatch = useDispatch<AppDispatch>();

  const vitalsFromStore = useSelector(
    (state: RootState) => state.vitalsMaster.vitalsData,
  );

  const symptomsFromStore = useSelector(
    (state: RootState) => state.symptomsMaster.SymptomData?.symptoms ?? [],
  );

  const fullState = useSelector((state: RootState) => state);

  const cancelSymptomSelection = () => {
    if (!activeSymptomId) return;

    setSymptoms((prev) =>
      prev.map((s) =>
        s.id === activeSymptomId
          ? {
              ...s,
              selected: false,
              description: "",
              since: { preset: null, value: null, unit: null },
              severity: null,
            }
          : s,
      ),
    );

    setShowSymptomModal(false);
    setActiveSymptomId(null);
  };

  const user_map_id =
    fullState?.appointment?.data?.doctors?.[0]?.medical_user_map?.id || null;

  /* ---------- state ---------- */
  const [vitals, setVitals] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);

  const [showAllVitals, setShowAllVitals] = useState(false);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);

  const [vitalSearch, setVitalSearch] = useState("");
  const [symptomSearch, setSymptomSearch] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setshowFailed] = useState(false);

  /* ---------- symptom modal (ID BASED) ---------- */
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [activeSymptomId, setActiveSymptomId] = useState<string | null>(null);

  const activeSymptom = useMemo(
    () => symptoms.find((s) => s.id === activeSymptomId) || null,
    [symptoms, activeSymptomId],
  );

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (vitalsFromStore?.length) {
      setVitals(
        vitalsFromStore.map((v: any) => ({
          ...v,
          selected: false,
          value: "",
        })),
      );
    }

    if (symptomsFromStore?.length) {
      setSymptoms(
        symptomsFromStore.map((s: any, i: number) => ({
          id: String(i),
          name: s.name,
          selected: false,
          description: "",
          since: { preset: null, value: null, unit: null },
          severity: null,
        })),
      );
    }
  }, [vitalsFromStore, symptomsFromStore]);

  /* ---------- FILTERING ---------- */
  const filteredVitals = useMemo(
    () =>
      vitals.filter((v) =>
        v.vital_name.toLowerCase().includes(vitalSearch.toLowerCase()),
      ),
    [vitals, vitalSearch],
  );

  const filteredSymptoms = useMemo(
    () =>
      symptoms.filter((s) =>
        s.name.toLowerCase().includes(symptomSearch.toLowerCase()),
      ),
    [symptoms, symptomSearch],
  );

  const topVitals = filteredVitals.slice(0, 5);
  const topSymptoms = filteredSymptoms.slice(0, 5);

  const selectedVitals = vitals.filter((v) => v.selected);
  const selectedSymptoms = symptoms.filter((s) => s.selected);

  /* ---------- VITAL TOGGLE ---------- */
  const toggleVital = (id: string) => {
    setVitals((prev) => {
      const updated = moveToTop(prev, id, (v) => ({
        ...v,
        selected: !v.selected,
      }));

      const selected = updated.find((v) => v.id === id);
      if (selected?.selected) {
        setTimeout(() => {
          vitalInputRefs.current[id]?.focus();
        }, 60);
      }

      return updated;
    });
  };

  /* ---------- OPEN SYMPTOM MODAL ---------- */
  const openSymptomModal = (id: string) => {
    setSymptoms((prev) =>
      moveToTop(prev, id, (s) => ({ ...s, selected: true })),
    );
    setActiveSymptomId(id);
    setShowSymptomModal(true);
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = () => {
    const vitalsWithValues = selectedVitals.filter(
      (v) => String(v.value).trim() !== "",
    );
    const pharmaClientId =
      fullState?.appointment?.data?.doctors[0]?.pharmaclient_id || null; // As Doctor Id For Symptoms
    console.log("selected Symptoms: ", selectedSymptoms);
    console.log("selected Vitals: ", selectedVitals);

    if (selectedSymptoms.length == 0 && selectedVitals.length == 0) {
      console.log("no selected any");
      setshowFailed(true);
    } else {
      if (selectedSymptoms.length != 0) {
        dispatch(
          postSymptoms({
            symptoms: selectedSymptoms,
            vitals: vitalsWithValues,
            user_map_id,
            booking_id: appointment_id,
            patientId: patient_id,
            doctor_id: pharmaClientId,
          }),
        );
        if (selectedVitals.length != 0) {
          dispatch(
            postVitals({
              symptoms: selectedSymptoms,
              vitals: vitalsWithValues,
              user_map_id,
              booking_id: appointment_id,
              patientId: patient_id,
            }),
          );
        }
      }
      setShowSuccess(true);
    }
  };

  /* ---------- UI ---------- */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Add Details" titleStyle={{fontWeight: 'bold'}} />
        </Appbar.Header>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ================= SYMPTOMS ================= */}
          <Text variant="titleMedium">Symptoms</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {topSymptoms.map((s) => (
              <Chip
                key={s.id}
                selected={s.selected}
                onPress={() => openSymptomModal(s.id)}
              >
                {s.name}
              </Chip>
            ))}
          </View>

          {selectedSymptoms.map((s) => (
            <View
              key={s.id}
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 8,
                backgroundColor: "#F9FAFB",
              }}
            >
              {/* 🔹 Symptom name */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  marginBottom: 4,
                  color: "#111827",
                }}
              >
                {s.name}
              </Text>

              {/* 🔹 Description */}
              <Text style={{ fontSize: 13, color: "#374151" }}>
                {s.description || "No description"}
              </Text>

              {/* 🔹 Meta info */}
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                Since:{" "}
                {s.since?.preset
                  ? s.since.preset
                  : s.since?.value && s.since?.unit
                    ? `${s.since.value} ${s.since.unit}`
                    : "—"}
                {"  |  "}
                Severity: {s.severity || "—"}
              </Text>
            </View>
          ))}

          <Button mode="text" onPress={() => setShowAllSymptoms((p) => !p)}>
            {showAllSymptoms ? "Hide symptoms" : "View all symptoms"}
          </Button>

          {showAllSymptoms && (
            <>
              <TextInput
                placeholder="Search symptoms"
                value={symptomSearch}
                onChangeText={setSymptomSearch}
              />
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {filteredSymptoms.map((s) => (
                  <Chip
                    key={s.id}
                    selected={s.selected}
                    onPress={() => openSymptomModal(s.id)}
                  >
                    {s.name}
                  </Chip>
                ))}
              </View>
            </>
          )}

          <Divider style={{ marginVertical: 16 }} />

          {/* ================= VITALS ================= */}
          <Text variant="titleMedium">Vitals</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {topVitals.map((v) => (
              <Chip
                key={v.id}
                selected={v.selected}
                onPress={() => toggleVital(v.id)}
              >
                {v.vital_name}
              </Chip>
            ))}
          </View>

          {selectedVitals.map((v) => (
            <TextInput
              key={v.id}
              ref={(ref: any) => {
                if (ref) vitalInputRefs.current[v.id] = ref;
              }}
              keyboardType="numeric"
              label={`${v.vital_name} (${v.unit})`}
              value={v.value}
              onChangeText={(text) =>
                setVitals((prev) =>
                  prev.map((x) => (x.id === v.id ? { ...x, value: text } : x)),
                )
              }
              style={{ marginTop: 10 }}
            />
          ))}

          <Button mode="text" onPress={() => setShowAllVitals((p) => !p)}>
            {showAllVitals ? "Hide vitals" : "View all vitals"}
          </Button>

          {showAllVitals && (
            <>
              <TextInput
                placeholder="Search vitals"
                value={vitalSearch}
                onChangeText={setVitalSearch}
              />
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {filteredVitals.map((v) => (
                  <Chip
                    key={v.id}
                    selected={v.selected}
                    onPress={() => toggleVital(v.id)}
                  >
                    {v.vital_name}
                  </Chip>
                ))}
              </View>
            </>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={{ marginTop: 24 }}
          >
            Submit Details
          </Button>
        </ScrollView>

        {/* ================= SYMPTOM MODAL ================= */}
        <Portal>
          <Dialog visible={showSymptomModal} dismissable={false}>
            <Dialog.Title>{activeSymptom?.name}</Dialog.Title>

            <Dialog.Content>
              {/* <TextInput
                label="Description"
                value={activeSymptom?.description || ""}
                onChangeText={(text) =>
                  setSymptoms((prev) =>
                    prev.map((s) =>
                      s.id === activeSymptomId
                        ? { ...s, description: text }
                        : s,
                    ),
                  )
                }
              /> */}

              <Text style={{ marginTop: 12 }}>Since</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {["1d", "2d", "3d", "1w", "2w", "1m", "3m", "6m", "1y"].map(
                  (p) => (
                    <Chip
                      key={p}
                      selected={activeSymptom?.since?.preset === p}
                      onPress={() =>
                        setSymptoms((prev) =>
                          prev.map((s) =>
                            s.id === activeSymptomId
                              ? {
                                  ...s,
                                  since: {
                                    preset: p,
                                    value: null,
                                    unit: null,
                                  },
                                }
                              : s,
                          ),
                        )
                      }
                    >
                      {p}
                    </Chip>
                  ),
                )}
              </View>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <TextInput
                  label="Value"
                  keyboardType="numeric"
                  style={{ flex: 1 }}
                  value={
                    activeSymptom?.since?.value
                      ? String(activeSymptom.since.value)
                      : ""
                  }
                  onChangeText={(t) =>
                    setSymptoms((prev) =>
                      prev.map((s) =>
                        s.id === activeSymptomId
                          ? {
                              ...s,
                              since: {
                                preset: null,
                                value: Number(t),
                                unit: s.since.unit,
                              },
                            }
                          : s,
                      ),
                    )
                  }
                />
                <TextInput
                  label="Unit"
                  placeholder="hours / days / weeks / months / years"
                  style={{ flex: 1 }}
                  value={activeSymptom?.since?.unit || ""}
                  onChangeText={(t) =>
                    setSymptoms((prev) =>
                      prev.map((s) =>
                        s.id === activeSymptomId
                          ? {
                              ...s,
                              since: {
                                ...s.since,
                                unit: t,
                                preset: null,
                              },
                            }
                          : s,
                      ),
                    )
                  }
                />
              </View>

              <Text style={{ marginTop: 12 }}>Severity</Text>
              <RadioButton.Group
                value={activeSymptom?.severity}
                onValueChange={(v) =>
                  setSymptoms((prev) =>
                    prev.map((s) =>
                      s.id === activeSymptomId ? { ...s, severity: v } : s,
                    ),
                  )
                }
              >
                <RadioButton.Item label="Mild" value="mild" />
                <RadioButton.Item label="Moderate" value="moderate" />
                <RadioButton.Item label="Severe" value="severe" />
              </RadioButton.Group>
              <TextInput
                label="Description"
                value={activeSymptom?.description || ""}
                onChangeText={(text) =>
                  setSymptoms((prev) =>
                    prev.map((s) =>
                      s.id === activeSymptomId
                        ? { ...s, description: text }
                        : s,
                    ),
                  )
                }
              />
            </Dialog.Content>

            <Dialog.Actions>
              <Button
                onPress={cancelSymptomSelection}
                textColor="#DC2626" // red cancel
              >
                Cancel
              </Button>

              <Button
                onPress={() => {
                  setShowSymptomModal(false);
                  setActiveSymptomId(null);
                }}
              >
                Done
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* ================= SUCCESS ================= */}
        <Portal>
          {/* success */}
          <Dialog
            visible={showSuccess}
            dismissable={false}
            style={{
              borderRadius: 18,
              width: "92%",
              alignSelf: "center",
            }}
          >
            <Dialog.Content
              style={{ alignItems: "center", paddingVertical: 24 }}
            >
              {/* Success Icon */}
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: "#DCFCE7",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <IconButton icon="check-circle" size={60} iconColor="#16A34A" />
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#111827",
                  textAlign: "center",
                }}
              >
                Details Saved
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  marginTop: 8,
                  textAlign: "center",
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 20,
                }}
              >
                Patient symptoms and vitals were added successfully.
              </Text>
            </Dialog.Content>

            <Dialog.Actions
              style={{
                justifyContent: "center",
                paddingBottom: 22,
              }}
            >
              <Button
                mode="contained"
                buttonColor="#16A34A"
                contentStyle={{ paddingHorizontal: 34 }}
                style={{ borderRadius: 24 }}
                onPress={() => {
                  setShowSuccess(false);
                  router.push("/(home)/(tabs)/home");
                }}
              >
                Continue
              </Button>
            </Dialog.Actions>
          </Dialog>
          {/* failure  */}
          <Dialog
            visible={showFailed}
            dismissable={false}
            style={{
              borderRadius: 18,
              width: "92%",
              alignSelf: "center",
            }}
          >
            <Dialog.Content
              style={{ alignItems: "center", paddingVertical: 24 }}
            >
              {/* Error Icon */}
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: "#FEE2E2",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <IconButton icon="close-circle" size={60} iconColor="#DC2626" />
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#111827",
                  textAlign: "center",
                }}
              >
                No Data Added
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  marginTop: 8,
                  textAlign: "center",
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 20,
                }}
              >
                Please select at least one symptom or vital before submitting.
              </Text>
            </Dialog.Content>

            <Dialog.Actions
              style={{
                justifyContent: "center",
                paddingBottom: 22,
              }}
            >
              <Button
                mode="contained"
                buttonColor="#DC2626"
                contentStyle={{ paddingHorizontal: 34 }}
                style={{ borderRadius: 24 }}
                onPress={() => setshowFailed(false)}
              >
                Try Again
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </KeyboardAvoidingView>
  );
}

export default withTheme(AddVitals);
