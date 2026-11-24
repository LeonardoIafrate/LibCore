import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Livro } from '../api/types'

export interface ItemCarrinho {
  livroId: number; nome: string; preco: number; quantidade: number; estoque: number
}
interface CartCtx {
  itens: ItemCarrinho[]
  total: number
  qtd: number
  adicionar: (l: Livro, q?: number) => void
  alterar: (livroId: number, q: number) => void
  remover: (livroId: number) => void
  limpar: () => void
}
const KEY = 'libcore.carrinho'
const Ctx = createContext<CartCtx | null>(null)
const MAX_ITEM = 100 // limite da API por item

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  })
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(itens)) }, [itens])

  const value = useMemo<CartCtx>(() => {
    const limite = (i: { estoque: number }) => Math.max(1, Math.min(MAX_ITEM, i.estoque))
    return {
      itens,
      total: itens.reduce((s, i) => s + i.preco * i.quantidade, 0),
      qtd: itens.reduce((s, i) => s + i.quantidade, 0),
      adicionar: (l, q = 1) => setItens(cur => {
        const ex = cur.find(i => i.livroId === l.id)
        if (ex) return cur.map(i => i.livroId === l.id
          ? { ...i, preco: l.preco, estoque: l.quantidadeEstoque, quantidade: Math.min(i.quantidade + q, limite({ estoque: l.quantidadeEstoque })) }
          : i)
        return [...cur, { livroId: l.id, nome: l.nome, preco: l.preco, estoque: l.quantidadeEstoque, quantidade: Math.min(q, limite({ estoque: l.quantidadeEstoque })) }]
      }),
      alterar: (id, q) => setItens(cur => cur.map(i => i.livroId === id ? { ...i, quantidade: Math.max(1, Math.min(q, limite(i))) } : i)),
      remover: id => setItens(cur => cur.filter(i => i.livroId !== id)),
      limpar: () => setItens([]),
    }
  }, [itens])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart fora do CartProvider')
  return c
}
