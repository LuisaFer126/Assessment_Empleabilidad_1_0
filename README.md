# Course Platform Assessment

Solución completa para el assessment técnico, implementando una API REST en .NET 9 con Clean Architecture y un frontend en React con diseño moderno.

## Estructura del Proyecto

```
CoursePlatform/
├── Backend/                 # Solución .NET
│   ├── src/
│   │   ├── CoursePlatform.API           # API REST (Controladores)
│   │   ├── CoursePlatform.Application   # Casos de uso, DTOs, Servicios
│   │   ├── CoursePlatform.Domain        # Entidades, Enums, Interfaces
│   │   └── CoursePlatform.Infrastructure # EF Core, Repositorios, Identity
│   └── tests/
│       └── CoursePlatform.UnitTests     # Pruebas Unitarias
└── Frontend/                # Proyecto React + Vite
```

## Requisitos Previos

- .NET SDK 9.0
- Node.js & npm
- MySQL Server

## Configuración

### Base de Datos & Backend

1. **Configurar Conexión**:
   Abra `Backend/src/CoursePlatform.API/appsettings.json` y modifique la cadena de conexión `DefaultConnection` con sus credenciales de MySQL.

2. **Aplicar Migraciones**:
   Desde la carpeta `Backend`:
   ```bash
   dotnet ef database update --project src/CoursePlatform.Infrastructure/CoursePlatform.Infrastructure.csproj --startup-project src/CoursePlatform.API/CoursePlatform.API.csproj
   ```

3. **Ejecutar API**:
   ```bash
   dotnet run --project src/CoursePlatform.API/CoursePlatform.API.csproj
   ```
   La API estará disponible en `http://localhost:5032` (o similar, ver consola).
   
   **Usuario de Prueba (Seed)**:
   - Email: `admin@test.com`
   - Password: `Admin123!`

### Frontend

1. **Instalar Dependencias**:
   Desde la carpeta `Frontend`:
   ```bash
   npm install
   ```

2. **Ejecutar Frontend**:
   ```bash
   npm run dev
   ```
   Acceda a `http://localhost:5173`.

## Funcionalidades Implementadas

### Backend
- **Clean Architecture**: Separación clara en Domain, Application, Infrastructure.
- **Entity Framework Core**: Code-first con MySQL y Migraciones.
- **Identity + JWT**: Autenticación robusta.
- **Soft Delete**: Filtro global y manejo lógico de eliminación.
- **Reglas de Negocio**:
  - Imposible publicar curso sin lecciones.
  - Orden único de lecciones.
  - Reordenamiento.

### Frontend
- **React Moderno**: Hooks, Functional Components.
- **Diseño Premium**: Dark mode, Glassmorphism, CSS Variables, Lucide Icons.
- **Gestión Completa**:
  - Login / Logout.
  - Listado de Cursos (Paginación, Filtro, Búsqueda).
  - Detalles del Curso (Gestión de Lecciones, Publicar, Eliminar).

## Tests

Desde la carpeta `Backend`:
```bash
dotnet test
```
Se incluyen 5 tests unitarios validando las reglas de negocio principales.
