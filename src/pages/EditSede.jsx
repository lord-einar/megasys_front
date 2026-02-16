import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { empresasAPI, sedesAPI } from '../services/api'
import { parseApiError, getFieldError, hasFieldError, getSuccessMessage } from '../services/errorHandler'
import { useFieldValidation } from '../hooks/useFieldValidation'
import { usePermissions } from '../hooks/usePermissions'
import { usePermissionError } from '../hooks/usePermissionError'
import Toast from '../components/Toast'
import LoadingOverlay from '../components/LoadingOverlay'
import FieldError from '../components/FieldError'

// Schema de validación con Yup
const sedeSchema = yup.object().shape({
  empresa_id: yup
    .string()
    .required('La empresa es requerida')
    .uuid('Debe seleccionar una empresa válida'),
  nombre_sede: yup
    .string()
    .required('El nombre de la sede es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  direccion: yup
    .string()
    .required('La dirección es requerida')
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .trim(),
  localidad: yup
    .string()
    .required('La localidad es requerida')
    .min(2, 'La localidad debe tener al menos 2 caracteres')
    .max(100, 'La localidad no puede exceder 100 caracteres')
    .trim(),
  provincia: yup
    .string()
    .required('La provincia es requerida')
    .min(2, 'La provincia debe tener al menos 2 caracteres')
    .max(100, 'La provincia no puede exceder 100 caracteres')
    .trim(),
  pais: yup
    .string()
    .required('El país es requerido')
    .max(100, 'El país no puede exceder 100 caracteres')
    .trim()
    .default('Argentina'),
  telefono: yup
    .string()
    .optional()
    .matches(/^[+]?[0-9\s\-\(\)]*$/, 'El formato del teléfono no es válido')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .trim(),
  ip_sede: yup
    .string()
    .optional()
    .matches(
      /^(\d{1,3}\.){3}\d{1,3}$/,
      'La IP debe tener un formato válido (ej: 192.168.1.1)'
    )
    .trim()
})

export default function EditSede() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { canUpdate } = usePermissions()

  // Hook para manejar errores de permisos
  usePermissionError()

  const [empresas, setEmpresas] = useState([])
  const [sedeData, setSedeData] = useState(null)
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)
  const [error, setError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [serverFieldErrors, setServerFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [formValues, setFormValues] = useState({
    nombre_sede: '',
    direccion: '',
    localidad: '',
    provincia: '',
    pais: 'Argentina',
    telefono: '',
    ip_sede: '',
    es_prueba: false
  })

  // Hooks para validación en tiempo real
  const nombreSedeValidation = useFieldValidation(sedeSchema, 'nombre_sede')
  const direccionValidation = useFieldValidation(sedeSchema, 'direccion')
  const localidadValidation = useFieldValidation(sedeSchema, 'localidad')
  const provinciaValidation = useFieldValidation(sedeSchema, 'provincia')
  const paisValidation = useFieldValidation(sedeSchema, 'pais')
  const telefonoValidation = useFieldValidation(sedeSchema, 'telefono')
  const ipSedeValidation = useFieldValidation(sedeSchema, 'ip_sede')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(sedeSchema),
    defaultValues: {
      empresa_id: '',
      nombre_sede: '',
      direccion: '',
      localidad: '',
      provincia: '',
      pais: 'Argentina',
      telefono: '',
      ip_sede: ''
    }
  })

  // Validar permisos al cargar el componente
  useEffect(() => {
    if (!canUpdate('sedes')) {
      navigate('/sedes', {
        state: {
          error: 'No tienes permiso para editar sedes'
        }
      })
    }
  }, [canUpdate, navigate])

  // Cargar empresas y datos de la sede existente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingEmpresas(true)

        // Cargar empresas activas
        const response = await empresasAPI.getActivas()
        if (response && Array.isArray(response)) {
          setEmpresas(response)
        } else if (response && Array.isArray(response.data)) {
          setEmpresas(response.data)
        } else {
          setEmpresas([])
        }

        // Cargar datos de la sede existente
        const sedeResponse = await sedesAPI.getById(id)
        const sede = sedeResponse?.data || sedeResponse

        if (!sede) {
          setError('No se pudo cargar los datos de la sede')
          return
        }

        setSedeData(sede)

        // Pre-llenar el formulario
        const defaultValues = {
          empresa_id: sede.empresa_id || '',
          nombre_sede: sede.nombre_sede || '',
          direccion: sede.direccion || '',
          localidad: sede.localidad || '',
          provincia: sede.provincia || '',
          pais: sede.pais || 'Argentina',
          telefono: sede.telefono || '',
          ip_sede: sede.ip_sede || '',
          es_prueba: sede.es_prueba || false
        }

        reset(defaultValues)
        setFormValues({
          nombre_sede: sede.nombre_sede || '',
          direccion: sede.direccion || '',
          localidad: sede.localidad || '',
          provincia: sede.provincia || '',
          pais: sede.pais || 'Argentina',
          telefono: sede.telefono || '',
          ip_sede: sede.ip_sede || '',
          es_prueba: sede.es_prueba || false
        })
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError('No se pudieron cargar los datos necesarios')
      } finally {
        setLoadingEmpresas(false)
      }
    }

    cargarDatos()
  }, [id, reset])

  const onSubmit = async (data) => {
    try {
      setSubmitError(null)
      setServerFieldErrors({})
      setIsLoading(true)
      console.log('Actualizando sede con datos:', data)

      const response = await sedesAPI.update(id, data)

      console.log('Respuesta del servidor:', response)

      // Si la respuesta indica éxito, redirigir
      if (response && (response.success || response.data || response.id)) {
        console.log('Sede actualizada exitosamente, redirigiendo a /sedes')
        const successMsg = getSuccessMessage('update', 'Sede')
        setToast({ message: successMsg, type: 'success' })

        // Esperar a que se muestre el toast antes de redirigir
        setTimeout(() => {
          navigate('/sedes', {
            replace: true,
            state: { mensaje: successMsg }
          })
        }, 1500)
      } else {
        setSubmitError('Error inesperado: No se recibió confirmación del servidor')
      }
    } catch (err) {
      console.error('Error actualizando sede:', err)

      // Parsear errores del servidor
      const errorData = parseApiError(err)
      if (errorData.fields && Object.keys(errorData.fields).length > 0) {
        setServerFieldErrors(errorData.fields)
      }
      setSubmitError(errorData.general || 'Error al actualizar la sede')
    } finally {
      setIsLoading(false)
    }
  }

  if (!canUpdate('sedes')) {
    return <div className="p-8 text-center text-surface-500">Cargando permisos...</div>
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Editar Sede</h1>
            <p className="text-surface-500 mt-1 font-medium">Actualiza la información de la sede</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/sedes')}
            className="text-surface-500 hover:text-surface-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancelar y Volver
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 font-medium flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 font-medium flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {submitError}
          </div>
        )}

        {loadingEmpresas && (
          <div className="p-12 text-center bg-white rounded-2xl border border-surface-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
            <p className="text-surface-500 font-medium">Cargando datos...</p>
          </div>
        )}

        {empresas.length > 0 && !loadingEmpresas && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Sección 1: Información de la Sede */}
            <div className="card-base p-6 md:p-8 bg-white space-y-6">
              <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">1</span>
                Información Principal
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Empresa */}
                <div className="space-y-1.5">
                  <label htmlFor="empresa_id" className="block text-sm font-semibold text-surface-700">
                    Empresa <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="empresa_id"
                      {...register('empresa_id')}
                      disabled={isLoading}
                      className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.empresa_id || hasFieldError('empresa_id', serverFieldErrors)
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                          : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                        }`}
                    >
                      <option value="">-- Seleccionar empresa --</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nombre_empresa}
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
                    serverError={getFieldError('empresa_id', serverFieldErrors)}
                    clientError={errors.empresa_id}
                    fieldName="empresa_id"
                  />
                </div>

                {/* Nombre de Sede */}
                <div className="space-y-1.5">
                  <label htmlFor="nombre_sede" className="block text-sm font-semibold text-surface-700">
                    Nombre de la Sede <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre_sede"
                    {...register('nombre_sede', {
                      onChange: async (e) => {
                        const value = e.target.value
                        setFormValues(prev => ({ ...prev, nombre_sede: value }))
                        if (value.trim()) {
                          await nombreSedeValidation.validate(value)
                        } else {
                          nombreSedeValidation.clearError()
                        }
                      }
                    })}
                    placeholder="Ej: Sede Centro, Sede Norte"
                    disabled={isLoading}
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.nombre_sede || hasFieldError('nombre_sede', serverFieldErrors) || (nombreSedeValidation.isValid === false)
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  />
                  <FieldError
                    serverError={getFieldError('nombre_sede', serverFieldErrors)}
                    clientError={errors.nombre_sede}
                    fieldName="nombre_sede"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Ubicación */}
            <div className="card-base p-6 md:p-8 bg-white space-y-6">
              <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">2</span>
                Ubicación
              </h2>

              <div className="space-y-6">
                {/* Dirección */}
                <div className="space-y-1.5">
                  <label htmlFor="direccion" className="block text-sm font-semibold text-surface-700">
                    Dirección <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    {...register('direccion', {
                      onChange: async (e) => {
                        const value = e.target.value
                        setFormValues(prev => ({ ...prev, direccion: value }))
                        if (value.trim()) {
                          await direccionValidation.validate(value)
                        } else {
                          direccionValidation.clearError()
                        }
                      }
                    })}
                    placeholder="Calle y número"
                    disabled={isLoading}
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.direccion || hasFieldError('direccion', serverFieldErrors) || (direccionValidation.isValid === false)
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  />
                  <FieldError
                    serverError={getFieldError('direccion', serverFieldErrors)}
                    clientError={errors.direccion}
                    fieldName="direccion"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Localidad */}
                  <div className="space-y-1.5">
                    <label htmlFor="localidad" className="block text-sm font-semibold text-surface-700">
                      Localidad <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="localidad"
                      {...register('localidad', {
                        onChange: async (e) => {
                          const value = e.target.value
                          setFormValues(prev => ({ ...prev, localidad: value }))
                          if (value.trim()) {
                            await localidadValidation.validate(value)
                          } else {
                            localidadValidation.clearError()
                          }
                        }
                      })}
                      placeholder="Ej: CABA"
                      disabled={isLoading}
                      className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.localidad || hasFieldError('localidad', serverFieldErrors) || (localidadValidation.isValid === false)
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                          : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                        }`}
                    />
                    <FieldError
                      serverError={getFieldError('localidad', serverFieldErrors)}
                      clientError={errors.localidad}
                      fieldName="localidad"
                    />
                  </div>

                  {/* Provincia */}
                  <div className="space-y-1.5">
                    <label htmlFor="provincia" className="block text-sm font-semibold text-surface-700">
                      Provincia <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="provincia"
                      {...register('provincia', {
                        onChange: async (e) => {
                          const value = e.target.value
                          setFormValues(prev => ({ ...prev, provincia: value }))
                          if (value.trim()) {
                            await provinciaValidation.validate(value)
                          } else {
                            provinciaValidation.clearError()
                          }
                        }
                      })}
                      placeholder="Ej: Buenos Aires"
                      disabled={isLoading}
                      className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.provincia || hasFieldError('provincia', serverFieldErrors) || (provinciaValidation.isValid === false)
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                          : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                        }`}
                    />
                    <FieldError
                      serverError={getFieldError('provincia', serverFieldErrors)}
                      clientError={errors.provincia}
                      fieldName="provincia"
                    />
                  </div>
                  {/* País */}
                  <div className="space-y-1.5">
                    <label htmlFor="pais" className="block text-sm font-semibold text-surface-700">
                      País <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="pais"
                      {...register('pais', {
                        onChange: async (e) => {
                          const value = e.target.value
                          setFormValues(prev => ({ ...prev, pais: value }))
                          if (value.trim()) {
                            await paisValidation.validate(value)
                          } else {
                            paisValidation.clearError()
                          }
                        }
                      })}
                      disabled={isLoading}
                      className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.pais || hasFieldError('pais', serverFieldErrors) || (paisValidation.isValid === false)
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                          : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                        }`}
                    />
                    <FieldError
                      serverError={getFieldError('pais', serverFieldErrors)}
                      clientError={errors.pais}
                      fieldName="pais"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Contacto e Infraestructura */}
            <div className="card-base p-6 md:p-8 bg-white space-y-6">
              <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">3</span>
                Contacto e Infraestructura
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teléfono */}
                <div className="space-y-1.5">
                  <label htmlFor="telefono" className="block text-sm font-semibold text-surface-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    {...register('telefono', {
                      onChange: async (e) => {
                        const value = e.target.value
                        setFormValues(prev => ({ ...prev, telefono: value }))
                        if (value.trim()) {
                          await telefonoValidation.validate(value)
                        } else {
                          telefonoValidation.clearError()
                        }
                      }
                    })}
                    placeholder="Ej: (011) 1234-5678"
                    disabled={isLoading}
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.telefono || hasFieldError('telefono', serverFieldErrors) || (telefonoValidation.isValid === false)
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  />
                  <FieldError
                    serverError={getFieldError('telefono', serverFieldErrors)}
                    clientError={errors.telefono}
                    fieldName="telefono"
                  />
                </div>

                {/* IP Sede */}
                <div className="space-y-1.5">
                  <label htmlFor="ip_sede" className="block text-sm font-semibold text-surface-700">
                    IP de la Sede
                  </label>
                  <input
                    type="text"
                    id="ip_sede"
                    {...register('ip_sede', {
                      onChange: async (e) => {
                        const value = e.target.value
                        setFormValues(prev => ({ ...prev, ip_sede: value }))
                        if (value.trim()) {
                          await ipSedeValidation.validate(value)
                        } else {
                          ipSedeValidation.clearError()
                        }
                      }
                    })}
                    placeholder="Ej: 192.168.1.1"
                    disabled={isLoading}
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.ip_sede || hasFieldError('ip_sede', serverFieldErrors) || (ipSedeValidation.isValid === false)
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  />
                  <FieldError
                    serverError={getFieldError('ip_sede', serverFieldErrors)}
                    clientError={errors.ip_sede}
                    fieldName="ip_sede"
                  />
                </div>
              </div>

              {/* Sede de Prueba */}
              <div className="pt-4 mt-2">
                <label className="flex items-start gap-3 cursor-pointer group p-4 border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      {...register('es_prueba')}
                      disabled={isLoading}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-surface-900 group-hover:text-primary-700 transition-colors">Sede de Prueba</span>
                    <span className="text-xs text-surface-500 mt-1">
                      Marcar esta opción excluirá la sede de los reportes generales y estadísticas financieras.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t border-surface-200">
              <button
                type="button"
                onClick={() => navigate('/sedes')}
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
                    Actualizando...
                  </span>
                ) : 'Actualizar Sede'}
              </button>
            </div>
          </form>
        )}

        <LoadingOverlay isVisible={isLoading} message="Actualizando sede..." />

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={3000}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  )
}
