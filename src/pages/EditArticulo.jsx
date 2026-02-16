import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { inventarioAPI, tipoArticuloAPI, sedesAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { usePermissionError } from '../hooks/usePermissionError'
import Swal from 'sweetalert2'
import LoadingOverlay from '../components/LoadingOverlay'

// Schema de validación
const articuloSchema = yup.object().shape({
  tipo_articulo_id: yup
    .string()
    .required('El tipo de artículo es requerido'),
  marca: yup
    .string()
    .required('La marca es requerida')
    .min(2, 'La marca debe tener al menos 2 caracteres'),
  modelo: yup
    .string()
    .required('El modelo es requerido')
    .min(2, 'El modelo debe tener al menos 2 caracteres'),
  numero_serie: yup.string().nullable().notRequired(),
  service_tag: yup.string().nullable().notRequired(),
  sede_id: yup.string().required('La sede es requerida'),
  fecha_adquisicion: yup.date().nullable().notRequired().max(new Date(), 'La fecha no puede ser futura'),
  observaciones: yup.string().nullable().notRequired(),
  valor_adquisicion: yup.number().nullable().transform((v, o) => o === '' ? null : v).notRequired()
})

export default function EditArticulo() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { canUpdate } = usePermissions()

  // Hook para manejar errores de permisos
  usePermissionError()

  const [loading, setLoading] = useState(false)
  const [tiposArticulo, setTiposArticulo] = useState([])
  const [sedes, setSedes] = useState([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(articuloSchema),
    defaultValues: {
      tipo_articulo_id: '',
      marca: '',
      modelo: '',
      numero_serie: '',
      service_tag: '',
      sede_id: '',
      fecha_adquisicion: null,
      valor_adquisicion: '',
      observaciones: ''
    }
  })

  useEffect(() => {
    if (!canUpdate('inventario')) {
      navigate('/inventario', {
        state: {
          error: 'No tienes permiso para editar artículos de inventario'
        }
      })
    }
  }, [canUpdate, navigate])

  useEffect(() => {
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Cargar tipos de artículos
      let tiposResponse
      try {
        tiposResponse = await tipoArticuloAPI.list()
      } catch (tiposErr) {
        console.error('Error cargando tipos:', tiposErr)
        tiposResponse = []
      }
      const tipos = tiposResponse?.rows || tiposResponse?.data || tiposResponse || []
      setTiposArticulo(Array.isArray(tipos) ? tipos : [])

      // Cargar sedes
      let sedesResponse
      try {
        sedesResponse = await sedesAPI.list({ limit: 100 })
      } catch (sedesErr) {
        console.error('Error cargando sedes:', sedesErr)
        sedesResponse = []
      }
      const sedesData = sedesResponse?.rows || sedesResponse?.data || sedesResponse || []
      setSedes(Array.isArray(sedesData) ? sedesData : [])

      // Cargar artículo actual
      try {
        const response = await inventarioAPI.getById(id)
        const item = response?.data || response

        reset({
          tipo_articulo_id: item.tipo_articulo_id || '',
          marca: item.marca || '',
          modelo: item.modelo || '',
          numero_serie: item.numero_serie || '',
          service_tag: item.service_tag || '',
          sede_id: item.sede_id || '',
          // Handle date correctly for input type="date"
          fecha_adquisicion: item.fecha_adquisicion ? item.fecha_adquisicion.split('T')[0] : null,
          valor_adquisicion: item.valor_adquisicion || '',
          observaciones: item.observaciones || ''
        })

      } catch (itemErr) {
        console.error('Error cargando artículo:', itemErr)
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar el artículo',
          icon: 'error',
          customClass: { popup: 'rounded-2xl' }
        })
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los datos necesarios',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)

      const dataToSend = { ...data }

      // Limpiar campos vacíos
      if (!dataToSend.numero_serie?.trim()) delete dataToSend.numero_serie
      if (!dataToSend.service_tag?.trim()) delete dataToSend.service_tag
      if (!dataToSend.fecha_adquisicion) delete dataToSend.fecha_adquisicion
      if (!dataToSend.observaciones?.trim()) delete dataToSend.observaciones
      if (dataToSend.valor_adquisicion === '' || dataToSend.valor_adquisicion === null) delete dataToSend.valor_adquisicion

      await inventarioAPI.update(id, dataToSend)

      await Swal.fire({
        title: 'Artículo Actualizado',
        text: 'Los cambios se han guardado correctamente.',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-4 py-2 bg-emerald-600 text-white rounded-lg'
        }
      })
      navigate(`/inventario/${id}`)
    } catch (err) {
      console.error('Error actualizando artículo:', err)
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al actualizar el artículo',
        icon: 'error',
        customClass: {
          popup: 'rounded-2xl'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  if (!canUpdate('inventario')) {
    return <div className="p-8 text-center text-surface-500">Cargando permisos...</div>
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Editar Artículo</h1>
            <p className="text-surface-500 mt-1 font-medium">Modifica la información del activo</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/inventario/${id}`)}
            className="text-surface-500 hover:text-surface-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancelar y Volver
          </button>
        </div>

        {loading && !tiposArticulo.length ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-surface-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
            <p className="text-surface-500 font-medium">Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Sección 1: Detalles del Equipo */}
            <div className="card-base p-6 md:p-8 bg-white space-y-6">
              <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">1</span>
                Detalles del Equipo
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Tipo de Artículo */}
                <div className="space-y-1.5">
                  <label htmlFor="tipo_articulo_id" className="block text-sm font-semibold text-surface-700">
                    Tipo de Artículo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="tipo_articulo_id"
                      {...register('tipo_articulo_id')}
                      disabled={loading}
                      className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.tipo_articulo_id
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                          : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                        }`}
                    >
                      <option value="">Selecciona un tipo</option>
                      {tiposArticulo.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.tipo_articulo_id && (
                    <p className="text-rose-500 text-xs mt-1 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {errors.tipo_articulo_id.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Marca */}
                  <div className="space-y-1.5">
                    <label htmlFor="marca" className="block text-sm font-semibold text-surface-700">
                      Marca <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="marca"
                      {...register('marca')}
                      placeholder="Ej: Dell, HP"
                      className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.marca
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                          : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                        }`}
                    />
                    {errors.marca && (
                      <p className="text-rose-500 text-xs mt-1 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {errors.marca.message}
                      </p>
                    )}
                  </div>

                  {/* Modelo */}
                  <div className="space-y-1.5">
                    <label htmlFor="modelo" className="block text-sm font-semibold text-surface-700">
                      Modelo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="modelo"
                      {...register('modelo')}
                      placeholder="Ej: OptiPlex 7090"
                      className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.modelo
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                          : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                        }`}
                    />
                    {errors.modelo && (
                      <p className="text-rose-500 text-xs mt-1 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {errors.modelo.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Identificación */}
            <div className="card-base p-6 md:p-8 bg-white space-y-6">
              <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">2</span>
                Identificación y Seguimiento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Número de Serie */}
                <div className="space-y-1.5">
                  <label htmlFor="numero_serie" className="block text-sm font-semibold text-surface-700">
                    Número de Serie
                  </label>
                  <input
                    type="text"
                    id="numero_serie"
                    {...register('numero_serie')}
                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all hover:border-surface-300"
                  />
                </div>

                {/* Service Tag */}
                <div className="space-y-1.5">
                  <label htmlFor="service_tag" className="block text-sm font-semibold text-surface-700">
                    Service Tag / Etiqueta
                  </label>
                  <input
                    type="text"
                    id="service_tag"
                    {...register('service_tag')}
                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all hover:border-surface-300"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Ubicación y Detalles */}
            <div className="card-base p-6 md:p-8 bg-white space-y-6">
              <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">3</span>
                Ubicación y Adquisición
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sede */}
                <div className="space-y-1.5">
                  <label htmlFor="sede_id" className="block text-sm font-semibold text-surface-700">
                    Sede Actual <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="sede_id"
                      {...register('sede_id')}
                      disabled={loading}
                      className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.sede_id
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                          : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                        }`}
                    >
                      <option value="">Selecciona una sede</option>
                      {sedes.map(sede => (
                        <option key={sede.id} value={sede.id}>
                          {sede.nombre_sede}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.sede_id && (
                    <p className="text-rose-500 text-xs mt-1 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {errors.sede_id.message}
                    </p>
                  )}
                </div>

                {/* Fecha de Adquisición */}
                <div className="space-y-1.5">
                  <label htmlFor="fecha_adquisicion" className="block text-sm font-semibold text-surface-700">
                    Fecha de Adquisición
                  </label>
                  <input
                    type="date"
                    id="fecha_adquisicion"
                    {...register('fecha_adquisicion')}
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.fecha_adquisicion
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10'
                        : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
                      }`}
                  />
                  {errors.fecha_adquisicion && (
                    <p className="text-rose-500 text-xs mt-1 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {errors.fecha_adquisicion.message}
                    </p>
                  )}
                </div>

                {/* Valor de Adquisición */}
                <div className="space-y-1.5">
                  <label htmlFor="valor_adquisicion" className="block text-sm font-semibold text-surface-700">
                    Valor de Adquisición
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400 font-bold">$</div>
                    <input
                      type="number"
                      id="valor_adquisicion"
                      {...register('valor_adquisicion')}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full pl-7 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all hover:border-surface-300"
                    />
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-1.5 pt-2">
                <label htmlFor="observaciones" className="block text-sm font-semibold text-surface-700">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  {...register('observaciones')}
                  rows="3"
                  placeholder="Notas adicionales..."
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all hover:border-surface-300 resize-none"
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t border-surface-200">
              <button
                type="button"
                onClick={() => navigate(`/inventario/${id}`)}
                disabled={loading}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn-primary w-full sm:w-auto shadow-lg shadow-primary-900/10"
              >
                {loading || isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </span>
                ) : 'Guardar Cambios'}
              </button>
            </div>

          </form>
        )}

        <LoadingOverlay isVisible={loading || isSubmitting} message="Guardando cambios..." />
      </div>
    </div>
  )
}
