'use client'

import { useState, use } from 'react'
import AppHeader from '@/components/ui/app-header'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, TrendingUp, DollarSign, Target, MessageSquare, Download, Filter } from 'lucide-react'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={["rounded-2xl border bg-white shadow-sm p-6", className].join(' ')}>{children}</div>
}

// Mock prospect data - matches the export API
const prospectData: Record<string, any[]> = {
  'strategist': [
    {
      id: '1',
      name: 'Robert Chen',
      email: 'rchen@example.com',
      capacity: '$50,000',
      readiness: 9.5,
      phone: '(860) 555-0123',
      lastContact: '2025-09-15',
      notes: 'Board interested, requested data briefing',
      archetype: 'Strategic Donor',
      archetypeMatch: 95,
      nextSteps: ['Schedule CEO briefing', 'Share 3-year strategic plan', 'Invite to board observation'],
      interests: ['Economic Development', 'Data & Metrics', 'Strategic Planning'],
      givingHistory: [
        { year: 2024, amount: 10000, campaign: 'Annual Fund' },
        { year: 2023, amount: 8000, campaign: 'Annual Fund' },
        { year: 2022, amount: 5000, campaign: 'First Gift' }
      ]
    },
    {
      id: '2',
      name: 'Elizabeth Morrison',
      email: 'emorrison@example.com',
      capacity: '$75,000',
      readiness: 9.8,
      phone: '(860) 555-0124',
      lastContact: '2025-09-20',
      notes: 'Corporate match available, strategic initiative interest',
      archetype: 'Strategic Donor',
      archetypeMatch: 98,
      nextSteps: ['Discuss naming opportunity', 'Arrange corporate partnership meeting', 'Multi-year pledge proposal'],
      interests: ['Corporate Partnerships', 'Transformational Gifts', 'ROI & Impact'],
      givingHistory: [
        { year: 2024, amount: 25000, campaign: 'Street Stages Initiative' },
        { year: 2023, amount: 15000, campaign: 'Annual Fund' }
      ]
    },
    {
      id: '3',
      name: 'David Park',
      email: 'dpark@example.com',
      capacity: '$35,000',
      readiness: 8.9,
      phone: '(860) 555-0125',
      lastContact: '2025-08-30',
      notes: 'CEO peer-to-peer recommended',
      archetype: 'Strategic Donor',
      archetypeMatch: 89,
      nextSteps: ['Peer-to-peer lunch with CEO', 'Share board recruitment materials', 'Site visit to artist studios'],
      interests: ['Leadership', 'Talent Retention', 'Regional Growth'],
      givingHistory: [
        { year: 2024, amount: 12000, campaign: 'Annual Fund' },
        { year: 2023, amount: 10000, campaign: 'Annual Fund' }
      ]
    }
  ],
  'enthusiast': [
    {
      id: '11',
      name: 'Maria Garcia',
      email: 'mgarcia@example.com',
      capacity: '$750',
      readiness: 8.5,
      phone: '(860) 555-0201',
      lastContact: '2025-09-18',
      notes: 'Artist connection strong, volunteer interest',
      archetype: 'Creative Enthusiast',
      archetypeMatch: 92,
      nextSteps: ['Invite to artist meet-and-greet', 'Volunteer opportunity match', 'Creative Circle ask'],
      interests: ['Artist Support', 'Behind-the-Scenes Access', 'Volunteering'],
      givingHistory: [
        { year: 2024, amount: 500, campaign: 'Monthly Giving' },
        { year: 2023, amount: 400, campaign: 'Annual Fund' }
      ]
    },
    {
      id: '12',
      name: 'Thomas Wright',
      email: 'twright@example.com',
      capacity: '$500',
      readiness: 8.2,
      phone: '(860) 555-0202',
      lastContact: '2025-09-12',
      notes: 'Behind-the-scenes access motivates',
      archetype: 'Creative Enthusiast',
      archetypeMatch: 88,
      nextSteps: ['VIP event invitation', 'Program impact update', 'Monthly donor upgrade'],
      interests: ['Artist Stories', 'Program Impact', 'Exclusive Events'],
      givingHistory: [
        { year: 2024, amount: 300, campaign: 'Annual Fund' },
        { year: 2023, amount: 250, campaign: 'Annual Fund' }
      ]
    }
  ],
  'community-builder': [
    {
      id: '21',
      name: 'Christopher Davis',
      email: 'cdavis@example.com',
      capacity: '$2,500',
      readiness: 7.8,
      phone: '(860) 555-0301',
      lastContact: '2025-09-22',
      notes: 'Ambassador program interest, large network',
      archetype: 'Community Connector',
      archetypeMatch: 91,
      nextSteps: ['Ambassador program invitation', 'Provide referral toolkit', 'House party host ask'],
      interests: ['Networking', 'Advocacy', 'Regional Equity'],
      givingHistory: [
        { year: 2024, amount: 2000, campaign: 'Annual Fund' },
        { year: 2023, amount: 1500, campaign: 'Annual Fund' }
      ]
    }
  ],
  'creative-mind': [
    {
      id: '31',
      name: 'Rebecca White',
      email: 'rwhite@example.com',
      capacity: '$750',
      readiness: 6.5,
      phone: '(860) 555-0401',
      lastContact: '2023-12-15',
      notes: 'Former Travelers donor, lapsed 18 months',
      archetype: 'Lapsed Supporter',
      archetypeMatch: 73,
      nextSteps: ['Welcome back email', 'Program update call', 'Low-barrier reentry gift ask ($100)'],
      interests: ['Workplace Giving', 'Program Updates', 'Reconnection'],
      givingHistory: [
        { year: 2023, amount: 500, campaign: 'Workplace Giving (Travelers)' },
        { year: 2022, amount: 500, campaign: 'Workplace Giving (Travelers)' }
      ]
    }
  ]
}

const personaConfig: Record<string, any> = {
  'strategist': { name: 'The Strategist', color: '#2F6D49', bgColor: '#F0F8F4' },
  'enthusiast': { name: 'The Enthusiast', color: '#64B37A', bgColor: '#E6F4EA' },
  'community-builder': { name: 'The Community Builder', color: '#86C99B', bgColor: '#F6F9F7' },
  'creative-mind': { name: 'The Creative Mind', color: '#A9D8B7', bgColor: '#FAFCFB' }
}

export default function IndividualProspectsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedProspect, setSelectedProspect] = useState<any>(null)
  const [filterReadiness, setFilterReadiness] = useState<'all' | 'high' | 'medium'>('all')

  const prospects = prospectData[id] || []
  const persona = personaConfig[id] || { name: 'Unknown', color: '#64B37A', bgColor: '#E6F4EA' }

  const filteredProspects = prospects.filter(p => {
    if (filterReadiness === 'high') return p.readiness >= 9.0
    if (filterReadiness === 'medium') return p.readiness >= 7.0 && p.readiness < 9.0
    return true
  })

  const handleExport = () => {
    window.open(`/api/personas/export?persona=${id}`, '_blank')
  }

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/personas"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <AppHeader
          title={`${persona.name} Prospects`}
          subtitle="Individual donor profiles with cultivation recommendations"
        />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-sm text-gray-600">Total Prospects</div>
            <div className="mt-1 text-4xl font-semibold" style={{ color: persona.color }}>{prospects.length}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-sm text-gray-600">High Readiness (9.0+)</div>
            <div className="mt-1 text-4xl font-semibold text-gray-900">
              {prospects.filter(p => p.readiness >= 9.0).length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-sm text-gray-600">Avg. Capacity</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {id === 'strategist' ? '$50K+' : id === 'community-builder' ? '$2K' : id === 'enthusiast' ? '$700' : '$750'}
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-sm text-gray-600">Archetype Match</div>
            <div className="mt-1 text-2xl font-semibold" style={{ color: persona.color }}>
              {Math.round(prospects.reduce((sum, p) => sum + p.archetypeMatch, 0) / prospects.length)}%
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-600" />
          <select
            value={filterReadiness}
            onChange={(e) => setFilterReadiness(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Readiness Levels</option>
            <option value="high">High Readiness (9.0+)</option>
            <option value="medium">Medium Readiness (7.0-8.9)</option>
          </select>
          <span className="text-sm text-gray-600">{filteredProspects.length} prospects</span>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: persona.color }}
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </button>
      </div>

      {/* Prospect Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProspects.map(prospect => (
          <Card
            key={prospect.id}
            className="border-l-4 cursor-pointer hover:shadow-md transition-all"
            style={{ borderColor: persona.color }}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{prospect.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: persona.bgColor, color: persona.color }}>
                      {prospect.archetype}
                    </span>
                    <span className="text-xs text-gray-600">{prospect.archetypeMatch}% match</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: persona.color }}>
                    {prospect.readiness.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Readiness</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{prospect.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-3 w-3" />
                  <span>{prospect.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="h-3 w-3" />
                  <span>Capacity: {prospect.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-3 w-3" />
                  <span>Last: {prospect.lastContact}</span>
                </div>
              </div>

              {/* Interests */}
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">KEY INTERESTS</div>
                <div className="flex flex-wrap gap-1">
                  {prospect.interests.map((interest: string, i: number) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">RECOMMENDED NEXT STEPS</div>
                <ul className="space-y-1">
                  {prospect.nextSteps.map((step: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                      <span style={{ color: persona.color }}>•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Notes */}
              <div className="rounded p-2 text-xs" style={{ backgroundColor: persona.bgColor }}>
                <strong className="text-gray-900">Notes: </strong>
                <span className="text-gray-700">{prospect.notes}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() => setSelectedProspect(prospect)}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: persona.color, color: persona.color }}
                >
                  <Target className="h-3 w-3 inline mr-1" />
                  View Full Profile
                </button>
                <button className="flex-1 px-3 py-2 text-xs font-medium rounded-lg text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: persona.color }}>
                  <MessageSquare className="h-3 w-3 inline mr-1" />
                  Create Email
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Full Profile Modal - Cultivation Strategy Focus */}
      {selectedProspect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setSelectedProspect(null)}>
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              {/* Header - More Human */}
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProspect.name}</h2>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full" style={{ backgroundColor: persona.bgColor, color: persona.color }}>
                      {selectedProspect.archetype}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-700">{selectedProspect.archetypeMatch}% archetype match</span>
                    <span className="text-gray-600">•</span>
                    <span className="font-semibold" style={{ color: persona.color }}>{selectedProspect.readiness.toFixed(1)}/10 readiness</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProspect(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Cultivation Notes - Narrative Focus */}
              <div className="rounded-xl p-5" style={{ backgroundColor: persona.bgColor, borderLeft: `4px solid ${persona.color}` }}>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" style={{ color: persona.color }} />
                  From the Survey Conversation
                </h3>
                <p className="text-gray-800 leading-relaxed mb-3">{selectedProspect.notes}</p>
                <div className="text-sm text-gray-700">
                  <strong>What this means:</strong> They're ready for {selectedProspect.readiness >= 9.0 ? 'immediate' : selectedProspect.readiness >= 7.0 ? 'near-term' : 'cultivation-focused'} engagement.
                </div>
              </div>

              {/* Relationship Journey */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Relationship Journey</h3>
                <div className="space-y-3">
                  {selectedProspect.givingHistory.map((gift: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg border-l-4" style={{ borderColor: i === 0 ? persona.color : '#e5e7eb', backgroundColor: i === 0 ? persona.bgColor : '#f9fafb' }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{gift.year}</span>
                          {i === 0 && <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: persona.color, color: 'white' }}>Most Recent</span>}
                        </div>
                        <div className="text-sm text-gray-700">{gift.campaign}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: persona.color }}>
                          ${gift.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg font-bold flex items-center justify-between" style={{ backgroundColor: persona.color, color: 'white' }}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Lifetime Partnership Value</span>
                  </div>
                  <div className="text-2xl">
                    ${selectedProspect.givingHistory.reduce((sum: number, g: any) => sum + g.amount, 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Co-Created Next Steps */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" style={{ color: persona.color }} />
                  Co-Created Cultivation Strategy
                </h3>
                <div className="space-y-2">
                  {selectedProspect.nextSteps.map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: persona.color }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 text-sm text-gray-800">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info - Minimal, Action-Oriented */}
              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <a href={`mailto:${selectedProspect.email}`} className="flex items-center gap-2 text-gray-700 hover:text-[#64B37A]">
                    <Mail className="h-4 w-4" />
                    {selectedProspect.email}
                  </a>
                  <a href={`tel:${selectedProspect.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-[#64B37A]">
                    <Phone className="h-4 w-4" />
                    {selectedProspect.phone}
                  </a>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    Last contact: {selectedProspect.lastContact}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: persona.color }}>
                  <MessageSquare className="h-5 w-5" />
                  Draft Cultivation Email
                </button>
                <button className="px-6 py-3 rounded-lg border-2 font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors" style={{ borderColor: persona.color, color: persona.color }}>
                  <Calendar className="h-5 w-5" />
                  Schedule Touchpoint
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  )
}
