const { extractBrief } = require('./steps/extractBrief')
const { draftQuestions } = require('./steps/draftQuestions')
const { structureToConfig } = require('./steps/structureToConfig')
const { validateAndRepair } = require('./steps/validateAndRepair')
const { convertToEngineFormat } = require('./steps/convertToEngineFormat')
const { estimateTotalSeconds } = require('../validation/duration')

/**
 * Run the MVP pipeline end-to-end on plain text sources.
 * @param {{ sources: { title: string, text: string }[], params: { client?: string, tone?: string[], archetypes?: string[], segments?: string[], constraints?: { max_minutes?: number, anonymity?: 'anonymous'|'opt-in'|'identified' } } }} input
 * @returns {Promise<{ methodBrief: any, config: any, issues: any[], estimatedSeconds: number, provenance: any }>}
 */
async function runPipeline(input) {
  const { sources, params } = input
  const methodBrief = await Promise.resolve(extractBrief(sources, params))
  const blocks = await Promise.resolve(draftQuestions(methodBrief))
  let internalConfig = structureToConfig(blocks, methodBrief)
  const { issues } = validateAndRepair(internalConfig, { maxMinutes: methodBrief.constraints.max_minutes })
  const estimatedSeconds = estimateTotalSeconds(internalConfig)

  // Convert to survey engine format
  const config = convertToEngineFormat(internalConfig, methodBrief)

  const provenance = {
    model: process.env.ANTHROPIC_API_KEY ? (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5') : 'mock-local',
    steps: ['extractBrief', 'draftQuestions', 'structureToConfig', 'validateAndRepair', 'convertToEngineFormat'],
    sourceCount: sources.length,
  }
  return { methodBrief, config, issues, estimatedSeconds, provenance }
}

module.exports = { runPipeline }
