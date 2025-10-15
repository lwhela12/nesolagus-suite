# Survey JSON Format Specification

This document defines the exact JSON format required for surveys to work with this engine.

## Table of Contents

- [Overview](#overview)
- [Top-Level Structure](#top-level-structure)
- [Survey Metadata](#survey-metadata)
- [Blocks Structure](#blocks-structure)
- [Block Types](#block-types)
- [Common Block Properties](#common-block-properties)
- [Question Type Specifications](#question-type-specifications)
- [Advanced Features](#advanced-features)
- [Validation Rules](#validation-rules)
- [Conversion Examples](#conversion-examples)

---

## Overview

The Survey Engine uses a **blocks-based** format where each question or message is represented as a block with a unique ID.

**Minimum Valid Survey:**
```json
{
  "survey": {
    "id": "my-survey-id",
    "name": "My Survey",
    "description": "A simple survey"
  },
  "blocks": {
    "b0": {
      "id": "b0",
      "type": "text-input",
      "content": "What's your name?",
      "variable": "user_name",
      "next": "b1"
    },
    "b1": {
      "id": "b1",
      "type": "final-message",
      "content": "Thank you!"
    }
  }
}
```

---

## Top-Level Structure

Every survey JSON **must** have exactly two top-level keys:

```json
{
  "survey": { /* metadata */ },
  "blocks": { /* questions */ }
}
```

### Required Keys

| Key | Type | Description |
|-----|------|-------------|
| `survey` | object | Survey metadata and configuration |
| `blocks` | object | Collection of question/message blocks |

---

## Survey Metadata

The `survey` object contains metadata about the survey.

### Structure

```json
{
  "survey": {
    "id": "unique-survey-id",
    "name": "Survey Title",
    "description": "Survey description",
    "metadata": {
      "estimatedMinutes": 5,
      "version": "1.0.0"
    }
  }
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (use UUID or kebab-case) |
| `name` | string | ✅ | Survey name (shown on welcome screen) |
| `description` | string | ✅ | Brief description (used in admin panel) |
| `metadata` | object | ❌ | Additional metadata |
| `metadata.estimatedMinutes` | number | ❌ | Estimated completion time |
| `metadata.version` | string | ❌ | Version number |

---

## Blocks Structure

The `blocks` object is a **key-value map** where:
- **Keys** = Block IDs (e.g., `"b0"`, `"b1"`, `"welcome"`)
- **Values** = Block configuration objects

### Structure

```json
{
  "blocks": {
    "b0": {
      "id": "b0",
      "type": "dynamic-message",
      "content": "Welcome!",
      "next": "b1"
    },
    "b1": {
      "id": "b1",
      "type": "text-input",
      "content": "What's your name?",
      "variable": "user_name",
      "next": "b2"
    },
    "b2": {
      "id": "b2",
      "type": "final-message",
      "content": "Thank you!"
    }
  }
}
```

### Critical Rules

1. **First block MUST be `b0`** - This is where the survey starts
2. **Block keys must match `id` property** - `"b0": { "id": "b0" }`
3. **Every block needs `next`** - Except `final-message` type
4. **All `next` values must reference existing block IDs**

---

## Block Types

Each block must have a `type` field that determines how it's rendered.

### Available Types

| Type | Description | Use Case |
|------|-------------|----------|
| `dynamic-message` | Auto-advancing message | Welcome messages, transitions |
| `text-input` | Free-text input | Open-ended questions |
| `single-choice` | Select one option | Multiple choice (single) |
| `multi-choice` | Select multiple options | Multiple choice (multiple) |
| `scale` | Visual rating scale | Rating/satisfaction questions |
| `yes-no` | Binary choice | Yes/No questions |
| `ranking` | Drag-to-rank items | Prioritization questions |
| `semantic-differential` | Multiple bipolar scales | Nuanced ratings |
| `contact-form` | Multi-field form | Contact information |
| `demographics` | Demographic fields | Age, location, etc. |
| `video-autoplay` | Auto-play video | Video content |
| `videoask` | Video response | Record video answers |
| `quick-reply` | Quick action buttons | Fast responses |
| `mixed-media` | Text + media | Images/GIFs in questions |
| `final-message` | Survey completion | End of survey |

---

## Common Block Properties

These properties are common across most block types:

```json
{
  "id": "b0",
  "type": "text-input",
  "content": "Question text",
  "variable": "variable_name",
  "required": true,
  "next": "b1"
}
```

### Property Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique block identifier (must match key) |
| `type` | string | ✅ | Block type (see Block Types) |
| `content` | string | ✅ | Question text or message |
| `variable` | string | ✅* | Variable name to store answer (*required for questions) |
| `next` | string | ✅** | Next block ID (**except final-message) |
| `required` | boolean | ❌ | Whether answer is required (default: false) |

---

## Question Type Specifications

### 1. Dynamic Message

Auto-advancing message (no user input).

```json
{
  "id": "b0",
  "type": "dynamic-message",
  "content": "Welcome to the survey!",
  "autoAdvance": true,
  "autoAdvanceDelay": 2000,
  "next": "b1"
}
```

**Properties:**
- `autoAdvance` (boolean) - Auto-advance after delay
- `autoAdvanceDelay` (number) - Delay in milliseconds

---

### 2. Text Input

Free-form text input.

```json
{
  "id": "b1",
  "type": "text-input",
  "content": "What's your name?",
  "placeholder": "Enter your name",
  "variable": "user_name",
  "required": true,
  "next": "b2"
}
```

**Properties:**
- `placeholder` (string) - Placeholder text

---

### 3. Single Choice

Select one option from a list.

```json
{
  "id": "b2",
  "type": "single-choice",
  "content": "How did you hear about us?",
  "variable": "referral_source",
  "options": [
    {
      "id": "search",
      "label": "Search Engine",
      "value": "search"
    },
    {
      "id": "social",
      "label": "Social Media",
      "value": "social"
    }
  ],
  "next": "b3"
}
```

**Required:**
- `options` (array) - Array of option objects

**Option Properties:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique option ID |
| `label` | string | ✅ | Text shown to user |
| `value` | string | ✅ | Value stored in variable |
| `next` | string | ❌ | Override next block for this option |
| `emoji` | string | ❌ | Optional emoji |

---

### 4. Multi Choice

Select multiple options.

```json
{
  "id": "b3",
  "type": "multi-choice",
  "content": "Which features are important? (Select all that apply)",
  "variable": "important_features",
  "maxSelections": 3,
  "options": [
    {
      "id": "ease",
      "label": "Ease of Use",
      "value": "ease_of_use"
    },
    {
      "id": "speed",
      "label": "Speed",
      "value": "speed"
    }
  ],
  "next": "b4"
}
```

**Properties:**
- `maxSelections` (number) - Maximum selections allowed

---

### 5. Scale

Visual rating scale with emojis.

```json
{
  "id": "b4",
  "type": "scale",
  "content": "How satisfied are you?",
  "variable": "satisfaction",
  "options": [
    { "id": "1", "value": "1", "label": "Poor", "emoji": "😞" },
    { "id": "2", "value": "2", "label": "Fair", "emoji": "😐" },
    { "id": "3", "value": "3", "label": "Good", "emoji": "🙂" },
    { "id": "4", "value": "4", "label": "Great", "emoji": "😊" },
    { "id": "5", "value": "5", "label": "Excellent", "emoji": "🤩" }
  ],
  "next": "b5"
}
```

**Required:**
- `options` (array) - Each option should have `emoji`

---

### 6. Yes/No

Binary choice.

```json
{
  "id": "b5",
  "type": "yes-no",
  "content": "Would you recommend us?",
  "variable": "would_recommend",
  "next": "b6"
}
```

**Note:** No `options` needed - automatically generates Yes/No buttons.

---

### 7. Final Message

Survey completion message.

```json
{
  "id": "b6",
  "type": "final-message",
  "content": "Thank you for completing the survey!",
  "buttonText": "Finish",
  "redirect": "https://yoursite.com/thankyou",
  "redirectDelay": 3000
}
```

**Properties:**
- `buttonText` (string) - Custom button text
- `redirect` (string) - URL to redirect after completion
- `redirectDelay` (number) - Delay before redirect (ms)

**Note:** No `next` field - this ends the survey.

---

## Advanced Features

### Conditional Branching

Route users based on their answer using option-specific `next`:

```json
{
  "id": "b2",
  "type": "single-choice",
  "content": "Are you satisfied?",
  "variable": "satisfied",
  "options": [
    {
      "id": "yes",
      "label": "Yes",
      "value": "yes",
      "next": "b_satisfied_path"
    },
    {
      "id": "no",
      "label": "No",
      "value": "no",
      "next": "b_unsatisfied_path"
    }
  ],
  "next": "b_default"
}
```

### Conditional Routing Block

For complex conditions (e.g., rating-based routing):

```json
{
  "id": "b_router",
  "type": "dynamic-message",
  "content": "",
  "conditionalNext": {
    "if": {
      "variable": "rating",
      "lessThan": 3
    },
    "then": "b_low_rating_followup",
    "else": "b_continue"
  }
}
```

**Supported Condition Properties:**
- `equals` - Equal to value
- `greaterThan` - Greater than value
- `lessThan` - Less than value
- `contains` - Array contains value
- `not` - Negates a condition
- `or` - Logical OR of conditions (array)
- `and` - Logical AND of conditions (array)

### Variable Interpolation

Reference previous answers in content:

```json
{
  "content": "Thank you for your feedback, {{user_name}}!"
}
```

Use `{{variable_name}}` or `{variable_name}`.

### Conditional Display (showIf)

Only show a block if conditions are met:

```json
{
  "id": "b_followup",
  "type": "text-input",
  "content": "What did you like?",
  "showIf": {
    "variable": "satisfaction",
    "greaterThan": 3
  },
  "next": "b_end"
}
```

**Note:** Uses same condition properties as `conditionalNext`

---

## Validation Rules

### Required Structure
- ✅ Top-level `survey` and `blocks` objects
- ✅ `survey.id`, `survey.name`, `survey.description` present
- ✅ Block with ID `b0` exists
- ✅ All blocks have `id`, `type`, `content`
- ✅ All question blocks have `variable`
- ✅ All blocks have `next` (except `final-message`)

### Block IDs
- ✅ Block key matches `id` property
- ✅ All `next` values reference existing blocks
- ✅ No circular references (except intentional loops)

### Question Types
- ✅ `single-choice` and `multi-choice` have `options` array
- ✅ Each option has `id`, `label`, `value`
- ✅ `scale` has `options` with `emoji` for each

### Run Validation

```bash
npm run validate
```

---

## Conversion Examples

### Example 1: Flow-Based to Blocks

**Original Format:**
```json
{
  "flow": {
    "start": "intro",
    "nodes": {
      "intro": {
        "type": "message",
        "text": "Welcome!",
        "next": "q1"
      },
      "q1": {
        "type": "singleChoice",
        "prompt": "Choose one:",
        "options": [
          {"id": "a", "label": "Option A"},
          {"id": "b", "label": "Option B"}
        ],
        "next": "end"
      },
      "end": {
        "type": "end"
      }
    }
  }
}
```

**Converted Format:**
```json
{
  "survey": {
    "id": "my-survey",
    "name": "My Survey",
    "description": "Converted survey"
  },
  "blocks": {
    "b0": {
      "id": "b0",
      "type": "dynamic-message",
      "content": "Welcome!",
      "autoAdvance": true,
      "autoAdvanceDelay": 2000,
      "next": "b1"
    },
    "b1": {
      "id": "b1",
      "type": "single-choice",
      "content": "Choose one:",
      "variable": "choice",
      "options": [
        {
          "id": "a",
          "label": "Option A",
          "value": "a"
        },
        {
          "id": "b",
          "label": "Option B",
          "value": "b"
        }
      ],
      "next": "b2"
    },
    "b2": {
      "id": "b2",
      "type": "final-message",
      "content": "Thank you!"
    }
  }
}
```

**Conversion Steps:**
1. Create `survey` metadata object
2. Convert `flow.start` → block `b0`
3. Map `flow.nodes` → `blocks`
4. Convert type names:
   - `message` → `dynamic-message`
   - `singleChoice` → `single-choice`
   - `end` → `final-message`
5. Add `variable` to all questions
6. Add `value` to all options
7. Ensure all `next` references are valid

### Example 2: Rating with Conditional Logic

**Original Format:**
```json
{
  "type": "rating",
  "prompt": "How satisfied?",
  "scale": {
    "min": 1,
    "max": 5
  },
  "next": {
    "if": [
      {
        "when": {"lt": {"answer": 3}},
        "goto": "followup"
      }
    ],
    "else": "continue"
  }
}
```

**Converted Format:**
```json
{
  "b_rating": {
    "id": "b_rating",
    "type": "scale",
    "content": "How satisfied?",
    "variable": "satisfaction",
    "options": [
      { "id": "1", "value": "1", "label": "Very Unsatisfied", "emoji": "😞" },
      { "id": "2", "value": "2", "label": "Unsatisfied", "emoji": "😐" },
      { "id": "3", "value": "3", "label": "Neutral", "emoji": "🙂" },
      { "id": "4", "value": "4", "label": "Satisfied", "emoji": "😊" },
      { "id": "5", "value": "5", "label": "Very Satisfied", "emoji": "🤩" }
    ],
    "next": "b_rating_router"
  },
  "b_rating_router": {
    "id": "b_rating_router",
    "type": "dynamic-message",
    "content": "",
    "conditionalNext": {
      "if": {
        "variable": "satisfaction",
        "lessThan": 3
      },
      "then": "b_followup",
      "else": "b_continue"
    }
  }
}
```

---

## Quick Conversion Checklist

When converting surveys from other formats:

- [ ] Create `survey` object with `id`, `name`, `description`
- [ ] Create `blocks` object
- [ ] Ensure first block has ID `b0`
- [ ] Convert all question/message types to supported types
- [ ] Add `variable` field to all questions
- [ ] Convert options arrays (add `id`, `label`, `value`)
- [ ] Map all `next` references to valid block IDs
- [ ] Convert conditional logic to `conditionalNext` or option-specific `next`
- [ ] Add `final-message` block at the end
- [ ] Run `npm run validate` to check format

---

## Need Help?

- **Full question type reference**: See `QUESTION_TYPES.md`
- **Configuration options**: See `CONFIGURATION_GUIDE.md`
- **Validation errors**: Run `npm run validate` for detailed errors
- **Examples**: Check `config/survey.example.json` and `examples/`

---

**Pro Tip:** Start with a minimal survey (welcome → one question → final message) to test the conversion, then add complexity incrementally.
