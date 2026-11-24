import { useEffect, useState } from 'react'
import type { Livro } from '../api/types'
import { assetUrl } from '../api/client'
import { Capa } from './BookCard'

/** Imagem principal + miniaturas (capa seguida das imagens adicionais). */
export function Galeria({ livro }: { livro: Livro }) {
  const fotos = [livro.imagemUrl, ...(livro.imagens ?? []).map(i => i.url)]
    .filter((u): u is string => !!u)
  const [atual, setAtual] = useState(0)
  useEffect(() => setAtual(0), [livro.id])

  if (fotos.length === 0) return <Capa livro={livro} grande />

  const ativa = Math.min(atual, fotos.length - 1)
  return (
    <div className="galeria">
      <div className="capa capa-img capa-lg">
        <img src={assetUrl(fotos[ativa])!} alt={`Imagem ${ativa + 1} de ${livro.nome}`} />
      </div>
      {fotos.length > 1 && (
        <div className="galeria-mini" role="tablist" aria-label="Imagens do livro">
          {fotos.map((u, i) => (
            <button key={u} type="button" role="tab" aria-selected={i === ativa}
              className={`mini ${i === ativa ? 'mini-ativa' : ''}`} onClick={() => setAtual(i)}
              aria-label={`Ver imagem ${i + 1}`}>
              <img src={assetUrl(u)!} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
