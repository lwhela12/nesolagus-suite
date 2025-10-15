# Question Types Reference

This document provides a comprehensive reference for all available question types in the Survey Engine.

## Table of Contents

- [Text Input](#text-input)
- [Single Choice](#single-choice)
- [Multiple Choice](#multi-choice)
- [Scale](#scale)
- [Yes/No](#yesno)
- [Ranking](#ranking)
- [Semantic Differential](#semantic-differential)
- [Contact Form](#contact-form)
- [Demographics](#demographics)
- [Video Autoplay](#video-autoplay)
- [VideoAsk](#videoask)
- [Quick Reply / Message Button](#quick-reply--message-button)
- [Mixed Media](#mixed-media)
- [Dynamic Message](#dynamic-message)
- [Final Message](#final-message)

---

## Text Input

Allows users to type free-form text responses.

### Types
- `text-input` - Standard text input
- `text-input-followup` - Text input that appears after a previous question

### Configuration

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

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique block identifier |
| `type` | string | ✅ | Must be `"text-input"` or `"text-input-followup"` |
| `content` | string | ✅ | Question text shown to user |
| `placeholder` | string | ❌ | Placeholder text in input field |
| `variable` | string | ✅ | Variable name to store answer |
| `required` | boolean | ❌ | Whether answer is required (default: false) |
| `next` | string | ✅ | ID of next block |

### Example Output
User types: "John Smith"
Stored as: `{ user_name: "John Smith" }`

---

## Single Choice

User selects one option from a list.

### Configuration

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
    },
    {
      "id": "friend",
      "label": "Friend or Colleague",
      "value": "friend"
    }
  ],
  "next": "b3"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique block identifier |
| `type` | string | ✅ | Must be `"single-choice"` |
| `content` | string | ✅ | Question text |
| `variable` | string | ✅ | Variable name to store answer |
| `options` | array | ✅ | Array of choice options |
| `next` | string | ✅ | ID of next block (can be overridden per option) |

### Option Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique option identifier |
| `label` | string | ✅ | Text shown to user |
| `value` | string | ✅ | Value stored in variable |
| `next` | string | ❌ | Override next block for this option (conditional branching) |
| `emoji` | string | ❌ | Optional emoji to display |

### Example Output
User selects: "Search Engine"
Stored as: `{ referral_source: "search" }`

---

## Multi Choice

User selects multiple options from a list.

### Configuration

```json
{
  "id": "b3",
  "type": "multi-choice",
  "content": "Which features are important to you? (Select all that apply)",
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
    },
    {
      "id": "design",
      "label": "Design",
      "value": "design"
    }
  ],
  "next": "b4"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `maxSelections` | number | ❌ | Maximum number of selections allowed |

All other properties same as [Single Choice](#single-choice).

### Example Output
User selects: "Ease of Use" and "Speed"
Stored as: `{ important_features: ["ease_of_use", "speed"] }`

---

## Scale

Visual rating scale with bubbles and emojis.

### Configuration

```json
{
  "id": "b4",
  "type": "scale",
  "content": "On a scale of 1-5, how satisfied are you?",
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

### Properties

Same as [Single Choice](#single-choice), but `emoji` is highly recommended for each option.

### Visual Display
Displays as clickable bubbles with:
- Number label above
- Emoji below
- Label text on hover

### Example Output
User clicks: 4
Stored as: `{ satisfaction: 4 }`

---

## Yes/No

Simple binary choice question.

### Configuration

```json
{
  "id": "b5",
  "type": "yes-no",
  "content": "Would you recommend us to a friend?",
  "variable": "would_recommend",
  "next": "b6"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| Standard properties | - | - | Same as text-input |

No `options` needed - automatically generates Yes/No buttons.

### Example Output
User clicks: "Yes"
Stored as: `{ would_recommend: true }`

---

## Ranking

Drag-and-drop to rank items in order of preference.

### Configuration

```json
{
  "id": "b6",
  "type": "ranking",
  "content": "Rank these features in order of importance (1 = most important)",
  "variable": "feature_ranking",
  "options": [
    { "id": "ease", "label": "Ease of Use", "value": "ease" },
    { "id": "price", "label": "Price", "value": "price" },
    { "id": "support", "label": "Support", "value": "support" },
    { "id": "features", "label": "Features", "value": "features" }
  ],
  "next": "b7"
}
```

### Example Output
User ranks: Ease > Price > Features > Support
Stored as: `{ feature_ranking: ["ease", "price", "features", "support"] }`

---

## Semantic Differential

Multiple bipolar scales for nuanced feedback.

### Configuration

```json
{
  "id": "b7",
  "type": "semantic-differential",
  "content": "Rate your experience on the following dimensions:",
  "scales": [
    {
      "id": "ease",
      "leftLabel": "Difficult",
      "rightLabel": "Easy",
      "variable": "ease_rating"
    },
    {
      "id": "speed",
      "leftLabel": "Slow",
      "rightLabel": "Fast",
      "variable": "speed_rating"
    }
  ],
  "next": "b8"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `scales` | array | ✅ | Array of scale configurations |

### Scale Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique scale identifier |
| `leftLabel` | string | ✅ | Label for left pole |
| `rightLabel` | string | ✅ | Label for right pole |
| `variable` | string | ✅ | Variable name for this scale |

### Example Output
```json
{
  "ease_rating": 5,
  "speed_rating": 4
}
```

---

## Contact Form

Collects contact information.

### Configuration

```json
{
  "id": "b8",
  "type": "contact-form",
  "content": "How can we reach you?",
  "fields": [
    {
      "id": "email",
      "label": "Email",
      "type": "email",
      "variable": "contact_email",
      "required": true,
      "placeholder": "you@example.com"
    },
    {
      "id": "phone",
      "label": "Phone",
      "type": "tel",
      "variable": "contact_phone",
      "required": false,
      "placeholder": "(555) 123-4567"
    }
  ],
  "next": "b9"
}
```

### Field Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique field identifier |
| `label` | string | ✅ | Field label |
| `type` | string | ✅ | Input type: `text`, `email`, `tel`, `url` |
| `variable` | string | ✅ | Variable name |
| `required` | boolean | ❌ | Whether field is required |
| `placeholder` | string | ❌ | Placeholder text |
| `prefill` | string | ❌ | Pre-fill from another variable |

### Example Output
```json
{
  "contact_email": "user@example.com",
  "contact_phone": "(555) 123-4567"
}
```

---

## Demographics

Collect demographic information.

### Configuration

```json
{
  "id": "b9",
  "type": "demographics",
  "content": "Tell us a bit about yourself (optional):",
  "fields": [
    {
      "id": "age",
      "label": "Age Range",
      "type": "select",
      "variable": "age_range",
      "required": false,
      "options": ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
    },
    {
      "id": "location",
      "label": "City",
      "type": "text",
      "variable": "city",
      "required": false
    }
  ],
  "next": "b10"
}
```

Similar to Contact Form but typically with select dropdowns and optional fields.

---

## Video Autoplay

Auto-playing video with optional skip button.

### Configuration

```json
{
  "id": "b10",
  "type": "video-autoplay",
  "content": "Watch this introduction",
  "videoUrl": "https://example.com/video.mp4",
  "videoDelay": 500,
  "persistVideo": false,
  "next": "b11"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `videoUrl` | string | ✅ | URL to video file |
| `videoDelay` | number | ❌ | Delay before autoplay (ms) |
| `persistVideo` | boolean | ❌ | Keep video visible after completion |
| `duration` | string | ❌ | Video duration for UI (e.g., "2:30") |

---

## VideoAsk

Embed VideoAsk form for video/audio responses.

### Configuration

```json
{
  "id": "b11",
  "type": "videoask",
  "content": "Record a video response:",
  "videoAskFormId": "your-videoask-form-id",
  "videoAskId": "unique-id",
  "next": "b12"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `videoAskFormId` | string | ✅ | VideoAsk form ID |
| `videoAskId` | string | ✅ | Unique identifier for this question |

Requires VideoAsk API credentials configured in environment variables.

---

## Quick Reply / Message Button

Quick action buttons for rapid responses.

### Configuration

```json
{
  "id": "b12",
  "type": "quick-reply",
  "content": "Choose an option:",
  "options": [
    {
      "id": "continue",
      "label": "Continue",
      "value": "continue"
    },
    {
      "id": "skip",
      "label": "Skip",
      "value": "skip"
    }
  ],
  "next": "b13"
}
```

Similar to Single Choice but displayed as inline buttons.

---

## Mixed Media

Combine images/videos with text in question content.

### Configuration

```json
{
  "id": "b13",
  "type": "mixed-media",
  "content": "![Alt text](https://example.com/image.gif)\n\nWhat do you think?",
  "variable": "media_response",
  "next": "b14"
}
```

Supports markdown syntax for media:
- Images: `![Alt text](url)`
- Auto-detects GIFs, videos
- Renders media inline with question text

---

## Dynamic Message

Auto-advancing message (no user input required).

### Configuration

```json
{
  "id": "b14",
  "type": "dynamic-message",
  "content": "Thanks for sharing!",
  "autoAdvance": true,
  "autoAdvanceDelay": 2000,
  "next": "b15"
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `autoAdvance` | boolean | ❌ | Auto-advance after delay |
| `autoAdvanceDelay` | number | ❌ | Delay in milliseconds |

Use for transitions, thank you messages, or contextual responses.

---

## Final Message

Survey completion message with finish button.

### Configuration

```json
{
  "id": "b15",
  "type": "final-message",
  "content": "Thank you for completing the survey, {{user_name}}!",
  "buttonText": "Finish",
  "redirect": "https://yoursite.com/thankyou",
  "redirectDelay": 3000
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `buttonText` | string | ❌ | Custom button text (default: "Finish") |
| `redirect` | string | ❌ | URL to redirect after completion |
| `redirectDelay` | number | ❌ | Delay before redirect (ms) |

No `next` property - this is the end of the survey.

---

## Advanced Features

### Variable Interpolation

Use `{{variable_name}}` or `{variable_name}` in any `content` field:

```json
{
  "content": "Thanks for your feedback, {{user_name}}!"
}
```

### Conditional Branching

Override `next` per option for dynamic flow:

```json
{
  "type": "single-choice",
  "content": "Are you a new or returning customer?",
  "options": [
    {
      "id": "new",
      "label": "New Customer",
      "value": "new",
      "next": "b_new_customer"
    },
    {
      "id": "returning",
      "label": "Returning Customer",
      "value": "returning",
      "next": "b_returning_customer"
    }
  ]
}
```

### Conditional Display (showIf)

Show block only if condition is met:

```json
{
  "id": "b16",
  "type": "text-input",
  "content": "What specifically did you like?",
  "showIf": {
    "variable": "satisfaction",
    "operator": ">=",
    "value": 4
  },
  "next": "b17"
}
```

### Markdown Support

Bot messages support basic markdown:
- **Bold**: `**text**`
- Links: `[Link text](url)`
- Line breaks: `\n`

---

## Best Practices

1. **Always include b0** - First block must be ID `b0`
2. **Use descriptive IDs** - `b_satisfaction` better than `b7`
3. **Set required wisely** - Don't make everything required
4. **Limit multi-choice** - Use `maxSelections` to prevent overwhelm
5. **Use emojis on scales** - Makes rating more intuitive
6. **Test variable interpolation** - Ensure variables exist before referencing
7. **Include final-message** - Always end with a completion message

---

## Need Help?

- See `config/survey.example.json` for complete working examples
- See `examples/simple-feedback/survey.json` for a minimal example
- See `CONFIGURATION_GUIDE.md` for advanced configuration options
