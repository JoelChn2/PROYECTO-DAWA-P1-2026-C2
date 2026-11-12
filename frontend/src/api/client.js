const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function pedir(ruta, opciones = {}) {
  let respuesta

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    })
  } catch {
    throw new Error('No se pudo conectar con la API. Ejecuta "npm run mock".')
  }

  if (!respuesta.ok) {
    throw new Error(`La API respondió con error ${respuesta.status}`)
  }

  return respuesta
}

export async function getJson(ruta) {
  return (await pedir(ruta)).json()
}

export async function getLista(ruta) {
  const respuesta = await pedir(ruta)
  return {
    datos: await respuesta.json(),
    total: Number(respuesta.headers.get('X-Total-Count') || 0),
  }
}

export async function postJson(ruta, cuerpo) {
  return (await pedir(ruta, { method: 'POST', body: JSON.stringify(cuerpo) })).json()
}

export async function patchJson(ruta, cuerpo) {
  return (await pedir(ruta, { method: 'PATCH', body: JSON.stringify(cuerpo) })).json()
}
