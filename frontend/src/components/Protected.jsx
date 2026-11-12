import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function Protected({ roles, children }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/solicitudes" replace />

  return children
}
