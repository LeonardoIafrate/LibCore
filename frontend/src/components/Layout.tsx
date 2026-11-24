import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

export default function Layout() {
  const { sessao, ehAdmin, logout } = useAuth()
  const { qtd } = useCart()
  const { tema, alternar } = useTheme()
  const nav = useNavigate()
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <Link to="/" className="brand">LibCore</Link>
          <nav className="nav">
            <NavLink to="/" end>Catálogo</NavLink>
            {sessao && <NavLink to="/pedidos">Meus pedidos</NavLink>}
            {ehAdmin && <NavLink to="/admin">Administração</NavLink>}
          </nav>
          <div className="nav-right">
            <button className="icon-btn theme-btn" onClick={alternar} aria-label={tema === 'escuro' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              title={tema === 'escuro' ? 'Tema claro' : 'Tema escuro'}>{tema === 'escuro' ? '☀' : '☾'}</button>
            <Link to="/carrinho" className="cart-link">Carrinho{qtd > 0 && <b className="cart-count">{qtd}</b>}</Link>
            {sessao ? (
              <>
                <NavLink to="/conta">Minha conta</NavLink>
                <button className="btn btn-ghost" onClick={() => { logout(); nav('/') }}>Sair</button>
              </>
            ) : (
              <>
                <NavLink to="/entrar">Entrar</NavLink>
                <Link to="/cadastro" className="btn btn-primary">Criar conta</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="wrap page"><Outlet /></main>
      <footer className="footer"><div className="wrap muted">LibCore — projeto de estudo · front-end React consumindo a API ASP.NET Core</div></footer>
    </>
  )
}
