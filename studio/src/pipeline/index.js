const { generateSurveyDirect } = require('./steps/generateSurveyDirect')
const { validateAndRepair } = require('./steps/validateAndRepair')

// Legacy multi-step pipeline (kept for reference/fallback)
const { extractBrief } = require('./steps/extractBrief')
const { draftQuestions } = require('./steps/draftQuestions')
const { structureToConfig } = require('./steps/structureToConfig')
const { convertToEngineFormat } = require('./steps/convertToEngineFormat')
const { estimateTotalSeconds } = require('../validation/duration')

/**
 * Run the simplified 2-step pipeline: (1) LLM generates final format, (2) validate
 * @param {{ sources: { title: string, text: string }[], params: { client?: string, tone?: string[], archetypes?: string[], segments?: string[], constraints?: { max_minutes?: number, anonymity?: 'anonymous'|'opt-in'|'identified' } } }} input
 * @returns {Promise<{ config: any, issues: any[], provenance: any }>}
 */
async function runPipeline(input) {
  const useDirect = process.env.USE_DIRECT_GENERATION !== 'false' // Default to true

  if (useDirect && process.env.ANTHROPIC_API_KEY) {
    return runDirectPipeline(input)
  } else {
    return runLegacyPipeline(input)
  }
}

/**
 * New simplified pipeline: LLM generates final format directly
 */
async function runDirectPipeline(input) {
  const { sources, params } = input

  try {
    // Step 1: LLM generates complete survey in final format
    const config = await generateSurveyDirect(input)

    // Step 2: Validate and repair
    const maxMinutes = params.constraints?.max_minutes || 10
    const { issues } = validateAndRepair(
      { flow: { nodes: config.blocks, start: 'b0' } },
      { maxMinutes }
    )

    const provenance = {
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
      steps: ['generateSurveyDirect', 'validateAndRepair'],
      sourceCount: sources.length,
      pipeline: 'direct'
    }

    return { config, issues, provenance }
  } catch (error) {
    console.error('Direct generation failed, falling back to legacy pipeline:', error.message)
    return runLegacyPipeline(input)
  }
}

/**
 * Legacy multi-step pipeline (kept for fallback)
 */
async function runLegacyPipeline(input) {
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
    pipeline: 'legacy'
  }
  return { methodBrief, config, issues, estimatedSeconds, provenance }
}

module.exports = { runPipeline }
