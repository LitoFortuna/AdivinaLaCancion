import { useState, useRef, useEffect } from 'react'

export default function GuessInput({ tracks, searchFn, onGuess, onSkip, disabled }) {
  const [query,        setQuery]        = useState('')
  const [results,      setResults]      = useState([])
  const [selected,     setSelected]     = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setResults(searchFn(query, tracks))
    setShowDropdown(true)
  }, [query, tracks, searchFn])

  function handleSelect(track) {
    setSelected(track)
    setQuery(`${track.name} — ${track.artist}`)
    setShowDropdown(false)
    setResults([])
    inputRef.current?.focus()
  }

  function handleSubmit(e) {
    e?.preventDefault()
    if (!selected || disabled) return
    onGuess(selected.name)
    setQuery('')
    setSelected(null)
  }

  function handleSkip() {
    if (disabled) return
    onSkip()
    setQuery('')
    setSelected(null)
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null) }}
            onKeyDown={e => e.key === 'Escape' && setShowDropdown(false)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            disabled={disabled}
            placeholder="Adivina el artista o cancion..."
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0.875rem',
              padding: '0.85rem 2.5rem 0.85rem 1rem',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              backdropFilter: 'blur(8px)',
            }}
            onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(29,185,84,0.7)')}
            onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSelected(null); setResults([]); inputRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              &#215;
            </button>
          )}
        </div>

        {showDropdown && results.length > 0 && (
          <ul className="autocomplete-drop absolute z-20 mt-1.5 w-full">
            {results.map(track => (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(track)}
                  className="autocomplete-item w-full flex items-center gap-3 px-3 py-2.5 text-left"
                >
                  {track.image && (
                    <img src={track.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="overflow-hidden">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{track.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{track.artist}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="flex gap-2">
        <button type="button" onClick={handleSkip} disabled={disabled} className="btn-secondary flex-1">
          Saltar
        </button>
        <button type="button" onClick={handleSubmit} disabled={disabled || !selected} className="btn-primary flex-1">
          Confirmar
        </button>
      </div>
    </div>
  )
}
