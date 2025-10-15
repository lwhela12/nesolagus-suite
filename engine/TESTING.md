# Testing Guide

This guide explains how to test the Survey Engine with different configurations.

## Understanding Inputs & Outputs

### **INPUTS** (Configuration Files)

The engine is driven by two JSON files:

1. **`config/survey.json`** - Survey structure
   - Questions and their order
   - Question types (text, multiple choice, scale, etc.)
   - Branching logic
   - Variables to track

2. **`config/theme.json`** - Branding
   - Colors (primary, secondary, background)
   - Fonts
   - Logo and assets

### **OUTPUTS** (What You See)

- **Frontend Survey**: Conversational chat interface at `http://localhost:5173`
- **Admin Dashboard**: Response viewer at `http://localhost:5173/admin` (requires Clerk)
- **API Endpoints**:
  - `GET /api/config/survey` - Returns survey structure
  - `GET /api/config/theme` - Returns theme config
  - `POST /api/survey/start` - Start new survey session
  - `POST /api/survey/answer` - Submit answer, get next question

---

## Quick Start Testing

### Setup

```bash
# 1. Install dependencies
npm run setup

# 2. Copy example configs
npm run config:init

# 3. Start development servers
npm run dev:backend  # Terminal 1
npm run dev:frontend  # Terminal 2
```

### Verify

1. Open `http://localhost:5173`
2. Click "Let's Start!"
3. Complete the example survey
4. Check that answers save and progress updates

---

## Test Scenarios

### Scenario 1: Simple Feedback Survey

Test the basic template that comes with the engine.

```bash
# Copy simple feedback survey to active config
cp examples/simple-feedback/survey.json config/survey.json

# Use default theme or customize
cp config/theme.example.json config/theme.json

# Restart backend (config cached on startup)
cd backend
npm run dev
```

**Expected Output:**
- Survey name: "Simple Feedback Survey"
- 6 blocks total (b0 through b5)
- Question types: dynamic-message, text-input, scale, single-choice, final-message
- Clean, minimal flow

**Test Checklist:**
- [ ] Welcome message auto-advances
- [ ] Name input accepts text
- [ ] Scale question shows 5 bubbles with emojis
- [ ] Single-choice shows all 4 options
- [ ] Final message includes name via variable interpolation

### Scenario 2: Example Template Survey

Test the comprehensive example showing all major features.

```bash
# Use the example config (should already be active)
# config/survey.example.json → config/survey.json

# Validate
npm run validate

# Restart backend
cd backend
npm run dev
```

**Expected Output:**
- Survey name: "Example Survey Template"
- 8 blocks (b0 through b7)
- Question types: text-input, single-choice, scale, multi-choice, yes-no, final-message
- Variable interpolation in final message

**Test Checklist:**
- [ ] All question types render correctly
- [ ] Multi-choice allows multiple selections
- [ ] Yes/No shows binary buttons
- [ ] Variables save correctly (check backend logs)
- [ ] Final message uses {{user_name}} interpolation

### Scenario 3: Custom Survey from Wizard

Test the setup wizard.

```bash
# Run wizard
npm run customize

# Follow prompts:
# - Choose "Blank Survey"
# - Enter your custom info
# - Pick a color scheme
# - Save

# Restart backend
cd backend
npm run dev
```

**Test Checklist:**
- [ ] Wizard creates valid config files
- [ ] Custom survey name appears on welcome screen
- [ ] Custom colors apply throughout survey
- [ ] Survey flow works (b0 → b1 → b2)

### Scenario 4: Test Different Themes

Test theme customization.

```bash
# Edit config/theme.json, change colors:
{
  "colors": {
    "primary": "#6366F1",    // Purple
    "secondary": "#EC4899"   // Pink
  }
}

# Restart backend
cd backend
npm run dev

# Hard refresh frontend (Cmd+Shift+R or Ctrl+Shift+R)
```

**Test Checklist:**
- [ ] Primary color appears on buttons
- [ ] Secondary color in accents
- [ ] Logo displays (if configured)
- [ ] Avatar shows next to bot messages (if configured)

### Scenario 5: Conditional Branching

Test advanced survey logic.

**Create test survey:**
```json
{
  "b0": { /* welcome */ },
  "b1": {
    "type": "yes-no",
    "content": "Are you satisfied?",
    "variable": "satisfied",
    "next": "b2"  // default, overridden below
  },
  "b2": {
    "type": "single-choice",
    "content": "Choose your path:",
    "options": [
      {
        "id": "a",
        "label": "Path A",
        "value": "a",
        "next": "b3_path_a"  // Conditional next!
      },
      {
        "id": "b",
        "label": "Path B",
        "value": "b",
        "next": "b3_path_b"  // Different path!
      }
    ]
  },
  "b3_path_a": { /* path A final message */ },
  "b3_path_b": { /* path B final message */ }
}
```

**Test Checklist:**
- [ ] Selecting Path A goes to b3_path_a
- [ ] Selecting Path B goes to b3_path_b
- [ ] Variables save correctly

---

## API Testing

### Test Survey Config Endpoint

```bash
curl http://localhost:3001/api/config/survey | jq '.data.survey.name'
# Should return your survey name

curl http://localhost:3001/api/config/survey | jq '.data.blocks | keys'
# Should return array of block IDs
```

### Test Theme Config Endpoint

```bash
curl http://localhost:3001/api/config/theme | jq '.data.colors.primary'
# Should return your primary color (e.g., "#0055A5")

curl http://localhost:3001/api/config/theme | jq '.data.metadata.organizationName'
# Should return your organization name
```

### Test Survey Flow

```bash
# 1. Start survey
curl -X POST http://localhost:3001/api/survey/start \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "surveyId": "test"}' \
  | jq

# Save sessionId from response

# 2. Submit answer
curl -X POST http://localhost:3001/api/survey/answer \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "YOUR_SESSION_ID", "questionId": "b1", "answer": "test answer"}' \
  | jq '.data.nextQuestion'

# Should return next question in sequence
```

---

## Validation Testing

### Config Validation

```bash
# Validate both configs
npm run validate

# Should output:
# ✓ Survey config is valid (config/survey.json)
# ✓ Theme config is valid (config/theme.json)
```

### Manual Validation Checks

**survey.json:**
- [ ] Valid JSON syntax
- [ ] Has `survey` and `blocks` top-level keys
- [ ] Block `b0` exists (required first block)
- [ ] All blocks have `id`, `type`, `content`
- [ ] All blocks have `next` (except final-message)
- [ ] All `next` IDs reference existing blocks
- [ ] All variables have unique names

**theme.json:**
- [ ] Valid JSON syntax
- [ ] Has `metadata`, `colors`, `fonts`
- [ ] Color values are valid hex codes
- [ ] Asset paths start with `/` or `http`

---

## Browser Testing

### Desktop Browsers

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

**Check:**
- Survey loads and displays correctly
- All question types render
- Input validation works
- Progress bar updates
- Responsive layout (resize window)

### Mobile Testing

Test on:
- [ ] iOS Safari (iPhone)
- [ ] Chrome Android

**Check:**
- Touch interactions work
- Virtual keyboard doesn't obscure inputs
- Chat bubbles display correctly
- Welcome screen is readable
- Buttons are large enough to tap (44px minimum)

---

## Performance Testing

### Load Time

```bash
# Check bundle size
cd frontend
npm run build
ls -lh dist/assets/*.js

# Should be < 500KB for main bundle
```

### API Response Time

```bash
# Benchmark API endpoints
time curl http://localhost:3001/api/config/survey > /dev/null

# Should be < 100ms
```

---

## Error Testing

### Missing Config Files

```bash
# Test graceful handling
mv config/survey.json config/survey.json.backup
cd backend && npm run dev

# Should: Fall back to survey.example.json
# Backend logs should show warning
```

### Invalid JSON

```bash
# Add syntax error to config/survey.json
# (remove a comma or bracket)

npm run validate
# Should: Show error with line number
```

### Missing Block Reference

```json
{
  "b0": {
    "next": "b999"  // Doesn't exist!
  }
}
```

**Expected:**
- Backend logs warning
- Survey may error when trying to advance
- Fix: Ensure all `next` IDs are valid

---

## Debugging Tips

### Enable Debug Logging

**Backend:**
```bash
# In backend/.env
LOG_LEVEL=debug
```

**Frontend:**
Open browser DevTools → Console tab

### Check Variable Storage

**Backend logs:**
```
[DEBUG] Saving variable: user_name = "John"
[DEBUG] Current state: { user_name: "John", rating: 5 }
```

**Frontend:**
```javascript
// In browser console
localStorage.getItem('survey_session')
```

### Network Inspector

Open DevTools → Network tab → Filter by Fetch/XHR

**Check:**
- `/api/survey/answer` requests
- Response includes `nextQuestion`
- Variables are passed correctly

---

## Automated Testing (Future)

Coming soon:
- Unit tests for question components
- Integration tests for API endpoints
- End-to-end tests with Playwright
- Visual regression tests

---

## Need Help?

- **Config issues**: Run `npm run validate`
- **API errors**: Check backend logs
- **UI issues**: Check browser console
- **Flow problems**: Review `QUESTION_TYPES.md` and `CONFIGURATION_GUIDE.md`

For specific question types and configuration options, see the full documentation in the `docs/` folder.
