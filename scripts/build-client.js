#!/usr/bin/env node

/**
 * Build script for a specific client
 * Usage: node scripts/build-client.js client-001 ios|android
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const clientId = process.argv[2];
const platform = process.argv[3] || 'all';

if (!clientId) {
  console.error('❌ Error: Client ID is required');
  console.log('Usage: node scripts/build-client.js <client-id> [ios|android|all]');
  process.exit(1);
}

console.log(`🏗️  Building for client: ${clientId}, platform: ${platform}`);

// Step 1: Generate app.json for this client
console.log('📝 Generating app.json...');
execSync(`node scripts/generate-app-config.js ${clientId}`, { stdio: 'inherit' });

// Step 2: Verify assets exist
const clientsConfigPath = path.join(__dirname, '../config/clients.json');
const clientsConfig = JSON.parse(fs.readFileSync(clientsConfigPath, 'utf8'));
const client = clientsConfig.clients.find(c => c.clientId === clientId);

if (client) {
  const assets = ['icon', 'splash', 'adaptiveIcon', 'favicon'];
  for (const asset of assets) {
    const assetPath = path.join(__dirname, '..', client.assets[asset]);
    if (!fs.existsSync(assetPath)) {
      console.warn(`⚠️  Warning: Asset not found: ${assetPath}`);
    }
  }
}

// Step 3: Build using EAS
const buildCommands = {
  ios: `eas build --platform ios --profile production --non-interactive`,
  android: `eas build --platform android --profile production --non-interactive`,
  all: `eas build --platform all --profile production --non-interactive`
};

const command = buildCommands[platform] || buildCommands.all;

console.log(`🚀 Running: ${command}`);
try {
  execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log(`✅ Build completed for client: ${clientId}`);
} catch (error) {
  console.error(`❌ Build failed for client: ${clientId}`);
  process.exit(1);
}


