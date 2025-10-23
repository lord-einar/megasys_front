# Sistema de Gestión Empresarial - Frontend

Frontend moderno construido con **Vite**, **React** y **Tailwind CSS v4** para el Sistema de Gestión Empresarial.

## Características

- ⚡ **Vite** - Build tool extremadamente rápido
- ⚛️ **React 18** - Librería UI moderna
- 🎨 **Tailwind CSS v4** - Framework CSS utilities-first
- 🔒 **Autenticación integrada** - Con Microsoft Entra ID
- 📱 **Responsive Design** - Compatible con todos los dispositivos
- 🚀 **Hot Module Replacement** - Desarrollo ágil con HMR

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── assets/              # Imágenes, iconos, etc.
│   ├── components/          # Componentes reutilizables
│   ├── pages/              # Páginas principales
│   ├── hooks/              # Hooks personalizados
│   ├── services/           # Servicios API
│   ├── utils/              # Funciones utilitarias
│   ├── App.jsx             # Componente principal
│   ├── index.css           # Estilos globales
│   └── main.jsx            # Punto de entrada
├── public/                 # Archivos estáticos
├── vite.config.js          # Configuración de Vite
├── tailwind.config.js      # Configuración de Tailwind
├── postcss.config.js       # Configuración de PostCSS
├── package.json            # Dependencias
└── README.md              # Este archivo
```

## Instalación y Setup

```bash
# Las dependencias ya están instaladas
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview de la build
npm run preview
```

## Scripts disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build optimizado para producción
- `npm run preview` - Preview de la build
- `npm run lint` - Verifica calidad del código

## Configuración

Variables de entorno en `.env.local`:
- `VITE_API_URL` - URL del backend API
- `VITE_APP_NAME` - Nombre de la aplicación
- `VITE_APP_VERSION` - Versión de la aplicación

## Integración con Backend

El frontend se conecta al backend en `http://localhost:4000/api`.

El servicio API (`src/services/api.js`) proporciona métodos para:
- Autenticación (auth)
- Gestión de sedes
- Gestión de personal
- Gestión de inventario
- Gestión de remitos
- Gestión de proveedores

## Próximos pasos

- [ ] Implementar React Router para navegación
- [ ] Crear Context API para estado global
- [ ] Implementar formularios con validación
- [ ] Agregar más páginas y funcionalidades
- [ ] Agregar notificaciones/toast
- [ ] Agregar pruebas unitarias

## Recursos útiles

- [Documentación de Vite](https://vite.dev)
- [Documentación de React](https://react.dev)
- [Documentación de Tailwind CSS v4](https://tailwindcss.com)
