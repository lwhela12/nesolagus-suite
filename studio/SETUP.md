# Studio Setup Guide

**Phase 2.1 - Foundation Setup Complete!** ✅

This guide will help you get the Next.js Studio UI up and running.

---

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (local or hosted)
- Anthropic API key (for AI generation)

---

## Installation Steps

### 1. Install Dependencies

```bash
cd studio
npm install
```

This will install:
- Next.js 14
- React 18
- Prisma (PostgreSQL ORM)
- shadcn/ui components (Radix UI + Tailwind CSS)
- Zustand (state management)
- React Hook Form + Zod (forms)
- Vercel Client (deployment)

**Expected time**: 2-3 minutes

---

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required variables**:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/nesolagus_studio"

# Anthropic API (for AI generation)
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-sonnet-4-5"

# Vercel API (for deployment)
VERCEL_API_TOKEN="your-vercel-token"
```

**Optional variables** (Phase 3):
```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

---

### 3. Set Up Database

#### Option A: Local PostgreSQL

```bash
# Start PostgreSQL (if not running)
# macOS with Homebrew:
brew services start postgresql@15

# Create database
createdb nesolagus_studio

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

#### Option B: Hosted Database (Neon, Supabase, etc.)

```bash
# 1. Create database on hosting provider
# 2. Copy connection string to DATABASE_URL in .env
# 3. Run migrations
npx prisma migrate deploy

# 4. Generate Prisma Client
npx prisma generate
```

---

### 4. Start Development Server

```bash
npm run dev
```

The Studio UI will be available at: **http://localhost:3000**

---

## Verify Installation

### Check Homepage

Visit http://localhost:3000 and you should see:
- ✅ Nesolagus Studio homepage
- ✅ Three feature cards (Generate, Preview, Deploy)
- ✅ "Get Started" and "View Clients" buttons
- ✅ "Phase 2: Foundation Setup Complete" message

### Check Database Connection

```bash
# Open Prisma Studio (database GUI)
npx prisma studio
```

This should open http://localhost:5555 showing your database tables:
- `clients`
- `drafts`
- `deployments`
- `users`

---

## Project Structure

```
studio/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   └── ui/                # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── textarea.tsx
│       └── progress.tsx
├── lib/
│   ├── db.ts             # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── src/                   # Existing CLI pipeline (unchanged)
│   ├── pipeline/
│   ├── llm/
│   └── validation/
├── styles/
│   └── globals.css       # Tailwind CSS + theme
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run cli` | Run legacy CLI generator |

---

## Database Commands

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Prisma Client

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Format schema file
npx prisma format
```

### Database GUI

```bash
# Open Prisma Studio
npx prisma studio
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Option 1: Stop other process
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
npm run dev -- -p 3001
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### Prisma Client Not Generated

```bash
# Manually generate client
npx prisma generate

# Check node_modules/@prisma/client exists
ls node_modules/@prisma/client
```

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

Now that Phase 2.1 is complete, you can:

1. **Test the homepage** - Visit http://localhost:3000
2. **Explore Prisma Studio** - Run `npx prisma studio`
3. **Continue to Phase 2.2** - Build the generation UI

### Phase 2.2: Generation UI (Next)

The next phase will add:
- Document upload form
- Generation progress indicator
- Display of generated survey config
- Validation feedback

See `PHASE_2_PLAN.md` for the full roadmap.

---

## Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Phase 2.1 Complete!** ✅

Run `npm install` and `npm run dev` to get started.
