import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Protected from './components/Protected'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Nueva from './pages/Nueva'
import Solicitud from './pages/Solicitud'
import Solicitudes from './pages/Solicitudes'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/solicitudes" replace />} />

        <Route path="solicitudes" element={<Solicitudes />} />

        <Route
          path="solicitudes/nueva"
          element={
            <Protected roles={['cliente']}>
              <Nueva />
            </Protected>
          }
        />

        <Route path="solicitudes/:id" element={<Solicitud />} />

        <Route
          path="dashboard"
          element={
            <Protected roles={['administrador', 'coordinador']}>
              <Dashboard />
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/solicitudes" replace />} />
      </Route>
    </Routes>
  )
}
