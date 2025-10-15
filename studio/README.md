# Question Generator

Generate validated survey configurations from discovery and methodology documents using AI.

## What It Does

Transforms your discovery/methodology documents into a structured, branching survey JSON ready for deployment:

1. **Extract Brief** - LLM analyzes your docs to extract goals, segments, archetypes, tone, constraints
2. **Draft Questions** - Generates question blocks tailored to your methodology
3. **Structure** - Converts to valid survey config with forward-only branching logic
4. **Validate** - Schema validation + graph linting + auto-repair + duration estimation

## Quick Start

### Prerequisites

- Node.js 16+
- Anthropic API key (optional - uses fallback heuristics without it)

### Setup

```bash
# 1. Set your API key (optional but recommended)
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-...

# 2. Run the generator
npm run cli -- \
  --discovery examples/inputs/discovery.txt \
  --methodology examples/inputs/methodology.txt \
  --client "Acme Corp" \
  --max-minutes 8 \
  --output survey.config.json
```

### Web UI (Alternative)

```bash
npm run web
# Open http://localhost:3000 in your browser
# Upload files, generate, download JSON
```

## CLI Options

- `--discovery <file>` - Discovery document (required)
- `--methodology <file>` - Methodology document (required)
- `--client <name>` - Client name (required)
- `--max-minutes <n>` - Survey duration cap in minutes (default: 8)
- `--output <file>` - Output JSON path (default: survey.config.json)
- `--tone <csv>` - Comma-separated tone keywords (e.g., "warm,inviting")
- `--archetypes <csv>` - Target archetypes
- `--segments <csv>` - Audience segments

## Environment Variables

- `ANTHROPIC_API_KEY` - Your Anthropic API key (enables LLM generation)
- `ANTHROPIC_MODEL` - Model to use (default: claude-sonnet-4-5)

## Architecture

```
[Discovery + Methodology Docs]
         ↓
    extractBrief (LLM)
         ↓
    [MethodBrief JSON]
         ↓
    draftQuestions (LLM)
         ↓
    [Question Blocks]
         ↓
    structureToConfig
         ↓
    validateAndRepair
         ↓
    [survey.config.json] ✅
```

## Validation Features

- JSON Schema compliance (all node types)
- Graph linting: no dead ends, valid references, no cycles
- Duration estimation and cap enforcement
- Unique kebab-case option IDs
- Auto-repair for common issues

## Output Format

Generated `survey.config.json` includes:
- `version` - Semver
- `meta` - Title, language
- `flow.start` - Starting node ID
- `flow.nodes` - All question/message/end nodes with branching logic

Supported node types: message, text, number, singleChoice, multiChoice, rating, video, end

## Project Structure

```
src/
├── contracts/          # TypeScript types & JSON Schema
├── llm/               # Anthropic adapter + mock fallback
├── pipeline/          # 4-step generation pipeline
│   └── steps/
└── validation/        # Schema + graph validators

scripts/
├── cli.js            # Command-line interface
└── web.js            # Web UI server
```

## Example Output

```json
{
  "version": "1.0.0",
  "meta": {
    "title": "Acme Corp — Survey",
    "lang": "en"
  },
  "flow": {
    "start": "intro-1",
    "nodes": {
      "intro-1": {
        "type": "message",
        "text": "Welcome to our survey...",
        "next": "q-1"
      },
      "q-1": {
        "type": "text",
        "prompt": "What are your main goals?",
        "next": "rate-1"
      },
      "rate-1": {
        "type": "rating",
        "prompt": "How satisfied are you?",
        "scale": { "min": 1, "max": 5 },
        "next": {
          "if": [{ "when": { "lt": { "answer": 3 } }, "goto": "followup" }],
          "else": "end"
        }
      },
      "followup": {
        "type": "text",
        "prompt": "What could we improve?",
        "next": "end"
      },
      "end": { "type": "end" }
    }
  }
}
```

## License

Private - Not for distribution
