import { useEffect, useState } from 'react'

let _addToast = null
export function toast(msg, type = 'info', duration = 2400) {
  _addToast?.({ msg, type, duration, id: Date.now() + Math.random() })
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _addToast = t => setToasts(prev => [...prev, t])
    return () => { _addToast = null }
  }, [])

  function remove(id) { setToasts(prev => prev.filter(t => t.id !== id)) }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none" style={{ width: 'min(360px, 92vw)' }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast: t, onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const leave = setTimeout(() => setLeaving(true), t.duration)
    const done  = setTimeout(onDone, t.duration + 350)
    return () => { clearTimeout(leave); clearTimeout(done) }
  }, [])

  const icons = { success: '🟢', error: '🔴', skip: '⬛', info: '🎵' }
  const colors = {
    success: 'border-[rgba(29,185,84,0.5)]  bg-[rgba(29,185,84,0.15)]',
    error:   'border-[rgba(255,77,106,0.5)] bg-[rgba(255,77,106,0.12)]',
    skip:    'border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.07)]',
    info:    'border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.07)]',
  }

  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl text-sm font-medium text-white shadow-2xl ${colors[t.type]} ${leaving ? 'toast-leave' : 'toast-enter'}`}>
      <span className="text-base shrink-0">{icons[t.type]}</span>
      <span>{t.msg}</span>
    </div>
  )
}
