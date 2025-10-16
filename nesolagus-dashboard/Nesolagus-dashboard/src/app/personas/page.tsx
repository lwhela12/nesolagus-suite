'use client'

import { useState } from 'react'
import AppHeader from '@/components/ui/app-header'
import { Heart, Brain, Users2, Sparkles, TrendingUp, DollarSign, MessageCircle, Target, ArrowRight } from 'lucide-react'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={["rounded-2xl border bg-white shadow-sm p-6", className].join(' ')}>{children}</div>
}

// Participant Persona definitions - aligned with archetype names from live data
const personas = [
  {
    id: 'loyal-supporter',
    name: 'Loyal Supporter',
    icon: Heart,
    color: '#64B37A',
    bgColor: '#E6F4EA',
    population: 45,
    description: 'Consistent donors who invest time and resources in local impact and relationships. High passion with variable capacity.',
    avgCapacity: '$250-750',
    keyMotivations: [
      'Direct connection to artists and creative community',
      'Seeing tangible impact of their support',
      'Being part of something bigger than themselves',
      'Experiencing arts as essential to quality of life'
    ],
    engagementPreferences: [
      'Personal stories from artists',
      'Behind-the-scenes access to programs',
      'Invitations to intimate events',
      'Updates showing their gift at work'
    ],
    barriers: [
      'Limited giving capacity despite high passion',
      'Needs clear connection between gift and impact',
      'May have competing arts organizations they support'
    ],
    cultivationStrategy: [
      'Monthly impact stories via email',
      'Exclusive artist meet-and-greets',
      'Volunteer opportunities to deepen connection',
      'Mid-level donor circle (e.g., "Creative Circle" $500+)'
    ],
    successMetrics: [
      'Average gift size: $500-1,000',
      'Retention rate: 75%+',
      'Volunteer participation: 40%',
      'Event attendance: High'
    ],
    sampleNarratives: [
      '"The arts changed my life when I was young. I want every kid to have that experience."',
      '"Hartford\'s creative scene makes this place worth living in. I support what I love."',
      '"When I see local artists thriving, I know my gift matters."'
    ]
  },
  {
    id: 'high-capacity-prospect',
    name: 'High-Capacity Prospect',
    icon: Brain,
    color: '#2F7D52',
    bgColor: '#F0F8F4',
    population: 18,
    description: 'High capacity philanthropists seeking measurable impact and ROI clarity. Strategic thinkers who value data and outcomes.',
    avgCapacity: '$25K+',
    keyMotivations: [
      'Economic development and talent retention',
      'Arts as competitive advantage for region',
      'Measurable community outcomes',
      'Systems-level change and sustainability'
    ],
    engagementPreferences: [
      'Data-driven impact reports',
      'Board or advisory committee roles',
      'Strategic planning involvement',
      'Peer-to-peer cultivation'
    ],
    barriers: [
      'Need clear metrics and outcomes',
      'May see arts as "nice to have" vs essential',
      'Require confidence in organizational capacity',
      'Want assurance their gift will be transformational'
    ],
    cultivationStrategy: [
      'Quarterly data briefings with CEO',
      'Board recruitment pathway',
      'Strategic initiative naming opportunities',
      'Corporate partnership discussions'
    ],
    successMetrics: [
      'Average gift size: $25K-100K+',
      'Board service: 60%',
      'Multi-year commitments: 80%',
      'Corporate matches: High'
    ],
    sampleNarratives: [
      '"If Hartford wants to attract talent, we need a thriving arts scene. This is economic development."',
      '"I want to see how GHAC measures impact. Show me the data, and I\'ll consider a major gift."',
      '"The arts aren\'t charity—they\'re infrastructure. I invest in what makes this region competitive."'
    ]
  },
  {
    id: 'artist-connector',
    name: 'Artist-Connector',
    icon: Users2,
    color: '#86C99B',
    bgColor: '#F6F9F7',
    population: 28,
    description: 'Network influencers with moderate giving capacity but high community connection and advocacy potential.',
    avgCapacity: '$1K-5K',
    keyMotivations: [
      'Regional equity and access for all towns',
      'Building connections across communities',
      'Advocacy and spreading the word',
      'Collective impact and community organizing'
    ],
    engagementPreferences: [
      'Ambassador and referral opportunities',
      'Social media engagement',
      'Hosting house parties or events',
      'Peer-to-peer fundraising'
    ],
    barriers: [
      'Limited individual giving capacity',
      'Competing community commitments',
      'Need low time-commitment options',
      'Want to see GHAC serving their town/community'
    ],
    cultivationStrategy: [
      'Ambassador program launch',
      'Regional expansion updates',
      'Host-a-gathering toolkit',
      'Social media advocacy training'
    ],
    successMetrics: [
      'Average gift size: $1K-2.5K',
      'Referrals generated: 5+ per person',
      'Event hosts: 30%',
      'Social engagement: Very high'
    ],
    sampleNarratives: [
      '"I want my town to benefit from GHAC\'s work, not just Hartford. Equity matters."',
      '"I can\'t give a lot, but I know 50 people who care about the arts. Let me connect you."',
      '"The arts bring us together across lines that usually divide us. That\'s why I give."'
    ]
  },
  {
    id: 'lapsed-donor',
    name: 'Lapsed Donor / Workplace Alumni',
    icon: Sparkles,
    color: '#A9D8B7',
    bgColor: '#FAFCFB',
    population: 23,
    description: 'Lapsed or potential donors—often former workplace campaign participants—who need rekindled connection to arts.',
    avgCapacity: '$500-2K',
    keyMotivations: [
      'Rediscovering connection to arts',
      'Supporting artist livelihoods',
      'New way to engage after life change (career, move, etc.)',
      'Being part of cultural ecosystem evolution'
    ],
    engagementPreferences: [
      'Low-barrier re-entry opportunities',
      'Artist stories and program spotlights',
      '"We miss you" personalized outreach',
      'Easy giving via workplace or online'
    ],
    barriers: [
      'Lost connection when workplace giving ended',
      'Life changes (job, family, move)',
      'Don\'t know current GHAC programs',
      'Need reason to re-engage'
    ],
    cultivationStrategy: [
      'Targeted "Welcome Back" campaign',
      'New employer partnership outreach',
      'Program update series',
      'Low-ask re-entry gift ($100-250)'
    ],
    successMetrics: [
      'Reactivation rate: 25-30%',
      'Average gift size: $750',
      'Retention after reactivation: 60%',
      'Move to Enthusiast segment: 40%'
    ],
    sampleNarratives: [
      '"I used to give through Travelers, but I don\'t even know if GHAC still exists. What\'s new?"',
      '"I love the arts, but life got busy. I\'d give again if someone reminded me why it matters."',
      '"Are there new ways to support artists now? The old model didn\'t feel impactful."'
    ]
  }
]

export default function PersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [showOverview, setShowOverview] = useState(true)

  const totalPopulation = personas.reduce((sum, p) => sum + p.population, 0)

  // If showing overview (landing page)
  if (showOverview) {
    return (
      <section className="p-6 space-y-6">
        <AppHeader
          title="Participant Personas"
          subtitle="From survey voices to cultivation strategies"
        />

        {/* Narrative Introduction */}
        <Card className="border-l-4" style={{ borderColor: '#64B37A' }}>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Who Are Your Participants?</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Through 179 conversations, we heard distinct voices—people with different motivations,
              capacities, and relationships to your mission. These aren't demographic categories.
              <span className="font-semibold text-[#64B37A]"> They're human stories</span>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We've identified <strong>4 participant personas</strong> based on what people told us in their own words.
              Each persona represents a unique pathway for meaningful engagement—not a box to put people in,
              but a lens to understand <em>why they care</em> and <em>how to co-create with them</em>.
            </p>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#64B37A]">{totalPopulation}</div>
                <div className="text-xs text-gray-600">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#64B37A]">4</div>
                <div className="text-xs text-gray-600">Personas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#64B37A]">87</div>
                <div className="text-xs text-gray-600">Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#64B37A]">100%</div>
                <div className="text-xs text-gray-600">Co-Created</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Journey Menu: Choose Your Path */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Choose Your Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Option 1: Explore by Story */}
            <button
              onClick={() => setShowOverview(false)}
              className="text-left rounded-2xl border-2 p-6 hover:shadow-lg transition-all group"
              style={{ borderColor: '#64B37A', backgroundColor: '#F6F9F7' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: '#64B37A' }}>
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-[#64B37A] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Meet the Participants</h4>
              <p className="text-gray-700 leading-relaxed mb-3">
                Start with the human stories. Understand who these people are, what drives them,
                and how they want to engage. Perfect for building empathy and strategy.
              </p>
              <div className="text-sm font-medium text-[#64B37A]">
                Explore All 4 Personas →
              </div>
            </button>

            {/* Option 2: Jump to Data */}
            <a
              href="#data-view"
              onClick={(e) => {
                e.preventDefault()
                setShowOverview(false)
                setTimeout(() => {
                  const element = document.getElementById('persona-grid')
                  element?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="text-left rounded-2xl border-2 p-6 hover:shadow-lg transition-all group"
              style={{ borderColor: '#86C99B', backgroundColor: '#F6F9F7' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: '#86C99B' }}>
                  <Target className="h-8 w-8 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-[#86C99B] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Quick Action Mode</h4>
              <p className="text-gray-700 leading-relaxed mb-3">
                Skip the introduction and dive straight into cultivation strategies, prospect lists,
                and next steps. For when you need to act fast.
              </p>
              <div className="text-sm font-medium" style={{ color: '#86C99B' }}>
                Jump to Persona Grid →
              </div>
            </a>
          </div>
        </div>

        {/* What You'll Find Here */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Find in Each Persona</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#E6F4EA]">
                <MessageCircle className="h-5 w-5 text-[#64B37A]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Their Story</div>
                <div className="text-xs text-gray-600">Motivations, values, and what they told us</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#E6F4EA]">
                <TrendingUp className="h-5 w-5 text-[#64B37A]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Engagement Path</div>
                <div className="text-xs text-gray-600">How they want to connect and contribute</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#E6F4EA]">
                <Target className="h-5 w-5 text-[#64B37A]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Next Steps</div>
                <div className="text-xs text-gray-600">Specific cultivation strategies co-created with them</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#E6F4EA]">
                <Users2 className="h-5 w-5 text-[#64B37A]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Individual Prospects</div>
                <div className="text-xs text-gray-600">Real people with contact info and readiness scores</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#E6F4EA]">
                <MessageCircle className="h-5 w-5 text-[#64B37A]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Email Templates</div>
                <div className="text-xs text-gray-600">Pre-written, persona-specific outreach</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#E6F4EA]">
                <DollarSign className="h-5 w-5 text-[#64B37A]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Success Metrics</div>
                <div className="text-xs text-gray-600">How to measure impact with this group</div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    )
  }

  // Main persona grid view
  return (
    <section className="p-6 space-y-6" id="data-view">
      <div className="flex items-center justify-between">
        <AppHeader
          title="Participant Personas"
          subtitle="Transform survey voices into cultivation strategies"
        />
        <button
          onClick={() => setShowOverview(true)}
          className="px-4 py-2 text-sm rounded-lg border-2 border-[#64B37A] text-[#64B37A] hover:bg-[#E6F4EA] transition-colors"
        >
          ← Back to Overview
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-sm text-gray-600">Total Participants</div>
            <div className="mt-1 text-4xl font-semibold text-gray-900">{totalPopulation}</div>
            <div className="mt-1 text-xs text-gray-500">from survey responses</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-sm text-gray-600">Personas Identified</div>
            <div className="mt-1 text-4xl font-semibold text-[#64B37A]">4</div>
            <div className="mt-1 text-xs text-gray-500">distinct profiles</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-sm text-gray-600">High-Capacity Prospects</div>
            <div className="mt-1 text-4xl font-semibold text-[#2F7D52]">18</div>
            <div className="mt-1 text-xs text-gray-500">High-Capacity Prospect segment</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-sm text-gray-600">Reactivation Targets</div>
            <div className="mt-1 text-4xl font-semibold text-[#A9D8B7]">23</div>
            <div className="mt-1 text-xs text-gray-500">Lapsed Donor segment</div>
          </div>
        </Card>
      </div>

      {/* Persona Overview Grid */}
      <div id="persona-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {personas.map((persona) => {
          const Icon = persona.icon
          return (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(selectedPersona === persona.id ? null : persona.id)}
              className="text-left rounded-xl border-2 p-6 hover:shadow-lg transition-all"
              style={{
                borderColor: persona.color,
                backgroundColor: persona.bgColor
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: persona.color }}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: persona.color }}>{persona.population}</div>
                  <div className="text-xs text-gray-600">donors</div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{persona.name}</h3>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">{persona.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Avg. Capacity:</span>
                <span className="font-semibold" style={{ color: persona.color }}>{persona.avgCapacity}</span>
              </div>
              <div className="mt-3 text-xs font-medium text-center" style={{ color: persona.color }}>
                {selectedPersona === persona.id ? '▲ Hide Details' : '▼ View Deep Dive'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Detailed Persona View */}
      {selectedPersona && (() => {
        const persona = personas.find(p => p.id === selectedPersona)
        if (!persona) return null
        const Icon = persona.icon

        return (
          <Card className="border-2" style={{ borderColor: persona.color }}>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: persona.color }}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{persona.name}</h2>
                  <p className="text-gray-700 leading-relaxed">{persona.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{ color: persona.color }}>{persona.population}</div>
                  <div className="text-sm text-gray-600">donors in segment</div>
                  <div className="text-xs text-gray-500 mt-1">{((persona.population / totalPopulation) * 100).toFixed(1)}% of total</div>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: persona.bgColor }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4" style={{ color: persona.color }} />
                    <span className="text-xs font-semibold text-gray-700">GIVING CAPACITY</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{persona.avgCapacity}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4" style={{ color: persona.color }} />
                    <span className="text-xs font-semibold text-gray-700">CULTIVATION PRIORITY</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: persona.color }}>
                    {persona.id === 'high-capacity-prospect' ? 'HIGHEST' : persona.id === 'lapsed-donor' ? 'HIGH' : 'MEDIUM'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4" style={{ color: persona.color }} />
                    <span className="text-xs font-semibold text-gray-700">ENGAGEMENT READINESS</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {persona.id === 'loyal-supporter' ? '8.5/10' : persona.id === 'high-capacity-prospect' ? '9.2/10' : persona.id === 'artist-connector' ? '7.8/10' : '6.5/10'}
                  </div>
                </div>
              </div>

              {/* Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Key Motivations */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4" style={{ color: persona.color }} />
                      Key Motivations
                    </h3>
                    <ul className="space-y-2">
                      {persona.keyMotivations.map((motivation, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-lg leading-none" style={{ color: persona.color }}>•</span>
                          <span>{motivation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Engagement Preferences */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" style={{ color: persona.color }} />
                      Engagement Preferences
                    </h3>
                    <ul className="space-y-2">
                      {persona.engagementPreferences.map((pref, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-lg leading-none" style={{ color: persona.color }}>•</span>
                          <span>{pref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Barriers */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Barriers to Deepening Support</h3>
                    <ul className="space-y-2">
                      {persona.barriers.map((barrier, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-lg leading-none text-gray-400">⚠</span>
                          <span>{barrier}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Cultivation Strategy */}
                  <div className="rounded-lg border-2 p-4" style={{ borderColor: persona.color, backgroundColor: persona.bgColor }}>
                    <h3 className="font-semibold text-gray-900 mb-3">Recommended Cultivation Strategy</h3>
                    <ul className="space-y-2">
                      {persona.cultivationStrategy.map((strategy, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                          <span className="font-bold" style={{ color: persona.color }}>{i + 1}.</span>
                          <span>{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Success Metrics */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Success Metrics</h3>
                    <div className="space-y-2">
                      {persona.successMetrics.map((metric, i) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 rounded" style={{ backgroundColor: persona.bgColor }}>
                          <span className="text-gray-700">{metric.split(':')[0]}</span>
                          <span className="font-semibold" style={{ color: persona.color }}>{metric.split(':')[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Narratives */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sample Narratives from This Segment</h3>
                <div className="space-y-3">
                  {persona.sampleNarratives.map((narrative, i) => (
                    <div key={i} className="rounded-lg p-4 border-l-4" style={{ borderColor: persona.color, backgroundColor: persona.bgColor }}>
                      <p className="text-sm text-gray-800 italic">{narrative}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <a
                  href={`/api/personas/export?persona=${persona.id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: persona.color }}
                >
                  <Users2 className="h-4 w-4" />
                  Export {persona.name} List
                </a>
                <a
                  href={`/personas/${persona.id}/email`}
                  className="px-4 py-2 rounded-lg text-sm font-medium border-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: persona.color, color: persona.color }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Create Cultivation Email
                </a>
                <a
                  href={`/personas/${persona.id}/prospects`}
                  className="px-4 py-2 rounded-lg text-sm font-medium border-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: persona.color, color: persona.color }}
                >
                  <Target className="h-4 w-4" />
                  View Individual Prospects
                </a>
              </div>
            </div>
          </Card>
        )
      })()}

      {/* Cross-Persona Insights */}
      <Card>
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">Cross-Persona Insights</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4" style={{ backgroundColor: '#F6F9F7', borderColor: '#64B37A' }}>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Universal Motivations</h4>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span>Belief that arts are essential, not luxury</span>
                </li>
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span>Desire to support artist livelihoods</span>
                </li>
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span>Regional pride and talent retention</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4" style={{ backgroundColor: '#F6F9F7', borderColor: '#86C99B' }}>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Segment-Specific Appeals</h4>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span><strong>Loyal Supporter:</strong> Artist stories & impact</span>
                </li>
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span><strong>High-Capacity Prospect:</strong> Data & economic case</span>
                </li>
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span><strong>Artist-Connector:</strong> Equity & access</span>
                </li>
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span><strong>Lapsed Donor:</strong> "Welcome back" & program updates</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4" style={{ backgroundColor: '#F6F9F7', borderColor: '#A9D8B7' }}>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Multi-Persona Households</h4>
              <p className="text-xs text-gray-700 mb-2">Some donors exhibit traits across personas:</p>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span>Loyal Supporter + High-Capacity Prospect (8 donors)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span>Artist-Connector + Lapsed Donor (12 donors)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <div className="rounded-xl p-6 flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: '#E6F4EA', borderLeft: '4px solid #64B37A' }}>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg mb-1">Ready to Act on These Insights?</h4>
          <p className="text-sm text-gray-700">Transform persona intelligence into cultivation moves and targeted communications</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-5 py-3 rounded-lg bg-[#64B37A] text-white hover:bg-[#2F6D49] transition-colors font-medium flex items-center gap-2">
            Download All Persona Reports
            <ArrowRight className="h-4 w-4" />
          </button>
          <button className="px-5 py-3 rounded-lg border-2 border-[#64B37A] text-[#64B37A] hover:bg-[#64B37A] hover:text-white transition-colors font-medium">
            Create Cultivation Calendar
          </button>
        </div>
      </div>
    </section>
  )
}
