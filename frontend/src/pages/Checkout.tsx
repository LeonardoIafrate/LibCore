import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { enderecosApi, pedidosApi } from '../api/services'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { Empty, ErrorBox, Spinner } from '../components/ui'
import { useAsync, msgErro } from '../hooks'
import { brl } from '../lib'

export default function Checkout() {
  const { itens, total, limpar } = useCart()
  const toast = useToast()
  const nav = useNavigate()
  const { data: ends, loading, error, reload } = useAsync(() => enderecosApi.list(), [])
  const [sel, setSel] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)

  const ativos = ends?.filter(e => e.ativo) ?? []
  useEffect(() => { if (sel === null && ativos.length) setSel((ativos.find(e => e.principal) ?? ativos[0]).id) }, [ativos, sel])

  if (itens.length === 0) return <Empty>Carrinho vazio. <Link to="/">Ver catálogo</Link></Empty>
  if (loading) return <Spinner />
  if (error) return <ErrorBox msg={error} onRetry={reload} />

  async function confirmar() {
    if (sel === null) return
    setErro(''); setBusy(true)
    try {
      const p = await pedidosApi.create(sel, itens.map(i => ({ livroId: i.livroId, quantidade: i.quantidade })))
      limpar(); toast.ok(`Pedido #${p.id} realizado!`); nav(`/pedidos/${p.id}`)
    } catch (e) { setErro(msgErro(e)) } finally { setBusy(false) }
  }

  return (
    <>
      <h1>Finalizar pedido</h1>
      <div className="grid g2-lg">
        <section className="card pad">
          <h3>Endereço de entrega</h3>
          {ativos.length === 0 ? <p>Você não tem endereços. <Link to="/conta/enderecos">Cadastrar endereço</Link></p> : (
            <div className="stack">
              {ativos.map(e => (
                <label key={e.id} className={`opcao ${sel === e.id ? 'sel' : ''}`}>
                  <input type="radio" name="end" checked={sel === e.id} onChange={() => setSel(e.id)} />
                  <span>{e.rua}, {e.numero}{e.complemento ? ` — ${e.complemento}` : ''}<br />
                    <span className="muted small">{e.bairro} · {e.cidade}/{e.uf} · CEP {e.cep}{e.principal && ' · principal'}</span></span>
                </label>
              ))}
              <Link to="/conta/enderecos" className="small">Gerenciar endereços</Link>
            </div>
          )}
        </section>
        <section className="card pad">
          <h3>Resumo</h3>
          <ul className="resumo">
            {itens.map(i => <li key={i.livroId}><span>{i.quantidade}× {i.nome}</span><span>{brl(i.preco * i.quantidade)}</span></li>)}
          </ul>
          <div className="row between"><strong>Total estimado</strong><strong className="price">{brl(total)}</strong></div>
          {erro && <div className="alert alert-erro mt" role="alert">{erro}</div>}
          <button className="btn btn-primary block mt" disabled={busy || sel === null} onClick={confirmar}>{busy ? 'Enviando…' : 'Confirmar pedido'}</button>
        </section>
      </div>
    </>
  )
}
