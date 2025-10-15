function rid(prefix = '') {
  const rand = Math.random().toString(36).slice(2, 10)
  const time = Date.now().toString(36)
  return prefix ? `${prefix}_${time}_${rand}` : `${time}_${rand}`
}

module.exports = { rid }

