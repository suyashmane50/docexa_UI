import React, { useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import {
  Text,
  IconButton,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllrecipes } from "@/store/features/recipie/Recipies";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import Loading from "../../../../components/Loading";
import { Image } from "expo-image";
const numColumns = 2;
const size = Dimensions.get("window").width / numColumns;
const original = Dimensions.get("window").width;
import { blurhash } from "../../../../utils/common";
import { router } from "expo-router";
import { AppDispatch } from "@/store";

const requiredImage =
  "https://makebot-v3.s3.ap-south-1.amazonaws.com/Signutures/70672-signuture-2024-08-01%2011%3A43%3A20.jpg";
function HealthyRecipes() {
  const navigation = useNavigation();
  const dispatch: AppDispatch = useDispatch();
  // const requiredImage = require("../../../assets/images/DefaultPicture.jpg");
  const { data, isLoading, isSuccess, isError, message, top_recipes, recipes } =
    useSelector((state: any) => state.recipes);

  useEffect(() => {
    dispatch(fetchAllrecipes());
  }, []);

  const TopRecipie = ({ item, index }: any) => (
    <Pressable
      key={`toprecipie-${index}`}
      onPress={() => torecipesDetails(item?.id)}
    >
      <View style={styles.item}>
        <Image
          style={{
            width: size - 20,
            height: size - 20,
            borderRadius: 8,
          }}
          source={item?.image_url ? item.image_url : requiredImage}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        />
      </View>
    </Pressable>
  );

  const RenderHorizontal = ({ item, index }: any) => {
    const recipes_parse = JSON.parse(item?.recipes);
    console.log("item", item);
    return (
      <View
        key={`horizontal-${item?.id ? item.id : Math.random()}`}
        style={{
          backgroundColor: "white",
          marginVertical:
            index === 0 || data?.data.recipes?.length - 1 === index ? 0 : 11,
          paddingHorizontal: 20,
          paddingVertical: 10,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 15 }}>
            {item.name}
          </Text>
        </View>
        <FlatList
          data={recipes_parse}
          horizontal={true}
          scrollEnabled={recipes_parse?.length > 4}
          renderItem={Recipie}
          keyExtractor={(recipieItem) => `recipie-${recipieItem.id}`}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const torecipesDetails = (id: number | string) => {
    try {
      // navigation.navigate("RecipesDetails", { id: id });
      router.navigate(`/recipe/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const Recipie = ({ item, index }: any) => (
    <Pressable onPress={() => torecipesDetails(item?.id)} key={`rec-${index}`}>
      <View
        style={{
          marginRight: 8,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
        }}
      >
        <Image
          style={{
            width: original / 5,
            height: original / 5,
            borderRadius: 100,
          }}
          source={item?.image_url ? item?.image_url : requiredImage}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        />
        <Text
          style={{
            color: "#595959",
            paddingVertical: 6,
            width: original / 4,
            textAlign: "center",
            fontSize: 13,
            fontFamily: "Nunito_500Medium",
          }}
        >
          {item.recipe_name}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <>
      {isSuccess && (
        <ScrollView showsVerticalScrollIndicator={false} scrollEnabled>
          <View style={{ backgroundColor: "white" }}>
            <IconButton
              icon="sort-variant"
              iconColor={"black"}
              size={20}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          </View>
          <View style={{ backgroundColor: "white", padding: 10 }}>
            <Text
              style={{
                fontFamily: "Nunito_700Bold",
                fontSize: 15,
                marginVertical: 10,
                marginStart: 8,
              }}
            >
              Our Top Recipes
            </Text>
            <FlatList
              data={top_recipes}
              numColumns={numColumns}
              renderItem={TopRecipie}
              keyExtractor={(item) => `top-${item.id}`}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={{ alignItems: "center" }}
            />
          </View>

          <FlatList
            contentContainerStyle={{}}
            keyExtractor={(item) => `horizontal-${item.id}`}
            renderItem={RenderHorizontal}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            data={recipes}
          />
        </ScrollView>
      )}

      {isLoading && <Loading />}

      {/*  {isError && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View
            style={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{ width: size - 50, height: size / 1.8, borderRadius: 5 }}
              source={require("../../../assets/images/nutrition/server_down.png")}
            />
            <Text
              style={{
                fontSize: 23,
                fontFamily: "Nunito_700Bold",
                marginVertical: 18,
              }}
            >
              Something went wrong
            </Text>
            <Button
              icon="camera"
              mode="contained"
              onPress={() => console.log("Pressed")}
            >
              Try again
            </Button>
          </View>
        </View>
      )} */}
    </>
  );
}

export default HealthyRecipes;

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 2,
    height: size,
  },
});
