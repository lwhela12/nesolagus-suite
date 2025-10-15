# Client Survey Configurations

This directory contains survey configurations for each client deployment.

## File Naming Convention

Each client has their own JSON file named after their `CLIENT_ID`:
- `acme.json` - Acme Corporation survey
- `beta-corp.json` - Beta Corp survey
- `default.json` - Fallback default survey

## Usage

When running the engine, set the `CLIENT_ID` environment variable:

```bash
# Development
CLIENT_ID=acme npm run dev

# Production (Vercel)
vercel --env CLIENT_ID=acme
```

## File Format

Each file should follow the survey engine's block-based format:

```json
{
  "survey": {
    "id": "unique-survey-id",
    "name": "Survey Name",
    "description": "Survey description",
    "metadata": {
      "estimatedMinutes": 8,
      "version": "1.0.0"
    }
  },
  "blocks": {
    "b0": {
      "id": "b0",
      "type": "dynamic-message",
      "content": "Welcome message",
      "next": "b1"
    }
  }
}
```

## Generating New Client Surveys

Use the studio to generate new surveys:

```bash
npm run generate -- --client acme --output engine/config/clients/acme.json
```

See the main README for full documentation.
