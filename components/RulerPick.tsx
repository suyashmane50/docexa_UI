import React from "react";
import { RulerPicker } from "react-native-ruler-picker";

function RulerPick() {
  return (
    <RulerPicker
      min={0}
      max={240}
      step={1}
      fractionDigits={0}
      initialValue={0}
      onValueChange={(number) => console.log(number)}
      onValueChangeEnd={(number) => console.log(number)}
      unit="cm"
    />
  );
}

export default RulerPick;
