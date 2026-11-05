import React, { memo, useEffect } from "react";
import Timeline from "react-native-timeline-flatlist";
import {
  Appbar,
  Avatar,
  Button,
  Card,
  FAB,
  Text,
  withTheme,
} from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  useWindowDimensions,
} from "react-native";
import { scale, verticalScale, responsiveFontSize } from "@/utils/common";
import {
  fetchWeight,
  reset,
} from "@/store/features/vitals/weight/weightSlice";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import Loading from "@/components/Loading";
import { Image } from "expo-image";
import { AppDispatch } from "@/store";
import NoDataFound from "@/components/NoDataFound";
import { fetchVitals } from "@/store/features/vitals/VitalSlice";

const platform = Platform.OS;
function Home({ theme }: any) {
  const { width } = useWindowDimensions();
  const dispatch: AppDispatch = useDispatch();
  const {
    data,
    isLoading,
    isSuccess,
    isError,
    WeightList,
    graph,
    isNotFound,
  } = useSelector((state: any) => state.weight);

  const fetch_weight = async () => {
    dispatch(fetchWeight());
  };

  useEffect(() => {
    fetch_weight();
  }, []);

  useEffect(() => {
    if (isError) {
      if (platform != "web") {
        Toast.show({
          type: isSuccess ? ALERT_TYPE.SUCCESS : ALERT_TYPE.DANGER,
          title: isSuccess ? "Success" : "Error",
          textBody: data?.message,
        });
      }
    }
    return () => {
      dispatch(reset());
      dispatch(fetchVitals());
    };
  }, []);

  const renderDetail = (item: any) => {
    return (
      <Card style={{ padding: scale(6), marginHorizontal: scale(16), borderRadius: scale(12) }} mode="contained">
        <Card.Content style={{}}>
          <View>
            <Text
              style={{
                color: theme.colors.primary,
                fontFamily: "Nunito_800ExtraBold",
                fontSize: responsiveFontSize(18),
                marginVertical: verticalScale(4),
              }}
            >
              {item?.weight}
            </Text>
            <Text variant="bodyMedium" style={{ fontSize: responsiveFontSize(14) }}>{item?.date}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {(isSuccess || isNotFound) && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.navigate("/abha/weight/wtracker")}
        />
      )}
      <Appbar.Header style={{ backgroundColor: "white" }}>
        <Appbar.BackAction
          onPress={() => router.back()}
          color={theme.colors.primary}
        />
        <Appbar.Content
          title="Weight"
          titleStyle={{
            color: theme.colors.primary,
            fontFamily: "Nunito_700Bold",
            fontSize: responsiveFontSize(25),
          }}
        />
      </Appbar.Header>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: verticalScale(32),
          maxWidth: 800,
          alignSelf: "center",
          width: "100%",
        }}
      >
        {isSuccess && (
          <View>
            <View style={{ alignItems: "center", width: "100%" }}>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "white",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: scale(16),
                  paddingBottom: verticalScale(20),
                  paddingTop: verticalScale(12),
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
                  <Avatar.Icon size={scale(40)} icon="weight-kilogram" />
                  <View style={{ marginStart: scale(12) }}>
                    <View style={{}}>
                      <Text
                        style={{
                          fontFamily: "Nunito_600SemiBold",
                          color: "black",
                          fontSize: responsiveFontSize(16),
                        }}
                      >
                        {graph.weight[graph.weight?.length - 1]}
                        <Text
                          style={{
                            fontFamily: "Nunito_600SemiBold",
                            color: "black",
                            fontSize: responsiveFontSize(13),
                            marginLeft: scale(5),
                          }}
                        >
                          Kg
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <LineChart
              data={{
                labels:
                  graph.label.length < 6
                    ? graph.label
                    : graph.label?.slice(10 - graph.label.length),
                datasets: [
                  {
                    data:
                      graph.weight.length < 6
                        ? graph.weight
                        : graph.weight?.slice(4),
                  },
                ],
              }}
              width={Math.min(width - scale(40), 600)}
              height={verticalScale(220)}
              onDataPointClick={({ index }) => {
                console.log(graph.weight[index]);
              }}
              yAxisInterval={1}
              xLabelsOffset={1}
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
                marginVertical: verticalScale(16),
                borderRadius: scale(16),
              }}
            />
            {/* backgroundColor: 'white', */}
            <View style={{ paddingHorizontal: scale(18), paddingVertical: verticalScale(12) }}>
              <Text
                style={{
                  fontFamily: "Nunito_600SemiBold",
                  fontSize: responsiveFontSize(17),
                  marginBottom: verticalScale(8),
                }}
              >
                Timeline
              </Text>
              <Timeline
                timeStyle={{
                  textAlign: "center",
                  backgroundColor: theme.colors.primary,
                  color: "white",
                  padding: scale(5),
                  borderRadius: scale(13),
                  fontSize: responsiveFontSize(12),
                }}
                circleSize={scale(12)}
                lineColor={"grey"}
                circleColor={theme.colors.primary}
                style={{ width: "100%", height: "100%", marginVertical: verticalScale(12) }}
                data={WeightList}
                lineWidth={1.5}
                renderDetail={renderDetail}
                isUsingFlatlist={false}
              />
            </View>
          </View>
        )}

        {isLoading && <Loading />}

        {isNotFound && (
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
          //     }}
          //   >
          //     No data found
          //   </Text>
          // </View>
          <NoDataFound />
        )}

        {isError && (
          <View style={{ 
            justifyContent: "center", 
            alignItems: "center",
            padding: scale(20),
          }}>
            <Image
              style={{ 
                width: Math.min(width - scale(40), 300), 
                height: Math.min(width - scale(40), 300),
                maxWidth: 300,
                maxHeight: 300,
              }}
              source={require("../../../../../assets/images/screens/fixing.png")}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: responsiveFontSize(20),
                fontFamily: "Nunito_700Bold",
                marginBottom: verticalScale(15),
                marginTop: verticalScale(10),
              }}
            >
              Something went wrong
            </Text>
            <Button
              mode="contained"
              style={{ 
                width: "90%", 
                maxWidth: 300,
                borderRadius: scale(15) 
              }}
              contentStyle={{ paddingVertical: verticalScale(5) }}
              labelStyle={{ fontSize: responsiveFontSize(14) }}
              onPress={fetch_weight}
            >
              Try again
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: scale(16),
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  tooltipContainer: {
    backgroundColor: "black",
    padding: scale(5),
    fontFamily: "Nunito_600SemiBold",
    borderRadius: scale(5),
  },
  tooltipText: {
    fontSize: responsiveFontSize(12),
    color: "white",
  },
});

export default memo(withTheme(Home));
