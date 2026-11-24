const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

/** Converte o caminho relativo devolvido pela API (ex.: /uploads/livros/x.jpg) em URL absoluta. */
export const assetUrl = (caminho?: string | null) => (caminho ? `${BASE}${caminho}` : null)
const TOKEN_KEY = 'libcore.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

type UnauthorizedListener = () => void
let onUnauthorized: UnauthorizedListener | null = null
export const setUnauthorizedListener = (fn: UnauthorizedListener | null) => { onUnauthorized = fn }

/** Erro padronizado: ProblemDetails (title/detail) ou ValidationProblemDetails (errors). */
export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string[]>
  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type Query = Record<string, string | number | boolean | null | undefined>

function qs(q?: Query) {
  if (!q) return ''
  const p = new URLSearchParams()
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  })
  const s = p.toString()
  return s ? `?${s}` : ''
}

async function request<T>(method: string, path: string, opts: { body?: unknown; query?: Query } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`
  const ehForm = opts.body instanceof FormData
  // com FormData o navegador define o Content-Type (com boundary) sozinho
  if (opts.body !== undefined && !ehForm) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(`${BASE}${path}${qs(opts.query)}`, {
      method,
      headers,
      body: opts.body === undefined ? undefined : ehForm ? (opts.body as FormData) : JSON.stringify(opts.body),
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API. Verifique se ela está em execução.')
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  let data: any = null
  if (text) { try { data = JSON.parse(text) } catch { data = null } }

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.()
    if (res.status === 429) throw new ApiError(429, 'Muitas tentativas. Aguarde um instante e tente novamente.')
    const fieldErrors: Record<string, string[]> = data?.errors ?? {}
    const first = Object.values(fieldErrors)[0]?.[0]
    const msg = data?.detail ?? first ?? data?.title ??
      (res.status === 401 ? 'Credenciais inválidas ou sessão expirada.' :
       res.status === 403 ? 'Você não tem permissão para esta ação.' : `Erro ${res.status}`)
    throw new ApiError(res.status, msg, fieldErrors)
  }
  return data as T
}

export const http = {
  get: <T>(p: string, query?: Query) => request<T>('GET', p, { query }),
  post: <T>(p: string, body?: unknown) => request<T>('POST', p, { body }),
  put: <T>(p: string, body?: unknown) => request<T>('PUT', p, { body }),
  putForm: <T>(p: string, form: FormData) => request<T>('PUT', p, { body: form }),
  postForm: <T>(p: string, form: FormData) => request<T>('POST', p, { body: form }),
  patch: <T>(p: string, body?: unknown) => request<T>('PATCH', p, { body }),
  del: <T>(p: string) => request<T>('DELETE', p),
}
