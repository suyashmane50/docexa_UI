import { useFocusEffect } from "@react-navigation/native";
import React, { memo, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  Appbar,
  Avatar,
  Button,
  Card,
  FAB,
  Text,
  withTheme,
} from "react-native-paper";
import Timeline from "react-native-timeline-flatlist";
import { useDispatch, useSelector } from "react-redux";
import { fetchHeight } from "@/store/features/vitals/height/heightSlice";
import Loading from "../../../../../components/Loading";
import { router } from "expo-router";
import { AppDispatch } from "@/store";
import { Image } from "expo-image";
import NoDataFound from "@/components/NoDataFound";

const { width } = Dimensions.get("window");
function Htracker({ theme }: any) {
  const dispatch: AppDispatch = useDispatch();
  const {
    isNotFound,
    isError,
    isLoading,
    isSuccess,
    HeightList,
    refreshing,
    graph,
  } = useSelector((state: any) => state.height);

  const fetch_height = async () => {
    try {
      dispatch(fetchHeight());
      console.log(graph);
    } catch (error) {
      console.log("error=>", error);
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     fetch_height();
  //   }, [])
  // );

  useEffect(() => {
    fetch_height();
    return () => { };
  }, []);

  const renderDetail = (rowData: any) => {
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
              {rowData.height}
            </Text>
            <Text variant="bodyMedium">{rowData.date}</Text>
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
          onPress={() => router.navigate("/abha/height/htracker")}
        />
      )}
      <Appbar.Header style={{ backgroundColor: "white" }}>
        <Appbar.BackAction
          onPress={() => router.back()}
          color={theme.colors.primary}
        />
        <Appbar.Content
          title="Height"
          titleStyle={{
            color: theme.colors.primary,
            fontFamily: "Nunito_700Bold",
            fontSize: 25,
          }}
        />
      </Appbar.Header>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
        scrollEnabled
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
                  <Avatar.Icon size={40} icon="human-male-height" />
                  <View style={{ marginStart: 12 }}>
                    <View style={{}}>
                      <Text
                        style={{
                          fontFamily: "Nunito_600SemiBold",
                          color: "black",
                          fontSize: 16,
                        }}
                      >
                        {HeightList[0]?.height}
                        <Text
                          style={{
                            fontFamily: "Nunito_600SemiBold",
                            color: "black",
                            fontSize: 13,
                            marginLeft: 5,
                          }}
                          children={undefined}
                        ></Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <LineChart
              data={{
                // labels: graph.label,
                labels:
                  graph.label?.length < 6
                    ? graph.label
                    : graph.label?.slice(graph.label?.length - 6),
                datasets: [
                  {
                    // data: graph.height
                    data:
                      graph.height?.length < 6
                        ? graph.height
                        : graph.height?.slice(graph.height?.length - 6),
                  },
                ],
              }}
              width={Dimensions.get("window").width - 20} // from react-native
              height={220}
              onDataPointClick={({ index }) => {
                console.log(index);
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
                // backgroundColor: "white",
                paddingHorizontal: 18,
                paddingVertical: 18,
              }}
            >
              <Text style={{ fontFamily: " Nunito_700Bold", fontSize: 16 }}>
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
                data={HeightList}
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
          //       fontSize: 18,
          //       textAlign: "center",
          //       marginTop: 12,
          //     }}
          //   >
          //     No data found
          //   </Text>
          // </View>
          <NoDataFound />
        )}

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
              onPress={fetch_height}
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
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
});

export default memo(withTheme(Htracker));
