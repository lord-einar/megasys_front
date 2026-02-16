import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { personalAPI, sedesAPI, rolesAPI } from '../services/api'
import { parseApiError, getFieldError, hasFieldError } from '../services/errorHandler'
import { usePermissions } from '../hooks/usePermissions'
import { usePermissionError } from '../hooks/usePermissionError'
import Swal from 'sweetalert2'
import LoadingOverlay from '../components/LoadingOverlay'
import FieldError from '../components/FieldError'

// Schema de validación con Yup
const personalSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
    .trim(),

  apellido: yup
    .string()
    .required('El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras')
    .trim(),

  email: yup
    .string()
    .required('El email es requerido')
    .email('El email debe ser válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .trim(),

  telefono: yup
    .string()
    .optional()
    .matches(/^[+]?[0-9\s\-\(\)]*$/, 'El formato del teléfono no es válido')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .nullable()
    .transform((v, o) => o === '' ? null : v)
    .trim(),

  sedes: yup
    .array()
    .min(1, 'Debe seleccionar al menos una sede')
    .required('La sede es requerida'),

  rol_id: yup
    .string()
    .required('El rol es requerido')
})

export default function NuevoPersonal() {
  const navigate = useNavigate()
  const { canCreate } = usePermissions()

  // Hook para manejar errores de permisos
  usePermissionError()

  const [sedes, setSedes] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [serverFieldErrors, setServerFieldErrors] = useState({})
  const [sedesFilter, setSedesFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filteredSedes, setFilteredSedes] = useState([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(personalSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      sedes: [],
      rol_id: ''
    }
  })

  // Validar permisos al cargar el componente
  useEffect(() => {
    if (!canCreate('personal')) {
      navigate('/personal', {
        state: {
          error: 'No tienes permiso para crear personal'
        }
      })
    }
  }, [canCreate, navigate])

  // Cargar sedes y roles
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)

        // Cargar sedes
        const responseS = await sedesAPI.list({ limit: 100 })
        const sedeslista = responseS?.data || responseS || []
        const sedesArray = Array.isArray(sedeslista) ? sedeslista : []
        setSedes(sedesArray)
        setFilteredSedes(sedesArray)

        // Cargar roles
        const responseR = await rolesAPI.list({ limit: 100 })
        const roleslista = responseR?.data || responseR || []
        setRoles(Array.isArray(roleslista) ? roleslista : [])
      } catch (err) {
        console.error('Error cargando datos:', err)
        Swal.fire('Error', 'No se pudieron cargar los datos necesarios', 'error')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  // Filtrar sedes
  useEffect(() => {
    if (!sedesFilter.trim()) {
      setFilteredSedes(sedes)
    } else {
      const lowerFilter = sedesFilter.toLowerCase()
      setFilteredSedes(sedes.filter(sede =>
        sede.nombre_sede.toLowerCase().includes(lowerFilter) ||
        sede.localidad.toLowerCase().includes(lowerFilter)
      ))
    }
  }, [sedesFilter, sedes])

  const onSubmit = async (data) => {
    try {
      setServerFieldErrors({})
      setIsLoading(true)

      // Preparar datos para crear personal con sedes y rol
      const datosPersonal = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono || null,
        sedes: data.sedes,
        rol_id: data.rol_id
      }

      await personalAPI.create(datosPersonal)

      await Swal.fire({
        title: 'Personal Creado',
        text: 'El personal ha sido registrado correctamente.',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-4 py-2 bg-emerald-600 text-white rounded-lg'
        }
      })

      navigate('/personal')
    } catch (err) {
      console.error('Error creando personal:', err)

      // Parsear errores del servidor
      const errorData = parseApiError(err)
      if (errorData.fields && Object.keys(errorData.fields).length > 0) {
        setServerFieldErrors(errorData.fields)
        Swal.fire({
          title: 'Error de Validación',
          text: 'Por favor revise los campos marcados en rojo.',
          icon: 'error',
          customClass: { popup: 'rounded-2xl' }
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: errorData.general || 'Error al crear el personal',
          icon: 'error',
          customClass: { popup: 'rounded-2xl' }
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const selectedSedes = watch('sedes') || []

  if (!canCreate('personal')) {
    return <div className="p-8 text-center text-surface-500">Cargando permisos...</div>
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Nuevo Personal</h1>
            <p className="text-surface-500 mt-1 font-medium">Registra un nuevo miembro del equipo</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/personal')}
            className="text-surface-500 hover:text-surface-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancelar y Volver
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-surface-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
            <p className="text-surface-500 font-medium">Cargando formulario...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Sección 1: Información Personal */}
            <div className="card-base p-6 md:p-8 bg-white space-y-6">
              <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">1</span>
                Información Personal
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-1.5">
                  <label htmlFor="nombre" className="block text-sm font-semibold text-surface-700">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    {...register('nombre')}
                    placeholder="Ej: Juan"
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.nombre || hasFieldError('nombre', serverFieldErrors)
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  />
                  <FieldError
                    serverError={getFieldError('nombre', serverFieldErrors)}
                    clientError={errors.nombre}
                  />
                </div>

                {/* Apellido */}
                <div className="space-y-1.5">
                  <label htmlFor="apellido" className="block text-sm font-semibold text-surface-700">
                    Apellido <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    {...register('apellido')}
                    placeholder="Ej: Pérez"
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.apellido || hasFieldError('apellido', serverFieldErrors)
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  />
                  <FieldError
                    serverError={getFieldError('apellido', serverFieldErrors)}
                    clientError={errors.apellido}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-semibold text-surface-700">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    placeholder="juan.perez@empresa.com"
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.email || hasFieldError('email', serverFieldErrors)
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  />
                  <FieldError
                    serverError={getFieldError('email', serverFieldErrors)}
                    clientError={errors.email}
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-1.5">
                  <label htmlFor="telefono" className="block text-sm font-semibold text-surface-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    {...register('telefono')}
                    placeholder="(011) 1234-5678"
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.telefono || hasFieldError('telefono', serverFieldErrors)
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  />
                  <FieldError
                    serverError={getFieldError('telefono', serverFieldErrors)}
                    clientError={errors.telefono}
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Rol y Sedes */}
            <div className="card-base p-6 md:p-8 bg-white space-y-6">
              <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">2</span>
                Asignación de Rol y Ubicación
              </h2>

              {/* Rol */}
              <div className="space-y-1.5">
                <label htmlFor="rol_id" className="block text-sm font-semibold text-surface-700">
                  Rol <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="rol_id"
                    {...register('rol_id')}
                    disabled={isLoading}
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.rol_id || hasFieldError('rol_id', serverFieldErrors)
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  >
                    <option value="">-- Seleccionar rol --</option>
                    {/* Roles */}
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.parent_id ? `↳ ${rol.nombre}` : rol.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <FieldError
                  serverError={getFieldError('rol_id', serverFieldErrors)}
                  clientError={errors.rol_id}
                />
              </div>

              {/* Sedes */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-surface-700">
                    Asignar Sedes <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-md">
                    {selectedSedes.length} seleccionadas
                  </span>
                </div>

                {/* Buscador de sedes */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar sedes por nombre o localidad..."
                    value={sedesFilter}
                    onChange={(e) => setSedesFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400"
                  />
                </div>

                {/* Lista de sedes */}
                <div className={`border rounded-xl p-4 max-h-60 overflow-y-auto ${errors.sedes ? 'border-rose-300 bg-rose-50/10' : 'border-surface-200 bg-surface-50/50'}`}>
                  {filteredSedes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredSedes.map((sede) => (
                        <label key={sede.id} className="flex items-center p-2 rounded-lg bg-white border border-surface-200 hover:border-primary-300 cursor-pointer transition-all shadow-sm group">
                          <input
                            type="checkbox"
                            value={sede.id}
                            {...register('sedes')}
                            className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                          />
                          <div className="ml-2.5">
                            <span className="block text-sm font-medium text-surface-700 group-hover:text-primary-700">{sede.nombre_sede}</span>
                            <span className="block text-[10px] text-surface-400">{sede.localidad}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-surface-500 text-sm">
                      No se encontraron sedes con ese criterio
                    </div>
                  )}
                </div>
                <FieldError
                  serverError={getFieldError('sedes', serverFieldErrors)}
                  clientError={errors.sedes}
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t border-surface-200">
              <button
                type="button"
                onClick={() => navigate('/personal')}
                disabled={isLoading}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn-primary w-full sm:w-auto shadow-lg shadow-primary-900/10"
              >
                {isLoading || isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </span>
                ) : 'Crear Personal'}
              </button>
            </div>
          </form>
        )}

        <LoadingOverlay isVisible={isLoading || isSubmitting} message="Procesando..." />
      </div>
    </div>
  )
}
