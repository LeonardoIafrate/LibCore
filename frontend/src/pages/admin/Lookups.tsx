import { useState, type FormEvent } from 'react'
import { autoresApi, categoriasApi, editorasApi } from '../../api/services'
import { ApiError } from '../../api/client'
import { Confirm, Empty, ErrorBox, Modal, Spinner, TextArea, TextField } from '../../components/ui'
import { useAsync, useDebounced, msgErro } from '../../hooks'
import { useToast } from '../../context/ToastContext'

type Campo = { chave: string; label: string; max: number; area?: boolean; obrigatorio?: boolean }
interface Cfg<T extends { id: number }> {
  titulo: string; singular: string; filtroLabel: string; campos: Campo[]
  list: (q?: string) => Promise<T[]>
  create: (d: any) => Promise<unknown>
  update: (id: number, d: any) => Promise<unknown>
  remove: (id: number) => Promise<void>
  coluna: (t: T) => string
}

function CrudSimples<T extends { id: number }>({ cfg }: { cfg: Cfg<T> }) {
  const toast = useToast()
  const [q, setQ] = useState('')
  const qd = useDebounced(q)
  const { data, loading, error, reload } = useAsync(() => cfg.list(qd || undefined), [qd, cfg.titulo])
  const [edit, setEdit] = useState<T | 'novo' | null>(null)
  const [del, setDel] = useState<T | null>(null)

  async function excluir() {
    if (!del) return
    try { await cfg.remove(del.id); toast.ok(`${cfg.singular} excluído(a).`); reload() } catch (e) { toast.erro(msgErro(e)) }
    setDel(null)
  }
  return (
    <>
      <div className="row between wrapr">
        <h2>{cfg.titulo}</h2>
        <div className="row">
          <input type="search" placeholder={cfg.filtroLabel} value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn btn-primary" onClick={() => setEdit('novo')}>Novo(a) {cfg.singular}</button>
        </div>
      </div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox msg={error} onRetry={reload} /> : !data?.length ? <Empty>Nada encontrado.</Empty> : (
        <div className="card"><table className="tbl">
          <thead><tr><th>ID</th><th>{cfg.campos[0].label}</th>{cfg.campos[1] && <th>{cfg.campos[1].label}</th>}<th /></tr></thead>
          <tbody>{data.map(t => {
            const r = t as unknown as Record<string, unknown>
            return (
              <tr key={t.id}><td>{t.id}</td><td>{cfg.coluna(t)}</td>
                {cfg.campos[1] && <td className="muted">{String(r[cfg.campos[1].chave] ?? '—')}</td>}
                <td className="actions"><button className="link" onClick={() => setEdit(t)}>Editar</button>
                  <button className="link danger" onClick={() => setDel(t)}>Excluir</button></td></tr>
            )
          })}</tbody></table></div>
      )}
      {edit && <FormModal cfg={cfg} item={edit === 'novo' ? null : edit} onClose={() => setEdit(null)} onDone={() => { setEdit(null); reload(); toast.ok('Salvo.') }} />}
      {del && <Confirm titulo={`Excluir ${cfg.singular}`} texto={`Excluir “${cfg.coluna(del)}”? Se houver livros vinculados, a API pode recusar.`} confirmar="Excluir" perigo onYes={excluir} onNo={() => setDel(null)} />}
    </>
  )
}

function FormModal<T extends { id: number }>({ cfg, item, onClose, onDone }: { cfg: Cfg<T>; item: T | null; onClose: () => void; onDone: () => void }) {
  const ini = Object.fromEntries(cfg.campos.map(c => [c.chave, String((item as any)?.[c.chave] ?? '')]))
  const [v, setV] = useState<Record<string, string>>(ini)
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)
  const err = (k: string) => Object.entries(erros).find(([c]) => c.toLowerCase() === k.toLowerCase())?.[1][0]

  async function salvar(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErro(''); setErros({})
    const corpo = Object.fromEntries(cfg.campos.map(c => [c.chave, v[c.chave].trim() === '' && !c.obrigatorio ? null : v[c.chave].trim()]))
    try { item ? await cfg.update(item.id, corpo) : await cfg.create(corpo); onDone() }
    catch (x) { if (x instanceof ApiError) setErros(x.fieldErrors); setErro(msgErro(x)) } finally { setBusy(false) }
  }
  return (
    <Modal titulo={`${item ? 'Editar' : 'Novo(a)'} ${cfg.singular}`} onClose={onClose}>
      <form className="stack" onSubmit={salvar}>
        {erro && <div className="alert alert-erro">{erro}</div>}
        {cfg.campos.map(c => c.area
          ? <TextArea key={c.chave} label={c.label} rows={5} value={v[c.chave]} maxLength={c.max} error={err(c.chave)} onChange={e => setV({ ...v, [c.chave]: e.target.value })} />
          : <TextField key={c.chave} label={c.label} value={v[c.chave]} maxLength={c.max} required={c.obrigatorio} error={err(c.chave)} onChange={e => setV({ ...v, [c.chave]: e.target.value })} />)}
        <div className="row end"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" disabled={busy}>Salvar</button></div>
      </form>
    </Modal>
  )
}

export const AutoresAdmin = () => <CrudSimples cfg={{
  titulo: 'Autores', singular: 'autor', filtroLabel: 'Buscar por nome…',
  campos: [{ chave: 'nome', label: 'Nome', max: 100, obrigatorio: true }, { chave: 'nacionalidade', label: 'Nacionalidade', max: 100 }, { chave: 'biografia', label: 'Biografia', max: 3000, area: true }],
  list: autoresApi.list, create: autoresApi.create, update: autoresApi.update, remove: autoresApi.remove, coluna: (a: any) => a.nome,
}} />
export const CategoriasAdmin = () => <CrudSimples cfg={{
  titulo: 'Categorias', singular: 'categoria', filtroLabel: 'Buscar por gênero…',
  campos: [{ chave: 'genero', label: 'Gênero', max: 30, obrigatorio: true }],
  list: categoriasApi.list, create: categoriasApi.create, update: categoriasApi.update, remove: categoriasApi.remove, coluna: (c: any) => c.genero,
}} />
export const EditorasAdmin = () => <CrudSimples cfg={{
  titulo: 'Editoras', singular: 'editora', filtroLabel: 'Buscar por nome…',
  campos: [{ chave: 'nome', label: 'Nome', max: 100, obrigatorio: true }],
  list: editorasApi.list, create: editorasApi.create, update: editorasApi.update, remove: editorasApi.remove, coluna: (e: any) => e.nome,
}} />
