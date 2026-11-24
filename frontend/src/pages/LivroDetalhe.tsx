import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { livrosApi } from '../api/services'
import { Galeria } from '../components/Galeria'
import { ErrorBox, Spinner } from '../components/ui'
import { useAsync } from '../hooks'
import { brl, dataBr, ESTOQUE_BAIXO } from '../lib'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

export default function LivroDetalhe() {
  const id = Number(useParams().id)
  const { data: l, loading, error, reload } = useAsync(() => livrosApi.get(id), [id])
  const { adicionar } = useCart()
  const toast = useToast()
  const nav = useNavigate()
  const [q, setQ] = useState(1)

  if (loading) return <Spinner />
  if (error || !l) return <ErrorBox msg={error ?? 'Livro não encontrado.'} onRetry={reload} />
  const max = Math.min(100, l.quantidadeEstoque)

  return (
    <div className="detalhe">
      <Galeria livro={l} />
      <div>
        <Link to="/" className="muted small">← Voltar ao catálogo</Link>
        <h1>{l.nome}</h1>
        <p className="muted">por {l.autores.join(', ')} · {l.editoraNome}</p>
        <div className="chips mb">{l.generos.map(g => <span key={g} className="chip">{g}</span>)}</div>
        <div className="price price-lg">{brl(l.preco)}</div>
        {l.quantidadeEstoque <= 0 && <p className="danger small">Esgotado</p>}
        {l.quantidadeEstoque > 0 && l.quantidadeEstoque < ESTOQUE_BAIXO && (
          <p className="warn small">{l.quantidadeEstoque === 1 ? 'Resta apenas 1 unidade' : `Restam apenas ${l.quantidadeEstoque} unidades`}</p>
        )}
        {l.quantidadeEstoque > 0 && (
          <div className="row">
            <input type="number" className="qty" min={1} max={max} value={q} onChange={e => setQ(Math.max(1, Math.min(max, Number(e.target.value) || 1)))} aria-label="Quantidade" />
            <button className="btn btn-primary" onClick={() => { adicionar(l, q); toast.ok('Adicionado ao carrinho.') }}>Adicionar ao carrinho</button>
            <button className="btn btn-ghost" onClick={() => { adicionar(l, q); nav('/carrinho') }}>Comprar agora</button>
          </div>
        )}
        {l.sinopse && <section className="sinopse"><h3>Sinopse</h3><p className="prose">{l.sinopse}</p></section>}
        <dl className="meta">
          <dt>ISBN</dt><dd>{l.isbn}</dd>
          {l.anoLancamento && <><dt>Ano</dt><dd>{l.anoLancamento}</dd></>}
          {l.numeroPaginas && <><dt>Páginas</dt><dd>{l.numeroPaginas}</dd></>}
          {l.idioma && <><dt>Idioma</dt><dd>{l.idioma}</dd></>}
          <dt>Cadastrado em</dt><dd>{dataBr(l.dataCadastro)}</dd>
        </dl>
      </div>
    </div>
  )
}
