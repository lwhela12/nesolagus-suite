const { getLLM } = require('../../llm')

/**
 * Generate complete survey config directly from documents in final engine format.
 * This replaces the multi-step pipeline with a single LLM call.
 * @param {{ sources: { title: string, text: string }[], params: { client?: string, tone?: string[], archetypes?: string[], segments?: string[], constraints?: { max_minutes?: number, anonymity?: 'anonymous'|'opt-in'|'identified' } } }} input
 * @returns {Promise<{ survey: any, blocks: any }>}
 */
async function generateSurveyDirect(input) {
  const { sources, params } = input

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY required for direct generation')
  }

  const llm = getLLM()

  const system = buildSystemPrompt()
  const user = buildUserPrompt(sources, params)

  const result = await llm.complete({
    system,
    user,
    json: true,
    maxTokens: 32000,
    temperature: 0.5
  })

  // Ensure result has the expected structure
  if (!result.survey || !result.blocks) {
    throw new Error('LLM did not return expected survey format')
  }

  return result
}

function buildSystemPrompt() {
  return `You are a survey architect and JSON generator. You will receive discovery documents and methodology, and generate a complete, deploy-ready survey configuration in JSON format.

Your output must be valid JSON matching the exact schema provided. Pay careful attention to:
- Block IDs (b0, b1, b2, etc. - sequential)
- Variable names (rating_N, choice_N, text_N, multi_N)
- Conditional routing format (array-based with when/goto)
- Question types and their required fields

Return ONLY the JSON object with no additional text.`
}

function buildUserPrompt(sources, params) {
  const client = params.client || 'Unknown Client'
  const maxMinutes = params.constraints?.max_minutes || 10
  const tone = params.tone || ['warm']
  const anonymity = params.constraints?.anonymity || 'anonymous'

  return `# TASK
Generate a complete survey configuration in the engine's final JSON format.

# INPUT DOCUMENTS
${sources.map(s => `## ${s.title}\n${s.text}`).join('\n\n')}

# PARAMETERS
- Client: ${client}
- Maximum Duration: ${maxMinutes} minutes
- Tone: ${tone.join(', ')}
- Anonymity: ${anonymity}
${params.segments ? `- Target Segments: ${params.segments.join(', ')}` : ''}
${params.archetypes ? `- Archetypes: ${params.archetypes.join(', ')}` : ''}

# OUTPUT FORMAT
Return JSON with this structure:
{
  "survey": {
    "id": "client-slug-timestamp",
    "name": "Survey Title",
    "description": "Brief description of survey goals",
    "metadata": {
      "version": "1.0.0",
      "generatedAt": "ISO date",
      "generatedBy": "question-generator",
      "estimatedMinutes": number
    }
  },
  "blocks": {
    "b0": { ... first block ... },
    "b1": { ... second block ... },
    ...
  }
}

# BLOCK ID CONVENTIONS
- Main questions: b0, b1, b2, b3, etc. (sequential, always numerical)
- Branch blocks from b1: b1a, b1b, b1c, b1d (alphabetical suffixes)
- Branch blocks from b2: b2a, b2b, b2c
- All branches from b1 rejoin at b2 (next main question)
- All branches from b2 rejoin at b3

Example flow structure:
b0 (intro) → b1 (choice: relationship to org)
  → if "Donor": b1a (personalized ack) → b2
  → if "Volunteer": b1b (personalized ack) → b2
  → if "Board Member": b1c (personalized ack) → b2
b2 (next main question) → b3...

Rules:
- b0 is always the intro message
- Last block before end should be thank you message
- Router blocks not needed - put conditional logic directly on question blocks
- Branch blocks always use letter suffixes (a, b, c, d...)

# VARIABLE NAMING
- Ratings: rating_N (e.g., rating_3, rating_7)
- Single choice: choice_N
- Multi choice: multi_N
- Text input: text_N
- Number: num_N

# QUESTION TYPES & TIME ESTIMATES
- dynamic-message: auto-advancing message (~5 seconds)
- text-input: open-ended text (~30 seconds)
- single-choice: radio buttons (~15 seconds)
- multi-choice: checkboxes (~20 seconds)
- scale: rating scale with emojis (~10 seconds)
- final-message: survey end (no time)

# CONDITIONAL BRANCHING
Use the "next" field with this format for branching:

{
  "next": {
    "if": [
      {
        "when": { "lt": 5 },
        "goto": "b3"
      },
      {
        "when": { "gt": 7 },
        "goto": "b5"
      }
    ],
    "else": "b6"
  }
}

Condition operators (all compare against the current block's answer):
- { "lt": N } - less than (for rating/scale questions)
- { "gt": N } - greater than (for rating/scale questions)
- { "equals": "value" } - equals (for choice questions)
- { "in": ["val1", "val2"] } - includes any of these values

WHEN TO BRANCH:
- Analyze the documents to understand when branching adds value
- Add branches to acknowledge responses and ask relevant follow-ups
- Examples:
  * Low rating (1-4) → acknowledge concern + ask what to improve
  * High rating (8-10) → acknowledge positively + ask what they enjoyed
  * Multi-choice about interests → branch to deeper questions per topic
  * Single-choice about role → branch to role-specific questions
- Personalized acknowledgments make surveys feel more engaging and human
- Use your judgment - simple questions can stay linear, but meaningful acknowledgments enhance connection

BRANCHING FLOW:
- After branch follow-ups complete, they should rejoin the main survey flow
- Set branch terminal nodes' "next" to continue to the next main question (e.g., b1a → b2, b1b → b2)
- All branches from the same question (b1a, b1b, b1c) should merge at the same next question (b2)

# PERSONALIZED ACKNOWLEDGMENTS (IMPORTANT!)
After choice-based questions, provide thoughtful acknowledgments that reflect the user's specific answer. This makes surveys feel personal and validates the respondent's identity/role.

CHOICE QUESTIONS - Create branches for meaningful options:

Example: "What's your relationship to our organization?"
- If "Donor" → b1a: "Donors are the lifeblood of our organization. Thank you for all you do!"
- If "Volunteer" → b1b: "We're so grateful for volunteers like you who make our work possible."
- If "Board Member" → b1c: "Thank you for your leadership and dedication to our mission."
- If "Staff" → b1d: "We appreciate your commitment to our day-to-day mission."
(All → b2: next question)

Example: "What best describes your role?"
- If "Property Owner" → b3a: "Property owners like you are essential to downtown's vitality."
- If "Business Leader" → b3b: "Thank you for investing in our community's economic future."
- If "Resident" → b3c: "Residents are the heart of what makes our neighborhood special."
(All → b4: next question)

RATING QUESTIONS - Branch on sentiment when context suggests follow-up:
- Low (1-4) → Acknowledge concern + ask specific follow-up (b5a: "I'm sorry to hear that. What's the biggest challenge?" → b6)
- High (8-10) → Celebrate + ask what works (b5b: "That's wonderful! What's working well for you?" → b6)
- Mid (5-7) → Can skip acknowledgment or simple "thank you" (→ b6 directly or via b5c)

TEXT QUESTIONS - Acknowledge after important/emotional questions:
- After sharing challenges: "Thank you for being honest about that."
- After sharing ideas: "I appreciate you taking the time to share your thoughts."

WHEN TO ADD ACKNOWLEDGMENT BRANCHES:
- First questions (relationship, role, identity) → **Almost always branch**
- Key demographics or positioning questions → **Usually branch**
- Rating questions → Branch when you want to probe into the reason
- Mid-survey transitions → Optional acknowledgment helps pacing
- Final questions → Linear flow is fine

Make acknowledgments:
- Natural and conversational (matching the specified tone)
- Specific to their answer choice
- Aligned with context from the documents
- Brief (1-2 sentences max)

# SCALE/RATING FORMAT
For rating questions, use "scale" type with emoji options:
{
  "type": "scale",
  "content": "How satisfied are you?",
  "variable": "rating_3",
  "options": [
    { "id": "1", "value": "1", "label": "Not satisfied", "emoji": "😞" },
    { "id": "2", "value": "2", "label": "2", "emoji": "😞" },
    ...
    { "id": "10", "value": "10", "label": "Very satisfied", "emoji": "🤩" }
  ],
  "next": "b4"
}

Emoji guide:
- 1-3: 😞 (sad)
- 4-5: 😐 (neutral)
- 6-7: 🙂 (slight smile)
- 8-9: 😊 (smile)
- 10: 🤩 (star eyes)

# REQUIREMENTS
1. Use 70-80% of the time budget (${maxMinutes} minutes)
2. Include: warm intro, 8-12 substantive questions, periodic acknowledgments
3. Match the tone: ${tone.join(', ')}
4. All block IDs referenced in "next" or "goto" must exist
5. Options must have kebab-case IDs
6. Variable names must be unique and follow naming conventions
7. Every non-end block must have a valid "next" field
8. Prioritize depth and insights aligned with document goals

# EXAMPLES

Example 1: Simple linear survey
{
  "survey": {
    "id": "acme-feedback-abc123",
    "name": "ACME Feedback Survey",
    "description": "Gather customer satisfaction feedback",
    "metadata": {
      "version": "1.0.0",
      "generatedAt": "2025-01-15T10:00:00Z",
      "generatedBy": "question-generator",
      "estimatedMinutes": 5
    }
  },
  "blocks": {
    "b0": {
      "id": "b0",
      "type": "dynamic-message",
      "content": "Thank you for your time. This survey takes about 5 minutes.",
      "autoAdvance": true,
      "autoAdvanceDelay": 2000,
      "next": "b1"
    },
    "b1": {
      "id": "b1",
      "type": "scale",
      "content": "How satisfied are you with our service?",
      "variable": "rating_1",
      "options": [
        { "id": "1", "value": "1", "label": "Not satisfied", "emoji": "😞" },
        { "id": "2", "value": "2", "label": "2", "emoji": "😞" },
        { "id": "3", "value": "3", "label": "3", "emoji": "😐" },
        { "id": "4", "value": "4", "label": "4", "emoji": "😐" },
        { "id": "5", "value": "5", "label": "Very satisfied", "emoji": "🤩" }
      ],
      "next": "b2"
    },
    "b2": {
      "id": "b2",
      "type": "text-input",
      "content": "What could we improve?",
      "variable": "text_2",
      "placeholder": "Type your answer here...",
      "next": "b3"
    },
    "b3": {
      "id": "b3",
      "type": "final-message",
      "content": "Thank you for your feedback!"
    }
  }
}

Example 2: Survey with personalized acknowledgments and branching
{
  "survey": {
    "id": "nonprofit-feedback-xyz789",
    "name": "Community Feedback Survey",
    "description": "Gather insights from stakeholders about our programs",
    "metadata": {
      "version": "1.0.0",
      "generatedAt": "2025-01-15T10:00:00Z",
      "generatedBy": "question-generator",
      "estimatedMinutes": 8
    }
  },
  "blocks": {
    "b0": {
      "id": "b0",
      "type": "dynamic-message",
      "content": "Welcome! We value your perspective. This survey takes about 8 minutes.",
      "autoAdvance": true,
      "autoAdvanceDelay": 2000,
      "next": "b1"
    },
    "b1": {
      "id": "b1",
      "type": "single-choice",
      "content": "What's your relationship to our organization?",
      "variable": "choice_1",
      "options": [
        { "id": "donor", "label": "Donor", "value": "donor" },
        { "id": "volunteer", "label": "Volunteer", "value": "volunteer" },
        { "id": "board-member", "label": "Board Member", "value": "board-member" },
        { "id": "community-member", "label": "Community Member", "value": "community-member" }
      ],
      "next": {
        "if": [
          { "when": { "equals": "donor" }, "goto": "b1a" },
          { "when": { "equals": "volunteer" }, "goto": "b1b" },
          { "when": { "equals": "board-member" }, "goto": "b1c" }
        ],
        "else": "b1d"
      }
    },
    "b1a": {
      "id": "b1a",
      "type": "dynamic-message",
      "content": "Donors are the lifeblood of our organization. Thank you for all you do!",
      "autoAdvance": true,
      "autoAdvanceDelay": 2500,
      "next": "b2"
    },
    "b1b": {
      "id": "b1b",
      "type": "dynamic-message",
      "content": "We're so grateful for volunteers like you who make our work possible.",
      "autoAdvance": true,
      "autoAdvanceDelay": 2500,
      "next": "b2"
    },
    "b1c": {
      "id": "b1c",
      "type": "dynamic-message",
      "content": "Thank you for your leadership and dedication to our mission.",
      "autoAdvance": true,
      "autoAdvanceDelay": 2500,
      "next": "b2"
    },
    "b1d": {
      "id": "b1d",
      "type": "dynamic-message",
      "content": "Thank you for being part of our community!",
      "autoAdvance": true,
      "autoAdvanceDelay": 2500,
      "next": "b2"
    },
    "b2": {
      "id": "b2",
      "type": "scale",
      "content": "How would you rate our impact in the community?",
      "variable": "rating_2",
      "options": [
        { "id": "1", "value": "1", "label": "Low impact", "emoji": "😞" },
        { "id": "2", "value": "2", "label": "2", "emoji": "😞" },
        { "id": "3", "value": "3", "label": "3", "emoji": "😞" },
        { "id": "4", "value": "4", "label": "4", "emoji": "😐" },
        { "id": "5", "value": "5", "label": "5", "emoji": "😐" },
        { "id": "6", "value": "6", "label": "6", "emoji": "🙂" },
        { "id": "7", "value": "7", "label": "7", "emoji": "🙂" },
        { "id": "8", "value": "8", "label": "8", "emoji": "😊" },
        { "id": "9", "value": "9", "label": "9", "emoji": "😊" },
        { "id": "10", "value": "10", "label": "High impact", "emoji": "🤩" }
      ],
      "next": {
        "if": [
          { "when": { "lt": 5 }, "goto": "b2a" },
          { "when": { "gt": 8 }, "goto": "b2b" }
        ],
        "else": "b3"
      }
    },
    "b2a": {
      "id": "b2a",
      "type": "dynamic-message",
      "content": "Thank you for being honest. We want to do better.",
      "autoAdvance": true,
      "autoAdvanceDelay": 2000,
      "next": "b2a1"
    },
    "b2a1": {
      "id": "b2a1",
      "type": "text-input",
      "content": "What's the most important thing we could improve?",
      "variable": "text_2a1",
      "placeholder": "Type your answer here...",
      "next": "b3"
    },
    "b2b": {
      "id": "b2b",
      "type": "dynamic-message",
      "content": "That's wonderful to hear! We're so glad you see our impact.",
      "autoAdvance": true,
      "autoAdvanceDelay": 2000,
      "next": "b2b1"
    },
    "b2b1": {
      "id": "b2b1",
      "type": "text-input",
      "content": "What program or initiative has impressed you most?",
      "variable": "text_2b1",
      "placeholder": "Type your answer here...",
      "next": "b3"
    },
    "b3": {
      "id": "b3",
      "type": "multi-choice",
      "content": "Which areas should we prioritize? (Select all that apply)",
      "variable": "multi_3",
      "options": [
        { "id": "youth-programs", "label": "Youth Programs", "value": "youth-programs" },
        { "id": "community-outreach", "label": "Community Outreach", "value": "community-outreach" },
        { "id": "advocacy", "label": "Advocacy", "value": "advocacy" },
        { "id": "direct-services", "label": "Direct Services", "value": "direct-services" }
      ],
      "maxSelections": 4,
      "next": "b4"
    },
    "b4": {
      "id": "b4",
      "type": "final-message",
      "content": "Thank you for your valuable feedback!"
    }
  }
}

Generate the complete survey configuration now based on the provided documents and parameters.`
}

module.exports = { generateSurveyDirect }
