export type Perfil = 'Cliente' | 'Admin'
export type StatusPedido = 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado'

export interface Paged<T> {
  itens: T[]
  total: number
  pagina: number
  tamanhoPagina: number
  totalPaginas: number
}

export interface Token { token: string; expiraEm: string }

export interface Autor { id: number; nome: string; biografia?: string | null; nacionalidade?: string | null }
export interface Categoria { id: number; genero: string }
export interface Editora { id: number; nome: string }

export interface LivroImagem { id: number; url: string }

export interface Livro {
  id: number
  nome: string
  sinopse?: string | null
  anoLancamento?: number | null
  isbn: string
  preco: number
  numeroPaginas?: number | null
  idioma?: string | null
  imagemUrl?: string | null
  imagens: LivroImagem[]
  dataCadastro: string
  editoraId: number
  editoraNome: string
  generos: string[]
  autores: string[]
  autoresIds: number[]
  categoriaIds: number[]
  quantidadeEstoque: number
}

export interface LivroInput {
  nome: string
  sinopse?: string | null
  anoLancamento?: number | null
  isbn: string
  preco: number
  numeroPaginas?: number | null
  idioma: string
  editoraId: number
  categoriaIds: number[]
  autoresIds: number[]
  quantidadeInicial: number
}

export interface Estoque { id: number; quantidade: number; dataAtualizacao: string; livroId: number; nomeLivro: string }

export interface EnderecoInput {
  cep: string; rua: string; numero: string; complemento?: string | null
  bairro: string; cidade: string; uf: string
}
export interface Endereco extends EnderecoInput { id: number; principal: boolean; ativo: boolean }

export interface Usuario {
  id: number; nome: string; email: string; cpf: string
  dataNascimento: string; perfil: Perfil; dataCadastro: string; ativo: boolean
}

export interface ItemPedido {
  livroId: number; livroNome: string; quantidade: number; precoUnitario: number; subtotal: number
}
export interface Pedido {
  id: number; dataPedido: string; status: StatusPedido; valorTotal: number
  usuarioId: number; usuarioNome: string; endereco: string; itens: ItemPedido[]
}
