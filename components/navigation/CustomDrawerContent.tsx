// import React, { useState } from "react";
// import {
//   DrawerContentScrollView,
//   DrawerItem,
//   DrawerItemList,
// } from "@react-navigation/drawer";
// import { useNavigation, router } from "expo-router";
// import { DrawerActions } from "@react-navigation/native";
// import { Button, Dialog, Icon, Portal, Text } from "react-native-paper";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store";
// import { resetOtp } from "@/redux/auth/otpReducer";
// import { reset } from "@/redux/auth/authReducer";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { StyleSheet } from "react-native";

// export default function CustomDrawerContent(props: any) {
//   const [del, setDelete] = useState(false);
//   const navigation = useNavigation();
//   const dispatch: AppDispatch = useDispatch();
//   const closeDrawer = () => {
//     navigation.dispatch(DrawerActions.closeDrawer());
//   };

//   const logout = async () => {
//     try {
//       closeDrawer();
//       dispatch(reset());
//       dispatch(resetOtp());
//       await AsyncStorage.removeItem("token");
//       router.dismissAll();
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "auth" }],
//       });
//     } catch (error: any) {
//       console.log("error", error);
//     }
//   };

//   return (
//     <DrawerContentScrollView {...props}>
//       <DrawerItemList {...props} />
//       <DrawerItem
//         icon={({ color }) => <Icon source="logout" color={color} size={22} />}
//         label="Logout"
//         labelStyle={{ fontFamily: "Nunito_700Bold", color: "black" }}
//         onPress={async () => {
//           setDelete(true);
//         }}
//       />
//       <Portal>
//         <Dialog
//           visible={del}
//           dismissable={false}
//           style={{ backgroundColor: "#ffffff" }}
//         >
//           <Dialog.Icon icon="alert" color="orange" size={40} />
//           <Dialog.Title>Logout</Dialog.Title>
//           <Dialog.Content>
//             <Text>Are you sure you want to logout?</Text>
//           </Dialog.Content>
//           <Dialog.Actions>
//             <Button
//               onPress={() => {
//                 setDelete(false);
//                 closeDrawer();
//               }}
//             >
//               Cancel
//             </Button>
//             <Button mode="contained" onPress={logout}>
//               Confirm
//             </Button>
//           </Dialog.Actions>
//         </Dialog>
//       </Portal>
//     </DrawerContentScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   floatingButtonContainer: {
//     position: "absolute",
//     bottom: 30,
//     left: "50%",
//     transform: [{ translateX: -30 }],
//     zIndex: 10,
//   },
//   floatingButton: {
//     backgroundColor: "#673ab7",
//     borderRadius: 30,
//     elevation: 5,
//   },
// });

import React, { useState } from "react";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { router, useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { Button, Dialog, Icon, Portal, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { resetOtp } from "@/store/auth/otpReducer";
import { reset } from "@/store/auth/authReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Capitalize } from "@/utils/common";

const male_default = require("../../assets/images/gender/male_default.png");
const female_default = require("../../assets/images/gender/female_default.png");
const both_default = require("../../assets/images/gender/both_default.png");

export default function CustomDrawerContent(props: any) {
  const userData = useSelector((state: RootState) => state?.user?.data);
  const [del, setDelete] = useState(false);
  const navigation = useNavigation();
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  console.log("user:", user);
  console.log("fullstate: ", userData);

  const redableGender = (gender: any) => {
    if (gender == 1) {
      return male_default;
    } else if (gender == 2) {
      return female_default;
    }
    return both_default;
  };
  const closeDrawer = () => {
    // Use the navigation from drawer props first (most reliable for drawer content)
    if (
      props.navigation &&
      typeof props.navigation.closeDrawer === "function"
    ) {
      props.navigation.closeDrawer();
    } else {
      // Fallback: use DrawerActions if closeDrawer method doesn't exist
      navigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  const logout = async () => {
    try {
      closeDrawer();
      dispatch(reset());
      dispatch(resetOtp());
      await AsyncStorage.removeItem("id");
      await AsyncStorage.removeItem("last_seen_reports");
      await AsyncStorage.removeItem("user_mobile");
      await AsyncStorage.removeItem("user_map_id");
      // while (router.canGoBack()) {
      //   router.back();
      // }
      router.dismissAll();
      router.push("/auth");
    } catch (error: any) {
      console.log("error", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <LinearGradient
          colors={["white", "#e5e7eb"]}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.8 }}
          style={{
            borderRadius: 25,
            width: "90%",
            marginTop: 8,
            alignSelf: "center",
            paddingVertical: 12,
            paddingHorizontal: 20,
          }}
        >
          <Image
            source={redableGender(userData?.gender)}
            style={{
              height: 80,
              width: 80,
              borderRadius: 40,
              marginBottom: 10,
            }}
          />
          <Text
            style={{
              fontFamily: "Nunito_600SemiBold",
              fontSize: 18,
              marginBottom: 5,
              color: "black",
            }}
          >
            {userData?.patient_name ? Capitalize(userData.patient_name) : "NA"}
          </Text>
          <Text
            style={{
              fontFamily: "Nunito_500Medium",
              fontSize: 13,
              marginBottom: 5,
              color: "black",
            }}
          >
            {userData?.mobile_no ? userData?.mobile_no : "NA"}
          </Text>
        </LinearGradient>
        <View style={{ flex: 1, paddingTop: 12 }}>
          <DrawerItemList {...props} />
          {/* <DrawerItem
            icon={({ color }) => (
              <Icon source="logout" color={"white"} size={22} />
            )}
            label="Logout"
            labelStyle={{ fontFamily: "Nunito_700Bold", color: "white" }}
            onPress={() => setDelete(true)}
          /> */}
        </View>
      </DrawerContentScrollView>
      <View style={{ padding: 10 }}>
        <Button
          mode={"contained"}
          contentStyle={{ paddingVertical: 3 }}
          style={{
            width: "100%",
            borderRadius: 25,
            backgroundColor: "#f1f5f9",
            marginVertical: 10,
          }}
          icon={"exit-to-app"}
          labelStyle={{
            fontFamily: "Nunito_700Bold",
            color: "black",
          }}
          onPress={() => setDelete(true)}
        >
          Sign out
        </Button>
      </View>
      <Portal>
        <Dialog visible={del} dismissable={false} style={styles.dialogStyle}>
          <Dialog.Icon icon="alert" color="orange" size={40} />
          <Dialog.Title style={styles.dialogTitle}>Logout</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to logout?
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => setDelete(false)}
              style={styles.cancelButton}
              textColor="#FF5C5C"
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={logout}
              style={styles.confirmButton}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutLabel: {
    fontFamily: "Nunito_700Bold",
    color: "#333",
    fontSize: 16,
  },
  dialogStyle: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
  },
  dialogText: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: "#555",
    paddingVertical: 10,
  },
  dialogActions: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#FFECEC",
    borderRadius: 20,
  },
  confirmButton: {
    backgroundColor: "#673AB7",
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: "50%",
    transform: [{ translateX: -30 }],
    zIndex: 10,
  },
  floatingButton: {
    backgroundColor: "#673AB7",
    borderRadius: 30,
    elevation: 5,
  },
});
