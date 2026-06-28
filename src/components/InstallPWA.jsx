import { useEffect, useState } from 'react'

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem('sg_pwa_dismissed'))

  useEffect(() => {
    const handler = e => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  async function handleInstall() {
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setPrompt(null)
  }

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem('sg_pwa_dismissed', '1')
  }

  return (
    <div className="install-banner fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(360px,92vw)]">
      <div className="glass flex items-center gap-3 px-4 py-3 shadow-2xl">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#1DB954,#158a3e)' }}>
          <span className="text-lg">&#127925;</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Instalar AdivinaLaCanción</p>
          <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">Juega offline desde tu pantalla de inicio</p>
        </div>
        <button onClick={handleInstall} className="btn-primary text-xs px-3 py-1.5 shrink-0">Instalar</button>
        <button onClick={handleDismiss} className="text-[rgba(255,255,255,0.4)] hover:text-white text-lg leading-none shrink-0">&#215;</button>
      </div>
    </div>
  )
}
