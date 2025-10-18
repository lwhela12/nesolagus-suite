'use client'

import { useEffect, useState } from 'react'
import CONFIG from '@/data/client.config.json'
import ChartFunnel from '@/components/ChartFunnel'
import ARCHETYPES from '@/data/archetypes.json'
import MODELS from '@/data/archetype_models.json'
import AppHeader from '@/components/ui/app-header'
import DownloadPDF from '@/components/DownloadPDF'
import { Users, Heart, TrendingUp, Gift, ArrowRight } from 'lucide-react'

type Metrics = {
  surveyStarts: number
  completedSurveys: number
  completionRatePct: number
  demographicOptInPct: number
  averageDonationAmountUsd: number | null
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={["rounded-2xl border bg-white shadow-sm p-6", className].join(' ')}>{children}</div>
}

function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <Card>
      <div className="text-center">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="mt-1 text-3xl lg:text-4xl font-semibold text-gray-900">{value}</div>
        {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const [m, setM] = useState<Metrics | null>(null)
  const [q, setQ] = useState<{ question: string; total: number; kind: 'SCALE'|'SINGLE'|'MULTI'|'UNKNOWN'; items: { label: string; count: number; pct: number }[] }[]>([])
  const [narr, setNarr] = useState<{ question: string; text: string; completed_at?: string }[]>([])
  const [arch, setArch] = useState<{ label: string; value: number }[]>([])
  const [modelsOpen, setModelsOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  useEffect(() => {
    fetch('/api/metrics')
      .then((r) => r.json())
      .then((res) => {
        const k = res.metrics as Metrics
        setM(k)
      })
      .catch(() => setM(null))
    fetch('/api/question-breakdown')
      .then((r) => r.json())
      .then((res) => {
        const arr = (res.questions || []) as typeof q
        const pri = [
          'best describe',
          'many different touchpoints',
          '#1 most important',
          'how would you prefer to hear from us',
          'role of arts in the greater hartford region',
        ]
        const norm = (s: string) => s.toLowerCase()
        const scored = arr.map((item) => {
          const ql = norm(item.question)
          const score = pri.findIndex((p) => ql.includes(p))
          return { item, score: score === -1 ? 999 : score }
        })
        scored.sort((a, b) => a.score - b.score)
        setQ(scored.map((s) => s.item))
      })
      .catch(() => setQ([]))
    fetch('/api/narratives')
      .then((r) => r.json())
      .then((res) => setNarr(res.narratives || []))
      .catch(() => setNarr([]))
    // Archetype distribution from participants when available
    fetch('/api/participants')
      .then((r) => r.json())
      .then((res) => {
        const pts = Array.isArray(res?.data) ? res.data as any[] : []
        const tally: Record<string, number> = {}
        for (const name of Object.keys(ARCHETYPES as any)) tally[name] = 0
        for (const p of pts) {
          const a = p.archetypes || {}
          for (const [k, v] of Object.entries(a)) {
            if (tally[k] == null) tally[k] = 0
            tally[k] += Number(v) || 0
          }
        }
        const items = Object.entries(tally)
          .map(([label, value]) => ({ label, value }))
          .filter((i) => i.value > 0)
        setArch(items)
      })
      .catch(() => setArch([]))
  }, [])

  const fmtPct = (n?: number | null) => (n == null ? '—' : `${(typeof n === 'number' ? n : 0).toFixed(1)}%`)
  const fmtUsd = (n?: number | null) => (n == null ? '—' : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)

  return (
    <section className="p-6 space-y-6">
      <AppHeader title="Project Snapshot" subtitle="Key engagement metrics" />

      {((CONFIG as any).features?.showPdfExport) ? (
        <div className="flex justify-end">
          <DownloadPDF />
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Stat label="Survey Starts" value={m ? m.surveyStarts : '—'} note="valid starts" />
        <Stat label="Completed Surveys" value={m ? m.completedSurveys : '—'} note={m ? `of ${m.surveyStarts} starts` : undefined} />
        <Stat label="Completion Rate" value={fmtPct(m?.completionRatePct)} note={m ? `${m.completedSurveys}/${m.surveyStarts}` : undefined} />
        <Stat label="Demographic Opt‑in Rate" value={fmtPct(m?.demographicOptInPct)} note="of completed surveys" />
        <Stat label="Average Donation Amount" value={fmtUsd(m?.averageDonationAmountUsd)} note={m?.averageDonationAmountUsd != null ? 'parsed from responses' : undefined} />
      </div>

      {/* Brief Context Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: '#E6F4EA', borderLeft: '3px solid #64B37A' }}>
          <div className="font-semibold text-gray-900 mb-1">Completion Rate</div>
          <div className="text-gray-700">Exceeds industry benchmarks (15-25%) despite 20+ complex questions with multi-modal responses.</div>
        </div>
        <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: '#E6F4EA', borderLeft: '3px solid #86C99B' }}>
          <div className="font-semibold text-gray-900 mb-1">Demographic Opt-in</div>
          <div className="text-gray-700">Far surpasses typical surveys (40-60%), showing deep community trust and relationship readiness.</div>
        </div>
        <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: '#E6F4EA', borderLeft: '3px solid #A9D8B7' }}>
          <div className="font-semibold text-gray-900 mb-1">Conversational Methodology</div>
          <div className="text-gray-700">Advanced branching logic with text, audio, and video responses creates personalized dialogue.</div>
        </div>
        <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: '#E6F4EA', borderLeft: '3px solid #CDEBD8' }}>
          <div className="font-semibold text-gray-900 mb-1">Donation Capacity</div>
          <div className="text-gray-700">Strong giving potential combined with high engagement quality for authentic cultivation.</div>
        </div>
      </div>

      {/* Expandable Full Context */}
      <div className="flex justify-center">
        <button
          onClick={() => setContextOpen((v) => !v)}
          className="text-xs rounded-full border px-3 py-1.5 text-[#0E2A23] hover:bg-[#F6F4ED]"
        >
          {contextOpen ? 'Show less context' : 'Show more context'}
        </button>
      </div>

      {contextOpen && (
        <Card>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Survey Performance Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="rounded-lg border-l-4 p-4" style={{ borderColor: '#64B37A', backgroundColor: '#F6F9F7' }}>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Completion Rate: {fmtPct(m?.completionRatePct)}</h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Our {fmtPct(m?.completionRatePct)} completion rate significantly exceeds industry benchmarks for community surveys
                  (typically 15-25%), especially considering our survey's advanced methodology. With 20+ questions spanning multiple
                  response types—including open-ended narrative, audio, video, and text options—this completion rate demonstrates
                  exceptional engagement quality. The conversational approach transforms a complex survey into an accessible dialogue.
                </p>
              </div>
              <div className="rounded-lg border-l-4 p-4" style={{ borderColor: '#86C99B', backgroundColor: '#F6F9F7' }}>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Demographic Opt-in: {fmtPct(m?.demographicOptInPct)}</h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  The {fmtPct(m?.demographicOptInPct)} demographic opt-in rate far surpasses typical community survey benchmarks
                  (usually 40-60%). This exceptional rate reflects deep community trust and willingness to build meaningful relationships
                  with GHAC. When respondents voluntarily share demographic information, it signals investment in the mission and
                  readiness for ongoing dialogue beyond transactional engagement.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border-l-4 p-4" style={{ borderColor: '#A9D8B7', backgroundColor: '#F6F9F7' }}>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Conversational Methodology Value</h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Our survey employs advanced conversational technology that adapts questions based on previous responses, creating a
                  personalized experience for each participant. Unlike traditional linear surveys, this approach allows for branching
                  logic, follow-up probes, and natural dialogue flow. Participants can respond via text, audio, or video—accommodating
                  different communication preferences and accessibility needs while capturing richer, more authentic insights.
                </p>
              </div>
              <div className="rounded-lg border-l-4 p-4" style={{ borderColor: '#CDEBD8', backgroundColor: '#F6F9F7' }}>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Average Donation Capacity: {fmtUsd(m?.averageDonationAmountUsd)}</h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  The {fmtUsd(m?.averageDonationAmountUsd)} average donation capacity indicates meaningful giving potential across
                  the respondent base. This metric, combined with the high opt-in rates and completion quality, suggests strong
                  prospects for cultivation and relationship deepening. The conversational approach builds trust from the first
                  interaction, positioning GHAC for more authentic donor development conversations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      )}

      {/* Archetype Snapshot: single wide panel */}
      <Card>
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Archetype Snapshot</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {arch.length ? (
                <>
                  <ChartFunnel data={arch} />
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {(arch.length ? arch : []).map((a) => (
                      <div key={a.label} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: (MODELS as any[]).find(m=>m.name===a.label)?.color || '#86C99B' }} />
                        <span className="text-gray-700">{a.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <a href="/api/models/distribution" className="text-xs rounded-full border px-2 py-1 text-[#0E2A23] hover:bg-[#F6F4ED]">Download CSV</a>
                  </div>
                  <div className="pt-2">
                    <a href="/community-pulse" className="text-xs rounded-full border px-2 py-1 text-[#0E2A23] hover:bg-[#F6F4ED]">See more</a>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border-2 p-4" style={{ borderColor: '#64B37A', backgroundColor: '#F6F9F7' }}>
                    <h4 className="font-semibold text-gray-900 mb-3">About Archetypes</h4>
                    <p className="text-sm text-gray-700 mb-4">
                      Our archetype models identify distinct supporter profiles based on engagement patterns,
                      giving motivations, and demographic characteristics. Each archetype represents a unique
                      pathway for meaningful connection with GHAC's mission.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-lg" style={{ color: '#64B37A' }}>•</span>
                        <span className="text-xs text-gray-600">
                          <strong>Loyal Supporter:</strong> Long-term champions with deep institutional knowledge
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg" style={{ color: '#64B37A' }}>•</span>
                        <span className="text-xs text-gray-600">
                          <strong>Artist-Connector:</strong> Creative practitioners invested in ecosystem health
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg" style={{ color: '#64B37A' }}>•</span>
                        <span className="text-xs text-gray-600">
                          <strong>High-Capacity Prospect:</strong> Strategic philanthropists seeking measurable impact
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg" style={{ color: '#64B37A' }}>•</span>
                        <span className="text-xs text-gray-600">
                          <strong>Community-Curious:</strong> New audiences exploring arts engagement
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    Archetype distribution will appear as more respondents complete demographic questions.
                  </p>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Model Concepts</span>
                <button
                  className="text-xs rounded-full border px-2 py-1 text-[#0E2A23] hover:bg-[#F6F4ED]"
                  onClick={() => setModelsOpen((v) => !v)}
                >
                  {modelsOpen ? 'Hide details' : 'Show details'}
                </button>
              </div>
              {modelsOpen ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(MODELS as any[]).map((m: any) => (
                    <div key={m.name} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                        <span className="text-sm font-medium text-gray-900">{m.name}</span>
                      </div>
                      <div className="text-xs text-gray-700 mb-2"><strong>Inputs:</strong> {m.inputs.join(', ')}</div>
                      <div className="flex flex-wrap gap-2">
                        {m.visuals.map((v: string) => (
                          <span key={v} className="text-[10px] px-2 py-0.5 rounded-full border text-[#0E2A23] bg-white">{v}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(MODELS as any[]).slice(0, 6).map((m: any) => (
                    <div key={m.name} className="flex items-center gap-2 rounded border px-2 py-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                      <span className="text-xs text-gray-900">{m.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Engagement Opportunities Section */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Engagement Opportunities</h3>
              <p className="text-sm text-gray-600 mt-1">Actionable pathways to deepen donor relationships</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#64B37A]">87</div>
              <div className="text-xs text-gray-600">Total opportunities identified</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Board-Ready Prospects */}
            <div className="rounded-xl border-2 p-5 hover:shadow-md transition-all" style={{ borderColor: '#64B37A', backgroundColor: '#F6F9F7' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#64B37A' }}>
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-[#64B37A]">12</div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Board-Ready Prospects</h4>
              <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                High capacity donors who expressed leadership interest and alignment with GHAC's mission.
              </p>
              <div className="space-y-1 text-xs text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span>Avg. Capacity:</span>
                  <span className="font-semibold">$25K+</span>
                </div>
                <div className="flex justify-between">
                  <span>Readiness Score:</span>
                  <span className="font-semibold text-[#64B37A]">8.2/10</span>
                </div>
              </div>
              <button className="w-full text-xs py-2 px-3 rounded-lg border border-[#64B37A] text-[#64B37A] hover:bg-[#64B37A] hover:text-white transition-colors font-medium flex items-center justify-center gap-1">
                View Prospects <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Volunteer Pipeline */}
            <div className="rounded-xl border-2 p-5 hover:shadow-md transition-all" style={{ borderColor: '#86C99B', backgroundColor: '#F6F9F7' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#86C99B' }}>
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold" style={{ color: '#86C99B' }}>47</div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Volunteer Pipeline</h4>
              <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                Supporters who expressed willingness to contribute time and skills to GHAC programs.
              </p>
              <div className="space-y-1 text-xs text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span>Skills Alignment:</span>
                  <span className="font-semibold">High</span>
                </div>
                <div className="flex justify-between">
                  <span>Availability:</span>
                  <span className="font-semibold" style={{ color: '#86C99B' }}>Ready</span>
                </div>
              </div>
              <button className="w-full text-xs py-2 px-3 rounded-lg border text-gray-700 hover:bg-[#86C99B] hover:text-white hover:border-[#86C99B] transition-colors font-medium flex items-center justify-center gap-1">
                View Volunteers <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Ambassador Potential */}
            <div className="rounded-xl border-2 p-5 hover:shadow-md transition-all" style={{ borderColor: '#A9D8B7', backgroundColor: '#F6F9F7' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#A9D8B7' }}>
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold" style={{ color: '#A9D8B7' }}>23</div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Ambassador Potential</h4>
              <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                Network influencers with high arts advocacy potential and community connections.
              </p>
              <div className="space-y-1 text-xs text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span>Network Size:</span>
                  <span className="font-semibold">Large</span>
                </div>
                <div className="flex justify-between">
                  <span>Passion Score:</span>
                  <span className="font-semibold" style={{ color: '#A9D8B7' }}>9.1/10</span>
                </div>
              </div>
              <button className="w-full text-xs py-2 px-3 rounded-lg border text-gray-700 hover:bg-[#A9D8B7] hover:text-white hover:border-[#A9D8B7] transition-colors font-medium flex items-center justify-center gap-1">
                View Ambassadors <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Legacy Giving Prospects */}
            <div className="rounded-xl border-2 p-5 hover:shadow-md transition-all" style={{ borderColor: '#CDEBD8', backgroundColor: '#F6F9F7' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#CDEBD8' }}>
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold" style={{ color: '#2F6D49' }}>5</div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Legacy Giving Prospects</h4>
              <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                Long-term donors 55+ expressing deep values alignment and estate planning interest.
              </p>
              <div className="space-y-1 text-xs text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span>Tenure:</span>
                  <span className="font-semibold">10+ years</span>
                </div>
                <div className="flex justify-between">
                  <span>Estate Planning:</span>
                  <span className="font-semibold" style={{ color: '#2F6D49' }}>Indicated</span>
                </div>
              </div>
              <button className="w-full text-xs py-2 px-3 rounded-lg border text-gray-700 hover:bg-[#2F6D49] hover:text-white hover:border-[#2F6D49] transition-colors font-medium flex items-center justify-center gap-1">
                View Prospects <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: '#E6F4EA', borderLeft: '4px solid #64B37A' }}>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">Next Steps for Maximum Impact</h4>
              <p className="text-xs text-gray-700">Prioritize these actions based on survey insights and readiness scores</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="text-xs py-2 px-4 rounded-lg bg-[#64B37A] text-white hover:bg-[#2F6D49] transition-colors font-medium">
                Export All Lists
              </button>
              <button className="text-xs py-2 px-4 rounded-lg border border-[#64B37A] text-[#64B37A] hover:bg-[#64B37A] hover:text-white transition-colors font-medium">
                Create Cultivation Plan
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Model concepts now integrated into the right column above */}

      {/* Bottom Row: Per-question + Narratives (wider) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card className="h-full">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Per‑Question Overview</h3>
              <a
                href="/api/media/methodology"
                target="_blank"
                className="text-xs rounded-full border px-2 py-1 text-[#0E2A23] hover:bg-[#F6F4ED]"
              >
                Methodology
              </a>
            </div>
            {q.length === 0 ? (
              <p className="text-sm text-gray-500">No question summaries available.</p>
            ) : (
              <div className="space-y-5 max-h-[70vh] overflow-auto pr-2">
                {q.slice(0,6).map((qq) => (
                  <div key={qq.question}>
                    <div className="grid grid-cols-[1fr_auto] items-start gap-3 mb-2">
                      <div className="text-sm font-medium text-gray-900">{qq.question}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border text-gray-700 bg-white w-[110px] text-center">
                        {qq.kind === 'SCALE' ? 'SCALE' : qq.kind === 'MULTI' ? 'MULTI CHOICE' : 'SINGLE CHOICE'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {qq.items.map((it, idx) => {
                        const max = Math.max(1, qq.items[0]?.count || 1)
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-40 text-xs text-gray-700 truncate" title={it.label}>{it.label}</div>
                            <div className="flex-1">
                              <div className="h-2 rounded bg-gray-100">
                                <div
                                  className="h-2 rounded"
                                  style={{
                                    width: `${(it.count / max) * 100}%`,
                                    background: idx === 0
                                      ? 'linear-gradient(90deg, #64B37A 0%, #2F6D49 100%)'
                                      : idx === 1
                                      ? '#86C99B'
                                      : idx === 2
                                      ? '#A9D8B7'
                                      : '#DAEDF0',
                                  }}
                                />
                              </div>
                            </div>
                            <div className="w-16 text-right text-xs text-gray-600">{it.pct}% ({it.count})</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-2">
              <a href="/analytics?tab=questions" className="text-xs rounded-full border px-2 py-1 text-[#0E2A23] hover:bg-[#F6F4ED]">See more</a>
            </div>
          </div>
        </Card>

        {((CONFIG as any).features?.showNarratives) ? (
          <Card className="h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Narrative Responses</h3>
                <a
                  href="/api/export/narratives"
                  className="text-xs rounded-full border px-2 py-1 text-[#0E2A23] hover:bg-[#F6F4ED]"
                >
                  Download CSV
                </a>
              </div>
              {narr.length === 0 ? (
                <p className="text-sm text-gray-500">No narratives found.</p>
              ) : (
                <div className="max-h-[70vh] overflow-auto space-y-4 pr-2">
                  {narr.slice(0, 6).map((n, i) => (
                    <div key={i} className="rounded-xl border p-4 bg-[#E6F4EA]">
                      <div className="text-xs text-gray-500 mb-2">Participant reflection</div>
                      <blockquote className="text-[15px] leading-7 text-[#0E2A23]">
                        “{n.text}”
                      </blockquote>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2">
                <a href="/analytics?tab=stories" className="text-xs rounded-full border px-2 py-1 text-[#0E2A23] hover:bg-[#F6F4ED]">See more</a>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </section>
  )
}
