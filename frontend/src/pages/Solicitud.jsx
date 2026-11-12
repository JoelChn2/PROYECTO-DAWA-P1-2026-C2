import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from 'reactstrap'
import {
  actualizarSolicitud,
  agregarHistorial,
  listarHistorial,
  listarTecnicos,
  obtenerSolicitud,
} from '../api/solicitudes'
import { useAuth } from '../auth/useAuth'
import {
  ESTADOS,
  PRIORIDADES,
  estaVencida,
  formatearFecha,
  puedeAsignar,
  puedeGestionar,
  transicionesPermitidas,
} from '../lib/reglas'

export default function Solicitud() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const [solicitud, setSolicitud] = useState(null)
  const [historial, setHistorial] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState(null)
  const [modalAsignar, setModalAsignar] = useState(false)
  const [tecnicoId, setTecnicoId] = useState('')
  const [resolucion, setResolucion] = useState('')

  async function cargar() {
    try {
      const [datosSolicitud, datosHistorial] = await Promise.all([
        obtenerSolicitud(id),
        listarHistorial(id),
      ])
      setSolicitud(datosSolicitud)
      setHistorial(datosHistorial)
      setResolucion(datosSolicitud.resolucion || '')
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true

    Promise.all([obtenerSolicitud(id), listarHistorial(id)])
      .then(([datosSolicitud, datosHistorial]) => {
        if (!activo) return
        setSolicitud(datosSolicitud)
        setHistorial(datosHistorial)
        setResolucion(datosSolicitud.resolucion || '')
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
  }, [id])

  useEffect(() => {
    if (puedeAsignar(usuario)) {
      listarTecnicos().then(setTecnicos).catch(() => setTecnicos([]))
    }
  }, [usuario])

  async function registrar(accion, detalle = '') {
    await agregarHistorial({
      solicitudId: Number(id),
      usuario: usuario.nombre,
      accion,
      detalle,
      fecha: new Date().toISOString(),
    })
  }

  async function cambiarEstado(nuevo) {
    if (nuevo === 'cerrada' && !resolucion.trim()) {
      setAviso({
        texto: 'Debe documentar la resolución antes de cerrar la solicitud.',
        color: 'danger',
      })
      return
    }

    if (nuevo === 'asignada' && !solicitud.tecnicoId) {
      setAviso({
        texto: 'Debe asignar un técnico antes de pasar la solicitud a Asignada.',
        color: 'danger',
      })
      return
    }

    try {
      await actualizarSolicitud(id, {
        estado: nuevo,
        resolucion: resolucion.trim() || null,
        fechaActualizacion: new Date().toISOString(),
      })
      await registrar(
        `Estado: ${solicitud.estado} → ${nuevo}`,
        nuevo === 'cerrada' ? 'Cierre con resolución documentada.' : '',
      )
      setAviso({
        texto: `Estado actualizado a ${ESTADOS[nuevo].texto}.`,
        color: 'success',
      })
      cargar()
    } catch (e) {
      setAviso({ texto: e.message, color: 'danger' })
    }
  }

  async function guardarResolucion() {
    if (!resolucion.trim()) {
      setAviso({ texto: 'La resolución no puede estar vacía.', color: 'danger' })
      return
    }

    try {
      await actualizarSolicitud(id, { resolucion: resolucion.trim() })
      await registrar('Resolución documentada', resolucion.trim())
      setAviso({ texto: 'Resolución guardada.', color: 'success' })
      cargar()
    } catch (e) {
      setAviso({ texto: e.message, color: 'danger' })
    }
  }

  async function asignar() {
    const tecnico = tecnicos.find((t) => t.id === Number(tecnicoId))

    if (!tecnico) {
      setAviso({ texto: 'Seleccione un técnico.', color: 'danger' })
      return
    }

    const nuevoEstado = ['registrada', 'aprobada'].includes(solicitud.estado)
      ? 'asignada'
      : solicitud.estado

    try {
      await actualizarSolicitud(id, {
        tecnicoId: tecnico.id,
        tecnicoNombre: tecnico.nombre,
        estado: nuevoEstado,
        fechaActualizacion: new Date().toISOString(),
      })
      await registrar(
        'Técnico asignado',
        `${tecnico.nombre} (${tecnico.especialidad}).`,
      )
      setModalAsignar(false)
      setTecnicoId('')
      setAviso({ texto: 'Técnico asignado correctamente.', color: 'success' })
      cargar()
    } catch (e) {
      setAviso({ texto: e.message, color: 'danger' })
    }
  }

  if (cargando && !solicitud) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
      </div>
    )
  }

  if (error) return <Alert color="danger">{error}</Alert>
  if (!solicitud) return null

  const gestiona = puedeGestionar(usuario, solicitud)
  const vencida = estaVencida(solicitud)
  const estadoFinal = ['cerrada', 'cancelada'].includes(solicitud.estado)

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <Button size="sm" color="link" tag={Link} to="/solicitudes" className="px-0">
          ← Volver
        </Button>
        <h1 className="h4 mb-0 font-monospace">{solicitud.codigo}</h1>
        <Badge color={ESTADOS[solicitud.estado]?.color}>
          {ESTADOS[solicitud.estado]?.texto}
        </Badge>
        <Badge color={PRIORIDADES[solicitud.prioridad]?.color}>
          {PRIORIDADES[solicitud.prioridad]?.texto}
        </Badge>
        {vencida && <Badge color="danger">Vencida</Badge>}
      </div>

      {aviso && (
        <Alert color={aviso.color} toggle={() => setAviso(null)}>
          {aviso.texto}
        </Alert>
      )}

      <Row className="g-3">
        <Col lg={7}>
          <Card className="shadow-sm mb-3">
            <CardBody>
              <h2 className="h6 text-uppercase text-muted">Detalle</h2>
              <p className="mb-2">{solicitud.descripcion}</p>
              <Row className="small">
                <Col sm={6}>
                  <p className="mb-1">
                    <strong>Cliente:</strong> {solicitud.clienteNombre}
                  </p>
                  <p className="mb-1">
                    <strong>Categoría:</strong> {solicitud.categoria}
                  </p>
                  <p className="mb-1">
                    <strong>Sede:</strong> {solicitud.sede}
                  </p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1">
                    <strong>Equipo:</strong> {solicitud.equipo || '—'}
                  </p>
                  <p className="mb-1">
                    <strong>Técnico:</strong> {solicitud.tecnicoNombre || 'Sin asignar'}
                  </p>
                  <p className="mb-1">
                    <strong>Límite:</strong> {formatearFecha(solicitud.fechaLimite)}
                  </p>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card className="shadow-sm mb-3">
            <CardBody>
              <h2 className="h6 text-uppercase text-muted">Resolución</h2>
              {gestiona && !estadoFinal ? (
                <>
                  <FormGroup>
                    <Input
                      type="textarea"
                      rows="3"
                      value={resolucion}
                      onChange={(e) => setResolucion(e.target.value)}
                      placeholder="Describa el trabajo realizado..."
                    />
                  </FormGroup>
                  <Button size="sm" color="success" outline onClick={guardarResolucion}>
                    Guardar resolución
                  </Button>
                </>
              ) : (
                <p className="mb-0 small">
                  {solicitud.resolucion || 'Aún no documentada.'}
                </p>
              )}
            </CardBody>
          </Card>

          {gestiona && (
            <Card className="shadow-sm">
              <CardBody>
                <h2 className="h6 text-uppercase text-muted">Acciones</h2>
                <div className="d-flex flex-wrap gap-2">
                  {puedeAsignar(usuario) && !estadoFinal && (
                    <Button color="primary" outline onClick={() => setModalAsignar(true)}>
                      {solicitud.tecnicoNombre ? 'Reasignar técnico' : 'Asignar técnico'}
                    </Button>
                  )}
                  {transicionesPermitidas(solicitud.estado).map((nuevo) => (
                    <Button
                      key={nuevo}
                      color={nuevo === 'cancelada' ? 'danger' : 'primary'}
                      outline={nuevo === 'cancelada'}
                      onClick={() => cambiarEstado(nuevo)}
                    >
                      Cambiar a {ESTADOS[nuevo].texto}
                    </Button>
                  ))}
                </div>
                {transicionesPermitidas(solicitud.estado).length === 0 &&
                  (estadoFinal || !puedeAsignar(usuario)) && (
                    <p className="text-muted small mb-0 mt-2">
                      Esta solicitud no tiene acciones disponibles.
                    </p>
                  )}
              </CardBody>
            </Card>
          )}
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm">
            <CardBody>
              <h2 className="h6 text-uppercase text-muted">Historial</h2>
              {historial.length === 0 ? (
                <p className="text-muted small mb-0">Sin movimientos registrados.</p>
              ) : (
                <ListGroup flush>
                  {historial.map((registro) => (
                    <ListGroupItem key={registro.id} className="px-0">
                      <div className="d-flex justify-content-between gap-2">
                        <strong className="small">{registro.accion}</strong>
                        <span className="text-muted small text-nowrap">
                          {formatearFecha(registro.fecha)}
                        </span>
                      </div>
                      {registro.detalle && (
                        <p className="small text-muted mb-0">{registro.detalle}</p>
                      )}
                      <p className="small text-muted mb-0">por {registro.usuario}</p>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={modalAsignar} toggle={() => setModalAsignar(false)}>
        <ModalHeader toggle={() => setModalAsignar(false)}>
          Asignar técnico
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="tecnico">Técnico</Label>
            <Input
              id="tecnico"
              type="select"
              value={tecnicoId}
              onChange={(e) => setTecnicoId(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {tecnicos.map((tecnico) => (
                <option key={tecnico.id} value={tecnico.id}>
                  {tecnico.nombre} — {tecnico.especialidad}
                </option>
              ))}
            </Input>
          </FormGroup>
          <p className="text-muted small mb-0">
            La asignación valida especialidad y disponibilidad en el backend.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setModalAsignar(false)}>
            Cancelar
          </Button>
          <Button color="primary" onClick={asignar}>
            Asignar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
