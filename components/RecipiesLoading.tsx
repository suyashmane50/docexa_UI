import React, { memo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Text } from "react-native-paper";

const numColumns = 2;
const size = Dimensions.get("window").width / numColumns;
function Placeholder({
  width,
  height,
  circle = false,
  style,
}: {
  width: number;
  height: number;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: circle ? width / 2 : 8,
          backgroundColor: "#D8D9DA",
        },
        style,
      ]}
    />
  );
}



function RecipiesLoading() {
  const skeletonItems = [1, 2];

  const SkeletonItem = () => (
    <View style={styles.item}>
      <Placeholder
        width={size - 20}
        height={size - 20}
        style={{ borderRadius: 8, backgroundColor: "#D8D9DA" }}
      />
    </View>
  );

  const SkeletonAvtar = () => (
    <View
      style={{
        marginRight: 2,
        width: 90,
        height: 120,
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <Placeholder
        style={{ marginRight: 12, backgroundColor: "#D8D9DA" }}
        circle
        width={80}
        height={80}
      />
      <Placeholder
        style={{ borderRadius: 5, marginTop: 8, backgroundColor: "#D8D9DA" }}
        width={80}
        height={20}
      />
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: "white", padding: 10 }}>
        <Text
          style={{
            fontFamily: "Nunito_700Bold",
            fontSize: 15,
            marginTop: 10,
            marginStart: 8,
          }}
        >
          Our Top RecipiesLoading
        </Text>
        <FlatList
          data={skeletonItems}
          keyExtractor={(item) => item.toString()}
          numColumns={numColumns}
          renderItem={SkeletonItem}
          scrollEnabled={false}
        />
        <View style={{ marginVertical: 15, marginHorizontal: 5 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontFamily: "Nunito_700Bold" }}>Idlis & Dosas</Text>
            <Pressable>
              <Text style={{ fontFamily: "Nunito_800ExtraBold", color: "gray" }}>
                VIEW ALL
              </Text>
            </Pressable>
          </View>
          <FlatList
            contentContainerStyle={{ marginVertical: 12 }}
            data={[1, 2, 3, 4, 5, 6, 7, 8]}
            keyExtractor={(item) => item.toString()}
            horizontal={true}
            renderItem={SkeletonAvtar}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </View>
      <View
        style={{ marginVertical: 15, backgroundColor: "white", padding: 12 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 8,
          }}
        >
          <Text style={{ fontFamily: "Nunito_700Bold" }}>Rice Based Dishes</Text>
          <Pressable>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", color: "gray" }}>
              VIEW ALL
            </Text>
          </Pressable>
        </View>
        <FlatList
          contentContainerStyle={{ marginVertical: 12 }}
          data={[1, 2, 3, 4, 5, 6, 7, 8]}
          keyExtractor={(item) => item.toString()}
          horizontal={true}
          renderItem={SkeletonAvtar}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
      <View style={{ backgroundColor: "white", padding: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 8,
          }}
        >
          <Text style={{ fontFamily: "Nunito_700Bold" }}>Salads</Text>
          <Pressable>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", color: "gray" }}>
              VIEW ALL
            </Text>
          </Pressable>
        </View>
        <FlatList
          contentContainerStyle={{ marginVertical: 11 }}
          data={[1, 2, 3, 4, 5, 6, 7, 8]}
          keyExtractor={(item) => item.toString()}
          horizontal={true}
          renderItem={SkeletonAvtar}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

export default memo(RecipiesLoading);

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 2,
    height: size,
  },
});
