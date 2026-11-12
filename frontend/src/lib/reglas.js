export const ROLES = {
  administrador: 'Administrador',
  coordinador: 'Coordinador',
  tecnico: 'Técnico',
  cliente: 'Cliente',
}

export const ESTADOS = {
  registrada: { texto: 'Registrada', color: 'secondary' },
  aprobada: { texto: 'Aprobada', color: 'info' },
  asignada: { texto: 'Asignada', color: 'primary' },
  en_proceso: { texto: 'En proceso', color: 'warning' },
  pendiente_info: { texto: 'Pendiente de información', color: 'warning' },
  resuelta: { texto: 'Resuelta', color: 'success' },
  cerrada: { texto: 'Cerrada', color: 'dark' },
  cancelada: { texto: 'Cancelada', color: 'danger' },
}

export const PRIORIDADES = {
  baja: { texto: 'Baja', color: 'secondary' },
  media: { texto: 'Media', color: 'info' },
  alta: { texto: 'Alta', color: 'warning' },
  critica: { texto: 'Crítica', color: 'danger' },
}

export const CATEGORIAS = ['Redes', 'Hardware', 'Software', 'Mantenimiento']

export const PLAZOS_DIAS = { baja: 7, media: 4, alta: 2, critica: 1 }

// Regla 1 y 4 del documento: no se cierra sin resolución y "cerrada" no retrocede.
export const TRANSICIONES = {
  registrada: ['aprobada', 'cancelada'],
  aprobada: ['asignada', 'cancelada'],
  asignada: ['en_proceso', 'pendiente_info'],
  en_proceso: ['resuelta', 'pendiente_info'],
  pendiente_info: ['en_proceso', 'cancelada'],
  resuelta: ['cerrada'],
  cerrada: [],
  cancelada: [],
}

export function transicionesPermitidas(estado) {
  return TRANSICIONES[estado] || []
}

// Regla 2: el técnico solo gestiona las solicitudes asignadas a su cargo.
export function puedeGestionar(usuario, solicitud) {
  if (!usuario || !solicitud) return false
  if (usuario.rol === 'administrador' || usuario.rol === 'coordinador') return true
  return usuario.rol === 'tecnico' && solicitud.tecnicoId === usuario.id
}

export function puedeAsignar(usuario) {
  return usuario && (usuario.rol === 'administrador' || usuario.rol === 'coordinador')
}

export function estaVencida(solicitud) {
  if (!solicitud || ['cerrada', 'cancelada'].includes(solicitud.estado)) return false
  return new Date(solicitud.fechaLimite) < new Date()
}

export function calcularFechaLimite(prioridad, desde = new Date()) {
  const fecha = new Date(desde)
  fecha.setDate(fecha.getDate() + (PLAZOS_DIAS[prioridad] || 1))
  return fecha.toISOString()
}

export function calcularPlazo(prioridad) {
  const dias = PLAZOS_DIAS[prioridad] || 1
  return dias === 1 ? '1 día' : `${dias} días`
}

export function formatearFecha(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatearFechaCorta(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
