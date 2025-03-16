import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const RUN_ATTEMPTS_KEY = 'backdrop_run_attempts'
const MAX_FREE_RUNS = 5

interface RunAttempts {
  count: number
  lastReset: number
}

export const useRunAttempts = () => {
  const { data: session } = useSession()
  const [runAttempts, setRunAttempts] = useState<RunAttempts>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(RUN_ATTEMPTS_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return { count: 0, lastReset: Date.now() }
  })

  useEffect(() => {
    localStorage.setItem(RUN_ATTEMPTS_KEY, JSON.stringify(runAttempts))
  }, [runAttempts])

  useEffect(() => {
    if (session) {
      setRunAttempts({ count: 0, lastReset: Date.now() })
    }
  }, [session])

  const incrementCount = () => {
    setRunAttempts(prev => ({
      ...prev,
      count: prev.count + 1
    }))
  }

  const resetCount = () => {
    setRunAttempts({ count: 0, lastReset: Date.now() })
  }

  const canRun = () => {
    return session !== null || runAttempts.count < MAX_FREE_RUNS
  }

  const remainingRuns = () => {
    if (session) return Infinity
    return Math.max(0, MAX_FREE_RUNS - runAttempts.count)
  }

  return {
    runAttempts,
    incrementCount,
    resetCount,
    canRun,
    remainingRuns,
  }
}