#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// This script helps debug the file structure in a packaged Electron app
// Run this from the packaged app's main process directory

console.log('=== PACKAGED APP STRUCTURE DEBUG ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Check main directory
console.log('\n--- Main directory files ---');
try {
  const mainFiles = fs.readdirSync(__dirname);
  console.log('Files in main directory:', mainFiles);
} catch (err) {
  console.error('Error reading main directory:', err);
}

// Check renderer directory
console.log('\n--- Renderer directory files ---');
const rendererPath = path.join(__dirname, 'renderer');
try {
  if (fs.existsSync(rendererPath)) {
    const rendererFiles = fs.readdirSync(rendererPath);
    console.log('Files in renderer directory:', rendererFiles);
    
    // Check for index.html specifically
    const indexPath = path.join(rendererPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.html found at:', indexPath);
    } else {
      console.log('❌ index.html not found at:', indexPath);
    }
  } else {
    console.log('❌ Renderer directory does not exist:', rendererPath);
  }
} catch (err) {
  console.error('Error reading renderer directory:', err);
}

// Check assets directory
console.log('\n--- Assets directory files ---');
const assetsPath = path.join(__dirname, 'renderer', 'assets');
try {
  if (fs.existsSync(assetsPath)) {
    const assetsFiles = fs.readdirSync(assetsPath);
    console.log('Files in assets directory:', assetsFiles);
  } else {
    console.log('❌ Assets directory does not exist:', assetsPath);
  }
} catch (err) {
  console.error('Error reading assets directory:', err);
}

console.log('\n=== END DEBUG ===');
