import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Tema = 'claro' | 'escuro'
const KEY = 'libcore.tema'

function inicial(): Tema {
  try {
    const salvo = localStorage.getItem(KEY)
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch { /* ignora */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

const Ctx = createContext<{ tema: Tema; alternar: () => void } | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(inicial)

  useEffect(() => {
    document.documentElement.dataset.theme = tema === 'escuro' ? 'dark' : 'light'
    try { localStorage.setItem(KEY, tema) } catch { /* ignora */ }
  }, [tema])

  return <Ctx.Provider value={{ tema, alternar: () => setTema(t => (t === 'escuro' ? 'claro' : 'escuro')) }}>{children}</Ctx.Provider>
}

export function useTheme() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useTheme fora do ThemeProvider')
  return c
}
