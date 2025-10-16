# Nesolagus Dual Dashboard Strategy
**Building Both Client-Specific & Universal Platform**

Date: October 12, 2025
Status: Strategic Planning Document

---

## The Challenge

We need:
1. **GHAC Dashboard** - Highly customized for donor engagement, arts sector, immediate client needs
2. **Universal Platform** - Industry-agnostic, modular, scalable for Education, Nonprofits, Cities, Political Campaigns

---

## Solution: Modular Architecture with Configuration Layers

### Core Concept: One Codebase, Multiple Personalities

```
NESOLAGUS PLATFORM (Universal Core)
├── Shared Components & Infrastructure
│   ├── Survey data ingestion
│   ├── Visualization components
│   ├── Analytics engine
│   ├── Authentication & permissions
│   └── Export & reporting tools
│
├── Configuration Layer (JSON-driven)
│   ├── Client branding
│   ├── Terminology mapping
│   ├── Feature toggles
│   ├── Custom data schemas
│   └── Industry-specific modules
│
└── Client Instances
    ├── GHAC (Arts/Donor Engagement)
    ├── School District (Education)
    ├── City Government (Civic Engagement)
    └── Campaign (Political)
```

---

## Universal Dashboard Architecture

### Core Pages (Industry-Agnostic)

#### 1. **PROJECT OVERVIEW**
*Translates to any industry*

| Element | Universal Label | GHAC Version | School Version | City Version |
|---------|----------------|--------------|----------------|--------------|
| Main metric | Survey Starts | Survey Starts | Student Responses | Resident Responses |
| Completion | Completion Rate | Completion Rate | Participation Rate | Engagement Rate |
| Segments | Participant Types | Donor Personas | Student Cohorts | Resident Segments |
| Engagement | Action Pathways | Board/Volunteer/Give | Leadership/Clubs/Tutoring | Committees/Vote/Advocate |

**Configuration File**: `client.config.json`
```json
{
  "terminology": {
    "participant": "donor",
    "segments": "personas",
    "actions": ["board service", "volunteering", "giving", "ambassadorship"]
  }
}
```

#### 2. **PARTICIPANT INSIGHTS** (Universal)
*Replaces "Donor Personas"*

**Core Structure** (works for any industry):
```
SEGMENT CARDS
├── Segment Name (configurable)
├── Population Size
├── Key Characteristics
├── Motivations
├── Engagement Preferences
├── Recommended Actions
└── Success Stories

CONFIGURABLE FIELDS:
├── Capacity Indicator ($$$ for donors, Time for volunteers, Influence for advocates)
├── Engagement Score
├── Segment-Specific Metrics
└── Custom Attributes
```

**Examples Across Industries**:

| Industry | Segment Names | Capacity Metric | Actions |
|----------|--------------|-----------------|---------|
| **Arts/Nonprofit** | Enthusiast, Strategist, Community Builder | Giving Capacity | Board, Donate, Volunteer |
| **Education** | Engaged Parent, Advocate, Supporter | Time Availability | PTA, Tutoring, Fundraising |
| **Political** | Base Voter, Swing, Influencer | Network Size | Canvass, Donate, Host |
| **Civic** | Active Citizen, Observer, Skeptic | Participation Level | Committee, Vote, Forum |

#### 3. **ENGAGEMENT OPPORTUNITIES** (Universal)
*Pipeline of actionable insights*

**Universal Structure**:
```
HIGH-VALUE ACTIONS
├── Leadership Pipeline (Board/Committee/Advisory)
├── Active Contribution (Volunteer/Advocate/Participate)
├── Financial Support (Donate/Sponsor/Fund)
└── Network Activation (Ambassador/Referral/Influence)

Each showing:
├── # Identified
├── Readiness Score
├── Next Steps
└── Expected Conversion
```

**Configuration**: Define what "high-value" means per industry
```json
{
  "engagementTypes": [
    {
      "id": "leadership",
      "label": "Board Service",
      "description": "Prospects ready for governance role",
      "criteria": ["capacity>$25k", "expressed_interest=true"],
      "priority": 1
    },
    {
      "id": "advocacy",
      "label": "Arts Ambassadors",
      "description": "Network influencers",
      "criteria": ["network_size>100", "passion_score>8"],
      "priority": 2
    }
  ]
}
```

#### 4. **REACTIVATION & RETENTION** (Universal)
*Bringing back lapsed participants*

**Universal Segments**:
- **Recently Lapsed** (3-12 months inactive)
- **Long-Term Lapsed** (1-5 years inactive)
- **One-Time Participants** (Never returned)
- **At-Risk Active** (Declining engagement)

**Configurable by Industry**:
| Industry | "Lapsed" Definition | Reactivation Strategy |
|----------|--------------------|-----------------------|
| Donor | No gift in 18 months | "We miss you" + impact update |
| Voter | Didn't vote last cycle | "Your voice matters" + registration |
| Parent | No event attendance 1 year | "What's changed?" survey + open house |
| Resident | No civic engagement | "We need your input" + town hall invite |

#### 5. **MESSAGE TESTING & RESONANCE** (Universal)
*What stories work for which segments?*

**Core Analysis** (applies everywhere):
```
MESSAGE FRAMEWORKS TESTED
├── Frame A vs Frame B
│   ├── Resonance by segment
│   ├── Language patterns
│   ├── Emotional triggers
│   └── Action correlation
│
├── Channel Effectiveness
│   ├── Email vs Social vs In-Person
│   ├── By segment preference
│   └── By message type
│
└── Narrative Themes
    ├── Top performing stories
    ├── Segment-specific examples
    └── Recommended messaging guide
```

**Examples**:
- **Nonprofit**: Individual impact vs Collective good
- **Education**: Student achievement vs Community benefit
- **Political**: Personal story vs Policy position
- **Civic**: Economic development vs Quality of life

#### 6. **STRATEGIC ROADMAP** (Universal Template)
*Customizable by industry but same structure*

**Universal Sections**:
```
TAB 1: CULTIVATION/ENGAGEMENT PLAN
├── 0-3 Months: Quick Wins
├── 3-6 Months: Build Relationships
├── 6-12 Months: Scale Success
└── 12-18 Months: Sustain & Measure

TAB 2: ORGANIZATIONAL GOALS
├── Mission Evolution
├── Program Expansion
├── Capacity Building
└── Partnership Development

TAB 3: HIGH-VALUE PIPELINE
├── By Stage (Suspect → Prospect → Active → Leader)
├── Moves Management Calendar
├── Resource Requirements
└── Success Metrics

TAB 4: MEASUREMENT FRAMEWORK
├── KPIs by Objective
├── Dashboard Updates
├── Reporting Templates
└── ROI Projections
```

**Configuration**: Industry-specific labels and content
```json
{
  "roadmap": {
    "tab1_title": "Donor Cultivation Roadmap",
    "tab2_title": "GHAC Transformation",
    "tab3_title": "Major Gift Pipeline",
    "quickWins": [
      "Reactivate top 20 lapsed donors",
      "Launch board prospect cultivation",
      "Test new messaging in fall appeal"
    ]
  }
}
```

---

## Implementation Strategy

### Phase 1: Extract Universal Core (2-3 weeks)

**Step 1**: Identify what's truly universal
- Survey completion metrics ✓
- Participant segmentation engine ✓
- Narrative analysis tools ✓
- Visualization components ✓
- Geographic distribution ✓

**Step 2**: Create abstraction layer
```typescript
// Universal data schema
interface Participant {
  id: string
  segment: string
  engagementScore: number
  capacity: CapacityMetric  // $ or Time or Influence
  interests: string[]
  readiness: Record<ActionType, number>
  demographis: Record<string, any>
}

interface ClientConfig {
  terminology: TerminologyMap
  segments: SegmentDefinition[]
  actions: ActionDefinition[]
  metrics: MetricDefinition[]
  branding: BrandingConfig
}
```

**Step 3**: Refactor existing code
- Move GHAC-specific content to config files
- Replace hardcoded labels with `config.terminology.X`
- Make components accept configuration props

### Phase 2: Build GHAC-Specific Layer (1 week)

**Create**: `/configs/clients/ghac.config.json`

```json
{
  "client": {
    "id": "ghac",
    "name": "Greater Hartford Arts Council",
    "industry": "arts",
    "logo": "/logos/ghac-logo-bug.png",
    "colors": {
      "primary": "#64B37A",
      "secondary": "#2F6D49"
    }
  },
  "terminology": {
    "participant": "donor",
    "segments": "donor personas",
    "engagement": "cultivation",
    "conversion": "gift",
    "highValue": "major donor"
  },
  "segments": [
    {
      "id": "enthusiast",
      "name": "The Enthusiast",
      "description": "High passion, variable capacity",
      "icon": "heart",
      "color": "#64B37A"
    },
    {
      "id": "strategist",
      "name": "The Strategist",
      "description": "High capacity, needs ROI clarity",
      "icon": "brain",
      "color": "#2F6D49"
    }
  ],
  "actions": [
    {
      "id": "board",
      "label": "Board Service",
      "description": "Governance and strategic leadership",
      "priority": 1
    },
    {
      "id": "volunteer",
      "label": "Volunteer",
      "description": "Hands-on program support",
      "priority": 2
    },
    {
      "id": "major_gift",
      "label": "Major Gift ($25K+)",
      "description": "Transformational philanthropic support",
      "priority": 1
    }
  ],
  "roadmap": {
    "sections": [
      {
        "id": "cultivation",
        "title": "Donor Cultivation Roadmap",
        "description": "12-month plan to deepen donor relationships"
      },
      {
        "id": "transformation",
        "title": "From Pass-Through to Catalyst",
        "description": "GHAC's organizational evolution"
      }
    ]
  }
}
```

**Create**: `/configs/clients/ghac-content.md`
```markdown
# GHAC-Specific Strategic Content

## Organizational Context
- 23,000 donor database
- Serving Greater Hartford + 34 towns
- Shift from "pass-through funder" to "active catalyst"
- Recent workplace giving decline (Travelers)

## Key Initiatives
- Street Stages ($200/hour artist payments)
- Skills Development Series
- Regional expansion for equity
- Multi-generational artist incubators

## Success Stories
[Specific GHAC narratives and case studies]
```

### Phase 3: Create Universal Templates (2-3 weeks)

**Build**: Template configs for each industry

#### `/configs/templates/education.config.json`
```json
{
  "industry": "education",
  "terminology": {
    "participant": "family",
    "segments": "parent types",
    "engagement": "involvement",
    "conversion": "active participation"
  },
  "segments": [
    {
      "id": "engaged_parent",
      "name": "Engaged Parent",
      "description": "Highly involved in student success"
    },
    {
      "id": "advocate",
      "name": "Education Advocate",
      "description": "Policy-focused, systems-level thinking"
    }
  ],
  "actions": [
    {"id": "pta", "label": "PTA Leadership"},
    {"id": "tutoring", "label": "Tutoring/Mentoring"},
    {"id": "fundraising", "label": "Fundraising Support"}
  ]
}
```

#### `/configs/templates/civic.config.json`
```json
{
  "industry": "civic",
  "terminology": {
    "participant": "resident",
    "segments": "citizen types",
    "engagement": "civic participation",
    "conversion": "active citizenship"
  },
  "segments": [
    {"id": "active", "name": "Active Citizen"},
    {"id": "observer", "name": "Engaged Observer"},
    {"id": "skeptic", "name": "Constructive Skeptic"}
  ],
  "actions": [
    {"id": "committee", "label": "Committee Service"},
    {"id": "forum", "label": "Town Hall Participation"},
    {"id": "advocacy", "label": "Policy Advocacy"}
  ]
}
```

#### `/configs/templates/campaign.config.json`
```json
{
  "industry": "political",
  "terminology": {
    "participant": "supporter",
    "segments": "voter types",
    "engagement": "campaign involvement",
    "conversion": "committed supporter"
  },
  "segments": [
    {"id": "base", "name": "Base Voter"},
    {"id": "swing", "name": "Persuadable"},
    {"id": "influencer", "name": "Community Leader"}
  ],
  "actions": [
    {"id": "canvass", "label": "Door Knocking"},
    {"id": "donate", "label": "Financial Contribution"},
    {"id": "host", "label": "Event Hosting"}
  ]
}
```

### Phase 4: Multi-Tenant Platform Architecture (3-4 weeks)

**Option A: Subdomain-Based** (Recommended for SaaS)
```
ghac.nesolagus.com    → Loads ghac.config.json
hartford.nesolagus.com → Loads hartford.config.json
acme-school.nesolagus.com → Loads acme-school.config.json
```

**Option B: Path-Based** (Good for single deployment)
```
nesolagus.com/ghac
nesolagus.com/hartford
nesolagus.com/acme-school
```

**Implementation**:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const subdomain = hostname?.split('.')[0]

  // Load client config
  const config = await loadClientConfig(subdomain)

  // Pass to all pages via header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-client-config', JSON.stringify(config))

  return NextResponse.next({
    request: { headers: requestHeaders }
  })
}
```

---

## Universal Component Library

### Build Reusable, Configurable Components

#### 1. **SegmentCard Component**
```tsx
interface SegmentCardProps {
  segment: SegmentDefinition
  population: number
  metrics: Record<string, any>
  capacityType: 'financial' | 'time' | 'influence'
  config: ClientConfig
}

export function SegmentCard({ segment, population, metrics, capacityType, config }: SegmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <Icon name={segment.icon} color={segment.color} />
        <h3>{segment.name}</h3>
      </CardHeader>
      <CardBody>
        <Stat label="Population" value={population} />
        {capacityType === 'financial' && <Stat label="Avg Capacity" value={metrics.avgCapacity} format="currency" />}
        {capacityType === 'time' && <Stat label="Availability" value={metrics.timeAvailable} format="hours" />}
        {capacityType === 'influence' && <Stat label="Network Size" value={metrics.networkSize} />}

        <Section title="Key Motivations">
          <ul>{segment.motivations.map(m => <li key={m}>{m}</li>)}</ul>
        </Section>

        <Section title={`Recommended ${config.terminology.actions}`}>
          <ActionList segment={segment} config={config} />
        </Section>
      </CardBody>
    </Card>
  )
}
```

#### 2. **EngagementPipeline Component**
```tsx
interface EngagementPipelineProps {
  actions: ActionDefinition[]
  participants: Participant[]
  config: ClientConfig
}

export function EngagementPipeline({ actions, participants, config }: EngagementPipelineProps) {
  return (
    <div className="pipeline-grid">
      {actions.map(action => {
        const eligible = participants.filter(p => p.readiness[action.id] > 0.7)
        return (
          <PipelineCard
            key={action.id}
            title={action.label}
            count={eligible.length}
            priority={action.priority}
            nextSteps={generateNextSteps(action, eligible, config)}
          />
        )
      })}
    </div>
  )
}
```

#### 3. **MessageResonance Component**
```tsx
interface MessageResonanceProps {
  narratives: Narrative[]
  segments: SegmentDefinition[]
  frameworks: MessageFramework[]
  config: ClientConfig
}

export function MessageResonance({ narratives, segments, frameworks, config }: MessageResonanceProps) {
  // Analyze narrative sentiment and themes by segment
  // Show which message frames resonate with which segments
  // Display as heatmap or comparison chart

  return (
    <Card title="Message Testing Results">
      <FrameworkComparison frameworks={frameworks} segments={segments} />
      <SegmentPreferences segments={segments} narratives={narratives} />
      <RecommendedMessaging config={config} insights={analysis} />
    </Card>
  )
}
```

---

## File Structure for Dual Strategy

```
nesolagus-dashboard/
├── src/
│   ├── app/
│   │   ├── [client]/                    ← Multi-tenant routing
│   │   │   ├── overview/
│   │   │   ├── insights/
│   │   │   ├── engagement/
│   │   │   ├── reactivation/
│   │   │   ├── messages/
│   │   │   └── roadmap/
│   │   └── api/
│   │       └── [...universal APIs]
│   │
│   ├── components/
│   │   ├── universal/                   ← Industry-agnostic
│   │   │   ├── SegmentCard.tsx
│   │   │   ├── EngagementPipeline.tsx
│   │   │   ├── MessageResonance.tsx
│   │   │   └── StrategicRoadmap.tsx
│   │   └── client-specific/             ← Customizations
│   │       └── ghac/
│   │           └── GHACTransformationStory.tsx
│   │
│   ├── lib/
│   │   ├── config/
│   │   │   └── loader.ts                ← Config loading logic
│   │   └── analytics/
│   │       └── universal-engine.ts      ← Core analytics
│   │
│   └── configs/
│       ├── clients/                      ← Active clients
│       │   ├── ghac.config.json
│       │   ├── ghac-content.md
│       │   └── [other-clients].config.json
│       │
│       └── templates/                    ← Industry templates
│           ├── arts-nonprofit.config.json
│           ├── education.config.json
│           ├── civic.config.json
│           └── campaign.config.json
│
└── docs/
    ├── GHAC_SPECIFIC_ANALYSIS.md        ← Client deliverable
    ├── UNIVERSAL_PLATFORM_GUIDE.md      ← Sales/onboarding doc
    └── CLIENT_CONFIGURATION_GUIDE.md    ← How to set up new client
```

---

## Immediate Action Plan

### Week 1: Foundation
- [ ] Create configuration schema (TypeScript interfaces)
- [ ] Build config loader utility
- [ ] Extract GHAC-specific content to config files
- [ ] Create universal component library (start with 3 core components)

### Week 2: GHAC Customization
- [ ] Implement all GHAC-specific recommendations from analysis
- [ ] Build "Donor Personas" page (GHAC version)
- [ ] Build "Engagement Opportunities" section
- [ ] Build "Reactivation Dashboard"
- [ ] Rebuild "Strategic Roadmap" with GHAC content

### Week 3: Universal Templates
- [ ] Create education template config
- [ ] Create civic engagement template config
- [ ] Create political campaign template config
- [ ] Build template preview/demo mode

### Week 4: Documentation & Polish
- [ ] Write "Client Configuration Guide"
- [ ] Create "Universal Platform Overview" (sales doc)
- [ ] Build config validation tools
- [ ] Set up demo instances for each industry

---

## Sales & Marketing Strategy

### Two Product Tiers

#### Tier 1: **Nesolagus Insights** (Base Platform)
- Universal dashboard
- Standard industry templates
- Self-service configuration
- **Price**: $5K-$10K setup + $500-1K/mo hosting

#### Tier 2: **Nesolagus Intelligence** (Custom)
- Everything in Tier 1
- Custom configuration & content
- Strategic analysis & recommendations
- Ongoing optimization
- **Price**: $15K-$25K setup + $1.5K-3K/mo

### Case Study Power

**GHAC becomes the showcase**:
- "See how GHAC transformed donor relationships"
- "From 179 anonymous transactions to strategic cultivation"
- "Arts sector innovation, applicable to any industry"

**Demo Instances**:
- `ghac.nesolagus.com` (live client)
- `demo-education.nesolagus.com` (school district simulation)
- `demo-civic.nesolagus.com` (city government simulation)
- `demo-campaign.nesolagus.com` (political campaign simulation)

---

## Next Steps for YOU

**Decision Points**:

1. **Prioritize GHAC completion first?** (My recommendation: YES)
   - Finish their specific dashboard
   - Document the process
   - Use as template for universal platform

2. **Build universal platform alongside or after?**
   - Alongside: Slower but more thoughtful
   - After: Faster for GHAC, more refactoring later

3. **Which industry templates to build first?**
   - Education (biggest market)
   - Civic (government RFPs)
   - Both?

4. **Multi-tenant architecture now or later?**
   - Now: More upfront work, scales better
   - Later: Ship GHAC faster, refactor for scale

**My Recommendation**:
1. **This week**: Finish GHAC-specific implementations (4-5 days)
2. **Next week**: Extract universal core while it's fresh (3-4 days)
3. **Week after**: Build 2 template configs (education + civic) (4-5 days)
4. **Week 4**: Documentation + demo instances (3-5 days)

This gives you:
- ✅ Happy GHAC client with complete, strategic dashboard
- ✅ Reusable platform for next client
- ✅ Demo-ready instances for sales
- ✅ Clear productization path

---

**Status**: Ready for your strategic direction
**Next Action**: Which path do you want to pursue first?
