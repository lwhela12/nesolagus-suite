const PER_TYPE_SECONDS = {
  message: 5,
  text: 30,
  number: 15,
  singleChoice: 15,
  multiChoice: 20,
  rating: 10,
  video: 20,
}

/**
 * @param {any} node
 */
function estimateNodeSeconds(node) {
  if (!node || typeof node !== 'object') return 0
  const t = node.type
  return PER_TYPE_SECONDS[t] || 0
}

/**
 * Estimate the maximum path duration from start to an end node.
 * Assumes acyclic graph (forward-only). If cycles exist, guards by visited set.
 * @param {any} config
 */
function estimateTotalSeconds(config) {
  const nodes = config?.flow?.nodes || {}
  const start = config?.flow?.start
  const memo = new Map()
  const visiting = new Set()

  function maxPath(id) {
    if (!id || !nodes[id]) return 0
    if (memo.has(id)) return memo.get(id)
    if (visiting.has(id)) return 0
    visiting.add(id)
    const node = nodes[id]
    const here = estimateNodeSeconds(node)
    if (node.type === 'end') {
      memo.set(id, here)
      visiting.delete(id)
      return here
    }
    const n = node.next
    let branches = [0]
    if (typeof n === 'string') {
      branches = [maxPath(n)]
    } else if (n && typeof n === 'object') {
      branches = []
      for (const rule of n.if || []) branches.push(maxPath(rule.goto))
      branches.push(maxPath(n.else))
    }
    const best = here + Math.max(...branches)
    memo.set(id, best)
    visiting.delete(id)
    return best
  }

  return maxPath(start)
}

module.exports = { estimateNodeSeconds, estimateTotalSeconds, PER_TYPE_SECONDS }

