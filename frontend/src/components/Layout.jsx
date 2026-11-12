import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
} from 'reactstrap'
import { useAuth } from '../auth/useAuth'
import { ROLES } from '../lib/reglas'

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navegar = useNavigate()
  const [abierto, setAbierto] = useState(false)

  function salir() {
    logout()
    navegar('/login')
  }

  function cerrarMenu() {
    setAbierto(false)
  }

  return (
    <>
      <Navbar color="dark" dark expand="md" className="px-3">
        <NavbarBrand tag={Link} to="/solicitudes">
          ServiGest
        </NavbarBrand>
        <NavbarToggler onClick={() => setAbierto(!abierto)} />
        <Collapse isOpen={abierto} navbar>
          <Nav className="me-auto" navbar>
            <NavItem>
              <Link className="nav-link" to="/solicitudes" onClick={cerrarMenu}>
                Solicitudes
              </Link>
            </NavItem>
            {usuario.rol === 'cliente' && (
              <NavItem>
                <Link className="nav-link" to="/solicitudes/nueva" onClick={cerrarMenu}>
                  Nueva solicitud
                </Link>
              </NavItem>
            )}
            {(usuario.rol === 'administrador' || usuario.rol === 'coordinador') && (
              <NavItem>
                <Link className="nav-link" to="/dashboard" onClick={cerrarMenu}>
                  Dashboard
                </Link>
              </NavItem>
            )}
          </Nav>
          <div className="d-flex align-items-center flex-wrap gap-2 py-2">
            <span className="text-white small">{usuario.nombre}</span>
            <Badge color="light" className="text-dark">
              {ROLES[usuario.rol]}
            </Badge>
            <Button color="outline-light" size="sm" onClick={salir}>
              Salir
            </Button>
          </div>
        </Collapse>
      </Navbar>

      <main className="container py-4">
        <Outlet />
      </main>
    </>
  )
}
