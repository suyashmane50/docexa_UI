import { AntDesign, Feather } from "@expo/vector-icons";
import React from "react";

type IconProps = { color?: string };

export const icons = {
  home: (props: IconProps) => <AntDesign name="home" size={26} {...props} />,
  abha: (props: IconProps) => <Feather name="activity" size={26} {...props} />,
  appointments: (props: IconProps) => (
    <Feather name="calendar" size={26} {...props} />
  ),
  more: (props: IconProps) => <Feather name="menu" size={26} {...props} />,
};

export type TabIconName = keyof typeof icons;
