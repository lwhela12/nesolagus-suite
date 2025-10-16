const { estimateNodeSeconds } = require('../../validation/duration')

/**
 * Convert question blocks into engine nodes and stitch next pointers.
 * Applies simple pruning to respect max_minutes cap.
 * @param {Array<{ kind: string, prompt?: string, text?: string, options?: Array<{id:string,label:string}>, tags?: string[], scale?: any }>} blocks
 * @param {import('../../contracts/types').MethodBrief} brief
 * @returns {import('../../contracts/types').SurveyConfig}
 */
function structureToConfig(blocks, brief) {
  const nodes = {}
  const order = []
  const add = (id, node) => { nodes[id] = node; order.push(id) }
  const idFor = (prefix, idx) => `${prefix}-${idx + 1}`

  // Build nodes, pruning if duration exceeds cap
  // Also insert acknowledgement messages after key questions
  // Process LLM-generated branches if present
  let accSec = 0
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    const id = idFor(kindPrefix(b.kind), order.length)
    const node = toNode(b)
    const sec = estimateNodeSeconds(node)
    if ((accSec + sec) / 60 > brief.constraints.max_minutes) break
    accSec += sec

    // If block has LLM-generated branches, store them for later processing
    if (b.branch) {
      node._llmBranch = b.branch
    }

    add(id, node)

    // Add acknowledgement after certain question types (unless it's already a message or has custom branches)
    if (!b.branch && shouldAddAcknowledgement(b.kind, i, blocks.length)) {
      const ackId = `ack-${order.length}`
      const ackNode = createAcknowledgement(b.kind, brief.tone)
      const ackSec = estimateNodeSeconds(ackNode)
      if ((accSec + ackSec) / 60 <= brief.constraints.max_minutes) {
        accSec += ackSec
        add(ackId, ackNode)
      }
    }
  }

  // No automatic rating branching - LLM decides all branching

  // Process LLM-generated branches (convert them to nodes)
  const llmBranchNodes = {}
  const branchTerminals = [] // Track branch terminal nodes that need linking
  for (const [id, node] of Object.entries(nodes)) {
    if (node._llmBranch) {
      const branchInfo = processLLMBranch(node._llmBranch, id, nodes, brief)
      llmBranchNodes[id] = branchInfo

      // Collect all terminal nodes from this branch
      branchInfo.allTerminalNodes.forEach(terminalId => {
        branchTerminals.push({ terminalId, parentId: id })
      })

      delete node._llmBranch
    }
  }

  // Link next pointers linearly, with conditional branches from LLM
  for (let i = 0; i < order.length; i++) {
    const id = order[i]
    const node = nodes[id]
    if (node.type === 'end') continue
    const nextId = order[i + 1] || 'end'

    // Check if this node has LLM-generated branches
    if (llmBranchNodes[id]) {
      const branchInfo = llmBranchNodes[id]
      node.next = {
        if: branchInfo.conditions,
        else: branchInfo.elseNodes[0] || nextId
      }
    } else {
      node.next = nextId
    }
  }

  // Link branch terminal nodes back to the main flow
  for (const { terminalId, parentId } of branchTerminals) {
    const parentIndex = order.indexOf(parentId)
    if (parentIndex >= 0) {
      const continueId = order[parentIndex + 1] || 'end'
      if (nodes[terminalId]) {
        nodes[terminalId].next = continueId
      }
    }
  }

  // Ensure start and end nodes
  if (!nodes['end']) nodes['end'] = { type: 'end' }
  const start = order[0] || 'end'

  return {
    version: '1.0.0',
    meta: { title: `${brief.client} — Survey`, lang: 'en' },
    flow: { start, nodes },
  }
}

/**
 * Process LLM-generated branch rules into nodes and conditions
 */
function processLLMBranch(branchRule, parentId, nodes, brief) {
  const conditions = []
  const elseNodes = []
  const allTerminalNodes = [] // All terminal nodes that need linking back to main flow

  // Process each condition branch
  if (branchRule.conditions && Array.isArray(branchRule.conditions)) {
    branchRule.conditions.forEach((cond, idx) => {
      // Convert the condition
      const when = convertLLMCondition(cond.when)

      // Convert the follow-up blocks to nodes
      const followUpNodes = convertFollowUpBlocks(cond.then, `${parentId}-branch${idx}`, nodes, brief)

      if (followUpNodes.length > 0 && when) {
        conditions.push({
          when,
          goto: followUpNodes[0] // First node in the branch
        })
        // Last node in this branch is a terminal
        allTerminalNodes.push(followUpNodes[followUpNodes.length - 1])
      }
    })
  }

  // Process else branch
  if (branchRule.else && Array.isArray(branchRule.else)) {
    const elseFollowUps = convertFollowUpBlocks(branchRule.else, `${parentId}-else`, nodes, brief)
    elseNodes.push(...elseFollowUps)
    // Last node in else branch is a terminal
    if (elseFollowUps.length > 0) {
      allTerminalNodes.push(elseFollowUps[elseFollowUps.length - 1])
    }
  }

  return { conditions, elseNodes, allTerminalNodes }
}

/**
 * Convert LLM condition format to internal format
 */
function convertLLMCondition(when) {
  if (!when || typeof when !== 'object') return null

  if (when.lessThan !== undefined) {
    return { lt: { answer: when.lessThan } }
  }
  if (when.greaterThan !== undefined) {
    return { gt: { answer: when.greaterThan } }
  }
  if (when.equals !== undefined) {
    return { equals: { answer: when.equals } }
  }
  if (when.includes !== undefined) {
    return { in: { answer: [when.includes] } }
  }

  return null
}

/**
 * Convert follow-up blocks from LLM into nodes
 */
function convertFollowUpBlocks(blocks, prefix, nodes, brief) {
  if (!Array.isArray(blocks)) return []

  const nodeIds = []
  blocks.forEach((block, idx) => {
    const nodeId = `${prefix}-${idx}`
    const node = toNode(block)
    nodes[nodeId] = node
    nodeIds.push(nodeId)

    // Link nodes sequentially within the branch
    if (idx > 0) {
      const prevId = nodeIds[idx - 1]
      nodes[prevId].next = nodeId
    }
  })

  // Terminal node's next will be set in the main linking phase

  return nodeIds
}


function kindPrefix(kind) {
  switch (kind) {
    case 'message': return 'intro'
    case 'text': return 'q'
    case 'number': return 'num'
    case 'singleChoice': return 'sc'
    case 'multiChoice': return 'mc'
    case 'rating': return 'rate'
    case 'video': return 'vid'
    default: return 'n'
  }
}

function toNode(b) {
  switch (b.kind) {
    case 'message': return { type: 'message', text: b.text || '', next: 'end', tags: b.tags }
    case 'text': return { type: 'text', prompt: b.prompt || '', next: 'end', tags: b.tags }
    case 'number': return { type: 'number', prompt: b.prompt || '', next: 'end', tags: b.tags }
    case 'singleChoice': return { type: 'singleChoice', prompt: b.prompt || '', options: b.options || [], next: 'end', tags: b.tags }
    case 'multiChoice': return { type: 'multiChoice', prompt: b.prompt || '', options: b.options || [], next: 'end', tags: b.tags }
    case 'rating': return { type: 'rating', prompt: b.prompt || '', next: 'end', tags: b.tags, scale: b.scale || { min: 1, max: 5 } }
    case 'video': return { type: 'video', prompt: b.prompt || '', next: 'end', tags: b.tags }
    default: return { type: 'message', text: b.text || b.prompt || '', next: 'end', tags: b.tags }
  }
}

/**
 * Determine if we should add an acknowledgement after this question
 */
function shouldAddAcknowledgement(kind, index, total) {
  // Don't add after intro/outro messages
  if (kind === 'message') return false

  // Add after ratings and important text questions
  // Skip the last question (will add final thank you separately)
  if (index >= total - 1) return false

  // Add after: ratings (always), every 2-3rd text/choice question
  if (kind === 'rating') return true
  if (kind === 'text' && index % 3 === 1) return true // Every 3rd text question
  if ((kind === 'singleChoice' || kind === 'multiChoice') && index % 4 === 2) return true

  return false
}

/**
 * Create an acknowledgement message node
 */
function createAcknowledgement(questionKind, tone = ['warm']) {
  const toneWord = tone[0] || 'warm'

  let text
  if (questionKind === 'rating') {
    // Will be conditionally branched based on rating value
    text = 'Thank you for your feedback'
  } else if (questionKind === 'text') {
    text = getTextAcknowledgement(toneWord)
  } else {
    text = getChoiceAcknowledgement(toneWord)
  }

  return {
    type: 'message',
    text,
    next: 'end', // Will be updated in linking phase
    tags: ['acknowledgement']
  }
}

function getTextAcknowledgement(tone) {
  const messages = {
    warm: 'Thank you for sharing that with us',
    inviting: 'I really appreciate you taking the time to share',
    professional: 'Thank you for your input',
    friendly: 'Thanks for letting us know!',
    casual: 'Got it, thanks for sharing'
  }
  return messages[tone] || 'Thank you for sharing'
}

function getChoiceAcknowledgement(tone) {
  const messages = {
    warm: 'Thank you, that\'s helpful to know',
    inviting: 'I appreciate your response',
    professional: 'Noted, thank you',
    friendly: 'Thanks for letting us know',
    casual: 'Got it, thanks'
  }
  return messages[tone] || 'Thank you'
}


module.exports = { structureToConfig }
