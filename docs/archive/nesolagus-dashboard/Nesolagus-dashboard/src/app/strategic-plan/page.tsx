'use client'

import { useState } from 'react'
import AppHeader from '@/components/ui/app-header'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={["rounded-2xl border bg-white shadow-sm p-6", className].join(' ')}>{children}</div>
}

export default function StrategicPlanPage() {
  const [selectedSector, setSelectedSector] = useState<'educators' | 'nonprofits' | 'campaigns' | 'cities'>('educators')
  const [planPhase, setPlanPhase] = useState<'overview' | 'detailed'>('overview')

  const sectors = [
    { id: 'educators', label: 'Educational Institutions', color: '#64B37A' },
    { id: 'nonprofits', label: 'Non-Profit Organizations', color: '#86C99B' },
    { id: 'campaigns', label: 'Political Campaigns', color: '#A9D8B7' },
    { id: 'cities', label: 'Municipal Government', color: '#2F6D49' }
  ]

  const planSections = {
    educators: {
      title: 'Educational Engagement Strategic Plan',
      objectives: [
        'Increase community participation in educational initiatives by 40%',
        'Develop sustainable funding models for program expansion',
        'Create measurable learning outcomes aligned with community needs',
        'Build partnerships with local stakeholders and organizations'
      ],
      initiatives: [
        {
          name: 'Community Learning Hubs',
          timeline: '3-6 months',
          budget: '$50,000-$75,000',
          description: 'Establish neighborhood-based learning centers that serve as focal points for educational engagement'
        },
        {
          name: 'Digital Literacy Program',
          timeline: '6-12 months',
          budget: '$30,000-$45,000',
          description: 'Comprehensive technology training for underserved community members'
        },
        {
          name: 'Mentorship Network',
          timeline: '2-4 months',
          budget: '$15,000-$25,000',
          description: 'Pair experienced community members with learners for ongoing support'
        }
      ],
      metrics: [
        'Participation rates across demographic groups',
        'Program completion and retention rates',
        'Community feedback and satisfaction scores',
        'Long-term educational outcome tracking'
      ]
    },
    nonprofits: {
      title: 'Non-Profit Impact Strategic Plan',
      objectives: [
        'Expand service delivery capacity by 60% within 18 months',
        'Diversify funding streams to ensure organizational sustainability',
        'Strengthen community partnerships and collaborative networks',
        'Implement data-driven program evaluation and improvement'
      ],
      initiatives: [
        {
          name: 'Volunteer Engagement Platform',
          timeline: '4-8 months',
          budget: '$40,000-$60,000',
          description: 'Develop comprehensive system for recruiting, training, and retaining volunteers'
        },
        {
          name: 'Social Impact Measurement',
          timeline: '6-12 months',
          budget: '$25,000-$40,000',
          description: 'Implement robust tracking and reporting systems for program outcomes'
        },
        {
          name: 'Community Partnership Initiative',
          timeline: '3-6 months',
          budget: '$20,000-$35,000',
          description: 'Build strategic alliances with complementary organizations and stakeholders'
        }
      ],
      metrics: [
        'Service delivery volume and quality indicators',
        'Funding diversity and sustainability ratios',
        'Volunteer engagement and satisfaction metrics',
        'Community impact assessment scores'
      ]
    },
    campaigns: {
      title: 'Political Campaign Strategic Plan',
      objectives: [
        'Build grassroots coalition of 10,000+ active supporters',
        'Achieve 65% name recognition in target demographics',
        'Develop comprehensive policy platform based on community input',
        'Execute integrated digital and traditional outreach strategy'
      ],
      initiatives: [
        {
          name: 'Community Listening Tour',
          timeline: '2-3 months',
          budget: '$35,000-$50,000',
          description: 'Systematic engagement with constituents to inform policy development'
        },
        {
          name: 'Digital Organizing Platform',
          timeline: '4-6 months',
          budget: '$60,000-$85,000',
          description: 'Multi-channel digital strategy including social media, email, and targeted advertising'
        },
        {
          name: 'Volunteer Mobilization Program',
          timeline: '6-10 months',
          budget: '$40,000-$60,000',
          description: 'Recruit, train, and deploy campaign volunteers for maximum impact'
        }
      ],
      metrics: [
        'Supporter engagement and conversion rates',
        'Media coverage volume and sentiment analysis',
        'Fundraising performance and donor retention',
        'Polling data and voter contact efficiency'
      ]
    },
    cities: {
      title: 'Municipal Strategic Plan',
      objectives: [
        'Enhance community resilience through evidence-based policy development',
        'Implement smart city technologies to improve municipal service delivery',
        'Foster sustainable economic growth while maintaining environmental stewardship',
        'Strengthen democratic participation through transparent governance and community engagement'
      ],
      initiatives: [
        {
          name: 'Smart Governance Initiative',
          timeline: '12-18 months',
          budget: '$150,000-$250,000',
          description: 'Integrated digital platform for citizen services, permitting, and municipal operations with data analytics dashboard'
        },
        {
          name: 'Sustainable Development Framework',
          timeline: '6-12 months',
          budget: '$75,000-$125,000',
          description: 'Comprehensive zoning updates, environmental impact assessments, and green infrastructure planning'
        },
        {
          name: 'Community Engagement and Equity Program',
          timeline: '4-8 months',
          budget: '$40,000-$60,000',
          description: 'Multilingual public consultation processes, neighborhood liaison networks, and accessibility improvements'
        }
      ],
      metrics: [
        'Municipal service response times and completion rates',
        'Citizen satisfaction scores across demographic groups',
        'Environmental sustainability indicators and carbon footprint reduction',
        'Economic diversification metrics and local business retention rates',
        'Public participation rates in municipal decision-making processes'
      ]
    }
  }

  return (
    <section className="p-6 space-y-6">
      <AppHeader title="Community Intelligence" subtitle="Strategic planning foundation powered by authentic community voices" />

      {/* Sector Selection */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Community Intelligence Focus</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select your sector to preview comprehensive stakeholder intelligence that captures voices from all interested parties - 
          residents, businesses, institutions, advocates, and civic leaders - transforming strategic planning RFPs into truly inclusive, implementable roadmaps.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => setSelectedSector(sector.id as any)}
              className={`p-4 rounded-lg border transition-all relative ${
                selectedSector === sector.id
                  ? 'border-[#64B37A] bg-[#E6F4EA] shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 opacity-40 hover:opacity-70'
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full mb-3 mx-auto" 
                style={{ backgroundColor: sector.color }}
              />
              <div className={`text-sm font-medium ${
                selectedSector === sector.id ? 'text-[#0E2A23]' : 'text-gray-700'
              }`}>
                {sector.label}
              </div>
              {selectedSector === sector.id && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#64B37A]" />
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Intelligence Level Toggle */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Community Intelligence Depth</h3>
            <p className="text-sm text-gray-600">Preview the community engagement component of strategic planning initiatives</p>
          </div>
          <div className="flex rounded-lg border">
            <button
              onClick={() => setPlanPhase('overview')}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-l-lg ${
                planPhase === 'overview'
                  ? 'bg-[#64B37A] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Community Summary
            </button>
            <button
              onClick={() => setPlanPhase('detailed')}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-r-lg ${
                planPhase === 'detailed'
                  ? 'bg-[#64B37A] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Full Intelligence Preview
            </button>
          </div>
        </div>
      </Card>

      {/* Strategic Plan Content */}
      <Card>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">{planSections[selectedSector].title}</h2>
            <p className="text-sm text-gray-600 mt-1">Community Intelligence Foundation • Based on 1,247+ authentic stakeholder voices</p>
            <div className="mt-3 flex items-center gap-4 text-xs">
              <span className="px-2 py-1 rounded bg-[#E6F4EA] text-[#0E2A23]">Community Voice Component</span>
              <span className="text-gray-500">Part of comprehensive strategic planning initiative</span>
            </div>
          </div>

          {/* Community-Driven Priorities */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Community-Driven Priorities</h3>
            <p className="text-sm text-gray-600 mb-4">
              Key themes emerging from comprehensive stakeholder engagement across all interested parties: 
              {selectedSector === 'cities' ? 'residents, business owners, non-profit leaders, politicians, unhoused individuals, artists, commuters, entrepreneurs, educators, institutions, and community advocates' : 'all community stakeholders including residents, organizations, institutions, and civic leaders'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {planSections[selectedSector].objectives.map((objective, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-[#F6F4ED]">
                  <div className="w-6 h-6 rounded-full bg-[#64B37A] text-white text-xs flex items-center justify-center font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-[#0E2A23]">{objective}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Initiatives */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Key Initiatives</h3>
            <div className="space-y-4">
              {planSections[selectedSector].initiatives.map((initiative, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{initiative.name}</h4>
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span>{initiative.timeline}</span>
                      <span>{initiative.budget}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{initiative.description}</p>
                  {planPhase === 'detailed' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div><strong>Success Indicators:</strong> Baseline establishment, milestone tracking, outcome measurement</div>
                        <div><strong>Risk Mitigation:</strong> Stakeholder alignment, resource contingency, timeline flexibility</div>
                        <div><strong>Resource Requirements:</strong> Staff allocation, technology needs, community partnerships</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success Metrics */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Success Metrics & KPIs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {planSections[selectedSector].metrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-[#64B37A]"></div>
                  <p className="text-sm text-[#0E2A23]">{metric}</p>
                </div>
              ))}
            </div>
          </div>

          {planPhase === 'detailed' && (
            <>
              {/* Full Community Intelligence Preview */}
              <div className="border-2 border-[#64B37A] rounded-lg p-6 bg-gradient-to-br from-[#E6F4EA] to-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0E2A23] mb-2">Complete Community Intelligence Report</h3>
                    <p className="text-sm text-gray-700">
                      Comprehensive stakeholder analysis and community engagement documentation for strategic planning RFPs
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#64B37A] text-white text-xs font-medium">47 Pages</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Included Analysis</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#64B37A]"></div>
                        Community archetype mapping (6 distinct profiles)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#64B37A]"></div>
                        Multi-stakeholder sentiment analysis (residents, businesses, institutions, advocates, civic leaders)  
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#64B37A]"></div>
                        Priority theme identification & ranking
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#64B37A]"></div>
                        Geographic clustering and engagement patterns
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#64B37A]"></div>
                        Communication preference optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#64B37A]"></div>
                        Implementation readiness assessment
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Strategic Planning Integration</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#86C99B]"></div>
                        RFP-ready community engagement documentation
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#86C99B]"></div>
                        Comprehensive stakeholder buy-in verification across all interested parties
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#86C99B]"></div>
                        Community-driven objective prioritization
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#86C99B]"></div>
                        Implementation pathway recommendations
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#86C99B]"></div>
                        Ongoing engagement strategy framework
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#86C99B]"></div>
                        Success metrics aligned with values across all stakeholder groups
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-[#CDEBD8] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0E2A23]">Partner with us for comprehensive community intelligence</p>
                      <p className="text-xs text-gray-600 mt-1">Essential for winning strategic planning RFPs and ensuring successful implementation</p>
                    </div>
                    <button className="px-6 py-3 bg-[#64B37A] text-white rounded-lg font-medium hover:bg-[#2F6D49] transition-colors">
                      Contact for Full Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Community Intelligence Metrics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Community Engagement Scale</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-[#E6F4EA] border border-[#CDEBD8]">
                    <div className="text-2xl font-bold text-[#2F6D49]">1,247+</div>
                    <div className="text-sm text-gray-600 mt-1">Community Voices</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-[#F6F4ED] border border-gray-200">
                    <div className="text-2xl font-bold text-[#0E2A23]">6</div>
                    <div className="text-sm text-gray-600 mt-1">Stakeholder Archetypes</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-[#E6F4EA] border border-[#CDEBD8]">
                    <div className="text-2xl font-bold text-[#64B37A]">89%</div>
                    <div className="text-sm text-gray-600 mt-1">Engagement Quality Score</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-[#F6F4ED] border border-gray-200">
                    <div className="text-2xl font-bold text-[#0E2A23]">47</div>
                    <div className="text-sm text-gray-600 mt-1">Report Pages</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Items */}
          <div className="bg-[#F6F4ED] border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-[#0E2A23] mb-2">Next Steps</h3>
            <ul className="text-sm text-[#0E2A23] space-y-1">
              <li>• Schedule stakeholder alignment meeting within 2 weeks</li>
              <li>• Finalize budget allocation and funding sources</li>
              <li>• Establish baseline metrics and measurement systems</li>
              <li>• Begin Phase 1 implementation planning</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Partnership Options */}
      <Card>
        <div className="bg-gradient-to-r from-[#E6F4EA] to-[#F6F4ED] border-2 border-[#64B37A] rounded-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-[#0E2A23] mb-2">Ready to Partner with Community Intelligence Specialists?</h3>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Transform your strategic planning RFPs with authentic stakeholder intelligence from all interested parties - 
              ensuring comprehensive buy-in, implementation success, and measurable impact across diverse community constituencies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-[#64B37A] mb-1">$75K - $150K</div>
              <div className="text-sm text-gray-600">Community Intelligence Component</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-[#64B37A] mb-1">4-8 Weeks</div>
              <div className="text-sm text-gray-600">Engagement Timeline</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-[#64B37A] mb-1">RFP Ready</div>
              <div className="text-sm text-gray-600">Documentation</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-[#64B37A] text-white rounded-lg font-medium hover:bg-[#2F6D49] transition-colors">
              Schedule Partnership Discussion
            </button>
            <button className="px-8 py-3 border border-[#64B37A] text-[#64B37A] rounded-lg font-medium hover:bg-[#E6F4EA] transition-colors">
              Download Sample Report
            </button>
            <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Request RFP Template
            </button>
          </div>
        </div>
      </Card>
    </section>
  )
}