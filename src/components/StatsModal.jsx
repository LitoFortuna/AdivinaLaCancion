import { MAX_ATTEMPTS } from '../utils/gameLogic'

export default function StatsModal({ stats, onClose }) {
  const plays = stats.plays  || 0
  const wins  = stats.wins   || 0
  const pct   = plays > 0 ? Math.round((wins / plays) * 100) : 0
  const dist  = stats.distribution || {}
  const maxBar = Math.max(...Object.values(dist), 1)

  const items = [
    { n: plays,                    label: 'Partidas' },
    { n: pct + '%',                label: '% Victoria' },
    { n: stats.currentStreak || 0, label: 'Racha' },
    { n: stats.maxStreak     || 0, label: 'Max' },
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Estadisticas</h2>
          <button onClick={onClose} className="text-xl leading-none transition-colors" style={{ color: 'var(--text-muted)' }}>&#215;</button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {items.map(({ n, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-xl py-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-2xl font-black text-white count-up">{n}</span>
              <span className="text-[10px] uppercase tracking-wider text-center leading-tight" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Distribution */}
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Distribucion</p>
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
            const count = dist[String(i + 1)] || 0
            const width = count > 0 ? Math.max((count / maxBar) * 100, 8) : 4
            return (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-center font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', height: 24 }}>
                  <div
                    className="stat-bar-fill h-full flex items-center justify-end pr-2 rounded-full"
                    style={{ width: `${width}%` }}
                  >
                    {count > 0 && <span className="text-xs font-bold text-black">{count}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {plays === 0 && (
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Juega tu primera partida para ver estadisticas
          </p>
        )}
      </div>
    </div>
  )
}
