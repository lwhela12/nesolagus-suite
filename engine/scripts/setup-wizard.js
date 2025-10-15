#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const configDir = path.join(__dirname, '..', 'config');
const examplesDir = path.join(__dirname, '..', 'examples');

// Color presets
const colorPresets = {
  'Blue & Green (Professional)': {
    primary: '#0055A5',
    secondary: '#B2BB1C',
    accent: '#4A90E2'
  },
  'Purple & Pink (Modern)': {
    primary: '#6366F1',
    secondary: '#EC4899',
    accent: '#8B5CF6'
  },
  'Teal & Orange (Energetic)': {
    primary: '#14B8A6',
    secondary: '#F97316',
    accent: '#06B6D4'
  },
  'Custom': null
};

// Template options
const templates = {
  'Simple Feedback': path.join(examplesDir, 'simple-feedback', 'survey.json'),
  'Blank Survey': null
};

async function main() {
  console.log(chalk.cyan.bold('\n╔════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║   Survey Engine Setup Wizard   ║'));
  console.log(chalk.cyan.bold('╚════════════════════════════════════════╝\n'));
  console.log(chalk.gray('This wizard will help you customize your survey configuration.\n'));

  // Step 1: Template Selection
  const { templateChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateChoice',
      message: 'How would you like to start?',
      choices: Object.keys(templates)
    }
  ]);

  let surveyConfig;
  if (templates[templateChoice]) {
    // Load template
    const templatePath = templates[templateChoice];
    surveyConfig = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
    console.log(chalk.green(`✓ Loaded template: ${templateChoice}\n`));
  } else {
    // Create blank survey
    surveyConfig = createBlankSurvey();
  }

  // Step 2: Survey Basics
  console.log(chalk.cyan('\n─── Survey Information ───\n'));
  const surveyBasics = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Survey name:',
      default: surveyConfig.survey.name,
      validate: input => input.trim() ? true : 'Survey name is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Survey description:',
      default: surveyConfig.survey.description
    },
    {
      type: 'number',
      name: 'estimatedMinutes',
      message: 'Estimated completion time (minutes):',
      default: surveyConfig.survey.metadata?.estimatedMinutes || 5,
      validate: input => input > 0 ? true : 'Please enter a positive number'
    }
  ]);

  surveyConfig.survey.name = surveyBasics.name;
  surveyConfig.survey.description = surveyBasics.description;
  surveyConfig.survey.metadata = {
    ...surveyConfig.survey.metadata,
    estimatedMinutes: surveyBasics.estimatedMinutes
  };

  // Step 3: Theme Configuration
  console.log(chalk.cyan('\n─── Theme Configuration ───\n'));
  const themeBasics = await inquirer.prompt([
    {
      type: 'input',
      name: 'organizationName',
      message: 'Organization name (shown on welcome screen):',
      default: 'Your Organization'
    },
    {
      type: 'list',
      name: 'colorScheme',
      message: 'Choose a color scheme:',
      choices: Object.keys(colorPresets)
    }
  ]);

  let colors = colorPresets[themeBasics.colorScheme];

  if (!colors) {
    // Custom colors
    const customColors = await inquirer.prompt([
      {
        type: 'input',
        name: 'primary',
        message: 'Primary color (hex):',
        default: '#0055A5',
        validate: input => /^#[0-9A-Fa-f]{6}$/.test(input) ? true : 'Please enter a valid hex color (e.g., #0055A5)'
      },
      {
        type: 'input',
        name: 'secondary',
        message: 'Secondary color (hex):',
        default: '#B2BB1C',
        validate: input => /^#[0-9A-Fa-f]{6}$/.test(input) ? true : 'Please enter a valid hex color'
      },
      {
        type: 'input',
        name: 'accent',
        message: 'Accent color (hex):',
        default: '#4A90E2',
        validate: input => /^#[0-9A-Fa-f]{6}$/.test(input) ? true : 'Please enter a valid hex color'
      }
    ]);
    colors = customColors;
  }

  // Step 4: Assets (optional)
  console.log(chalk.cyan('\n─── Assets (Optional) ───\n'));
  console.log(chalk.gray('You can add logo and avatar images later by placing them in public/assets/\n'));

  const assetsConfig = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasLogo',
      message: 'Do you have a logo to configure now?',
      default: false
    },
    {
      type: 'input',
      name: 'logoUrl',
      message: 'Logo URL or path (e.g., /assets/logo.png):',
      when: answers => answers.hasLogo
    },
    {
      type: 'confirm',
      name: 'hasAvatar',
      message: 'Do you have an avatar/bot icon to configure now?',
      default: false
    },
    {
      type: 'input',
      name: 'avatarUrl',
      message: 'Avatar URL or path (e.g., /assets/avatar.png):',
      when: answers => answers.hasAvatar
    }
  ]);

  // Build theme config
  const themeConfig = {
    metadata: {
      organizationName: themeBasics.organizationName,
      createdWith: 'Survey Engine Setup Wizard',
      createdAt: new Date().toISOString()
    },
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent
    },
    assets: {}
  };

  if (assetsConfig.logoUrl) {
    themeConfig.assets.logo = assetsConfig.logoUrl;
  }
  if (assetsConfig.avatarUrl) {
    themeConfig.assets.avatar = assetsConfig.avatarUrl;
  }

  // Step 5: Confirm and Save
  console.log(chalk.cyan('\n─── Review Configuration ───\n'));
  console.log(chalk.white('Survey Name:'), chalk.yellow(surveyConfig.survey.name));
  console.log(chalk.white('Organization:'), chalk.yellow(themeConfig.metadata.organizationName));
  console.log(chalk.white('Color Scheme:'), chalk.yellow(themeBasics.colorScheme));
  console.log(chalk.white('Estimated Time:'), chalk.yellow(`${surveyBasics.estimatedMinutes} minutes`));
  console.log(chalk.white('Total Blocks:'), chalk.yellow(Object.keys(surveyConfig.blocks).length));

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '\nSave this configuration?',
      default: true
    }
  ]);

  if (!confirm) {
    console.log(chalk.red('\n✗ Setup cancelled. No changes were made.\n'));
    process.exit(0);
  }

  // Save configurations
  try {
    const surveyPath = path.join(configDir, 'survey.json');
    const themePath = path.join(configDir, 'theme.json');

    fs.writeFileSync(surveyPath, JSON.stringify(surveyConfig, null, 2));
    fs.writeFileSync(themePath, JSON.stringify(themeConfig, null, 2));

    console.log(chalk.green('\n✓ Configuration saved successfully!\n'));
    console.log(chalk.cyan('─── Next Steps ───\n'));
    console.log(chalk.white('1. If you have logo/avatar images, place them in:'));
    console.log(chalk.gray('   frontend/public/assets/\n'));
    console.log(chalk.white('2. Start the development servers:'));
    console.log(chalk.gray('   cd backend && npm run dev'));
    console.log(chalk.gray('   cd frontend && npm run dev\n'));
    console.log(chalk.white('3. Customize your survey blocks by editing:'));
    console.log(chalk.gray('   config/survey.json\n'));
    console.log(chalk.white('4. View examples in:'));
    console.log(chalk.gray('   examples/simple-feedback/\n'));
    console.log(chalk.green('Happy surveying! 🎉\n'));

  } catch (error) {
    console.error(chalk.red('\n✗ Error saving configuration:'), error.message);
    process.exit(1);
  }
}

function createBlankSurvey() {
  return {
    survey: {
      id: generateUUID(),
      name: 'My Survey',
      description: 'A custom survey',
      metadata: {
        estimatedMinutes: 5
      }
    },
    blocks: {
      b0: {
        id: 'b0',
        type: 'dynamic-message',
        content: 'Welcome to the survey!',
        autoAdvance: true,
        autoAdvanceDelay: 2000,
        next: 'b1'
      },
      b1: {
        id: 'b1',
        type: 'text-input',
        content: 'What is your name?',
        placeholder: 'Enter your name',
        variable: 'user_name',
        next: 'b2'
      },
      b2: {
        id: 'b2',
        type: 'final-message',
        content: 'Thank you for completing the survey!',
        buttonText: 'Finish'
      }
    }
  };
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Run the wizard
main().catch(error => {
  console.error(chalk.red('\n✗ An error occurred:'), error.message);
  process.exit(1);
});
