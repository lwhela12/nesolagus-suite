import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { promises as fs } from 'fs'
import path from 'path'
import MODELS from '@/data/archetype_models.json'

function toCSV(rows: (string|number)[][]) {
  return rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
}

function parseCSVStrict(text: string): string[][] {
  const rows: string[][] = []
  let cur: string[] = []
  let field = ''
  let inQuotes = false
  for (let i=0;i<text.length;i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch==='"') { const n=text[i+1]; if (n==='"'){ field+='"'; i++; } else inQuotes=false }
      else field+=ch
    } else {
      if (ch==='"') inQuotes=true
      else if (ch===',') { cur.push(field); field='' }
      else if (ch==='\n') { cur.push(field); rows.push(cur); cur=[]; field='' }
      else if (ch==='\r') {}
      else field+=ch
    }
  }
  cur.push(field); rows.push(cur); return rows
}

export async function GET() {
  try {
    const docsDir = path.join(process.cwd(), 'docs')
    const files = await fs.readdir(docsDir)
    const target = files.find((f)=>/^ghac-survey-export-.*\.csv$/i.test(f))
    if (target) {
      const raw = await fs.readFile(path.join(docsDir, target), 'utf8')
      const table = parseCSVStrict(raw)
      if (table.length>=2) {
        const rows = table.slice(1)
        const tally: Record<string, number> = {}
        for (const m of MODELS as any[]) tally[m.name]=0
        for (const r of rows) {
          const joined = r.join(' ').toLowerCase()
          for (const m of MODELS as any[]) {
            const pats = (m.questionPatterns||[]) as string[]
            if (pats.some(p=>joined.includes(p.toLowerCase()))) tally[m.name]++
          }
        }
        const out = [['model','count'] as (string|number)[]]
        for (const [k,v] of Object.entries(tally)) out.push([k,v])
        const csv = toCSV(out)
        return new NextResponse(csv, { status:200, headers: { 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition':'attachment; filename="archetype_distribution.csv"' }})
      }
    }
  } catch {}
  const csv = toCSV([['model','count']])
  return new NextResponse(csv, { status:200, headers: { 'Content-Type':'text/csv; charset=utf-8' }})
}
