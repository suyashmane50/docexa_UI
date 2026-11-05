import { Stack } from "expo-router";

import React from "react";

function _layout() {
  // return <Stack />;
  return (
    <Stack>
      <Stack.Screen options={{ headerShown: false }} name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerTintColor: 'white',
        }}
      />
    </Stack>
  );
}

export default _layout;
