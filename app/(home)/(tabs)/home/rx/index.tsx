import { router } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { State } from "react-native-gesture-handler";
import {
  Appbar,
  Avatar,
  Card,
  IconButton,
  Text,
  withTheme,
} from "react-native-paper";
import { useSelector } from "react-redux";

const getRedableGender = (gender: number): string => {
  return gender === 1 ? "Male" : "Female";
};

const getReadableAge = (dob: string): string => {
  if (!dob) return "-";

  const birthDate = new Date(dob);
  const today = new Date();

  const diffMs = today.getTime() - birthDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays} Days`;

  const diffMonths =
    today.getFullYear() * 12 +
    today.getMonth() -
    (birthDate.getFullYear() * 12 + birthDate.getMonth());

  if (diffMonths < 24) return `${diffMonths} Month`;

  return `${today.getFullYear() - birthDate.getFullYear()} Year`;
};

function index({ theme }: any) {
  const [patientList, setPatientList] = useState<any[]>([]);
  const fullState: any = useSelector((state: State) => state);

  useEffect(() => {
    const patients = fullState?.appointment?.data?.patients ?? [];
    if (patients.length > 0) {
      setPatientList(patients);
    }
  }, [fullState?.appointment?.data?.patients]);

  function navigateToViewPrescription(patient: any) {
    router.push({
      pathname: "/(home)/(tabs)/home/rx/prescription_list",
      params: {
        patient: JSON.stringify(patient),
      },
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction
          color={theme.colors.primary}
          onPress={() => router.back()}
        />
        <Appbar.Content
          title="Patients"
          titleStyle={{ fontFamily: "Nunito_700Bold" }}
          color={theme.colors.primary}
        />
      </Appbar.Header>

      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
          Select Patient
        </Text>

        {patientList.map((patient) => (
          <Card
            key={patient.patient_id}
            style={{
              marginBottom: 12,
              borderRadius: 12,
            }}
          >
            <Card.Content
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left: Avatar + Details */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Avatar.Icon
                  size={48}
                  icon="account"
                  style={{ marginRight: 12 }}
                />

                <View>
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>
                    {patient.patient_name}
                  </Text>
                  <Text style={{ marginTop: 2 }}>
                    Age: {getReadableAge(patient.dob)}
                  </Text>
                  <Text style={{ marginTop: 2 }}>
                    Gender: {getRedableGender(patient.gender)}
                  </Text>
                </View>
              </View>

              {/* Right: Arrow Button */}
              <IconButton
                icon="chevron-right"
                size={28}
                onPress={() => navigateToViewPrescription(patient)}
              />
            </Card.Content>
          </Card>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

export default memo(withTheme(index));
