// src/app/api/metrics/route.ts
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { promises as fs } from 'fs'
import path from 'path'
import { getMetricsFromSurvey } from '@/lib/comprehensive-xlsx-parser'

type Metrics = {
  surveyStarts: number
  completedSurveys: number
  completionRatePct: number
  demographicOptInPct: number
  averageDonationAmountUsd: number | null
}

async function fileExists(p: string) {
  try { await fs.access(p); return true } catch { return false }
}

function parseCSVStrict(text: string): string[][] {
  const rows: string[][] = []
  let cur: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1]
        if (next === '"') { field += '"'; i++ } else { inQuotes = false }
      } else { field += ch }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { cur.push(field); field = '' }
      else if (ch === '\n') { cur.push(field); rows.push(cur); cur = []; field = '' }
      else if (ch === '\r') { /* ignore */ }
      else field += ch
    }
  }
  cur.push(field)
  rows.push(cur)
  return rows
}

function roundPct(n: number): number { return Math.round(Number.isFinite(n) ? n : 0) }

function parseDollar(s: string): number | null {
  // try plain number
  const m = s.match(/\$?\s*([0-9][0-9,]*)(?:\.(\d{1,2}))?/)
  if (m) {
    const val = Number(m[1].replace(/,/g, '')) + (m[2] ? Number('0.' + m[2]) : 0)
    return Number.isFinite(val) ? val : null
  }
  // ranges like "$100-249" or "Under $100" or "$5,000+"
  const range = s.trim()
  if (/under\s*\$?\s*([0-9][0-9,]*)/i.test(range)) {
    const v = Number(RegExp.$1.replace(/,/g, ''))
    return v ? v / 2 : null
  }
  if (/\$?\s*([0-9][0-9,]*)\s*[-–]\s*\$?\s*([0-9][0-9,]*)/i.test(range)) {
    const a = Number(RegExp.$1.replace(/,/g, ''))
    const b = Number(RegExp.$2.replace(/,/g, ''))
    return (a + b) / 2
  }
  if (/\$?\s*([0-9][0-9,]*)\s*\+/i.test(range)) {
    const a = Number(RegExp.$1.replace(/,/g, ''))
    return a
  }
  return null
}

export async function GET() {
  let metrics: Metrics = {
    surveyStarts: 0,
    completedSurveys: 0,
    completionRatePct: 0,
    demographicOptInPct: 0,
    averageDonationAmountUsd: null,
  }

  // First, try XLSX from src/data/
  try {
    const xlsxPath = path.join(process.cwd(), 'src/data/ghac-survey-export.xlsx')
    if (await fileExists(xlsxPath)) {
      const calculatedMetrics = getMetricsFromSurvey()
      metrics = calculatedMetrics
      return NextResponse.json({ ok: true, source: 'src/data/ghac-survey-export.xlsx', metrics })
    }
  } catch (err) {
    console.error('Error loading XLSX:', err)
  }

  // Try to compute from docs/ghac-survey-export-*.csv
  try {
    const docsDir = path.join(process.cwd(), 'docs')
    if (await fileExists(docsDir)) {
      const files = await fs.readdir(docsDir)
      const target = files.find((f) => /^ghac-survey-export-.*\.csv$/i.test(f))
      if (target) {
        const raw = await fs.readFile(path.join(docsDir, target), 'utf8')
        const table = parseCSVStrict(raw)
        if (table.length >= 2) {
          const header = table[0]
          const rows = table.slice(1)

          const startedIdx = header.findIndex((h) => /started_at/i.test(h))
          const completedIdx = header.findIndex((h) => /completed_at/i.test(h))
          const zipIdx = header.findIndex((h) => /zip\s*code/i.test(h))
          let donationIdx = header.findIndex((h) => /donation|donate|gift\s*amount|average\s*gift|pledge/i.test(h))
          // Look for common demographic fields to determine opt-in
          const ageIdx = header.findIndex((h) => /age\s*range|age\s*best\s*describes/i.test(h))
          const genderIdx = header.findIndex((h) => /gender\s*identity/i.test(h))
          const raceIdx = header.findIndex((h) => /racial|ethnic\s*background/i.test(h))
          const demoGateIdx = header.findIndex((h) => /before we wrap up.*willing to share a bit more/i.test(h))

          const starts = rows.filter((r) => (r[startedIdx] || '').trim()).length
          const completes = rows.filter((r) => (r[completedIdx] || '').trim()).length
          // Demographic opt-in: if gate exists, count rows with a positive/filled gate OR
          // if any demographic field (age/gender/race/zip) is non-empty/valid.
          const demoOptInNumer = rows.filter((r) => {
            const zipOk = zipIdx >= 0 && /^\d{5}$/.test((r[zipIdx] || '').trim())
            const ageOk = ageIdx >= 0 && (r[ageIdx] || '').trim().length > 0
            const genderOk = genderIdx >= 0 && (r[genderIdx] || '').trim().length > 0
            const raceOk = raceIdx >= 0 && (r[raceIdx] || '').trim().length > 0
            const gateRaw = (demoGateIdx >= 0 ? (r[demoGateIdx] || '') : '').toLowerCase()
            const gateOk = demoGateIdx >= 0 && /(yes|y|agree|ok|acknowledged)/.test(gateRaw)
            return gateOk || ageOk || genderOk || raceOk || zipOk
          }).length
          const demoOptInDenom = completes || starts || rows.length

          let avgDonation: number | null = null
          function scanDonationAt(idx: number) {
            const vals: number[] = []
            for (const r of rows) {
              const v = (r[idx] || '').trim()
              if (!v) continue
              const num = parseDollar(v)
              if (num != null) vals.push(num)
            }
            return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null
          }
          if (donationIdx >= 0) {
            avgDonation = scanDonationAt(donationIdx)
          } else {
            // Heuristic: find the column with most currency-like values
            let bestIdx = -1, bestHits = 0
            for (let i=0;i<header.length;i++) {
              let hits = 0
              for (const r of rows) {
                const cell = (r[i]||'') as string
                if (/\$|\d+\s*[-–]\s*\$?\d+|under\s*\$?\d+|\$?\d+\+/.test(cell)) hits++
              }
              if (hits>bestHits) { bestHits = hits; bestIdx = i }
            }
            if (bestIdx >= 0 && bestHits >= 3) avgDonation = scanDonationAt(bestIdx)
          }

          metrics = {
            surveyStarts: starts,
            completedSurveys: completes,
            completionRatePct: roundPct((completes / Math.max(starts, 1)) * 100),
            demographicOptInPct: roundPct((demoOptInNumer / Math.max(demoOptInDenom, 1)) * 100),
            averageDonationAmountUsd: avgDonation,
          }

          return NextResponse.json({ ok: true, source: `docs/${target}`, metrics })
        }
      }
    }
  } catch {}

  // Fallback to src/data/metrics.json if present
  try {
    const metricsPath = path.join(process.cwd(), 'src', 'data', 'metrics.json')
    if (await fileExists(metricsPath)) {
      const raw = await fs.readFile(metricsPath, 'utf8')
      const j = JSON.parse(raw)
      const k = j.kpis || {}
      metrics = {
        surveyStarts: Number(k.totalResponses || 0),
        completedSurveys: Number(k.completedSurveys || 0),
        completionRatePct: Number(k.completionRatePct || 0),
        demographicOptInPct: Number(k.optInRatePct || 0),
        averageDonationAmountUsd: null,
      }
      return NextResponse.json({ ok: true, source: 'src/data/metrics.json', metrics })
    }
  } catch {}

  // Default zeros if nothing available
  return NextResponse.json({ ok: true, source: 'default', metrics })
}
