// Attempts to use AJV when present; falls back to null if not installed.
function getJsonSchemaValidator() {
  try {
    const Ajv = require('ajv')
    const schema = require('../contracts/survey-config.schema.json')
    const ajv = new Ajv({ allErrors: true, strict: false })
    const validate = ajv.compile(schema)
    return (config) => {
      const ok = validate(config)
      const errors = ok
        ? []
        : (validate.errors || []).map(e => ({
            path: e.instancePath || e.schemaPath || '',
            message: e.message || 'schema error',
          }))
      return { valid: ok, errors }
    }
  } catch (e) {
    return null
  }
}

module.exports = { getJsonSchemaValidator }

