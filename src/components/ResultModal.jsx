import { useState, useEffect } from 'react'
import { getScoreEmoji } from '../utils/gameLogic'
import Confetti from './Confetti'

function useCountdown() {
  const [time, setTime] = useState('')
  useEffect(() => {
    function update() {
      const now    = new Date()
      const next   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
      const diff   = next - now
      const h      = Math.floor(diff / 3600000)
      const m      = Math.floor((diff % 3600000) / 60000)
      const s      = Math.floor((diff % 60000) / 1000)
      setTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function ResultModal({ state, track, onClose, onNext, isDaily }) {
  const won      = state.status === 'won'
  const countdown = useCountdown()
  const [copied, setCopied] = useState(false)

  function copyResult() {
    navigator.clipboard.writeText(getScoreEmoji(state, track))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
      .catch(() => {})
  }

  return (
    <>
      <Confetti active={won} />
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box flex flex-col gap-5">

          {/* Header */}
          <div className="text-center">
            <div className="text-4xl mb-2">{won ? '🎉' : '😔'}</div>
            <h2 className="text-2xl font-black text-white">{won ? '¡Correcto!' : 'Game Over'}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {won
                ? `Adivinaste en ${state.guesses.length} intento${state.guesses.length > 1 ? 's' : ''}`
                : 'No lo adivinaste esta vez'}
            </p>
          </div>

          {/* Track card */}
          <div className="flex items-center gap-4 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {track.image && (
              <img src={track.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-lg" />
            )}
            <div className="overflow-hidden">
              <p className="font-bold text-white text-base truncate">{track.name}</p>
              <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{track.artist}</p>
            </div>
          </div>

          {/* Score grid */}
          <div className="flex justify-center gap-1 text-2xl">
            {state.guesses.map((g, i) => (
              <span key={i}>{g.type === 'correct' ? '🟢' : g.type === 'wrong' ? '🔴' : '⬛'}</span>
            ))}
            {Array.from({ length: 6 - state.guesses.length }).map((_, i) => (
              <span key={i} className="opacity-20">⬜</span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button onClick={copyResult} className="btn-secondary w-full">
              {copied ? '¡Copiado! ✓' : '📋 Compartir resultado'}
            </button>
            {!isDaily && onNext && (
              <button onClick={onNext} className="btn-primary w-full">
                Siguiente cancion &rarr;
              </button>
            )}
          </div>

          {/* Countdown (daily) */}
          {isDaily && (
            <div className="text-center rounded-xl py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Proxima cancion en</p>
              <p className="text-2xl font-black font-mono" style={{ color: 'var(--green)' }}>{countdown}</p>
            </div>
          )}

          <button onClick={onClose} className="text-xs text-center transition-colors" style={{ color: 'var(--text-muted)' }}>
            Cerrar
          </button>
        </div>
      </div>
    </>
  )
}
