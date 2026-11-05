import { Stack } from "expo-router";

export default function ViewReportLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // we will use custom Appbar
      }}
    />
  );
}
