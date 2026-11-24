import { useState } from 'react'
import { Link } from 'react-router-dom'
import { pedidosApi } from '../../api/services'
import type { Pedido, StatusPedido } from '../../api/types'
import { Empty, ErrorBox, Pagination, Spinner, StatusBadge } from '../../components/ui'
import { useAsync, useDebounced, msgErro } from '../../hooks'
import { useToast } from '../../context/ToastContext'
import { PROXIMO_STATUS, STATUS_LISTA, brl, dataHoraBr } from '../../lib'

export default function PedidosAdmin() {
  const toast = useToast()
  const [nome, setNome] = useState('')
  const nomeD = useDebounced(nome)
  const [status, setStatus] = useState<StatusPedido | ''>('')
  const [pagina, setPagina] = useState(1)
  const { data, loading, error, reload } = useAsync(
    () => pedidosApi.list({ nome: nomeD || undefined, status, pagina, tamanhoPagina: 15 }), [nomeD, status, pagina])

  async function avancar(p: Pedido) {
    const prox = PROXIMO_STATUS[p.status]; if (!prox) return
    try { await pedidosApi.atualizarStatus(p.id, prox); toast.ok(`Pedido #${p.id} → ${prox}`); reload() } catch (e) { toast.erro(msgErro(e)) }
  }
  return (
    <>
      <div className="row between wrapr">
        <h2>Pedidos</h2>
        <div className="row">
          <input type="search" placeholder="Nome do cliente…" value={nome} onChange={e => { setNome(e.target.value); setPagina(1) }} />
          <select value={status} onChange={e => { setStatus(e.target.value as StatusPedido | ''); setPagina(1) }} aria-label="Filtrar por status">
            <option value="">Todos os status</option>{STATUS_LISTA.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox msg={error} onRetry={reload} /> : !data?.itens.length ? <Empty>Nenhum pedido.</Empty> : (
        <>
          <div className="card"><table className="tbl">
            <thead><tr><th>#</th><th>Cliente</th><th>Data</th><th>Status</th><th className="num">Total</th><th /></tr></thead>
            <tbody>{data.itens.map(p => (
              <tr key={p.id}><td>{p.id}</td><td>{p.usuarioNome}</td><td>{dataHoraBr(p.dataPedido)}</td><td><StatusBadge s={p.status} /></td>
                <td className="num">{brl(p.valorTotal)}</td>
                <td className="actions"><Link to={`/pedidos/${p.id}`}>Detalhes</Link>
                  {PROXIMO_STATUS[p.status] && <button className="btn btn-primary btn-sm" onClick={() => avancar(p)}>Marcar como {PROXIMO_STATUS[p.status]}</button>}</td></tr>
            ))}</tbody></table></div>
          <Pagination pagina={data.pagina} totalPaginas={data.totalPaginas} onChange={setPagina} />
        </>
      )}
    </>
  )
}
