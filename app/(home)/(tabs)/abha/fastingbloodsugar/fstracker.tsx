import React, { memo, useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Icon,
  IconButton,
  Text,
  TextInput,
  withTheme,
  Chip,
  FAB,
} from "react-native-paper";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import {
  postFastingBloodSugar,
  reset,
  handleInputChange,
  increment,
  decrement,
} from "@/store/features/vitals/fastingbloodsugar/postFastingBloodSugarSlice";
import { AppDispatch } from "@/store";
import { fetchFastingBloodSugar } from "@/store/features/vitals/fastingbloodsugar/fastingbloodsugarSlice";

const { width, height } = Dimensions.get("window");
function FBStracker({ theme }: any) {
  const dispatch: AppDispatch = useDispatch();
  const { counter, data, isLoading, isSuccess, isError, message } = useSelector(
    (state: any) => state.postfastingbloodsugar
  );

  const fastingBloodSugarHandler = async () => {
    try {
      dispatch(postFastingBloodSugar());
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    console.log(isSuccess, isError);
    if (isSuccess || isError) {
      Toast.show({
        type: isSuccess ? ALERT_TYPE.SUCCESS : ALERT_TYPE.DANGER,
        title: isSuccess ? "Success" : "Error",
        textBody: data?.message,
      });
      dispatch(fetchFastingBloodSugar());
      if (isSuccess) router.back();
    }

    return () => {
      dispatch(reset());
    };
  }, [isSuccess, isError]);
  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            router.back();
          }}
          color={theme.colors.primary}
        />
        <Appbar.Content
          title="Track Fasting Blood Sugar"
          titleStyle={{
            color: theme.colors.primary,
            fontFamily: "Nunito_700Bold",
            fontSize: 25,
          }}
        />
      </Appbar.Header>
      <View
        style={{
          padding: 20,
          justifyContent: "flex-start",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Card
          mode="contained"
          style={{
            marginTop: 50,
            padding: 4,
            width: width - 30,
            justifyContent: "space-between",
          }}
        >
          <Card.Content
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <Chip
                mode="outlined"
                icon={() => (
                  <Icon
                    source={require("../../../../../assets/images/screens/blood-sample.png")}
                    // color={MD3Colors.error50}
                    size={22}
                  />
                )}
              >
                mg/dL
              </Chip>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginVertical: 15,
                justifyContent: "center",
                width: '100%'
              }}
            >
              <FAB
                icon="minus"
                style={{ borderRadius: 40 }}
                onPress={() => dispatch(decrement())}
              />
              <TextInput
                style={{
                  width: "40%",
                  textAlign: "center",
                  marginHorizontal: 5,
                  fontSize: 32,
                  fontFamily: "Nunito_700Bold",
                }}
                placeholder={"0"}
                value={counter == "0" ? "" : counter}
                keyboardType="numeric"
                onChangeText={(text) => dispatch(handleInputChange(text))}
                maxLength={5}
              />
              <FAB
                icon="plus"
                style={{ borderRadius: 40 }}
                onPress={() => dispatch(increment())}
              />
            </View>

            <Button
              loading={isLoading}
              disabled={isLoading}
              onPress={() => fastingBloodSugarHandler()}
              style={{ width: "100%", marginVertical: 30 }}
              mode="contained"
              contentStyle={{
                paddingVertical: 6,
              }}
              labelStyle={{
                fontFamily: "Nunito_700Bold",
              }}
            >
              Submit
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

export default memo(withTheme(FBStracker));
