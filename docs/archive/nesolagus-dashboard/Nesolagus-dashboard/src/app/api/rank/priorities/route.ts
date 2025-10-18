import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { promises as fs } from 'fs'
import path from 'path'

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

export async function GET() {
  try {
    const docs = path.join(process.cwd(), 'docs')
    const files = await fs.readdir(docs)
    const target = files.find(f => /^ghac-survey-export-.*\.csv$/i.test(f))
    if (!target) return NextResponse.json({ ok: true, items: [] })
    const raw = await fs.readFile(path.join(docs, target), 'utf8')
    const table = parseCSVStrict(raw)
    if (!table.length) return NextResponse.json({ ok: true, items: [] })
    const header = table[0]
    const idx = header.findIndex(h => /as we look ahead.*strengthened/i.test(h))
    if (idx < 0) return NextResponse.json({ ok: true, items: [] })
    const rows = table.slice(1)
    const points: Record<string, number> = {}
    for (const r of rows) {
      const cell = (r[idx] || '').trim()
      if (!cell) continue
      const cleaned = cell.replace(/\[.*?\]|\(.*?\)/g, '')
      let parts: string[] = []
      if (cell.includes(';')) parts = cleaned.split(';')
      else if (cell.includes('>')) parts = cleaned.split('>')
      else parts = cleaned.split(',')
      parts = parts.map(s => s.trim()).filter(Boolean)
      const N = parts.length
      parts.forEach((p, i) => { const w = N - i; points[p] = (points[p] || 0) + w })
    }
    const total = Object.values(points).reduce((a,b)=>a+b,0) || 1
    const items = Object.entries(points)
      .map(([label, value]) => ({ label, value, pct: Math.round((value/total)*100) }))
      .sort((a,b)=>b.value-a.value)
    return NextResponse.json({ ok: true, items })
  } catch {
    return NextResponse.json({ ok: true, items: [] })
  }
}
