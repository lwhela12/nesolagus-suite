// src/app/api/participants/route.ts
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { promises as fs } from 'fs'
import path from 'path'
import ZIP_TO_CITY from '@/data/zip_to_city.json'
import MODELS from '@/data/archetype_models.json'
import { getParticipantsByZip } from '@/lib/comprehensive-xlsx-parser'

type ArchetypeBreakdown = Record<string, number>
type ParticipantPoint = {
  zip: string
  city: string
  count: number
  archetypes?: ArchetypeBreakdown
}

async function fileExists(p: string) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

// Minimal RFC4180 CSV parser (handles quotes and commas within fields)
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
        if (next === '"') { field += '"'; i++; } // escaped quote
        else { inQuotes = false }
      } else {
        field += ch
      }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { cur.push(field); field = '' }
      else if (ch === '\n') { cur.push(field); rows.push(cur); cur = []; field = '' }
      else if (ch === '\r') { /* ignore */ }
      else field += ch
    }
  }
  // flush last
  cur.push(field)
  rows.push(cur)
  return rows
}

function parseCSV(text: string): ParticipantPoint[] {
  const rows = parseCSVStrict(text)
  if (!rows.length) return []
  const header = rows[0].map((h) => h.trim())
  const colZip = header.findIndex((h) => /^(zip|zipcode|zcta)$/i.test(h))
  const colCity = header.findIndex((h) => /^city$/i.test(h))
  const colCount = header.findIndex((h) => /^count$/i.test(h))
  const archetypeCols = header
    .map((h, i) => ({ h, i }))
    .filter(({ h, i }) => i !== colZip && i !== colCity && i !== colCount)

  const body = rows.slice(1)
  const out: ParticipantPoint[] = []
  for (const cells of body) {
    if (!cells || !cells.length) continue
    const zip = (cells[colZip] || '').trim()
    const city = (colCity >= 0 ? (cells[colCity] || '').trim() : '')
    const count = Number(colCount >= 0 ? (cells[colCount] || 0) : 0)
    const archetypes: ArchetypeBreakdown = {}
    for (const { h, i } of archetypeCols) {
      const v = Number(cells[i] || 0)
      if (!isNaN(v) && v > 0) archetypes[h] = v
    }
    if (zip) out.push({ zip, city, count: isNaN(count) ? 0 : count, archetypes })
  }
  return out
}

function fallbackData(): ParticipantPoint[] {
  return [
    { zip: '06112', city: 'Hartford', count: 2, archetypes: { 'Loyal Supporter': 1, 'Community-Curious': 1 } },
    { zip: '06105', city: 'Hartford', count: 3, archetypes: { 'Artist-Connector': 1, 'Lapsed Donor / Workplace Alumni': 1, 'Loyal Supporter': 1 } },
    { zip: '06117', city: 'West Hartford', count: 2, archetypes: { 'High-Capacity Prospect': 1, 'Ambassador / Future Leader': 1 } },
    { zip: '06001', city: 'Avon', count: 1, archetypes: { 'High-Capacity Prospect': 1 } },
    { zip: '06002', city: 'Bloomfield', count: 1, archetypes: { 'Community-Curious': 1 } },
    { zip: '06107', city: 'West Hartford', count: 1, archetypes: { 'Loyal Supporter': 1 } },
    { zip: '06111', city: 'Newington', count: 1, archetypes: { 'Ambassador / Future Leader': 1 } },
    { zip: '06085', city: 'Farmington', count: 1, archetypes: { 'Loyal Supporter': 1 } },
    { zip: '06335', city: 'Gales Ferry', count: 1, archetypes: { 'Artist-Connector': 1 } },
    { zip: '06415', city: 'Colchester', count: 1, archetypes: { 'Community-Curious': 1 } },
  ]
}

export async function GET() {
  try {
    // First, try XLSX from src/data/
    const xlsxPath = path.join(process.cwd(), 'src/data/ghac-survey-export.xlsx')
    if (await fileExists(xlsxPath)) {
      const zipData = getParticipantsByZip()
      const data: ParticipantPoint[] = zipData.map(({ zip, count }) => ({
        zip,
        city: (ZIP_TO_CITY as any)[zip] || '',
        count,
      }))
      if (data.length > 0) return NextResponse.json({ ok: true, data, source: 'src/data/ghac-survey-export.xlsx' })
    }

    // Prefer JSON if present
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'participants.json')
    if (await fileExists(jsonPath)) {
      const buf = await fs.readFile(jsonPath, 'utf8')
      const data = JSON.parse(buf) as ParticipantPoint[]
      const mapped = data.map((p) => ({ ...p, city: p.city || (ZIP_TO_CITY as any)[p.zip] || '' }))
      if (mapped.length > 0) return NextResponse.json({ ok: true, data: mapped })
      // fall through if empty
    }

    // Fallback to CSV
    const csvPath = path.join(process.cwd(), 'src', 'data', 'participants.csv')
    if (await fileExists(csvPath)) {
      const buf = await fs.readFile(csvPath, 'utf8')
      const data = parseCSV(buf).map((p) => ({ ...p, city: p.city || (ZIP_TO_CITY as any)[p.zip] || '' }))
      if (data.length > 0) return NextResponse.json({ ok: true, data })
      // fall through if empty
    }

    // Try discovery export in docs/
    const docsDir = path.join(process.cwd(), 'docs')
    if (await fileExists(docsDir)) {
      const files = await fs.readdir(docsDir)
      const target = files.find((f) => /^ghac-survey-export-.*\.csv$/i.test(f))
      if (target) {
        const raw = await fs.readFile(path.join(docsDir, target), 'utf8')
        // Parse and aggregate by ZIP
        const table = parseCSVStrict(raw)
        if (table.length >= 2) {
          const header = table[0]
          const zipIdx = header.findIndex((h) => /zip/i.test(h))
          const counts = new Map<string, number>()
          const mixes: Map<string, Record<string, number>> = new Map()
          const rows = table.slice(1)
          for (const row of rows) {
            const z = ((row[zipIdx] || '') as string).trim()
            if (!/^\d{5}$/.test(z)) continue
            counts.set(z, (counts.get(z) || 0) + 1)
            // archetype inference via simple token rules from models
            const joined = row.join(' ').toLowerCase()
            const per: Record<string, number> = mixes.get(z) || {}
            for (const m of MODELS as any[]) {
              const tokens = (m.questionPatterns || []) as string[]
              const hit = tokens.some((t) => joined.includes(t.toLowerCase()))
              if (hit) per[m.name] = (per[m.name] || 0) + 1
            }
            mixes.set(z, per)
          }
          const data: ParticipantPoint[] = Array.from(counts.entries()).map(([zip, count]) => ({
            zip,
            city: (ZIP_TO_CITY as any)[zip] || '',
            count,
            archetypes: mixes.get(zip) || undefined,
          }))
          if (data.length > 0) return NextResponse.json({ ok: true, data, source: `docs/${target}` })
          // fall through if we couldn't aggregate anything useful
        }
      }
    }
  } catch (e) {
    // continue to fallback
  }

  return NextResponse.json({ ok: true, data: fallbackData(), fallback: true })
}
