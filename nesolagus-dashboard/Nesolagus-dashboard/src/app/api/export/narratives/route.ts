import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { promises as fs } from 'fs'
import path from 'path'

function toCSV(rows: (string|number)[][]) {
  return rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
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
      if (ch === '"') { const n = text[i+1]; if (n === '"') { field+='"'; i++; } else { inQuotes=false } }
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

export async function GET() {
  try {
    const docs = path.join(process.cwd(), 'docs')
    if (!(await fileExists(docs))) return NextResponse.json({ ok: true, empty: true }, { status: 200 })
    const files = await fs.readdir(docs)
    const targets = files.filter(f => /^videoask-text-entries.*\.csv$/i.test(f))
    const rows: (string|number)[][] = [[ 'question', 'text', 'completed_at', 'source' ]]
    for (const f of targets) {
      const raw = await fs.readFile(path.join(docs, f), 'utf8')
      const table = parseCSVStrict(raw)
      if (!table.length) continue
      const header = table[0]
      let qIdx = header.findIndex((h) => /^q\d+\./i.test(h) && !/urls|duration/i.test(h))
      if (qIdx < 0) qIdx = header.findIndex((h) => /\[text answer\]|\[transcribed\]/i.test(h))
      const dtIdx = header.findIndex((h) => /date\/?time|completed/i.test(h))
      const qHeader = header[qIdx] || 'VideoAsk Response'
      const question = (qHeader || '').replace(/\s*\(.+$/, '').trim()
      for (const r of table.slice(1)) {
        const rawText = (r[qIdx] || '').trim()
        if (!rawText) continue
        const text = rawText.replace(/^\[(Text Answer|Transcribed)\]\s*/i, '')
        rows.push([question, text, r[dtIdx] || '', f])
      }
    }
    const csv = toCSV(rows)
    return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="narratives.csv"' } })
  } catch {
    const csv = toCSV([[ 'question','text','completed_at','source' ]])
    return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8' } })
  }
}

