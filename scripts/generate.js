#!/usr/bin/env node

/**
 * Generate Survey Script
 *
 * Runs the studio pipeline to generate a survey from discovery/methodology docs
 * and saves the output to engine/config/clients/{client-id}.json
 *
 * Usage:
 *   node scripts/generate.js --client acme --discovery path/to/discovery.txt --methodology path/to/methodology.txt
 *   node scripts/generate.js --help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    client: null,
    discovery: null,
    methodology: null,
    maxMinutes: 8,
    output: null,
    tone: [],
    archetypes: [],
    segments: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    const nextArg = args[i + 1];

    switch (arg) {
      case '--client':
        params.client = nextArg;
        i++;
        break;
      case '--discovery':
        params.discovery = nextArg;
        i++;
        break;
      case '--methodology':
        params.methodology = nextArg;
        i++;
        break;
      case '--max-minutes':
        params.maxMinutes = parseInt(nextArg, 10);
        i++;
        break;
      case '--output':
        params.output = nextArg;
        i++;
        break;
      case '--tone':
        params.tone = nextArg.split(',').map(s => s.trim());
        i++;
        break;
      case '--archetypes':
        params.archetypes = nextArg.split(',').map(s => s.trim());
        i++;
        break;
      case '--segments':
        params.segments = nextArg.split(',').map(s => s.trim());
        i++;
        break;
    }
  }

  return params;
}

function printHelp() {
  console.log(`
Generate Survey Script

Usage:
  node scripts/generate.js [options]

Required Options:
  --client <name>           Client name (e.g., "Acme Corp")
  --discovery <path>        Path to discovery document
  --methodology <path>      Path to methodology document

Optional:
  --max-minutes <n>         Max survey duration in minutes (default: 8)
  --output <path>           Custom output path (default: engine/config/clients/{client-slug}.json)
  --tone <csv>              Comma-separated tone keywords (e.g., "warm,inviting")
  --archetypes <csv>        Target archetypes
  --segments <csv>          Audience segments
  --help, -h                Show this help message

Examples:
  # Basic usage
  node scripts/generate.js \\
    --client "Acme Corp" \\
    --discovery examples/discovery.txt \\
    --methodology examples/methodology.txt

  # With additional parameters
  node scripts/generate.js \\
    --client "Beta Corp" \\
    --discovery docs/beta-discovery.txt \\
    --methodology docs/beta-methodology.txt \\
    --max-minutes 10 \\
    --tone "professional,friendly" \\
    --segments "customers,prospects"
  `);
}

function validateParams(params) {
  const errors = [];

  if (!params.client) {
    errors.push('--client is required');
  }

  if (!params.discovery) {
    errors.push('--discovery is required');
  } else if (!fs.existsSync(params.discovery)) {
    errors.push(`Discovery file not found: ${params.discovery}`);
  }

  if (!params.methodology) {
    errors.push('--methodology is required');
  } else if (!fs.existsSync(params.methodology)) {
    errors.push(`Methodology file not found: ${params.methodology}`);
  }

  if (params.maxMinutes < 1 || params.maxMinutes > 60) {
    errors.push('--max-minutes must be between 1 and 60');
  }

  return errors;
}

function generateClientSlug(clientName) {
  return clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🚀 Survey Generation Script\n');

  // Parse and validate arguments
  const params = parseArgs();
  const errors = validateParams(params);

  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('\nRun with --help for usage information');
    process.exit(1);
  }

  const clientSlug = generateClientSlug(params.client);
  console.log(`📋 Client: ${params.client} (slug: ${clientSlug})`);
  console.log(`📄 Discovery: ${params.discovery}`);
  console.log(`📄 Methodology: ${params.methodology}`);
  console.log(`⏱️  Max Duration: ${params.maxMinutes} minutes\n`);

  // Determine output path
  const outputPath = params.output || path.join(
    __dirname,
    '..',
    'engine',
    'config',
    'clients',
    `${clientSlug}.json`
  );

  console.log(`💾 Output: ${outputPath}\n`);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    console.log(`📁 Creating directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Build studio CLI command
  const studioDir = path.join(__dirname, '..', 'studio');
  const cliArgs = [
    '--discovery', path.resolve(params.discovery),
    '--methodology', path.resolve(params.methodology),
    '--client', params.client,
    '--max-minutes', params.maxMinutes,
    '--output', path.resolve(outputPath),
  ];

  if (params.tone.length > 0) {
    cliArgs.push('--tone', params.tone.join(','));
  }

  if (params.archetypes.length > 0) {
    cliArgs.push('--archetypes', params.archetypes.join(','));
  }

  if (params.segments.length > 0) {
    cliArgs.push('--segments', params.segments.join(','));
  }

  const command = `npm run cli -- ${cliArgs.join(' ')}`;

  console.log('🤖 Running studio generation pipeline...\n');
  console.log(`   $ cd studio && ${command}\n`);

  try {
    // Run studio CLI
    execSync(command, {
      cwd: studioDir,
      stdio: 'inherit',
    });

    console.log('\n✅ Survey generated successfully!');
    console.log(`📍 Config saved to: ${outputPath}`);

    // Validate output
    if (!fs.existsSync(outputPath)) {
      throw new Error('Output file was not created');
    }

    const config = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

    console.log('\n📊 Survey Summary:');
    console.log(`   Name: ${config.survey.name}`);
    console.log(`   Blocks: ${Object.keys(config.blocks).length}`);
    console.log(`   Estimated Duration: ${config.survey.metadata.estimatedMinutes} minutes`);

    console.log('\n🎯 Next Steps:');
    console.log(`   1. Test locally: npm run test-client ${clientSlug}`);
    console.log(`   2. Deploy: npm run deploy-client ${clientSlug}`);

  } catch (error) {
    console.error('\n❌ Generation failed:');
    console.error(error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
