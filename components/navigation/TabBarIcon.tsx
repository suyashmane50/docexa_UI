import Ionicons from "react-native-vector-icons/Ionicons";
import { Icon } from "react-native-paper";

export const Icons: any = {
  home: (props: any) => <Ionicons name="home" size={22} {...props} />,
  appointments: (props: any) => (
    <Icon source="plus-circle" size={22} {...props} />
  ),
  more: (props: any) => (
    <Icon source="dots-horizontal-circle" size={22} {...props} />
  ),
  abha: (props: any) => (
    <Icon
      source={require("../../assets/icons/thermometer.png")}
      size={22}
      {...props}
    />
  ),
  recipe: (props: any) => (
    <Icon
      source={require("../../assets/images/screens/recipe/calories.png")}
      size={22}
      {...props}
    />
  ),
};
