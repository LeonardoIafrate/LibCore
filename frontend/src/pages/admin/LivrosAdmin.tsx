import { useEffect, useState, type FormEvent } from 'react'
import { autoresApi, categoriasApi, editorasApi, livrosApi } from '../../api/services'
import { ApiError } from '../../api/client'
import type { Livro, LivroInput } from '../../api/types'
import { Confirm, Empty, ErrorBox, Modal, Pagination, SelectField, Spinner, TextArea, TextField } from '../../components/ui'
import { useAsync, useDebounced, msgErro } from '../../hooks'
import { useToast } from '../../context/ToastContext'
import { brl } from '../../lib'
import { assetUrl } from '../../api/client'

export default function LivrosAdmin() {
  const toast = useToast()
  const [q, setQ] = useState('')
  const qd = useDebounced(q)
  const [pagina, setPagina] = useState(1)
  const { data, loading, error, reload } = useAsync(() => livrosApi.list({ nome: qd || undefined, pagina, tamanhoPagina: 15 }), [qd, pagina])
  const [edit, setEdit] = useState<Livro | 'novo' | null>(null)
  const [del, setDel] = useState<Livro | null>(null)

  async function excluir() {
    if (!del) return
    try { await livrosApi.remove(del.id); toast.ok('Livro excluído.'); reload() } catch (e) { toast.erro(msgErro(e)) }
    setDel(null)
  }
  return (
    <>
      <div className="row between wrapr">
        <h2>Livros</h2>
        <div className="row">
          <input type="search" placeholder="Buscar por título…" value={q} onChange={e => { setQ(e.target.value); setPagina(1) }} />
          <button className="btn btn-primary" onClick={() => setEdit('novo')}>Novo livro</button>
        </div>
      </div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox msg={error} onRetry={reload} /> : !data?.itens.length ? <Empty>Nenhum livro.</Empty> : (
        <>
          <div className="card"><table className="tbl">
            <thead><tr><th>ID</th><th>Capa</th><th>Título</th><th>ISBN</th><th className="num">Preço</th><th className="num">Estoque</th><th /></tr></thead>
            <tbody>{data.itens.map(l => (
              <tr key={l.id}><td>{l.id}</td><td>{l.imagemUrl ? <img className="thumb" src={assetUrl(l.imagemUrl)!} alt="" /> : <span className="muted">—</span>}</td><td>{l.nome}<div className="muted small">{l.autores.join(', ')}</div></td><td>{l.isbn}</td>
                <td className="num">{brl(l.preco)}</td><td className="num">{l.quantidadeEstoque}</td>
                <td className="actions"><button className="link" onClick={() => setEdit(l)}>Editar</button><button className="link danger" onClick={() => setDel(l)}>Excluir</button></td></tr>
            ))}</tbody></table></div>
          <Pagination pagina={data.pagina} totalPaginas={data.totalPaginas} onChange={setPagina} />
        </>
      )}
      {edit && <LivroForm livro={edit === 'novo' ? null : edit} onClose={() => setEdit(null)} onDone={() => { setEdit(null); reload(); toast.ok('Livro salvo.') }} />}
      {del && <Confirm titulo="Excluir livro" texto={`Excluir “${del.nome}”? Livros com pedidos podem não poder ser excluídos.`} confirmar="Excluir" perigo onYes={excluir} onNo={() => setDel(null)} />}
    </>
  )
}

function LivroForm({ livro, onClose, onDone }: { livro: Livro | null; onClose: () => void; onDone: () => void }) {
  const editoras = useAsync(() => editorasApi.list(), [])
  const cats = useAsync(() => categoriasApi.list(), [])
  const autores = useAsync(() => autoresApi.list(), [])

  const [v, setV] = useState({
    nome: livro?.nome ?? '', sinopse: livro?.sinopse ?? '', anoLancamento: livro?.anoLancamento?.toString() ?? '',
    isbn: livro?.isbn ?? '', preco: livro?.preco.toString() ?? '', numeroPaginas: livro?.numeroPaginas?.toString() ?? '',
    idioma: livro?.idioma ?? 'Português', editoraId: livro?.editoraId.toString() ?? '', quantidadeInicial: '0',
  })
  const [catIds, setCatSel] = useState<number[]>(livro?.categoriaIds ?? [])
  const [autIds, setAutSel] = useState<number[]>(livro?.autoresIds ?? [])

  const toast = useToast()
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [removerImagem, setRemoverImagem] = useState(false)
  const [erroImagem, setErroImagem] = useState('')
  useEffect(() => {
    if (!arquivo) { setPreview(null); return }
    const url = URL.createObjectURL(arquivo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [arquivo])

  function escolher(f: File | null) {
    setErroImagem('')
    if (!f) { setArquivo(null); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return setErroImagem('Use uma imagem JPEG, PNG ou WebP.')
    if (f.size > 2 * 1024 * 1024) return setErroImagem('A imagem deve ter no máximo 2 MB.')
    setArquivo(f); setRemoverImagem(false)
  }

  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)
  const err = (k: string) => Object.entries(erros).find(([c]) => c.toLowerCase() === k.toLowerCase())?.[1][0]
  const toggle = (arr: number[], id: number) => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]
  const set = (k: keyof typeof v, val: string) => setV({ ...v, [k]: val })

  async function salvar(e: FormEvent) {
    e.preventDefault(); setErro(''); setErros({})
    if (!v.editoraId) return setErro('Selecione a editora.')
    if (autIds.length === 0) return setErro('Informe ao menos um autor.')
    const corpo: LivroInput = {
      nome: v.nome.trim(), sinopse: v.sinopse.trim() || null,
      anoLancamento: v.anoLancamento ? Number(v.anoLancamento) : null,
      isbn: v.isbn.replace(/[-\s]/g, ''), preco: Number(v.preco.replace(',', '.')),
      numeroPaginas: v.numeroPaginas ? Number(v.numeroPaginas) : null,
      idioma: v.idioma.trim(), editoraId: Number(v.editoraId),
      categoriaIds: catIds, autoresIds: autIds, quantidadeInicial: Number(v.quantidadeInicial) || 0,
    }
    setBusy(true)
    try {
      const salvo = livro ? await livrosApi.update(livro.id, corpo) : await livrosApi.create(corpo)
      // o livro já está salvo; uma falha na imagem não deve perder o cadastro
      try {
        if (arquivo) await livrosApi.setImagem(salvo.id, arquivo)
        else if (removerImagem && livro?.imagemUrl) await livrosApi.removeImagem(salvo.id)
      } catch (x) {
        toast.erro(`Livro salvo, mas a imagem não foi enviada: ${msgErro(x)}`)
      }
      onDone()
    }
    catch (x) { if (x instanceof ApiError) setErros(x.fieldErrors); setErro(msgErro(x)) } finally { setBusy(false) }
  }

  const carregando = editoras.loading || cats.loading || autores.loading
  return (
    <Modal titulo={livro ? `Editar “${livro.nome}”` : 'Novo livro'} onClose={onClose} largo>
      {carregando ? <Spinner /> : (
        <form className="stack" onSubmit={salvar}>
          {erro && <div className="alert alert-erro" role="alert">{erro}</div>}
          <TextField label="Título" value={v.nome} maxLength={250} required error={err('Nome')} onChange={e => set('nome', e.target.value)} />
          <div className="grid g3">
            <TextField label="ISBN" value={v.isbn} required error={err('Isbn')} hint="10 ou 13 dígitos" onChange={e => set('isbn', e.target.value)} />
            <TextField label="Preço (R$)" type="number" step="0.01" min={0.1} max={10000} value={v.preco} required error={err('Preco')} onChange={e => set('preco', e.target.value)} />
            <TextField label="Idioma" value={v.idioma} maxLength={50} required error={err('Idioma')} onChange={e => set('idioma', e.target.value)} />
            <TextField label="Ano de lançamento" type="number" min={1000} max={2100} value={v.anoLancamento} error={err('AnoLancamento')} onChange={e => set('anoLancamento', e.target.value)} />
            <TextField label="Nº de páginas" type="number" min={1} max={10000} value={v.numeroPaginas} error={err('NumeroPaginas')} onChange={e => set('numeroPaginas', e.target.value)} />
            {!livro && <TextField label="Estoque inicial" type="number" min={0} value={v.quantidadeInicial} error={err('QuantidadeInicial')} onChange={e => set('quantidadeInicial', e.target.value)} />}
          </div>
          <SelectField label="Editora" value={v.editoraId} error={err('EditoraId')} onChange={e => set('editoraId', e.target.value)}>
            <option value="">Selecione…</option>{editoras.data?.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
          </SelectField>
          <fieldset className="multi"><legend>Autores {err('AutoresIds') && <span className="field-error">{err('AutoresIds')}</span>}</legend>
            {autores.data?.map(a => <label key={a.id} className="check"><input type="checkbox" checked={autIds.includes(a.id)} onChange={() => setAutSel(toggle(autIds, a.id))} /> {a.nome}</label>)}</fieldset>
          <fieldset className="multi"><legend>Categorias</legend>
            {cats.data?.map(c => <label key={c.id} className="check"><input type="checkbox" checked={catIds.includes(c.id)} onChange={() => setCatSel(toggle(catIds, c.id))} /> {c.genero}</label>)}</fieldset>
          <div className="field"><span className="field-label">Capa</span>
            <div className="upload">
              <div className="upload-prev">
                {preview || (livro?.imagemUrl && !removerImagem)
                  ? <div className="capa capa-img"><img src={preview ?? assetUrl(livro!.imagemUrl)!} alt="Pré-visualização da capa" /></div>
                  : <div className="capa" style={{ background: '#304878' }}><span className="capa-titulo">Sem capa</span></div>}
              </div>
              <div className="stack" style={{ flex: 1 }}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => escolher(e.target.files?.[0] ?? null)} aria-label="Arquivo da capa" />
                <span className="field-hint">JPEG, PNG ou WebP, até 2 MB. Proporção ideal 2:3.</span>
                {erroImagem && <span className="field-error">{erroImagem}</span>}
                {(arquivo || (livro?.imagemUrl && !removerImagem)) && (
                  <button type="button" className="link danger" style={{ alignSelf: 'flex-start' }}
                    onClick={() => { if (arquivo) setArquivo(null); else setRemoverImagem(true) }}>
                    {arquivo ? 'Descartar imagem escolhida' : 'Remover capa atual'}
                  </button>
                )}
              </div>
            </div>
          </div>
          <TextArea label="Sinopse" rows={4} maxLength={2000} value={v.sinopse} error={err('Sinopse')} onChange={e => set('sinopse', e.target.value)} />
          {livro && <p className="muted small">O estoque é ajustado na aba “Estoque”.</p>}
          <div className="row end"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</button></div>
        </form>
      )}
    </Modal>
  )
}
