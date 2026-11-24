import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { RequireAdmin, RequireAuth } from './components/Guards'
import Catalogo from './pages/Catalogo'
import LivroDetalhe from './pages/LivroDetalhe'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Carrinho from './pages/Carrinho'
import Checkout from './pages/Checkout'
import MeusPedidos from './pages/MeusPedidos'
import PedidoDetalhe from './pages/PedidoDetalhe'
import Conta from './pages/Conta'
import Enderecos from './pages/Enderecos'
import AdminLayout from './pages/admin/AdminLayout'
import PedidosAdmin from './pages/admin/PedidosAdmin'
import LivrosAdmin from './pages/admin/LivrosAdmin'
import EstoqueAdmin from './pages/admin/EstoqueAdmin'
import UsuariosAdmin from './pages/admin/UsuariosAdmin'
import { AutoresAdmin, CategoriasAdmin, EditorasAdmin } from './pages/admin/Lookups'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Catalogo />} />
        <Route path="livros/:id" element={<LivroDetalhe />} />
        <Route path="entrar" element={<Login />} />
        <Route path="cadastro" element={<Cadastro />} />
        <Route path="carrinho" element={<Carrinho />} />
        <Route element={<RequireAuth />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="pedidos" element={<MeusPedidos />} />
          <Route path="pedidos/:id" element={<PedidoDetalhe />} />
          <Route path="conta" element={<Conta />} />
          <Route path="conta/enderecos" element={<Enderecos />} />
        </Route>
        <Route path="admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<PedidosAdmin />} />
            <Route path="pedidos" element={<PedidosAdmin />} />
            <Route path="livros" element={<LivrosAdmin />} />
            <Route path="estoque" element={<EstoqueAdmin />} />
            <Route path="autores" element={<AutoresAdmin />} />
            <Route path="categorias" element={<CategoriasAdmin />} />
            <Route path="editoras" element={<EditorasAdmin />} />
            <Route path="usuarios" element={<UsuariosAdmin />} />
          </Route>
        </Route>
        <Route path="*" element={<div className="empty">Página não encontrada.</div>} />
      </Route>
    </Routes>
  )
}
