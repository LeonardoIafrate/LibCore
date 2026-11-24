# LibCore Web

Front-end em React (Vite + TypeScript) para a API LibCore.

## Executar

```bash
cd frontend
cp .env.example .env     # ajuste VITE_API_URL se necessário
npm install
npm run dev              # http://localhost:5173
```

- Com Docker Compose a API fica em `http://localhost:8080` (padrão do `.env.example`); com `dotnet run`, use `http://localhost:5279`.
- A API só libera CORS para `http://localhost:5173` e `http://localhost:3000` em Development (`Cors:Origens`). Mantenha a porta 5173.
- Login de admin: o definido em `BOOTSTRAP_ADMIN_*` no `.env` da API.

## Telas

| Área | Rotas |
|---|---|
| Público | `/` catálogo com filtros e paginação, `/livros/:id`, `/entrar`, `/cadastro` |
| Cliente | `/carrinho`, `/checkout`, `/pedidos`, `/pedidos/:id` (cancelar, trocar endereço), `/conta`, `/conta/enderecos` |
| Admin | `/admin` (pedidos e avanço de status), `/admin/livros`, `/estoque`, `/autores`, `/categorias`, `/editoras`, `/usuarios` |

## Notas

- **Tema claro/escuro:** botão ☾/☀ no topo; a escolha fica em `localStorage` e, na primeira visita, segue o tema do sistema.
- **Capas:** no admin (Livros → Novo/Editar) é possível enviar JPEG, PNG ou WebP de até 2 MB. O arquivo vai para `PUT /api/livros/{id}/imagem` e é servido pela API em `/uploads/livros/...`. Exige a migration `AdicionarImagemLivro` aplicada (a API aplica sozinha ao iniciar).

- O JWT é guardado em `localStorage`; o perfil (Admin/Cliente) é lido do próprio token. Respostas 401 encerram a sessão.
- O carrinho fica no `localStorage`; o total real é calculado pela API no pedido.
- Erros `ProblemDetails` e de validação (`errors`) são exibidos por campo nos formulários.
- Estrutura: `src/api` (cliente HTTP e tipos), `src/context` (auth, carrinho, avisos), `src/components`, `src/pages` e `src/pages/admin`.
