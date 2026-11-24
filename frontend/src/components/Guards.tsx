import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth() {
  const { sessao } = useAuth()
  const loc = useLocation()
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: loc.pathname + loc.search }} />
  return <Outlet />
}

export function RequireAdmin() {
  const { sessao, ehAdmin } = useAuth()
  const loc = useLocation()
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: loc.pathname }} />
  if (!ehAdmin) return <div className="alert alert-erro">Acesso restrito a administradores.</div>
  return <Outlet />
}
