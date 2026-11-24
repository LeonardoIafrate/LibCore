import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usuariosApi } from '../api/services'
import { ApiError } from '../api/client'
import { PasswordField, TextField } from '../components/ui'
import EnderecoFields, { enderecoVazio } from '../components/EnderecoForm'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatCpf } from '../lib'

export default function Cadastro() {
  const nav = useNavigate()
  const { login } = useAuth()
  const toast = useToast()
  const [f, setF] = useState({ nome: '', email: '', cpf: '', senha: '', dataNascimento: '' })
  const [end, setEnd] = useState(enderecoVazio)
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)

  const err = (k: string) => Object.entries(erros).find(([c]) => c.toLowerCase() === k.toLowerCase())?.[1][0]

  async function enviar(e: FormEvent) {
    e.preventDefault(); setErro(''); setErros({}); setBusy(true)
    try {
      await usuariosApi.create({ ...f, cpf: f.cpf, nome: f.nome.trim(), email: f.email.trim(), endereco: end })
      await login(f.email.trim(), f.senha)
      toast.ok('Conta criada! Bem-vindo(a).')
      nav('/')
    } catch (x) {
      if (x instanceof ApiError) { setErros(x.fieldErrors); setErro(x.message) } else setErro('Erro inesperado.')
    } finally { setBusy(false) }
  }
  return (
    <div className="auth auth-lg card pad">
      <h1>Criar conta</h1>
      <form onSubmit={enviar} className="stack">
        {erro && <div className="alert alert-erro" role="alert">{erro}</div>}
        <div className="grid g2">
          <TextField label="Nome completo" value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} error={err('Nome')} maxLength={100} required />
          <TextField label="E-mail" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} error={err('Email')} maxLength={100} required />
          <TextField label="CPF" value={f.cpf} onChange={e => setF({ ...f, cpf: formatCpf(e.target.value) })} error={err('Cpf')} placeholder="000.000.000-00" required />
          <TextField label="Data de nascimento" type="date" value={f.dataNascimento} onChange={e => setF({ ...f, dataNascimento: e.target.value })} error={err('DataNascimento')} required />
          <PasswordField label="Senha" value={f.senha} onChange={e => setF({ ...f, senha: e.target.value })} error={err('Senha')} hint="Mínimo 8 caracteres, com letras e números." minLength={8} maxLength={100} required autoComplete="new-password" />
        </div>
        <h3>Endereço</h3>
        <EnderecoFields value={end} onChange={setEnd} erros={erros} prefixo="Endereco." />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Criando…' : 'Criar conta'}</button>
      </form>
      <p>Já tem conta? <Link to="/entrar">Entrar</Link></p>
    </div>
  )
}
