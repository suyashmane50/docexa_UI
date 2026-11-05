import React from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import RenderHtml from "react-native-render-html";
import { RootState } from "@/store";

function Ingredients() {
  const ingredients = useSelector(
    (state: RootState) => state.recipeSlice.ingredients,
  );

  const source = {
    html: `
      <p style='text-align:left; font-size: 25px !important'>
       ${ingredients}
      </p>`,
  };

  return (
    <View style={styles.container}>
      <RenderHtml contentWidth={350} source={source} />
    </View>
  );
}

export default Ingredients;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
