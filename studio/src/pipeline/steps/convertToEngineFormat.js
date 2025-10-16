/**
 * Converts our internal survey format to the survey engine's blocks-based format.
 *
 * Input format:
 * {
 *   version: "1.0.0",
 *   meta: { title, lang },
 *   flow: { start, nodes: {...} }
 * }
 *
 * Output format:
 * {
 *   survey: { id, name, description, metadata },
 *   blocks: { b0: {...}, b1: {...} }
 * }
 */

/**
 * @param {any} config - Internal survey config
 * @param {import('../../contracts/types').MethodBrief} brief - Method brief for metadata
 * @returns {object} - Survey engine compatible format
 */
function convertToEngineFormat(config, brief) {
  const nodes = config?.flow?.nodes || {}
  const startNodeId = config?.flow?.start || 'intro-1'

  // Create survey metadata
  const survey = {
    id: generateSurveyId(brief.client),
    name: config.meta?.title || `${brief.client} Survey`,
    description: brief.goals.join(', ') || 'AI-generated survey',
    metadata: {
      estimatedMinutes: brief.constraints.max_minutes,
      version: config.version || '1.0.0',
      generatedBy: 'question-generator',
      generatedAt: new Date().toISOString()
    }
  }

  // Convert nodes to blocks with sequential IDs starting at b0
  const blocks = {}
  const nodeIdMap = {} // Maps old IDs to new block IDs
  let blockCounter = 0

  // First pass: create ID mapping in flow order
  const orderedNodeIds = getFlowOrder(nodes, startNodeId)
  for (const oldId of orderedNodeIds) {
    nodeIdMap[oldId] = `b${blockCounter}`
    blockCounter++
  }

  // Second pass: convert each node to a block
  for (const oldId of orderedNodeIds) {
    const node = nodes[oldId]
    const blockId = nodeIdMap[oldId]
    blocks[blockId] = convertNodeToBlock(node, blockId, nodeIdMap, oldId)
  }

  // Third pass: handle conditional routing by creating router blocks
  const blocksArray = Object.entries(blocks)
  for (const [blockId, block] of blocksArray) {
    if (block.next && typeof block.next === 'object' && block.next._needsRouter) {
      const routerInfo = block.next
      const routerId = `${blockId}_router`

      // Update this block to point to router
      block.next = routerId

      // Create router block
      blocks[routerId] = createRouterBlock(
        routerId,
        block.variable,
        routerInfo.conditions,
        routerInfo.elseBlock
      )
    }
  }

  return { survey, blocks }
}

/**
 * Get nodes in flow order (DFS from start)
 */
function getFlowOrder(nodes, startId) {
  const order = []
  const visited = new Set()

  function visit(id) {
    if (!id || visited.has(id) || !nodes[id]) return
    visited.add(id)
    order.push(id)

    const node = nodes[id]
    if (node.type === 'end') return

    // Visit next nodes
    const nextIds = getNextNodeIds(node)
    for (const nextId of nextIds) {
      visit(nextId)
    }
  }

  visit(startId)

  // Add any unvisited nodes (orphaned nodes)
  for (const id in nodes) {
    if (!visited.has(id)) {
      order.push(id)
    }
  }

  return order
}

/**
 * Extract all next node IDs from a node
 */
function getNextNodeIds(node) {
  const ids = []
  if (typeof node.next === 'string') {
    ids.push(node.next)
  } else if (node.next && typeof node.next === 'object') {
    // Conditional next
    if (Array.isArray(node.next.if)) {
      for (const rule of node.next.if) {
        if (rule.goto) ids.push(rule.goto)
      }
    }
    if (node.next.else) ids.push(node.next.else)
  }
  return ids
}

/**
 * Convert a node to a block
 */
function convertNodeToBlock(node, blockId, nodeIdMap, originalId) {
  const block = {
    id: blockId,
    type: convertNodeType(node.type),
    content: node.text || node.prompt || '',
  }

  // Add variable for question types
  if (needsVariable(node.type)) {
    block.variable = generateVariableName(originalId, node)
  }

  // Add type-specific properties
  switch (node.type) {
    case 'message':
      block.autoAdvance = true
      block.autoAdvanceDelay = 2000
      break

    case 'text':
      block.placeholder = 'Type your answer here...'
      break

    case 'singleChoice':
    case 'multiChoice':
      block.options = convertOptions(node.options)
      if (node.type === 'multiChoice') {
        block.maxSelections = node.options?.length || 5
      }
      break

    case 'rating':
      // Convert rating to scale with emoji options
      block.type = 'scale'
      block.options = convertRatingToScaleOptions(node.scale)
      break

    case 'number':
      block.type = 'text-input'
      block.placeholder = 'Enter a number...'
      if (node.min !== undefined) block.min = node.min
      if (node.max !== undefined) block.max = node.max
      break

    case 'video':
      block.type = 'mixed-media'
      block.placeholder = 'Share your thoughts after watching...'
      break
  }

  // Add next pointer (convert old IDs to new block IDs)
  if (node.type !== 'end') {
    block.next = convertNext(node.next, nodeIdMap)
  }

  return block
}

/**
 * Convert node type to block type
 */
function convertNodeType(nodeType) {
  const typeMap = {
    'message': 'dynamic-message',
    'text': 'text-input',
    'number': 'text-input',
    'singleChoice': 'single-choice',
    'multiChoice': 'multi-choice',
    'rating': 'scale',
    'video': 'mixed-media',
    'end': 'final-message'
  }
  return typeMap[nodeType] || 'text-input'
}

/**
 * Check if node type needs a variable
 */
function needsVariable(nodeType) {
  return !['message', 'end'].includes(nodeType)
}

/**
 * Generate variable name from node ID
 */
function generateVariableName(nodeId, node) {
  // Clean up the ID to make a valid variable name
  let varName = nodeId
    .replace(/^(intro|q|sc|mc|rate|num|vid)-/, '') // Remove prefixes
    .replace(/-/g, '_') // Replace hyphens with underscores

  // Add type prefix for clarity
  const typePrefix = {
    'text': 'text',
    'number': 'num',
    'singleChoice': 'choice',
    'multiChoice': 'multi',
    'rating': 'rating',
    'video': 'video'
  }[node.type] || 'answer'

  return `${typePrefix}_${varName}`
}

/**
 * Convert options array
 */
function convertOptions(options = []) {
  return options.map(opt => ({
    id: opt.id,
    label: opt.label,
    value: opt.id, // Use ID as value
  }))
}

/**
 * Convert rating scale to scale options with emoji
 */
function convertRatingToScaleOptions(scale = {}) {
  const min = scale.min || 1
  const max = scale.max || 5
  const labelMin = scale.labelMin || 'Not at all'
  const labelMax = scale.labelMax || 'Very much'

  const emojis = ['😞', '😐', '🙂', '😊', '🤩']
  const options = []

  for (let i = min; i <= max; i++) {
    const position = (i - min) / (max - min) // 0 to 1
    const emojiIndex = Math.floor(position * (emojis.length - 1))

    let label
    if (i === min) label = labelMin
    else if (i === max) label = labelMax
    else label = String(i)

    options.push({
      id: String(i),
      value: String(i),
      label: label,
      emoji: emojis[emojiIndex]
    })
  }

  return options
}

/**
 * Convert next pointer to new block IDs
 * Returns either a string block ID or an object indicating we need a router block
 */
function convertNext(next, nodeIdMap) {
  if (typeof next === 'string') {
    return nodeIdMap[next] || next
  }

  // Conditional next - we need to create a router block
  // Return a marker object that will be processed later
  if (next && typeof next === 'object' && next.if && next.else) {
    return {
      _needsRouter: true,
      conditions: next.if.map(cond => ({
        when: cond.when,
        goto: nodeIdMap[cond.goto] || cond.goto
      })),
      elseBlock: nodeIdMap[next.else] || next.else
    }
  }

  return undefined
}

/**
 * Create a router block for conditional routing
 */
function createRouterBlock(routerId, variable, conditions, elseBlock) {
  const routerBlock = {
    id: routerId,
    type: 'dynamic-message',
    content: '', // Empty message, just for routing
    autoAdvance: true,
    autoAdvanceDelay: 0
  }

  // Build nested if/then/else structure for multiple conditions
  function buildConditionalNext(condArray, finalElse) {
    if (!condArray || condArray.length === 0) {
      return finalElse
    }

    const [first, ...rest] = condArray

    // Convert the first condition
    const ifCondition = convertCondition(first.when, variable)

    if (!ifCondition) {
      // If conversion failed, skip to next condition
      return buildConditionalNext(rest, finalElse)
    }

    // Build the else branch (either another condition or the final else)
    const elseBranch = rest.length > 0
      ? buildConditionalNext(rest, finalElse)
      : finalElse

    return {
      if: ifCondition,
      then: first.goto,
      else: elseBranch
    }
  }

  // Helper to convert condition format from internal to engine format
  function convertCondition(when, variable) {
    if (!when) return null

    if (when.lt) {
      return { variable, lessThan: when.lt.answer }
    } else if (when.gt) {
      return { variable, greaterThan: when.gt.answer }
    } else if (when.equals) {
      return { variable, equals: when.equals.answer }
    } else if (when.in) {
      return { variable, in: when.in.answer }
    }

    return null
  }

  // Build the conditional structure
  const conditionalNext = buildConditionalNext(conditions, elseBlock)

  if (conditionalNext && typeof conditionalNext === 'object' && conditionalNext.if) {
    routerBlock.conditionalNext = conditionalNext
  } else {
    // Fallback: no valid conditions, just route to else
    routerBlock.next = elseBlock
  }

  return routerBlock
}

/**
 * Generate survey ID from client name
 */
function generateSurveyId(clientName) {
  const cleaned = clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const timestamp = Date.now().toString(36).slice(-6)
  return `${cleaned}-${timestamp}`
}

module.exports = { convertToEngineFormat }
