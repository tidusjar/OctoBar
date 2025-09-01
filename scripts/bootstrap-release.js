#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Bootstrapping OctoBar for semantic-release...');

try {
  // Check if we're in a git repository
  execSync('git rev-parse --git-dir', { stdio: 'pipe' });
  console.log('✅ Git repository detected');
  
  // Check if there are any existing tags
  let hasTags = false;
  try {
    const tags = execSync('git tag -l', { encoding: 'utf8' });
    hasTags = tags.trim().length > 0;
  } catch (error) {
    hasTags = false;
  }
  
  if (!hasTags) {
    console.log('📦 No existing tags found, creating initial tag...');
    
    // Create an initial tag
    execSync('git tag v0.0.0-alpha.0', { stdio: 'inherit' });
    console.log('✅ Created initial tag: v0.0.0-alpha.0');
    
    // Push the tag to origin
    try {
      execSync('git push origin v0.0.0-alpha.0', { stdio: 'inherit' });
      console.log('✅ Pushed initial tag to origin');
    } catch (error) {
      console.log('⚠️  Could not push tag to origin (this is okay for local development)');
    }
  } else {
    console.log('✅ Existing tags found, no bootstrap needed');
  }
  
  console.log('🎉 Bootstrap complete! Semantic-release should now work properly.');
  
} catch (error) {
  console.error('❌ Error during bootstrap:', error.message);
  process.exit(1);
}
