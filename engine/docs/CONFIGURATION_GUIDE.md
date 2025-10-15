# Configuration Guide

This guide explains how to configure your survey using the `config/survey.json` and `config/theme.json` files.

## Table of Contents

- [Survey Configuration](#survey-configuration)
- [Theme Configuration](#theme-configuration)
- [Advanced Configuration](#advanced-configuration)
- [Environment Variables](#environment-variables)
- [Best Practices](#best-practices)

---

## Survey Configuration

The `config/survey.json` file defines your survey structure, questions, and flow.

### Basic Structure

```json
{
  "survey": {
    "id": "unique-uuid",
    "name": "My Survey Name",
    "description": "Survey description",
    "metadata": {
      "estimatedMinutes": 5,
      "version": "1.0.0"
    }
  },
  "blocks": {
    "b0": { /* first question */ },
    "b1": { /* second question */ },
    "b2": { /* final message */ }
  }
}
```

### Survey Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (UUID format recommended) |
| `name` | string | ✅ | Survey name (shown on welcome screen) |
| `description` | string | ✅ | Brief description (admin panel, metadata) |
| `metadata.estimatedMinutes` | number | ❌ | Estimated completion time |
| `metadata.version` | string | ❌ | Version number for tracking |

### Blocks

Each block represents a question or message in your survey.

**Key Rules:**
1. First block must be ID `b0`
2. Every block needs a `next` field (except `final-message`)
3. Block IDs must be unique
4. Use descriptive IDs for clarity (e.g., `b_satisfaction` vs `b7`)

### Block Flow Example

```json
{
  "blocks": {
    "b0": {
      "id": "b0",
      "type": "dynamic-message",
      "content": "Welcome!",
      "autoAdvance": true,
      "autoAdvanceDelay": 2000,
      "next": "b_name"
    },
    "b_name": {
      "id": "b_name",
      "type": "text-input",
      "content": "What's your name?",
      "variable": "user_name",
      "next": "b_rating"
    },
    "b_rating": {
      "id": "b_rating",
      "type": "scale",
      "content": "Rate your experience:",
      "variable": "rating",
      "options": [/* scale options */],
      "next": "b_final"
    },
    "b_final": {
      "id": "b_final",
      "type": "final-message",
      "content": "Thanks, {{user_name}}!"
    }
  }
}
```

---

## Theme Configuration

The `config/theme.json` file controls your survey's appearance.

### Basic Structure

```json
{
  "metadata": {
    "name": "My Brand Theme",
    "organizationName": "Acme Corporation"
  },
  "colors": {
    "primary": "#0055A5",
    "secondary": "#B2BB1C"
  },
  "fonts": {
    "primary": "'Inter', sans-serif",
    "display": "'Poppins', sans-serif"
  },
  "assets": {
    "logo": "/assets/logo.png",
    "avatar": "/assets/avatar.png"
  }
}
```

### Theme Metadata

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Theme name (internal) |
| `organizationName` | string | Shown on welcome screen |
| `description` | string | Theme description (optional) |

### Colors

#### Primary Colors

```json
{
  "colors": {
    "primary": "#0055A5",      // Main brand color (buttons, accents)
    "secondary": "#B2BB1C",    // Secondary brand color
    "accent": "#4A90E2",       // Accent color for highlights
    "background": "#FFF8F1",   // Page background
    "surface": "#FFFFFF"       // Card/bubble backgrounds
  }
}
```

#### Text Colors

```json
{
  "colors": {
    "text": {
      "primary": "#1A1A2E",    // Main text
      "secondary": "#4A5568",  // Secondary text
      "light": "#718096",      // Light/subtle text
      "inverse": "#FFFFFF"     // Text on dark backgrounds
    }
  }
}
```

#### Chat Bubble Colors

```json
{
  "colors": {
    "chatBubble": {
      "bot": "#FFFFFF",                              // Bot message background
      "botText": "#1A1A2E",                         // Bot message text
      "user": "linear-gradient(...)",                // User message background
      "userText": "#FFFFFF"                         // User message text
    }
  }
}
```

#### Utility Colors

```json
{
  "colors": {
    "border": "#E2E8F0",        // Default borders
    "borderLight": "#F0F4F8",   // Light borders
    "error": "#E53E3E",         // Error states
    "success": "#48BB78",       // Success states
    "warning": "#ED8936"        // Warning states
  }
}
```

### Fonts

```json
{
  "fonts": {
    "primary": "'Inter', -apple-system, sans-serif",  // Body text
    "display": "'Poppins', 'Inter', sans-serif"       // Headers, titles
  }
}
```

**Font Loading:**
- Add Google Fonts link to `frontend/index.html`
- Use web-safe fallbacks

### Assets

```json
{
  "assets": {
    "logo": "/assets/logo.png",       // Header logo (optional)
    "avatar": "/assets/avatar.png",   // Bot avatar (optional)
    "favicon": "/assets/favicon.ico"  // Browser favicon
  }
}
```

**Asset Guidelines:**
- Place files in `frontend/public/assets/`
- Logo: Recommended 200x100px, transparent PNG
- Avatar: Recommended 100x100px, circular safe area
- Use absolute paths starting with `/assets/`

### Spacing

```json
{
  "spacing": {
    "xs": "0.25rem",   // 4px
    "sm": "0.5rem",    // 8px
    "md": "1rem",      // 16px
    "lg": "1.5rem",    // 24px
    "xl": "2rem",      // 32px
    "2xl": "3rem",     // 48px
    "3xl": "4rem",     // 64px
    "4xl": "5rem"      // 80px
  }
}
```

### Border Radius

```json
{
  "borderRadius": {
    "sm": "0.375rem",  // Subtle rounding
    "md": "0.5rem",    // Default rounding
    "lg": "1rem",      // Chat bubbles
    "xl": "1.5rem",    // Cards
    "2xl": "2rem",     // Large cards
    "full": "9999px"   // Circles, pills
  }
}
```

### Shadows

```json
{
  "shadows": {
    "sm": "0 1px 3px rgba(0,0,0,0.1)",           // Subtle
    "md": "0 4px 6px rgba(0,0,0,0.1)",           // Default
    "lg": "0 10px 15px rgba(0,0,0,0.1)",         // Elevated
    "xl": "0 20px 25px rgba(0,0,0,0.1)",         // Dramatic
    "inner": "inset 0 2px 4px rgba(0,0,0,0.06)" // Inset
  }
}
```

---

## Advanced Configuration

### Variable Interpolation

Reference stored variables in question content:

```json
{
  "content": "Thanks for your feedback, {{user_name}}!"
}
```

**Syntax:**
- `{{variable_name}}` - Preferred syntax
- `{variable_name}` - Also supported

**Common Variables:**
- `user_name` - From name input
- Any `variable` field from previous questions

### Conditional Branching

Direct users to different questions based on answers:

```json
{
  "type": "single-choice",
  "content": "Are you satisfied?",
  "variable": "satisfied",
  "options": [
    {
      "id": "yes",
      "label": "Yes",
      "value": "yes",
      "next": "b_why_satisfied"  // Go here if "Yes"
    },
    {
      "id": "no",
      "label": "No",
      "value": "no",
      "next": "b_why_not_satisfied"  // Go here if "No"
    }
  ],
  "next": "b_default"  // Fallback (shouldn't be reached)
}
```

### Conditional Display

Show blocks only when conditions are met:

```json
{
  "id": "b_followup",
  "type": "text-input",
  "content": "Tell us more...",
  "showIf": {
    "variable": "rating",
    "operator": ">=",
    "value": 4
  },
  "next": "b_final"
}
```

**Supported Operators:**
- `==` - Equal to
- `!=` - Not equal to
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `contains` - Array contains value

### Auto-Advance Messages

Create seamless conversational flow:

```json
{
  "type": "dynamic-message",
  "content": "That's great!",
  "autoAdvance": true,
  "autoAdvanceDelay": 1500,  // 1.5 seconds
  "next": "b_next"
}
```

**Use Cases:**
- Thank you messages
- Transition messages
- Contextual responses

### Markdown Support

Bot messages support basic markdown:

```json
{
  "content": "**Important:** Visit our [website](https://example.com) for more info.\n\nWe value your feedback!"
}
```

**Supported:**
- `**bold**` - Bold text
- `[text](url)` - Links (open in new tab)
- `\n` - Line breaks

### Media in Messages

Embed images/videos in questions:

```json
{
  "type": "mixed-media",
  "content": "![Celebration](https://example.com/celebrate.gif)\n\nHow do you feel?"
}
```

**Supported:**
- Images: `.png`, `.jpg`, `.gif`, `.webp`, `.svg`
- Videos: `.mp4`, `.webm`
- Auto-detects and renders appropriately

---

## Environment Variables

Configure external services and deployment settings.

### Backend (.env)

Create `backend/.env`:

```bash
# Environment
NODE_ENV=development  # or 'production'
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Clerk (admin authentication - optional)
CLERK_SECRET_KEY=sk_test_...

# VideoAsk (optional)
VIDEOASK_API_KEY=your-api-key
VIDEOASK_WEBHOOK_SECRET=your-webhook-secret

# CORS (production only)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend (.env)

Create `frontend/.env`:

```bash
# API URL
VITE_API_URL=http://localhost:3001

# Clerk (admin panel - optional)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Production Settings

**Backend:**
- Set `NODE_ENV=production`
- Use strong database passwords
- Enable Redis for session management
- Configure `ALLOWED_ORIGINS` for CORS

**Frontend:**
- Set `VITE_API_URL` to production API domain
- Ensure HTTPS for Clerk integration

---

## Best Practices

### Survey Design

1. **Start Simple**
   - Begin with welcome message (b0)
   - Get name early for personalization
   - Save complex questions for later

2. **Progressive Disclosure**
   - Use conditional branching to show relevant questions
   - Skip unnecessary questions based on previous answers
   - Keep total question count reasonable (< 15 for best completion rates)

3. **Variable Naming**
   - Use descriptive names: `satisfaction_rating` not `q3`
   - Use snake_case consistently
   - Document what each variable stores

4. **Question Flow**
   ```
   Welcome → Name → Easy Questions → Harder Questions → Final Thank You
   ```

### Theme Design

1. **Color Contrast**
   - Ensure text is readable on all backgrounds
   - Test with accessibility tools
   - Provide sufficient contrast (WCAG AA minimum)

2. **Brand Consistency**
   - Match your organization's existing colors
   - Use brand fonts if available
   - Keep logo/avatar consistent with brand

3. **Mobile-First**
   - Test on small screens
   - Ensure touch targets are large enough (44px minimum)
   - Avoid long text blocks

### Testing

1. **Test All Paths**
   - Complete survey multiple times
   - Test conditional branching
   - Verify variable interpolation works

2. **Cross-Browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Android)

3. **Validation Script**
   ```bash
   npm run validate
   ```

### Version Control

1. **Config Files**
   - Keep `config/survey.json` and `config/theme.json` in git
   - Tag versions when making significant changes
   - Document changes in commit messages

2. **Backup Before Changes**
   ```bash
   cp config/survey.json config/survey.backup.json
   ```

3. **Use Examples**
   - Keep working examples in `examples/` folder
   - Reference for future surveys

---

## Troubleshooting

### Survey Not Loading

1. Check `backend` logs for config loading errors
2. Validate JSON syntax: `npm run validate`
3. Ensure `b0` block exists
4. Restart backend after config changes

### Theme Not Applying

1. Check browser console for errors
2. Verify paths start with `/` for assets
3. Clear browser cache (Cmd+Shift+R)
4. Check `config/theme.json` syntax

### Variables Not Interpolating

1. Ensure variable was set in previous question
2. Check variable name spelling
3. Use correct syntax: `{{variable_name}}`
4. Check backend logs for variable values

### Conditional Branching Not Working

1. Verify `next` field in option
2. Check target block ID exists
3. Review backend logs for flow logic
4. Test with simple case first

---

## Additional Resources

- **Question Types**: See `QUESTION_TYPES.md` for all available types
- **Setup Wizard**: Run `npm run customize` for guided setup
- **Examples**: Check `config/survey.example.json` and `examples/` folder
- **Deployment**: See `DEPLOYMENT_GUIDE.md` for production setup

---

Need help? Check existing examples or create an issue in the repository.
