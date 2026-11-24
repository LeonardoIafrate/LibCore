import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { autoresApi, categoriasApi, editorasApi, livrosApi } from '../api/services'
import { Empty, ErrorBox, Pagination, Spinner } from '../components/ui'
import BookCard from '../components/BookCard'
import { useAsync, useDebounced } from '../hooks'

export default function Catalogo() {
  const [sp, setSp] = useSearchParams()
  const pagina = Number(sp.get('pagina') ?? 1)
  const [nome, setNome] = useState(sp.get('nome') ?? '')
  const nomeD = useDebounced(nome)
  const categoriaId = sp.get('categoriaId') ?? ''
  const autorId = sp.get('autorId') ?? ''
  const editoraId = sp.get('editoraId') ?? ''
  const precoMin = sp.get('precoMin') ?? ''
  const precoMax = sp.get('precoMax') ?? ''

  const setParam = (k: string, v: string) => {
    const n = new URLSearchParams(sp)
    v ? n.set(k, v) : n.delete(k)
    if (k !== 'pagina') n.delete('pagina')
    setSp(n, { replace: true })
  }
  useEffect(() => { if ((sp.get('nome') ?? '') !== nomeD) setParam('nome', nomeD) /* eslint-disable-next-line */ }, [nomeD])

  const cats = useAsync(() => categoriasApi.list(), [])
  const autores = useAsync(() => autoresApi.list(), [])
  const editoras = useAsync(() => editorasApi.list(), [])
  const livros = useAsync(() => livrosApi.list({
    nome: nomeD || undefined,
    categoriaId: categoriaId ? Number(categoriaId) : undefined,
    autorId: autorId ? Number(autorId) : undefined,
    editoraId: editoraId ? Number(editoraId) : undefined,
    precoMin: precoMin ? Number(precoMin) : undefined,
    precoMax: precoMax ? Number(precoMax) : undefined,
    pagina, tamanhoPagina: 12,
  }), [nomeD, categoriaId, autorId, editoraId, precoMin, precoMax, pagina])

  const limpar = () => { setNome(''); setSp({}, { replace: true }) }
  const temFiltro = !!(nome || categoriaId || autorId || editoraId || precoMin || precoMax)

  return (
    <>
      <section className="hero">
        <h1>Boas histórias, <em>bem catalogadas.</em></h1>
        <p className="muted">Explore o acervo, filtre por gênero, autor ou editora e monte seu pedido.</p>
        <input className="search" type="search" placeholder="Buscar livro pelo título…" value={nome} onChange={e => setNome(e.target.value)} aria-label="Buscar livro" />
      </section>

      <div className="layout-filtros">
        <aside className="filtros card pad">
          <h3>Filtros</h3>
          <label className="field"><span className="field-label">Gênero</span>
            <select value={categoriaId} onChange={e => setParam('categoriaId', e.target.value)}>
              <option value="">Todos</option>{cats.data?.map(c => <option key={c.id} value={c.id}>{c.genero}</option>)}
            </select></label>
          <label className="field"><span className="field-label">Autor</span>
            <select value={autorId} onChange={e => setParam('autorId', e.target.value)}>
              <option value="">Todos</option>{autores.data?.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select></label>
          <label className="field"><span className="field-label">Editora</span>
            <select value={editoraId} onChange={e => setParam('editoraId', e.target.value)}>
              <option value="">Todas</option>{editoras.data?.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select></label>
          <div className="grid g2">
            <label className="field"><span className="field-label">Preço mín.</span>
              <input type="number" min={0} max={10000} value={precoMin} onChange={e => setParam('precoMin', e.target.value)} /></label>
            <label className="field"><span className="field-label">Preço máx.</span>
              <input type="number" min={0} max={10000} value={precoMax} onChange={e => setParam('precoMax', e.target.value)} /></label>
          </div>
          {temFiltro && <button className="btn btn-ghost" onClick={limpar}>Limpar filtros</button>}
        </aside>

        <section>
          {livros.loading && !livros.data ? <Spinner /> :
           livros.error ? <ErrorBox msg={livros.error} onRetry={livros.reload} /> :
           livros.data && livros.data.itens.length === 0 ? <Empty>Nenhum livro encontrado com esses filtros.</Empty> : (
            <>
              <div className="muted small mb">{livros.data?.total} {livros.data?.total === 1 ? 'livro' : 'livros'}</div>
              <div className="grid-livros" style={{ opacity: livros.loading ? .6 : 1 }}>
                {livros.data?.itens.map(l => <BookCard key={l.id} livro={l} />)}
              </div>
              {livros.data && <Pagination pagina={livros.data.pagina} totalPaginas={livros.data.totalPaginas} onChange={p => { setParam('pagina', String(p)); window.scrollTo({ top: 0 }) }} />}
            </>
          )}
        </section>
      </div>
    </>
  )
}
