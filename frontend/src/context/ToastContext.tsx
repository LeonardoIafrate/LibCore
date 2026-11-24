import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface Toast { id: number; tipo: 'ok' | 'erro'; texto: string }
interface Ctx { ok: (t: string) => void; erro: (t: string) => void }
const C = createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((tipo: Toast['tipo'], texto: string) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, tipo, texto }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500)
  }, [])
  return (
    <C.Provider value={{ ok: t => push('ok', t), erro: t => push('erro', t) }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map(t => <div key={t.id} className={`toast toast-${t.tipo}`}>{t.texto}</div>)}
      </div>
    </C.Provider>
  )
}
export function useToast() {
  const c = useContext(C)
  if (!c) throw new Error('useToast fora do ToastProvider')
  return c
}
