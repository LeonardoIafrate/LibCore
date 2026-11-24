import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Empty } from '../components/ui'
import { brl } from '../lib'

export default function Carrinho() {
  const { itens, total, alterar, remover, limpar } = useCart()
  const { sessao } = useAuth()
  const nav = useNavigate()
  if (itens.length === 0) return <Empty>Seu carrinho está vazio. <Link to="/">Ver catálogo</Link></Empty>
  return (
    <>
      <h1>Carrinho</h1>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Livro</th><th className="num">Preço</th><th>Qtd.</th><th className="num">Subtotal</th><th /></tr></thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.livroId}>
                <td><Link to={`/livros/${i.livroId}`}>{i.nome}</Link></td>
                <td className="num">{brl(i.preco)}</td>
                <td><input className="qty" type="number" min={1} max={Math.min(100, i.estoque)} value={i.quantidade} onChange={e => alterar(i.livroId, Number(e.target.value) || 1)} aria-label={`Quantidade de ${i.nome}`} /></td>
                <td className="num">{brl(i.preco * i.quantidade)}</td>
                <td><button className="link danger" onClick={() => remover(i.livroId)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row between mt">
        <button className="btn btn-ghost" onClick={limpar}>Esvaziar carrinho</button>
        <div className="row">
          <div><span className="muted">Total estimado</span> <strong className="price price-lg">{brl(total)}</strong></div>
          <button className="btn btn-primary" onClick={() => nav(sessao ? '/checkout' : '/entrar', { state: { de: '/checkout' } })}>Finalizar pedido</button>
        </div>
      </div>
      <p className="muted small">O valor final é calculado pelo servidor com o preço atual de cada livro.</p>
    </>
  )
}
