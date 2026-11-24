import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PasswordField, TextField } from '../components/ui'
import { msgErro } from '../hooks'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation() as { state?: { de?: string } }
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault(); setErro(''); setBusy(true)
    try { await login(email.trim(), senha); nav(loc.state?.de ?? '/', { replace: true }) }
    catch (x) { setErro(msgErro(x)) }
    finally { setBusy(false) }
  }
  return (
    <div className="auth card pad">
      <h1>Entrar</h1>
      <form onSubmit={enviar} className="stack">
        {erro && <div className="alert alert-erro" role="alert">{erro}</div>}
        <TextField label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={100} required autoFocus autoComplete="email" />
        <PasswordField label="Senha" value={senha} onChange={e => setSenha(e.target.value)} maxLength={100} required autoComplete="current-password" />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <p className="muted small">Após 5 tentativas incorretas o login é bloqueado por 15 minutos.</p>
      <p>Não tem conta? <Link to="/cadastro">Criar conta</Link></p>
    </div>
  )
}
