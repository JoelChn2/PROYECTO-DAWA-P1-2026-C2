import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap'
import { agregarHistorial, crearSolicitud } from '../api/solicitudes'
import { useAuth } from '../auth/useAuth'
import {
  CATEGORIAS,
  PRIORIDADES,
  calcularFechaLimite,
  calcularPlazo,
} from '../lib/reglas'

export default function Nueva() {
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const [formulario, setFormulario] = useState({
    categoria: '',
    prioridad: 'media',
    sede: '',
    equipo: '',
    descripcion: '',
  })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  function cambiar(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  function validar() {
    const encontrados = {}

    if (!formulario.categoria) encontrados.categoria = 'Seleccione una categoría.'
    if (!formulario.sede.trim()) encontrados.sede = 'Indique la sede.'
    if (formulario.descripcion.trim().length < 15) {
      encontrados.descripcion = 'Describa el problema (mínimo 15 caracteres).'
    }

    return encontrados
  }

  async function enviar(evento) {
    evento.preventDefault()
    const encontrados = validar()
    setErrores(encontrados)

    if (Object.keys(encontrados).length > 0) return

    setEnviando(true)
    setError('')
    const ahora = new Date()

    try {
      const solicitud = await crearSolicitud({
        codigo: `SOL-${String(Date.now()).slice(-6)}`,
        clienteId: usuario.id,
        clienteNombre: usuario.empresa || usuario.nombre,
        categoria: formulario.categoria,
        prioridad: formulario.prioridad,
        estado: 'registrada',
        sede: formulario.sede.trim(),
        equipo: formulario.equipo.trim(),
        descripcion: formulario.descripcion.trim(),
        tecnicoId: null,
        tecnicoNombre: null,
        resolucion: null,
        fechaCreacion: ahora.toISOString(),
        fechaLimite: calcularFechaLimite(formulario.prioridad, ahora),
      })

      await agregarHistorial({
        solicitudId: solicitud.id,
        usuario: usuario.nombre,
        accion: 'Solicitud registrada',
        detalle: `${formulario.categoria}. Prioridad ${
          PRIORIDADES[formulario.prioridad].texto
        }. Plazo: ${calcularPlazo(formulario.prioridad)}.`,
        fecha: ahora.toISOString(),
      })

      navegar(`/solicitudes/${solicitud.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Row className="justify-content-center">
      <Col lg={8}>
        <h1 className="h4 mb-3">Nueva solicitud</h1>

        {error && <Alert color="danger">{error}</Alert>}

        <Card className="shadow-sm">
          <CardBody>
            <Form onSubmit={enviar} noValidate>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="categoria">Categoría</Label>
                    <Input
                      id="categoria"
                      name="categoria"
                      type="select"
                      value={formulario.categoria}
                      onChange={cambiar}
                      invalid={!!errores.categoria}
                    >
                      <option value="">Seleccione...</option>
                      {CATEGORIAS.map((categoria) => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </Input>
                    <FormFeedback>{errores.categoria}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="prioridad">Prioridad</Label>
                    <Input
                      id="prioridad"
                      name="prioridad"
                      type="select"
                      value={formulario.prioridad}
                      onChange={cambiar}
                    >
                      {Object.entries(PRIORIDADES).map(([clave, valor]) => (
                        <option key={clave} value={clave}>
                          {valor.texto} ({calcularPlazo(clave)})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="sede">Sede</Label>
                    <Input
                      id="sede"
                      name="sede"
                      value={formulario.sede}
                      onChange={cambiar}
                      placeholder="Ej. Matriz Guayaquil"
                      invalid={!!errores.sede}
                    />
                    <FormFeedback>{errores.sede}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="equipo">Equipo o recurso afectado</Label>
                    <Input
                      id="equipo"
                      name="equipo"
                      value={formulario.equipo}
                      onChange={cambiar}
                      placeholder="Opcional"
                    />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label for="descripcion">Descripción del problema</Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  type="textarea"
                  rows="4"
                  value={formulario.descripcion}
                  onChange={cambiar}
                  invalid={!!errores.descripcion}
                />
                <FormFeedback>{errores.descripcion}</FormFeedback>
              </FormGroup>

              <Button color="primary" disabled={enviando}>
                {enviando ? 'Registrando...' : 'Registrar solicitud'}
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}
