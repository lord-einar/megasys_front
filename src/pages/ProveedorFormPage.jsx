import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { proveedoresAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function ProveedorFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canCreate, canUpdate } = usePermissions()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      empresa: '',
      email: '',
      telefono: '',
      direccion: '',
      web: '',
      activo: true
    }
  })

  const activo = watch('activo')

  useEffect(() => {
    if (isEditing) {
      cargarProveedor()
    }
  }, [id])

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tienes permiso para crear proveedores',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tienes permiso para editar proveedores',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores')
    }
  }, [isEditing, canCreate, canUpdate, navigate])

  const cargarProveedor = async () => {
    try {
      setLoading(true)
      const response = await proveedoresAPI.getById(id)
      const normalized = normalizeApiResponse(response)
      const proveedor = normalized.data

      reset({
        empresa: proveedor.empresa || '',
        email: proveedor.email || '',
        telefono: proveedor.telefono || '',
        direccion: proveedor.direccion || '',
        web: proveedor.web || '',
        activo: proveedor.activo ?? true
      })
    } catch (err) {
      console.error('Error cargando proveedor:', err)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el proveedor',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const proveedorData = {
        empresa: data.empresa.trim(),
        email: data.email?.trim() || null,
        telefono: data.telefono?.trim() || null,
        direccion: data.direccion?.trim() || null,
        web: data.web?.trim() || null,
        activo: data.activo
      }

      if (isEditing) {
        await proveedoresAPI.update(id, proveedorData)
        await Swal.fire({
          title: 'Actualizado',
          text: 'El proveedor ha sido actualizado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate(`/proveedores/${id}`)
      } else {
        const response = await proveedoresAPI.create(proveedorData)
        const normalized = normalizeApiResponse(response)
        await Swal.fire({
          title: 'Creado',
          text: 'El proveedor ha sido creado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate(`/proveedores/${normalized.data.id}`)
      }
    } catch (err) {
      console.error('Error guardando proveedor:', err)
      Swal.fire({
        title: 'Error',
        text: err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el proveedor`,
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando información del proveedor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
              {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h1>
            <p className="text-surface-500 mt-1 font-medium">
              {isEditing ? 'Actualiza la información comercial y contacto' : 'Registra una nueva empresa externa'}
            </p>
          </div>
          <button
            onClick={() => navigate('/proveedores')}
            className="text-surface-500 hover:text-surface-700 font-medium text-sm transition-colors flex items-center gap-2 w-fit bg-white px-4 py-2 rounded-xl border border-surface-200 shadow-sm hover:bg-surface-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="card-base p-6 sm:p-8 bg-white space-y-8">
            <div className="border-b border-surface-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-surface-900">Información General</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empresa (Full width on Grid) */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="empresa" className="text-sm font-bold text-surface-700">
                  Nombre de la Empresa <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <input
                    type="text"
                    id="empresa"
                    {...register('empresa', {
                      required: 'El nombre de la empresa es requerido',
                      minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                      maxLength: { value: 100, message: 'No puede exceder 100 caracteres' }
                    })}
                    placeholder="Ej: Servicios Técnicos S.A."
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.empresa ? 'border-rose-500' : 'border-surface-200'}`}
                  />
                </div>
                {errors.empresa && <p className="text-xs text-rose-500 font-medium mt-1">{errors.empresa.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-bold text-surface-700">Email Corporativo</label>
                <input
                  type="email"
                  id="email"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  placeholder="contacto@empresa.com"
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.email ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.email && <p className="text-xs text-rose-500 font-medium mt-1">{errors.email.message}</p>}
              </div>

              {/* Teléfono */}
              <div className="space-y-1.5">
                <label htmlFor="telefono" className="text-sm font-bold text-surface-700">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  {...register('telefono', {
                    maxLength: { value: 20, message: 'No puede exceder 20 caracteres' }
                  })}
                  placeholder="(011) 1234-5678"
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.telefono ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.telefono && <p className="text-xs text-rose-500 font-medium mt-1">{errors.telefono.message}</p>}
              </div>

              {/* Dirección (Full width on Grid) */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="direccion" className="text-sm font-bold text-surface-700">Dirección Fiscal / Oficina</label>
                <input
                  type="text"
                  id="direccion"
                  {...register('direccion', {
                    maxLength: { value: 200, message: 'No puede exceder 200 caracteres' }
                  })}
                  placeholder="Av. Principal 123, Piso 4, CABA"
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.direccion ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.direccion && <p className="text-xs text-rose-500 font-medium mt-1">{errors.direccion.message}</p>}
              </div>

              {/* Web */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="web" className="text-sm font-bold text-surface-700">Sitio Web</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  </div>
                  <input
                    type="text"
                    id="web"
                    {...register('web', {
                      maxLength: { value: 200, message: 'No puede exceder 200 caracteres' }
                    })}
                    placeholder="www.ejemplo.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.web ? 'border-rose-500' : 'border-surface-200'}`}
                  />
                </div>
                {errors.web && <p className="text-xs text-rose-500 font-medium mt-1">{errors.web.message}</p>}
              </div>

              {/* Estado Activo - Custom Switch */}
              <div className="md:col-span-2 pt-2 border-t border-surface-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900">Estado del Proveedor</p>
                  <p className="text-xs text-surface-500">Define si este proveedor está habilitado para operaciones.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('activo')}
                  />
                  <div className="w-14 h-7 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className={`ml-3 text-sm font-bold ${activo ? 'text-emerald-700' : 'text-surface-500'}`}>
                    {activo ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/proveedores')}
              className="btn-secondary w-full sm:w-auto"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto shadow-lg shadow-primary-900/10"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Guardando...
                </span>
              ) : (
                isEditing ? 'Guardar Cambios' : 'Registrar Proveedor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
