import React from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import RenderHtml from "react-native-render-html";
import { RootState } from "@/store";

function Steps() {
  const steps = useSelector((state: RootState) => state.recipeSlice.steps);
  const source = {
    html: `
      <p style='text-align:left;'>
       ${steps}
      </p>`,
  };
  return (
    <View style={{ flex: 1, justifyContent: "flex-start" }}>
      <RenderHtml contentWidth={350} source={source} />
    </View>
  );
}
export default Steps;
