/* In devlopment code */
import BottomSheet, {
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Icon, Text, withTheme, Divider } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecipie } from "@/store/features/recipie/RecipeSlice";
// import RecipieDetailsSkeleton from "../../Utility/Skeletons/RecipieDetailsSkeleton";
import Loading from "../../../../components/Loading";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
// import Error from "../../Utility/Skeletons/Vitals/Error";
import { blurhash } from "@/utils/common";
const size = Dimensions.get("window").width;
import { withLayoutContext } from "expo-router";
const Tab = createMaterialTopTabNavigator();
import TopBar from "../../../../components/Recipe/TopBar";
import { AppDispatch } from "@/store";

export default function DetailsScreen({ theme }: any) {
  const { id } = useLocalSearchParams();
  useEffect(() => {
    console.log("Id", id);
    return () => { };
  }, []);

  const requiredImage =
    "https://makebot-v3.s3.ap-south-1.amazonaws.com/Signutures/70672-signuture-2024-08-01%2011%3A42%3A39.jpg";
  const dispatch: AppDispatch = useDispatch();
  const { data, isLoading, isSuccess, isError, message, ingredients, steps } =
    useSelector((state: any) => state.recipeSlice);
  const bottomSheetRef = useRef(null);
  const snapPoint = useMemo(() => ["70%", "85%"], []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  useEffect(() => {
    console.log(data?.data?.image_url);
    dispatch(fetchRecipie(Number(id)));
    return () => { };
  }, [id]);

  return (
    <>
      {isSuccess && (
        <View style={{ flex: 1 }}>
          <Image
            style={styles.image}
            source={
              data?.data?.recipes?.image_url
                ? data?.data?.recipes?.image_url
                : requiredImage
            }
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={1000}
          />
          <BottomSheetModalProvider>
            <BottomSheet
              ref={bottomSheetRef}
              onChange={handleSheetChanges}
              snapPoints={snapPoint}
            >
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  justifyContent: "center",
                  alignItems: "center",
                  margin: 8,
                }}
              >
                <View style={{ width: "100%", alignItems: "center" }}>
                  <Text
                    style={{
                      fontFamily: "Nunito_700Bold",
                      textAlign: "center",
                      fontSize: 23,
                    }}
                  >
                    {data?.data?.recipes?.name}
                  </Text>
                  <View style={{ flexDirection: "row", marginVertical: 10 }}>
                    <View
                      style={{
                        // marginHorizontal: 10,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon source="timer-outline" color={"black"} size={23} />
                      <Text
                        style={{
                          fontFamily: "Nunito_500Medium",
                          fontSize: 14,
                          color: "gray",
                          marginLeft: 4,
                        }}
                      >
                        {data?.data?.recipes?.time
                          ? data?.data?.recipes?.time
                          : "NA"}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",

                        marginHorizontal: 20,
                      }}
                    >
                      <Icon
                        source="emoticon-happy-outline"
                        color={"black"}
                        size={22}
                      />
                      <Text
                        style={{
                          fontFamily: "Nunito_500Medium",
                          marginHorizontal: 5,
                          fontSize: 14,
                        }}
                      >
                        {data?.data?.recipes?.difficulty_level
                          ? data?.data?.recipes?.difficulty_level
                          : "NA"}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon
                        source={require("../../../../assets/images/screens/recipe/calories.png")}
                        color={"black"}
                        size={22}
                      />
                      <Text
                        style={{
                          fontFamily: "Nunito_500Medium",
                          marginHorizontal: 5,
                          fontSize: 14,
                        }}
                      >
                        {data?.data?.recipes?.calories
                          ? data?.data?.recipes?.calories
                          : "NA"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{ width: "100%", marginTop: 15, alignSelf: "center" }}
                >
                  <TopBar />
                </View>
              </BottomSheetScrollView>
            </BottomSheet>
          </BottomSheetModalProvider>
        </View>
      )}
      {isLoading && <Loading />}

      {/* {isError && <Error />} */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: size,
    objectFit: "cover",
    height: "45%",
  },
});
