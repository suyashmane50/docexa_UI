#!/usr/bin/env node

/**
 * Script to generate app.json for a specific client
 * Usage: node scripts/generate-app-config.js client-001
 */

const fs = require('fs');
const path = require('path');

const clientId = process.argv[2];

if (!clientId) {
  console.error('❌ Error: Client ID is required');
  console.log('Usage: node scripts/generate-app-config.js <client-id>');
  process.exit(1);
}

// Load client configurations
const clientsConfigPath = path.join(__dirname, '../config/clients.json');
const clientsConfig = JSON.parse(fs.readFileSync(clientsConfigPath, 'utf8'));

const client = clientsConfig.clients.find(c => c.clientId === clientId);

if (!client) {
  console.error(`❌ Error: Client "${clientId}" not found in config/clients.json`);
  process.exit(1);
}

// Base app.json template
const baseAppJson = {
  expo: {
    name: client.appName,
    slug: client.appSlug,
    version: "1.0.0",
    orientation: "portrait",
    icon: client.assets.icon,
    scheme: client.scheme,
    userInterfaceStyle: "automatic",
    splash: {
      image: client.assets.splash,
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: client.bundleId,
      buildNumber: "1"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: client.assets.adaptiveIcon,
        backgroundColor: "#ffffff"
      },
      package: client.packageName,
      versionCode: 1
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: client.assets.favicon
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-font",
      [
        "@react-native-google-signin/google-signin"
      ],
      "expo-web-browser",
      "expo-updates"
    ],
    experiments: {
      typedRoutes: true
    },
    updates: {
      url: `https://u.expo.dev/${process.env.EXPO_PROJECT_ID || 'default'}`
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    extra: {
      clientId: client.clientId,
      clientName: client.clientName,
      apiBaseUrl: process.env.API_BASE_URL || "https://api.example.com"
    }
  }
};

// Write app.json
const appJsonPath = path.join(__dirname, '../app.json');
fs.writeFileSync(appJsonPath, JSON.stringify(baseAppJson, null, 2));

console.log(`✅ Generated app.json for client: ${client.clientName}`);
console.log(`   App Name: ${client.appName}`);
console.log(`   Bundle ID: ${client.bundleId}`);
console.log(`   Package: ${client.packageName}`);
console.log(`   Scheme: ${client.scheme}`);

