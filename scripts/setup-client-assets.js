#!/usr/bin/env node

/**
 * Script to set up asset directories for a new client
 * Usage: node scripts/setup-client-assets.js client-001
 */

const fs = require('fs');
const path = require('path');

const clientId = process.argv[2];

if (!clientId) {
  console.error('❌ Error: Client ID is required');
  console.log('Usage: node scripts/setup-client-assets.js <client-id>');
  process.exit(1);
}

const assetsDir = path.join(__dirname, '../assets/clients', clientId);

// Create directory structure
const directories = [
  assetsDir,
  path.join(assetsDir, 'ios'),
  path.join(assetsDir, 'android')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create placeholder README
const readmePath = path.join(assetsDir, 'README.md');
const readmeContent = `# Assets for ${clientId}

Place the following assets in this directory:

## Required Assets:

1. **icon.png** (1024x1024px)
   - App icon for iOS and Android
   - Should be square with no transparency

2. **splash.png** (1242x2436px recommended)
   - Splash screen image
   - Will be displayed on app launch

3. **adaptive-icon.png** (1024x1024px)
   - Android adaptive icon foreground
   - Should be centered in a safe zone (inner 66%)

4. **favicon.png** (48x48px or larger)
   - Web favicon

## Asset Specifications:

### iOS Icon
- Size: 1024x1024px
- Format: PNG
- No transparency
- No rounded corners (iOS will add them)

### Android Icon
- Size: 1024x1024px
- Format: PNG
- No transparency
- Safe zone: Keep important content in center 66%

### Splash Screen
- Size: 1242x2436px (or use safe area)
- Format: PNG
- Background color should match app theme

## Generating Assets:

You can use tools like:
- Figma
- Sketch
- Online icon generators
- Adobe Illustrator/Photoshop

After placing assets, run:
\`\`\`bash
node scripts/generate-app-config.js ${clientId}
\`\`\`
`;

if (!fs.existsSync(readmePath)) {
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`✅ Created README: ${readmePath}`);
}

console.log(`\n✅ Asset directories set up for ${clientId}`);
console.log(`📁 Assets directory: ${assetsDir}`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Place your assets in: ${assetsDir}`);
console.log(`   2. Update config/clients.json with asset paths`);
console.log(`   3. Run: node scripts/generate-app-config.js ${clientId}`);


