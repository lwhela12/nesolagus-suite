import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const docsDir = path.join(process.cwd(), 'docs')
    const files = await fs.readdir(docsDir)
    const mp3 = files.find((f) => /\.mp3$/i.test(f))
    if (mp3) {
      const abs = path.join(docsDir, mp3)
      const data = await fs.readFile(abs)
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=300',
          'Content-Disposition': `inline; filename="${mp3}"`,
        },
      })
    }
  } catch {}
  return new NextResponse('Not Found', { status: 404 })
}
