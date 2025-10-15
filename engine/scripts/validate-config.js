#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '..', 'config');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateJSON(filePath, schemaName) {
  log(`\nValidating ${path.basename(filePath)}...`, 'cyan');

  if (!fs.existsSync(filePath)) {
    log(`✗ File not found: ${filePath}`, 'red');
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Basic validation based on schema type
    if (schemaName === 'survey') {
      if (!data.survey || !data.survey.id || !data.survey.name) {
        log('✗ Invalid survey config: missing required fields (survey.id, survey.name)', 'red');
        return false;
      }
      if (!data.blocks || typeof data.blocks !== 'object') {
        log('✗ Invalid survey config: missing or invalid blocks object', 'red');
        return false;
      }
      log(`✓ Survey: ${data.survey.name}`, 'green');
      log(`  └─ ID: ${data.survey.id}`, 'blue');
      log(`  └─ Blocks: ${Object.keys(data.blocks).length}`, 'blue');
    }

    if (schemaName === 'theme') {
      if (!data.metadata || !data.metadata.organizationName) {
        log('✗ Invalid theme config: missing metadata.organizationName', 'red');
        return false;
      }
      if (!data.colors || !data.colors.primary || !data.colors.secondary) {
        log('✗ Invalid theme config: missing required colors', 'red');
        return false;
      }
      if (!data.fonts || !data.fonts.primary) {
        log('✗ Invalid theme config: missing fonts.primary', 'red');
        return false;
      }
      log(`✓ Theme: ${data.metadata.name || 'Unnamed'}`, 'green');
      log(`  └─ Organization: ${data.metadata.organizationName}`, 'blue');
      log(`  └─ Primary Color: ${data.colors.primary}`, 'blue');
      log(`  └─ Secondary Color: ${data.colors.secondary}`, 'blue');
    }

    return true;
  } catch (error) {
    log(`✗ Error parsing JSON: ${error.message}`, 'red');
    return false;
  }
}

function validateHexColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function main() {
  log('='.repeat(50), 'cyan');
  log('  Survey Engine Configuration Validator', 'cyan');
  log('='.repeat(50), 'cyan');

  const surveyPath = path.join(CONFIG_DIR, 'survey.json');
  const themePath = path.join(CONFIG_DIR, 'theme.json');

  let allValid = true;

  // Check if config files exist, if not, suggest using examples
  if (!fs.existsSync(surveyPath)) {
    log('\n⚠  survey.json not found', 'yellow');
    const examplePath = path.join(CONFIG_DIR, 'survey.example.json');
    if (fs.existsSync(examplePath)) {
      log(`  → Copy survey.example.json to survey.json to get started`, 'yellow');
      log(`  → Command: cp config/survey.example.json config/survey.json`, 'blue');
    }
    allValid = false;
  } else {
    allValid = validateJSON(surveyPath, 'survey') && allValid;
  }

  if (!fs.existsSync(themePath)) {
    log('\n⚠  theme.json not found', 'yellow');
    const examplePath = path.join(CONFIG_DIR, 'theme.example.json');
    if (fs.existsSync(examplePath)) {
      log(`  → Copy theme.example.json to theme.json to get started`, 'yellow');
      log(`  → Command: cp config/theme.example.json config/theme.json`, 'blue');
    }
    allValid = false;
  } else {
    allValid = validateJSON(themePath, 'theme') && allValid;
  }

  // Check for assets
  log('\nChecking assets...', 'cyan');
  const assetsDir = path.resolve(__dirname, '..', 'public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    log('⚠  Assets directory not found', 'yellow');
  } else {
    const files = fs.readdirSync(assetsDir).filter(f => f !== '.gitkeep');
    if (files.length === 0) {
      log('⚠  No assets found (logo, favicon, etc.)', 'yellow');
      log('  → Add your logo and favicon to public/assets/', 'blue');
    } else {
      log(`✓ Found ${files.length} asset(s):`, 'green');
      files.forEach(file => log(`  └─ ${file}`, 'blue'));
    }
  }

  log('\n' + '='.repeat(50), 'cyan');
  if (allValid) {
    log('✓ All configurations are valid!', 'green');
    log('  Ready to deploy!', 'green');
    process.exit(0);
  } else {
    log('✗ Configuration validation failed', 'red');
    log('  Please fix the errors above before deploying', 'red');
    process.exit(1);
  }
}

main();
