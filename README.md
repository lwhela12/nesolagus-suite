# Nesolagus Suite

**Unified Survey Generation & Deployment Platform**

The Nesolagus Suite combines AI-powered survey generation (Studio) with a production-ready deployment platform (Engine) to enable rapid, multi-client survey creation and deployment.

## 🏗️ Architecture

This monorepo contains two main applications:

- **Studio**: AI-powered survey generator that transforms discovery/methodology documents into structured survey configurations
- **Engine**: Full-stack conversational survey platform for deploying and collecting responses

### Repository Structure

```
nesolagus-suite/
├── studio/              # Survey Generator (Node.js + AI)
├── engine/              # Survey Platform (React + Express)
│   ├── frontend/        # React survey UI
│   ├── backend/         # Express API + PostgreSQL
│   └── config/
│       └── clients/     # Client-specific survey configs
├── scripts/             # Integration & deployment scripts
├── docs/                # Documentation
│   ├── PRD.md          # Product Requirements
│   └── DESIGN.md       # Technical Design
└── package.json         # Workspace root
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL (for engine backend)
- Anthropic API key (for studio AI generation)

### Setup

```bash
# Clone the repository
git clone <repo-url> nesolagus-suite
cd nesolagus-suite

# Install all dependencies
npm run setup

# Configure environment variables
cp studio/.env.example studio/.env
cp engine/backend/.env.example engine/backend/.env
cp engine/frontend/.env.example engine/frontend/.env

# Edit .env files with your API keys and database URLs
```

## 📋 Workflows

### 1. Generate a Survey

Generate a new survey from discovery and methodology documents:

```bash
npm run generate -- \
  --client "Acme Corp" \
  --discovery path/to/discovery.txt \
  --methodology path/to/methodology.txt \
  --max-minutes 8 \
  --tone "warm,inviting"
```

This will:
1. Run the AI pipeline to extract goals, segments, and generate questions
2. Validate and structure the survey config
3. Save to `engine/config/clients/acme.json`

**Output**: Survey config ready for testing and deployment

### 2. Test Survey Locally

Test a client's survey locally before deploying:

```bash
npm run test-client acme
```

This starts the engine with `CLIENT_ID=acme`, loading the Acme survey config.

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4001`

### 3. Deploy to Production

Deploy a client's survey to Vercel:

```bash
# Deploy to production
npm run deploy-client acme

# Deploy preview
npm run deploy-client acme -- --preview
```

This deploys the engine to Vercel with the client-specific configuration.

### 4. Validate Configuration

Validate a survey config file:

```bash
npm run validate engine/config/clients/acme.json
```

Checks for:
- Schema compliance
- Valid block references
- Reachable blocks
- Estimated duration

## 🎨 Development

### Run Studio (Web UI)

```bash
npm run dev:studio
# Opens at http://localhost:3000
```

The Studio provides a web interface for:
- Uploading discovery/methodology documents
- Configuring generation parameters
- Previewing generated surveys
- Deploying to production

### Run Engine (Survey Platform)

```bash
npm run dev:engine
# Frontend: http://localhost:5173
# Backend: http://localhost:4001
```

The Engine includes:
- Conversational survey interface
- Admin dashboard
- Response analytics
- VideoAsk integration

## 🔧 Available Commands

### Root Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Install all dependencies |
| `npm run generate` | Generate survey from docs |
| `npm run test-client <slug>` | Test client survey locally |
| `npm run deploy-client <slug>` | Deploy to Vercel |
| `npm run validate <path>` | Validate survey config |
| `npm run dev:studio` | Run studio web UI |
| `npm run dev:engine` | Run engine platform |
| `npm run lint` | Lint all code |
| `npm run clean` | Remove all node_modules |

### Studio Commands

```bash
cd studio

npm run cli          # Run CLI generator
npm run web          # Run web UI (port 3000)
```

### Engine Commands

```bash
cd engine

npm run dev          # Full stack (Docker)
npm run dev:backend  # Backend only
npm run dev:frontend # Frontend only
npm run build        # Build for production
npm run migrate      # Run database migrations
```

## 📚 Documentation

- **[PRD](docs/PRD.md)**: Product requirements and feature roadmap
- **[Design Document](docs/DESIGN.md)**: Technical architecture and implementation details
- **[Studio README](studio/README.md)**: Studio-specific documentation
- **[Engine README](engine/README.md)**: Engine-specific documentation

## 🌟 Key Features

### Studio (Survey Generator)

- ✨ AI-powered survey generation from discovery docs
- 📝 Extracts goals, segments, archetypes, and tone
- 🔄 Validates and auto-repairs survey configs
- ⏱️ Duration estimation and enforcement
- 🎨 Web UI with live preview (coming soon)
- 🚀 One-click deployment (coming soon)

### Engine (Survey Platform)

- 💬 14+ conversational question types
- 🎨 Full branding customization per client
- 📊 Admin dashboard with analytics
- 🎥 VideoAsk integration for video responses
- 🌍 Multi-client deployment support
- 🔐 Clerk authentication for admin
- 📈 Response tracking and export

## 🏢 Multi-Client Deployment

The suite supports deploying separate survey instances for multiple clients:

### Client Configuration

Each client has their own config file:

```
engine/config/clients/
├── default.json      # Fallback config
├── acme.json         # Acme Corp survey
├── beta-corp.json    # Beta Corp survey
└── gamma-inc.json    # Gamma Inc survey
```

### Environment-Based Loading

The engine loads the correct config based on the `CLIENT_ID` environment variable:

```bash
# Local testing
CLIENT_ID=acme npm run dev:engine

# Production deployment (Vercel)
vercel --prod --env CLIENT_ID=acme
```

### Deployment Architecture

```
Studio (studio.nesolagus.com)
  ↓
  Generates survey configs
  ↓
Engine Deployments:
  - acme-survey.vercel.app (CLIENT_ID=acme)
  - beta-survey.vercel.app (CLIENT_ID=beta)
  - gamma-survey.vercel.app (CLIENT_ID=gamma)
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Studio Backend | Node.js + Express |
| Studio UI | Next.js 14 (planned) |
| AI Generation | Anthropic Claude |
| Engine Frontend | React 18 + TypeScript + Vite |
| Engine Backend | Express + TypeScript |
| Database | PostgreSQL |
| Session Store | Redis (optional) |
| Auth | Clerk |
| Deployment | Vercel |
| Monorepo | npm workspaces |

## 🚦 Project Status

### ✅ Phase 1: Multi-Client Foundation (Complete)

- [x] Directory structure for client configs
- [x] Enhanced ConfigLoader with CLIENT_ID support
- [x] Integration scripts (generate, test, deploy, validate)
- [x] Documentation (PRD, Design Doc)

### 🚧 Phase 2: Studio Web UI (In Progress)

- [ ] Next.js web interface
- [ ] Live survey preview
- [ ] Visual survey editor
- [ ] One-click deployment UI
- [ ] Client management dashboard

### 📅 Phase 3: Polish & Launch (Planned)

- [ ] Version control and rollback
- [ ] Survey templates library
- [ ] Collaboration features
- [ ] Advanced analytics

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Proprietary - Not for distribution

---

**Getting Started**: See [Quick Start](#-quick-start) above or run `npm run setup` to begin.

**Questions?** Check the [docs/](docs/) directory or reach out to the team.
