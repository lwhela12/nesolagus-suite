const { getLLM } = require('../../llm')

/**
 * Draft narrative question blocks from a MethodBrief.
 * Uses Anthropic (if configured) or deterministic fallback.
 * @param {import('../../contracts/types').MethodBrief} brief
 * @returns {Promise<Array<{ kind: string, prompt?: string, text?: string, options?: Array<{id:string,label:string}>, tags?: string[], scale?: any }>>}
 */
async function draftQuestions(brief) {
  if (process.env.ANTHROPIC_API_KEY) {
    try { return await draftQuestionsLLM(brief) } catch (e) { /* fallback below */ }
  }
  return draftQuestionsFallback(brief)
}

async function draftQuestionsLLM(brief) {
  const llm = getLLM()
  const system = 'You are a survey architect. Propose a concise, on-brand sequence of survey blocks as JSON. You can optionally add conditional branching for complex flows. Return ONLY JSON array of blocks.'
  const schema = `Block[] where Block =
  | { kind: "message", text: string, tags?: string[], branch?: BranchRule }
  | { kind: "text", prompt: string, tags?: string[], branch?: BranchRule }
  | { kind: "number", prompt: string, tags?: string[], branch?: BranchRule }
  | { kind: "singleChoice", prompt: string, options: {id:string,label:string}[], tags?: string[], branch?: BranchRule }
  | { kind: "multiChoice", prompt: string, options: {id:string,label:string}[], tags?: string[], branch?: BranchRule }
  | { kind: "rating", prompt: string, scale?: { min:number, max:number, labelMin?:string, labelMax?:string }, tags?: string[], branch?: BranchRule }
  | { kind: "video", prompt: string, tags?: string[], branch?: BranchRule }

BranchRule = {
  conditions: Array<{ when: Condition, then: FollowUpBlock[] }>,
  else?: FollowUpBlock[]
}

Condition =
  | { lessThan: number }      // For rating/number questions
  | { greaterThan: number }   // For rating/number questions
  | { equals: string|number } // For any question
  | { includes: string }      // For multi-choice (selected option includes this value)

FollowUpBlock = Block (same as above, can include nested branches)`
  const user = [
    'MethodBrief:',
    JSON.stringify(brief, null, 2),
    schema,
    'Rules:',
    `- Generate enough questions to use 70-80% of the ${brief.constraints.max_minutes}-minute time budget`,
    '- Time estimates: message~5s, text~30s, singleChoice~15s, multiChoice~20s, rating~10s',
    '- Include: 1 warm intro message, 8-12 substantive questions (mix of text/choice/rating)',
    '- Prioritize depth and quality insights over brevity',
    '- Options need kebab-case ids',
    '- Use varied question types to maintain engagement',
    '',
    'BRANCHING GUIDANCE:',
    '- Analyze the uploaded documents carefully to understand when branching adds value',
    '- Add branches to acknowledge specific responses and ask relevant follow-ups when appropriate',
    '- Examples of good branching:',
    '  * Rating question: if low score (1-3) → acknowledge concern + ask "What could we improve?"',
    '  * Rating question: if high score (8-10) → acknowledge positively + ask "What did you enjoy most?"',
    '  * Multi-choice "What interests you?": branch to deeper questions about selected topics',
    '  * Single-choice about role: branch to role-specific questions',
    '- Branching is OPTIONAL - only add it when:',
    '  * The document context indicates certain responses need follow-up',
    '  * You want to acknowledge and validate specific sentiment (especially negative feedback)',
    '  * Different answer paths lead to genuinely different insights',
    '- NOT every question needs branches - simple linear flow is often better',
    '- Keep branches purposeful and aligned with the research goals from the documents'
  ].join('\n')
  const arr = await llm.complete({ system, user, json: true, maxTokens: 3000, temperature: 0.3 })
  if (!Array.isArray(arr)) throw new Error('Expected JSON array of blocks')
  // sanitize
  const tags = (brief.archetypes || []).slice(0, 3)
  return arr.map(b => sanitizeBlock(b, tags)).filter(Boolean)
}

function sanitizeBlock(b, tags) {
  if (!b || typeof b !== 'object') return null
  const kind = b.kind
  if (!kind) return null
  const t = () => Array.isArray(b.tags) ? b.tags : tags
  const branch = b.branch && typeof b.branch === 'object' ? b.branch : undefined

  if (kind === 'message') return { kind, text: String(b.text || '').slice(0, 300), tags: t(), branch }
  if (kind === 'text') return { kind, prompt: String(b.prompt || '').slice(0, 300), tags: t(), branch }
  if (kind === 'number') return { kind, prompt: String(b.prompt || '').slice(0, 300), tags: t(), branch }
  if (kind === 'singleChoice') return { kind, prompt: String(b.prompt || '').slice(0, 300), options: uniqueOptions((b.options||[]).map(o => o.label || o.id || '').slice(0, 8)), tags: t(), branch }
  if (kind === 'multiChoice') return { kind, prompt: String(b.prompt || '').slice(0, 300), options: uniqueOptions((b.options||[]).map(o => o.label || o.id || '').slice(0, 10)), tags: t(), branch }
  if (kind === 'rating') {
    const scale = b.scale && typeof b.scale === 'object' ? { min: Number(b.scale.min)||1, max: Number(b.scale.max)||5, labelMin: b.scale.labelMin||'Not at all', labelMax: b.scale.labelMax||'Very' } : { min:1, max:5, labelMin:'Not at all', labelMax:'Very' }
    return { kind, prompt: String(b.prompt || 'Overall, how satisfied are you?').slice(0, 300), scale, tags: t(), branch }
  }
  if (kind === 'video') return { kind, prompt: String(b.prompt || '').slice(0, 300), tags: t(), branch }
  return null
}

function draftQuestionsFallback(brief) {
  const tags = brief.archetypes.slice(0, 3)
  const blocks = []
  blocks.push({ kind: 'message', text: `Hi! We’re gathering input for ${brief.client}. This takes about ${brief.constraints.max_minutes} minutes.`, tags })
  for (const goal of brief.goals.slice(0, 3)) blocks.push({ kind: 'text', prompt: `In your own words, ${goal.toLowerCase()}.`, tags })
  blocks.push({ kind: 'singleChoice', prompt: `Which of the following best describes you?`, options: uniqueOptions(brief.segments.slice(0, 5)), tags })
  blocks.push({ kind: 'rating', prompt: 'Overall, how satisfied are you?', tags, scale: { min: 1, max: 5, labelMin: 'Not at all', labelMax: 'Very' } })
  const motiv = (brief.keywords || []).filter(w => !/the|and|with|from|this|that/i.test(w)).slice(0, 5)
  if (motiv.length >= 3) blocks.push({ kind: 'multiChoice', prompt: 'Which of these matter most to you?', options: uniqueOptions(motiv), tags })
  return blocks
}

function toKebab(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function uniqueOptions(items) {
  const seen = new Set()
  const opts = []
  for (const label of items) {
    const id = toKebab(label)
    if (!id || seen.has(id)) continue
    seen.add(id)
    opts.push({ id, label })
  }
  return opts
}

module.exports = { draftQuestions }
