#!/usr/bin/env node

/**
 * Validate Survey Configuration
 *
 * Validates a survey config file against the schema and checks for common issues.
 *
 * Usage:
 *   node scripts/validate.js <path-to-config.json>
 *   node scripts/validate.js engine/config/clients/acme.json
 */

const fs = require('fs');
const path = require('path');

function printHelp() {
  console.log(`
Validate Survey Configuration

Usage:
  node scripts/validate.js <path-to-config>

Examples:
  node scripts/validate.js engine/config/clients/acme.json
  node scripts/validate.js studio/out.survey.config.json
  `);
}

// Basic validation functions
function validateSurveyConfig(config) {
  const errors = [];
  const warnings = [];

  // Check top-level structure
  if (!config.survey) {
    errors.push('Missing "survey" object');
  } else {
    if (!config.survey.id) {
      errors.push('survey.id is required');
    }
    if (!config.survey.name) {
      errors.push('survey.name is required');
    }
    if (!config.survey.metadata) {
      warnings.push('survey.metadata is recommended');
    }
  }

  if (!config.blocks) {
    errors.push('Missing "blocks" object');
    return { valid: false, errors, warnings };
  }

  // Check blocks
  const blockIds = Object.keys(config.blocks);

  if (blockIds.length === 0) {
    errors.push('Survey must have at least one block');
  }

  const validTypes = [
    'text-input',
    'single-choice',
    'multi-choice',
    'scale',
    'yes-no',
    'dynamic-message',
    'final-message',
    'video-autoplay',
    'videoask',
    'contact-form',
    'demographics',
    'message-button',
    'quick-reply',
    'ranking',
    'semantic-differential',
    'mixed-media',
  ];

  // Validate each block
  blockIds.forEach(blockId => {
    const block = config.blocks[blockId];

    if (!block.id) {
      errors.push(`Block ${blockId}: missing "id" field`);
    } else if (block.id !== blockId) {
      errors.push(`Block ${blockId}: id "${block.id}" doesn't match key`);
    }

    if (!block.type) {
      errors.push(`Block ${blockId}: missing "type" field`);
    } else if (!validTypes.includes(block.type)) {
      errors.push(`Block ${blockId}: invalid type "${block.type}"`);
    }

    if (!block.content && block.type !== 'final-message') {
      warnings.push(`Block ${blockId}: missing "content" field`);
    }

    // Check question types have variables
    const questionTypes = ['text-input', 'single-choice', 'multi-choice', 'scale', 'yes-no'];
    if (questionTypes.includes(block.type) && !block.variable) {
      errors.push(`Block ${blockId}: "${block.type}" must have a "variable" field`);
    }

    // Check choice types have options
    const choiceTypes = ['single-choice', 'multi-choice', 'scale'];
    if (choiceTypes.includes(block.type)) {
      if (!block.options || !Array.isArray(block.options)) {
        errors.push(`Block ${blockId}: "${block.type}" must have "options" array`);
      } else if (block.options.length === 0) {
        errors.push(`Block ${blockId}: "options" array cannot be empty`);
      } else {
        // Validate options
        block.options.forEach((option, idx) => {
          if (!option.id) {
            errors.push(`Block ${blockId}, option ${idx}: missing "id"`);
          }
          if (!option.label) {
            errors.push(`Block ${blockId}, option ${idx}: missing "label"`);
          }
          if (option.value === undefined) {
            warnings.push(`Block ${blockId}, option ${idx}: missing "value"`);
          }
        });
      }
    }

    // Check next pointers (except final-message)
    if (block.type !== 'final-message' && !block.next) {
      errors.push(`Block ${blockId}: missing "next" field (required for non-final blocks)`);
    }

    // Validate next references
    if (block.next) {
      if (typeof block.next === 'string') {
        if (!blockIds.includes(block.next)) {
          errors.push(`Block ${blockId}: "next" references non-existent block "${block.next}"`);
        }
      } else if (typeof block.next === 'object') {
        // Conditional next
        if (block.next.if && Array.isArray(block.next.if)) {
          block.next.if.forEach((rule, idx) => {
            if (rule.goto && !blockIds.includes(rule.goto)) {
              errors.push(`Block ${blockId}, conditional ${idx}: "goto" references non-existent block "${rule.goto}"`);
            }
          });
        }
        if (block.next.else && !blockIds.includes(block.next.else)) {
          errors.push(`Block ${blockId}: "else" references non-existent block "${block.next.else}"`);
        }
      }
    }
  });

  // Check for unreachable blocks
  const reachableBlocks = new Set();
  const startBlock = blockIds[0]; // Assume first block is start

  function markReachable(blockId) {
    if (reachableBlocks.has(blockId)) return;
    reachableBlocks.add(blockId);

    const block = config.blocks[blockId];
    if (!block) return;

    if (typeof block.next === 'string') {
      markReachable(block.next);
    } else if (typeof block.next === 'object') {
      if (block.next.if && Array.isArray(block.next.if)) {
        block.next.if.forEach(rule => {
          if (rule.goto) markReachable(rule.goto);
        });
      }
      if (block.next.else) {
        markReachable(block.next.else);
      }
    }
  }

  markReachable(startBlock);

  blockIds.forEach(blockId => {
    if (!reachableBlocks.has(blockId)) {
      warnings.push(`Block ${blockId}: unreachable (no path from start)`);
    }
  });

  // Check for final-message
  const hasFinalMessage = blockIds.some(id => config.blocks[id].type === 'final-message');
  if (!hasFinalMessage) {
    warnings.push('Survey should have at least one "final-message" block');
  }

  // Estimate duration
  let estimatedMinutes = 0;
  blockIds.forEach(blockId => {
    const block = config.blocks[blockId];
    const timeEstimates = {
      'dynamic-message': 0.08,      // 5 seconds
      'text-input': 0.5,             // 30 seconds
      'single-choice': 0.25,         // 15 seconds
      'multi-choice': 0.33,          // 20 seconds
      'scale': 0.17,                 // 10 seconds
      'yes-no': 0.17,                // 10 seconds
      'final-message': 0.08,         // 5 seconds
    };
    estimatedMinutes += timeEstimates[block.type] || 0.25;
  });

  const metaMinutes = config.survey?.metadata?.estimatedMinutes;
  if (metaMinutes && Math.abs(metaMinutes - estimatedMinutes) > 2) {
    warnings.push(`Estimated duration (${estimatedMinutes.toFixed(1)}min) differs significantly from metadata (${metaMinutes}min)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalBlocks: blockIds.length,
      reachableBlocks: reachableBlocks.size,
      estimatedMinutes: parseFloat(estimatedMinutes.toFixed(1)),
    },
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  const configPath = path.resolve(args[0]);

  console.log('🔍 Survey Configuration Validator\n');
  console.log(`📄 File: ${configPath}\n`);

  // Check if file exists
  if (!fs.existsSync(configPath)) {
    console.error('❌ File not found:', configPath);
    process.exit(1);
  }

  // Read and parse config
  let config;
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to parse JSON:');
    console.error(error.message);
    process.exit(1);
  }

  // Validate
  console.log('⚙️  Validating...\n');
  const result = validateSurveyConfig(config);

  // Print results
  if (result.errors.length > 0) {
    console.log('❌ Validation Errors:\n');
    result.errors.forEach((error, idx) => {
      console.log(`   ${idx + 1}. ${error}`);
    });
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    result.warnings.forEach((warning, idx) => {
      console.log(`   ${idx + 1}. ${warning}`);
    });
    console.log('');
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('✅ All validations passed!\n');
  }

  // Print stats
  console.log('📊 Survey Stats:\n');
  console.log(`   Total Blocks: ${result.stats.totalBlocks}`);
  console.log(`   Reachable Blocks: ${result.stats.reachableBlocks}`);
  console.log(`   Estimated Duration: ${result.stats.estimatedMinutes} minutes`);
  console.log('');

  // Exit with appropriate code
  process.exit(result.valid ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
