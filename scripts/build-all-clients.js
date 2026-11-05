#!/usr/bin/env node

/**
 * Build script for all clients
 * Usage: node scripts/build-all-clients.js [ios|android|all]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const platform = process.argv[2] || 'all';

// Load all clients
const clientsConfigPath = path.join(__dirname, '../config/clients.json');
const clientsConfig = JSON.parse(fs.readFileSync(clientsConfigPath, 'utf8'));

console.log(`🏗️  Building for ${clientsConfig.clients.length} clients...\n`);

const results = [];

for (const client of clientsConfig.clients) {
  console.log(`\n📦 Building: ${client.clientName} (${client.clientId})`);
  console.log('─'.repeat(50));
  
  try {
    execSync(`node scripts/build-client.js ${client.clientId} ${platform}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    results.push({ client: client.clientId, status: 'success' });
    console.log(`✅ ${client.clientName} - Build successful\n`);
  } catch (error) {
    results.push({ client: client.clientId, status: 'failed' });
    console.error(`❌ ${client.clientName} - Build failed\n`);
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Build Summary');
console.log('='.repeat(50));
const successful = results.filter(r => r.status === 'success').length;
const failed = results.filter(r => r.status === 'failed').length;

console.log(`✅ Successful: ${successful}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📦 Total: ${results.length}`);

if (failed > 0) {
  console.log('\n❌ Failed builds:');
  results.filter(r => r.status === 'failed').forEach(r => {
    console.log(`   - ${r.client}`);
  });
  process.exit(1);
}


