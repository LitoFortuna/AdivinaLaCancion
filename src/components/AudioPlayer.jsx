import { CLIP_DURATIONS, MAX_ATTEMPTS } from '../utils/gameLogic'

const TOTAL_PREVIEW = 30  // iTunes clips are 30s

const BAR_COUNT_MOBILE  = 28
const BAR_COUNT_DESKTOP = 44

function Waveform({ playing, progress, attempt }) {
  const isMd = typeof window !== 'undefined' && window.innerWidth >= 900
  const count = isMd ? BAR_COUNT_DESKTOP : BAR_COUNT_MOBILE
  const duration = CLIP_DURATIONS[Math.min(attempt, CLIP_DURATIONS.length - 1)]
  // How far through the waveform the current clip reaches
  const clipPct = duration / TOTAL_PREVIEW
  const progressPct = playing ? progress * clipPct : 0

  return (
    <div className="flex items-end justify-center gap-[3px]" style={{ height: 52, width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => {
        const barPct = i / count
        const inClip = barPct < clipPct
        const played = barPct < progressPct

        const h = 6 + Math.abs(Math.sin(i * 0.42 + 0.8)) * 46
        const opacity = played ? 1 : inClip ? (playing ? 0.45 : 0.55) : 0.14

        return (
          <div
            key={i}
            style={{
              width: isMd ? 4 : 3,
              height: h,
              borderRadius: 3,
              flexShrink: 0,
              background: played
                ? 'linear-gradient(to top, var(--green-dim), var(--green))'
                : inClip
                ? 'rgba(255,255,255,0.55)'
                : 'rgba(255,255,255,0.18)',
              opacity,
              transformOrigin: 'bottom',
              transform: (playing && inClip && barPct < progressPct + 0.04)
                ? `scaleY(${0.7 + Math.abs(Math.sin(Date.now() / 300 + i)) * 0.5})`
                : 'scaleY(1)',
              transition: played ? 'background 0.3s, opacity 0.3s' : 'opacity 0.4s',
              animationName: playing && inClip && !played ? 'wave' : 'none',
              animationDuration: `${0.65 + (i % 7) * 0.07}s`,
              animationDelay: `${(i * 0.055) % 0.9}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
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
  const elapsed  = playing ? Math.min(Math.round(progress * duration * 10) / 10, duration) : 0
  const clipPct  = (duration / TOTAL_PREVIEW) * 100
  const fillPct  = playing ? progress * clipPct : 0

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Waveform */}
      <Waveform playing={playing} progress={progress} attempt={attempt} />

      {/* Progress track */}
      <div className="flex flex-col gap-1.5 w-full">
        <div
          style={{
            height: 6,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 9999,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Clip window (greyed unlock zone) */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${clipPct}%`,
            background: 'rgba(255,255,255,0.10)',
            borderRight: '1px solid rgba(255,255,255,0.20)',
          }} />
          {/* Played fill */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${fillPct}%`,
            background: 'linear-gradient(90deg, var(--green-dim), var(--green))',
            boxShadow: playing ? '0 0 8px rgba(29,185,84,0.6)' : 'none',
            transition: 'width 0.08s linear',
            borderRadius: 9999,
          }} />
        </div>

        {/* Time labels */}
        <div className="flex justify-between" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <span>{elapsed > 0 ? `${elapsed}s` : '0s'}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>
            clip {duration}s / {TOTAL_PREVIEW}s
          </span>
          <span>{duration}s</span>
        </div>
      </div>

      {/* Play button + attempt label */}
      <div className="flex items-center justify-between w-full">
        <div
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          {MAX_ATTEMPTS - attempt - 1 > 0
            ? `${MAX_ATTEMPTS - attempt - 1} clips más`
            : 'último clip'}
        </div>

        <div style={{ position: 'relative' }}>
          {!playing && !disabled && (
            <div style={{
              position: 'absolute', inset: -5, borderRadius: 9999,
              border: '2px solid var(--green)', opacity: 0,
              animation: 'pulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}
          <button
            onClick={onPlay}
            disabled={disabled || playing}
            className="btn-primary relative z-10"
            style={{ minWidth: 120, height: 40, fontSize: '0.85rem' }}
          >
            {playing ? (
              <>
                <span style={{
                  display: 'inline-block', width: 12, height: 12,
                  border: '2px solid #000', borderTopColor: 'transparent',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
                Escuchando…
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Escuchar
              </>
            )}
          </button>
        </div>

        <div
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: 'var(--green)', minWidth: 48, textAlign: 'right' }}
        >
          {attempt + 1}/{MAX_ATTEMPTS}
        </div>
      </div>

    </div>
  )
}
