import { useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Card,
  CardBody,
  Col,
  Row,
  Spinner,
  Table,
} from 'reactstrap'
import { listarTodas } from '../api/solicitudes'
import { ESTADOS, estaVencida, formatearFechaCorta } from '../lib/reglas'

export default function Dashboard() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarTodas()
      .then(setSolicitudes)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
      </div>
    )
  }

  if (error) return <Alert color="danger">{error}</Alert>

  const total = solicitudes.length
  const vencidas = solicitudes.filter(estaVencida)
  const cerradas = solicitudes.filter((s) => s.estado === 'cerrada' && s.fechaCierre)
  const enAtencion = solicitudes.filter((s) =>
    ['asignada', 'en_proceso', 'pendiente_info'].includes(s.estado),
  )
  const aTiempo = cerradas.filter(
    (s) => new Date(s.fechaCierre) <= new Date(s.fechaLimite),
  ).length
  const cumplimiento = cerradas.length
    ? Math.round((aTiempo / cerradas.length) * 100)
    : 0

  const porEstado = Object.entries(ESTADOS)
    .map(([clave, valor]) => ({
      texto: valor.texto,
      color: valor.color,
      cantidad: solicitudes.filter((s) => s.estado === clave).length,
    }))
    .filter((fila) => fila.cantidad > 0)

  const carga = enAtencion.reduce((acumulado, solicitud) => {
    const nombre = solicitud.tecnicoNombre || 'Sin asignar'
    acumulado[nombre] = (acumulado[nombre] || 0) + 1
    return acumulado
  }, {})

  const indicadores = [
    { titulo: 'Solicitudes', valor: total, color: 'primary' },
    { titulo: 'Vencidas', valor: vencidas.length, color: 'danger' },
    { titulo: 'En atención', valor: enAtencion.length, color: 'warning' },
    { titulo: 'Cumplimiento (cerradas)', valor: `${cumplimiento}%`, color: 'success' },
  ]

  return (
    <>
      <h1 className="h4 mb-3">Dashboard operativo</h1>

      <Row className="g-3 mb-3">
        {indicadores.map((indicador) => (
          <Col key={indicador.titulo} sm={6} lg={3}>
            <Card className={`border-start border-4 border-${indicador.color} shadow-sm`}>
              <CardBody>
                <p className="text-muted small text-uppercase mb-1">
                  {indicador.titulo}
                </p>
                <p className={`h3 mb-0 text-${indicador.color}`}>
                  {indicador.valor}
                </p>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <CardBody>
              <h2 className="h6 text-uppercase text-muted">Por estado</h2>
              <Table size="sm" className="mb-0">
                <tbody>
                  {porEstado.map((fila) => (
                    <tr key={fila.texto}>
                      <td>
                        <Badge color={fila.color}>{fila.texto}</Badge>
                      </td>
                      <td className="text-end">{fila.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <CardBody>
              <h2 className="h6 text-uppercase text-muted">Carga por técnico</h2>
              <Table size="sm" className="mb-0">
                <tbody>
                  {Object.entries(carga).map(([nombre, cantidad]) => (
                    <tr key={nombre}>
                      <td>{nombre}</td>
                      <td className="text-end">{cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mt-3">
        <CardBody>
          <h2 className="h6 text-uppercase text-muted">Próximos vencimientos</h2>
          <div className="table-responsive">
            <Table size="sm" className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Límite</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes
                  .filter((s) => !['cerrada', 'cancelada'].includes(s.estado))
                  .slice(0, 5)
                  .map((solicitud) => (
                    <tr key={solicitud.id}>
                      <td className="small font-monospace">{solicitud.codigo}</td>
                      <td className="small">{solicitud.clienteNombre}</td>
                      <td>
                        <Badge color={ESTADOS[solicitud.estado]?.color}>
                          {ESTADOS[solicitud.estado]?.texto}
                        </Badge>
                      </td>
                      <td className="small">
                        {formatearFechaCorta(solicitud.fechaLimite)}
                        {estaVencida(solicitud) && (
                          <Badge color="danger" pill className="ms-1">
                            Vencida
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </>
  )
}
