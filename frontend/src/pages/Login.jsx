import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
} from 'reactstrap'
import { useAuth } from '../auth/useAuth'

const CUENTAS_DEMO = [
  { rol: 'Cliente', email: 'cliente@servigest.ec', password: 'cliente123' },
  { rol: 'Coordinador', email: 'coordinador@servigest.ec', password: 'coord123' },
  { rol: 'Técnico', email: 'tecnico@servigest.ec', password: 'tecnico123' },
  { rol: 'Administrador', email: 'admin@servigest.ec', password: 'admin123' },
]

export default function Login() {
  const { usuario, login } = useAuth()
  const navegar = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (usuario) return <Navigate to="/solicitudes" replace />

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setCargando(true)

    try {
      await login(email, password)
      navegar('/solicitudes')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  function usarCuenta(cuenta) {
    setEmail(cuenta.email)
    setPassword(cuenta.password)
    setError('')
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center g-4">
        <Col md={5}>
          <Card className="shadow-sm">
            <CardBody>
              <h1 className="h4 mb-1">ServiGest</h1>
              <p className="text-muted small mb-4">
                Gestión de solicitudes de servicios técnicos
              </p>

              {error && <Alert color="danger">{error}</Alert>}

              <Form onSubmit={enviar}>
                <FormGroup>
                  <Label for="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormGroup>
                <Button color="primary" className="w-100" disabled={cargando}>
                  {cargando ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <CardBody>
              <h2 className="h6 text-uppercase text-muted">Cuentas de prueba</h2>
              <div className="table-responsive">
                <Table size="sm" className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Rol</th>
                      <th>Correo</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {CUENTAS_DEMO.map((cuenta) => (
                      <tr key={cuenta.email}>
                        <td>{cuenta.rol}</td>
                        <td className="small">{cuenta.email}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            color="link"
                            onClick={() => usarCuenta(cuenta)}
                          >
                            Usar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <p className="text-muted small mt-3 mb-0">
                Contraseña de todas las cuentas: <code>cliente123</code> /
                <code> coord123</code> / <code>tecnico123</code> /{' '}
                <code>admin123</code> según el rol.
              </p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
