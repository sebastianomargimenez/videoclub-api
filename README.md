# Videoclub API

API REST profesional para sistema de gestión de videoclub, construida con Node.js, Express y Supabase.

## Características

- **Autenticación JWT** con Supabase Auth
- **Sistema de roles** (admin/user) con control de acceso
- **CRUD completo de películas** con validaciones
- **Sistema de alquileres** con control automático de stock
- **Validaciones de negocio**: Límite de 3 películas activas por usuario
- **Transacciones atómicas** con PostgreSQL functions
- **Manejo robusto de errores** con handlers centralizados
- **Seguridad** con Helmet, validación de inputs y sanitización
- **Arquitectura escalable** con separación de capas (routes, controllers, services)

## Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express 5
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth (JWT)
- **Validación**: Joi
- **Seguridad**: Helmet, CORS
- **Logging**: Morgan

## Instalación

### Prerrequisitos

- Node.js >= 18.x
- npm >= 9.x
- Cuenta de Supabase (o PostgreSQL local)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/videoclub-api.git
cd videoclub-api
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` basado en `.env.example`:

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
FRONTEND_URL=http://localhost:3000
```

4. **Ejecutar funciones SQL en Supabase**

Ejecutar el script `supabase-functions.sql` en el SQL Editor de Supabase para crear las funciones `crear_alquiler` y `devolver_alquiler`.

5. **Iniciar servidor**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## Estructura del Proyecto

```
videoclub-api/
├── src/
│   ├── config/              # Configuración (Supabase, constantes)
│   │   ├── supabase.js
│   │   └── constants.js
│   ├── middlewares/         # Middlewares (auth, validación, errores)
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validation.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── controllers/         # Lógica de controladores
│   │   ├── auth.controller.js
│   │   ├── movies.controller.js
│   │   └── rentals.controller.js
│   ├── services/            # Lógica de negocio
│   │   ├── auth.service.js
│   │   ├── movies.service.js
│   │   └── rentals.service.js
│   ├── routes/              # Definición de rutas
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── movies.routes.js
│   │   └── rentals.routes.js
│   ├── utils/               # Utilidades
│   │   ├── AppError.js
│   │   └── validators.js
│   ├── app.js               # Configuración de Express
│   └── server.js            # Punto de entrada
├── supabase-functions.sql   # Funciones PostgreSQL
├── .env                     # Variables de entorno (no commitear)
├── .env.example             # Template de variables
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Autenticación

#### Registrar usuario
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123",
  "nombre": "Juan Pérez"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

### Películas

#### Listar todas las películas (Público)
```http
GET /api/v1/movies
```

#### Obtener película por ID (Público)
```http
GET /api/v1/movies/:id
```

#### Crear película (Admin)
```http
POST /api/v1/movies
Authorization: Bearer {token}
Content-Type: application/json

{
  "titulo": "Matrix",
  "genero": "Ciencia Ficción",
  "stock_total": 5,
  "stock_disponible": 5,
  "precio_alquiler": 3.99
}
```

#### Actualizar película (Admin)
```http
PUT /api/v1/movies/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "titulo": "The Matrix",
  "precio_alquiler": 4.99
}
```

#### Eliminar película (Admin)
```http
DELETE /api/v1/movies/:id
Authorization: Bearer {token}
```

### Alquileres

#### Crear alquiler (Usuario autenticado)
```http
POST /api/v1/rentals
Authorization: Bearer {token}
Content-Type: application/json

{
  "pelicula_id": "uuid-de-la-pelicula"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Película alquilada exitosamente",
  "data": {
    "alquiler": {
      "id": "uuid",
      "perfil_id": "uuid",
      "pelicula_id": "uuid",
      "devuelto": false,
      "fecha_alquiler": "2025-01-07T12:00:00Z"
    },
    "pelicula": {
      "id": "uuid",
      "titulo": "Matrix",
      "genero": "Ciencia Ficción",
      "precio_alquiler": 3.99
    }
  }
}
```

#### Devolver película (Usuario autenticado)
```http
POST /api/v1/rentals/:id/return
Authorization: Bearer {token}
```

#### Ver todos los alquileres (Admin)
```http
GET /api/v1/rentals
Authorization: Bearer {token}
```

#### Ver alquileres activos del usuario
```http
GET /api/v1/rentals/active
Authorization: Bearer {token}
```

## Reglas de Negocio

1. **Límite de alquileres**: Cada usuario puede tener máximo 3 películas activas simultáneamente
2. **Control de stock**: El stock se reduce automáticamente al alquilar y se restaura al devolver
3. **Prevención de duplicados**: No se puede alquilar la misma película si ya está activa
4. **Transacciones atómicas**: Las operaciones de alquiler usan locks de PostgreSQL para prevenir race conditions
5. **Roles**:
   - `admin`: CRUD completo de películas, ver todos los alquileres
   - `user`: Alquilar, devolver, ver sus propios alquileres

## Seguridad

- Headers de seguridad con Helmet
- CORS configurado
- Validación de inputs con Joi
- Autenticación JWT en todas las rutas protegidas
- Service Role Key solo en backend (nunca expuesto)
- Manejo seguro de errores (sin stack traces en producción)
- Rate limiting recomendado para producción

## Scripts Disponibles

```bash
npm start       # Iniciar servidor en producción
npm run dev     # Iniciar con nodemon (desarrollo)
```

## Manejo de Errores

La API utiliza un sistema centralizado de manejo de errores con códigos HTTP estándar:

- `200`: Éxito
- `201`: Recurso creado
- `400`: Error de validación o regla de negocio
- `401`: No autenticado
- `403`: No autorizado (sin permisos)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

**Formato de error:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "stack": "..." // Solo en desarrollo
}
```

## Deployment en Render

### Pasos para Desplegar

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com) y crea una cuenta (puedes usar GitHub)

2. **Conectar repositorio**
   - En el dashboard, haz click en "New +" → "Web Service"
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `videoclub-api`

3. **Configurar servicio**
   - Render detectará automáticamente el `render.yaml`
   - Verifica la configuración:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: `node`

4. **Configurar variables de entorno**
   - En la sección "Environment", agrega:
     ```
     NODE_ENV=production
     PORT=3001
     SUPABASE_URL=tu-url-de-supabase
     SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
     FRONTEND_URL=*
     ```

5. **Deploy**
   - Click en "Create Web Service"
   - Render comenzará el build automáticamente
   - Espera 2-3 minutos

6. **Verificar deployment**
   - Una vez completado, obtendrás una URL como: `https://videoclub-api.onrender.com`
   - Prueba: `https://tu-app.onrender.com/health`

### Notas importantes

- **Plan gratuito**: El servicio se duerme después de 15 minutos de inactividad
- **Primera request**: Puede tardar 30-60 segundos en despertar
- **Auto-deploy**: Cada push a `main` desplegará automáticamente
- **Logs**: Disponibles en tiempo real en el dashboard de Render

### Actualizar Supabase

Agrega la URL de Render a los "Allowed URLs" en Supabase:
1. Ve a Authentication → URL Configuration
2. Agrega: `https://tu-app.onrender.com`

## Testing

### Test Manual

Puedes usar herramientas como Postman, Thunder Client o cURL para probar la API.

**Ejemplo de flujo completo:**

1. Registrar usuario
2. Hacer login y obtener token
3. Crear película (como admin)
4. Alquilar película
5. Ver alquileres activos
6. Devolver película

## Próximas Mejoras

- [ ] Tests automatizados (Jest + Supertest)
- [ ] Rate limiting con express-rate-limit
- [ ] Logging avanzado con Winston
- [ ] Paginación en listados
- [ ] Filtros y búsqueda avanzada
- [ ] Sistema de notificaciones
- [ ] Deploy en Railway/Render
- [ ] Documentación con Swagger/OpenAPI

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto bajo la licencia MIT.

## Autor

**Sebastian** - [Tu GitHub](https://github.com/tu-usuario)

---

**Desarrollado con Node.js + Express + Supabase** 🎬🍿
