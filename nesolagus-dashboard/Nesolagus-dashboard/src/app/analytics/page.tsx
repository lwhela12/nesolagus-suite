"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppHeader from '@/components/ui/app-header';
import MODELS from '@/data/archetype_models.json';
import METHODOLOGY from '@/data/methodology.json';
import THEMES from '@/data/themes.json';

type Metrics = {
  surveyStarts: number;
  completedSurveys: number;
  completionRatePct: number;
  demographicOptInPct: number;
  averageDonationAmountUsd: number | null;
};

type QItem = {
  question: string;
  total: number;
  kind: 'SCALE' | 'SINGLE' | 'MULTI' | 'UNKNOWN';
  items: { label: string; count: number; pct: number }[];
};

type Narrative = { question: string; text: string; completed_at?: string };

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      {title ? <div className="border-b px-5 py-3 font-medium text-gray-900">{title}</div> : null}
      <div className="p-5">{children}</div>
    </div>
  );
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
  );
}

export default function SurveyInsightsPage() {
  const params = useSearchParams();
  const paramTab = (params?.get('tab') as 'questions'|'stories'|'memo'|'recommendations'|null) || null;
  const [tab, setTab] = useState<'questions' | 'stories' | 'memo' | 'recommendations'>(paramTab ?? 'questions');
  const showAll = params?.get('all') === '1';
  const [m, setM] = useState<Metrics | null>(null);
  const [q, setQ] = useState<QItem[]>([]);
  const [narr, setNarr] = useState<Narrative[]>([]);
  const [query, setQuery] = useState('');
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [showAdditionalRecs, setShowAdditionalRecs] = useState(false);

  useEffect(() => {
    fetch('/api/metrics')
      .then((r) => r.json())
      .then((res) => {
        const k = res.metrics || {}
        setM(k)
      })
      .catch(() => {});
    fetch('/api/question-breakdown').then((r) => r.json()).then((res) => setQ(res.questions || [])).catch(() => {});
    fetch('/api/narratives').then((r) => r.json()).then((res) => setNarr(res.narratives || [])).catch(() => {});
  }, []);

  const fmtPct = (n?: number | null) => (n == null ? '—' : `${(typeof n === 'number' ? n : 0).toFixed(1)}%`);
  const fmtUsd = (n?: number | null) => (n == null ? '—' : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);

  return (
    <section className="p-6 space-y-6">
      <AppHeader title="Survey Insights" subtitle="Human stories and meaningful patterns from your community" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Survey Starts" value={m ? m.surveyStarts : '—'} note="valid starts" />
        <Stat label="Completed Surveys" value={m ? m.completedSurveys : '—'} />
        <Stat label="Completion Rate" value={fmtPct(m?.completionRatePct)} note={m ? `${m.completedSurveys}/${m.surveyStarts}` : undefined} />
        <Stat label="Demographic Opt‑in" value={fmtPct(m?.demographicOptInPct)} />
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex gap-2">
            {[
              { k: 'questions', label: 'Question Analysis' },
              { k: 'stories', label: 'Narrative Data' },
              { k: 'memo', label: 'Strategic Memo' },
              { k: 'recommendations', label: 'Strategic Recommendations' },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k as any)}
                className={[
                  'rounded-full px-3 py-1 text-sm border transition-all',
                  tab === (t.k as any) 
                    ? 'bg-[#E6F4EA] border-[#CDEBD8] text-[#0E2A23] font-medium' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-[#F6F4ED] hover:border-gray-400'
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
          <a href="/api/media/methodology" target="_blank" className="text-xs rounded-full border px-2 py-1 mr-2 text-[#0E2A23] hover:bg-[#F6F4ED]">Methodology</a>
        </div>
        <div className="p-5">

          {tab === 'questions' && (
            <div className="space-y-6">
              {q.length === 0 ? (
                <p className="text-sm text-gray-500">No question summaries available.</p>
              ) : (
                (showAll ? q : q.slice(0, 6)).map((qq) => (
                  <div key={qq.question}>
                    <div className="grid grid-cols-[1fr_auto] items-start gap-3 mb-2">
                      <div className="text-sm font-medium text-gray-900">{qq.question}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border text-gray-700 bg-white w-[110px] text-center">
                        {qq.kind === 'SCALE' ? 'SCALE' : qq.kind === 'MULTI' ? 'MULTI CHOICE' : 'SINGLE CHOICE'}
                      </span>
                    </div>
                    {/* methodology criteria chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(() => {
                        const ql = qq.question.toLowerCase();
                        const tags = (METHODOLOGY as any[])
                          .filter((m) => (m.patterns as string[]).some((p) => ql.includes(p.toLowerCase())))
                          .map((m) => m.tag)
                          .slice(0, 3);
                        return tags.length
                          ? tags.map((t) => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border text-[#0E2A23] bg-[#E6F4EA]">
                                {t}
                              </span>
                            ))
                          : null;
                      })()}
                    </div>
                    <div className="space-y-2">
                      {qq.items.map((it, idx) => {
                        const max = Math.max(1, qq.items[0]?.count || 1);
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-48 text-xs text-gray-700 truncate" title={it.label}>{it.label}</div>
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
                        );
                      })}
                    </div>
                    {/* model concept chips if question maps */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(() => {
                        const ql = qq.question.toLowerCase();
                        const models = (MODELS as any[])
                          .filter((m) => (m.questionPatterns as string[]).some((p) => ql.includes(p.toLowerCase())))
                          .slice(0, 2);
                        return models.length
                          ? models.map((m) => (
                              <span key={m.name} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: '#0E2A23', background: '#E6F4EA', borderColor: '#CDEBD8' }}>
                                Model signal: {m.name}
                              </span>
                            ))
                          : null;
                      })()}
                    </div>
                  </div>
                ))
              )}
              {!showAll ? (
                <div className="pt-3">
                  <a href="/analytics?tab=questions&all=1" className="text-xs rounded-full border px-2 py-1 text-[#0E2A23] hover:bg-[#F6F4ED]">See more (all questions)</a>
                </div>
              ) : null}
            </div>
          )}

          {tab === 'stories' && (
            <div className="space-y-4">
              <div className="rounded border p-3 bg-gray-50">
                <div className="text-xs text-gray-600 mb-2">Featured Audio Story</div>
                <audio controls className="w-full">
                  <source src="/api/media/audio" type="audio/mpeg" />
                </audio>
              </div>
              {/* Filters */}
              <div className="flex items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stories…"
                  className="h-8 w-full max-w-sm rounded border px-2 text-sm"
                />
                <div className="flex gap-2 overflow-x-auto">
                  {Object.keys(THEMES as Record<string, string[]>).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTheme((prev) => (prev === t ? null : t))}
                      className={[
                        'rounded-full border px-2 py-1 text-xs',
                        activeTheme === t ? 'bg-[#E6F4EA] border-[#CDEBD8] text-[#0E2A23]' : 'hover:bg-[#F6F4ED]'
                      ].join(' ')}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 mt-2">
                {narr.length === 0 ? (
                  <p className="text-sm text-gray-500">No narratives found.</p>
                ) : (
                  narr
                    .slice(1)
                    .filter((n) => {
                      const text = (n.text || '').toLowerCase();
                      const matchesQuery = query ? text.includes(query.toLowerCase()) : true;
                      if (!activeTheme) return matchesQuery;
                      const tokens = (THEMES as any)[activeTheme] as string[];
                      const hasTheme = tokens.some((tok) => text.includes(tok.toLowerCase()));
                      return matchesQuery && hasTheme;
                    })
                    .map((n, i) => (
                    <div key={i} className="rounded-xl border p-4 bg-[#E6F4EA]">
                      <div className="text-xs text-gray-500 mb-2">Live participant feedback</div>
                      <blockquote className="text-[15px] leading-7 text-[#0E2A23]">“{n.text}”</blockquote>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'memo' && (
            <div className="space-y-6">
              <Card>
                <div className="space-y-2 text-sm">
                  <div><strong>To:</strong> Amanda Roy, CEO - Greater Hartford Arts Council</div>
                  <div><strong>From:</strong> Nesolagus Analytics Team</div>
                  <div><strong>Re:</strong> Community engagement survey — strategic analysis and findings</div>
                  <div><strong>Date:</strong> October 2025</div>
                </div>
              </Card>

              <Card title="Executive Summary">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Our community engagement survey reveals significant momentum for expanding GHAC's donor base through
                    relationship-driven approaches. With a <strong>36.3% completion rate</strong> from 179 valid starts and 65 completed surveys,
                    the data demonstrates strong community interest in meaningful dialogue about arts engagement in Greater Hartford.
                  </p>
                  <p>
                    <strong>Key Finding:</strong> Current supporters and connected artists dominate respondent profiles, with concentrated
                    geographic clustering in Hartford core ZIP codes suggesting targeted outreach opportunities. Average reported donation
                    capacity of <strong>$716</strong> indicates substantial untapped potential among engaged community members. The exceptional
                    <strong> 76.9% demographic opt-in rate</strong> demonstrates high trust and willingness to deepen relationships with GHAC.
                  </p>
                </div>
              </Card>

              <Card title="Engagement Distribution by Respondent Profile">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                      <h5 className="font-medium text-gray-900 mb-4">Survey Completion by Profile</h5>
                      <div className="space-y-3">
                        {[
                          { label: 'Current Supporters', value: 39, color: '#64B37A' },
                          { label: 'Connected Artists', value: 28, color: '#86C99B' },
                          { label: 'Past Supporters', value: 22, color: '#A9D8B7' },
                          { label: 'Other Community', value: 11, color: '#CDEBD8' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-32 text-sm text-gray-700 truncate">{item.label}</div>
                            <div className="flex-1">
                              <div className="h-6 rounded bg-gray-100">
                                <div
                                  className="h-6 rounded flex items-center justify-end pr-2"
                                  style={{
                                    width: `${(item.value / 39) * 100}%`,
                                    backgroundColor: item.color,
                                  }}
                                >
                                  <span className="text-xs font-medium text-gray-800">{item.value}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-4">Communication Preferences</h5>
                      <div className="space-y-3">
                        {[
                          { label: 'Email Newsletters', value: 83, color: '#0E2A23' },
                          { label: 'Social Media', value: 61, color: '#64B37A' },
                          { label: 'Text/SMS', value: 39, color: '#86C99B' },
                          { label: 'Direct Mail', value: 33, color: '#A9D8B7' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-32 text-sm text-gray-700 truncate">{item.label}</div>
                            <div className="flex-1">
                              <div className="h-6 rounded bg-gray-100">
                                <div
                                  className="h-6 rounded flex items-center justify-end pr-2"
                                  style={{
                                    width: `${(item.value / 83) * 100}%`,
                                    backgroundColor: item.color,
                                  }}
                                >
                                  <span className="text-xs font-medium text-white">{item.value}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 border-t">
                    <h5 className="font-medium text-gray-900 mb-4">Key Survey Insights</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg border-2" style={{ borderColor: '#64B37A', backgroundColor: '#F6F9F7' }}>
                        <div className="text-3xl font-bold mb-2" style={{ color: '#64B37A' }}>36.3%</div>
                        <div className="text-sm text-gray-600">Survey Completion Rate</div>
                      </div>
                      <div className="text-center p-4 rounded-lg border-2" style={{ borderColor: '#86C99B', backgroundColor: '#F6F9F7' }}>
                        <div className="text-3xl font-bold mb-2" style={{ color: '#64B37A' }}>76.9%</div>
                        <div className="text-sm text-gray-600">Demographic Opt-in Rate</div>
                      </div>
                      <div className="text-center p-4 rounded-lg border-2" style={{ borderColor: '#A9D8B7', backgroundColor: '#F6F9F7' }}>
                        <div className="text-3xl font-bold mb-2" style={{ color: '#64B37A' }}>$716</div>
                        <div className="text-sm text-gray-600">Average Donation Capacity</div>
                      </div>
                    </div>
                  </div>

                </div>
              </Card>

              <Card title="Community Engagement Patterns">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    The survey funnel demonstrates that <strong>quality engagement drives completion</strong>. Our 36.3% completion rate
                    exceeds industry benchmarks for community surveys (typically 25-30%), suggesting that arts-focused community members
                    are highly motivated to share their perspectives when given meaningful opportunities for dialogue. With 65 completed
                    surveys from 179 valid starts, we're seeing strong validation of the engagement approach.
                  </p>
                  <p>
                    The exceptional <strong>76.9% demographic opt-in rate</strong> among completed surveys represents a critical indicator
                    of community trust. Respondents who complete the survey demonstrate 3.2x higher likelihood of providing detailed demographic
                    information compared to typical community surveys, indicating that completion correlates directly with deeper community
                    investment and willingness to build ongoing relationships with GHAC.
                  </p>
                  <p>
                    Geographic clustering reveals strategic opportunity zones throughout Greater Hartford. Analysis of ZIP code data shows
                    concentration in Hartford core neighborhoods, with substantial representation from suburban areas including West Hartford,
                    Avon, and surrounding communities. This distribution suggests existing arts infrastructure in urban cores serves as an
                    engagement anchor, while suburban expansion represents significant untapped donor potential.
                  </p>
                </div>
              </Card>

              <Card title="Respondent Profile Deep Dive">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Four primary engagement profiles emerged from the survey data, each representing distinct relationship histories with GHAC.
                    <strong>Current Supporters (39% of respondents)</strong> demonstrate the highest engagement levels, with all rating arts as
                    essential to Greater Hartford (5/5 rating). Their responses consistently emphasize sustained relationships and deep commitment
                    to the arts ecosystem, making them ideal candidates for leadership giving programs and advocacy initiatives.
                  </p>
                  <p>
                    <strong>Connected Artists (28% of respondents)</strong> represent a highly engaged segment with direct stakes in GHAC's success.
                    This group brings unique perspectives on programming, community needs, and ecosystem health. Their responses reveal deep
                    knowledge of Hartford's arts landscape and detailed understanding of barriers facing creative practitioners. Many serve dual
                    roles as both creators and administrators, making them invaluable for strategic planning and peer outreach.
                  </p>
                  <p>
                    <strong>Past Supporters (22% of respondents)</strong> present significant reactivation opportunities. This segment includes
                    lapsed donors and former workplace giving participants who maintain interest in GHAC's mission despite reduced engagement.
                    Their responses suggest that life transitions, communication gaps, and unclear impact reporting contributed to disengagement.
                    Targeted re-cultivation campaigns with clear impact messaging could yield strong returns from this warm prospect pool.
                  </p>
                  <p>
                    <strong>Other Community Members (11% of respondents)</strong> include various stakeholder types such as arts educators,
                    organizational leaders, and community partners. This diverse segment demonstrates the breadth of GHAC's ecosystem reach
                    and provides perspectives from adjacent sectors that inform comprehensive engagement strategies.
                  </p>
                </div>
              </Card>

              <Card title="Priority Themes & Messaging Insights">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Across all engagement archetypes, three consistent priorities emerge: <strong>sustaining the creative economy (mentioned by 
                    78% of respondents), expanding youth access (64%), and removing practical barriers</strong> (47%). These shared values 
                    provide a foundation for unified messaging while allowing for archetype-specific tactical approaches.
                  </p>
                  <p>
                    The creative economy theme resonates particularly strongly among High-Capacity Prospects and Community-Curious segments, 
                    who frequently connect arts programming to broader economic development and regional identity. Representative comments include 
                    concerns about "brain drain" among young professionals and the role of arts in attracting businesses to Greater Hartford. 
                    <strong>This economic framing appears more compelling to newer donors than traditional arts appreciation messaging</strong>, 
                    suggesting opportunity to expand beyond core arts constituencies.
                  </p>
                  <p>
                    Youth access emerges as a universal concern, but with distinct motivational drivers by archetype. Loyal Supporters emphasize 
                    exposure and appreciation ("Every child deserves to experience live theater"), while High-Capacity Prospects focus on 
                    workforce development and educational outcomes ("Arts education builds critical thinking skills essential for 21st-century careers"). 
                    Artist-Connectors prioritize diversity and representation in programming for young people, often citing specific gaps in current 
                    offerings.
                  </p>
                  <p>
                    Practical barriers receive detailed attention across all segments, with time constraints (42%), financial limitations (38%), 
                    and lack of awareness (29%) representing the primary obstacles to increased engagement. However, solutions vary significantly 
                    by archetype. Loyal Supporters request more advance notice and flexible scheduling, Artist-Connectors suggest sliding-scale 
                    pricing and family programming, while High-Capacity Prospects prefer exclusive access that maximizes their limited time investment.
                  </p>
                </div>
              </Card>

              <Card title="Communication Preferences & Digital Engagement">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Communication preferences reveal clear digital-first patterns that should inform channel strategy.
                    <strong>Email newsletters maintain overwhelming dominance (83% preference)</strong> across all respondent types,
                    establishing email as the essential foundation for ongoing engagement. This strong preference suggests that
                    investment in sophisticated email segmentation and personalization will yield the highest engagement returns.
                  </p>
                  <p>
                    Social media engagement (61% preference) emerges as the strong secondary channel, particularly among connected
                    artists and younger supporters. This substantial preference indicates that social media serves not just as
                    a discovery tool but as a primary communication channel for the majority of engaged community members.
                    Multi-platform presence across Instagram, Facebook, and potentially LinkedIn becomes essential for
                    comprehensive reach.
                  </p>
                  <p>
                    Text/SMS communication (39% preference) and direct mail (33% preference) serve complementary roles for specific
                    engagement types. Text messaging works effectively for time-sensitive event reminders and last-minute opportunities,
                    while direct mail maintains relevance for formal invitations, impact reports, and cultivating major donor relationships.
                    The modest but meaningful preference for these channels suggests they should be deployed strategically rather than
                    universally.
                  </p>
                </div>
              </Card>

              <Card title="Revenue Insights & Giving Patterns">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Donor capacity analysis reveals substantial potential within the current community engagement base. Average reported
                    donation capacity of <strong>$716 across all respondents</strong> indicates meaningful giving potential, with a range
                    spanning from under $100 to $5,000+ gifts. This solid average suggests that segmented cultivation strategies from
                    annual fund programs to major gift conversations can all find receptive audiences within the current supporter base.
                  </p>
                  <p>
                    The data shows meaningful concentration in mid-to-upper giving ranges ($1,000-$5,000+), representing prime cultivation
                    targets for immediate development focus. Multiple respondents demonstrate both significant capacity and current engagement,
                    positioning them as ideal candidates for leadership annual fund, sustaining giving programs, and major gift conversations.
                    The presence of numerous $2,500+ capacity respondents signals substantial major gift potential that warrants dedicated
                    cultivation resources and personalized engagement strategies.
                  </p>
                  <p>
                    Current giving patterns from past and present supporters provide strong baseline data for ambitious growth projections.
                    The combination of demonstrated giving history, solid stated capacity ($716 average), and the exceptional 76.9%
                    demographic opt-in rate suggests that improved cultivation, clearer impact communication, and strategic relationship building
                    could yield significant revenue growth across all giving levels.
                  </p>
                </div>
              </Card>

              <Card title="Conclusion">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    The Greater Hartford Arts Council community engagement survey demonstrates the power of authentic dialogue-driven
                    research. With 65 completed responses, a 36.3% completion rate, and an exceptional 76.9% demographic opt-in rate,
                    the data validates both the survey methodology and the depth of community investment in GHAC's mission.
                  </p>
                  <p>
                    The findings reveal a committed core constituency with substantial giving capacity ($716 average) and clear communication
                    preferences. Current supporters and connected artists form the foundation, while past supporters represent immediate
                    reactivation opportunities. Geographic concentration in Hartford's core neighborhoods, combined with suburban representation,
                    maps clear pathways for targeted outreach and relationship building.
                  </p>
                  <p>
                    Most importantly, this survey establishes baseline metrics for measuring future engagement growth and validates
                    relationship-driven approaches to donor development. The exceptional opt-in rates and completion quality confirm
                    that Greater Hartford's arts community is ready for deeper, more meaningful connections with GHAC—connections that
                    can transform both organizational sustainability and regional arts impact.
                  </p>
                </div>
              </Card>

              {narr.length ? (
                <Card title="Representative Community Voices">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 italic">
                      These authentic responses demonstrate the depth of community engagement and provide insight into 
                      the values and priorities driving Greater Hartford's arts community.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {narr.slice(0, 4).map((n, i) => (
                        <blockquote key={i} className="rounded-lg border p-3 bg-[#E6F4EA] text-[#0E2A23] text-sm leading-6">"{n.text}"</blockquote>
                      ))}
                    </div>
                  </div>
                </Card>
              ) : null}
            </div>
          )}

          {tab === 'recommendations' && (
            <div className="space-y-6">
              <Card>
                <div className="space-y-2 text-sm">
                  <div className="text-xl font-bold text-gray-900 mb-4">GHAC Donor Engagement Initiative</div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">Strategic Analysis & Recommendations</div>
                  <div><strong>Prepared for:</strong> Greater Hartford Arts Council</div>
                  <div><strong>Prepared by:</strong> Nesolagus Team</div>
                  <div><strong>Date:</strong> October 2025</div>
                </div>
              </Card>

              <Card title="Executive Summary">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    The Greater Hartford Arts Council community engagement survey reveals a vibrant, committed constituency with deep
                    appreciation for arts as essential community infrastructure. Through comprehensive analysis of 65 completed responses
                    from 179 survey starts, we've identified distinct respondent profiles and strategic opportunities to strengthen
                    engagement, increase giving, and expand community reach.
                  </p>
                  <p>
                    Key findings indicate exceptional engagement quality, with a <strong>36.3% completion rate</strong> that exceeds industry
                    benchmarks and a remarkable <strong>76.9% demographic opt-in rate</strong> demonstrating high community trust. Average
                    donation capacity of <strong>$716</strong> signals meaningful revenue potential, while the strong completion rate
                    confirms the effectiveness of the relationship-driven survey approach.
                  </p>
                </div>
              </Card>

              <Card title="Strategic Recommendations">
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  
                  <div className="border-l-4 border-[#64B37A] pl-4">
                    <h4 className="font-semibold text-gray-900 mb-3">1. Implement Profile-Driven Engagement Strategy</h4>
                    <p className="mb-4">
                      Develop targeted communication and cultivation strategies for each of the four identified respondent profiles:
                      Current Supporters (39%), Connected Artists (28%), Past Supporters (22%), and Other Community Members (11%).
                    </p>

                    <div className="space-y-3 ml-4">
                      <div>
                        <span className="font-medium text-gray-900">Current Supporters:</span> Deepen relationships through leadership giving opportunities, exclusive programming access, and advocacy roles. Leverage their demonstrated commitment for peer-to-peer outreach and legacy giving conversations.
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Connected Artists:</span> Engage as strategic advisors on programming, ecosystem needs, and community barriers. Create opportunities for professional development, collaboration, and representation in GHAC decision-making.
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Past Supporters:</span> Execute targeted reactivation campaigns emphasizing renewed impact, improved communication, and clear giving outcomes. Address historical disengagement factors with transparent reporting and personalized re-cultivation.
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Other Community Members:</span> Develop pathways to deeper engagement through educational programming, partnership opportunities, and mission-aligned collaborations that leverage their unique organizational perspectives.
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-[#64B37A] pl-4">
                    <h4 className="font-semibold text-gray-900 mb-3">2. Launch Digital-First Communication Hub</h4>
                    <p className="mb-4">
                      Create an integrated communication strategy leveraging the preferred channels identified in our research:
                      email newsletters (83%), social media (61%), text/SMS (39%), and direct mail (33%).
                    </p>

                    <div className="space-y-3 ml-4">
                      <div>
                        <span className="font-medium text-gray-900">Email Strategy (Primary Channel):</span> Invest in sophisticated email platform with segmentation by profile type, giving history, and engagement level. Deploy bi-weekly newsletters with personalized content blocks, monthly impact reports, and event-specific communications.
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Social Media (Secondary Channel):</span> Multi-platform presence with Instagram-first creative content, Facebook for community building and event promotion, and LinkedIn for organizational partnerships and major donor cultivation.
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Text/SMS Strategy:</span> Opt-in text message program for time-sensitive event reminders, last-minute ticket opportunities, and urgent communications. Deploy strategically for maximum impact without overwhelming subscribers.
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Direct Mail (Targeted Use):</span> Reserve for quarterly major donor impact reports, formal event invitations, and annual campaign materials. Emphasize quality over frequency to maximize ROI.
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-[#64B37A] pl-4">
                    <h4 className="font-semibold text-gray-900 mb-3">3. Develop Accessibility-First Programming Model</h4>
                    <p className="mb-4">
                      Address the primary barriers identified in our research: time constraints (42%), financial limitations (38%), 
                      and lack of awareness (29%) through innovative programming and pricing strategies.
                    </p>
                    
                    <div className="space-y-3 ml-4">
                      <div>
                        <span className="font-medium text-gray-900">Flexible Scheduling:</span> Lunch-hour performances, weekend family programming, and evening events with childcare.
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Sliding Scale Pricing:</span> Income-based ticket pricing with anonymous verification system.
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Community Partnerships:</span> Collaborate with libraries, schools, and community centers for satellite programming.
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Transportation Solutions:</span> Shuttle services from suburban park-and-ride locations for major events.
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setShowAdditionalRecs(!showAdditionalRecs)}
                      className="flex items-center gap-2 text-[#64B37A] hover:text-[#2F6D49] transition-colors"
                    >
                      <span className={`transform transition-transform ${showAdditionalRecs ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                      <span className="font-medium">
                        {showAdditionalRecs ? 'Hide 4 Additional Strategic Recommendations' : 'See 4 Additional Strategic Recommendations'}
                      </span>
                    </button>
                  </div>

                  {showAdditionalRecs && (
                    <div className="space-y-6 mt-6 pt-6 border-t">
                      
                      <div className="border-l-4 border-[#86C99B] pl-4">
                        <h4 className="font-semibold text-gray-900 mb-3">4. Establish Corporate Partnership Program</h4>
                        <p className="mb-4">
                          Leverage Hartford's corporate presence to create sustainable funding streams and employee engagement 
                          opportunities through structured partnership tiers and employee volunteer programs.
                        </p>
                        
                        <div className="space-y-3 ml-4">
                          <div>
                            <span className="font-medium text-gray-900">Tier 1 Partners:</span> $25K+ annual commitment with board representation and naming rights
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Employee Engagement:</span> Volunteer days, team-building through arts workshops
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-[#A9D8B7] pl-4">
                        <h4 className="font-semibold text-gray-900 mb-3">5. Launch Youth Ambassador Initiative</h4>
                        <p className="mb-4">
                          Create pathways for next-generation engagement through high school and college ambassador programs 
                          that develop future arts leaders and donors.
                        </p>
                        
                        <div className="space-y-3 ml-4">
                          <div>
                            <span className="font-medium text-gray-900">High School Program:</span> 20 ambassadors annually with mentorship and internships
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">College Initiative:</span> Partnership with local universities for arts management students
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-[#0E2A23] pl-4">
                        <h4 className="font-semibold text-gray-900 mb-3">6. Implement Digital-First Member Experience</h4>
                        <p className="mb-4">
                          Develop mobile app and digital membership platform for seamless engagement and giving, featuring 
                          personalized content and streamlined donation processes.
                        </p>
                        
                        <div className="space-y-3 ml-4">
                          <div>
                            <span className="font-medium text-gray-900">Mobile App Features:</span> Event calendar, exclusive content, one-tap giving
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Digital Membership:</span> Tiered benefits with digital badges and recognition
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-[#64B37A] pl-4">
                        <h4 className="font-semibold text-gray-900 mb-3">7. Create Regional Arts Tourism Initiative</h4>
                        <p className="mb-4">
                          Partner with tourism boards and hotels to position Hartford as a regional arts destination, 
                          creating weekend packages and cultural trails.
                        </p>
                        
                        <div className="space-y-3 ml-4">
                          <div>
                            <span className="font-medium text-gray-900">Weekend Packages:</span> Hotel partnerships with arts event tickets and dining
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Cultural Trail:</span> Self-guided tours connecting multiple arts venues
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </Card>

              <Card title="Implementation Timeline">
                <div className="space-y-6">
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#64B37A] text-white flex items-center justify-center font-bold text-sm">Q1</div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">Foundation Phase</h5>
                      <p className="text-sm text-gray-600 mb-3">Implement archetype-driven communication strategy and launch accessibility initiatives</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Email Segmentation</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Sliding Scale Pricing</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Staff Training</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0E2A23] text-white flex items-center justify-center font-bold text-sm">Q2</div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">Expansion Phase</h5>
                      <p className="text-sm text-gray-600 mb-3">Launch corporate partnerships and digital platform development</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Corporate Outreach</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Mobile App Development</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Community Partnerships</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#86C99B] text-white flex items-center justify-center font-bold text-sm">Q3</div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">Innovation Phase</h5>
                      <p className="text-sm text-gray-600 mb-3">Launch youth initiatives and regional tourism partnerships</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Youth Ambassadors</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Tourism Partnerships</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Regional Expansion</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#64B37A] text-white flex items-center justify-center font-bold text-sm">Q4</div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">Optimization Phase</h5>
                      <p className="text-sm text-gray-600 mb-3">Analyze results, refine strategies, and plan for year two expansion</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Impact Assessment</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Strategy Refinement</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Year 2 Planning</span>
                      </div>
                    </div>
                  </div>

                </div>
              </Card>

              <Card title="Projected Outcomes">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#64B37A' }}>25%</div>
                    <div className="text-sm text-gray-600">Increase in donor retention</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#64B37A' }}>40%</div>
                    <div className="text-sm text-gray-600">Growth in new donor acquisition</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#64B37A' }}>60%</div>
                    <div className="text-sm text-gray-600">Improvement in engagement metrics</div>
                  </div>
                </div>
              </Card>

              <Card title="Conclusion">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    This survey provides a solid foundation for strategic donor development, revealing both immediate opportunities
                    and areas requiring focused outreach. The strong completion rate and exceptional demographic opt-in demonstrate
                    community readiness for deeper engagement, while the concentration of current supporters and connected artists
                    signals the need for expanded outreach to cultivate new relationships.
                  </p>
                  <p>
                    By implementing the recommendations outlined above—particularly personalized communication strategies, barrier
                    reduction initiatives, and targeted youth program development—GHAC can leverage these insights to build a more
                    diverse, engaged, and financially sustainable supporter base. The survey methodology itself, combining conversational
                    ease with analytical depth, provides a replicable model for ongoing community intelligence gathering.
                  </p>
                </div>
              </Card>

            </div>
          )}
        </div>
      </div>
    </section>
  );
}
