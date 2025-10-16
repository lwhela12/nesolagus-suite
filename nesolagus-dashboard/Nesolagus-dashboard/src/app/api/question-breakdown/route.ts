// src/app/api/question-breakdown/route.ts
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { promises as fs } from 'fs'
import path from 'path'
import { getAllQuestions } from '@/lib/comprehensive-xlsx-parser'

type Item = { label: string; count: number; pct: number }
type Q = { question: string; total: number; items: Item[]; kind: 'SCALE' | 'SINGLE' | 'MULTI' | 'UNKNOWN' }

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

// Columns to ignore (PII/metadata). Use loose matching so variants like
// respondent_name or respondent email are excluded.
// Also exclude the "first name" question as it's not meaningful for analysis
const META_COLS = /(response_id|respondent|email|phone|contact|started_at|completed_at|cohort|b\d+|first name|what should i call you|what's your name)/i

const OMIT_LABELS = new Set<string>(['aaron test', 'lucas test'])

function summarize(table: string[][]): Q[] {
  if (!table.length) return []
  const header = table[0]
  const rows = table.slice(1)

  function trimQ(s: string) {
    const clean = s.replace(/!\[[^\]]*\]\([^)]*\)/g, '') // strip image markdown
      .replace(/https?:[^\s)]+/g, '')
      .replace(/\s+/g, ' ') // collapse spaces
      .trim()
    return clean.length > 140 ? clean.slice(0, 137) + '…' : clean
  }

  const summaries: Q[] = []

  for (let c = 0; c < header.length; c++) {
    const q = header[c]
    if (!q || META_COLS.test(q)) continue

    const values = rows.map((r) => (r[c] || '').trim()).filter(Boolean)
    if (!values.length) continue

    // Heuristics to skip narrative questions here; we show those elsewhere
    const longFrac = values.filter((v) => v.length > 120).length / values.length
    if (longFrac > 0.5) continue

    // Count tokenized multi-select answers if ';' appears often
    const isMulti = values.filter((v) => v.includes(';')).length / values.length > 0.2
    const numbersOnly = values.every((v) => /^\d+(?:\.\d+)?$/.test(v) || v === '')

    const counts = new Map<string, number>()
    if (isMulti) {
      for (const v of values) {
        for (const t of v.split(';')) {
          const token = t.trim()
          if (!token) continue
          const norm = token.toLowerCase()
          if (OMIT_LABELS.has(norm)) continue
          counts.set(token, (counts.get(token) || 0) + 1)
        }
      }
    } else {
      for (const v of values) {
        const token = v
        // ignore boilerplate tokens
        if (/^(acknowledged|skipped|start|yes|no|prefer-not)$/i.test(token)) continue
        const norm = token.toLowerCase()
        if (OMIT_LABELS.has(norm)) continue
        counts.set(token, (counts.get(token) || 0) + 1)
      }
    }

    // require some diversity
    if (counts.size <= 1) continue

    const total = values.length
    const items = Array.from(counts.entries())
      .map(([label, count]) => ({ label, count, pct: Math.round((count / Math.max(total, 1)) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
    const kind: Q['kind'] = isMulti ? 'MULTI' : numbersOnly ? 'SCALE' : 'SINGLE'
    summaries.push({ question: trimQ(q), total, items, kind })
  }

  // Return top questions by total response count
  return summaries.sort((a, b) => b.total - a.total).slice(0, 6)
}

export async function GET(req: Request) {
  // Try XLSX from src/data/ FIRST (most recent data)
  try {
    const xlsxPath = path.join(process.cwd(), 'src/data/ghac-survey-export.xlsx')
    if (await fileExists(xlsxPath)) {
      const questions = getAllQuestions()
      return NextResponse.json({ ok: true, source: 'src/data/ghac-survey-export.xlsx', questions })
    }
  } catch (err) {
    console.error('Error loading questions from XLSX:', err)
  }

  // Fallback to CSV
  try {
    const url = new URL(req.url)
    const all = url.searchParams.get('all') === '1'
    const docsDir = path.join(process.cwd(), 'docs')
    if (await fileExists(docsDir)) {
      const files = await fs.readdir(docsDir)
      const target = files.find((f) => /^ghac-survey-export-.*\.csv$/i.test(f))
      if (target) {
        const raw = await fs.readFile(path.join(docsDir, target), 'utf8')
        const table = parseCSVStrict(raw)
        const questions = (function(){
          const res = summarize(table)
          return all ? res.concat() : res
        })()
        return NextResponse.json({ ok: true, source: `docs/${target}`, questions })
      }
    }
  } catch {}

  return NextResponse.json({ ok: true, questions: [] })
}
