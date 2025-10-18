ChatGPT said:
PRD — Survey Question Generator (Companion to survey-engine)
0. Document Info

Owner: Lucas Whelan

Stakeholders: Research/Strategy, Survey Authors, Engineering

Status: Draft v0.1

Target MVP Date: T+3 sprints from kickoff

1. Problem Statement

Creating high-quality, on-brand surveys from discovery materials is slow, inconsistent, and costly. We need a repeatable way to transform a client’s discovery docs + our methodology into a deploy-ready survey.config.json for survey-engine, with human review and strict schema validation.

2. Objectives & Success Criteria
Objectives

Generate a validated survey configuration from inputs (discovery + methodology) in minutes.

Enforce consistency with our methodology (tone, structure, branching patterns).

Keep humans-in-the-loop for edits and final approval.

Output directly usable artifacts for survey-engine (file or API publish).

Success Metrics (MVP targets)

Time-to-first-draft: ≤ 5 minutes from document selection to validated draft.

Validation pass rate: ≥ 90% of generations pass schema after ≤ 1 repair round.

Edit delta: ≤ 30% average human edit change (tokens/characters) before publish.

Adoption: ≥ 3 client surveys published via the generator in first 30 days.

Cost per draft: Tracked and ≤ target budget (set post week 1 once prompts stabilize).

3. Users & Use Cases
Personas

Survey Author (primary): Generates draft, edits questions/branching, publishes.

Strategist (secondary): Selects inputs, sets constraints (duration, tone, archetypes), reviews.

Client Reviewer (optional, later): Reviews draft read-only.

Core Use Cases

Upload/select discovery + methodology documents and set constraints.

Generate a draft survey (questions, branching, tone).

Validate against survey-engine schema; auto-repair if needed.

Edit in a structured UI; preview flow.

Publish to a per-client repo (PR) or to survey-engine Admin API (future multi-tenant).

4. Scope
In-Scope (MVP)

Google Drive/file upload ingestion.

LLM-based generation pipeline (goal extraction → question blocks → branching → repair).

JSON Schema + Zod validation and auto-repair loop.

Editor UI with live schema status and flow preview.

Publishing via GitHub PR to a per-client repo (deploy-per-client model).

Versioning of drafts/releases; provenance (model, prompts, source hashes).

Out-of-Scope (MVP)

Multi-tenant auth/organizations.

Billing/payments.

Rich analytics; only basic generation metrics.

5. High-Level Requirements
Functional Requirements

Source ingestion

Select files from Google Drive or upload.

Store file references, content hash, and minimal text extraction.

Method Brief extraction

Derive goals, segments, archetypes, tone, constraints (JSON).

Generation pipeline

Step A: Extract Brief → JSON.

Step B: Draft Narrative Questions (with purposes and tags).

Step C: Structure to engine nodes (typed questions, options, next).

Step D: Validate + self-repair (repeat ≤ 2 times).

Validation

JSON Schema + Zod; graph lint (dead ends, missing nodes, invalid references).

Duration estimator enforces max_minutes.

Editor & Preview

Edit question text/type/options, branching rules, tags.

Visual flow outline; live validation badge.

Publish

Write surveys/current/survey.config.json via GitHub PR into the client repo.

Tag release with semver and store provenance.

Auditability

Store prompts, model versions, and diffs between draft and release.

Non-Functional Requirements

Reliability: 99.5% availability for generation/editor endpoints.

Performance: First draft generation ≤ 60s typical (given cached extraction).

Security: No storage of raw PII beyond necessary draft content; secrets server-side only.

Portability: Model vendor adapter pattern (OpenAI/Anthropic).

Observability: Logs for each step, cost metrics, validation error distributions.

6. User Flows (MVP)

Create Draft

New Draft → Select Source Docs (Drive) → Set Params (duration, tone, archetypes) → Generate → View Draft → Validate (auto) → Edit → Validate (green) → Publish (PR).

Edit Existing Draft

Open Draft → Modify questions/branching → Validate → Publish (new release).

Publish

Choose target repo (per client template) → Create PR with survey.config.json and CHANGELOG.md → link back to draft.

7. Data Model (Prisma sketch)
model Draft {
  id           String   @id @default(cuid())
  client       String
  methodBrief  Json
  draftConfig  Json
  llmVendor    String
  llmModel     String
  status       String   // new | generated | validated | edited
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model SourceDoc {
  id           String   @id @default(cuid())
  draftId      String
  title        String
  driveFileId  String?
  sha256       String
  kind         String    // discovery | methodology | other
  extracted    Json?
  createdAt    DateTime  @default(now())
}

model Release {
  id           String   @id @default(cuid())
  client       String
  version      String
  config       Json
  draftId      String
  publishedBy  String
  createdAt    DateTime  @default(now())
}

8. Contracts
8.1 Method Brief (input to generation)
type MethodBrief = {
  client: string;
  goals: string[];
  segments: string[];
  archetypes: string[];
  tone: string[];
  constraints: { max_minutes: number; anonymity: "anonymous"|"opt-in"|"identified"; languages?: string[] };
  keywords?: string[];
};

8.2 Survey Config (output for engine) — excerpt
type SurveyConfig = {
  version: string;
  meta: { title: string; lang: string };
  theme?: { preset: string; tokens?: Record<string,string|number> };
  flow: { start: string; nodes: Record<string, Node> };
};


Node/Next/Condition types as defined in the design doc.

9. API Spec (MVP)
POST /api/sources/import           {driveFileId|upload} -> {sourceDocId}
POST /api/drafts                   {client, sourceDocIds[], params?} -> {draftId}
POST /api/drafts/:id/generate      -> {draftConfig, methodBrief}
POST /api/drafts/:id/validate      -> {valid, issues[]}
PUT  /api/drafts/:id               {draftConfig} -> {ok}
POST /api/drafts/:id/publish       {targetRepo, version?} -> {releaseId, prUrl}
GET  /api/releases/:id             -> {config, provenance}


Error model: consistent {error: {code, message, details?}}.

10. LLM Orchestration

Adapters: OpenAIAdapter, AnthropicAdapter implementing LLM.complete({system, user, json}).

Pipelines:

extractBrief(sources) -> MethodBrief

draftQuestions(brief, exemplars) -> QuestionDraft[]

structureToConfig(questions) -> SurveyConfig

validateAndRepair(config, schema) -> {config, issues[]}

Exemplars: Seeded from prior successful surveys/methodology snippets.

11. Validation Rules (lint set)

All next references resolve to existing node IDs.

Only end can be terminal.

Option IDs are unique per node and kebab-case.

Estimated duration ≤ constraints.max_minutes.

Node count ≤ config cap (e.g., 25 for MVP).

Optional: ensure coverage of target archetypes.

12. UX Requirements

/new: file picker, params (duration, tone, archetypes), Generate button.

/draft/:id: 3-pane editor (outline, question form, branching), live JSON preview (read-only), validation badge with issues panel.

/publish/:id: version bump (semver), summary of changes, Publish (PR), link to PR.

Accessibility: keyboard navigation, form labels, color-contrast AA.

13. Security & Privacy

OAuth to Google only for picking/reading selected files.

Store file hashes and minimal extracted text; avoid broad PII persistence.

API keys for models on server; client never sees them.

Rate limiting on generation endpoints.

14. Telemetry

Generation latency, token usage, cost per step.

Validation failures by rule.

Edit delta (Levenshtein or token diff) pre-publish.

Post-deploy feedback loop (optional later): actual completion times to refine estimator.

15. Risks & Mitigations

Invalid structures from LLM → strict schema + repair loop, capped attempts.

Overlong surveys → duration estimator + pruning pass.

Tone drift → few-shot exemplars + tone-lint pass.

Docs vary widely → extraction step normalizes into Method Brief; human can tweak before generate.

Vendor lock-in → adapter pattern; prompts portable.

16. Rollout Plan & Milestones

Sprint 1 — Core pipeline

JSON Schema + Zod types.

Source ingestion + brief extraction.

Draft generation (questions) + structure step.

Basic validation.

Sprint 2 — Editor & Publish

React editor with live validation.

GitHub PR publish flow with semver/tag + changelog.

Cost/telemetry capture.

Sprint 3 — Quality & Guardrails

Repair loop, duration estimator, tone/bias lints.

Prompt tuning and caching.

Docs and internal playbook.

17. Acceptance Criteria (MVP)

Given discovery/methodology docs, the system generates a draft survey.config.json that:

Validates against schema with zero errors after ≤ 1 repair attempt.

Has no dead links in next, unique node IDs, valid option IDs.

Estimated duration ≤ configured limit.

Editor allows modifying any node/branch; validation updates live.

Publish creates a GitHub PR containing surveys/current/survey.config.json and CHANGELOG.md, and records a Release.

All operations logged with model/version and source hashes.

18. Open Questions

Do we want per-client tone packs/themes at generation time or apply at render time only?

Minimum viable branching set—allow cycles/loops or keep strictly forward-only for MVP?

Where should we store exemplars (repo vs DB) for prompt stability/versioning?