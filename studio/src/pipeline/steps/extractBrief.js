const { getLLM } = require('../../llm')

/**
 * Heuristic extraction of a MethodBrief from raw text sources + params.
 * In production this would use an LLM with a schema-constrained JSON output.
 * @param {{ title: string, text: string }[]} sources
 * @param {{ client?: string, constraints?: { max_minutes?: number, anonymity?: 'anonymous'|'opt-in'|'identified' }, tone?: string[], archetypes?: string[], segments?: string[] }} params
 * @returns {import('../../contracts/types').MethodBrief}
 */
function extractBrief(sources, params = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return extractBriefHeuristic(sources, params)
  return extractBriefLLM(sources, params)
}

function extractBriefHeuristic(sources, params = {}) {
  const allText = sources.map(s => s.text).join('\n\n')
  const lower = allText.toLowerCase()
  const goals = pickBullets(lower, ['goal', 'objective']) || ['Understand user needs']
  const segments = params.segments || pickBullets(lower, ['segment', 'audience']) || ['general']
  const archetypes = params.archetypes || pickBullets(lower, ['archetype', 'persona']) || ['general']
  const tone = params.tone || guessTone(lower)
  const max_minutes = (params.constraints && params.constraints.max_minutes) || 8
  const anonymity = (params.constraints && params.constraints.anonymity) || 'anonymous'
  return { client: params.client || 'unknown', goals, segments, archetypes, tone, constraints: { max_minutes, anonymity }, keywords: keywordHints(lower) }
}

async function extractBriefLLM(sources, params = {}) {
  const llm = getLLM()
  const system = 'You are a senior research strategist. Extract a concise MethodBrief JSON from provided discovery + methodology text. Output ONLY strict JSON matching the given schema.'
  const schema = `Schema MethodBrief = { client: string; goals: string[]; segments: string[]; archetypes: string[]; tone: string[]; constraints: { max_minutes: number; anonymity: "anonymous"|"opt-in"|"identified"; languages?: string[] }; keywords?: string[] }`
  const mergedParams = {
    client: params.client || 'unknown',
    tone: params.tone || undefined,
    archetypes: params.archetypes || undefined,
    segments: params.segments || undefined,
    constraints: params.constraints || { max_minutes: 8, anonymity: 'anonymous' },
  }
  const user = [
    `TARGET CLIENT: ${mergedParams.client}`,
    `PARAM OVERRIDES (optional): ${JSON.stringify(mergedParams)}`,
    schema,
    'Sources:',
    ...sources.map(s => `--- ${s.title} ---\n${s.text}`),
    'Instruction: Return a JSON object MethodBrief. Keep tone words short (e.g., ["warm","inviting"]).'
  ].join('\n\n')
  const json = await llm.complete({ system, user, json: true, maxTokens: 800, temperature: 0.2 })
  // Minimal post-checks and defaults
  json.client ||= mergedParams.client
  if (!Array.isArray(json.goals) || json.goals.length === 0) json.goals = ['Understand user needs']
  if (!Array.isArray(json.segments) || json.segments.length === 0) json.segments = mergedParams.segments || ['general']
  if (!Array.isArray(json.archetypes) || json.archetypes.length === 0) json.archetypes = mergedParams.archetypes || ['general']
  if (!Array.isArray(json.tone) || json.tone.length === 0) json.tone = mergedParams.tone || ['neutral']
  json.constraints ||= {}
  json.constraints.max_minutes = Number(json.constraints.max_minutes || mergedParams.constraints?.max_minutes || 8)
  json.constraints.anonymity = json.constraints.anonymity || mergedParams.constraints?.anonymity || 'anonymous'
  return json
}

function pickBullets(text, keywords) {
  const lines = text.split(/\r?\n/)
  const picked = []
  for (const ln of lines) {
    const t = ln.trim()
    if (!t) continue
    const has = keywords.some(k => t.includes(k))
    if (has) {
      const afterColon = t.split(':').slice(1).join(':').trim()
      if (afterColon) picked.push(capitalize(afterColon))
    }
  }
  return picked.length ? uniq(picked).slice(0, 10) : null
}

function guessTone(text) {
  const tone = []
  if (/(trust|respect|inclusive|warm)/.test(text)) tone.push('warm')
  if (/(friendly|inviting|approachable)/.test(text)) tone.push('inviting')
  if (tone.length === 0) tone.push('neutral')
  return tone
}

function keywordHints(text) {
  const words = Array.from(new Set(text.split(/[^a-z0-9]+/g).filter(Boolean)))
  return words.filter(w => w.length > 3).slice(0, 20)
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
function uniq(arr) { return Array.from(new Set(arr)) }

module.exports = { extractBrief }
