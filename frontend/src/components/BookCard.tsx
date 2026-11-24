import { Link } from 'react-router-dom'
import type { Livro } from '../api/types'
import { brl } from '../lib'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { assetUrl } from '../api/client'

const PALETA = ['#304878', '#181848', '#3a7099', '#2a5a80', '#3b3f7a', '#1f4f6b']
export const capa = (id: number) => PALETA[id % PALETA.length]

export function Capa({ livro, grande }: { livro: Livro; grande?: boolean }) {
  const src = assetUrl(livro.imagemUrl)
  if (src) {
    return (
      <div className={`capa capa-img ${grande ? 'capa-lg' : ''}`}>
        <img src={src} alt={`Capa de ${livro.nome}`} loading="lazy" />
      </div>
    )
  }
  return (
    <div className={`capa ${grande ? 'capa-lg' : ''}`} style={{ background: capa(livro.id) }} aria-hidden>
      <span className="capa-titulo">{livro.nome}</span>
      <span className="capa-autor">{livro.autores[0] ?? ''}</span>
    </div>
  )
}

export default function BookCard({ livro }: { livro: Livro }) {
  const { adicionar } = useCart()
  const toast = useToast()
  const esgotado = livro.quantidadeEstoque <= 0
  return (
    <article className="card book">
      <Link to={`/livros/${livro.id}`}><Capa livro={livro} /></Link>
      <div className="book-body">
        <Link to={`/livros/${livro.id}`} className="book-title">{livro.nome}</Link>
        <div className="muted small">{livro.autores.join(', ') || '—'}</div>
        <div className="chips">{livro.generos.slice(0, 2).map(g => <span key={g} className="chip">{g}</span>)}</div>
        <div className="book-foot">
          <strong className="price">{brl(livro.preco)}</strong>
          <button className="btn btn-primary btn-sm" disabled={esgotado}
            onClick={() => { adicionar(livro); toast.ok(`“${livro.nome}” adicionado ao carrinho.`) }}>
            {esgotado ? 'Esgotado' : 'Comprar'}
          </button>
        </div>
      </div>
    </article>
  )
}
