import { getJson, getLista, patchJson, postJson } from './client'

export function listarSolicitudes({ pagina, limite, estado, prioridad, usuario }) {
  const params = new URLSearchParams({
    _page: pagina,
    _limit: limite,
    _sort: 'fechaCreacion',
    _order: 'desc',
  })

  if (estado) params.set('estado', estado)
  if (prioridad) params.set('prioridad', prioridad)
  if (usuario.rol === 'cliente') params.set('clienteId', usuario.id)
  if (usuario.rol === 'tecnico') params.set('tecnicoId', usuario.id)

  return getLista(`/solicitudes?${params.toString()}`)
}

export function listarTodas() {
  return getJson('/solicitudes?_sort=fechaLimite&_order=asc')
}

export function obtenerSolicitud(id) {
  return getJson(`/solicitudes/${id}`)
}

export function crearSolicitud(datos) {
  return postJson('/solicitudes', datos)
}

export function actualizarSolicitud(id, cambios) {
  return patchJson(`/solicitudes/${id}`, cambios)
}

export function listarHistorial(solicitudId) {
  return getJson(`/historial?solicitudId=${solicitudId}&_sort=fecha&_order=desc`)
}

export function agregarHistorial(registro) {
  return postJson('/historial', registro)
}

export function listarTecnicos() {
  return getJson('/usuarios?rol=tecnico')
}
