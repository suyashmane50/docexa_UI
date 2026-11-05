import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  Appbar,
  Button,
  Chip,
  Divider,
  IconButton,
  Text,
  withTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchPrescriptions } from "@/store/features/prescriptions/prescription";

const LIMIT = 1;
const hasMeaningfulData = (value: any) => {
  if (!value) return false;

  // handle stringified arrays like "[]"
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "[]" || trimmed === '""') return false;
  }

  return true;
};

/* ---------- helpers ---------- */
const parseRow = (value?: string) => {
  try {
    return value
      ? JSON.parse(value)
          .map((v: any) => v.name)
          .join(", ")
      : "";
  } catch {
    return "";
  }
};
const hasValue = (v: any) =>
  v !== null && v !== undefined && String(v).trim() !== "";

const parseReferDoctor = (value?: string) => {
  try {
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
};

function prescription_list({ theme }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { patient } = useLocalSearchParams();

  const patientData = patient ? JSON.parse(patient as string) : null;

  const user_map_id = useSelector(
    (state: RootState) =>
      state.appointment?.data?.doctors?.[0]?.medical_user_map?.id ?? null,
  );

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const formatDateDMY = (dateStr?: string) => {
    if (!dateStr) return "";

    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  /* ---------- fetch ---------- */
  useEffect(() => {
    if (!user_map_id || !patientData?.patient_id) return;

    setLoading(true);

    dispatch(
      fetchPrescriptions({
        user_map_id,
        patient_id: patientData.patient_id,
        page,
        limit: LIMIT,
      }),
    )
      .unwrap()
      .then((res) => {
        setPrescriptions(res.data || []);
        setTotal(res.total_prescription || 0);
      })
      .catch((err) => {
        console.error("Prescription API Error:", err);
      })
      .finally(() => setLoading(false));
  }, [dispatch, user_map_id, patientData?.patient_id, page]);

  /* ---------- UI card ---------- */
  const PrescriptionCard = ({ item }: any) => (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <Text style={{ fontWeight: "700", fontSize: 15 }}>
        Consultation Date: <Text>{formatDateDMY(item?.date)}</Text>
      </Text>
      <Text style={{ marginTop: 2 }}>
        Doctor: Dr. {item.doctor?.first_name} {item.doctor?.last_name}
      </Text>

      <Divider style={{ marginVertical: 10 }} />

      {/* Follow up */}
      {/* {item.follow_up && <Text>▸ Follow Up: {item.follow_up}</Text>} */}
      {item.follow_up && (
        <View style={{ marginTop: 6, marginBottom: 6 }}>
          <Chip
            icon="calendar-clock"
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#E3F2FD", // soft medical blue
            }}
            textStyle={{
              fontWeight: "600",
              color: "#0D47A1",
            }}
          >
            Follow Up: {item.follow_up}
          </Chip>
        </View>
      )}

      {/* Vitals */}
      {item.vitals?.length > 0 && (
        <>
          <Text style={{ marginTop: 4, fontWeight: "700" }}>▸ Vitals </Text>
          <Text style={{ marginLeft: 8 }}>
            •{" "}
            {item.vitals
              .map((v: any) => `${v.vital_name}: ${v.value}`)
              .join(", ")}
          </Text>
        </>
      )}

      {/* Complaints */}
      {(hasMeaningfulData(item.complaints) ||
        hasMeaningfulData(item.complaints_row)) && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>
            ▸ Complaints / Symptoms
          </Text>
          <Text style={{ marginLeft: 8 }}>
            • {item.complaints || parseRow(item.complaints_row)}
          </Text>
        </>
      )}

      {/* Diagnosis */}
      {(hasMeaningfulData(item.diagnosis) ||
        hasMeaningfulData(item.diagnosis_row)) && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>▸ Diagnosis</Text>
          <Text style={{ marginLeft: 8 }}>
            • {item.diagnosis || parseRow(item.diagnosis_row)}
          </Text>
        </>
      )}

      {/* Medical History */}
      {(hasMeaningfulData(item.medical_history) ||
        hasMeaningfulData(item.medical_history_row)) && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>
            ▸ Medical History
          </Text>
          <Text style={{ marginLeft: 8 }}>
            • {item.medical_history || parseRow(item.medical_history_row)}
          </Text>
        </>
      )}

      {/* Lifestyle */}
      {item.lifestyle && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>▸ Lifestyle</Text>
          <Text style={{ marginLeft: 8 }}>• {item.lifestyle}</Text>
        </>
      )}
      {/* Investigation Results */}
      {item.patient_reports?.length > 0 && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>
            ▸ Investigation Results
          </Text>

          {item.patient_reports
            .sort((a: any, b: any) => a.sequence_no - b.sequence_no)
            .map((report: any, index: number) => (
              <Text key={index} style={{ marginLeft: 8, marginTop: 4 }}>
                • {report.name} :{" "}
                <Text style={{ fontWeight: "700" }}>{report.value}</Text>{" "}
                {report.unit}
              </Text>
            ))}
        </>
      )}

      {/* Vaccination Given */}
      {/* Vaccination Given */}
      {item.vaccination_given?.length > 0 && (
        <>
          {/* Section Header with Icon */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ fontWeight: "700", marginRight: 6 }}>
              ▸ Vaccination Given
            </Text>

            <IconButton
              icon="check-circle"
              size={16}
              iconColor="#2E7D32" // green
              style={{ margin: 0 }}
            />
          </View>

          {/* Items */}
          {item.vaccination_given.map((v: any, index: number) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 8,
                marginTop: 4,
              }}
            >
              <Text style={{ flex: 1 }}>
                • {v.vaccine_name} ({v.vaccine_category}) – Given on{" "}
                <Text style={{ fontWeight: "700" }}>
                  {v.given_date?.split(" ")[0]}
                </Text>
                {v.brand_name ? ` | Brand: ${v.brand_name}` : ""}
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Vaccination Due */}
      {item.vaccination_due?.length > 0 && (
        <>
          {/* Section Header with Icon */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ fontWeight: "700", marginRight: 6 }}>
              ▸ Vaccination Due
            </Text>

            <IconButton
              icon="clock-outline"
              size={16}
              iconColor="#F9A825" // yellow
              style={{ margin: 0 }}
            />
          </View>

          {/* Items */}
          {item.vaccination_due.map((v: any, index: number) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 8,
                marginTop: 4,
              }}
            >
              <Text style={{ flex: 1 }}>
                • {v.vaccine_name} ({v.vaccine_category}) – Due on{" "}
                <Text style={{ fontWeight: "700" }}>
                  {v.due_date?.split(" ")[0]}
                </Text>
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Systemic Examination */}
      {/* {item.systemic_examination && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>
            ▸ Systemic Examination
          </Text>
          <Text>
            {Object.entries(item.systemic_examination)
              .filter(([_, v]) => v)
              .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
              .join(", ")}
          </Text>
        </>
      )} */}

      {/* Advice */}
      {item.advice && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>▸ Advice</Text>
          <Text style={{ marginLeft: 8 }}>• {item.advice}</Text>
        </>
      )}

      {/* Tests */}
      {item.test_requested && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>
            ▸ Tests Requested
          </Text>
          <Text style={{ marginLeft: 8 }}>• {item.test_requested}</Text>
        </>
      )}

      {/* Drugs */}
      {item.medication?.length > 0 && (
        <>
          <Text style={{ marginTop: 12, fontWeight: "700" }}>Drugs</Text>

          {item.medication.map((m: any) => (
            <View
              key={m.id || m.uuid}
              style={{
                marginTop: 8,
                marginLeft: 8,
                padding: 10,
                borderRadius: 8,
                backgroundColor: "#F9FAFB",
              }}
            >
              {/* Name (always shown) */}
              <Text style={{ fontWeight: "700" }}>
                {m.medication_type} – {m.medication_name}
              </Text>

              {hasValue(m.timing) && (
                <Text style={{ color: "#374151", marginTop: 2 }}>
                  Timing: {m.timing}
                </Text>
              )}

              {hasValue(m.quantity) && (
                <Text style={{ color: "#374151" }}>Quantity: {m.quantity}</Text>
              )}

              {hasValue(m.duration) && (
                <Text style={{ color: "#374151" }}>
                  Duration: {m.duration}
                  {hasValue(m.durationValidity)
                    ? ` (${m.durationValidity})`
                    : ""}
                </Text>
              )}

              {hasValue(m.doses) && (
                <Text style={{ color: "#374151" }}>Doses: {m.doses}</Text>
              )}

              {hasValue(m.note) && (
                <Text style={{ color: "#6B7280", marginTop: 4 }}>
                  Note: {m.note}
                </Text>
              )}
            </View>
          ))}
        </>
      )}

      {/* Notes */}
      {item.note && item.note !== '""' && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>▸ Note</Text>
          <Text style={{ marginLeft: 8 }}>• {item.note}</Text>
        </>
      )}
      {/* Referred Doctor */}
      {parseReferDoctor(item.refer_doctor)?.length > 0 && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "700" }}>
            ▸ Referred Doctor
          </Text>

          {parseReferDoctor(item.refer_doctor).map(
            (doc: any, index: number) => (
              <View key={index} style={{ marginLeft: 8, marginTop: 6 }}>
                <Text style={{ fontWeight: "700" }}>• {doc.doctor_name}</Text>

                {doc.speciality && (
                  <Text style={{ marginLeft: 8 }}>
                    Speciality: {doc.speciality}
                  </Text>
                )}

                {doc.clinic_address && (
                  <Text style={{ marginLeft: 8 }}>
                    Clinic: {doc.clinic_address}
                  </Text>
                )}

                {doc.mobile_number && (
                  <Text style={{ marginLeft: 8 }}>
                    Contact: {doc.mobile_number}
                  </Text>
                )}

                {doc.refer_note && (
                  <Text style={{ marginLeft: 8 }}>Note: {doc.refer_note}</Text>
                )}
              </View>
            ),
          )}
        </>
      )}
    </View>
  );

  /* ---------- render ---------- */
  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction
          color={theme.colors.primary}
          onPress={() => router.back()}
        />
        <Appbar.Content
          title="Prescription"
          titleStyle={{ fontFamily: "Nunito_700Bold" }}
          color={theme.colors.primary}
        />
      </Appbar.Header>

      <ScrollView style={{ padding: 16 }}>
        {/* <Text style={{ fontSize: 16, fontWeight: "700" }}>
          Patient: {patientData?.patient_name}
        </Text>

        <Text style={{ marginBottom: 12 }}>Total Prescriptions: {total}</Text> */}

        <View
          style={{
            backgroundColor: "#F5F7FA",
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E0E0E0",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1A237E",
            }}
          >
            {patientData?.patient_name}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 6,
            }}
          >
            <Text style={{ color: "#555" }}>Total Prescriptions:</Text>

            <Text
              style={{
                marginLeft: 6,
                fontWeight: "700",
                color: theme.colors.primary,
              }}
            >
              {total}
            </Text>
          </View>
        </View>

        {loading && <Text>Loading prescriptions…</Text>}

        {!loading && prescriptions.length === 0 && (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <IconButton
              icon="file-document-outline"
              size={64}
              iconColor="#9CA3AF"
            />

            <Text
              variant="titleMedium"
              style={{ marginTop: 12, fontWeight: "600" }}
            >
              No Prescriptions Found
            </Text>

            <Text
              variant="bodyMedium"
              style={{
                marginTop: 6,
                color: "#6B7280",
                textAlign: "center",
              }}
            >
              This patient doesn’t have any prescriptions yet.
            </Text>

            {/* <Button
              mode="contained"
              style={{ marginTop: 20, borderRadius: 8 }}
              onPress={() => {
                // navigate to add prescription screen
              }}
            >
              Add Prescription
            </Button> */}
          </View>
        )}

        {prescriptions.map((item) => (
          <PrescriptionCard key={item.id} item={item} />
        ))}

        {/* Pagination */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          <IconButton
            icon="chevron-left"
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
          />

          <Text>
            Page {page} / {Math.max(1, Math.ceil(total / LIMIT))}
          </Text>

          <IconButton
            icon="chevron-right"
            disabled={page * LIMIT >= total}
            onPress={() => setPage(page + 1)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export default withTheme(prescription_list);
