import { Image } from "expo-image";
import { Link, router, Stack } from "expo-router";
import { Dimensions, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
const { width } = Dimensions.get('window');

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>Oops! The page you are looking for doesn't exist.</Text>
      <Image source={require('../assets/images/screens/direction.svg')} style={{ width: width - 100, height: width - 100, marginBottom: 20 }} />
      <Button mode="contained" icon={'home'} labelStyle={{ fontFamily: "Nunito_700Bold" }} onPress={() => {
        router.push('/appointments')
      }}>Go to Dashboard</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "gray"
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  message: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: "Nunito_700Bold"
  },
});
