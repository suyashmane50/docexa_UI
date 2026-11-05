import { format, parse, parseISO, sub } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Linking } from "react-native";

export const convertDateToYYYYMMDD = (date: Date = new Date()) => {
  return format(date, "yyyy-MM-dd");
};

export const encode = (value: string) => {
  return JSON.stringify(value);
};

export const decode = (value: string) => {
  return JSON.parse(value);
};

export const saveToken = async (value: string | number) => {
  await AsyncStorage.setItem("token", value?.toString());
};


export const getToken = async () => {
  const value = await AsyncStorage.getItem("token");
  return value;
};

export const saveToLocalStorage = async (key: string, value: string | number) => {
  await AsyncStorage.setItem(key, value?.toString());
};

export const getFromLocalStorage = async (key: string) => {
  await AsyncStorage.getItem(key);
};


export const removeToken = async () => {
  await AsyncStorage.removeItem("token");
};

export const today = () => {
  return format(new Date(), "yyyy-MM-dd");
};

export const currentWeekday = () => {
  const currentDay = format(new Date(), 'EEE');
  return currentDay;
}


export const MMMDD = (date: Date) => {
  return format(date, 'MMM d')
}

export const call = (num: number | string) => {
  Linking.openURL(`tel:${num}`);
};


export const whatsapp = (mobile_number: number | string) => {
  Linking.openURL(`https://wa.me/+91${mobile_number}`);
};

export const mail = (mail: string) => {
  Linking.openURL(`mailto:${mail}`)
}

export const link = (url: string) => {
  Linking.openURL(url);
};

// export const to12hr = (input: string) => {
//   const temp = parse(input, 'HH:mm', new Date());
//   return format(temp, 'hh:mm a');
// }

export const to12hr = (time?: string) => {
  if (!time) return "";

  // If already AM/PM, return as-is
  if (time.includes("AM") || time.includes("PM")) {
    return time;
  }

  // Handle HH:mm:ss
  const date = new Date(`1970-01-01T${time}`);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};


export const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const gender_data = [
  {
    id: 1,
    label: "Male",
    img: require("../assets/images/male.png"),
  },
  {
    id: 2,
    label: "Female",
    img: require("../assets/images/female.png"),
  },

];


export interface app_type { id: number, label: string, img: string }

export const appointment_type: app_type[] = [
  // {
  //   id: 1,
  //   label: 'On-call Consultation',
  //   img: 'oncall'
  // },
  {
    id: 1,
    label: 'Physical Consultation',
    img: 'doctorpatient'
  },
]

export const getAnimationSource = (img: string) => {
  switch (img) {
    case 'oncall':
      return require('../assets/lottie/oncall.json');
    case 'doctorpatient':
      return require('../assets/lottie/doctorpatient.json');
    default:
      return require('../assets/lottie/doctorpatient.json');
  }
};

export const daytime = require("../assets/images/screens/sunset.png");
export const nighttime = require("../assets/images/screens/moo.png");

export const Capitalize = (str: string) => {
  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return "NA";
};

export const services = [
  { id: '1', title: 'Appointments', image: require('../assets/images/screens/booking.svg'), route: '/home/appointments', lottiefile: require('../assets/lottie/schedule.json'), icon: require('@/assets/icons/homepageIcons/booking_icon.png') },

  // {
  //   id: '2', title: 'Call', image: require('../assets/images/screens/callappointment.png'), route: '/home/appointments/telephonic', lottiefile: require('@/assets/images/screens/callappointment.png'), icon: require('@/assets/images/screens/callappointment.png')
  // },
  { id: '3', title: 'Prescription', image: require('../assets/images/screens/record.svg'), route: '/home/rx', lottiefile: require('../assets/lottie/rx.json'), icon: require('@/assets/icons/homepageIcons/rx_icon.png') },
  { id: '4', title: 'Reports', image: require('../assets/images/screens/booking.svg'), route: '/home/report', lottiefile: require('../assets/lottie/schedule.json'), icon: require('@/assets/icons/homepageIcons/report_page.png') },
  // { id: '4', title: 'Reports', image: require('../assets/images/screens/booking.svg'), route: '/home/report', lottiefile: require('../assets/lottie/report.json'), icon: require('@/assets/icons/report-96.png') },
];

export const ddMMMMyyyy = (date: Date) => {
  if (date) {
    const formattedDate = format(date, "dd MMMM yyyy");
    return formattedDate;
  }
  return "NA";
};

export const StdToDDMMMMYY = (date: string | undefined): string => {
  if (!date) {
    return "Not Available";
  }

  try {
    const parsed = parseISO(date);
    // If parseISO fails silently and returns Invalid Date
    if (isNaN((parsed as any).getTime?.() ?? NaN)) {
      return date;
    }
    return format(parsed, "dd MMM yyyy");
  } catch {
    // Fallback to raw value if format is unexpected
    return date;
  }
};

export const yyyyymmddToInterpable = (date: string | undefined): string => {
  const parsedDate = date ? parse(date, "yyyy-MM-dd HH:mm:ss", new Date()) : "Not Available";
  const formatted = format(parsedDate, "dd-MMM-yyyy h:mm:ss a")
  return formatted;
}

// Responsive utilities
import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base dimensions (iPhone 12/13 standard)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Responsive scaling functions
export const scale = (size: number): number => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scaleFactor);
};

export const verticalScale = (size: number): number => {
  const scaleFactor = SCREEN_HEIGHT / BASE_HEIGHT;
  return Math.round(size * scaleFactor);
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size + (scaleFactor - 1) * size * factor);
};

// Responsive font size
export const responsiveFontSize = (size: number): number => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scaleFactor;
  return Math.max(10, Math.min(newSize, size * 1.3)); // Clamp between 10 and 130% of original
};

// Check if device is small
export const isSmallDevice = (): boolean => SCREEN_WIDTH < 360;
export const isMediumDevice = (): boolean => SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 414;
export const isLargeDevice = (): boolean => SCREEN_WIDTH >= 414;