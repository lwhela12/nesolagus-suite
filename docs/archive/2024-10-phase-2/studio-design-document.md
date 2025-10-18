Question Generator — Quick Design Doc (MVP)
1) Goal

Turn a discovery document + methodology into a validated survey.config.json that your survey-engine can deploy immediately—while keeping a human-in-the-loop for edits.

2) Scope (MVP)

Upload/select Discovery + Methodology documents.

Extract a compact Method Brief (objectives, segments, archetypes, tone, constraints).

Generate draft survey flow (nodes, branching, metadata).

Validate against survey-engine JSON Schema + auto-repair.

Review/Edit in a simple UI; Publish to survey-engine (file or API).

Vendor-agnostic LLM (Claude/OpenAI) via adapters.

Out-of-scope (MVP): multi-user roles, billing, advanced analytics, full multi-tenant auth.

3) Personas

Survey Author (internal): runs generation, edits questions, publishes.

Strategist (internal): uploads discovery, sets constraints, reviews tone.

Client Stakeholder (read-only later): reviews draft (optional in MVP).

4) Inputs → Outputs

Inputs

Discovery doc(s) (Google Drive or file upload).

Methodology doc(s) (Drive/upload).

Generation Params: target duration (minutes), tone, archetypes, required sections, disallowed topics.

Outputs

survey.config.json (versioned; deploy-ready).

Draft provenance (source doc refs, model/version, prompts).

Exports: JSON, JSONL (event preview), optional CSV mapping.

5) System Architecture (thin)

Frontend: Next.js app (pages: /new, /draft/:id, /publish/:id).

Backend: Fastify/Express (TypeScript).

LLM Orchestration: small stepwise pipeline (goal extract → question blocks → branching → repair).

Validation: Zod + AJV (JSON Schema) against survey-engine spec.

Storage: Postgres (or SQLite for local dev) for drafts/releases; S3/GDrive references for sources.

[Drive/Upload] -> [Extractor] -> [Method Brief]
                           -> [LLM Pipeline] -> [Draft Survey JSON]
                                      -> [Validator + Repair] -> [Editor UI] -> [Publish -> survey-engine]

6) Data Contracts
6.1 Method Brief (derived from sources)
type MethodBrief = {
  client: string;
  goals: string[];
  segments: string[];
  archetypes: string[];
  tone: string[];                // e.g., ["warm","trust-based","inviting"]
  constraints: {
    max_minutes: number;         // e.g., 8
    anonymity: "anonymous" | "opt-in" | "identified";
    languages?: string[];        // future
  };
  keywords?: string[];           // domain vocabulary
};

6.2 Survey Config (engine-compatible; excerpt)
type SurveyConfig = {
  version: string;               // semver
  meta: { title: string; lang: string };
  theme?: { preset: string; tokens?: Record<string,string|number> };
  flow: {
    start: string;               // node id
    nodes: Record<string, Node>;
  };
};

type Node =
 | { type: "message"; text: string; next: Next }
 | { type: "text"; prompt: string; next: Next; tags?: string[] }
 | { type: "number"; prompt: string; next: Next; min?: number; max?: number; tags?: string[] }
 | { type: "singleChoice"; prompt: string; options: Option[]; next: Next; tags?: string[] }
 | { type: "multiChoice"; prompt: string; options: Option[]; next: Next; tags?: string[] }
 | { type: "rating"; prompt: string; scale: { min: number; max: number; labelMin?: string; labelMax?: string }; next: Next; tags?: string[] }
 | { type: "video"; prompt: string; next: Next; tags?: string[] }
 | { type: "end" };

type Option = { id: string; label: string; };

type Next =
 | string // node id
 | { if: Array<{ when: Condition; goto: string }>; else: string | Next };
 // Note: 'else' can be another Next object, enabling nested if/then/else chains

type Condition =
 | { equals: { answer: string | number | boolean } }
 | { in: { answer: string[] } }
 | { gt: { answer: number } }
 | { lt: { answer: number } };

// Enhanced Branching:
// 1. Rating questions automatically generate multi-tier branches:
//    - 3-point scales: negative, neutral, positive (3 paths)
//    - 5-point scales: negative, neutral, positive (3 paths with different thresholds)
//    - 7+ point scales: very-negative, negative, neutral, positive, very-positive (5 paths)
//
// 2. LLM can optionally generate custom branches for complex questions:
//    - Multi-choice with follow-ups based on selected options
//    - Text/number inputs with conditional paths based on content
//    - Nested branching for sophisticated flows

6.3 Persistence
model Draft {
  id           String   @id @default(cuid())
  client       String
  methodBrief  Json
  draftConfig  Json
  llmVendor    String   // "openai" | "anthropic"
  llmModel     String   // e.g., "gpt-4.1" | "claude-3-7"
  status       String   // "new" | "generated" | "validated" | "edited"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model SourceDoc {
  id           String   @id @default(cuid())
  draftId      String
  title        String
  driveFileId  String?  // or storage URL
  sha256       String
  kind         String    // "discovery" | "methodology"
  extracted    Json?
  createdAt    DateTime  @default(now())
}

model Release {
  id           String   @id @default(cuid())
  client       String
  version      String    // semver for survey config
  config       Json
  draftId      String
  publishedBy  String
  createdAt    DateTime  @default(now())
}

7) API Endpoints (MVP)
POST   /api/sources/import          {driveFileId|upload} -> {sourceDocId}
POST   /api/drafts                  {client, sourceDocIds[], params?} -> {draftId}
POST   /api/drafts/:id/generate     -> {draftConfig}
POST   /api/drafts/:id/validate     -> {valid, issues[]}
PUT    /api/drafts/:id              {draftConfig} -> {ok}
POST   /api/drafts/:id/publish      -> {releaseId, version}
GET    /api/releases/:id            -> {config}

8) LLM Orchestration (steps)

Extract Brief
Input: raw text chunks from discovery/methodology.
Output: MethodBrief.
Guardrails: schema-constrained JSON; max 400 tokens.

Draft Questions (Narrative Blocks)
Input: MethodBrief + few-shot exemplars.
Output: list of questions with purpose, archetypeTags, and suggested order.

Structure to Engine Nodes
Map to Node types, set nodeIds, fill options, stitch next.
Constraint: estimate time (heuristics: message=5s, text=30s, choice=15s, rating=10s; cap by max_minutes).

Validate + Self-Repair
Run Zod/AJV; if invalid, feed errors back to model (“repair mode”) until valid or timeout.

Adapters:

interface LLM {
  complete(params: { system: string; user: string; json?: boolean }): Promise<any>;
}
class OpenAIAdapter implements LLM { /* ... */ }
class AnthropicAdapter implements LLM { /* ... */ }

9) Validation & Quality Gates

JSON Schema (shared with engine) as the single source of truth.

Lint rules:

All nodeIds referenced by next exist.

options ids are kebab-case unique.

No dead-ends except end.

Estimated duration ≤ max_minutes.

Archetype coverage check (optional threshold).

Bias/Language checker: pass that flags loaded or exclusionary terms and suggests neutrals.

10) Editor UI (MVP)

Left: Section/Narrative outline (reorder).

Middle: Question editor (type, prompt, options, tags).

Right: Branching rules + live schema status.

Bottom: Live JSON preview (read-only) + Validate button.

Publish button → version dialog (1.0.0, notes).

11) Integration with survey-engine

Two options:

File-based: write surveys/current/survey.config.json to a client repo via GitHub PR (best for “deploy per client”).

API-based: call POST /api/admin/surveys/:id/publish with config JSON (future, for multi-tenant).

12) Security & Privacy

Store doc hashes; avoid persisting raw PII.

Secrets: model keys via server-side env only.

Rate limit generation endpoints.

Keep prompts and outputs tied to draftId for auditability.

13) Metrics

Gen time, tokens cost, validation pass rate, repair iterations.

Human edit deltas (how much changed before publish).

Completion time estimates vs actuals (feedback loop once deployed).

14) Risks & Mitigations

Hallucinated structure → strict schema + repair loop.

Overlong surveys → duration estimator + prune step.

Tone drift → few-shot exemplars + tone-check pass.

Branching errors → graph lint (no cycles unless allowed).

15) Delivery Plan (2–3 sprints)

Sprint 1 (Engineed Drafts)

Data contracts, schema, OpenAI/Anthropic adapters.

Steps 1–3 of pipeline; basic CLI to run end-to-end.

Minimal validator.

Sprint 2 (Editor & Publish)

Next.js editor, live validation, publish-to-PR.

CSV/JSONL export scaffold.

Sprint 3 (Quality & Ops)

Bias/tone lints, duration estimator, webhook to survey-engine.

Caching, cost tracking, prompt tuning.