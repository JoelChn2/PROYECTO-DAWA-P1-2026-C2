import { useState } from 'react'
import { getJson } from '../api/client'
import { AuthContext } from './contexto'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() =>
    JSON.parse(localStorage.getItem('sesion') || 'null'),
  )

  async function login(email, password) {
    const encontrados = await getJson(
      `/usuarios?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    )

    if (encontrados.length === 0) {
      throw new Error('Credenciales incorrectas.')
    }

    const { id, nombre, rol, empresa } = encontrados[0]
    const sesion = { id, nombre, rol, empresa }
    localStorage.setItem('sesion', JSON.stringify(sesion))
    setUsuario(sesion)
  }

  function logout() {
    localStorage.removeItem('sesion')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
