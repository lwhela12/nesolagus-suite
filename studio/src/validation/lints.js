const { estimateTotalSeconds } = require('./duration')

/** @typedef {import('../contracts/types')} Types */

/**
 * Check that start exists in nodes.
 * @param {any} config
 * @returns {Array<{code:string, message:string, nodeId?:string}>}
 */
function checkStartNodeExists(config) {
  const issues = []
  const nodes = (config && config.flow && config.flow.nodes) || {}
  if (!nodes[config?.flow?.start]) {
    issues.push({ code: 'start_missing', message: 'flow.start does not exist in nodes' })
  }
  return issues
}

/**
 * Check that all next references resolve to existing node IDs.
 * @param {any} config
 */
function checkNextRefsResolve(config) {
  const issues = []
  const nodes = config?.flow?.nodes || {}
  const nodeIds = new Set(Object.keys(nodes))

  for (const [id, node] of Object.entries(nodes)) {
    if (!node || node.type === 'end') continue
    const next = node.next
    if (typeof next === 'string') {
      if (!nodeIds.has(next)) issues.push({ code: 'next_missing', message: `next references missing node '${next}'`, nodeId: id })
    } else if (next && typeof next === 'object') {
      if (!Array.isArray(next.if) || typeof next.else !== 'string') {
        issues.push({ code: 'next_invalid', message: 'conditional next must have if[] and else', nodeId: id })
      } else {
        for (const rule of next.if) {
          if (!nodeIds.has(rule.goto)) issues.push({ code: 'next_missing', message: `conditional goto '${rule.goto}' missing`, nodeId: id })
        }
        if (!nodeIds.has(next.else)) issues.push({ code: 'next_missing', message: `else goto '${next.else}' missing`, nodeId: id })
      }
    } else {
      issues.push({ code: 'next_invalid', message: 'next must be string or {if[],else}', nodeId: id })
    }
  }
  return issues
}

/**
 * Ensure no cycles in the graph (forward-only DAG model).
 * @param {any} config
 */
function checkNoCycles(config) {
  const nodes = config?.flow?.nodes || {}
  const visited = new Set()
  const stack = new Set()
  const issues = []

  function edges(id) {
    const node = nodes[id]
    if (!node || node.type === 'end') return []
    const n = node.next
    if (typeof n === 'string') return [n]
    if (n && typeof n === 'object') {
      const outs = n.if?.map(r => r.goto) || []
      if (typeof n.else === 'string') outs.push(n.else)
      return outs
    }
    return []
  }

  function dfs(id) {
    if (stack.has(id)) {
      issues.push({ code: 'cycle', message: `cycle detected at ${id}`, nodeId: id })
      return
    }
    if (visited.has(id)) return
    visited.add(id)
    stack.add(id)
    for (const to of edges(id)) dfs(to)
    stack.delete(id)
  }

  const start = config?.flow?.start
  if (start) dfs(start)
  return issues
}

/**
 * Option IDs must be unique per node and kebab-case.
 * @param {any} config
 */
function checkOptionIds(config) {
  const issues = []
  const nodes = config?.flow?.nodes || {}
  const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  for (const [id, node] of Object.entries(nodes)) {
    if (!node || (node.type !== 'singleChoice' && node.type !== 'multiChoice')) continue
    const seen = new Set()
    for (const opt of node.options || []) {
      if (seen.has(opt.id)) issues.push({ code: 'option_duplicate', message: `duplicate option id '${opt.id}'`, nodeId: id })
      seen.add(opt.id)
      if (!kebab.test(opt.id)) issues.push({ code: 'option_kebab', message: `option id '${opt.id}' must be kebab-case`, nodeId: id })
    }
  }
  return issues
}

/**
 * Non-end nodes must have next, end may not.
 * (Basic rule enforced in schema validator; repeated as a lint for clarity.)
 * @param {any} config
 */
function checkTerminalRules(config) {
  const issues = []
  const nodes = config?.flow?.nodes || {}
  for (const [id, node] of Object.entries(nodes)) {
    if (!node) continue
    if (node.type === 'end') continue
    if (!('next' in node)) issues.push({ code: 'next_missing', message: 'non-end node missing next', nodeId: id })
  }
  return issues
}

/**
 * Estimate max path duration and check against cap.
 * @param {any} config
 * @param {number} maxMinutes
 */
function checkDurationCap(config, maxMinutes) {
  const totalSec = estimateTotalSeconds(config)
  if (maxMinutes == null || isNaN(maxMinutes)) return []
  const capSec = maxMinutes * 60
  if (totalSec > capSec) return [{ code: 'duration_exceeds_cap', message: `estimated ${Math.round(totalSec)}s exceeds cap ${capSec}s` }]
  return []
}

module.exports = {
  checkStartNodeExists,
  checkNextRefsResolve,
  checkNoCycles,
  checkOptionIds,
  checkTerminalRules,
  checkDurationCap,
}

