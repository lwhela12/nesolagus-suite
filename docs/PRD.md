# Product Requirements Document (PRD)
## Nesolagus Suite: Unified Survey Generation & Deployment Platform

**Version:** 1.0
**Last Updated:** October 2025
**Owner:** Product Team
**Status:** Planning

---

## 1. Executive Summary

The Nesolagus Suite combines two previously separate tools—the Survey Studio (question generator) and Survey Engine (deployment platform)—into a unified workflow that enables rapid generation, testing, and deployment of client-specific conversational surveys.

### Vision
Enable non-technical team members to generate, preview, and deploy branded conversational surveys for multiple clients within minutes, not hours.

### Current State
- **Studio**: AI-powered survey generator (CLI/basic web) that outputs JSON configs
- **Engine**: Full-stack survey platform that deploys surveys per-client
- **Gap**: Manual file copying, no preview workflow, challenging multi-client deployment

### Target State
- Unified monorepo with integrated workflows
- Web UI for survey generation with live preview
- One-click deployment per client to Vercel
- Version control and rollback capabilities

---

## 2. Problem Statement

### User Pain Points

**Survey Creators (Internal Team)**
- Manual file copying between studio output and engine config is error-prone
- No way to preview generated surveys before deployment
- Difficult to test surveys locally with client-specific branding
- No clear deployment workflow for multiple clients

**Client Stakeholders**
- Long turnaround time from discovery docs to live survey (currently days)
- No ability to preview surveys before go-live
- Changes require technical intervention

**Technical Team**
- Maintaining two separate repos creates deployment complexity
- No clear multi-client deployment strategy
- Manual configuration management across environments
- Difficult to roll back problematic surveys

### Business Impact
- Increased time-to-market for client surveys
- Higher error rates due to manual processes
- Limited scalability (can't efficiently manage 10+ concurrent clients)
- Resource-intensive deployment process

---

## 3. Goals & Objectives

### Primary Goals
1. **Reduce survey deployment time from days to hours**
   - Success Metric: 80% reduction in time from discovery docs to live survey

2. **Enable non-technical survey creation**
   - Success Metric: 50% of surveys generated without engineering involvement

3. **Support scalable multi-client deployments**
   - Success Metric: Deploy and manage 10+ client surveys concurrently

### Secondary Goals
4. Improve survey quality through preview and testing
5. Reduce deployment errors by 90%
6. Enable rapid iteration on survey design

---

## 4. Target Users

### Primary Personas

**1. Survey Designer (Sarah)**
- Role: Research strategist, UX researcher
- Technical Level: Low-to-medium (comfortable with web tools, not CLI)
- Goals: Generate surveys from methodology docs, preview before deployment
- Pain Points: Current CLI is intimidating, no way to see survey before deployment

**2. Client Success Manager (Mike)**
- Role: Manages client relationships
- Technical Level: Low
- Goals: Show clients preview of survey, get approval, deploy quickly
- Pain Points: Depends on engineering for everything, slow feedback loops

**3. Engineer (Alex)**
- Role: Full-stack developer
- Technical Level: High
- Goals: Maintain platform, deploy surveys, debug issues
- Pain Points: Too much manual work, hard to manage multiple client configs

### Secondary Personas

**4. Client Stakeholder (Chris)**
- Role: Client organization decision-maker
- Technical Level: Low
- Goals: Review survey before launch, provide feedback
- Pain Points: Can't see surveys until they're deployed

---

## 5. Features & Requirements

### Phase 1: Multi-Client Configuration System
**Timeline:** Week 1-2
**Priority:** P0 (Must Have)

#### 1.1 Environment-Based Config Loading
- **Requirement**: Engine loads survey configs based on `CLIENT_ID` environment variable
- **User Story**: As Alex, I can run `CLIENT_ID=acme npm run dev` to test Acme's survey locally
- **Acceptance Criteria**:
  - ConfigLoader enhanced to support client-specific configs
  - Configs stored in `engine/config/clients/{client-id}.json`
  - Fallback to `default.json` if client config not found
  - Clear error messages for missing configs

#### 1.2 Studio Integration Script
- **Requirement**: Automated script to generate survey and save to correct location
- **User Story**: As Sarah, I can run one command to generate a survey for a specific client
- **Acceptance Criteria**:
  - Script accepts client name, discovery/methodology inputs
  - Outputs to `engine/config/clients/{client-id}.json`
  - Validates output format matches engine requirements
  - Clear success/error reporting

#### 1.3 Local Testing Workflow
- **Requirement**: Easy way to test client-specific surveys locally
- **User Story**: As Sarah, I can test a newly generated survey locally before deploying
- **Acceptance Criteria**:
  - Single command to start engine with specific client config
  - Hot-reload when config changes
  - Clear documentation in README

#### 1.4 Multi-Client Deployment Scripts
- **Requirement**: Automated deployment to Vercel per client
- **User Story**: As Mike, I can deploy a survey for a specific client with one command
- **Acceptance Criteria**:
  - Script handles Vercel deployment with client-specific env vars
  - Supports custom domains per client
  - Rollback capability
  - Deployment logs and status reporting

---

### Phase 2: Studio Web UI with Live Preview
**Timeline:** Week 3-5
**Priority:** P0 (Must Have)

#### 2.1 Web-Based Survey Generator
- **Requirement**: Replace CLI with user-friendly web interface
- **User Story**: As Sarah, I can generate surveys through a web UI without using terminal
- **Acceptance Criteria**:
  - Form-based input for discovery/methodology docs (file upload or paste)
  - Client name, duration, tone configuration inputs
  - "Generate Survey" button triggers AI generation
  - Progress indicator during generation
  - Error handling with clear messages

**UI Mockup Flow**:
```
┌─────────────────────────────────────────┐
│  New Survey Generation                  │
├─────────────────────────────────────────┤
│  Client Name: [____________]            │
│  Discovery Doc: [Upload] or [Paste]    │
│  Methodology Doc: [Upload] or [Paste]  │
│  Max Duration: [8] minutes              │
│  Tone: [warm, trust-based, inviting]   │
│                                         │
│  [Generate Survey]                      │
└─────────────────────────────────────────┘
```

#### 2.2 Live Survey Preview
- **Requirement**: Embedded preview of generated survey using engine's React components
- **User Story**: As Sarah, I can see exactly how the survey will look before deployment
- **Acceptance Criteria**:
  - Split-screen view: config editor (left) + live preview (right)
  - Preview uses actual engine rendering components
  - Real-time updates as config changes
  - Mobile/desktop preview toggle
  - Ability to walk through entire survey flow

**UI Mockup Flow**:
```
┌──────────────────┬──────────────────────┐
│ Survey Config    │  Live Preview        │
│                  │                      │
│ {                │  ┌────────────────┐  │
│   "survey": {    │  │ Welcome!       │  │
│     "name": "..  │  │                │  │
│   },             │  │ [Continue]     │  │
│   "blocks": {    │  └────────────────┘  │
│     "b0": {...   │                      │
│                  │  Question 1 of 5     │
│                  │                      │
│ }                │  ⚫ Mobile  ◯ Desktop│
└──────────────────┴──────────────────────┘
```

#### 2.3 Interactive Survey Testing
- **Requirement**: Test survey flow with actual responses
- **User Story**: As Sarah, I can complete the survey in preview mode to test branching logic
- **Acceptance Criteria**:
  - "Test Mode" button launches interactive preview
  - Can fill out survey and test all branching paths
  - Responses shown in dev console for debugging
  - Reset button to start over
  - Timer shows actual completion time

#### 2.4 Survey Editor
- **Requirement**: Edit generated survey config through visual interface
- **User Story**: As Sarah, I can tweak questions, options, and branching without editing JSON
- **Acceptance Criteria**:
  - Visual block editor for each question
  - Drag-and-drop reordering
  - Add/remove/edit questions
  - Branching logic visual builder
  - Validation with inline error messages
  - Undo/redo functionality

**UI Mockup Flow**:
```
┌─────────────────────────────────────────┐
│  Survey Editor                          │
├─────────────────────────────────────────┤
│  ⋮ Block 1: Welcome Message             │
│  ⋮ Block 2: Text Question               │
│  ⋮ Block 3: Single Choice ▼             │
│    ├─ Question: "How did you hear..."   │
│    ├─ Options:                          │
│    │   • Search Engine                  │
│    │   • Social Media [Edit] [Delete]   │
│    │   [+ Add Option]                   │
│    └─ Next: Block 4 [Change]            │
│  ⋮ Block 4: Rating Question             │
│  [+ Add Block]                          │
└─────────────────────────────────────────┘
```

#### 2.5 One-Click Deployment
- **Requirement**: Deploy survey directly from web UI
- **User Story**: As Mike, I can deploy a survey to production with one click after preview
- **Acceptance Criteria**:
  - "Deploy to Production" button in UI
  - Deployment confirmation modal with client/URL preview
  - Automated deployment to Vercel with correct env vars
  - Deployment status tracking
  - Success/failure notifications
  - Link to live survey after deployment

---

### Phase 3: Additional Features (Future)
**Timeline:** Week 6+
**Priority:** P1 (Nice to Have)

#### 3.1 Version Control & History
- View previous versions of client surveys
- Rollback to previous version
- Compare versions (diff view)
- Deployment history with timestamps

#### 3.2 Survey Templates Library
- Save surveys as templates
- Browse template library
- Clone and customize templates
- Share templates across clients

#### 3.3 Collaboration Features
- Multi-user editing with conflict resolution
- Comments on questions
- Approval workflow (draft → review → approved → deployed)
- Email notifications

#### 3.4 Analytics Integration
- Preview expected analytics schema
- Response rate estimations based on question types
- Duration estimates per question type

#### 3.5 Advanced Branching
- Visual flow diagram of branching logic
- Complex conditional logic builder
- A/B testing support
- Randomization options

---

## 6. Technical Requirements

### Architecture

#### 6.1 Monorepo Structure
```
nesolagus-suite/
├── studio/                    # Survey generation (Node.js)
│   ├── src/
│   │   ├── pipeline/         # AI generation pipeline
│   │   ├── ui/               # NEW: Web UI (Next.js or React)
│   │   └── api/              # NEW: API routes
│   └── public/
├── engine/                    # Survey platform (React + Express)
│   ├── frontend/
│   ├── backend/
│   └── config/
│       └── clients/          # NEW: Client-specific configs
├── scripts/                   # NEW: Integration scripts
│   ├── generate.js
│   ├── test-client.sh
│   └── deploy-client.sh
├── docs/                      # NEW: Documentation
│   ├── PRD.md
│   └── DESIGN.md
└── .github/
    └── workflows/             # NEW: CI/CD workflows
        └── deploy-client.yml
```

#### 6.2 Technology Stack

**Studio Web UI**
- Framework: Next.js 14 (App Router) or Vite + React
- State Management: Zustand or Redux Toolkit
- UI Components: shadcn/ui or Chakra UI
- Preview: Embedded engine React components

**Engine Enhancements**
- Enhanced ConfigLoader with CLIENT_ID support
- Shared component library for preview
- API endpoint for config validation

**Integration**
- Turborepo or npm workspaces for monorepo
- Shared TypeScript types package
- Common validation schemas

#### 6.3 Data Flow
```
User Input → Studio API → AI Generation → Validation
    ↓
Config JSON → Preview (Engine Components)
    ↓
User Approval → Deployment Script → Vercel
    ↓
Live Survey (Engine)
```

### Performance Requirements
- Survey generation: < 30 seconds (with AI)
- Preview load time: < 2 seconds
- Deployment time: < 3 minutes (Vercel)
- UI responsiveness: 60fps interactions

### Security Requirements
- API keys stored in environment variables only
- Client data encrypted at rest and in transit
- Access control for deployment actions
- Audit log of all deployments
- Rate limiting on AI generation endpoints

### Scalability Requirements
- Support 50+ concurrent client deployments
- Handle 10+ simultaneous preview sessions
- Scale to 1000s of survey responses per day per client

---

## 7. User Stories & Acceptance Criteria

### Epic 1: Generate Survey from Discovery Docs

**US-1.1: Upload Discovery Documents**
- As Sarah, I can upload discovery and methodology documents through web UI
- AC: Supports .txt, .pdf, .docx formats
- AC: Shows file name and size after upload
- AC: Can replace uploaded files before generation

**US-1.2: Configure Survey Parameters**
- As Sarah, I can set client name, duration, tone, and other parameters
- AC: Form validation prevents invalid inputs
- AC: Helpful tooltips explain each parameter
- AC: Saved settings for repeat clients

**US-1.3: Generate Survey with AI**
- As Sarah, I can click "Generate" and see progress
- AC: Progress indicator shows current step (extract, draft, validate)
- AC: Estimated time remaining shown
- AC: Can cancel generation in progress
- AC: Error messages are actionable

**US-1.4: View Generated Survey**
- As Sarah, I see the complete generated survey config
- AC: Syntax-highlighted JSON editor
- AC: Warning indicators for validation issues
- AC: Estimated duration displayed
- AC: Option to download JSON

### Epic 2: Preview Survey Before Deployment

**US-2.1: View Live Preview**
- As Sarah, I can see exactly how the survey will look to respondents
- AC: Preview renders using actual engine components
- AC: Matches production styling 100%
- AC: Mobile and desktop views available
- AC: Updates in real-time as config changes

**US-2.2: Test Survey Flow**
- As Mike, I can complete the survey in test mode to verify logic
- AC: Can answer questions and progress through survey
- AC: Branching logic works correctly
- AC: Can reset and start over
- AC: Actual completion time displayed

**US-2.3: Edit Survey Questions**
- As Sarah, I can edit questions without touching JSON
- AC: Click to edit any question text
- AC: Add/remove options for choice questions
- AC: Reorder questions via drag-and-drop
- AC: Changes reflected immediately in preview

### Epic 3: Deploy Survey to Production

**US-3.1: Deploy with One Click**
- As Mike, I can deploy the survey to production from the UI
- AC: "Deploy" button is prominent and clear
- AC: Confirmation modal shows client name and target URL
- AC: Deployment progress tracked visually
- AC: Success notification with link to live survey

**US-3.2: Test Locally Before Deploy**
- As Alex, I can run the survey locally with client config
- AC: Single command starts local engine with client config
- AC: Uses correct branding and content
- AC: Hot-reload when making changes
- AC: Clear console logs for debugging

**US-3.3: Manage Multiple Clients**
- As Alex, I can easily switch between client configs
- AC: List of all client configs in UI
- AC: Quick switch dropdown
- AC: Search/filter clients
- AC: Status indicator (draft, deployed, active)

---

## 8. Success Metrics

### Primary KPIs

**Efficiency Metrics**
- Time from discovery docs to deployed survey: Target < 2 hours (from 2-3 days)
- Deployment errors: Target < 5% (from ~30%)
- Surveys generated per week: Target 10+ (from 2-3)

**User Adoption Metrics**
- % of surveys generated via UI vs CLI: Target 80%
- Non-technical users generating surveys: Target 50%
- Client satisfaction with turnaround time: Target > 4.5/5

**Technical Metrics**
- Preview accuracy: 100% match with production
- Deployment success rate: Target > 95%
- Config validation pass rate: Target > 90%

### Secondary Metrics
- AI generation success rate
- Average edits per generated survey
- Time spent in preview before deploy
- Rollback frequency

---

## 9. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI generates invalid surveys | High | Medium | Multi-layer validation, auto-repair, fallback templates |
| Preview doesn't match production | High | Low | Share exact components, comprehensive testing |
| Vercel deployment failures | High | Medium | Retry logic, clear error messages, manual fallback |
| Studio UI complexity overwhelming | Medium | Medium | Progressive disclosure, guided workflows, templates |
| Performance issues with multiple clients | Medium | Low | Lazy loading, caching, pagination |
| Breaking changes in engine affect studio | Medium | Medium | Versioned APIs, integration tests, staged rollouts |

---

## 10. Out of Scope (V1)

The following features are explicitly out of scope for V1:
- Multi-tenant authentication (Clerk for studio users)
- Real-time collaboration (multiple users editing same survey)
- Advanced analytics dashboard within studio
- White-label studio for client self-service
- Survey response management from studio
- Integration with third-party survey tools
- Mobile app for studio
- Automated A/B testing
- Survey translation/localization tooling
- Payment/billing integration

---

## 11. Timeline & Milestones

### Phase 1: Foundation (Weeks 1-2)
- **Week 1**: Multi-client config system, enhanced ConfigLoader
- **Week 2**: Integration scripts, testing workflow, deployment automation

**Milestone 1**: Can generate and deploy client surveys via CLI with new architecture

### Phase 2: Studio UI (Weeks 3-5)
- **Week 3**: Studio web UI setup, basic generation form
- **Week 4**: Live preview integration, survey editor
- **Week 5**: One-click deployment, polish & testing

**Milestone 2**: Can generate, preview, and deploy surveys entirely through web UI

### Phase 3: Beta & Launch (Week 6)
- Beta testing with 2-3 friendly clients
- Bug fixes and UX improvements
- Documentation and training materials
- Production launch

**Milestone 3**: General availability for all clients

---

## 12. Open Questions

1. **Authentication**: Should studio web UI require login? (Recommendation: Yes, use Clerk)
2. **Hosting**: Where should studio UI be hosted? (Recommendation: Vercel, separate from engine)
3. **Database**: Should studio have its own database for drafts? (Recommendation: Yes, PostgreSQL)
4. **API Design**: RESTful or GraphQL for studio ↔ engine communication? (Recommendation: REST for simplicity)
5. **Branding**: Should studio have its own branding or match engine? (Recommendation: Own branding, professional tool aesthetic)

---

## 13. Appendix

### Related Documents
- Design Document: `/docs/DESIGN.md`
- Studio README: `/studio/README.md`
- Engine README: `/engine/README.md`
- API Documentation: TBD

### Stakeholders
- Product Owner: [Name]
- Engineering Lead: [Name]
- Design Lead: [Name]
- Key Users: Sarah (Research), Mike (Client Success), Alex (Engineering)

### Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-13 | AI Assistant | Initial draft |

---

**Next Steps**: Review this PRD with stakeholders, prioritize features, and proceed with Design Document.
