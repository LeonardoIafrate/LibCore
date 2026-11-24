import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/services'
import { setUnauthorizedListener, tokenStore } from '../api/client'
import type { Perfil } from '../api/types'

interface Sessao { id: number; email: string; perfil: Perfil; exp: number }

const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
const CLAIM_ID = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'

function decodificar(token: string | null): Sessao | null {
  if (!token) return null
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(atob(b64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''))
    const p = JSON.parse(json)
    const sessao: Sessao = {
      id: Number(p[CLAIM_ID] ?? p.nameid ?? p.sub),
      email: p[CLAIM_EMAIL] ?? p.email ?? '',
      perfil: (p[CLAIM_ROLE] ?? p.role) === 'Admin' ? 'Admin' : 'Cliente',
      exp: Number(p.exp) * 1000,
    }
    return sessao.exp > Date.now() ? sessao : null
  } catch { return null }
}

interface AuthCtx {
  sessao: Sessao | null
  ehAdmin: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}
const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => {
    const s = decodificar(tokenStore.get())
    if (!s) tokenStore.clear()
    return s
  })

  const logout = useCallback(() => { tokenStore.clear(); setSessao(null) }, [])

  useEffect(() => {
    setUnauthorizedListener(logout)
    return () => setUnauthorizedListener(null)
  }, [logout])

  // expira a sessão no horário do token
  useEffect(() => {
    if (!sessao) return
    const ms = sessao.exp - Date.now()
    const t = setTimeout(logout, Math.min(Math.max(ms, 0), 2 ** 31 - 1))
    return () => clearTimeout(t)
  }, [sessao, logout])

  // ao abrir/recarregar a página, pede um token novo para refletir mudanças de perfil (ex.: virou admin)
  const logado = sessao !== null
  useEffect(() => {
    if (!logado) return
    let cancelado = false
    authApi.renovar().then(({ token }) => {
      const s = decodificar(token)
      if (cancelado || !s) return
      tokenStore.set(token)
      setSessao(atual => (atual && atual.id === s.id ? s : atual))
    }).catch(() => { /* 401 já desloga pelo listener; falha de rede mantém a sessão atual */ })
    return () => { cancelado = true }
  }, [logado])

  const login = useCallback(async (email: string, senha: string) => {
    const { token } = await authApi.login(email, senha)
    const s = decodificar(token)
    if (!s) throw new Error('Token inválido recebido da API.')
    tokenStore.set(token)
    setSessao(s)
  }, [])

  const value = useMemo(() => ({ sessao, ehAdmin: sessao?.perfil === 'Admin', login, logout }), [sessao, login, logout])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth fora do AuthProvider')
  return c
}
