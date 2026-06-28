import { CLIP_DURATIONS, MAX_ATTEMPTS } from '../utils/gameLogic'

const BAR_COUNT_MOBILE  = 28
const BAR_COUNT_DESKTOP = 44

function Waveform({ playing }) {
  const isMd = typeof window !== 'undefined' && window.innerWidth >= 900
  const count = isMd ? BAR_COUNT_DESKTOP : BAR_COUNT_MOBILE

  return (
    <div className="flex items-end justify-center gap-[3px]" style={{ height: 56 }}>
      {Array.from({ length: count }).map((_, i) => {
        const h = 8 + Math.abs(Math.sin(i * 0.42 + 0.8)) * 48
        return (
          <div
            key={i}
            className="wave-bar"
            style={{
              height: h,
              animationDelay:    `${(i * 0.055) % 0.9}s`,
              animationDuration: `${0.65 + (i % 7) * 0.07}s`,
              animationPlayState: playing ? 'running' : 'paused',
              opacity: playing ? 1 : 0.22,
              transition: 'opacity 0.4s',
            }}
          />
        )
      })}
    </div>
  )
}

export default function AudioPlayer({ playing, progress, currentRound, onPlay, disabled }) {
  const attempt  = Math.min(currentRound, CLIP_DURATIONS.length - 1)
  const duration = CLIP_DURATIONS[attempt]
  const pct      = playing ? Math.round(progress * 100) : 0
  const elapsed  = playing ? Math.round(progress * duration) : 0

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <Waveform playing={playing} />

      {/* Progress bar */}
      <div className="w-full">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{elapsed}s</span>
          <span>{duration}s</span>
        </div>
      </div>

      {/* Play button */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          {!playing && !disabled && <div className="pulse-ring" />}
          <button
            onClick={onPlay}
            disabled={disabled || playing}
            className="btn-primary relative z-10"
            style={{ minWidth: 136, height: 44 }}
          >
            {playing ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full spin" />
                Escuchando
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Escuchar
              </>
            )}
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', letterSpacing: '0.1em' }}>
          INTENTO {Math.min(attempt + 1, MAX_ATTEMPTS)}/{MAX_ATTEMPTS} &bull; {duration}s
        </p>
      </div>
    </div>
  )
}
