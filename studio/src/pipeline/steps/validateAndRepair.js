const { validateSchema } = require('../../validation/validator')
const { getJsonSchemaValidator } = require('../../validation/jsonSchemaValidator')
const {
  checkStartNodeExists,
  checkNextRefsResolve,
  checkNoCycles,
  checkOptionIds,
  checkTerminalRules,
  checkDurationCap,
} = require('../../validation/lints')

/**
 * Validate config against schema and lints. Attempt basic auto-repair once.
 * @param {any} config
 * @param {{ maxMinutes?: number }} opts
 * @returns {{ config: any, issues: Array<{code:string, message:string, nodeId?:string}>, repaired: boolean }}
 */
function validateAndRepair(config, opts = {}) {
  let issues = collectIssues(config, opts)
  let repaired = false
  if (issues.length === 0) return { config, issues, repaired }

  // Attempt simple repairs
  const nodes = config?.flow?.nodes || {}

  // Ensure end node exists
  if (!nodes['end']) nodes['end'] = { type: 'end' }

  // Fix missing start
  if (!config.flow.start) config.flow.start = Object.keys(nodes)[0] || 'end'

  // Redirect broken next references to end
  for (const [id, node] of Object.entries(nodes)) {
    if (!node || node.type === 'end') continue
    const n = node.next
    const exists = (key) => nodes[key]
    if (typeof n === 'string') {
      if (!exists(n)) node.next = 'end'
    } else if (n && typeof n === 'object') {
      if (!Array.isArray(n.if)) n.if = []
      n.if = n.if.filter(rule => exists(rule.goto))
      if (!exists(n.else)) n.else = 'end'
    }
  }

  repaired = true
  issues = collectIssues(config, opts)
  return { config, issues, repaired }
}

function collectIssues(config, opts) {
  const ajvValidate = getJsonSchemaValidator()
  const schema = ajvValidate ? ajvValidate(config) : validateSchema(config)
  const lints = [
    ...checkStartNodeExists(config),
    ...checkTerminalRules(config),
    ...checkNextRefsResolve(config),
    ...checkNoCycles(config),
    ...checkOptionIds(config),
    ...checkDurationCap(config, opts.maxMinutes ?? config?.methodBrief?.constraints?.max_minutes),
  ]
  const schemaIssues = schema.valid ? [] : schema.errors.map(e => ({ code: 'schema', message: `${e.path}: ${e.message}` }))
  return [...schemaIssues, ...lints]
}

module.exports = { validateAndRepair }
