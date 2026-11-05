import React, { useState } from "react";
import { View } from "react-native";
import { Button, useTheme } from "react-native-paper";
import Ingredients from "./Ingredients";
import Steps from "./Steps";

function TopBar() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">(
    "ingredients"
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          marginBottom: 12,
          backgroundColor: theme.colors.background,
          borderRadius: 999,
          padding: 4,
        }}
      >
        <Button
          mode={activeTab === "ingredients" ? "contained" : "text"}
          style={{
            flex: 1,
            borderRadius: 999,
          }}
          labelStyle={{
            fontFamily: "Nunito_700Bold",
            fontSize: 14,
          }}
          onPress={() => setActiveTab("ingredients")}
        >
          Ingredients
        </Button>
        <Button
          mode={activeTab === "steps" ? "contained" : "text"}
          style={{
            flex: 1,
            borderRadius: 999,
          }}
          labelStyle={{
            fontFamily: "Nunito_700Bold",
            fontSize: 14,
          }}
          onPress={() => setActiveTab("steps")}
        >
          Steps
        </Button>
      </View>

      {activeTab === "ingredients" ? (
        <Ingredients />
      ) : (
        <Steps />
      )}
    </View>
  );
}

export default TopBar;
