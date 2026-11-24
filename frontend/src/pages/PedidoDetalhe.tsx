import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { enderecosApi, pedidosApi } from '../api/services'
import { Confirm, ErrorBox, Modal, Spinner, StatusBadge } from '../components/ui'
import { useAsync, msgErro } from '../hooks'
import { brl, dataHoraBr } from '../lib'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

export default function PedidoDetalhe() {
  const id = Number(useParams().id)
  const { ehAdmin } = useAuth()
  const toast = useToast()
  const { data: p, loading, error, reload, setData } = useAsync(() => pedidosApi.get(id), [id])
  const [cancelando, setCancelando] = useState(false)
  const [trocando, setTrocando] = useState(false)
  const [busy, setBusy] = useState(false)

  if (loading) return <Spinner />
  if (error || !p) return <ErrorBox msg={error ?? 'Pedido não encontrado.'} onRetry={reload} />
  const editavel = p.status === 'Pendente' || p.status === 'Pago'

  async function cancelar() {
    setBusy(true)
    try { setData(await pedidosApi.cancelar(id)); toast.ok('Pedido cancelado.'); setCancelando(false) }
    catch (e) { toast.erro(msgErro(e)); setCancelando(false) } finally { setBusy(false) }
  }

  return (
    <>
      <Link to={ehAdmin ? '/admin/pedidos' : '/pedidos'} className="muted small">← Voltar</Link>
      <div className="row between wrapr pedido-head">
        <h1>Pedido #{p.id} <StatusBadge s={p.status} /></h1>
        {editavel && (
          <div className="row">
            {!ehAdmin && <button className="btn btn-ghost" onClick={() => setTrocando(true)}>Alterar endereço</button>}
            <button className="btn btn-danger" onClick={() => setCancelando(true)}>Cancelar pedido</button>
          </div>
        )}
      </div>
      <p className="muted">Realizado em {dataHoraBr(p.dataPedido)}{ehAdmin && ` · ${p.usuarioNome}`}</p>
      <div className="pedido-grid">
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Livro</th><th className="num">Unitário</th><th className="qtd">Qtd.</th></tr></thead>
            <tbody>{p.itens.map(i => (
              <tr key={i.livroId}><td><Link to={`/livros/${i.livroId}`}>{i.livroNome}</Link></td><td className="num">{brl(i.precoUnitario)}</td>
                <td className="qtd">{i.quantidade}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <aside className="card pad pedido-resumo">
          <h3>Resumo do pedido</h3>
          <ul className="resumo-itens">{p.itens.map(i => (
            <li key={i.livroId}>
              <span>{i.livroNome} <span className="muted small">× {i.quantidade}</span></span>
              <span>{brl(i.subtotal ?? i.precoUnitario * i.quantidade)}</span>
            </li>
          ))}</ul>
          <div className="resumo-total"><span>Total</span><strong className="price">{brl(p.valorTotal)}</strong></div>
          <div className="resumo-entrega">
            <h3>Entrega</h3>
            <p>{p.endereco}</p>
          </div>
        </aside>
      </div>

      {cancelando && <Confirm titulo="Cancelar pedido" texto="Tem certeza? Esta ação não pode ser desfeita." confirmar="Cancelar pedido" perigo busy={busy} onYes={cancelar} onNo={() => setCancelando(false)} />}
      {trocando && <TrocarEndereco pedidoId={id} onClose={() => setTrocando(false)} onDone={np => { setData(np); setTrocando(false); toast.ok('Endereço atualizado.') }} />}
    </>
  )
}

function TrocarEndereco({ pedidoId, onClose, onDone }: { pedidoId: number; onClose: () => void; onDone: (p: import('../api/types').Pedido) => void }) {
  const { data, loading, error } = useAsync(() => enderecosApi.list(), [])
  const [sel, setSel] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)
  const ativos = data?.filter(e => e.ativo) ?? []
  async function salvar() {
    if (sel === null) return
    setBusy(true); setErro('')
    try { onDone(await pedidosApi.alterarEndereco(pedidoId, sel)) } catch (e) { setErro(msgErro(e)) } finally { setBusy(false) }
  }
  return (
    <Modal titulo="Alterar endereço de entrega" onClose={onClose}>
      {loading ? <Spinner /> : error ? <ErrorBox msg={error} /> : (
        <div className="stack">
          {ativos.map(e => (
            <label key={e.id} className={`opcao ${sel === e.id ? 'sel' : ''}`}>
              <input type="radio" name="e" checked={sel === e.id} onChange={() => setSel(e.id)} />
              <span>{e.rua}, {e.numero} — {e.cidade}/{e.uf}</span>
            </label>
          ))}
          {erro && <div className="alert alert-erro">{erro}</div>}
          <div className="row end"><button className="btn btn-ghost" onClick={onClose}>Voltar</button>
            <button className="btn btn-primary" disabled={sel === null || busy} onClick={salvar}>Salvar</button></div>
        </div>
      )}
    </Modal>
  )
}
