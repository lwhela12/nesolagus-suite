// Minimal schema validator to avoid external deps in scaffold.
// For production, integrate AJV against src/contracts/survey-config.schema.json.

/**
 * @param {any} config
 * @returns {{ valid: boolean, errors: Array<{path: string, message: string}> }}
 */
function validateSchema(config) {
  const errors = []

  if (!config || typeof config !== 'object') {
    errors.push({ path: '', message: 'Config must be an object' })
    return { valid: false, errors }
  }

  if (typeof config.version !== 'string') errors.push({ path: 'version', message: 'version must be string' })

  if (!config.meta || typeof config.meta !== 'object') {
    errors.push({ path: 'meta', message: 'meta is required' })
  } else {
    if (typeof config.meta.title !== 'string') errors.push({ path: 'meta.title', message: 'title must be string' })
    if (typeof config.meta.lang !== 'string') errors.push({ path: 'meta.lang', message: 'lang must be string' })
  }

  if (!config.flow || typeof config.flow !== 'object') {
    errors.push({ path: 'flow', message: 'flow is required' })
  } else {
    if (typeof config.flow.start !== 'string') errors.push({ path: 'flow.start', message: 'start must be string' })
    if (!config.flow.nodes || typeof config.flow.nodes !== 'object') {
      errors.push({ path: 'flow.nodes', message: 'nodes must be object' })
    } else {
      // Validate node shapes minimally
      for (const [id, node] of Object.entries(config.flow.nodes)) {
        if (!node || typeof node !== 'object') {
          errors.push({ path: `flow.nodes.${id}`, message: 'node must be object' })
          continue
        }
        if (typeof node.type !== 'string') {
          errors.push({ path: `flow.nodes.${id}.type`, message: 'type is required' })
          continue
        }
        if (node.type === 'end') continue
        // Non-end nodes must have next
        if (!('next' in node)) errors.push({ path: `flow.nodes.${id}.next`, message: 'next is required' })
        switch (node.type) {
          case 'message':
            if (typeof node.text !== 'string') errors.push({ path: `flow.nodes.${id}.text`, message: 'text is required' })
            break
          case 'text':
          case 'number':
          case 'singleChoice':
          case 'multiChoice':
          case 'rating':
          case 'video':
            if (typeof node.prompt !== 'string') errors.push({ path: `flow.nodes.${id}.prompt`, message: 'prompt is required' })
            if (node.type === 'rating') {
              if (!node.scale || typeof node.scale !== 'object') {
                errors.push({ path: `flow.nodes.${id}.scale`, message: 'scale is required' })
              } else {
                if (typeof node.scale.min !== 'number') errors.push({ path: `flow.nodes.${id}.scale.min`, message: 'min is required' })
                if (typeof node.scale.max !== 'number') errors.push({ path: `flow.nodes.${id}.scale.max`, message: 'max is required' })
              }
            }
            if ((node.type === 'singleChoice' || node.type === 'multiChoice')) {
              if (!Array.isArray(node.options)) errors.push({ path: `flow.nodes.${id}.options`, message: 'options[] required' })
            }
            break
          default:
            errors.push({ path: `flow.nodes.${id}.type`, message: `unknown type ${node.type}` })
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

module.exports = { validateSchema }

