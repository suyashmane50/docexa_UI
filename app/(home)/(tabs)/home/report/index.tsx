import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Appbar, Card, useTheme, Avatar } from "react-native-paper";
import { router } from "expo-router";
import { scale, verticalScale, responsiveFontSize } from "@/utils/common";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { State } from "react-native-gesture-handler";
import { Image } from "react-native";
import { fetchReports } from "@/store/features/uploaded_reports/uploadedReportsSlice";
import { AppDispatch } from "@/store";

const maleIcon = require("@/assets/icons/flaticons/male.png");
const femaleIcon = require("@/assets/icons/flaticons/female.png");

interface Patient {
  id: string;
  name: string;
  uhid: string;
}

export default function Report() {
  //y -- Get Patients from State -- (T)
  const [patientList, setPatientList] = useState<any[]>([]);
  const fullState: any = useSelector((state: State) => state);

  useEffect(() => {
    const patients = fullState?.appointment?.data?.patients ?? [];
    setPatientList(patients);
  }, [fullState?.appointment?.data?.patients]);

  const calculateAge = (dob: string | null) => {
    if (!dob) return "N/A";

    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust days
    if (days < 0) {
      months--;
      const prevMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
      ).getDate();
      days += prevMonth;
    }

    // Adjust months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Format output
    if (years > 0) return `${years} year${years > 1 ? "s" : ""}`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""}`;
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  //y -- Get Patients from State -- (B)
  const theme = useTheme();

  const renderPatient = ({ item }: { item: any }) => (
    <Card
      style={{
        marginHorizontal: scale(16),
        marginBottom: verticalScale(12),
        borderRadius: scale(12),
        elevation: 2,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Card.Content
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left Section */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
          }}
        >
          {/* Gender Icon */}
          <Image
            source={item.gender === 1 ? maleIcon : femaleIcon}
            style={{
              width: scale(32),
              height: scale(32),
              marginRight: scale(12),
            }}
            resizeMode="contain"
          />

          {/* Patient Details */}
          <View>
            <Text
              style={{
                fontSize: responsiveFontSize(16),
                fontFamily: "Nunito_700Bold",
              }}
            >
              {item.patient_name}
            </Text>

            {/* Age + Gender */}
            <Text
              style={{
                marginTop: verticalScale(2),
                fontSize: responsiveFontSize(13),
                color: "#777",
              }}
            >
              Age: {calculateAge(item.dob)}
              {/* |{" "}
              {item.gender === 1 ? "Male" : "Female"} */}
            </Text>
          </View>
        </View>

        {/* View Button */}
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/home/report/view_report",
              params: {
                patientId: item.patient_id,
                patientName: item.patient_name,
              },
            });
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
            paddingVertical: verticalScale(6),
            paddingHorizontal: scale(12),
            borderRadius: scale(20),
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: responsiveFontSize(13),
              marginRight: scale(4),
              fontFamily: "Nunito_700Bold",
            }}
          >
            View
          </Text>

          <MaterialIcons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      {/* Navbar */}
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction
          color={theme.colors.primary}
          onPress={() => router.back()}
        />
        <Appbar.Content
          title="Patients"
          titleStyle={{
            fontFamily: "Nunito_700Bold",
            color: theme.colors.primary,
          }}
        />
      </Appbar.Header>
      {/* Section Title */}
      <View
        style={{
          paddingHorizontal: scale(16),
          paddingVertical: verticalScale(12),
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(18),
            fontFamily: "Nunito_700Bold",
            color: theme.colors.primary,
          }}
        >
          Select Patient
        </Text>
      </View>

      {/* Patient List */}
      <FlatList
        data={patientList}
        keyExtractor={(item) => item.patient_id.toString()}
        renderItem={renderPatient}
        contentContainerStyle={{
          paddingBottom: verticalScale(20),
        }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              marginTop: verticalScale(40),
            }}
          >
            <Text style={{ color: "#777" }}>No patients found</Text>
          </View>
        }
      />
    </View>
  );
}
