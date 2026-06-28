export const CLIP_DURATIONS = [1, 2, 4, 7, 11, 16]
export const MAX_ATTEMPTS = 6

export function getDailyIndex(tracks) {
  const msPerDay = 86_400_000
  const day = Math.floor(Date.now() / msPerDay)
  return day % tracks.length
}

export function getDailyKey() {
  const d = new Date()
  return `sg_daily_${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`
}

export function createGameState() {
  return {
    guesses: [],     // { type: 'correct'|'wrong'|'skipped', text: string }
    status: 'playing', // 'playing' | 'won' | 'lost'
    currentAttempt: 0,
  }
}

export function processGuess(state, guessText, correctTrack) {
  const isCorrect = guessText.trim().toLowerCase() === correctTrack.name.toLowerCase()
  const type = isCorrect ? 'correct' : 'wrong'
  const newGuesses = [...state.guesses, { type, text: guessText }]
  const newAttempt = state.currentAttempt + 1
  const status = isCorrect ? 'won' : newAttempt >= MAX_ATTEMPTS ? 'lost' : 'playing'

  return { ...state, guesses: newGuesses, currentAttempt: newAttempt, status }
}

export function processSkip(state) {
  const newGuesses = [...state.guesses, { type: 'skipped', text: '' }]
  const newAttempt = state.currentAttempt + 1
  const status = newAttempt >= MAX_ATTEMPTS ? 'lost' : 'playing'

  return { ...state, guesses: newGuesses, currentAttempt: newAttempt, status }
}

export function getScoreEmoji(state, track) {
  const { guesses, status } = state
  const lines = guesses.map(g => {
    if (g.type === 'correct') return '🟢'
    if (g.type === 'wrong')   return '🔴'
    return '⬛'
  })
  const header = status === 'won'
    ? `SpotiGuess ${lines.length}/${MAX_ATTEMPTS}`
    : `SpotiGuess X/${MAX_ATTEMPTS}`
  return `${header}\n${lines.join('')}\n🎵 ${track.name} - ${track.artist}`
}

export function loadDailyStats() {
  try {
    return JSON.parse(localStorage.getItem('sg_stats') || '{}')
  } catch { return {} }
}

export function saveDailyStats(stats) {
  localStorage.setItem('sg_stats', JSON.stringify(stats))
}

export function updateStats(stats, state) {
  const plays = (stats.plays || 0) + 1
  const wins  = (stats.wins  || 0) + (state.status === 'won' ? 1 : 0)
  const currentStreak = state.status === 'won' ? (stats.currentStreak || 0) + 1 : 0
  const maxStreak = Math.max(stats.maxStreak || 0, currentStreak)
  const distribution = { ...stats.distribution }
  if (state.status === 'won') {
    const key = String(state.currentAttempt)
    distribution[key] = (distribution[key] || 0) + 1
  }
  return { plays, wins, currentStreak, maxStreak, distribution }
}
