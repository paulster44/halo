#!/usr/bin/env node

/**
 * Automated Deployment Auth Sync Script
 * 
 * This script ensures Supabase authentication configuration
 * is automatically synchronized with the current deployment URL.
 * 
 * Usage:
 *   node scripts/deploy-auth-sync.js [deployment-url]
 * 
 * If no URL is provided, it will attempt to read from deploy_url.txt
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function extractUrlFromDeployFile() {
  try {
    const deployFile = path.join(process.cwd(), 'deploy_url.txt');
    if (fs.existsSync(deployFile)) {
      const content = fs.readFileSync(deployFile, 'utf8');
      const match = content.match(/https?:\/\/[^\s]+/);
      return match ? match[0] : null;
    }
  } catch (error) {
    log('yellow', `⚠️  Could not read deploy_url.txt: ${error.message}`);
  }
  return null;
}

async function syncAuthConfig(deploymentUrl) {
  try {
    log('blue', '🔄 Starting authentication configuration sync...');
    log('cyan', `📍 Target URL: ${deploymentUrl}`);
    
    // Use fetch to call the edge function
    const response = await fetch(`${deploymentUrl}/api/deployment-auth-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': deploymentUrl
      },
      body: JSON.stringify({
        deploymentUrl: deploymentUrl
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      log('green', '✅ Authentication configuration synced successfully!');
      log('cyan', `📋 Result: ${JSON.stringify(result, null, 2)}`);
      return true;
    } else {
      const errorText = await response.text();
      log('red', `❌ Sync failed: ${response.status} ${response.statusText}`);
      log('red', `📋 Error: ${errorText}`);
      return false;
    }
    
  } catch (error) {
    log('red', `❌ Sync error: ${error.message}`);
    return false;
  }
}

async function main() {
  log('magenta', '🚀 Deployment Auth Sync Tool');
  log('magenta', '==============================');
  
  // Get deployment URL from command line or file
  let deploymentUrl = process.argv[2];
  
  if (!deploymentUrl) {
    log('yellow', '🔍 No URL provided, checking deploy_url.txt...');
    deploymentUrl = extractUrlFromDeployFile();
  }
  
  if (!deploymentUrl) {
    log('red', '❌ Error: No deployment URL found!');
    log('yellow', 'Usage: node scripts/deploy-auth-sync.js [deployment-url]');
    log('yellow', 'Or ensure deploy_url.txt exists with the deployment URL');
    process.exit(1);
  }
  
  // Validate URL format
  try {
    new URL(deploymentUrl);
  } catch (error) {
    log('red', `❌ Invalid URL format: ${deploymentUrl}`);
    process.exit(1);
  }
  
  const success = await syncAuthConfig(deploymentUrl);
  
  if (success) {
    log('green', '🎉 Deployment auth sync completed successfully!');
    process.exit(0);
  } else {
    log('red', '💥 Deployment auth sync failed!');
    log('yellow', '⚠️  The application may still work, but authentication issues may occur.');
    log('yellow', '💡 Check the Supabase dashboard or manually run the sync later.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log('red', `💥 Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { syncAuthConfig, extractUrlFromDeployFile };