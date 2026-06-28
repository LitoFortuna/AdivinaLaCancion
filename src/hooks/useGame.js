import { useState, useCallback } from 'react'
import { createGameState, processGuess, processSkip } from '../utils/gameLogic'

export function useGame(track, savedState = null) {
  const [state, setState] = useState(() => savedState || createGameState())

  const submitGuess = useCallback((text, advanceRound) => {
    if (!track || state.status !== 'playing') return
    const next = processGuess(state, text, track)
    setState(next)
    if (next.status === 'playing') advanceRound(next.currentAttempt)
  }, [state, track])

  const skip = useCallback((advanceRound) => {
    if (!track || state.status !== 'playing') return
    const next = processSkip(state)
    setState(next)
    if (next.status === 'playing') advanceRound(next.currentAttempt)
  }, [state, track])

  const reset = useCallback(() => setState(createGameState()), [])

  return { state, submitGuess, skip, reset }
}
