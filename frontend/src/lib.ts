import type { StatusPedido } from './api/types'

/** Abaixo disso o estoque aparece para o cliente ("restam poucas unidades"). */
export const ESTOQUE_BAIXO = 50

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const dataBr = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
export const dataHoraBr = (iso: string) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export const PROXIMO_STATUS: Partial<Record<StatusPedido, StatusPedido>> = {
  Pendente: 'Pago', Pago: 'Enviado', Enviado: 'Entregue',
}
export const STATUS_LISTA: StatusPedido[] = ['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado']

export function formatCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
export function formatCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
