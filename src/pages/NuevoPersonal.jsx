import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { personalAPI, sedesAPI, rolesAPI } from '../services/api'
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
  const [sedesFilter, setSedesFilter] = useState('')

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
        navigate('/personal', {
          replace: true,
          state: { mensaje: 'Personal creado correctamente' }
        })
      } else {
        setSubmitError('Error inesperado: No se recibió confirmación del servidor')
      }
    } catch (err) {
      console.error('Error creando personal:', err)
      setSubmitError(err.message || 'Error al crear el personal')
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
                {...register('nombre')}
                placeholder="Ej: Juan"
                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
              />
              {errors.nombre && (
                <div className="invalid-feedback">{errors.nombre.message}</div>
              )}
            </div>

            {/* Apellido */}
            <div className="form-group">
              <label htmlFor="apellido">
                Apellido <span className="required">*</span>
              </label>
              <input
                type="text"
                id="apellido"
                {...register('apellido')}
                placeholder="Ej: Pérez"
                className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
              />
              {errors.apellido && (
                <div className="invalid-feedback">{errors.apellido.message}</div>
              )}
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
              {...register('email')}
              placeholder="Ej: juan.perez@empresa.com"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              {...register('telefono')}
              placeholder="Ej: (011) 1234-5678"
              className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
            />
            {errors.telefono && (
              <div className="invalid-feedback">{errors.telefono.message}</div>
            )}
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
              className={`form-control ${errors.rol_id ? 'is-invalid' : ''}`}
            >
              <option value="">-- Seleccionar rol --</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
            {errors.rol_id && (
              <div className="invalid-feedback">{errors.rol_id.message}</div>
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
                  <label key={sede.id} className="sede-pill">
                    <input
                      type="checkbox"
                      value={sede.id}
                      {...register('sedes')}
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

            {errors.sedes && (
              <div className="invalid-feedback" style={{ display: 'block' }}>
                {errors.sedes.message}
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Creando personal...' : 'Crear Personal'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/personal')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
