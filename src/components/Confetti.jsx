import { useEffect, useRef } from 'react'

const COLORS = ['#1DB954','#ffffff','#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4']

export default function Confetti({ active }) {
  const pieces = useRef([])

  useEffect(() => {
    if (!active) return
    const container = document.getElementById('confetti-root')
    if (!container) return

    const count = 120
    const els = []

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      el.className = 'confetti-piece'
      const size = 6 + Math.random() * 8
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        width: ${size}px;
        height: ${size * (0.4 + Math.random() * 0.8)}px;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        animation-duration: ${1.5 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.8}s;
        transform: rotate(${Math.random() * 360}deg);
        opacity: 0.9;
      `
      container.appendChild(el)
      els.push(el)
    }

    pieces.current = els
    const cleanup = setTimeout(() => {
      els.forEach(el => el.remove())
    }, 4000)

    return () => {
      clearTimeout(cleanup)
      els.forEach(el => el.remove())
    }
  }, [active])

  return <div id="confetti-root" className="fixed inset-0 pointer-events-none z-[100]" />
}
