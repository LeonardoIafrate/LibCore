import { useEffect, useRef, useState } from 'react'
import type { EnderecoInput } from '../api/types'
import { SelectField, TextField } from './ui'
import { UFS, formatCep } from '../lib'

export const enderecoVazio: EnderecoInput = { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: 'SP' }

type StatusCep = 'ocioso' | 'buscando' | 'ok' | 'naoEncontrado' | 'falhou'

/**
 * Campos de endereço controlados. `erros` usa as chaves do ValidationProblemDetails (ex.: "Endereco.Cep").
 * Ao completar o CEP (8 dígitos) consulta o ViaCEP (gratuito, sem chave) e preenche rua, bairro, cidade e UF.
 */
export default function EnderecoFields({ value, onChange, erros = {}, prefixo = '' }:
  { value: EnderecoInput; onChange: (v: EnderecoInput) => void; erros?: Record<string, string[]>; prefixo?: string }) {
  const [status, setStatus] = useState<StatusCep>('ocioso')
  const raiz = useRef<HTMLDivElement>(null)
  const atual = useRef(value)
  atual.current = value
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  // CEP já presente ao montar (edição) não deve ser consultado de novo
  const ultimoCep = useRef(value.cep.replace(/\D/g, ''))

  const set = (k: keyof EnderecoInput, v: string) => onChange({ ...value, [k]: v })
  const err = (k: string) => {
    const hit = Object.entries(erros).find(([c]) => c.toLowerCase() === (prefixo + k).toLowerCase())
    return hit?.[1][0]
  }

  const cepDigitos = value.cep.replace(/\D/g, '')
  useEffect(() => {
    if (cepDigitos.length < 8) { setStatus('ocioso'); ultimoCep.current = cepDigitos; return }
    if (cepDigitos === ultimoCep.current) return
    ultimoCep.current = cepDigitos

    const ctrl = new AbortController()
    setStatus('buscando')
    fetch(`https://viacep.com.br/ws/${cepDigitos}/json/`, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error('http'); return r.json() })
      .then((d: { erro?: boolean | string; logradouro?: string; bairro?: string; localidade?: string; uf?: string }) => {
        if (d.erro) { setStatus('naoEncontrado'); return }
        const v = atual.current
        // só sobrescreve com o que o CEP trouxe; CEPs genéricos de cidade vêm sem rua/bairro
        onChangeRef.current({
          ...v,
          rua: d.logradouro?.trim() || v.rua,
          bairro: d.bairro?.trim() || v.bairro,
          cidade: d.localidade?.trim() || v.cidade,
          uf: d.uf && UFS.includes(d.uf.toUpperCase()) ? d.uf.toUpperCase() : v.uf,
        })
        setStatus('ok')
        raiz.current?.querySelector<HTMLInputElement>('input[name="numero"]')?.focus()
      })
      .catch(e => { if (e?.name !== 'AbortError') setStatus('falhou') })
    return () => ctrl.abort()
  }, [cepDigitos])

  const dicaCep =
    status === 'buscando' ? 'Buscando endereço…' :
    status === 'ok' ? 'Endereço preenchido pelo CEP. Confira os dados.' :
    status === 'naoEncontrado' ? 'CEP não encontrado. Preencha manualmente.' :
    status === 'falhou' ? 'Não foi possível buscar o CEP agora. Preencha manualmente.' : undefined

  return (
    <div className="grid g3" ref={raiz}>
      <TextField label="CEP" name="cep" value={value.cep} onChange={e => set('cep', formatCep(e.target.value))} error={err('Cep')} hint={dicaCep} placeholder="00000-000" inputMode="numeric" autoComplete="postal-code" required />
      <div className="span2"><TextField label="Rua" name="rua" value={value.rua} onChange={e => set('rua', e.target.value)} error={err('Rua')} maxLength={150} required /></div>
      <TextField label="Número" name="numero" value={value.numero} onChange={e => set('numero', e.target.value)} error={err('Numero')} maxLength={10} required />
      <div className="span2"><TextField label="Complemento" name="complemento" value={value.complemento ?? ''} onChange={e => set('complemento', e.target.value)} error={err('Complemento')} maxLength={100} /></div>
      <TextField label="Bairro" name="bairro" value={value.bairro} onChange={e => set('bairro', e.target.value)} error={err('Bairro')} maxLength={100} required />
      <TextField label="Cidade" name="cidade" value={value.cidade} onChange={e => set('cidade', e.target.value)} error={err('Cidade')} maxLength={100} required />
      <SelectField label="UF" name="uf" value={value.uf} onChange={e => set('uf', e.target.value)} error={err('Uf')}>
        {UFS.map(u => <option key={u}>{u}</option>)}
      </SelectField>
    </div>
  )
}

export function useEnderecoState(inicial: EnderecoInput = enderecoVazio) {
  return useState<EnderecoInput>(inicial)
}
