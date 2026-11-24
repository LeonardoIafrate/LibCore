import { http } from './client'
import type {
  Autor, Categoria, Editora, Endereco, EnderecoInput, Estoque, Livro, LivroInput,
  Paged, Pedido, StatusPedido, Token, Usuario,
} from './types'

export const authApi = {
  login: (email: string, senha: string) => http.post<Token>('/api/auth/login', { email, senha }),
  renovar: () => http.post<Token>('/api/auth/renovar'),
}

export interface LivroFiltro {
  nome?: string; editoraId?: number; autorId?: number; categoriaId?: number
  precoMin?: number; precoMax?: number; pagina?: number; tamanhoPagina?: number
}
export const livrosApi = {
  list: (f: LivroFiltro) => http.get<Paged<Livro>>('/api/livros', f as any),
  get: (id: number) => http.get<Livro>(`/api/livros/${id}`),
  create: (d: LivroInput) => http.post<Livro>('/api/livros', d),
  update: (id: number, d: LivroInput) => http.put<Livro>(`/api/livros/${id}`, d),
  remove: (id: number) => http.del<void>(`/api/livros/${id}`),
  setImagem: (id: number, arquivo: File) => {
    const f = new FormData()
    f.append('arquivo', arquivo)
    return http.putForm<Livro>(`/api/livros/${id}/imagem`, f)
  },
  removeImagem: (id: number) => http.del<Livro>(`/api/livros/${id}/imagem`),
  addImagemExtra: (id: number, arquivo: File) => {
    const f = new FormData()
    f.append('arquivo', arquivo)
    return http.postForm<Livro>(`/api/livros/${id}/imagens`, f)
  },
  removeImagemExtra: (id: number, imagemId: number) => http.del<Livro>(`/api/livros/${id}/imagens/${imagemId}`),
}

export const autoresApi = {
  list: (nome?: string) => http.get<Autor[]>('/api/autores', { nome }),
  create: (d: Omit<Autor, 'id'>) => http.post<Autor>('/api/autores', d),
  update: (id: number, d: Omit<Autor, 'id'>) => http.put<Autor>(`/api/autores/${id}`, d),
  remove: (id: number) => http.del<void>(`/api/autores/${id}`),
}
export const categoriasApi = {
  list: (genero?: string) => http.get<Categoria[]>('/api/categorias', { genero }),
  create: (d: Omit<Categoria, 'id'>) => http.post<Categoria>('/api/categorias', d),
  update: (id: number, d: Omit<Categoria, 'id'>) => http.put<Categoria>(`/api/categorias/${id}`, d),
  remove: (id: number) => http.del<void>(`/api/categorias/${id}`),
}
export const editorasApi = {
  list: (nome?: string) => http.get<Editora[]>('/api/editoras', { nome }),
  create: (d: Omit<Editora, 'id'>) => http.post<Editora>('/api/editoras', d),
  update: (id: number, d: Omit<Editora, 'id'>) => http.put<Editora>(`/api/editoras/${id}`, d),
  remove: (id: number) => http.del<void>(`/api/editoras/${id}`),
}

export const estoqueApi = {
  list: (nomeLivro?: string) => http.get<Estoque[]>('/api/estoques', { nomeLivro }),
  update: (id: number, quantidade: number) => http.put<Estoque>(`/api/estoques/${id}`, { quantidade }),
}

export const enderecosApi = {
  list: () => http.get<Endereco[]>('/api/enderecos'),
  create: (d: EnderecoInput & { principal: boolean }) => http.post<Endereco>('/api/enderecos', d),
  update: (id: number, d: EnderecoInput) => http.put<Endereco>(`/api/enderecos/${id}`, d),
  setPrincipal: (id: number) => http.put<Endereco>(`/api/enderecos/${id}/principal`),
  remove: (id: number) => http.del<void>(`/api/enderecos/${id}`),
}

export const usuariosApi = {
  create: (d: { nome: string; email: string; cpf: string; senha: string; dataNascimento: string; endereco: EnderecoInput }) =>
    http.post<Usuario>('/api/usuarios', d),
  createAdmin: (d: { nome: string; email: string; cpf: string; senha: string; dataNascimento: string; endereco: EnderecoInput }) =>
    http.post<Usuario>('/api/usuarios/admin', d),
  me: () => http.get<Usuario>('/api/usuarios/me'),
  updateMe: (d: { nome: string; email: string; dataNascimento: string }) => http.put<Usuario>('/api/usuarios/me', d),
  alterarSenha: (senhaAtual: string, novaSenha: string) => http.put<void>('/api/usuarios/me/senha', { senhaAtual, novaSenha }),
  desativarMe: () => http.patch<void>('/api/usuarios/me/desativar'),
  // admin
  list: (q: { nome?: string; pagina?: number; tamanhoPagina?: number }) => http.get<Paged<Usuario>>('/api/usuarios', q),
  promover: (id: number) => http.patch<Usuario>(`/api/usuarios/${id}`),
  desativar: (id: number) => http.patch<void>(`/api/usuarios/${id}/desativar`),
  remove: (id: number) => http.del<void>(`/api/usuarios/${id}`),
}

export const pedidosApi = {
  meus: () => http.get<Pedido[]>('/api/pedidos/meus-pedidos'),
  get: (id: number) => http.get<Pedido>(`/api/pedidos/${id}`),
  create: (enderecoId: number, itens: { livroId: number; quantidade: number }[]) =>
    http.post<Pedido>('/api/pedidos', { enderecoId, itens }),
  cancelar: (id: number) => http.patch<Pedido>(`/api/pedidos/${id}/cancelar`),
  alterarEndereco: (id: number, enderecoId: number) => http.patch<Pedido>(`/api/pedidos/${id}/endereco`, { enderecoId }),
  // admin
  list: (q: { nome?: string; status?: StatusPedido | ''; pagina?: number; tamanhoPagina?: number }) =>
    http.get<Paged<Pedido>>('/api/pedidos', q),
  // o corpo é o enum serializado como string JSON (ex.: "Pago")
  atualizarStatus: (id: number, status: StatusPedido) => http.patch<Pedido>(`/api/pedidos/${id}/status`, status),
}
