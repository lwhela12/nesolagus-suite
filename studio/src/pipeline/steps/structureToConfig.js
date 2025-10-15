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
  let accSec = 0
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    const id = idFor(kindPrefix(b.kind), order.length)
    const node = toNode(b)
    const sec = estimateNodeSeconds(node)
    if ((accSec + sec) / 60 > brief.constraints.max_minutes) break
    accSec += sec
    add(id, node)

    // Add acknowledgement after certain question types (unless it's already a message)
    if (shouldAddAcknowledgement(b.kind, i, blocks.length)) {
      const ackId = `ack-${order.length}`
      const ackNode = createAcknowledgement(b.kind, brief.tone)
      const ackSec = estimateNodeSeconds(ackNode)
      if ((accSec + ackSec) / 60 <= brief.constraints.max_minutes) {
        accSec += ackSec
        add(ackId, ackNode)
      }
    }
  }

  // Add conditional acknowledgements for ratings (positive vs negative feedback)
  const ratingIds = order.filter(id => nodes[id].type === 'rating')
  const conditionalAcks = {}

  for (const ratingId of ratingIds) {
    // Find the acknowledgement that comes after this rating
    const ratingIndex = order.indexOf(ratingId)
    const nextId = order[ratingIndex + 1]

    if (nextId && nodes[nextId]?.tags?.includes('acknowledgement')) {
      // Create two conditional acknowledgements: positive and negative
      const positiveAckId = `${ratingId}-positive-ack`
      const negativeAckId = `${ratingId}-negative-ack`

      // Positive acknowledgement (rating 4-5)
      nodes[positiveAckId] = {
        type: 'message',
        text: getPositiveRatingAck(brief.tone),
        next: 'end', // Will be linked in next phase
        tags: ['acknowledgement', 'positive']
      }

      // Negative acknowledgement (rating 1-2) with optional followup
      const hasFollowup = Math.random() > 0.5 // 50% chance to add followup question
      if (hasFollowup) {
        const followupId = `${ratingId}-followup`
        nodes[followupId] = {
          type: 'text',
          prompt: 'What could we improve to make your experience better?',
          next: 'end',
          tags: ['followup']
        }
        nodes[negativeAckId] = {
          type: 'message',
          text: getNegativeRatingAck(brief.tone),
          next: followupId,
          tags: ['acknowledgement', 'negative']
        }
      } else {
        nodes[negativeAckId] = {
          type: 'message',
          text: getNegativeRatingAck(brief.tone),
          next: 'end',
          tags: ['acknowledgement', 'negative']
        }
      }

      // Store the conditional routing info
      conditionalAcks[nextId] = { positiveAckId, negativeAckId, ratingId }
    }
  }

  // Link next pointers linearly, with conditional branches for rating acknowledgements
  for (let i = 0; i < order.length; i++) {
    const id = order[i]
    const node = nodes[id]
    if (node.type === 'end') continue
    const nextId = order[i + 1] || 'end'

    // Check if this is a rating with conditional acknowledgements
    if (node.type === 'rating' && conditionalAcks[nextId]) {
      const { positiveAckId, negativeAckId } = conditionalAcks[nextId]
      // Route based on rating: 1-2 = negative, 4-5 = positive, 3 = skip to next
      node.next = {
        if: [
          { when: { lt: { answer: 3 } }, goto: negativeAckId },
          { when: { gt: { answer: 3 } }, goto: positiveAckId }
        ],
        else: order[i + 2] || 'end' // Rating of 3 skips acknowledgement
      }
    } else {
      node.next = nextId
    }
  }

  // Link the conditional acknowledgement nodes to continue the flow
  for (const [ackId, info] of Object.entries(conditionalAcks)) {
    const ackIndex = order.indexOf(ackId)
    const continueId = order[ackIndex + 1] || 'end'

    if (nodes[info.positiveAckId]) {
      nodes[info.positiveAckId].next = continueId
    }
    // Negative ack already has next set (either to followup or continueId)
    if (nodes[info.negativeAckId] && nodes[info.negativeAckId].next === 'end') {
      const followupId = `${info.ratingId}-followup`
      if (!nodes[followupId]) {
        nodes[info.negativeAckId].next = continueId
      } else {
        nodes[followupId].next = continueId
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

function getPositiveRatingAck(tone = ['warm']) {
  const toneWord = tone[0] || 'warm'
  const messages = {
    warm: 'I\'m really glad to hear that!',
    inviting: 'That\'s wonderful to hear, thank you!',
    professional: 'Thank you for the positive feedback',
    friendly: 'Great to hear! Thanks for sharing',
    casual: 'Awesome, thanks!'
  }
  return messages[toneWord] || 'I\'m really glad to hear that!'
}

function getNegativeRatingAck(tone = ['warm']) {
  const toneWord = tone[0] || 'warm'
  const messages = {
    warm: 'I\'m sorry to hear that. We\'ll work to do better',
    inviting: 'Thank you for your honesty. We truly appreciate your feedback and will work to improve',
    professional: 'We appreciate your feedback and will work to address your concerns',
    friendly: 'Sorry to hear that! We\'ll definitely work on improving',
    casual: 'Sorry about that. We\'ll do better'
  }
  return messages[toneWord] || 'I\'m sorry to hear that. We\'ll try to do better'
}

module.exports = { structureToConfig }
