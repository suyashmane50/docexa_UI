import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "LAST_SEEN_TIME";

export const getLastSeenTime = async () => {
    if (Platform.OS === "web") {
        return localStorage.getItem(KEY);
    } else {
        return await AsyncStorage.getItem(KEY);
    }
};

export const setLastSeenTime = async () => {
    const now = new Date().toISOString();

    if (Platform.OS === "web") {
        localStorage.setItem(KEY, now);
    } else {
        await AsyncStorage.setItem(KEY, now);
    }
};