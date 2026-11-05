"use client";
import { app_type, appointment_type, getAnimationSource } from "@/utils/common";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Appbar,
  Button,
  Card,
  HelperText,
  withTheme,
} from "react-native-paper";

const { width, height } = Dimensions.get("window");
function index({ theme }: any) {
  const { doctor_id }: any = useLocalSearchParams();
  const [type, setType] = useState<number>(0);
  const [typerror, setTyperror] = useState<boolean>(false);
  const RenderCard = ({ item }: { item: app_type }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setType(item.id);
          console.log(item.id);
        }}
      >
        <Card
          mode="contained"
          style={[
            styles.animationContainer,
            {
              borderColor: type == item.id ? theme.colors.primary : "",
              borderWidth: type == item.id ? 1.75 : 0,
            },
          ]}
        >
          <Card.Content
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              height: 200,
              padding: 20,
            }}
          >
            <View style={{ width: "60%" }}>
              <LottieView
                autoPlay
                loop
                style={{
                  width: "100%",
                  height: "100%",
                }}
                source={getAnimationSource(item.img)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14 }}>
                {item.label}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const onCofirm = async () => {
    try {
      if (type === 1) {
        router.push({
          pathname: "/appointments/choose/clinic",
          params: { doctor_id: doctor_id },
        });
        setTyperror(false);
      } else if (type == 2) {
        router.push({
          pathname: "/appointments/choose/clinic",
          params: { doctor_id: doctor_id },
        });
        setTyperror(false);
      } else {
        setTyperror(true);
      }
    } catch (error) {}
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction
          iconColor={theme.colors.primary}
          onPress={() => {
            router.back();
          }}
        />
        <Appbar.Content
          title="Consultation type"
          titleStyle={{
            fontFamily: "Nunito_700Bold",
            color: theme.colors.primary,
          }}
        />
      </Appbar.Header>
      <View style={{ flex: 1, padding: 12 }}>
        <FlatList
          data={appointment_type}
          renderItem={RenderCard}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
        />
        <HelperText
          type="error"
          visible={typerror}
          style={{ fontFamily: "Nunito_700Bold" }}
        >
          Choose option!!
        </HelperText>
        <Button
          mode="contained"
          contentStyle={{ padding: 5 }}
          labelStyle={{ fontFamily: "Nunito_700Bold" }}
          onPress={onCofirm}
        >
          Next
        </Button>
      </View>
    </View>
  );
}

export default memo(withTheme(index));

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 6,
  },
  buttonContainer: {
    paddingTop: 20,
  },
});
