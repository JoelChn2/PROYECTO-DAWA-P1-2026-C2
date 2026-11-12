import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  Col,
  FormGroup,
  Input,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Spinner,
  Table,
} from 'reactstrap'
import { listarSolicitudes } from '../api/solicitudes'
import { useAuth } from '../auth/useAuth'
import {
  ESTADOS,
  PRIORIDADES,
  estaVencida,
  formatearFechaCorta,
} from '../lib/reglas'

const LIMITE = 6

export default function Solicitudes() {
  const { usuario } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [estado, setEstado] = useState('')
  const [prioridad, setPrioridad] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    listarSolicitudes({ pagina, limite: LIMITE, estado, prioridad, usuario })
      .then(({ datos, total }) => {
        if (!activo) return
        setSolicitudes(datos)
        setTotal(total)
        setError('')
      })
      .catch((e) => {
        if (activo) setError(e.message)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [pagina, estado, prioridad, usuario])

  const paginas = Math.max(1, Math.ceil(total / LIMITE))

  function cambiarFiltro(setter) {
    return (evento) => {
      setCargando(true)
      setError('')
      setter(evento.target.value)
      setPagina(1)
    }
  }

  function irAPagina(numero) {
    setCargando(true)
    setPagina(numero)
  }

  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="h4 mb-0">Solicitudes</h1>
          <p className="text-muted small mb-0">
            {total} registro(s) visibles para tu rol
          </p>
        </Col>
        {usuario.rol === 'cliente' && (
          <Col xs="auto">
            <Button color="primary" tag={Link} to="/solicitudes/nueva">
              Nueva solicitud
            </Button>
          </Col>
        )}
      </Row>

      <Row className="mb-3 g-2">
        <Col sm={4}>
          <FormGroup className="mb-0">
            <Label for="filtroEstado" className="small">
              Estado
            </Label>
            <Input
              id="filtroEstado"
              type="select"
              value={estado}
              onChange={cambiarFiltro(setEstado)}
            >
              <option value="">Todos</option>
              {Object.entries(ESTADOS).map(([clave, valor]) => (
                <option key={clave} value={clave}>
                  {valor.texto}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col sm={4}>
          <FormGroup className="mb-0">
            <Label for="filtroPrioridad" className="small">
              Prioridad
            </Label>
            <Input
              id="filtroPrioridad"
              type="select"
              value={prioridad}
              onChange={cambiarFiltro(setPrioridad)}
            >
              <option value="">Todas</option>
              {Object.entries(PRIORIDADES).map(([clave, valor]) => (
                <option key={clave} value={clave}>
                  {valor.texto}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>

      {error && <Alert color="danger">{error}</Alert>}

      {cargando ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="text-muted small mt-2">Cargando solicitudes...</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <Alert color="light" className="text-center py-4">
          No hay solicitudes con los filtros seleccionados.
        </Alert>
      ) : (
        <div className="table-responsive bg-white shadow-sm rounded">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Límite</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td className="small font-monospace">{solicitud.codigo}</td>
                  <td className="small">{solicitud.clienteNombre}</td>
                  <td className="small">{solicitud.categoria}</td>
                  <td>
                    <Badge color={PRIORIDADES[solicitud.prioridad]?.color}>
                      {PRIORIDADES[solicitud.prioridad]?.texto}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={ESTADOS[solicitud.estado]?.color}>
                      {ESTADOS[solicitud.estado]?.texto}
                    </Badge>
                  </td>
                  <td className="small text-nowrap">
                    {formatearFechaCorta(solicitud.fechaLimite)}
                    {estaVencida(solicitud) && (
                      <Badge color="danger" pill className="ms-1">
                        Vencida
                      </Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      color="primary"
                      outline
                      tag={Link}
                      to={`/solicitudes/${solicitud.id}`}
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {paginas > 1 && (
        <Pagination className="mt-3">
          <PaginationItem disabled={pagina === 1}>
            <PaginationLink onClick={() => irAPagina(pagina - 1)}>
              Anterior
            </PaginationLink>
          </PaginationItem>
          {Array.from({ length: paginas }, (_, i) => i + 1).map((numero) => (
            <PaginationItem key={numero} active={numero === pagina}>
              <PaginationLink onClick={() => irAPagina(numero)}>
                {numero}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem disabled={pagina === paginas}>
            <PaginationLink onClick={() => irAPagina(pagina + 1)}>
              Siguiente
            </PaginationLink>
          </PaginationItem>
        </Pagination>
      )}
    </>
  )
}
