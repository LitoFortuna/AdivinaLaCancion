import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COUNTRIES, fetchAllCountriesTracks } from '../utils/itunes'

const FLAGS = { es: '🇪🇸', us: '🇺🇸', mx: '🇲🇽', ar: '🇦🇷', gb: '🇬🇧', br: '🇧🇷' }

export default function Setup() {
  const navigate  = useNavigate()
  const hasTracks = !!localStorage.getItem('sg_tracks_cache')

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [result,  setResult]  = useState(null)

  async function handleLoad() {
    setError(''); setLoading(true); setResult(null)
    try {
      const tracks = await fetchAllCountriesTracks(100)
      localStorage.setItem('sg_tracks_cache', JSON.stringify({ country: 'all', tracks }))
      setResult(tracks.length)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] flex flex-col" style={{ background: 'var(--dark)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        {hasTracks
          ? <button onClick={() => navigate(-1)} className="text-sm font-medium transition-colors" style={{ color: 'var(--text-muted)' }}>&larr; Volver</button>
          : <div />
        }
        <div className="flex items-baseline gap-0.5">
          <span className="font-black text-2xl" style={{ color: 'var(--green)' }}>Spoti</span>
          <span className="font-black text-2xl text-white">Guess</span>
        </div>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 gap-8 w-full max-w-sm mx-auto">

        {/* Hero */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-2xl"
               style={{ background: 'linear-gradient(135deg, #1DB954 0%, #0d7d38 100%)' }}>
            &#127925;
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Adivina la cancion</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Top 100 de todos los paises &bull; Sin cuenta &bull; Gratis
          </p>
        </div>

        {/* Countries preview */}
        <div className="w-full flex flex-col gap-3">
          <label className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
            Charts incluidos
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(COUNTRIES).map(([code, name]) => (
              <div
                key={code}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-semibold"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-muted)' }}
              >
                <span className="text-2xl">{FLAGS[code]}</span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.3)', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        {/* Success */}
        {result !== null && !error && (
          <div className="w-full rounded-xl px-4 py-3 text-sm flex items-center gap-3"
               style={{ background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.3)', color: 'var(--green)' }}>
            <span className="text-xl">&#10003;</span>
            <span className="font-semibold">{result} canciones listas de {Object.keys(COUNTRIES).length} paises</span>
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button onClick={handleLoad} disabled={loading} className="btn-primary w-full">
            {loading
              ? <><span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full spin" /> Cargando {Object.keys(COUNTRIES).length} paises...</>
              : result !== null ? 'Recargar todos los charts' : 'Cargar todos los charts'
            }
          </button>
          {(result !== null || hasTracks) && (
            <button onClick={() => navigate('/')} className="btn-primary w-full">
              ¡Jugar ahora! &rarr;
            </button>
          )}
        </div>

        {/* How it works */}
        <div className="w-full rounded-2xl p-4 text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="font-bold text-white mb-3">Como funciona</p>
          <div className="flex flex-col gap-2.5">
            {[
              ['🌍', `Se mezclan los Top 100 de ${Object.keys(COUNTRIES).length} paises en un solo pool`],
              ['🎯', '6 intentos con clips cada vez mas largos (1s → 16s)'],
              ['🔍', 'Busca la cancion por nombre o artista'],
              ['📅', 'Modo Diario: misma cancion para todos cada dia'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{icon}</span>
                <span style={{ color: 'var(--text-muted)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
