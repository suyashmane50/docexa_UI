import React from "react";
import {
  TextInput,
  SafeAreaView,
  ScrollView,
  Animated,
  Image,
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
const { width } = Dimensions.get("screen");

const minValue = 0;
const segmentsLength = 298;
const segmentWidth = 2;
const segmentSpacing = 20;
const snapSegment = segmentWidth + segmentSpacing;
const spacerWidth = (width - segmentWidth) / 2;
const rulerWidth = spacerWidth * 2 + (segmentsLength - 1) * snapSegment;
const indicatorWidth = 100;
const indicatorHeight = 80;
const data = [...Array(segmentsLength).keys()].map((i) => i + minValue);

type RulerState = {
  scrollX: Animated.Value;
  initialAge: number;
  age: number;
};

const Ruler = () => {
  return (
    <View style={styles.ruler}>
      <View style={styles.spacer} />
      {data.map((i) => {
        const tenth = i % 10 === 0;
        return (
          <View
            key={i}
            style={[
              styles.segment,
              {
                backgroundColor: tenth ? "#333" : "#999",
                height: tenth ? 40 : 20,
                marginRight: i === data.length - 1 ? 0 : segmentSpacing,
              },
            ]}
          />
        );
      })}
      <View style={styles.spacer} />
    </View>
  );
};

export default class App extends React.Component<Record<string, never>, RulerState> {
  scrollViewRef = React.createRef<ScrollView>();

  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      scrollX: new Animated.Value(0),
      initialAge: 25,
      age: minValue, // Initial age state
    };

    this.state.scrollX.addListener(({ value }) => {
      const age = Math.round(value / snapSegment) + minValue;
      this.setState({ age });
    });
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.scrollViewRef.current) {
        this.scrollViewRef.current.scrollTo({
          x: (this.state.initialAge - minValue) * snapSegment,
          y: 0,
          animated: true,
        });
      }
    }, 1000);
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {/* <Image
          source={require("../assets/images/screens/background-image.png")}
          style={styles.cake}
        /> */}
        <Animated.ScrollView
          ref={this.scrollViewRef}
          horizontal
          contentContainerStyle={styles.scrollViewContainerStyle}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          snapToInterval={snapSegment}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: { x: this.state.scrollX },
                },
              },
            ],
            { useNativeDriver: true }
          )}
        >
          <Ruler />
        </Animated.ScrollView>
        <View style={styles.indicatorWrapper}>
          <TextInput
            style={styles.ageTextStyle}
            value={this.state.age.toString()} // Display the age state
            editable={false} // Make TextInput read-only
          />
          <View style={[styles.segment, styles.segmentIndicator]} />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  indicatorWrapper: {
    position: "absolute",
    left: (width - indicatorWidth) / 2,
    bottom: 34,
    alignItems: "center",
    justifyContent: "center",
    width: indicatorWidth,
  },
  segmentIndicator: {
    height: indicatorHeight,
    backgroundColor: "turquoise",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  cake: {
    width,
    height: width * 1.2,
    resizeMode: "cover",
  },
  ruler: {
    width: rulerWidth,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  segment: {
    width: segmentWidth,
  },
  scrollViewContainerStyle: {
    justifyContent: "flex-end",
  },
  ageTextStyle: {
    fontSize: 42,
    fontFamily: "Menlo",
  },
  spacer: {
    width: spacerWidth,
    backgroundColor: "red",
  },
});
