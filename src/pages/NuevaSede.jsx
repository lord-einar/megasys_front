import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { empresasAPI, sedesAPI } from '../services/api'
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
  const [empresas, setEmpresas] = useState([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)
  const [error, setError] = useState(null)
  const [submitError, setSubmitError] = useState(null)

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
      console.log('Creando sede con datos:', data)
      const response = await sedesAPI.create(data)

      console.log('Respuesta del servidor:', response)

      // Si la respuesta indica éxito, redirigir
      if (response && (response.success || response.data || response.id)) {
        console.log('Sede creada exitosamente, redirigiendo a /sedes')
        // Usar replace para evitar volver atrás
        navigate('/sedes', {
          replace: true,
          state: { mensaje: 'Sede creada correctamente' }
        })
      } else {
        setSubmitError('Error inesperado: No se recibió confirmación del servidor')
      }
    } catch (err) {
      console.error('Error creando sede:', err)
      setSubmitError(err.message || 'Error al crear la sede')
    }
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
                className={`form-control ${errors.empresa_id ? 'is-invalid' : ''}`}
              >
                <option value="">-- Seleccionar empresa --</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
              {errors.empresa_id && (
                <div className="invalid-feedback">{errors.empresa_id.message}</div>
              )}
            </div>

            {/* Nombre de Sede */}
            <div className="form-group">
              <label htmlFor="nombre_sede">
                Nombre de la Sede <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombre_sede"
                {...register('nombre_sede')}
                placeholder="Ej: Sede Centro, Sede Norte"
                className={`form-control ${errors.nombre_sede ? 'is-invalid' : ''}`}
              />
              {errors.nombre_sede && (
                <div className="invalid-feedback">{errors.nombre_sede.message}</div>
              )}
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
                {...register('direccion')}
                placeholder="Calle y número"
                className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
              />
              {errors.direccion && (
                <div className="invalid-feedback">{errors.direccion.message}</div>
              )}
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
                  {...register('localidad')}
                  placeholder="Ej: Buenos Aires"
                  className={`form-control ${errors.localidad ? 'is-invalid' : ''}`}
                />
                {errors.localidad && (
                  <div className="invalid-feedback">{errors.localidad.message}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="provincia">
                  Provincia <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="provincia"
                  {...register('provincia')}
                  placeholder="Ej: Buenos Aires"
                  className={`form-control ${errors.provincia ? 'is-invalid' : ''}`}
                />
                {errors.provincia && (
                  <div className="invalid-feedback">{errors.provincia.message}</div>
                )}
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
                {...register('pais')}
                className={`form-control ${errors.pais ? 'is-invalid' : ''}`}
              />
              {errors.pais && (
                <div className="invalid-feedback">{errors.pais.message}</div>
              )}
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
                {...register('telefono')}
                placeholder="Ej: (011) 1234-5678"
                className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
              />
              {errors.telefono && (
                <div className="invalid-feedback">{errors.telefono.message}</div>
              )}
            </div>

            {/* IP Sede */}
            <div className="form-group">
              <label htmlFor="ip_sede">IP de la Sede</label>
              <input
                type="text"
                id="ip_sede"
                {...register('ip_sede')}
                placeholder="Ej: 192.168.1.1"
                className={`form-control ${errors.ip_sede ? 'is-invalid' : ''}`}
              />
              {errors.ip_sede && (
                <div className="invalid-feedback">{errors.ip_sede.message}</div>
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
              {isSubmitting ? 'Creando sede...' : 'Crear Sede'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/sedes')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
