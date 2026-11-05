import Loading from "@/components/Loading";
import {
  fetchClinics,
  resetClinic,
  selectClinic,
} from "@/store/features/appointments/ClinicSelectSlice";
import { AppDispatch } from "@/store";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { StyleSheet, FlatList, TouchableOpacity, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  HelperText,
  Icon,
  Text,
  withTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";

function Clinic({ theme }: any) {
  const { doctor_id }: any = useLocalSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const [alert, setalert] = useState(false);

  useEffect(() => {
    dispatch(fetchClinics(doctor_id));
  }, [doctor_id]);

  const { clinics, isLoading, selection } = useSelector(
    (state: any) => state.clinics,
  );

  const SelectClinic = () => {
    if (!selection) {
      setalert(true);
    } else {
      setalert(false);
      router.push({
        pathname: "/appointments/choose/clinic/create",
        params: { doctor_id, clinic_id: selection },
      });
    }
  };

  const RenderDoctor = ({ item }: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          dispatch(selectClinic(item.id));
          setalert(false);
        }}
        activeOpacity={0.75}
        style={{ marginVertical: 6 }}
      >
        <Card
          mode="contained"
          style={{
            minHeight: 150,
            justifyContent: "center",
            borderColor: selection === item.id ? theme.colors.primary : "#000",
            borderWidth: selection === item.id ? 2 : 0,
          }}
        >
          <Card.Content>
            <View style={{ flexDirection: "row" }}>
              <Icon
                source={require("../../../../../../assets/images/screens/hospital_new.png")}
                size={60}
              />
              <View style={{ marginLeft: 18, width: "70%" }}>
                <Text style={{ fontSize: 19, fontFamily: "Nunito_700Bold" }}>
                  {item.clinic_name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    marginVertical: 6,
                    alignItems: "center",
                  }}
                >
                  <Icon
                    color={theme.colors.primary}
                    source="hospital-marker"
                    size={28}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Nunito_600SemiBold",
                      color: "grey",
                    }}
                  >
                    {item.city}, {item.address} - {item.pincode}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
        <Appbar.Header>
          <Appbar.BackAction
            iconColor={theme.colors.primary}
            onPress={() => {
              dispatch(resetClinic());
              router.back();
            }}
          />
          <Appbar.Content
            title="Clinic"
            titleStyle={{
              fontFamily: "Nunito_700Bold",
              color: theme.colors.primary,
            }}
          />
        </Appbar.Header>

        {isLoading ? (
          <Loading />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              marginHorizontal: 12,
              marginVertical: 18,
            }}
          >
            {clinics?.length ? (
              <>
                <FlatList
                  data={clinics}
                  renderItem={RenderDoctor}
                  keyExtractor={(item) => String(item.id)}
                />

                <HelperText
                  type="error"
                  visible={alert}
                  style={{
                    fontFamily: "Nunito_700Bold",
                    fontSize: 14,
                    marginVertical: 12,
                  }}
                >
                  Choose a clinic
                </HelperText>

                <Button
                  loading={isLoading}
                  disabled={isLoading}
                  style={{ borderRadius: 8 }}
                  contentStyle={{ paddingVertical: 5 }}
                  mode="contained"
                  onPress={SelectClinic}
                >
                  Next
                </Button>
              </>
            ) : (
              <Card mode="contained">
                <Card.Content>
                  <Text style={{ fontFamily: "Nunito_700Bold" }}>
                    No Clinics found
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

export default memo(withTheme(Clinic));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edf2f4",
  },
});
