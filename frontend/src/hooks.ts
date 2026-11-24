import { useCallback, useEffect, useState } from 'react'
import { ApiError } from './api/client'

export function msgErro(e: unknown) {
  return e instanceof ApiError || e instanceof Error ? e.message : 'Erro inesperado.'
}

/** Carrega dados assíncronos com estados de loading/erro e recarga manual. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let vivo = true
    setLoading(true); setError(null)
    fn().then(d => { if (vivo) setData(d) })
      .catch(e => { if (vivo) setError(msgErro(e)) })
      .finally(() => { if (vivo) setLoading(false) })
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick(t => t + 1), [])
  return { data, loading, error, reload, setData }
}

export function useDebounced<T>(v: T, ms = 350) {
  const [d, setD] = useState(v)
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t) }, [v, ms])
  return d
}
