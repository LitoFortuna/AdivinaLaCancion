import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleCallback } from '../utils/spotify'

export default function Callback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [detail, setDetail] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')
    const err    = params.get('error')
    const desc   = params.get('error_description')

    if (err) {
      setError(err)
      setDetail(desc || '')
      return
    }
    if (!code) {
      setError('no_code')
      setDetail('Spotify no devolvio ningun codigo de autorizacion')
      return
    }

    handleCallback(code)
      .then(() => navigate('/setup', { replace: true }))
      .catch(e => { setError('token_error'); setDetail(e.message) })
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-[100svh] bg-(--spotify-dark)">
      {error ? (
        <div className="text-center px-6 max-w-sm">
          <div className="text-4xl mb-3">❌</div>
          <p className="text-(--error) font-bold text-lg mb-1">{error}</p>
          {detail && <p className="text-(--text-muted) text-sm mb-4 break-words">{detail}</p>}
          <p className="text-xs text-(--text-muted) bg-(--surface) rounded-lg p-3 mb-4 font-mono break-all">
            {window.location.search}
          </p>
          <button onClick={() => navigate('/setup')} className="btn-primary">Volver</button>
        </div>
      ) : (
        <div className="text-center px-6">
          <div className="w-10 h-10 border-4 border-(--spotify-green) border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-(--text-muted)">Conectando con Spotify...</p>
        </div>
      )}
    </div>
  )
}
