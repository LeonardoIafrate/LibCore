import { useState, type FormEvent } from 'react'
import { usuariosApi } from '../../api/services'
import { ApiError } from '../../api/client'
import type { Usuario } from '../../api/types'
import { Confirm, Empty, ErrorBox, Modal, Pagination, PasswordField, Spinner, TextField } from '../../components/ui'
import EnderecoFields, { enderecoVazio } from '../../components/EnderecoForm'
import { useAsync, useDebounced, msgErro } from '../../hooks'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { dataBr, formatCpf } from '../../lib'

type Acao = { tipo: 'promover' | 'desativar' | 'excluir'; u: Usuario }
const TEXTO = { promover: 'Promover a administrador', desativar: 'Desativar usuário', excluir: 'Excluir usuário' }

export default function UsuariosAdmin() {
  const toast = useToast()
  const { sessao } = useAuth()
  const [nome, setNome] = useState('')
  const nomeD = useDebounced(nome)
  const [pagina, setPagina] = useState(1)
  const { data, loading, error, reload } = useAsync(() => usuariosApi.list({ nome: nomeD || undefined, pagina, tamanhoPagina: 15 }), [nomeD, pagina])
  const [acao, setAcao] = useState<Acao | null>(null)
  const [novo, setNovo] = useState(false)

  async function executar() {
    if (!acao) return
    try {
      if (acao.tipo === 'promover') await usuariosApi.promover(acao.u.id)
      else if (acao.tipo === 'desativar') await usuariosApi.desativar(acao.u.id)
      else await usuariosApi.remove(acao.u.id)
      toast.ok('Concluído.'); reload()
    } catch (e) { toast.erro(msgErro(e)) }
    setAcao(null)
  }
  return (
    <>
      <div className="row between wrapr">
        <h2>Usuários</h2>
        <div className="row"><input type="search" placeholder="Buscar por nome…" value={nome} onChange={e => { setNome(e.target.value); setPagina(1) }} />
          <button className="btn btn-primary" onClick={() => setNovo(true)}>Novo administrador</button></div>
      </div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox msg={error} onRetry={reload} /> : !data?.itens.length ? <Empty>Nenhum usuário.</Empty> : (
        <>
          <div className="card"><table className="tbl">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th>Desde</th><th /></tr></thead>
            <tbody>{data.itens.map(u => {
              const eu = u.id === sessao?.id
              return (
                <tr key={u.id}><td>{u.nome}{eu && <span className="muted small"> (você)</span>}</td><td>{u.email}</td>
                  <td><span className={`badge ${u.perfil === 'Admin' ? 'badge-enviado' : 'badge-pendente'}`}>{u.perfil}</span></td>
                  <td>{u.ativo ? 'Ativo' : <span className="danger">Inativo</span>}</td><td>{dataBr(u.dataCadastro)}</td>
                  <td className="actions">{!eu && <>
                    {u.perfil !== 'Admin' && u.ativo && <button className="link" onClick={() => setAcao({ tipo: 'promover', u })}>Promover</button>}
                    {u.ativo && <button className="link danger" onClick={() => setAcao({ tipo: 'desativar', u })}>Desativar</button>}
                    <button className="link danger" onClick={() => setAcao({ tipo: 'excluir', u })}>Excluir</button></>}</td></tr>
              )
            })}</tbody></table></div>
          <Pagination pagina={data.pagina} totalPaginas={data.totalPaginas} onChange={setPagina} />
        </>
      )}
      {acao && <Confirm titulo={TEXTO[acao.tipo]} texto={`${TEXTO[acao.tipo]}: ${acao.u.nome} (${acao.u.email})?`} perigo={acao.tipo !== 'promover'} onYes={executar} onNo={() => setAcao(null)} />}
      {novo && <NovoAdmin onClose={() => setNovo(false)} onDone={() => { setNovo(false); reload(); toast.ok('Administrador criado.') }} />}
    </>
  )
}

function NovoAdmin({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ nome: '', email: '', cpf: '', senha: '', dataNascimento: '' })
  const [end, setEnd] = useState(enderecoVazio)
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)
  const err = (k: string) => Object.entries(erros).find(([c]) => c.toLowerCase() === k.toLowerCase())?.[1][0]
  async function salvar(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErro(''); setErros({})
    try {
      await usuariosApi.createAdmin({ ...f, endereco: end }); onDone()
    } catch (x) { if (x instanceof ApiError) setErros(x.fieldErrors); setErro(msgErro(x)) } finally { setBusy(false) }
  }
  return (
    <Modal titulo="Novo administrador" onClose={onClose} largo>
      <form className="stack" onSubmit={salvar}>
        {erro && <div className="alert alert-erro">{erro}</div>}
        <div className="grid g2">
          <TextField label="Nome" value={f.nome} maxLength={100} required error={err('Nome')} onChange={e => setF({ ...f, nome: e.target.value })} />
          <TextField label="E-mail" type="email" value={f.email} maxLength={100} required error={err('Email')} onChange={e => setF({ ...f, email: e.target.value })} />
          <TextField label="CPF" value={f.cpf} required error={err('Cpf')} onChange={e => setF({ ...f, cpf: formatCpf(e.target.value) })} />
          <TextField label="Data de nascimento" type="date" value={f.dataNascimento} required error={err('DataNascimento')} onChange={e => setF({ ...f, dataNascimento: e.target.value })} />
          <PasswordField label="Senha" value={f.senha} minLength={8} required error={err('Senha')} hint="Letras e números, mínimo 8." onChange={e => setF({ ...f, senha: e.target.value })} />
        </div>
        <h3>Endereço</h3>
        <EnderecoFields value={end} onChange={setEnd} erros={erros} prefixo="Endereco." />
        <div className="row end"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" disabled={busy}>Criar</button></div>
      </form>
    </Modal>
  )
}
