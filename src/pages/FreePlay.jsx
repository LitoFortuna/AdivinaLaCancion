import { useState, useEffect } from 'react'
import { fetchAllCountriesTracks, searchTracks } from '../utils/itunes'
import { CLIP_DURATIONS } from '../utils/gameLogic'
import { useGame } from '../hooks/useGame'
import { useAudio } from '../hooks/useAudio'
import { toast } from '../components/Toast'
import AudioPlayer from '../components/AudioPlayer'
import GuessInput from '../components/GuessInput'
import GameRows from '../components/GameRows'
import ResultModal from '../components/ResultModal'

function loadCached() {
  try {
    const raw = localStorage.getItem('sg_tracks_cache')
    if (!raw) return null
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : p.tracks || null
  } catch { return null }
}

function pickRandom(tracks, exclude) {
  const pool = tracks.filter(t => t.id !== exclude?.id)
  return pool[Math.floor(Math.random() * pool.length)] || tracks[0]
}

function AlbumBg({ url, attempt, finished }) {
  const blur    = finished ? 0 : Math.max(0, 36 - attempt * 7)
  const opacity = finished ? 0.40 : 0.18 + attempt * 0.03
  return (
    <div
      className="album-bg"
      style={{
        backgroundImage: url ? `url(${url})` : 'none',
        filter:  `blur(${blur}px) brightness(0.4)`,
        opacity,
        transition: 'filter 1.4s ease, opacity 1.4s ease',
      }}
    />
  )
}

function AlbumArtCard({ track, attempt, finished }) {
  const blur  = finished ? 0 : Math.max(0, 26 - attempt * 5.2)
  const scale = 1 + Math.max(0, blur * 0.009)
  if (!track) return null
  return (
    <div className="album-art-card">
      {track.image ? (
        <>
          <img
            src={track.image.replace('300x300', '600x600')}
            alt=""
            style={{
              filter:     `blur(${blur}px) brightness(${finished ? 1 : 0.72})`,
              transform:  `scale(${scale})`,
              transition: 'filter 1.4s ease, transform 1.4s ease',
            }}
          />
          <div className="album-art-overlay">
            {!finished && blur > 2 && (
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                {attempt === 0 ? 'Escucha para revelar' : `${6 - attempt} intentos restantes`}
              </span>
            )}
          </div>
        </>
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
          &#127925;
        </div>
      )}
    </div>
  )
}

export default function FreePlay() {
  const [tracks,     setTracks]     = useState(() => loadCached() || [])
  const [loading,    setLoading]    = useState(!loadCached())
  const [error,      setError]      = useState('')
  const [track,      setTrack]      = useState(null)
  const [showResult, setShowResult] = useState(false)

  const { state, submitGuess, skip, reset } = useGame(track)
  const { playing, progress, currentRound, play, stop, advanceRound } = useAudio(track?.previewUrl)
  const finished = state.status !== 'playing'

  useEffect(() => {
    if (tracks.length > 0) { setTrack(pickRandom(tracks, null)); return }
    fetchAllCountriesTracks(100)
      .then(t => {
        setTracks(t)
        localStorage.setItem('sg_tracks_cache', JSON.stringify({ country: 'all', tracks: t }))
        setTrack(pickRandom(t, null))
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (state.status === 'playing') return
    setTimeout(() => setShowResult(true), 900)
  }, [state.status])

  function handleGuess(name) {
    const prev = state.currentAttempt
    submitGuess(name, advanceRound)
    const correct = name.toLowerCase() === track.name.toLowerCase()
    if (correct) toast('¡Correcto! 🎉', 'success', 2800)
    else toast(`Incorrecto — intento ${prev + 1}/6`, 'error')
  }

  function handleSkip() {
    const round = state.currentAttempt
    skip(advanceRound)
    const next = CLIP_DURATIONS[Math.min(round + 1, CLIP_DURATIONS.length - 1)]
    toast(`Saltado — siguiente clip: ${next}s`, 'skip')
  }

  function handleNext() {
    stop(); setShowResult(false)
    setTrack(pickRandom(tracks, track))
    reset()
  }

  if (loading) return (
    <>
      <AlbumBg url={null} attempt={0} finished={false} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 mx-auto mb-4 spin" style={{ borderColor: 'var(--green)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando charts de 6 paises...</p>
        </div>
      </div>
    </>
  )

  if (error) return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-5xl mb-4">&#9888;&#65039;</p>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{error}</p>
        <a href="/setup" className="btn-primary">Reintentar</a>
      </div>
    </div>
  )

  if (!track) return null

  return (
    <>
      <AlbumBg url={track.image} attempt={state.currentAttempt} finished={finished} />

      <div className="game-root">

        {/* LEFT column */}
        <div className="game-left">
          <AlbumArtCard track={track} attempt={state.currentAttempt} finished={finished} />

          <div className="game-mode-header">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--green)' }}>
                Modo Libre
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {tracks.length} canciones &bull; 6 paises
              </p>
            </div>
            {!finished && (
              <div className="attempt-badge">
                <span style={{ color: 'var(--green)' }}>&#9679;</span>
                {state.currentAttempt + 1}/6
              </div>
            )}
          </div>

          <div className="glass-liquid p-5">
            <AudioPlayer
              playing={playing} progress={progress}
              currentRound={currentRound} onPlay={play} disabled={finished}
            />
          </div>
        </div>

        {/* RIGHT column */}
        <div className="game-right">
          <div className="glass-liquid p-5">
            <GameRows guesses={state.guesses} currentAttempt={state.currentAttempt} />
          </div>
          <GuessInput
            tracks={tracks} searchFn={searchTracks}
            onGuess={handleGuess} onSkip={handleSkip}
            disabled={finished}
          />
        </div>
      </div>

      {showResult && (
        <ResultModal
          state={state} track={track}
          onClose={() => setShowResult(false)}
          onNext={handleNext} isDaily={false}
        />
      )}
    </>
  )
}
