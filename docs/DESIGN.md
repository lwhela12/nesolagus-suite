# Design Document
## Nesolagus Suite: Technical Architecture & Implementation

**Version:** 1.0
**Last Updated:** October 2025
**Author:** Engineering Team
**Status:** Design Phase

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Data Models](#3-data-models)
4. [API Design](#4-api-design)
5. [Component Design](#5-component-design)
6. [Database Schema](#6-database-schema)
7. [Integration Points](#7-integration-points)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Security Design](#9-security-design)
10. [Error Handling](#10-error-handling)
11. [Testing Strategy](#11-testing-strategy)
12. [Migration Plan](#12-migration-plan)

---

## 1. System Overview

### 1.1 Purpose
This document details the technical architecture for integrating the Survey Studio (generation tool) and Survey Engine (deployment platform) into a unified workflow supporting multi-client deployments with live preview capabilities.

### 1.2 Design Goals
- **Modularity**: Studio and Engine remain independently deployable
- **Reusability**: Share components and types between systems
- **Scalability**: Support 50+ concurrent client deployments
- **Developer Experience**: Simple local development and deployment
- **Type Safety**: End-to-end TypeScript with shared contracts

### 1.3 System Context

```
┌─────────────────────────────────────────────────────────────┐
│                    Nesolagus Suite                          │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│   Studio (Generation)    │    Engine (Deployment)           │
│   ┌────────────────┐     │    ┌──────────────────┐         │
│   │ Web UI         │────────▶│  Config Loader    │         │
│   │ (Next.js)      │     │    │  (Enhanced)       │         │
│   └────────────────┘     │    └──────────────────┘         │
│   ┌────────────────┐     │    ┌──────────────────┐         │
│   │ AI Pipeline    │     │    │  Survey Renderer  │         │
│   │ (Claude API)   │     │    │  (React)          │         │
│   └────────────────┘     │    └──────────────────┘         │
│   ┌────────────────┐     │    ┌──────────────────┐         │
│   │ Validator      │────────▶│  Backend API      │         │
│   │ (Shared)       │     │    │  (Express)        │         │
│   └────────────────┘     │    └──────────────────┘         │
│                          │                                  │
└──────────────────────────┴──────────────────────────────────┘
           │                            │
           ▼                            ▼
    ┌─────────────┐            ┌──────────────┐
    │ PostgreSQL  │            │ PostgreSQL   │
    │ (Drafts)    │            │ (Responses)  │
    └─────────────┘            └──────────────┘
```

---

## 2. Architecture

### 2.1 Monorepo Structure

```
nesolagus-suite/
├── packages/
│   ├── shared/                      # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── survey.ts       # Survey config types
│   │   │   │   ├── block.ts        # Block types
│   │   │   │   └── api.ts          # API types
│   │   │   ├── validation/
│   │   │   │   ├── schema.ts       # JSON schemas
│   │   │   │   └── validators.ts   # Validation functions
│   │   │   └── utils/
│   │   │       ├── id.ts           # ID generation
│   │   │       └── format.ts       # Formatters
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── survey-components/           # Shared React components
│       ├── src/
│       │   ├── blocks/              # Question renderers
│       │   ├── layouts/
│       │   └── preview/             # Preview wrapper
│       ├── package.json
│       └── tsconfig.json
│
├── studio/                          # Survey Generator
│   ├── src/
│   │   ├── app/                     # Next.js app (NEW)
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── generate/        # Generation UI
│   │   │   │   ├── preview/         # Preview UI
│   │   │   │   ├── clients/         # Client management
│   │   │   │   └── deploy/          # Deployment UI
│   │   │   ├── api/                 # API routes
│   │   │   │   ├── generate/
│   │   │   │   ├── validate/
│   │   │   │   └── deploy/
│   │   │   └── layout.tsx
│   │   ├── lib/                     # Core logic
│   │   │   ├── pipeline/            # Existing AI pipeline
│   │   │   ├── db/                  # Database client
│   │   │   └── vercel/              # Vercel API client
│   │   └── components/              # UI components
│   ├── prisma/
│   │   └── schema.prisma            # NEW: Studio database
│   ├── package.json
│   └── next.config.js
│
├── engine/                          # Survey Platform (existing)
│   ├── frontend/
│   ├── backend/
│   │   └── src/
│   │       ├── config/
│   │       │   └── configLoader.ts  # ENHANCED for CLIENT_ID
│   │       └── ...
│   └── config/
│       ├── clients/                 # NEW: Client configs
│       │   ├── default.json
│       │   ├── acme.json
│       │   └── README.md
│       ├── survey.example.json
│       └── theme.example.json
│
├── scripts/                         # Integration scripts
│   ├── generate.js                  # Generate survey
│   ├── test-client.sh              # Test locally
│   ├── deploy-client.sh            # Deploy to Vercel
│   └── validate.js                 # Validate configs
│
├── docs/
│   ├── PRD.md
│   ├── DESIGN.md
│   └── API.md
│
├── .github/
│   └── workflows/
│       ├── deploy-client.yml
│       └── test.yml
│
├── package.json                    # Workspace root
├── turbo.json                      # Turborepo config
└── tsconfig.base.json              # Base TypeScript config
```

### 2.2 Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Monorepo** | Turborepo | Fast builds, smart caching, simple DX |
| **Shared Types** | TypeScript | End-to-end type safety |
| **Studio UI** | Next.js 14 (App Router) | Modern React, built-in API routes, Vercel-optimized |
| **Studio Database** | PostgreSQL + Prisma | Relational data, type-safe ORM |
| **Engine** | Existing stack (React + Express) | No changes needed |
| **Preview** | Shared React components | Guaranteed UI consistency |
| **Deployment** | Vercel CLI + API | Programmatic deployments, preview URLs |
| **AI** | Anthropic Claude (existing) | Already integrated in studio |

### 2.3 Key Architectural Decisions

#### Decision 1: Monorepo with Shared Packages
**Choice**: Use Turborepo with shared packages for types and components
**Alternatives Considered**:
- Separate repos with npm packages
- Git submodules
**Rationale**:
- Simplifies development (single `git clone`)
- Easier to keep types in sync
- Turborepo caching speeds up CI/CD
- Atomic changes across studio and engine

#### Decision 2: Enhanced ConfigLoader Pattern
**Choice**: Extend existing ConfigLoader to support `CLIENT_ID` env var
**Alternatives Considered**:
- Database-backed config loader
- API-based config fetching
**Rationale**:
- Minimal changes to engine
- Maintains file-based simplicity for V1
- Easy to migrate to database later
- Works well with Vercel environment variables

#### Decision 3: Next.js for Studio UI
**Choice**: Build studio UI with Next.js 14 App Router
**Alternatives Considered**:
- Vite + React SPA
- Remix
**Rationale**:
- App Router provides excellent file-based routing
- API routes eliminate need for separate backend
- Server components reduce JS bundle size
- Vercel deployment is seamless

#### Decision 4: Shared Component Library
**Choice**: Extract engine's survey components into `packages/survey-components`
**Alternatives Considered**:
- Iframe embedding of engine preview
- Duplicate components in studio
**Rationale**:
- Guarantees preview matches production exactly
- Enables reuse in admin dashboard later
- Simplifies testing (single component implementation)

---

## 3. Data Models

### 3.1 Survey Configuration (Shared)

**File**: `packages/shared/src/types/survey.ts`

```typescript
/**
 * Survey configuration format (engine-compatible)
 */
export interface SurveyConfig {
  survey: SurveyMetadata;
  blocks: Record<string, Block>;
}

export interface SurveyMetadata {
  id: string;                          // Unique survey ID
  name: string;                        // Display name
  description?: string;                // Brief description
  metadata: {
    estimatedMinutes: number;          // Expected completion time
    version: string;                   // Semver (e.g., "1.0.0")
    generatedBy?: string;              // "studio" or "manual"
    generatedAt?: string;              // ISO timestamp
    clientId?: string;                 // Client identifier
    [key: string]: any;                // Extensible metadata
  };
  sections?: Section[];                // Optional section grouping
}

export interface Section {
  id: string;
  name: string;
  blocks: string[];                    // Block IDs in this section
}

export type Block =
  | MessageBlock
  | TextInputBlock
  | SingleChoiceBlock
  | MultiChoiceBlock
  | ScaleBlock
  | YesNoBlock
  | FinalMessageBlock
  | DynamicMessageBlock
  | VideoBlock
  | ContactFormBlock;

export interface BaseBlock {
  id: string;                          // Unique block ID (e.g., "b0")
  type: BlockType;
  content: string;                     // Question or message text
  next?: string | ConditionalNext;    // Next block ID or conditional routing
}

export type BlockType =
  | 'text-input'
  | 'single-choice'
  | 'multi-choice'
  | 'scale'
  | 'yes-no'
  | 'dynamic-message'
  | 'final-message'
  | 'video-autoplay'
  | 'videoask'
  | 'contact-form'
  | 'demographics';

export interface TextInputBlock extends BaseBlock {
  type: 'text-input';
  variable: string;                    // Variable name for storage
  placeholder?: string;
  required?: boolean;
  min?: number;                        // Min length
  max?: number;                        // Max length
}

export interface SingleChoiceBlock extends BaseBlock {
  type: 'single-choice';
  variable: string;
  options: Option[];
}

export interface MultiChoiceBlock extends BaseBlock {
  type: 'multi-choice';
  variable: string;
  options: Option[];
  maxSelections?: number;
}

export interface ScaleBlock extends BaseBlock {
  type: 'scale';
  variable: string;
  options: Option[];                   // Scale points with emojis
}

export interface Option {
  id: string;                          // Unique option ID (kebab-case)
  label: string;                       // Display text
  value: string;                       // Stored value
  description?: string;
  emoji?: string;
  exclusive?: boolean;                 // For multi-choice: mutually exclusive
}

export interface ConditionalNext {
  if: Array<{
    when: Condition;
    goto: string;                      // Target block ID
  }>;
  else: string;                        // Default next block
}

export interface Condition {
  variable: string;
  equals?: any;
  in?: any[];
  greaterThan?: number;
  lessThan?: number;
}

// Additional block types omitted for brevity
```

### 3.2 Studio Database Models

**File**: `studio/prisma/schema.prisma`

```prisma
// Studio database for managing drafts, clients, and deployments

model Client {
  id          String   @id @default(cuid())
  name        String   @unique              // "Acme Corp"
  slug        String   @unique              // "acme" (for CLIENT_ID)
  domain      String?                       // Custom domain
  vercelProjectId String?                   // Vercel project ID

  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  drafts      Draft[]
  deployments Deployment[]

  @@index([slug])
}

model Draft {
  id          String   @id @default(cuid())
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id])

  // Generation inputs
  discoveryDoc    String   @db.Text         // Uploaded doc content
  methodologyDoc  String   @db.Text

  // Generation parameters
  maxMinutes      Int      @default(8)
  tone            String[] @default([])
  segments        String[] @default([])
  archetypes      String[] @default([])

  // Generated output
  config          Json                      // SurveyConfig JSON
  methodBrief     Json?                     // AI-extracted brief

  // Status tracking
  status          DraftStatus @default(NEW)
  validationErrors Json?                    // Validation issues

  // AI metadata
  llmModel        String?                   // "claude-sonnet-4-5"
  llmTokens       Int?                      // Tokens used
  generationTime  Int?                      // Milliseconds

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  deployments     Deployment[]

  @@index([clientId, status])
}

enum DraftStatus {
  NEW              // Just created
  GENERATING       // AI processing
  GENERATED        // AI complete
  VALIDATION_FAILED
  READY            // Valid, ready to deploy
  DEPLOYED         // Deployed to production
  ARCHIVED         // No longer active
}

model Deployment {
  id              String   @id @default(cuid())
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  draftId         String
  draft           Draft    @relation(fields: [draftId], references: [id])

  // Deployment details
  environment     String                    // "production" | "preview"
  vercelDeploymentId String?               // Vercel deployment ID
  vercelUrl       String?                   // Deployment URL
  configSnapshot  Json                      // Config at deployment time

  // Status
  status          DeploymentStatus @default(PENDING)
  errorMessage    String?          @db.Text

  // Timestamps
  deployedAt      DateTime @default(now())
  deployedBy      String?                   // User email/ID

  @@index([clientId, environment])
  @@index([draftId])
}

enum DeploymentStatus {
  PENDING
  BUILDING
  READY
  ERROR
  CANCELED
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  role          UserRole @default(EDITOR)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
}

enum UserRole {
  ADMIN          // Full access
  EDITOR         // Can generate and deploy
  VIEWER         // Read-only access
}
```

### 3.3 Studio API Models

**File**: `packages/shared/src/types/api.ts`

```typescript
// API request/response types

export interface GenerateRequest {
  clientName: string;
  discoveryDoc: string;              // Text content or file reference
  methodologyDoc: string;
  params: GenerationParams;
}

export interface GenerationParams {
  maxMinutes: number;
  tone?: string[];
  segments?: string[];
  archetypes?: string[];
}

export interface GenerateResponse {
  draftId: string;
  status: 'generating' | 'complete' | 'error';
  config?: SurveyConfig;
  methodBrief?: MethodBrief;
  errors?: string[];
  meta: {
    tokensUsed?: number;
    generationTime?: number;
  };
}

export interface ValidateRequest {
  config: SurveyConfig;
}

export interface ValidateResponse {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  estimatedDuration?: number;         // Calculated completion time
}

export interface ValidationError {
  path: string;                       // JSON path (e.g., "blocks.b3.options")
  message: string;
  severity: 'error' | 'warning';
}

export interface DeployRequest {
  draftId: string;
  clientSlug: string;
  environment: 'production' | 'preview';
  envVars?: Record<string, string>;
}

export interface DeployResponse {
  deploymentId: string;
  status: 'pending' | 'building' | 'ready' | 'error';
  url?: string;
  errorMessage?: string;
}

export interface MethodBrief {
  client: string;
  goals: string[];
  segments: string[];
  archetypes: string[];
  tone: string[];
  constraints: {
    max_minutes: number;
    anonymity: 'anonymous' | 'opt-in' | 'identified';
  };
  keywords?: string[];
}
```

---

## 4. API Design

### 4.1 Studio API Endpoints

**Base URL**: `https://studio.nesolagus.com/api` (or `http://localhost:3000/api` in dev)

#### POST /api/generate
Generate a new survey from discovery documents.

**Request**:
```json
{
  "clientName": "Acme Corp",
  "discoveryDoc": "...",
  "methodologyDoc": "...",
  "params": {
    "maxMinutes": 8,
    "tone": ["warm", "inviting"],
    "segments": ["donors", "volunteers"]
  }
}
```

**Response** (202 Accepted):
```json
{
  "draftId": "clf123abc",
  "status": "generating",
  "estimatedTime": 25000
}
```

#### GET /api/drafts/:id
Get draft status and config.

**Response** (200 OK):
```json
{
  "draftId": "clf123abc",
  "status": "ready",
  "config": { /* SurveyConfig */ },
  "methodBrief": { /* MethodBrief */ },
  "validationErrors": [],
  "meta": {
    "tokensUsed": 5240,
    "generationTime": 23400
  }
}
```

#### POST /api/validate
Validate a survey configuration.

**Request**:
```json
{
  "config": { /* SurveyConfig */ }
}
```

**Response** (200 OK):
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "path": "blocks.b3.content",
      "message": "Question text is very long (200+ chars)",
      "severity": "warning"
    }
  ],
  "estimatedDuration": 7.5
}
```

#### PUT /api/drafts/:id
Update a draft configuration.

**Request**:
```json
{
  "config": { /* Modified SurveyConfig */ }
}
```

**Response** (200 OK):
```json
{
  "draftId": "clf123abc",
  "updated": true
}
```

#### POST /api/deploy
Deploy a draft to production or preview.

**Request**:
```json
{
  "draftId": "clf123abc",
  "clientSlug": "acme",
  "environment": "production",
  "envVars": {
    "VITE_API_URL": "https://api.acme.com",
    "CLIENT_ID": "acme"
  }
}
```

**Response** (202 Accepted):
```json
{
  "deploymentId": "dpl456xyz",
  "status": "building",
  "message": "Deployment started"
}
```

#### GET /api/deployments/:id
Get deployment status.

**Response** (200 OK):
```json
{
  "deploymentId": "dpl456xyz",
  "status": "ready",
  "url": "https://acme-survey.vercel.app",
  "deployedAt": "2025-10-13T12:34:56Z"
}
```

#### GET /api/clients
List all clients.

**Response** (200 OK):
```json
{
  "clients": [
    {
      "id": "cli789",
      "name": "Acme Corp",
      "slug": "acme",
      "domain": "survey.acme.com",
      "deploymentsCount": 5,
      "lastDeployedAt": "2025-10-10T08:00:00Z"
    }
  ]
}
```

### 4.2 Engine API Extensions

No new endpoints required. Engine's existing endpoints continue to work:
- `GET /api/survey/start` - Start survey session
- `POST /api/survey/answer` - Submit answer
- `GET /api/survey/state` - Get session state
- `GET /api/config/survey` - Get survey config (enhanced to read from `clients/` dir)

---

## 5. Component Design

### 5.1 Studio Web UI Components

```
studio/src/components/
├── layout/
│   ├── AppShell.tsx              # Main layout with nav
│   ├── Sidebar.tsx
│   └── Header.tsx
├── generation/
│   ├── GenerationForm.tsx        # Input form for discovery docs
│   ├── DocumentUpload.tsx        # File upload component
│   ├── ParamsEditor.tsx          # Duration, tone, segments
│   └── GenerationProgress.tsx    # Progress indicator
├── preview/
│   ├── SurveyPreview.tsx         # Main preview container
│   ├── PreviewFrame.tsx          # Iframe or direct render
│   ├── DeviceToggle.tsx          # Mobile/desktop switch
│   └── TestModeControls.tsx      # Test flow controls
├── editor/
│   ├── ConfigEditor.tsx          # JSON editor with syntax highlight
│   ├── BlockEditor.tsx           # Visual block editor
│   ├── BlockList.tsx             # Sortable block list
│   ├── QuestionEditor.tsx        # Edit individual questions
│   ├── OptionsEditor.tsx         # Edit choice options
│   └── BranchingEditor.tsx       # Visual branching logic
├── deployment/
│   ├── DeployButton.tsx          # One-click deploy
│   ├── DeployModal.tsx           # Confirmation modal
│   ├── DeploymentStatus.tsx      # Status tracker
│   └── DeploymentHistory.tsx     # Past deployments
└── shared/
    ├── Button.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Modal.tsx
    └── Toast.tsx
```

### 5.2 Shared Survey Components

```
packages/survey-components/src/
├── blocks/
│   ├── TextInputBlock.tsx
│   ├── SingleChoiceBlock.tsx
│   ├── MultiChoiceBlock.tsx
│   ├── ScaleBlock.tsx
│   ├── YesNoBlock.tsx
│   ├── DynamicMessageBlock.tsx
│   ├── FinalMessageBlock.tsx
│   └── index.ts
├── layouts/
│   ├── SurveyLayout.tsx          # Main survey container
│   ├── ProgressBar.tsx
│   └── NavigationControls.tsx
├── preview/
│   ├── PreviewProvider.tsx       # Context for preview state
│   └── PreviewRenderer.tsx       # Renders survey in preview mode
└── utils/
    ├── blockRenderer.ts          # Block type → component mapping
    └── variableResolver.ts       # Resolve {{variables}}
```

### 5.3 Component Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           Studio UI (Next.js)                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────┐      ┌─────────────────┐  │
│  │ GenerationForm  │      │  ConfigEditor   │  │
│  └────────┬────────┘      └────────┬────────┘  │
│           │                        │           │
│           ▼                        ▼           │
│  ┌──────────────────────────────────────────┐  │
│  │       SurveyPreview (Shared)             │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  PreviewProvider                   │  │  │
│  │  │  ┌──────────────────────────────┐  │  │  │
│  │  │  │  Block Renderers (Shared)    │  │  │  │
│  │  │  │  - TextInputBlock            │  │  │  │
│  │  │  │  - SingleChoiceBlock         │  │  │  │
│  │  │  │  - ScaleBlock                │  │  │  │
│  │  │  └──────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
           │
           │ (Same components used in Engine)
           ▼
┌─────────────────────────────────────────────────┐
│          Engine Frontend (React)                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │     SurveyRenderer (Production)          │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  Block Renderers (Shared)          │  │  │
│  │  │  - Same components as preview      │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 6. Database Schema

See **Section 3.2** for full Prisma schema.

### 6.1 Key Relationships

```
Client (1) ──< (N) Draft
Client (1) ──< (N) Deployment
Draft  (1) ──< (N) Deployment
```

### 6.2 Indexes

```sql
-- High-traffic queries
CREATE INDEX idx_drafts_client_status ON drafts(client_id, status);
CREATE INDEX idx_deployments_client_env ON deployments(client_id, environment);
CREATE INDEX idx_clients_slug ON clients(slug);
```

---

## 7. Integration Points

### 7.1 Studio → Engine Integration

#### Method 1: File-Based (Phase 1)
Studio writes generated config to `engine/config/clients/{slug}.json`.

**Pros**: Simple, no API needed
**Cons**: Requires file system access, not suitable for cloud deployment

#### Method 2: API-Based (Phase 2)
Studio calls Engine API to upload config.

**Endpoint**: `POST /api/admin/surveys`
**Request**:
```json
{
  "clientId": "acme",
  "config": { /* SurveyConfig */ }
}
```

**Implementation**:
```typescript
// engine/backend/src/controllers/admin.controller.ts
export async function uploadSurveyConfig(req, res) {
  const { clientId, config } = req.body;

  // Validate config
  const validation = validateSurveyConfig(config);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  // Write to file system or database
  await writeClientConfig(clientId, config);

  // Clear config cache
  getConfigLoader().clearCache();

  res.json({ success: true });
}
```

### 7.2 ConfigLoader Enhancement

**File**: `engine/backend/src/config/configLoader.ts`

```typescript
export class FileConfigLoader implements ConfigLoader {
  private configDir: string;
  private surveyCache: Map<string, SurveyConfig> = new Map();

  async getSurvey(): Promise<SurveyConfig> {
    // Get CLIENT_ID from environment
    const clientId = process.env.CLIENT_ID || 'default';

    // Check cache
    if (this.surveyCache.has(clientId)) {
      return this.surveyCache.get(clientId)!;
    }

    // Load client-specific config
    const clientPath = path.join(this.configDir, 'clients', `${clientId}.json`);

    if (!fs.existsSync(clientPath)) {
      logger.warn(`Config for client '${clientId}' not found, using default`);
      const defaultPath = path.join(this.configDir, 'clients', 'default.json');

      if (!fs.existsSync(defaultPath)) {
        throw new Error('No survey config found');
      }

      const data = fs.readFileSync(defaultPath, 'utf-8');
      const config = JSON.parse(data);
      this.surveyCache.set(clientId, config);
      return config;
    }

    const data = fs.readFileSync(clientPath, 'utf-8');
    const config = JSON.parse(data);

    logger.info(`Loaded survey config for client: ${clientId}`);
    this.surveyCache.set(clientId, config);

    return config;
  }

  clearCache(clientId?: string): void {
    if (clientId) {
      this.surveyCache.delete(clientId);
      logger.info(`Cleared cache for client: ${clientId}`);
    } else {
      this.surveyCache.clear();
      logger.info('Cleared all config cache');
    }
  }
}
```

### 7.3 Vercel Deployment Integration

**File**: `studio/src/lib/vercel/client.ts`

```typescript
import { Vercel } from '@vercel/client';

export class VercelDeploymentClient {
  private client: Vercel;

  constructor(token: string) {
    this.client = new Vercel({ token });
  }

  /**
   * Deploy engine with client-specific configuration
   */
  async deployClient(params: {
    clientSlug: string;
    projectName: string;
    envVars: Record<string, string>;
    configPath: string;
  }): Promise<{ deploymentId: string; url: string }> {
    const { clientSlug, projectName, envVars, configPath } = params;

    // Ensure CLIENT_ID is set
    const env = {
      ...envVars,
      CLIENT_ID: clientSlug,
    };

    // Create deployment
    const deployment = await this.client.createDeployment({
      name: projectName,
      project: projectName,
      target: 'production',
      env,
      files: [
        {
          file: `config/clients/${clientSlug}.json`,
          data: fs.readFileSync(configPath, 'utf-8'),
        },
      ],
    });

    return {
      deploymentId: deployment.id,
      url: deployment.url,
    };
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    const deployment = await this.client.getDeployment(deploymentId);

    return {
      status: deployment.readyState, // BUILDING | READY | ERROR
      url: deployment.url,
      createdAt: deployment.createdAt,
    };
  }
}
```

---

## 8. Deployment Architecture

### 8.1 Production Topology

```
┌──────────────────────────────────────────────────┐
│                  Vercel Edge                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────┐      ┌─────────────────┐   │
│  │  Studio         │      │  Engine         │   │
│  │  studio.app.com │      │  (Multi-tenant) │   │
│  │                 │      │                 │   │
│  │  Next.js        │      │  React + Vite   │   │
│  └────────┬────────┘      └────────┬────────┘   │
│           │                        │            │
│           │                        │            │
│           ▼                        ▼            │
│  ┌──────────────────┐    ┌──────────────────┐   │
│  │  Studio DB       │    │  Engine Backend  │   │
│  │  (PostgreSQL)    │    │  (Express)       │   │
│  └──────────────────┘    └────────┬─────────┘   │
│                                   │             │
│                                   ▼             │
│                          ┌──────────────────┐   │
│                          │  Engine DB       │   │
│                          │  (PostgreSQL)    │   │
│                          └──────────────────┘   │
└──────────────────────────────────────────────────┘

Per-Client Deployments:
┌────────────────────┐  ┌────────────────────┐
│ acme-survey.app    │  │ beta-survey.app    │
│ CLIENT_ID=acme     │  │ CLIENT_ID=beta     │
│ (Engine instance)  │  │ (Engine instance)  │
└────────────────────┘  └────────────────────┘
```

### 8.2 Deployment Flow

```
1. User clicks "Deploy" in Studio UI
         ↓
2. Studio API creates Deployment record (status: PENDING)
         ↓
3. Studio calls Vercel API to create deployment
   - Sets CLIENT_ID environment variable
   - Uploads client config file
         ↓
4. Vercel builds and deploys Engine
   - Runs npm install, npm build
   - Starts server with CLIENT_ID=acme
         ↓
5. Engine loads config from config/clients/acme.json
         ↓
6. Studio polls Vercel API for deployment status
         ↓
7. When READY, Studio updates Deployment record
         ↓
8. User receives notification with live URL
```

### 8.3 Environment Variables

**Studio (studio.nesolagus.com)**:
```env
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
VERCEL_API_TOKEN=...
NEXTAUTH_SECRET=...
CLERK_SECRET_KEY=...
```

**Engine (per-client deployment)**:
```env
CLIENT_ID=acme                           # ← Key variable
DATABASE_URL=postgresql://...
VITE_API_URL=https://api.acme-survey.com
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

---

## 9. Security Design

### 9.1 Authentication & Authorization

**Studio Access**:
- Clerk-based authentication for studio users
- Roles: Admin, Editor, Viewer
- JWT tokens for API authentication

**Engine Access**:
- Public survey access (no auth for respondents)
- Admin dashboard requires Clerk authentication
- API keys for webhook integrations

### 9.2 Data Protection

| Data Type | Protection Method |
|-----------|-------------------|
| API Keys | Environment variables only, never in code/DB |
| Client Configs | Stored in private repos, not publicly accessible |
| Survey Responses | Encrypted at rest in database |
| Discovery Docs | Stored with hash for deduplication, optionally deleted after generation |
| User Credentials | Handled by Clerk (never stored) |

### 9.3 Deployment Security

- Vercel deployments require API token (stored securely in Studio)
- Each client deployment is isolated (separate Vercel project or environment)
- Environment variables validated before deployment
- Rollback capability in case of security issues

### 9.4 Rate Limiting

```typescript
// Studio API rate limits
const rateLimits = {
  '/api/generate': '10 requests per hour per user',
  '/api/deploy': '5 deployments per hour per client',
  '/api/validate': '100 requests per hour per user',
};
```

---

## 10. Error Handling

### 10.1 Error Categories

**Generation Errors**:
- AI service timeout
- Invalid input documents
- Schema validation failure

**Deployment Errors**:
- Vercel API failure
- Invalid configuration
- Environment variable missing

**Preview Errors**:
- Component rendering failure
- Invalid block type
- Missing required fields

### 10.2 Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;              // Machine-readable error code
    message: string;           // Human-readable message
    details?: any;             // Additional context
    retryable: boolean;        // Can user retry?
    suggestion?: string;       // What user should do
  };
}

// Example
{
  "error": {
    "code": "GENERATION_TIMEOUT",
    "message": "Survey generation took too long and was canceled",
    "retryable": true,
    "suggestion": "Try reducing the survey duration or simplifying the methodology document"
  }
}
```

### 10.3 User-Facing Error Messages

| Error Code | User Message | Suggested Action |
|------------|--------------|------------------|
| `INVALID_CONFIG` | "The survey configuration is invalid" | "Check the validation errors and fix them" |
| `GENERATION_FAILED` | "AI generation failed" | "Try again with different input documents" |
| `DEPLOY_FAILED` | "Deployment to Vercel failed" | "Check Vercel status and try again" |
| `CLIENT_NOT_FOUND` | "Client not found" | "Create the client first in Settings" |

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Studio**:
- Pipeline steps (extract brief, draft questions, validate)
- Validators
- Utility functions

**Engine**:
- ConfigLoader with CLIENT_ID
- Block renderers
- API endpoints

**Shared**:
- Type validators
- Format converters

### 11.2 Integration Tests

**Studio → Engine**:
- Generate survey → save to engine/config → load in engine
- Full deployment flow with Vercel API (use test project)

**Preview Accuracy**:
- Render survey in preview → compare with production render
- Ensure 100% visual match

### 11.3 End-to-End Tests

**Critical User Journeys**:
1. Generate survey → preview → edit → deploy → verify live
2. Generate survey → validation errors → fix → deploy
3. Multi-client: Deploy for Client A → Deploy for Client B → verify isolation

**Tools**:
- Playwright or Cypress for E2E
- Percy or Chromatic for visual regression

### 11.4 Test Environment

```
┌─────────────────────────────────────────────┐
│            Test Environment                  │
├─────────────────────────────────────────────┤
│  Studio (localhost:3000)                    │
│  Engine (localhost:5173)                    │
│  Test DB (PostgreSQL Docker)                │
│  Mock Anthropic API (canned responses)      │
│  Mock Vercel API (simulated deployments)    │
└─────────────────────────────────────────────┘
```

---

## 12. Migration Plan

### 12.1 Phase 1: Foundation (Week 1-2)

**Goal**: Enable multi-client deployments with existing CLI

**Tasks**:
1. Create `packages/shared` with types
2. Enhance `ConfigLoader` to support `CLIENT_ID`
3. Create `engine/config/clients/` directory
4. Write integration scripts (`generate.js`, `test-client.sh`, `deploy-client.sh`)
5. Migrate one client to new architecture
6. Document new workflow

**Success Criteria**:
- Can generate survey for client via CLI
- Can test survey locally with `CLIENT_ID=acme npm run dev`
- Can deploy to Vercel with client-specific config

### 12.2 Phase 2: Studio UI (Week 3-5)

**Goal**: Replace CLI with web UI and add preview

**Tasks**:
1. Set up Next.js app in `studio/src/app`
2. Create Prisma schema and database
3. Build generation UI
4. Extract engine components to `packages/survey-components`
5. Build preview component using shared components
6. Integrate Vercel API for one-click deployment
7. Add visual editor for survey configs

**Success Criteria**:
- Can generate survey through web UI
- Preview matches production exactly
- Can deploy to Vercel with one click
- Non-technical users can complete full workflow

### 12.3 Phase 3: Beta & Launch (Week 6)

**Goal**: Production-ready, battle-tested

**Tasks**:
1. Beta test with 3 real clients
2. Gather feedback and iterate
3. Write comprehensive documentation
4. Set up monitoring and alerts
5. Train team on new workflow
6. Launch to general availability

**Success Criteria**:
- Zero critical bugs in beta
- 90%+ user satisfaction
- Documentation complete
- Team trained and confident

### 12.4 Rollback Plan

If major issues arise:
1. **Immediate**: Revert to separate repos, manual workflow
2. **Week 1-2**: Scripts are backwards-compatible, can still use old workflow
3. **Week 3+**: Studio UI is additive, CLI still works

---

## 13. Monitoring & Observability

### 13.1 Key Metrics

**Performance**:
- Survey generation time (p50, p95, p99)
- Preview render time
- Deployment time

**Reliability**:
- Generation success rate
- Validation pass rate
- Deployment success rate
- API error rate

**Business**:
- Surveys generated per week
- Time from generation to deployment
- Client satisfaction (survey after deployment)

### 13.2 Logging

```typescript
// Structured logging example
logger.info('Survey generation started', {
  draftId: 'clf123',
  clientSlug: 'acme',
  maxMinutes: 8,
  model: 'claude-sonnet-4-5',
});

logger.info('Survey generation completed', {
  draftId: 'clf123',
  tokensUsed: 5240,
  generationTime: 23400,
  blocksGenerated: 12,
});
```

### 13.3 Alerts

- AI generation failures > 10% in 5 minutes
- Deployment failures > 20% in 10 minutes
- API error rate > 5% in 5 minutes
- Database connection failures

---

## 14. Future Enhancements

### 14.1 Short-term (Post-V1)

- Visual flow diagram for branching logic
- Survey templates library
- A/B testing support
- Version comparison (diff view)
- Automated rollback on error

### 14.2 Long-term

- Multi-language support
- Real-time collaboration
- Advanced analytics preview
- Custom branding per client (white-label studio)
- Survey response management from studio
- Integration with CRM systems (Salesforce, HubSpot)

---

## 15. Appendix

### 15.1 Glossary

- **Block**: A single question or message in a survey
- **Client**: An organization receiving a custom survey
- **Draft**: A work-in-progress survey configuration
- **Deployment**: An instance of the engine running for a specific client
- **Method Brief**: AI-extracted summary of discovery/methodology docs
- **Preview**: Embedded rendering of survey using shared components

### 15.2 References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs)
- [Vercel API](https://vercel.com/docs/rest-api)
- [Anthropic API](https://docs.anthropic.com/claude/reference)

### 15.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-13 | AI Assistant | Initial design document |

---

**Next Steps**: Review with engineering team, estimate work, begin Phase 1 implementation.
