import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { personalAPI, sedesAPI, rolesAPI } from '../services/api'
import { parseApiError, getFieldError, hasFieldError, getSuccessMessage } from '../services/errorHandler'
import { useFieldValidation } from '../hooks/useFieldValidation'
import Toast from '../components/Toast'
import LoadingOverlay from '../components/LoadingOverlay'
import ValidationIndicator from '../components/ValidationIndicator'
import CharacterCounter from '../components/CharacterCounter'
import FieldError from '../components/FieldError'
import './NuevaSede.css'
import './NuevoPersonal.css'

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
    .trim(),

  sedes: yup
    .array()
    .min(1, 'Debe seleccionar al menos una sede')
    .required('La sede es requerida'),

  rol_id: yup
    .string()
    .required('El rol es requerido')
    .uuid('Debe seleccionar un rol válido')
})

export default function NuevoPersonal() {
  const navigate = useNavigate()
  const [sedes, setSedes] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [serverFieldErrors, setServerFieldErrors] = useState({})
  const [sedesFilter, setSedesFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [formValues, setFormValues] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  })

  // Hooks para validación en tiempo real
  const nombreValidation = useFieldValidation(personalSchema, 'nombre')
  const apellidoValidation = useFieldValidation(personalSchema, 'apellido')
  const emailValidation = useFieldValidation(personalSchema, 'email')
  const telefonoValidation = useFieldValidation(personalSchema, 'telefono')

  const {
    register,
    handleSubmit,
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

  // Cargar sedes y roles
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)

        // Cargar sedes
        const responseS = await sedesAPI.list({ limit: 100 })
        const sedeslista = responseS?.data || responseS || []
        setSedes(Array.isArray(sedeslista) ? sedeslista : [])

        // Cargar roles
        const responseR = await rolesAPI.list({ limit: 100 })
        const roleslista = responseR?.data || responseR || []
        setRoles(Array.isArray(roleslista) ? roleslista : [])
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError('No se pudieron cargar los datos necesarios')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const onSubmit = async (data) => {
    try {
      setSubmitError(null)
      setServerFieldErrors({})
      setIsLoading(true)
      console.log('Creando personal con datos:', data)

      // Preparar datos para crear personal con sedes y rol
      const datosPersonal = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono || null,
        sedes: data.sedes,
        rol_id: data.rol_id
      }

      // Crear personal
      const response = await personalAPI.create(datosPersonal)
      console.log('Respuesta del servidor:', response)

      if (response && (response.success || response.data || response.id)) {
        console.log('Personal creado correctamente, redirigiendo a /personal')
        const successMsg = getSuccessMessage('create', 'Personal')
        setToast({ message: successMsg, type: 'success' })

        // Esperar a que se muestre el toast antes de redirigir
        setTimeout(() => {
          navigate('/personal', {
            replace: true,
            state: { mensaje: successMsg }
          })
        }, 1500)
      } else {
        setSubmitError('Error inesperado: No se recibió confirmación del servidor')
      }
    } catch (err) {
      console.error('Error creando personal:', err)

      // Parsear errores del servidor
      const errorData = parseApiError(err)
      if (errorData.fields && Object.keys(errorData.fields).length > 0) {
        setServerFieldErrors(errorData.fields)
      }
      setSubmitError(errorData.general || 'Error al crear el personal')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="nueva-sede-container">
        <div className="loading-spinner">
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="nueva-sede-container">
      <div className="nueva-sede-header">
        <h1>Nuevo Personal</h1>
        <p>Registrar un nuevo miembro del personal en el sistema</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {submitError && <div className="alert alert-danger">{submitError}</div>}

      <form className="nueva-sede-form" onSubmit={handleSubmit(onSubmit)}>
        {/* Sección 1: Información Personal */}
        <div className="form-section">
          <h2>Información Personal</h2>

          {/* Nombre */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">
                Nombre <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                {...register('nombre', {
                  onChange: async (e) => {
                    const value = e.target.value
                    setFormValues(prev => ({ ...prev, nombre: value }))
                    if (value.trim()) {
                      await nombreValidation.validate(value)
                    } else {
                      nombreValidation.clearError()
                    }
                  }
                })}
                placeholder="Ej: Juan"
                disabled={isLoading}
                className={`form-control ${errors.nombre || hasFieldError('nombre', serverFieldErrors) || (nombreValidation.isValid === false) ? 'is-invalid' : ''}`}
              />
              <FieldError
                serverError={getFieldError('nombre', serverFieldErrors)}
                clientError={errors.nombre}
                fieldName="nombre"
              />
              <ValidationIndicator isValid={nombreValidation.isValid} label="Nombre válido" />
              <CharacterCounter currentLength={formValues.nombre.length} maxLength={50} />
            </div>

            {/* Apellido */}
            <div className="form-group">
              <label htmlFor="apellido">
                Apellido <span className="required">*</span>
              </label>
              <input
                type="text"
                id="apellido"
                {...register('apellido', {
                  onChange: async (e) => {
                    const value = e.target.value
                    setFormValues(prev => ({ ...prev, apellido: value }))
                    if (value.trim()) {
                      await apellidoValidation.validate(value)
                    } else {
                      apellidoValidation.clearError()
                    }
                  }
                })}
                placeholder="Ej: Pérez"
                disabled={isLoading}
                className={`form-control ${errors.apellido || hasFieldError('apellido', serverFieldErrors) || (apellidoValidation.isValid === false) ? 'is-invalid' : ''}`}
              />
              <FieldError
                serverError={getFieldError('apellido', serverFieldErrors)}
                clientError={errors.apellido}
                fieldName="apellido"
              />
              <ValidationIndicator isValid={apellidoValidation.isValid} label="Apellido válido" />
              <CharacterCounter currentLength={formValues.apellido.length} maxLength={50} />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                onChange: async (e) => {
                  const value = e.target.value
                  setFormValues(prev => ({ ...prev, email: value }))
                  if (value.trim()) {
                    await emailValidation.validate(value)
                  } else {
                    emailValidation.clearError()
                  }
                }
              })}
              placeholder="Ej: juan.perez@empresa.com"
              disabled={isLoading}
              className={`form-control ${errors.email || hasFieldError('email', serverFieldErrors) || (emailValidation.isValid === false) ? 'is-invalid' : ''}`}
            />
            <FieldError
              serverError={getFieldError('email', serverFieldErrors)}
              clientError={errors.email}
              fieldName="email"
            />
            <ValidationIndicator isValid={emailValidation.isValid} label="Email válido" />
            <CharacterCounter currentLength={formValues.email.length} maxLength={100} />
          </div>

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
        </div>

        {/* Sección 2: Rol y Sedes */}
        <div className="form-section">
          <h2>Asignación</h2>

          {/* Rol */}
          <div className="form-group">
            <label htmlFor="rol_id">
              Rol <span className="required">*</span>
            </label>
            <select
              id="rol_id"
              {...register('rol_id')}
              disabled={isLoading}
              className={`form-control ${errors.rol_id || hasFieldError('rol_id', serverFieldErrors) ? 'is-invalid' : ''}`}
            >
              <option value="">-- Seleccionar rol --</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
            {(errors.rol_id || hasFieldError('rol_id', serverFieldErrors)) && (
              <div className="invalid-feedback">{getFieldError('rol_id', serverFieldErrors) || errors.rol_id?.message}</div>
            )}
          </div>

          {/* Sedes */}
          <div className="form-group">
            <label>
              Sedes <span className="required">*</span>
            </label>

            {/* Filtro de búsqueda */}
            <div className="sedes-search">
              <input
                type="text"
                placeholder="Buscar sedes..."
                value={sedesFilter}
                onChange={(e) => setSedesFilter(e.target.value)}
                disabled={isLoading}
                className="search-input"
              />
            </div>

            {/* Selector de sedes tipo pills */}
            <div className="sedes-pills">
              {sedes
                .filter(
                  (sede) =>
                    sede.nombre_sede.toLowerCase().includes(sedesFilter.toLowerCase()) ||
                    sede.localidad.toLowerCase().includes(sedesFilter.toLowerCase())
                )
                .map((sede) => (
                  <label key={sede.id} className="sede-pill" style={{ pointerEvents: isLoading ? 'none' : 'auto', opacity: isLoading ? 0.6 : 1 }}>
                    <input
                      type="checkbox"
                      value={sede.id}
                      {...register('sedes')}
                      disabled={isLoading}
                    />
                    <span className="pill-text">{sede.nombre_sede}</span>
                  </label>
                ))}
            </div>

            {sedes.filter(
              (sede) =>
                sede.nombre_sede.toLowerCase().includes(sedesFilter.toLowerCase()) ||
                sede.localidad.toLowerCase().includes(sedesFilter.toLowerCase())
            ).length === 0 && (
              <div className="no-sedes-message">
                No se encontraron sedes que coincidan con tu búsqueda
              </div>
            )}

            {(errors.sedes || hasFieldError('sedes', serverFieldErrors)) && (
              <div className="invalid-feedback" style={{ display: 'block' }}>
                {getFieldError('sedes', serverFieldErrors) || errors.sedes?.message}
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="btn btn-primary"
          >
            {isLoading || isSubmitting ? 'Creando personal...' : 'Crear Personal'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/personal')}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>

      <LoadingOverlay isVisible={isLoading} message="Creando personal..." />

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
