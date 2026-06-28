import { useRef, useState, useCallback, useEffect } from 'react'
import { CLIP_DURATIONS } from '../utils/gameLogic'

export function useAudio(previewUrl) {
  const audioRef = useRef(null)
  const [playing, setPlaying]       = useState(false)
  const [progress, setProgress]     = useState(0)
  const [currentRound, setCurrentRound] = useState(0)
  const stopTimerRef = useRef(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    const audio = audioRef.current
    audio.src = previewUrl || ''

    const onEnded = () => { setPlaying(false); setProgress(0) }
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.pause()
      clearTimeout(stopTimerRef.current)
      audio.removeEventListener('ended', onEnded)
    }
  }, [previewUrl])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio?.src) return
    clearTimeout(stopTimerRef.current)
    audio.currentTime = 0
    audio.play().then(() => {
      setPlaying(true)
      const duration = CLIP_DURATIONS[currentRound] * 1000
      const startedAt = Date.now()

      const tick = () => {
        const elapsed = Date.now() - startedAt
        setProgress(Math.min(elapsed / duration, 1))
        if (elapsed < duration) {
          stopTimerRef.current = setTimeout(tick, 50)
        } else {
          audio.pause()
          audio.currentTime = 0
          setPlaying(false)
          setProgress(0)
        }
      }
      stopTimerRef.current = setTimeout(tick, 50)
    }).catch(() => {})
  }, [currentRound])

  const stop = useCallback(() => {
    clearTimeout(stopTimerRef.current)
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.currentTime = 0
    setPlaying(false)
    setProgress(0)
  }, [])

  const advanceRound = useCallback((round) => {
    stop()
    setCurrentRound(round)
  }, [stop])

  return { playing, progress, currentRound, play, stop, advanceRound }
}
