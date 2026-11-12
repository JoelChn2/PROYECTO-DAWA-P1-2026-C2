# ServiGest — Frontend

Avance del Proyecto Integrador de DAWA (primer parcial). Interfaz React para la
gestión de solicitudes de servicios técnicos: registro, asignación, seguimiento
de estados y dashboard operativo.

Este avance cubre **solo el frontend**. Consume una API temporal con
`json-server` que respeta la forma de los recursos que luego implementará el
backend en Express. Cambiar `VITE_API_URL` es todo lo necesario para apuntar al
backend real.

## Requisitos

- Node.js 20+
- npm

## Ejecución local

```bash
cd frontend
npm install
cp .env.example .env

# terminal 1: API temporal con datos de prueba
npm run mock

# terminal 2: aplicación
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:3001

## Cuentas de prueba

| Rol           | Correo                   | Contraseña |
| ------------- | ------------------------ | ---------- |
| Administrador | admin@servigest.ec       | admin123   |
| Coordinador   | coordinador@servigest.ec | coord123   |
| Técnico       | tecnico@servigest.ec     | tecnico123 |
| Técnico       | ana@servigest.ec         | tecnico123 |
| Cliente       | cliente@servigest.ec     | cliente123 |
| Cliente       | ferreteria@servigest.ec  | cliente123 |

## Alcance implementado

- Login y cierre de sesión con persistencia en `localStorage`.
- Rutas protegidas por rol: cliente, técnico, coordinador y administrador.
- Listado de solicitudes con paginación, filtros por estado y prioridad,
  badges de estado/prioridad y marca de vencimiento.
- Detalle de solicitud con cambio de estado, asignación/reasignación de técnico,
  registro de resolución e historial de movimientos.
- Registro de nuevas solicitudes por parte del cliente, con validación de
  formulario (Bootstrap `is-invalid` / `FormFeedback`).
- Dashboard con indicadores: total, vencidas, en atención, cumplimiento de
  plazos, distribución por estado y carga por técnico.
- Estados de carga, error y lista vacía en todas las consultas.
- Diseño responsivo con Bootstrap 5 (navbar colapsable, tablas con scroll).

## Reglas de negocio demostradas en el frontend

1. No se puede cerrar una solicitud sin resolución documentada.
2. Una solicitud cerrada o cancelada no ofrece transiciones (no retrocede).
3. El técnico solo ve y gestiona las solicitudes asignadas a su cargo.
4. El cliente solo ve y registra sus propias solicitudes.
5. Los plazos se calculan según prioridad y se resaltan al vencer.

La tabla de transiciones vive en `src/lib/reglas.js` y es la misma que deberá
respetar el backend.

## Estructura

```
frontend/
├── db.json                  # datos de prueba para json-server
├── src/
│   ├── api/                 # cliente HTTP y funciones por recurso
│   ├── auth/                # contexto de sesión
│   ├── components/          # Layout y guard de rutas
│   ├── lib/reglas.js        # estados, prioridades, plazos y transiciones
│   └── pages/               # Login, Solicitudes, Solicitud, Nueva, Dashboard
```

## Pendiente para la entrega final

- Backend Express con JWT, bcrypt y autorización real por rol.
- Persistencia en PostgreSQL con migraciones y seed.
- Sustituir `json-server` por la API real (`VITE_API_URL`).
- Notificaciones en tiempo real, adjuntos, catálogos CRUD y pruebas.
- Documentación OpenAPI y despliegue.
