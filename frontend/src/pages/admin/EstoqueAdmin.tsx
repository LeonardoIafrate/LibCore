import { useState } from 'react'
import { estoqueApi } from '../../api/services'
import type { Estoque } from '../../api/types'
import { Empty, ErrorBox, Spinner } from '../../components/ui'
import { useAsync, useDebounced, msgErro } from '../../hooks'
import { useToast } from '../../context/ToastContext'
import { dataHoraBr } from '../../lib'

export default function EstoqueAdmin() {
  const toast = useToast()
  const [q, setQ] = useState('')
  const qd = useDebounced(q)
  const { data, loading, error, reload } = useAsync(() => estoqueApi.list(qd || undefined), [qd])
  return (
    <>
      <div className="row between wrapr"><h2>Estoque</h2><input type="search" placeholder="Buscar por livro…" value={q} onChange={e => setQ(e.target.value)} /></div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox msg={error} onRetry={reload} /> : !data?.length ? <Empty>Nada encontrado.</Empty> : (
        <div className="card"><table className="tbl">
          <thead><tr><th>Livro</th><th>Atualizado em</th><th className="num">Quantidade</th></tr></thead>
          <tbody>{data.map(e => <Linha key={e.id} e={e} onSaved={() => { toast.ok('Estoque atualizado.'); reload() }} />)}</tbody>
        </table></div>
      )}
    </>
  )
}

function Linha({ e, onSaved }: { e: Estoque; onSaved: () => void }) {
  const toast = useToast()
  const [v, setV] = useState(String(e.quantidade))
  const [busy, setBusy] = useState(false)
  const alterado = v !== String(e.quantidade)
  async function salvar() {
    setBusy(true)
    try { await estoqueApi.update(e.id, Number(v)); onSaved() } catch (x) { toast.erro(msgErro(x)) } finally { setBusy(false) }
  }
  return (
    <tr><td>{e.nomeLivro}</td><td className="muted">{dataHoraBr(e.dataAtualizacao)}</td>
      <td className="num"><span className="row end">
        <input className="qty" type="number" min={0} max={1000000} value={v} onChange={x => setV(x.target.value)} aria-label={`Estoque de ${e.nomeLivro}`} />
        <button className="btn btn-primary btn-sm" disabled={!alterado || busy || v === ''} onClick={salvar}>Salvar</button></span></td></tr>
  )
}
