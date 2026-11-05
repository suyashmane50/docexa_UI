import React, { memo, useEffect } from "react";
import { Dimensions, FlatList, View } from "react-native";
import {
  Appbar,
  Card,
  FAB,
  Text,
  withTheme,
  Button,
} from "react-native-paper";
import { ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { blurhash } from "@/utils/common";
import { router } from "expo-router";
import {
  fetchCalories,
  putCalories,
} from "@/store/features/vitals/calorie/CalorieSlice";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { AppDispatch } from "@/store";
import Loading from "@/components/Loading";

const { width } = Dimensions.get("window");
function Home({ theme }: any) {
  const dispatch: AppDispatch = useDispatch();
  const {
    calories,
    isLoading,
    isSuccess,
    isError,
    putIsSuccess,
    putIsError,
    putmessage,
  } = useSelector((state: any) => state.calorie);

  const fetch = () => {
    dispatch(fetchCalories());
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    console.log(putIsSuccess, putIsError);
    if (putIsSuccess || putIsError) {
      Toast.show({
        type: isSuccess ? ALERT_TYPE.SUCCESS : ALERT_TYPE.DANGER,
        title: isSuccess ? "Success" : "Error",
        textBody: putmessage ? putmessage : "Try again later",
      });
    }
  }, [putIsSuccess, putIsError]);

  const putcalories = (calories: number | string, product_id: number) => {
    try {
      dispatch(putCalories({ calories: calories, product_id: product_id }));
    } catch (error: any) {
      console.log("error=>", error);
    }
  };

  const requiredImage = require("../../../../../assets/images/DefaultPicture.jpg");
  const RenderItem = ({
    item,
    customStyles = {},
    customText = {},
  }: any) => {
    // console.log("item", item);
    return (
      <View
        key={item.id}
        style={{
          marginRight: 15,
          borderRadius: 10,
          // ...customStyles.viewContainer,
        }}
      >
        <Card
          mode="contained"
          style={{
            flex: 1,
            borderRadius: 10,
            width: 200,
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Card.Content
            style={{
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <Image
              style={{
                borderRadius: 6,
                resizeMode: "cover",
                width: 185,
                height: 185,
                ...customStyles.image,
              }}
              source={item?.image ? item.image : requiredImage}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
            <View style={{ marginBottom: 10 }}>
              <Text
                style={{
                  fontFamily: "Nunito_700Bold",
                  marginVertical: 4,
                  textAlign: "center",
                  ...customText.title,
                }}
              >
                {item.title ? item.title : "NA"}
              </Text>
              <Text
                style={{
                  fontFamily: "Nunito_400Regular",
                  textAlign: "center",
                  fontSize: 12,
                  ...customText.subtitle,
                }}
              >
                {item.subtitle ? item.subtitle : "NA"}
              </Text>
            </View>

            <FAB
              // loading={true}
              icon="check"
              variant="surface"
              size={"small"}
              color={"#fff"}
              style={{ backgroundColor: item?.istaken == 1 ? "green" : "grey" }}
              onPress={() => putcalories(item.calories, item.id)}
            />
          </Card.Content>
        </Card>
      </View>
    );
  };

  const RenderHorizontal = ({ item, index }: any) => {
    // console.log("item:", item.name);
    const json_parse = JSON.parse(item.calories);
    return (
      <View key={index}>
        <View
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            marginTop: 20,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "black",
              fontFamily: "Nunito_700Bold",
            }}
          >
            {item.name}
          </Text>
          {/* <Text
            style={{
              fontSize: 14,
              color: "gray",
              fontFamily: "Nunito_700Bold",
            }}
          >
             {0} to {item?.total_calories ? item?.total_calories : "NA"} Cal 
          </Text> */}
        </View>
        <FlatList
          data={json_parse}
          horizontal={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={RenderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header
      >
        <Appbar.BackAction
          onPress={() => {
            router.back();
          }}
          color={theme.colors.primary}
        />
        <Appbar.Content
          title="Calories"
          titleStyle={{
            color: theme.colors.primary,
            fontFamily: "Nunito_600SemiBold",
            fontSize: 25,
          }}
        />
      </Appbar.Header>
      {isSuccess && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ padding: 15 }}
        >
          <View>
            {/* <Card
              mode="contained"
              style={{
                padding: 4,
                //  backgroundColor: 'white'
              }}
            >
              <Card.Content
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <View style={{ position: "absolute", left: 45 }}>
                  <Icon
                    source={() => (
                      <SetupIcon
                        name="restaurant"
                        color={theme.colors.primary}
                        size={26}
                      />
                    )}
                    size={26}
                  />
                </View>
                <CircularProgress
                  showProgressValue={false}
                  duration={2000}
                  value={50}
                  radius={40}
                  activeStrokeColor={theme.colors.primary}
                  inActiveStrokeOpacity={0.2}
                  inActiveStrokeWidth={6}
                  activeStrokeWidth={8}
                />
                <Text
                  style={{
                    fontFamily: "Nunito_700Bold",
                    marginStart: 15,
                    fontSize: 16,
                  }}
                >
                  1000 of 2050 Cal
                </Text>
              </Card.Content>
            </Card> */}
            <FlatList
              data={calories}
              horizontal={false}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              renderItem={RenderHorizontal}
              keyExtractor={(item, index) => `${index}+c`}
            />
          </View>
        </ScrollView>
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
            onPress={fetch}
          >
            Try again
          </Button>
        </View>
      )}
    </View>
  );
}

export default memo(withTheme(Home));


