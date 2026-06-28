import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import StatsModal from './StatsModal'
import { loadDailyStats } from '../utils/gameLogic'

export default function Header() {
  const [showStats, setShowStats] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isDaily = pathname === '/' || pathname === '/daily'
  const isFree  = pathname === '/free'

  return (
    <>
      <header
        style={{
          background: 'rgba(8,8,8,0.82)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky', top: 0, zIndex: 40,
        }}
      >
        <div className="header-content">
          <button
            onClick={() => navigate('/setup')}
            style={{ color: 'var(--text-muted)' }}
            className="hover:text-white transition-colors p-1.5 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.33.07-.67.07-1.08s-.03-.75-.07-1.08l2.32-1.8c.21-.16.27-.46.13-.7l-2.2-3.81c-.13-.24-.42-.32-.65-.24l-2.73 1.1c-.57-.43-1.17-.8-1.84-1.08L14.06 2.4c-.05-.27-.28-.47-.56-.47h-4.4c-.28 0-.5.2-.55.47l-.4 2.92c-.67.28-1.26.65-1.83 1.08l-2.74-1.1c-.25-.08-.52 0-.65.24L1.74 8.94c-.14.24-.08.54.13.7l2.32 1.8c-.04.33-.07.68-.07 1.08s.03.75.07 1.08L1.87 15.4c-.21.16-.27.46-.13.7l2.2 3.8c.13.24.42.33.65.24l2.73-1.1c.57.44 1.17.8 1.84 1.09l.4 2.91c.05.27.27.47.55.47h4.4c.28 0 .51-.2.56-.47l.4-2.91c.67-.29 1.27-.65 1.84-1.09l2.73 1.1c.25.09.52 0 .65-.24l2.2-3.8c.14-.24.08-.54-.13-.7l-2.32-1.8z"/>
            </svg>
          </button>

          <div className="flex items-baseline gap-0.5">
            <span className="font-black text-xl tracking-tight" style={{ color: 'var(--green)' }}>Spoti</span>
            <span className="font-black text-xl tracking-tight text-white">Guess</span>
          </div>

          <button
            onClick={() => setShowStats(true)}
            style={{ color: 'var(--text-muted)' }}
            className="hover:text-white transition-colors p-1.5 rounded-lg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </button>
        </div>
      </header>

      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(8,8,8,0.55)' }}>
        <div className="nav-content">
          {[
            { label: 'Diario', path: '/',     active: isDaily },
            { label: 'Libre',  path: '/free', active: isFree  },
          ].map(({ label, path, active }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors relative"
              style={{ color: active ? 'var(--green)' : 'var(--text-muted)' }}
            >
              {label}
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: 'var(--green)' }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {showStats && <StatsModal stats={loadDailyStats()} onClose={() => setShowStats(false)} />}
    </>
  )
}
