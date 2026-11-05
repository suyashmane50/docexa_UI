const client = require("./config");
const fs = require("node:fs");
const path = require("node:path");

const clientFavicon = `./${client.assets.favicon}`;
const favicon = fs.existsSync(path.resolve(__dirname, clientFavicon))
  ? clientFavicon
  : "./assets/app_icon.png";

export default {
  expo: {
    name: client.app.name,
    slug: client.app.slug,
    version: "1.0.0",
    orientation: "portrait",
    scheme: client.app.scheme,
    userInterfaceStyle: "automatic",

    icon: `./${client.assets.icon}`,

    splash: {
      image: `./${client.assets.splash}`,
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    android: {
      package: client.app.bundleId,
      adaptiveIcon: {
        foregroundImage: `./${client.assets.adaptiveIcon}`,
        backgroundColor: "#ffffff",
      },
    },

    web: {
      favicon,
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: client.app.bundleId,
    },

    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-font",
      "@react-native-google-signin/google-signin",
      "expo-web-browser",
      "@react-native-community/datetimepicker",
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: {},

      eas: {
        projectId: "1d24c425-76a8-4bb7-9226-69fec6e1242b",
      },
    },
  },
};
