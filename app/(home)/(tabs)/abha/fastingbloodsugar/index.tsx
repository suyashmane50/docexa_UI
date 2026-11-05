import React, { memo, useEffect } from "react";
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
  Card,
  FAB,
  Text,
  withTheme,
  Icon,
  Button,
} from "react-native-paper";
import Timeline from "react-native-timeline-flatlist";
import { useDispatch, useSelector } from "react-redux";
import { fetchFastingBloodSugar } from "@/store/features/vitals/fastingbloodsugar/fastingbloodsugarSlice";
import { router } from "expo-router";
import Loading from "../../../../../components/Loading";
import { AppDispatch } from "@/store";
import { Image } from "expo-image";
import NoDataFound from "@/components/NoDataFound";

const { width } = Dimensions.get("window");
function Ftracker({ theme }: any) {
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, graph, timeline, isSuccess, isNotFound, isError } =
    useSelector((state: any) => state.fastingbloodsugar);

  const fetch_blood_sugar = async () => {
    // const id = await AsyncStorage.getItem("id");
    dispatch(fetchFastingBloodSugar());
  };

  useEffect(() => {
    fetch_blood_sugar();
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
                fontFamily: "Nunito_700Bold",
                fontSize: 18,
                marginVertical: 4,
              }}
            >
              {rowData.fasting_blood_sugar}
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
          onPress={() => router.navigate("/abha/fastingbloodsugar/fstracker")}
        />
      )}
      <Appbar.Header style={{ backgroundColor: "white" }}>
        <Appbar.BackAction
          onPress={() => router.back()}
          color={theme.colors.primary}
        />
        <Appbar.Content
          title="Fasting Blood Sugar tracker"
          titleStyle={{
            color: theme.colors.primary,
            fontFamily: "Nunito_700Bold",
            fontSize: 25,
          }}
        />
      </Appbar.Header>
      {isSuccess && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              colors={[theme.colors.primary]}
              refreshing={isLoading}
              onRefresh={fetch_blood_sugar}
            />
          }
        >
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
                        source={require("../../../../../assets/images/screens/blood-sample.png")}
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
                        {
                          graph.fasting_blood_sugar[
                          graph.fasting_blood_sugar?.length - 1
                          ]
                        }
                        <Text
                          style={{
                            fontFamily: "Nunito_600SemiBold",
                            color: "black",
                            fontSize: 13,
                            marginLeft: 5,
                          }}
                        >
                          mg/dL
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
                      graph.fasting_blood_sugar.length < 6
                        ? graph.fasting_blood_sugar
                        : graph.fasting_blood_sugar?.slice(4),
                  },
                ],
              }}
              width={Dimensions.get("window").width - 20}
              height={220}
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
                marginVertical: 16,
                borderRadius: 16,
              }}
            />
            <View style={{ paddingHorizontal: 18, paddingVertical: 12 }}>
              <Text
                style={{
                  fontFamily: "nunito-bold",
                  fontSize: 17,
                  marginBottom: 8,
                }}
              >
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
        </ScrollView>
      )}
      {isLoading && <Loading />}
      {/* {isError && !isNotFound && <Error />}
       */}
      {isNotFound && (
        // <View
        //   style={{
        //     marginTop: 50,
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
        //       fontSize: 22,
        //       marginTop: 12,
        //       textAlign: "center",
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
            onPress={fetch_blood_sugar}
          >
            Try again
          </Button>
        </View>
      )}
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

export default memo(withTheme(Ftracker));
