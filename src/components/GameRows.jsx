import { MAX_ATTEMPTS, CLIP_DURATIONS } from '../utils/gameLogic'

const ROW_ICONS = { correct: '🟢', wrong: '🔴', skipped: '⬛' }
const ROW_STYLE = { correct: 'row-correct', wrong: 'row-wrong', skipped: 'row-skipped' }

function Row({ guess, index, isActive }) {
  const dur = CLIP_DURATIONS[Math.min(index, CLIP_DURATIONS.length - 1)]

  if (guess) return (
    <div className={`row-enter flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${ROW_STYLE[guess.type]}`}>
      <span className="text-base shrink-0">{ROW_ICONS[guess.type]}</span>
      <span className={`flex-1 truncate font-medium ${guess.type === 'skipped' ? 'italic' : ''}`}
            style={{ color: guess.type === 'skipped' ? 'var(--text-muted)' : 'var(--text)' }}>
        {guess.type === 'skipped' ? 'Saltado' : guess.text}
      </span>
      <span className="text-xs shrink-0 font-mono" style={{ color: 'var(--text-muted)' }}>{dur}s</span>
    </div>
  )

  if (isActive) return (
    <div className="row-active flex items-center gap-3 px-4 py-3 rounded-xl border text-sm">
      <span className="inline-block w-2 h-2 rounded-full bg-[var(--green)] animate-pulse shrink-0" />
      <span style={{ color: 'var(--text-muted)' }}>Tu turno...</span>
      <span className="ml-auto text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{dur}s</span>
    </div>
  )

  return (
    <div className="row-empty flex items-center gap-3 px-4 py-3 rounded-xl border text-sm opacity-30">
      <span className="w-2 h-2 rounded-full border border-current shrink-0" style={{ color: 'var(--text-muted)' }} />
      <span style={{ color: 'var(--text-muted)' }}>—</span>
      <span className="ml-auto text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{dur}s</span>
    </div>
  )
}

export default function GameRows({ guesses, currentAttempt }) {
  return (
    <div className="w-full flex flex-col gap-2">
      {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
        <Row key={i} index={i} guess={guesses[i] || null} isActive={i === currentAttempt && i >= guesses.length} />
      ))}
    </div>
  )
}
