// Printable report export
import CONFIG from '@/data/client.config.json'
import MODELS from '@/data/archetype_models.json'
import ARCHETYPES from '@/data/archetypes.json'
import ChartFunnel from '@/components/ChartFunnel'
import CTParticipantMap from '@/components/maps/CTParticipantMap'
import AutoPrint from '@/components/print/AutoPrint'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

type Metrics = {
  surveyStarts: number
  completedSurveys: number
  completionRatePct: number
  demographicOptInPct: number
  averageDonationAmountUsd: number | null
}

function parseCSVStrict(text: string): string[][] {
  const rows: string[][] = []
  let cur: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') { const n = text[i + 1]; if (n === '"') { field += '"'; i++; } else { inQuotes = false } }
      else field += ch
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { cur.push(field); field = '' }
      else if (ch === '\n') { cur.push(field); rows.push(cur); cur = []; field = '' }
      else if (ch === '\r') {}
      else field += ch
    }
  }
  cur.push(field); rows.push(cur); return rows
}

async function readLatestDocsCsv(prefix: RegExp): Promise<{ name: string; table: string[][] } | null> {
  const docs = path.join(process.cwd(), 'docs')
  try {
    const files = await fs.readdir(docs)
    const matches = files.filter((f) => prefix.test(f))
    if (!matches.length) return null
    // pick lexicographically last (filenames have date)
    matches.sort()
    const name = matches[matches.length - 1]
    const raw = await fs.readFile(path.join(docs, name), 'utf8')
    return { name: `docs/${name}`, table: parseCSVStrict(raw) }
  } catch {
    return null
  }
}

function summarizeQuestions(table: string[][]) {
  if (!table.length) return [] as { question: string; total: number; kind: 'SCALE'|'SINGLE'|'MULTI'|'UNKNOWN'; items: { label: string; count: number; pct: number }[] }[]
  const header = table[0]
  const rows = table.slice(1)
  const META = /(response_id|respondent|name|email|phone|contact|started_at|completed_at|cohort|b\d+|url)/i
  const out: any[] = []
  for (let c = 0; c < header.length; c++) {
    const q = header[c]
    if (!q || META.test(q)) continue
    const values = rows.map(r => (r[c]||'').trim()).filter(Boolean)
    if (!values.length) continue
    const longFrac = values.filter(v=>v.length>120).length / values.length
    if (longFrac>0.5) continue
    const isMulti = values.filter(v=>v.includes(';')).length/values.length>0.2
    const numbersOnly = values.every(v=>/^\d+(?:\.\d+)?$/.test(v) || v==='')
    const counts = new Map<string, number>()
    if (isMulti) {
      for (const v of values) {
        for (const t of v.split(';')) {
          const token = t.trim(); if (!token) continue
          counts.set(token, (counts.get(token)||0)+1)
        }
      }
    } else {
      for (const v of values) counts.set(v, (counts.get(v)||0)+1)
    }
    if (counts.size<=1) continue
    const total = values.length
    const items = Array.from(counts.entries()).map(([label,count])=>({label, count, pct: Math.round((count/Math.max(1,total))*100)})).sort((a,b)=>b.count-a.count).slice(0,6)
    const kind = isMulti ? 'MULTI' : numbersOnly ? 'SCALE' : 'SINGLE'
    out.push({ question:q, total, items, kind })
  }
  return out.sort((a,b)=>b.total-a.total).slice(0,6)
}

function computeMetrics(table: string[][]): Metrics {
  if (!table.length) return { surveyStarts:0, completedSurveys:0, completionRatePct:0, demographicOptInPct:0, averageDonationAmountUsd:null }
  const header = table[0]; const rows = table.slice(1)
  const startedIdx = header.findIndex(h=>/started_at/i.test(h))
  const completedIdx = header.findIndex(h=>/completed_at/i.test(h))
  const zipIdx = header.findIndex(h=>/zip\s*code|zip/i.test(h))
  const starts = rows.filter(r=>(r[startedIdx]||'').trim()).length
  const completes = rows.filter(r=>(r[completedIdx]||'').trim()).length
  const demoOptInNumer = rows.filter(r=>{
    const zipOk = zipIdx>=0 && /^\d{5}$/.test((r[zipIdx]||'').trim())
    return zipOk
  }).length
  const demoOptInDenom = completes || starts || rows.length
  return {
    surveyStarts: starts,
    completedSurveys: completes,
    completionRatePct: Math.round((completes/Math.max(1,starts))*100),
    demographicOptInPct: Math.round((demoOptInNumer/Math.max(1,demoOptInDenom))*100),
    averageDonationAmountUsd: null,
  }
}

function participantsFrom(table: string[][]) {
  if (!table.length) return [] as any[]
  const header = table[0]; const rows = table.slice(1)
  const zipIdx = header.findIndex(h=>/zip/i.test(h))
  const counts = new Map<string, number>()
  const mixes: Map<string, Record<string, number>> = new Map()
  for (const r of rows) {
    const z = ((r[zipIdx]||'') as string).trim(); if (!/^\d{5}$/.test(z)) continue
    counts.set(z, (counts.get(z)||0)+1)
    // archetype inference via simple token rules from models
    const joined = r.join(' ').toLowerCase()
    const per: Record<string, number> = mixes.get(z) || {}
    for (const m of MODELS as any[]) {
      const tokens = (m.questionPatterns || []) as string[]
      const hit = tokens.some((t) => t && joined.includes(t.toLowerCase()))
      if (hit) per[m.name] = (per[m.name] || 0) + 1
    }
    mixes.set(z, per)
  }
  return Array.from(counts.entries()).map(([zip, count])=>({ zip, city: '', count, archetypes: mixes.get(zip) || undefined }))
}

function archetypeItemsFrom(points: any[]) {
  const tally: Record<string, number> = {}
  for (const name of Object.keys(ARCHETYPES as any)) tally[name] = 0
  for (const p of points) {
    const a = p.archetypes || {}
    for (const [k, v] of Object.entries(a)) tally[k] = (tally[k] || 0) + (Number(v) || 0)
  }
  return Object.entries(tally).map(([label, value])=>({label, value})).filter(i=>i.value>0)
}

async function loadData() {
  const main = await readLatestDocsCsv(/^ghac-survey-export-.*\.csv$/i)
  const narr = await readLatestDocsCsv(/^videoask-text-entries.*\.csv$/i)
  const questions = main ? summarizeQuestions(main.table) : []
  const metrics = main ? computeMetrics(main.table) : { surveyStarts:0, completedSurveys:0, completionRatePct:0, demographicOptInPct:0, averageDonationAmountUsd:null }
  const points = main ? participantsFrom(main.table) : []
  let narratives: { text: string }[] = []
  if (narr && narr.table.length) {
    const header = narr.table[0]; const rows = narr.table.slice(1)
    let qIdx = header.findIndex((h) => /^q\d+\./i.test(h) && !/urls|duration/i.test(h))
    if (qIdx < 0) qIdx = header.findIndex((h) => /\[text answer\]|\[transcribed\]/i.test(h))
    narratives = rows.map(r => ({ text: (r[qIdx]||'').trim() })).filter(n=>n.text)
  }
  return { metrics, questions, points, narratives }
}

export default async function PrintReportPage() {
  const { metrics: m, questions, points, narratives } = await loadData()

  const archItems = archetypeItemsFrom(points)
  const fmtPct = (n?: number | null) => (n == null ? '—' : `${(typeof n === 'number' ? n : 0).toFixed(1)}%`)
  const fmtUsd = (n?: number | null) => (n == null ? '—' : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)

  return (
    <main className="mx-auto max-w-[1024px] p-8 print:p-8 bg-white text-gray-900">
      {/* Auto print when navigated here */}
      <AutoPrint />

      {/* Header */}
      <section className="mb-6">
        <div className="text-xs text-gray-500">{new Date().toLocaleString()}</div>
        <h1 className="text-2xl font-semibold">{(CONFIG as any).brand?.name || 'Client'} — Donor Insights Snapshot</h1>
        <p className="text-sm text-gray-600">Key engagement metrics, highlights, archetypes, geography, and narratives</p>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-5 gap-3 mb-6">
        <Kpi label="Starts" value={m?.surveyStarts ?? '—'} />
        <Kpi label="Completes" value={m?.completedSurveys ?? '—'} />
        <Kpi label="Completion Rate" value={fmtPct(m?.completionRatePct)} />
        <Kpi label="Demographic Opt‑in" value={fmtPct(m?.demographicOptInPct)} />
        <Kpi label="Average Donation" value={fmtUsd(m?.averageDonationAmountUsd)} />
      </section>

      {/* Archetypes + Map */}
      <section className="grid grid-cols-2 gap-6 mb-6">
        <Panel title="Archetype Snapshot">
          {archItems.length ? (
            <>
              <ChartFunnel data={archItems} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {archItems.map((a) => (
                  <div key={a.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: (MODELS as any[]).find(m=>m.name===a.label)?.color || '#86C99B' }} />
                    <span className="text-gray-700">{a.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No archetype data.</p>
          )}
        </Panel>

        <Panel title="Geography">
          {points.length ? (
            <div className="h-[360px]">
              {/* Non-interactive map for print */}
              <CTParticipantMap points={points} />
            </div>
          ) : (
            <p className="text-sm text-gray-500">No location data.</p>
          )}
        </Panel>
      </section>

      {/* Question Highlights */}
      <Panel title="Question Highlights">
        {questions.length === 0 ? (
          <p className="text-sm text-gray-500">No question summaries available.</p>
        ) : (
          <div className="space-y-5">
            {questions.slice(0, 4).map((qq) => (
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
      </Panel>

      {/* Narratives */}
      <Panel title="Narrative Samples">
        {narratives.length ? (
          <div className="grid grid-cols-2 gap-3">
            {narratives.slice(0, 12).map((n, i) => (
              <div key={i} className="rounded border p-3 bg-[#E6F4EA]">
                <div className="text-[11px] text-gray-500 mb-1">Participant reflection</div>
                <blockquote className="text-sm leading-6 text-[#0E2A23]">“{n.text}”</blockquote>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No narratives found.</p>
        )}
      </Panel>

      <footer className="mt-8 text-xs text-gray-500">
        Data source: chatbot responses; generated {new Date().toLocaleString()}
      </footer>
    </main>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-base font-semibold mb-2">{title}</h2>
      <div className="rounded-lg border p-4">{children}</div>
    </section>
  )
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  )
}
