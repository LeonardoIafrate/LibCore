import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { enderecosApi } from '../api/services'
import { ApiError } from '../api/client'
import type { Endereco, EnderecoInput } from '../api/types'
import { Confirm, Empty, ErrorBox, Modal, Spinner } from '../components/ui'
import EnderecoFields, { enderecoVazio } from '../components/EnderecoForm'
import { useAsync, msgErro } from '../hooks'
import { useToast } from '../context/ToastContext'

export default function Enderecos() {
  const { data, loading, error, reload } = useAsync(() => enderecosApi.list(), [])
  const toast = useToast()
  const [edit, setEdit] = useState<Endereco | 'novo' | null>(null)
  const [del, setDel] = useState<Endereco | null>(null)

  if (loading) return <Spinner />
  if (error) return <ErrorBox msg={error} onRetry={reload} />
  const lista = data?.filter(e => e.ativo) ?? []

  async function principal(e: Endereco) {
    try { await enderecosApi.setPrincipal(e.id); toast.ok('Endereço principal atualizado.'); reload() } catch (x) { toast.erro(msgErro(x)) }
  }
  async function excluir() {
    if (!del) return
    try { await enderecosApi.remove(del.id); toast.ok('Endereço excluído.'); reload() } catch (x) { toast.erro(msgErro(x)) }
    setDel(null)
  }

  return (
    <>
      <Link to="/conta" className="muted small">← Minha conta</Link>
      <div className="row between"><h1>Meus endereços</h1><button className="btn btn-primary" onClick={() => setEdit('novo')}>Novo endereço</button></div>
      {lista.length === 0 ? <Empty>Nenhum endereço cadastrado.</Empty> : (
        <div className="grid g2-lg">
          {lista.map(e => (
            <article key={e.id} className="card pad">
              <div className="row between"><strong>{e.rua}, {e.numero}</strong>{e.principal && <span className="badge badge-pago">Principal</span>}</div>
              <p className="muted">{e.complemento && `${e.complemento} · `}{e.bairro}<br />{e.cidade}/{e.uf} · CEP {e.cep}</p>
              <div className="row">
                <button className="link" onClick={() => setEdit(e)}>Editar</button>
                {!e.principal && <button className="link" onClick={() => principal(e)}>Tornar principal</button>}
                <button className="link danger" onClick={() => setDel(e)}>Excluir</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {edit && <EnderecoModal inicial={edit === 'novo' ? null : edit} onClose={() => setEdit(null)} onDone={() => { setEdit(null); reload(); toast.ok('Endereço salvo.') }} />}
      {del && <Confirm titulo="Excluir endereço" texto={`Excluir ${del.rua}, ${del.numero}? Pedidos já feitos não são afetados.`} confirmar="Excluir" perigo onYes={excluir} onNo={() => setDel(null)} />}
    </>
  )
}

function EnderecoModal({ inicial, onClose, onDone }: { inicial: Endereco | null; onClose: () => void; onDone: () => void }) {
  const [v, setV] = useState<EnderecoInput>(inicial ? { ...inicial } : enderecoVazio)
  const [principal, setPrincipal] = useState(false)
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)

  async function salvar(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErro(''); setErros({})
    try {
      const corpo: EnderecoInput = { cep: v.cep, rua: v.rua, numero: v.numero, complemento: v.complemento || null, bairro: v.bairro, cidade: v.cidade, uf: v.uf }
      if (inicial) await enderecosApi.update(inicial.id, corpo)
      else await enderecosApi.create({ ...corpo, principal })
      onDone()
    } catch (x) { if (x instanceof ApiError) setErros(x.fieldErrors); setErro(msgErro(x)) } finally { setBusy(false) }
  }
  return (
    <Modal titulo={inicial ? 'Editar endereço' : 'Novo endereço'} onClose={onClose} largo>
      <form className="stack" onSubmit={salvar}>
        {erro && <div className="alert alert-erro">{erro}</div>}
        <EnderecoFields value={v} onChange={setV} erros={erros} />
        {!inicial && <label className="check"><input type="checkbox" checked={principal} onChange={e => setPrincipal(e.target.checked)} /> Definir como principal</label>}
        <div className="row end"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" disabled={busy}>Salvar</button></div>
      </form>
    </Modal>
  )
}
