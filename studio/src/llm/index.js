// LLM adapters: Anthropic and a minimal Mock for local usage.

/**
 * @typedef {{ complete: (params: { system: string, user: string, json?: boolean, maxTokens?: number, temperature?: number }) => Promise<any> }} LLM
 */

class MockAdapter {
  /** @param {{ seed?: number }} opts */
  constructor(opts = {}) { this.opts = opts }
  async complete(params) {
    const { user } = params
    if (params.json) return { ok: true, echo: user.slice(0, 200) }
    return `${user}`.slice(0, 400)
  }
}

class AnthropicAdapter {
  /**
   * @param {{ apiKey?: string, model?: string, baseUrl?: string }} opts
   */
  constructor(opts = {}) {
    this.apiKey = opts.apiKey || process.env.ANTHROPIC_API_KEY
    this.model = opts.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5'
    this.baseUrl = opts.baseUrl || process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1/messages'
    if (!this.apiKey) throw new Error('ANTHROPIC_API_KEY not set')
  }
  async complete({ system, user, json = false, maxTokens = 2000, temperature = 0.2 }) {
    const controller = new AbortController()
    const to = setTimeout(() => controller.abort(), 60_000)
    try {
      const body = {
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: 'user', content: user }],
      }
      // Note: Anthropic doesn't support response_format like OpenAI
      // We rely on prompt engineering (system/user prompts) to request JSON
      const res = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Anthropic error ${res.status}: ${text}`)
      }
      const data = await res.json()
      const text = (data && data.content && data.content[0] && data.content[0].text) || ''
      if (json) return safeParseJson(text)
      return text
    } finally {
      clearTimeout(to)
    }
  }
}

function safeParseJson(text) {
  const stripped = String(text).trim().replace(/^```(json)?/i, '').replace(/```$/i, '').trim()
  try { return JSON.parse(stripped) } catch (e) {
    // Try to extract first JSON object/array
    const m = stripped.match(/[\[{][\s\S]*[\]}]/)
    if (m) { try { return JSON.parse(m[0]) } catch(_) {} }
    throw new Error('Failed to parse JSON from model output')
  }
}

function getLLM() {
  if (process.env.LLM_VENDOR === 'anthropic' || process.env.ANTHROPIC_API_KEY) {
    try { return new AnthropicAdapter({}) } catch (e) { /* fallthrough */ }
  }
  return new MockAdapter()
}

module.exports = { MockAdapter, AnthropicAdapter, getLLM }
