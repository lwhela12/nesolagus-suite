# Setup Wizard Guide

The Survey Engine Setup Wizard is an interactive CLI tool that helps you quickly configure your survey without manually editing JSON files.

## Running the Wizard

```bash
npm run customize
```

## Wizard Flow

### 1. Template Selection

Choose how to start your survey:

- **Simple Feedback** - A basic 5-question survey template (good for testing)
- **GHAC Example (Full Featured)** - Complete 85-block survey with all question types
- **Blank Survey** - Start from scratch with minimal structure

### 2. Survey Information

Configure basic survey details:

- **Survey name** - Displayed on the welcome screen
- **Description** - Shown in admin panel and metadata
- **Estimated time** - How many minutes to complete (shown to users)

### 3. Theme Configuration

Customize your survey's appearance:

#### Organization Name
The name shown on the welcome screen (e.g., "Acme Corporation")

#### Color Scheme
Choose from presets or create custom colors:

**Presets:**
- **Blue & Green (Professional)** - Classic professional theme
  - Primary: `#0055A5` (Blue)
  - Secondary: `#B2BB1C` (Green)
  - Accent: `#4A90E2` (Light Blue)

- **Purple & Pink (Modern)** - Modern and vibrant
  - Primary: `#6366F1` (Purple)
  - Secondary: `#EC4899` (Pink)
  - Accent: `#8B5CF6` (Violet)

- **Teal & Orange (Energetic)** - Fresh and energetic
  - Primary: `#14B8A6` (Teal)
  - Secondary: `#F97316` (Orange)
  - Accent: `#06B6D4` (Cyan)

- **Custom** - Define your own hex colors

### 4. Assets (Optional)

Configure logo and avatar images:

- **Logo** - Displayed at the top of the survey
- **Avatar** - Bot icon shown next to questions

You can skip this and add images later by placing them in `frontend/public/assets/`

Example paths:
- `/assets/logo.png`
- `/assets/avatar.png`
- `https://yourdomain.com/images/logo.png`

### 5. Review & Save

Review your configuration and confirm to save. The wizard will create:

- `config/survey.json` - Your survey structure
- `config/theme.json` - Your branding configuration

## After Running the Wizard

### Next Steps

1. **Add Assets** (if configured)
   ```bash
   # Place your logo and avatar in:
   frontend/public/assets/logo.png
   frontend/public/assets/avatar.png
   ```

2. **Customize Survey Blocks** (optional)

   Edit `config/survey.json` to modify questions, add branching logic, etc.

3. **Set Up Environment Variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edit .env files with your database credentials
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

   Your survey will be at: `http://localhost:5173`

## Advanced Customization

### Manual Editing

After running the wizard, you can manually edit the generated files:

**config/survey.json** - Modify:
- Question text and types
- Branching logic (conditional `next`)
- Variable storage
- Validation rules

**config/theme.json** - Modify:
- Additional colors (text, background, borders)
- Font families
- Spacing and sizing
- Additional assets

### Re-running the Wizard

You can re-run the wizard at any time:

```bash
npm run customize
```

⚠️ **Warning:** This will overwrite your existing `config/survey.json` and `config/theme.json` files. Make backups if needed!

## Examples

### Creating a Customer Feedback Survey

```bash
npm run customize

# Choose: Simple Feedback
# Survey name: Customer Satisfaction Survey
# Organization: Acme Corporation
# Estimated time: 3 minutes
# Color scheme: Blue & Green
# Logo: /assets/acme-logo.png
```

### Creating a Blank Survey from Scratch

```bash
npm run customize

# Choose: Blank Survey
# Survey name: Employee Engagement Survey 2024
# Organization: Internal HR Department
# Estimated time: 10 minutes
# Color scheme: Purple & Pink
# Skip assets for now
```

Then edit `config/survey.json` to add your custom questions.

## Troubleshooting

### Wizard doesn't start

Make sure you've installed dependencies:
```bash
npm install
```

### Changes don't appear in the survey

Restart the backend server (config is cached on startup):
```bash
# Stop backend (Ctrl+C) and restart
cd backend && npm run dev
```

### Logo/avatar doesn't show

1. Check the file exists at the specified path
2. File should be in `frontend/public/assets/`
3. Path in theme.json should start with `/assets/`
4. Refresh the browser with cache cleared (Cmd+Shift+R or Ctrl+Shift+R)

## Need Help?

- See `README.md` for general setup instructions
- See `TESTING.md` for testing different configurations
- Check `examples/` folder for sample surveys
- Review `config/survey.example.json` for all available question types
