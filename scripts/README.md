# Integration Scripts

This directory contains scripts that integrate the Studio (survey generator) with the Engine (deployment platform).

## Scripts Overview

### 1. generate.js

**Purpose**: Generate a survey from discovery and methodology documents.

**Usage**:
```bash
node scripts/generate.js \
  --client "Acme Corp" \
  --discovery path/to/discovery.txt \
  --methodology path/to/methodology.txt \
  --max-minutes 8
```

**Options**:
- `--client <name>` - Client name (required)
- `--discovery <path>` - Path to discovery document (required)
- `--methodology <path>` - Path to methodology document (required)
- `--max-minutes <n>` - Max survey duration in minutes (default: 8)
- `--output <path>` - Custom output path (default: auto-generated)
- `--tone <csv>` - Comma-separated tone keywords
- `--archetypes <csv>` - Target archetypes
- `--segments <csv>` - Audience segments

**Output**: Survey config saved to `engine/config/clients/{client-slug}.json`

**Example**:
```bash
node scripts/generate.js \
  --client "Beta Corporation" \
  --discovery studio/examples/inputs/discovery.txt \
  --methodology studio/examples/inputs/methodology.txt \
  --max-minutes 10 \
  --tone "professional,friendly" \
  --segments "enterprise,SMB"
```

---

### 2. test-client.sh

**Purpose**: Test a client's survey locally before deployment.

**Usage**:
```bash
./scripts/test-client.sh <client-slug>
```

**Example**:
```bash
./scripts/test-client.sh acme
```

**What it does**:
1. Checks if client config exists
2. Displays survey summary (name, blocks, duration)
3. Sets `CLIENT_ID` environment variable
4. Starts the engine in development mode

**URLs**:
- Frontend: http://localhost:5173
- Backend: http://localhost:4001

**Troubleshooting**:
- If config not found, run `generate.js` first
- If port conflicts, check if engine is already running

---

### 3. deploy-client.sh

**Purpose**: Deploy a client's survey to Vercel.

**Usage**:
```bash
# Production deployment
./scripts/deploy-client.sh <client-slug>

# Preview deployment
./scripts/deploy-client.sh <client-slug> --preview
```

**Examples**:
```bash
# Deploy Acme to production
./scripts/deploy-client.sh acme

# Deploy Beta to preview
./scripts/deploy-client.sh beta --preview
```

**Requirements**:
- Vercel CLI installed (`npm install -g vercel`)
- Vercel account configured (`vercel login`)
- Engine linked to Vercel project (`cd engine && vercel link`)

**What it does**:
1. Validates client config exists
2. Shows survey summary
3. Prompts for confirmation (production only)
4. Deploys to Vercel with `CLIENT_ID` environment variable

**Post-Deployment**:
- Verify deployment at the provided URL
- Check Vercel dashboard for logs
- Ensure `CLIENT_ID` is set in Vercel project settings

---

### 4. validate.js

**Purpose**: Validate a survey configuration file.

**Usage**:
```bash
node scripts/validate.js <path-to-config>
```

**Examples**:
```bash
# Validate a client config
node scripts/validate.js engine/config/clients/acme.json

# Validate studio output
node scripts/validate.js studio/out.survey.config.json
```

**What it checks**:
- Required fields (survey.id, survey.name, blocks)
- Block structure (id, type, content)
- Valid block types
- Variable names for question types
- Options for choice types
- Next pointers and references
- Unreachable blocks
- Estimated duration vs metadata

**Output**:
- ✅ Validation passed or ❌ errors found
- ⚠️ Warnings (non-critical issues)
- 📊 Survey stats (blocks, duration estimate)

**Exit codes**:
- `0` - Validation passed
- `1` - Validation failed

---

## Workflow Examples

### Complete Workflow: Generate → Test → Deploy

```bash
# 1. Generate survey
npm run generate -- \
  --client "Acme Corp" \
  --discovery docs/acme-discovery.txt \
  --methodology docs/acme-methodology.txt

# 2. Validate output
npm run validate engine/config/clients/acme.json

# 3. Test locally
npm run test-client acme
# Open http://localhost:5173 and test the survey

# 4. Deploy to preview (optional)
npm run deploy-client acme -- --preview

# 5. Deploy to production
npm run deploy-client acme
```

### Quick Iteration: Edit → Validate → Test

```bash
# Edit config manually
vim engine/config/clients/acme.json

# Validate changes
npm run validate engine/config/clients/acme.json

# Test locally
npm run test-client acme
```

### Multi-Client Deployment

```bash
# Generate surveys for multiple clients
npm run generate -- --client "Client A" --discovery a.txt --methodology a-method.txt
npm run generate -- --client "Client B" --discovery b.txt --methodology b-method.txt
npm run generate -- --client "Client C" --discovery c.txt --methodology c-method.txt

# Deploy all
npm run deploy-client client-a
npm run deploy-client client-b
npm run deploy-client client-c
```

---

## Environment Variables

### Studio

Create `studio/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5
```

### Engine (Local Testing)

The `test-client.sh` script automatically sets:
```env
CLIENT_ID=<client-slug>
NODE_ENV=development
```

### Engine (Vercel Deployment)

The `deploy-client.sh` script sets:
```env
CLIENT_ID=<client-slug>
```

**Important**: You must also configure these in Vercel project settings:
- `CLIENT_ID` - Set per deployment
- `DATABASE_URL` - PostgreSQL connection string
- `VITE_API_URL` - Backend API URL
- `CLERK_PUBLISHABLE_KEY` - Clerk auth key
- `CLERK_SECRET_KEY` - Clerk secret

---

## Troubleshooting

### Generate Script

**Problem**: "ANTHROPIC_API_KEY not found"
- **Solution**: Set `ANTHROPIC_API_KEY` in `studio/.env`

**Problem**: "Generation timeout"
- **Solution**: Try reducing survey duration or simplifying input docs

**Problem**: "Validation failed"
- **Solution**: Check studio logs for specific errors, run `validate.js` on output

### Test Script

**Problem**: "Config not found"
- **Solution**: Run `generate.js` first to create the config

**Problem**: "Port already in use"
- **Solution**: Stop existing engine instance or change ports in engine config

**Problem**: "Database connection failed"
- **Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is set in `engine/backend/.env`

### Deploy Script

**Problem**: "Vercel CLI not found"
- **Solution**: Run `npm install -g vercel`

**Problem**: "Not linked to a project"
- **Solution**: Run `cd engine && vercel link`

**Problem**: "Deployment failed"
- **Solution**: Check Vercel logs, ensure all environment variables are set

### Validate Script

**Problem**: "File not found"
- **Solution**: Check path, ensure file exists

**Problem**: "Invalid JSON"
- **Solution**: Fix JSON syntax errors, check for trailing commas

---

## Script Development

### Adding New Scripts

1. Create script in `scripts/` directory
2. Add shebang for Node.js (`#!/usr/bin/env node`) or Bash (`#!/bin/bash`)
3. Make executable: `chmod +x scripts/your-script.sh`
4. Add to root `package.json` scripts section
5. Document in this README

### Testing Scripts Locally

```bash
# Test generate script
node scripts/generate.js --help

# Test with real data
node scripts/generate.js \
  --client "Test Client" \
  --discovery studio/examples/inputs/discovery.txt \
  --methodology studio/examples/inputs/methodology.txt \
  --output /tmp/test-survey.json

# Validate output
node scripts/validate.js /tmp/test-survey.json
```

---

## Future Enhancements

- [ ] `rollback-client.sh` - Rollback to previous deployment
- [ ] `list-clients.js` - List all client configs with status
- [ ] `diff-configs.js` - Compare two config versions
- [ ] `export-survey.js` - Export to different formats (PDF, CSV)
- [ ] `import-survey.js` - Import from external sources

---

**Need Help?** Check the main [README](../README.md) or [Design Document](../docs/DESIGN.md).
