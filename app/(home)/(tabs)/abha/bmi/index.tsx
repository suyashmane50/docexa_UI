import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { memo, useEffect } from "react";
import { View, ScrollView, StyleSheet, Dimensions, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { RefreshControl } from "react-native-gesture-handler";
import {
  Appbar,
  Avatar,
  Card,
  FAB,
  withTheme,
  Icon,
  Button,
} from "react-native-paper";
import Timeline from "react-native-timeline-flatlist";
import { useDispatch, useSelector } from "react-redux";
import { fetchBMI } from "@/store/features/vitals/bmi/bmiSlice";
import Loading from "../../../../../components/Loading";
import { router } from "expo-router";
import { AppDispatch } from "@/store";
import { Image } from "expo-image";
import NoDataFound from "@/components/NoDataFound";

const { width, height } = Dimensions.get("window");
function Btracker({ theme }: any) {
  const dispatch: AppDispatch = useDispatch();
  const {
    isLoading,
    graph,
    timeline,
    isSuccess,
    isError,
    isNotFound,
    message,
  } = useSelector((state: any) => state.bmi);

  const fetch_bmi = async () => {
    try {
      // const id = await AsyncStorage.getItem("id");
      dispatch(fetchBMI());
    } catch (error) {
      console.log("error=>", error);
    }
  };

  useEffect(() => {
    fetch_bmi();
    return () => { };
  }, []);

  const renderDetail = (item: any) => {
    return (
      <Card style={{ padding: 6 }} mode="contained">
        <Card.Content style={{}}>
          <View>
            <Text
              style={{
                color: theme.colors.primary,
                fontFamily: "Nunito_800ExtraBold",
                fontSize: 18,
                marginVertical: 4,
              }}
            >
              {item.bmi}
            </Text>
            <Text>{item.date}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header style={{ backgroundColor: "white" }}>
        <Appbar.BackAction
          onPress={() => {
            router.back();
          }}
          color={theme.colors.primary}
        />
        <Appbar.Content
          title="BMI tracker"
          titleStyle={{
            color: theme.colors.primary,
            fontFamily: "Nunito_700Bold",
            fontSize: 25,
          }}
        />
      </Appbar.Header>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flex: 1 }}>

        {isSuccess && (
          <View>
            <View style={{ alignItems: "center", width: "100%" }}>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "white",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingBottom: 20,
                  paddingTop: 12,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Avatar.Icon
                    size={40}
                    icon={() => (
                      <Icon
                        source={require("../../../../../assets/images/screens/bmi.png")}
                        // color={MD3Colors.error50}
                        size={34}
                      />
                    )}
                  />
                  <View style={{ marginStart: 12 }}>
                    <View style={{}}>
                      <Text
                        style={{
                          fontFamily: "Nunito_600SemiBold",
                          color: "black",
                          fontSize: 16,
                        }}
                      >
                        {timeline[0]?.bmi}
                        <Text
                          style={{
                            fontFamily: "Nunito_600SemiBold",
                            color: "black",
                            fontSize: 13,
                            marginLeft: 5,
                          }}
                        ></Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <LineChart
              data={{
                labels:
                  graph.label?.length < 6
                    ? graph.label
                    : graph.label?.slice(graph.label?.length - 6),
                datasets: [
                  {
                    data: graph?.bmi ? graph.bmi : 0
                    // graph.bmi?.length < 6
                    //   ? graph?.bmi ? graph.bmi : 0
                    //   : graph.bmi?.slice(graph.bmi?.length - 6),
                  },
                ],
              }}
              width={Dimensions.get("window").width - 20} // from react-native
              height={220}
              onDataPointClick={({ index }) => {
                // console.log(lineData[index]);
              }}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: theme.colors.primary,
                backgroundGradientFrom: theme.colors.primary,
                backgroundGradientTo: theme.colors.primary,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              bezier
              style={{
                alignSelf: "center",
                marginVertical: 16,
                borderRadius: 16,
              }}
            />
            <View
              style={{
                // backgroundColor: 'white',
                paddingHorizontal: 18,
                paddingVertical: 18,
              }}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16 }}>
                Timeline
              </Text>
              <Timeline
                timeStyle={{
                  textAlign: "center",
                  backgroundColor: theme.colors.primary,
                  color: "white",
                  padding: 5,
                  borderRadius: 13,
                }}
                circleSize={12}
                lineColor={"grey"}
                circleColor={theme.colors.primary}
                style={{ width: "100%", height: "100%", marginVertical: 12 }}
                data={timeline}
                lineWidth={1.5}
                renderDetail={renderDetail}
                isUsingFlatlist={false}
              />
            </View>
          </View>
        )}

        {isLoading && <Loading />}

        {isError && (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Image
              style={{ width: width - 20, height: width - 20 }}
              source={require("../../../../../assets/images/screens/fixing.png")}
            />
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Nunito_700Bold",
                marginBottom: 15,
              }}
            >
              Something went wrong
            </Text>
            <Button
              mode="contained"
              style={{ width: "90%", borderRadius: 15 }}
              contentStyle={{ paddingVertical: 5 }}
              onPress={fetch_bmi}
            >
              Try again
            </Button>
          </View>
        )}

        {isNotFound &&
          // <View
          //   style={{
          //     flex: 1,
          //     alignSelf: "center",
          //     justifyContent: "center",
          //   }}
          // >
          //   <Image
          //     source={require("../../../../../assets/images/nodata.svg")}
          //     style={{
          //       width: width / 1.5,
          //       height: width / 1.5,
          //     }}
          //   />
          //   <Text
          //     style={{
          //       fontFamily: "Nunito_700Bold",
          //       fontSize: 14,
          //       marginTop: 12,
          //       textAlign: 'center'
          //     }}
          //   >
          //     No data found
          //   </Text>
          // </View>
          <NoDataFound />
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
});

export default memo(withTheme(Btracker));
