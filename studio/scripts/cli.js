#!/usr/bin/env node
const { loadEnv } = require('../src/utils/loadEnv')
loadEnv() // Load .env file into process.env

const fs = require('fs')
const path = require('path')
const { runPipeline } = require('../src/pipeline')

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true
      if (key in args) {
        if (!Array.isArray(args[key])) args[key] = [args[key]]
        args[key].push(val)
      } else {
        args[key] = val
      }
    }
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv)
  const discovery = ([]).concat(args.discovery || [])
  const methodology = ([]).concat(args.methodology || [])
  const files = [...discovery, ...methodology].filter(Boolean)
  if (files.length === 0) {
    console.error('Usage: node scripts/cli.js --discovery <file> --methodology <file> --client "Acme" --max-minutes 8 --output out.json')
    process.exit(1)
  }
  const sources = files.map(f => ({ title: path.basename(f), text: fs.readFileSync(f, 'utf8') }))
  const maxMinutes = Number(args['max-minutes'] || args.maxMinutes || 8)
  const tone = (args.tone ? String(args.tone).split(',').map(s => s.trim()).filter(Boolean) : undefined)
  const archetypes = (args.archetypes ? String(args.archetypes).split(',').map(s => s.trim()).filter(Boolean) : undefined)
  const segments = (args.segments ? String(args.segments).split(',').map(s => s.trim()).filter(Boolean) : undefined)

  const { methodBrief, config, issues, estimatedSeconds, provenance } = await runPipeline({
    sources,
    params: {
      client: args.client || 'unknown',
      constraints: { max_minutes: maxMinutes, anonymity: 'anonymous' },
      tone, archetypes, segments,
    },
  })

  const outPath = args.output || 'survey.config.json'
  fs.writeFileSync(outPath, JSON.stringify(config, null, 2))

  console.log('--- Method Brief ---')
  console.log(JSON.stringify(methodBrief, null, 2))
  console.log('\n--- Validation & Lints ---')
  if (issues.length === 0) console.log('No issues. ✅')
  else issues.forEach(i => console.log(`- [${i.code}] ${i.message}${i.nodeId ? ` (node: ${i.nodeId})` : ''}`))
  console.log(`\nEstimated max path duration: ${Math.round(estimatedSeconds)} seconds`) 
  console.log(`Output written to: ${outPath}`)
}

main().catch(err => { console.error(err); process.exit(1) })

