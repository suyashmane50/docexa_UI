import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";
import { scale, verticalScale, responsiveFontSize } from "@/utils/common";

function index() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View>
        <IconButton
          icon="sort-variant"
          iconColor={"black"}
          size={20}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: scale(16) }}>
        {/* <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16 }}>Comming soon</Text> */}
        <Card mode="contained" style={{ width: '100%', maxWidth: 500, marginVertical: verticalScale(12), borderRadius: scale(12) }} >
          <Card.Content>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: responsiveFontSize(18), textAlign: 'center', marginVertical: verticalScale(6) }}>About Us</Text>
            <View style={{ marginVertical: verticalScale(8) }}>
              <View style={{ flexDirection: 'row', marginVertical: verticalScale(6), flexWrap: 'wrap' }}>
                <Text style={{ fontSize: responsiveFontSize(16), fontFamily: "Nunito_700Bold" }}>Email Us: </Text>
                <Text style={{ fontSize: responsiveFontSize(16), fontFamily: "Nunito_500Medium", flex: 1 }}>docexa@globalspace.in</Text>
              </View>

              <View style={{ flexDirection: 'row', marginVertical: verticalScale(6), flexWrap: 'wrap' }}>
                <Text style={{ fontSize: responsiveFontSize(16), fontFamily: "Nunito_700Bold" }}>Contact Us: </Text>
                <Text style={{ fontSize: responsiveFontSize(16), fontFamily: "Nunito_500Medium", flex: 1 }}>022 - 46006567/68</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  )
}

export default index;
