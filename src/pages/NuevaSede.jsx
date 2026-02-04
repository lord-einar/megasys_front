import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import ValidationIndicator from '../components/ValidationIndicator'
import CharacterCounter from '../components/CharacterCounter'
import FieldError from '../components/FieldError'
import './NuevaSede.css'

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

export default function NuevaSede() {
  const navigate = useNavigate()
  const { canCreate } = usePermissions()

  // Hook para manejar errores de permisos
  usePermissionError()

  const [empresas, setEmpresas] = useState([])
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
    ip_sede: ''
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
    if (!canCreate('sedes')) {
      navigate('/sedes', {
        state: {
          error: 'No tienes permiso para crear sedes'
        }
      })
    }
  }, [canCreate, navigate])

  // Cargar empresas activas
  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        setLoadingEmpresas(true)
        const response = await empresasAPI.getActivas()
        if (response && Array.isArray(response)) {
          setEmpresas(response)
        } else if (response && Array.isArray(response.data)) {
          setEmpresas(response.data)
        } else {
          setEmpresas([])
        }
      } catch (err) {
        console.error('Error cargando empresas:', err)
        setError('No se pudieron cargar las empresas')
      } finally {
        setLoadingEmpresas(false)
      }
    }

    cargarEmpresas()
  }, [])

  const onSubmit = async (data) => {
    try {
      setSubmitError(null)
      setServerFieldErrors({})
      setIsLoading(true)
      console.log('Creando sede con datos:', data)
      const response = await sedesAPI.create(data)

      console.log('Respuesta del servidor:', response)

      // Si la respuesta indica éxito, redirigir
      if (response && (response.success || response.data || response.id)) {
        console.log('Sede creada exitosamente, redirigiendo a /sedes')
        const successMsg = getSuccessMessage('create', 'Sede')
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
      console.error('Error creando sede:', err)

      // Parsear errores del servidor
      const errorData = parseApiError(err)
      if (errorData.fields && Object.keys(errorData.fields).length > 0) {
        setServerFieldErrors(errorData.fields)
      }
      setSubmitError(errorData.general || 'Error al crear la sede')
    } finally {
      setIsLoading(false)
    }
  }

  if (!canCreate('sedes')) {
    return <div>Cargando...</div>
  }

  if (loadingEmpresas) {
    return (
      <div className="nueva-sede-container">
        <div className="loading-spinner">
          <p>Cargando empresas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="nueva-sede-container">
      <div className="nueva-sede-header">
        <h1>Nueva Sede</h1>
        <p>Registrar una nueva sede en el sistema</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {submitError && <div className="alert alert-danger">{submitError}</div>}

      {empresas.length === 0 && (
        <div className="alert alert-danger">
          No hay empresas disponibles. Por favor crea una empresa primero.
        </div>
      )}

      {empresas.length > 0 && (
        <form className="nueva-sede-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Sección 1: Información de la Sede */}
          <div className="form-section">
            <h2>Información de la Sede</h2>

            {/* Empresa */}
            <div className="form-group">
              <label htmlFor="empresa_id">
                Empresa <span className="required">*</span>
              </label>
              <select
                id="empresa_id"
                {...register('empresa_id')}
                disabled={isLoading}
                className={`form-control ${errors.empresa_id || hasFieldError('empresa_id', serverFieldErrors) ? 'is-invalid' : ''}`}
              >
                <option value="">-- Seleccionar empresa --</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre_empresa}
                  </option>
                ))}
              </select>
              <FieldError
                serverError={getFieldError('empresa_id', serverFieldErrors)}
                clientError={errors.empresa_id}
                fieldName="empresa_id"
              />
            </div>

            {/* Nombre de Sede */}
            <div className="form-group">
              <label htmlFor="nombre_sede">
                Nombre de la Sede <span className="required">*</span>
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
                className={`form-control ${errors.nombre_sede || hasFieldError('nombre_sede', serverFieldErrors) || (nombreSedeValidation.isValid === false) ? 'is-invalid' : ''}`}
              />
              <FieldError
                serverError={getFieldError('nombre_sede', serverFieldErrors)}
                clientError={errors.nombre_sede}
                fieldName="nombre_sede"
              />
              <ValidationIndicator isValid={nombreSedeValidation.isValid} label="Nombre válido" />
              <CharacterCounter currentLength={formValues.nombre_sede.length} maxLength={100} />
            </div>
          </div>

          {/* Sección 2: Ubicación */}
          <div className="form-section">
            <h2>Ubicación</h2>

            {/* Dirección */}
            <div className="form-group">
              <label htmlFor="direccion">
                Dirección <span className="required">*</span>
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
                className={`form-control ${errors.direccion || hasFieldError('direccion', serverFieldErrors) || (direccionValidation.isValid === false) ? 'is-invalid' : ''}`}
              />
              <FieldError
                serverError={getFieldError('direccion', serverFieldErrors)}
                clientError={errors.direccion}
                fieldName="direccion"
              />
              <ValidationIndicator isValid={direccionValidation.isValid} label="Dirección válida" />
              <CharacterCounter currentLength={formValues.direccion.length} maxLength={200} />
            </div>

            {/* Localidad y Provincia */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="localidad">
                  Localidad <span className="required">*</span>
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
                  placeholder="Ej: Buenos Aires"
                  disabled={isLoading}
                  className={`form-control ${errors.localidad || hasFieldError('localidad', serverFieldErrors) || (localidadValidation.isValid === false) ? 'is-invalid' : ''}`}
                />
                <FieldError
                  serverError={getFieldError('localidad', serverFieldErrors)}
                  clientError={errors.localidad}
                  fieldName="localidad"
                />
                <ValidationIndicator isValid={localidadValidation.isValid} label="Localidad válida" />
                <CharacterCounter currentLength={formValues.localidad.length} maxLength={100} />
              </div>

              <div className="form-group">
                <label htmlFor="provincia">
                  Provincia <span className="required">*</span>
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
                  className={`form-control ${errors.provincia || hasFieldError('provincia', serverFieldErrors) || (provinciaValidation.isValid === false) ? 'is-invalid' : ''}`}
                />
                <FieldError
                  serverError={getFieldError('provincia', serverFieldErrors)}
                  clientError={errors.provincia}
                  fieldName="provincia"
                />
                <ValidationIndicator isValid={provinciaValidation.isValid} label="Provincia válida" />
                <CharacterCounter currentLength={formValues.provincia.length} maxLength={100} />
              </div>
            </div>

            {/* País */}
            <div className="form-group">
              <label htmlFor="pais">
                País <span className="required">*</span>
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
                className={`form-control ${errors.pais || hasFieldError('pais', serverFieldErrors) || (paisValidation.isValid === false) ? 'is-invalid' : ''}`}
              />
              <FieldError
                serverError={getFieldError('pais', serverFieldErrors)}
                clientError={errors.pais}
                fieldName="pais"
              />
              <ValidationIndicator isValid={paisValidation.isValid} label="País válido" />
              <CharacterCounter currentLength={formValues.pais.length} maxLength={100} />
            </div>
          </div>

          {/* Sección 3: Contacto e Infraestructura */}
          <div className="form-section">
            <h2>Contacto e Infraestructura</h2>

            {/* Teléfono */}
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
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
                className={`form-control ${errors.telefono || hasFieldError('telefono', serverFieldErrors) || (telefonoValidation.isValid === false) ? 'is-invalid' : ''}`}
              />
              <FieldError
                serverError={getFieldError('telefono', serverFieldErrors)}
                clientError={errors.telefono}
                fieldName="telefono"
              />
              <ValidationIndicator isValid={telefonoValidation.isValid} label="Teléfono válido" />
              <CharacterCounter currentLength={formValues.telefono.length} maxLength={20} />
            </div>

            {/* IP Sede */}
            <div className="form-group">
              <label htmlFor="ip_sede">IP de la Sede</label>
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
                className={`form-control ${errors.ip_sede || hasFieldError('ip_sede', serverFieldErrors) || (ipSedeValidation.isValid === false) ? 'is-invalid' : ''}`}
              />
              <FieldError
                serverError={getFieldError('ip_sede', serverFieldErrors)}
                clientError={errors.ip_sede}
                fieldName="ip_sede"
              />
              <ValidationIndicator isValid={ipSedeValidation.isValid} label="IP válida" />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn btn-primary"
            >
              {isLoading || isSubmitting ? 'Creando sede...' : 'Crear Sede'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/sedes')}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <LoadingOverlay isVisible={isLoading} message="Creando sede..." />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
