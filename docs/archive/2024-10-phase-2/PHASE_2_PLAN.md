# Phase 2: Studio Web UI - Implementation Plan

**Start Date**: October 13, 2025
**Estimated Duration**: 2-3 weeks
**Status**: Planning

---

## Architecture Decision

### Directory Structure

```
studio/
├── src/                          # Existing CLI pipeline (keep as-is)
│   ├── pipeline/
│   ├── llm/
│   ├── contracts/
│   └── validation/
├── app/                          # NEW: Next.js 14 App Router
│   ├── (auth)/                   # Auth-protected routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Main app routes
│   │   ├── generate/             # Generate survey
│   │   ├── clients/              # Client management
│   │   ├── drafts/               # Draft surveys
│   │   └── deploy/               # Deployment
│   ├── api/                      # API routes
│   │   ├── generate/
│   │   ├── validate/
│   │   └── deploy/
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # NEW: React components
│   ├── generation/
│   ├── preview/
│   ├── editor/
│   ├── deployment/
│   └── ui/                       # shadcn/ui components
├── lib/                          # NEW: Utilities
│   ├── db.ts                     # Prisma client
│   ├── vercel.ts                 # Vercel API
│   └── utils.ts
├── prisma/                       # NEW: Database
│   ├── schema.prisma
│   └── migrations/
├── public/                       # NEW: Static assets
└── styles/                       # NEW: Global styles
```

---

## Phase 2.1: Foundation Setup (Days 1-2)

### Tasks

1. **Initialize Next.js 14**
   - Install Next.js with TypeScript
   - Configure App Router
   - Set up Tailwind CSS

2. **Install Dependencies**
   ```bash
   npm install next@latest react@latest react-dom@latest
   npm install -D typescript @types/react @types/node
   npm install -D tailwindcss postcss autoprefixer
   npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
   npm install zustand
   npm install @prisma/client
   npm install -D prisma
   ```

3. **Configure Prisma**
   - Initialize Prisma (`npx prisma init`)
   - Create database schema (from DESIGN.md)
   - Run initial migration

4. **Set up shadcn/ui**
   - Initialize shadcn/ui
   - Install base components (Button, Input, Card, etc.)

5. **Configure Environment**
   - Set up .env.local
   - Configure database URL
   - Add Anthropic API key

---

## Phase 2.2: Generation UI (Days 3-4)

### Components to Build

1. **GenerationForm** (`components/generation/GenerationForm.tsx`)
   - Client name input
   - Discovery document upload/paste
   - Methodology document upload/paste
   - Parameters editor (duration, tone, segments)
   - Generate button

2. **DocumentUpload** (`components/generation/DocumentUpload.tsx`)
   - Drag-and-drop file upload
   - Paste text area
   - File preview

3. **GenerationProgress** (`components/generation/GenerationProgress.tsx`)
   - Progress indicator
   - Current step display
   - Estimated time remaining
   - Cancel button

4. **GeneratedSurveyView** (`components/generation/GeneratedSurveyView.tsx`)
   - Display generated config
   - Syntax-highlighted JSON
   - Validation status
   - Edit/Deploy buttons

### API Routes

1. **POST /api/generate** (`app/api/generate/route.ts`)
   - Accept form data
   - Run existing pipeline
   - Return draft ID and status

2. **GET /api/drafts/[id]** (`app/api/drafts/[id]/route.ts`)
   - Get draft status
   - Return config and validation results

---

## Phase 2.3: Shared Components Package (Days 5-6)

### Create `packages/survey-components`

```
packages/survey-components/
├── src/
│   ├── blocks/
│   │   ├── TextInputBlock.tsx
│   │   ├── SingleChoiceBlock.tsx
│   │   ├── MultiChoiceBlock.tsx
│   │   ├── ScaleBlock.tsx
│   │   └── ...
│   ├── layouts/
│   │   ├── SurveyLayout.tsx
│   │   └── ProgressBar.tsx
│   ├── preview/
│   │   ├── PreviewProvider.tsx
│   │   └── PreviewRenderer.tsx
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Tasks

1. Extract components from engine/frontend/src/components/Survey/
2. Make components framework-agnostic (work in both engine and studio)
3. Add TypeScript types
4. Create package.json with proper exports
5. Update engine to import from shared package
6. Test in both engine and studio

---

## Phase 2.4: Live Preview (Days 7-9)

### Components to Build

1. **SurveyPreview** (`components/preview/SurveyPreview.tsx`)
   - Split-screen layout
   - Config editor (left)
   - Live preview (right)
   - Uses shared survey-components

2. **PreviewFrame** (`components/preview/PreviewFrame.tsx`)
   - Iframe or direct render
   - Mobile/desktop toggle
   - Zoom controls

3. **DeviceToggle** (`components/preview/DeviceToggle.tsx`)
   - Mobile view (375px)
   - Tablet view (768px)
   - Desktop view (1200px)

4. **TestModeControls** (`components/preview/TestModeControls.tsx`)
   - Start test button
   - Reset button
   - Response viewer
   - Timer display

### Features

- Real-time updates as config changes
- Interactive test mode
- Response logging
- Completion time tracking

---

## Phase 2.5: Visual Editor (Days 10-12)

### Components to Build

1. **BlockList** (`components/editor/BlockList.tsx`)
   - Sortable list of blocks
   - Drag-and-drop reordering
   - Add/remove blocks
   - Block type icons

2. **BlockEditor** (`components/editor/BlockEditor.tsx`)
   - Edit individual block
   - Type-specific forms
   - Validation feedback
   - Preview on right

3. **QuestionEditor** (`components/editor/QuestionEditor.tsx`)
   - Question text editor
   - Placeholder text
   - Required toggle
   - Variable name

4. **OptionsEditor** (`components/editor/OptionsEditor.tsx`)
   - Add/remove options
   - Edit option labels
   - Drag-and-drop reorder
   - Option IDs (auto-generated)

5. **BranchingEditor** (`components/editor/BranchingEditor.tsx`)
   - Visual branching logic
   - Condition builder
   - Target block selector
   - Validation

### Libraries

- `@dnd-kit/core` - Already in engine, reuse for drag-and-drop
- `react-hook-form` - Form management
- `zod` - Validation

---

## Phase 2.6: Deployment Integration (Days 13-14)

### Components to Build

1. **DeployButton** (`components/deployment/DeployButton.tsx`)
   - One-click deploy
   - Environment selector (preview/production)
   - Confirmation modal

2. **DeployModal** (`components/deployment/DeployModal.tsx`)
   - Client slug input
   - Environment variables preview
   - Domain preview
   - Deploy/Cancel buttons

3. **DeploymentStatus** (`components/deployment/DeploymentStatus.tsx`)
   - Progress tracker
   - Build logs
   - Deployment URL
   - Error messages

4. **DeploymentHistory** (`components/deployment/DeploymentHistory.tsx`)
   - List of past deployments
   - Status badges
   - Deployment URLs
   - Rollback button

### API Routes

1. **POST /api/deploy** (`app/api/deploy/route.ts`)
   - Accept deployment params
   - Call Vercel API
   - Return deployment ID

2. **GET /api/deployments/[id]** (`app/api/deployments/[id]/route.ts`)
   - Get deployment status
   - Return URL when ready

### Vercel Integration

- Install `@vercel/client`
- Create `lib/vercel.ts` client wrapper
- Implement deployment methods from DESIGN.md

---

## Tech Stack Summary

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 14 (App Router) | Web application |
| UI Library | shadcn/ui + Radix UI | Components |
| Styling | Tailwind CSS | Utility-first CSS |
| State | Zustand | Client state management |
| Database | PostgreSQL | Data persistence |
| ORM | Prisma | Type-safe database access |
| Auth | Clerk (Phase 3) | Authentication |
| Deployment | Vercel | Hosting |
| Drag-Drop | @dnd-kit/core | Reordering blocks |
| Forms | react-hook-form + zod | Form handling |

---

## Database Schema (Prisma)

```prisma
// See DESIGN.md Section 3.2 for full schema
// Key models:
// - Client
// - Draft
// - Deployment
// - User (Phase 3)
```

---

## API Routes Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/generate | Generate survey from docs |
| GET | /api/drafts/:id | Get draft details |
| PUT | /api/drafts/:id | Update draft config |
| POST | /api/validate | Validate config |
| POST | /api/deploy | Deploy to Vercel |
| GET | /api/deployments/:id | Get deployment status |
| GET | /api/clients | List all clients |
| POST | /api/clients | Create new client |

---

## Success Criteria

### Phase 2.1
- [x] Next.js app runs successfully
- [x] Prisma connected to database
- [x] shadcn/ui components working
- [x] Basic layout renders

### Phase 2.2
- [ ] Can upload discovery/methodology docs
- [ ] Generation triggers successfully
- [ ] Config displays after generation
- [ ] Validation shows errors/warnings

### Phase 2.3
- [ ] Shared components extracted
- [ ] Engine still works with shared components
- [ ] Studio can render survey preview

### Phase 2.4
- [ ] Live preview updates in real-time
- [ ] Can test survey interactively
- [ ] Mobile/desktop toggle works
- [ ] Preview matches engine 100%

### Phase 2.5
- [ ] Can edit questions visually
- [ ] Can reorder blocks via drag-drop
- [ ] Can edit branching logic
- [ ] Changes reflect in preview immediately

### Phase 2.6
- [ ] One-click deploy to Vercel works
- [ ] Deployment status tracking works
- [ ] Can access deployed survey
- [ ] Deployment history displays

---

## Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| Week 1 (Days 1-5) | Foundation + Generation UI + Shared Components | Working generation form, shared package created |
| Week 2 (Days 6-10) | Live Preview + Visual Editor | Interactive preview, basic editor |
| Week 3 (Days 11-14) | Editor Polish + Deployment | Full editor, one-click deploy |

---

## Open Questions

1. **Authentication**: Implement in Phase 2 or Phase 3?
   - **Decision**: Phase 3 (focus on core features first)

2. **Database**: Local PostgreSQL or hosted (Neon/Supabase)?
   - **Decision**: Local for dev, hosted for production

3. **File Storage**: Where to store uploaded discovery docs?
   - **Decision**: Database (as text) for simplicity, can migrate to S3 later

4. **Shared Components**: Publish as npm package or monorepo package?
   - **Decision**: Monorepo package (simpler for now)

---

## Next Steps

1. Run `npm install` commands for Next.js and dependencies
2. Initialize Prisma with schema
3. Create basic Next.js app structure
4. Build first component (GenerationForm)
5. Test end-to-end generation flow

---

**Ready to begin!** 🚀
