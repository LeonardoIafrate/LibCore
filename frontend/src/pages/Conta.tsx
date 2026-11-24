import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usuariosApi } from '../api/services'
import { ApiError } from '../api/client'
import { Confirm, ErrorBox, PasswordField, Spinner, TextField } from '../components/ui'
import { useAsync, msgErro } from '../hooks'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { dataBr } from '../lib'

export default function Conta() {
  const { data: u, loading, error, reload } = useAsync(() => usuariosApi.me(), [])
  const { logout } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [f, setF] = useState({ nome: '', email: '', dataNascimento: '' })
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [busy, setBusy] = useState(false)
  const [s, setS] = useState({ senhaAtual: '', novaSenha: '' })
  const [erroSenha, setErroSenha] = useState('')
  const [desativando, setDesativando] = useState(false)

  useEffect(() => { if (u) setF({ nome: u.nome, email: u.email, dataNascimento: u.dataNascimento.slice(0, 10) }) }, [u])
  const err = (k: string) => Object.entries(erros).find(([c]) => c.toLowerCase() === k.toLowerCase())?.[1][0]

  if (loading) return <Spinner />
  if (error || !u) return <ErrorBox msg={error ?? 'Erro ao carregar.'} onRetry={reload} />

  async function salvar(e: FormEvent) {
    e.preventDefault(); setErros({}); setBusy(true)
    try { await usuariosApi.updateMe(f); toast.ok('Dados atualizados.'); reload() }
    catch (x) { if (x instanceof ApiError) setErros(x.fieldErrors); toast.erro(msgErro(x)) } finally { setBusy(false) }
  }
  async function trocarSenha(e: FormEvent) {
    e.preventDefault(); setErroSenha('')
    try { await usuariosApi.alterarSenha(s.senhaAtual, s.novaSenha); setS({ senhaAtual: '', novaSenha: '' }); toast.ok('Senha alterada.') }
    catch (x) { setErroSenha(msgErro(x)) }
  }
  async function desativar() {
    try { await usuariosApi.desativarMe(); logout(); toast.ok('Conta desativada.'); nav('/') }
    catch (x) { toast.erro(msgErro(x)); setDesativando(false) }
  }

  return (
    <>
      <h1>Minha conta</h1>
      <p className="muted">CPF {u.cpf} · cliente desde {dataBr(u.dataCadastro)} · <Link to="/conta/enderecos">Meus endereços</Link></p>
      <div className="grid g2-lg">
        <form className="card pad stack" onSubmit={salvar}>
          <h3>Dados pessoais</h3>
          <TextField label="Nome" value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} error={err('Nome')} maxLength={100} required />
          <TextField label="E-mail" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} error={err('Email')} maxLength={100} required />
          <TextField label="Data de nascimento" type="date" value={f.dataNascimento} onChange={e => setF({ ...f, dataNascimento: e.target.value })} error={err('DataNascimento')} required />
          <button className="btn btn-primary" disabled={busy}>Salvar alterações</button>
        </form>
        <form className="card pad stack" onSubmit={trocarSenha}>
          <h3>Alterar senha</h3>
          {erroSenha && <div className="alert alert-erro">{erroSenha}</div>}
          <PasswordField label="Senha atual" value={s.senhaAtual} onChange={e => setS({ ...s, senhaAtual: e.target.value })} required autoComplete="current-password" />
          <PasswordField label="Nova senha" value={s.novaSenha} onChange={e => setS({ ...s, novaSenha: e.target.value })} hint="Mínimo 8 caracteres, com letras e números." minLength={8} required autoComplete="new-password" />
          <button className="btn btn-primary">Alterar senha</button>
        </form>
      </div>
      <div className="card pad mt zona-perigo">
        <h3>Desativar conta</h3>
        <p className="muted">Seu acesso será encerrado imediatamente.</p>
        <button className="btn btn-danger" onClick={() => setDesativando(true)}>Desativar minha conta</button>
      </div>
      {desativando && <Confirm titulo="Desativar conta" texto="Você será desconectado e não poderá mais entrar. Deseja continuar?" confirmar="Desativar" perigo onYes={desativar} onNo={() => setDesativando(false)} />}
    </>
  )
}
