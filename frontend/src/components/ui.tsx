import { useEffect, useState, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import type { StatusPedido } from '../api/types'

export const Spinner = ({ texto = 'Carregando…' }: { texto?: string }) =>
  <div className="center muted" role="status"><span className="spinner" /> {texto}</div>

export const ErrorBox = ({ msg, onRetry }: { msg: string; onRetry?: () => void }) => (
  <div className="alert alert-erro" role="alert">
    {msg} {onRetry && <button className="link" onClick={onRetry}>Tentar de novo</button>}
  </div>
)

export const Empty = ({ children }: { children: ReactNode }) => <div className="empty">{children}</div>

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

type FP = { label: string; error?: string; hint?: string }
export const TextField = ({ label, error, hint, ...p }: FP & InputHTMLAttributes<HTMLInputElement>) =>
  <Field label={label} error={error} hint={hint}><input {...p} /></Field>
export const TextArea = ({ label, error, hint, ...p }: FP & TextareaHTMLAttributes<HTMLTextAreaElement>) =>
  <Field label={label} error={error} hint={hint}><textarea {...p} /></Field>
export function PasswordField({ label, error, hint, ...p }: FP & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visivel, setVisivel] = useState(false)
  return (
    <Field label={label} error={error} hint={hint}>
      <span className="pw">
        <input {...p} type={visivel ? 'text' : 'password'} />
        <button type="button" className="pw-btn" title={visivel ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setVisivel(v => !v)} aria-pressed={visivel}
          aria-label={visivel ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {visivel ? (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            ) : (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </span>
    </Field>
  )
}
export const SelectField = ({ label, error, hint, children, ...p }: FP & SelectHTMLAttributes<HTMLSelectElement>) =>
  <Field label={label} error={error} hint={hint}><select {...p}>{children}</select></Field>

export function Pagination({ pagina, totalPaginas, onChange }: { pagina: number; totalPaginas: number; onChange: (p: number) => void }) {
  if (totalPaginas <= 1) return null
  return (
    <nav className="pager" aria-label="Paginação">
      <button className="btn btn-ghost" disabled={pagina <= 1} onClick={() => onChange(pagina - 1)}>← Anterior</button>
      <span className="muted">Página {pagina} de {totalPaginas}</span>
      <button className="btn btn-ghost" disabled={pagina >= totalPaginas} onClick={() => onChange(pagina + 1)}>Próxima →</button>
    </nav>
  )
}

export function Modal({ titulo, onClose, children, largo }: { titulo: string; onClose: () => void; children: ReactNode; largo?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${largo ? 'modal-lg' : ''}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-head"><h3>{titulo}</h3><button className="icon-btn" onClick={onClose} aria-label="Fechar">×</button></div>
        {children}
      </div>
    </div>
  )
}

export function Confirm({ titulo, texto, confirmar = 'Confirmar', perigo, onYes, onNo, busy }:
  { titulo: string; texto: string; confirmar?: string; perigo?: boolean; onYes: () => void; onNo: () => void; busy?: boolean }) {
  return (
    <Modal titulo={titulo} onClose={onNo}>
      <p>{texto}</p>
      <div className="row end">
        <button className="btn btn-ghost" onClick={onNo}>Voltar</button>
        <button className={`btn ${perigo ? 'btn-danger' : 'btn-primary'}`} onClick={onYes} disabled={busy}>{busy ? 'Aguarde…' : confirmar}</button>
      </div>
    </Modal>
  )
}

export const StatusBadge = ({ s }: { s: StatusPedido | string }) => <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>
