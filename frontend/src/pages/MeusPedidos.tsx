import { Link } from 'react-router-dom'
import { pedidosApi } from '../api/services'
import { Empty, ErrorBox, Spinner, StatusBadge } from '../components/ui'
import { useAsync } from '../hooks'
import { brl, dataHoraBr } from '../lib'

export default function MeusPedidos() {
  const { data, loading, error, reload } = useAsync(() => pedidosApi.meus(), [])
  if (loading) return <Spinner />
  if (error) return <ErrorBox msg={error} onRetry={reload} />
  if (!data?.length) return <Empty>Você ainda não fez pedidos. <Link to="/">Explorar catálogo</Link></Empty>
  const lista = [...data].sort((a, b) => b.id - a.id)
  return (
    <>
      <h1>Meus pedidos</h1>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Pedido</th><th>Data</th><th>Status</th><th className="num">Total</th><th /></tr></thead>
          <tbody>{lista.map(p => (
            <tr key={p.id}><td>#{p.id}</td><td>{dataHoraBr(p.dataPedido)}</td><td><StatusBadge s={p.status} /></td>
              <td className="num">{brl(p.valorTotal)}</td><td><Link to={`/pedidos/${p.id}`}>Detalhes</Link></td></tr>
          ))}</tbody>
        </table>
      </div>
    </>
  )
}
