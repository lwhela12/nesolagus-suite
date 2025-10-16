import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const docsDir = path.join(process.cwd(), 'docs')
    const files = await fs.readdir(docsDir)
    const pdf = files.find((f) => /methodology|framework/i.test(f) && /\.pdf$/i.test(f)) || files.find((f) => /\.pdf$/i.test(f))
    if (pdf) {
      const abs = path.join(docsDir, pdf)
      const data = await fs.readFile(abs)
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Cache-Control': 'public, max-age=300',
          'Content-Disposition': `inline; filename="${pdf}"`,
        },
      })
    }
  } catch {}
  return new NextResponse('Not Found', { status: 404 })
}
