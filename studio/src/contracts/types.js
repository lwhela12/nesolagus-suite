/**
 * MethodBrief captures intent distilled from discovery/methodology sources.
 * @typedef {Object} MethodBrief
 * @property {string} client
 * @property {string[]} goals
 * @property {string[]} segments
 * @property {string[]} archetypes
 * @property {string[]} tone // e.g., ["warm","trust-based","inviting"]
 * @property {{ max_minutes: number, anonymity: 'anonymous'|'opt-in'|'identified', languages?: string[] }} constraints
 * @property {string[]=} keywords
 */

/**
 * @typedef {Object} Option
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {{ min: number, max: number, labelMin?: string, labelMax?: string }} Scale
 */

/**
 * @typedef {{ equals: { answer: string|number|boolean }} | { in: { answer: string[] }} | { gt: { answer: number }} | { lt: { answer: number }} } Condition
 */

/**
 * @typedef {string | { if: Array<{ when: Condition, goto: string }>, else: string }} Next
 */

/**
 * @typedef {{ type: 'message', text: string, next: Next, tags?: string[] }} NodeMessage
 * @typedef {{ type: 'text', prompt: string, next: Next, tags?: string[] }} NodeText
 * @typedef {{ type: 'number', prompt: string, next: Next, min?: number, max?: number, tags?: string[] }} NodeNumber
 * @typedef {{ type: 'singleChoice', prompt: string, options: Option[], next: Next, tags?: string[] }} NodeSingleChoice
 * @typedef {{ type: 'multiChoice', prompt: string, options: Option[], next: Next, tags?: string[] }} NodeMultiChoice
 * @typedef {{ type: 'rating', prompt: string, scale: Scale, next: Next, tags?: string[] }} NodeRating
 * @typedef {{ type: 'video', prompt: string, next: Next, tags?: string[] }} NodeVideo
 * @typedef {{ type: 'end' }} NodeEnd
 * @typedef {NodeMessage|NodeText|NodeNumber|NodeSingleChoice|NodeMultiChoice|NodeRating|NodeVideo|NodeEnd} Node
 */

/**
 * @typedef {Object} SurveyConfig
 * @property {string} version
 * @property {{ title: string, lang: string }} meta
 * @property {{ preset: string, tokens?: Record<string, string|number> }=} theme
 * @property {{ start: string, nodes: Record<string, Node> }} flow
 */

module.exports = {}

