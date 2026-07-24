# Gancho

Sistema web de punto de venta para comercios que venden productos por peso. Organiza catálogo, ingreso de mercadería, ventas, confirmaciones de caja y métricas diarias.

**Estado:** MVP funcional en desarrollo.

## Funcionalidades implementadas

- Catálogo de productos con altas, cambios de precio y baja lógica.
- Aumentos masivos de precios.
- Registro de mercadería recibida.
- Punto de venta adaptado a importes y cantidades por peso.
- Confirmación de ventas pendientes.
- Cierre ciego y resumen diario de caja.
- Historial y estadísticas de ventas.

## Stack

- **Frontend:** React, Vite y Tailwind CSS.
- **Backend:** Node.js y Express.
- **Base de datos:** MySQL.
- **Infraestructura:** Docker Compose y Nginx.

## Inicio con Docker

1. Copiar `.env.example` a `.env`.
2. Reemplazar todos los valores de ejemplo.
3. Ejecutar:

```bash
docker compose up --build
```

## Desarrollo

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Seguridad

Las credenciales de base de datos se reciben mediante variables de entorno. Los archivos `.env`, dependencias, builds y volúmenes locales no forman parte del repositorio.

## Pruebas

Actualmente el proyecto no cuenta con una suite automatizada de pruebas. El frontend dispone de lint y build para validación estática.

## Autor

Alejo Monárdez  
[Portfolio](https://alejomonardez.com) · [GitHub](https://github.com/SoyMonardez)
