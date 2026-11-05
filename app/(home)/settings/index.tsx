import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { memo } from "react";
import DrawerSceneWrapper from "@/components/DrawerSceneWrapper";
import {
  Button,
  Dialog,
  Icon,
  IconButton,
  Portal,
  Switch,
  withTheme,
} from "react-native-paper";
import { useColorScheme } from "nativewind";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Divider } from "@/components/Divider";
import { Capitalize } from "@/utils/common";
import { Image } from "react-native";
import { DrawerActions } from "@react-navigation/native";

function index({ theme, navigation }: any) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { user } = useSelector((state: RootState) => state.user);
  return (
    <DrawerSceneWrapper>
      <ScrollView contentContainerClassName="flex-1" className="bg-white ">
        <View className="justify-center items-center bg-slate-100  mb-2 pt-10 pb-4">
          <View className="flex-row justify-between px-2 w-full">
            <IconButton
              icon="menu"
              size={32}
              iconColor={theme.colors.primary}
            //   onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            //   onPress={() => navigation.openDrawer()}
            />
            {/* <IconButton
              icon="account-edit"
              size={28}
              //   iconColor={theme.colors.primary}
              //   onPress={() => navigation.navigate("EditProfile")}
            /> */}
          </View>
          <View className="px-5 w-full">
            <View className="justify-center items-center mb-4">
              <Image
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 50,
                  backgroundColor: theme.colors.primary,
                }}
                source={require("../../../assets/images/DefaultPicture.jpg")}
              />
              <Text
                style={{
                  fontFamily: "Nunito_700Bold",
                  fontSize: 20,
                  marginVertical: 6,
                }}
                className="text-black dark:text-slate-400"
              >
                {Capitalize(user?.patient_name)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row w-full justify-start">
                <Icon
                  source="phone-outline"
                  size={24}
                  color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
                />
                <Text
                  style={{
                    fontFamily: "Nunito_600SemiBold",
                    fontSize: 15,
                    marginLeft: 12,
                  }}
                  className="text-slate-500 dark:text-slate-400"
                >
                  {user?.phone}
                </Text>
              </View>
              {/* <View className="bg-lime-500 px-3 py-2 rounded-full">
                <Text
                  className="text-white"
                  style={{ fontFamily: "Nunito_700Bold" }}
                >
                  Verified
                </Text>
              </View> */}
            </View>
          </View>
        </View>
        <View
          className="justify-center bg-slate-100"
        // style={{ padding: 18 }}
        >
          {/* <TouchableOpacity
                        className="flex-row justify-between pt-5 w-full"
                        onPress={() => {
                            // navigation.navigate("Profile");
                        }}
                    >
                        <View className="flex-row items-center">
                            <Icon
                                size={24}
                                source="account-outline"
                                color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
                            />
                            <Text
                                style={{
                                    fontFamily: "Nunito_600SemiBold",
                                    fontSize: 17,
                                    marginLeft: 12,
                                }}
                                className="text-slate-500 dark:text-slate-400"
                            >
                                Profile
                            </Text>
                        </View>
                        <Icon
                            source="chevron-right"
                            size={24}
                            color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
                        />
                    </TouchableOpacity>
                    <Divider color={colorScheme === "dark" ? "#334155" : "#cbd5e1"} />
                    <TouchableOpacity
                        className="flex-row justify-between w-full"
                        onPress={() => {
                            navigation.navigate("Languages");
                        }}
                    >
                        <View className="flex-row items-center">
                            <Icon
                                size={24}
                                source="translate"
                                color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
                            />
                            <Text
                                style={{
                                    fontFamily: "Nunito_600SemiBold",
                                    fontSize: 17,
                                    marginLeft: 12,
                                }}
                                className="text-slate-500 dark:text-slate-400"
                            >
                                Language
                            </Text>
                        </View>
                        <Icon
                            source="chevron-right"
                            size={24}
                            color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
                        />
                    </TouchableOpacity>*/}
          {/* <Divider color={"#cbd5e1"} /> */}
          {/* <View className="flex-row justify-between items-center w-full">
            <View className="flex-row justify-center items-center">
              <Icon
                size={24}
                source={
                  colorScheme === "dark"
                    ? "weather-night"
                    : "white-balance-sunny"
                }
                color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
              />
              <Text
                style={{
                  fontFamily: "Nunito_600SemiBold",
                  fontSize: 17,
                  marginLeft: 12,
                }}
                className="text-slate-500 dark:text-slate-400"
              >
                Dark Appearance
              </Text>
            </View>
            <Switch
              value={colorScheme === "dark"}
              onValueChange={() => toggleTheme()}
            />
          </View>
          <Divider color={colorScheme === "dark" ? "#334155" : "#cbd5e1"} /> */}
          {/* <View className="flex-row justify-between items-center w-full">
                        <View className="flex-row justify-center items-start">
                            <Icon
                                size={24}
                                source={"gift-outline"}
                                color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
                            />
                            <View
                                style={{
                                    marginLeft: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "Nunito_600SemiBold",
                                        fontSize: 17,
                                    }}
                                    className="text-slate-500 dark:text-slate-400"
                                >
                                    Invite friends, get rewards
                                </Text>
                                <View className="flex-row items-center">
                                    <Text
                                        className="text-slate-500 dark:text-slate-400"
                                        style={{ fontFamily: "Nunito_600SemiBold" }}
                                    >
                                        Share your code
                                    </Text>
                                 
                                    <TouchableOpacity
                                        className="flex-row items-center"
                                        onPress={() => copyToClipboard('eftgs')}
                                    >
                                        <Text
                                            className="mx-1.5 text-black dark:text-white"
                                            style={{ fontFamily: "Nunito_600SemiBold" }}
                                        >
                                
                                            eftgs
                                        </Text>
                                        <Icon
                                            source={"content-copy"}
                                            color={colorScheme === "dark" ? "white" : "black"}
                                            size={14}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <Button
                            mode="text" onPress={shareReferralCode}>
                            Share
                        </Button>
                    </View> */}
          {/* <View className="flex-row justify-between items-center w-full">
            <View className="flex-row justify-center items-center">
              <Icon
                size={24}
                source="bell-ring"
                color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
              />
              <Text
                style={{
                  fontFamily: "Nunito_600SemiBold",
                  fontSize: 17,
                  marginLeft: 12,
                }}
                className="text-slate-500 dark:text-slate-400"
              >
                Notifications
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              //   onValueChange={() => handlePermissionRequest()}
            />
          </View> */}
          {/* <Divider color={colorScheme === "dark" ? "#334155" : "#cbd5e1"} /> */}
          {/* <TouchableOpacity
            className="flex-row justify-between items-center w-full"
            // onPress={_delete}
          >
            <View className="flex-row justify-center items-center">
              <Icon size={24} source={"trash-can"} color={"#64748b"} />
              <View
                style={{
                  marginLeft: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Nunito_600SemiBold",
                    fontSize: 17,
                  }}
                  className="text-slate-500 dark:text-slate-400"
                >
                  Delete Account
                </Text>
              </View>
            </View>
            <Icon source="chevron-right" size={24} color={"#64748b"} />
          </TouchableOpacity> */}
          <Portal>
            <Dialog visible={false} dismissable={false} style={{}}>
              <Dialog.Icon icon="delete-alert" color="orange" size={40} />
              <Dialog.Title
                style={{ textAlign: "center", fontFamily: "Nunito_700Bold" }}
                className="text-black dark:text-white"
              >
                Delete Your GoRoga account ?
              </Dialog.Title>
              <Dialog.Content>
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: "Nunito_500Medium",
                  }}
                  className="text-black dark:text-white"
                >
                  You're requesting to delete GoRoga account.
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  icon="trash-can"
                  contentStyle={{ paddingHorizontal: 15 }}
                  labelStyle={{ fontFamily: "Nunito_700Bold" }}
                  textColor="red"
                //   onPress={deleteaccount}
                >
                  Continue
                </Button>
                <Button
                  mode="contained"
                  contentStyle={{ paddingHorizontal: 15 }}
                  labelStyle={{ fontFamily: "Nunito_700Bold" }}
                //   onPress={() => setdeleteAccount(false)}
                >
                  Cancel
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      </ScrollView>
    </DrawerSceneWrapper>
  );
}

export default memo(withTheme(index));
