const fs = require('fs')
const path = require('path')

/**
 * Simple .env file loader (no external dependencies)
 * Loads .env from project root into process.env
 */
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env')

  if (!fs.existsSync(envPath)) {
    return // No .env file, use system env vars
  }

  try {
    const content = fs.readFileSync(envPath, 'utf8')
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue

      // Parse KEY=value
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
      if (!match) continue

      const key = match[1]
      const value = match[2]
        .trim()
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/\\n/g, '\n') // Handle escaped newlines

      // Only set if not already in process.env (system env takes precedence)
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch (err) {
    console.warn('Warning: Failed to load .env file:', err.message)
  }
}

module.exports = { loadEnv }
