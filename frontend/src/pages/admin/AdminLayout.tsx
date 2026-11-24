import { NavLink, Outlet } from 'react-router-dom'

const LINKS = [
  ['/admin', 'Pedidos', true], ['/admin/livros', 'Livros', false], ['/admin/estoque', 'Estoque', false],
  ['/admin/autores', 'Autores', false], ['/admin/categorias', 'Categorias', false],
  ['/admin/editoras', 'Editoras', false], ['/admin/usuarios', 'Usuários', false],
] as const

export default function AdminLayout() {
  return (
    <>
      <h1>Administração</h1>
      <nav className="subnav" aria-label="Administração">
        {LINKS.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
      </nav>
      <Outlet />
    </>
  )
}
