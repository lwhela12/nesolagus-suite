# Survey Engine

**A customizable conversational survey platform template**

Clone this repository to create your own branded, conversational survey application. Perfect for donor surveys, customer feedback, employee engagement, and more.

## 🎯 What is This?

This is a **template repository** for creating custom conversational surveys. It provides:

- 📋 **14+ Question Types** - Single choice, multiple choice, text, video, ratings, rankings, and more
- 🎨 **Full Branding Control** - Colors, fonts, logos via simple JSON configuration
- 💬 **Conversational UI** - Chat-like interface that feels personal and engaging
- 📊 **Admin Dashboard** - View responses, analytics, and export data
- 🎥 **VideoAsk Integration** - Collect video/audio responses
- 🚀 **Deploy Anywhere** - Vercel, Railway, Docker, or your own infrastructure

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use a hosted service like Neon, Supabase)
- Optional: Redis for session management

### Setup (5 minutes)

```bash
# 1. Clone the repository
git clone <your-repo-url> my-survey
cd my-survey

# 2. Install dependencies
npm run setup

# 3. Customize your survey (choose one option):

# Option A: Interactive Setup Wizard (Recommended for first-time users)
npm run customize

# Option B: Manual Configuration
npm run config:init
# Then edit config/survey.json and config/theme.json

# 4. Add environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your database URL and API keys

# 5. Run database migrations
npm run migrate

# 6. Start development server
npm run dev
```

Your survey will be running at `http://localhost:5173`!

## ⚙️ Configuration

### Survey Configuration (`config/survey.json`)

Define your survey structure, questions, and flow. See `config/survey.example.json` for a complete example.

### Theme Configuration (`config/theme.json`)

Customize your brand colors, fonts, and assets. See `config/theme.example.json` for reference.

```json
{
  "metadata": {
    "name": "My Brand Theme",
    "organizationName": "My Organization"
  },
  "colors": {
    "primary": "#0055A5",
    "secondary": "#B2BB1C"
  },
  "fonts": {
    "primary": "'Inter', sans-serif"
  },
  "assets": {
    "logo": "/assets/logo.png"
  }
}
```

## 🔧 Development Commands

```bash
# Development
npm run dev               # Full stack (Docker)
npm run dev:backend       # Backend only
npm run dev:frontend      # Frontend only

# Configuration
npm run config:init       # Initialize config files
npm run validate          # Validate config files

# Database
npm run migrate           # Run migrations
npm run seed              # Seed test data

# Code quality
npm run lint              # Lint code
npm run typecheck         # Type check
npm run check-all         # Run all checks
```

## 📁 Project Structure

```
survey-engine/
├── config/                  # Configuration files
│   ├── survey.json         # Your survey structure (gitignored)
│   ├── theme.json          # Your branding (gitignored)
│   ├── survey.example.json # Example survey
│   └── theme.example.json  # Example theme
├── public/assets/          # Your logo, favicon, images
├── frontend/               # React frontend
├── backend/                # Express backend
├── scripts/                # Utility scripts
├── examples/               # Example configurations
└── README.md
```

## 🛠️ Built With

- **Frontend:** React 18, TypeScript, Styled Components, Redux Toolkit
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL 15
- **Session Store:** Redis (optional)
- **Auth:** Clerk (for admin)
- **Video:** VideoAsk integration

## 📚 Examples

This repository includes a complete example survey (GHAC Donor Survey) in:
- `config/survey.example.json` - Full conversational survey with 85 blocks
- `config/theme.example.json` - Complete theme configuration

Use these as templates for your own surveys!

## 🚢 Deployment

See `DEPLOYMENT.md` for deployment instructions to Vercel, Railway, or Docker.

## 🎨 Creating Multiple Surveys

**Option A: One repo per survey (Recommended)**
- Clone this template for each new survey
- Independent deployments and complete isolation

**Option B: Branches per survey**
- Create branches for different survey versions
- Deploy each branch separately

---

**Ready to create your survey?** Run `npm run config:init` to get started!