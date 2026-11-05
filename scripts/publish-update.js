#!/usr/bin/env node

/**
 * Publish OTA update for all clients
 * Usage: node scripts/publish-update.js [client-id]
 * If no client-id provided, publishes for all clients
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const clientId = process.argv[2];

console.log('🚀 Publishing OTA Update...\n');

if (clientId) {
  // Publish for specific client
  console.log(`📦 Publishing update for client: ${clientId}`);
  
  // Generate app.json for this client
  execSync(`node scripts/generate-app-config.js ${clientId}`, { stdio: 'inherit' });
  
  // Publish update
  console.log('\n📤 Publishing to Expo Updates...');
  execSync('eas update --branch production --message "Update all clients"', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log(`\n✅ Update published for ${clientId}`);
} else {
  // Publish for all clients
  const clientsConfigPath = path.join(__dirname, '../config/clients.json');
  const clientsConfig = JSON.parse(fs.readFileSync(clientsConfigPath, 'utf8'));
  
  console.log(`📦 Publishing update for ${clientsConfig.clients.length} clients...\n`);
  
  // Note: With Expo Updates, you typically publish once and all clients get it
  // if they share the same runtime version. For separate channels per client,
  // you'd need to publish to different branches/channels.
  
  console.log('📤 Publishing to Expo Updates (all clients)...');
  execSync('eas update --branch production --message "Update all clients"', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log(`\n✅ Update published for all clients`);
  console.log('📱 All deployed apps will receive this update automatically!');
}


