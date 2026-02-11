import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { proveedoresAPI, nivelesServiciosAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse, normalizeItemResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function ProveedorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canUpdate, canDelete } = usePermissions()

  const [proveedor, setProveedor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [serviciosExpandidos, setServiciosExpandidos] = useState({})
  const [modalNivel, setModalNivel] = useState({ abierto: false, servicio: null, nivel: null })
  const [formNivel, setFormNivel] = useState({ nivel: 1, email: '', telefono: '', web: '' })

  useEffect(() => {
    cargarProveedor()
  }, [id])

  const cargarProveedor = async () => {
    try {
      setLoading(true)
      const response = await proveedoresAPI.getById(id)
      const proveedor = normalizeItemResponse(response)
      setProveedor(proveedor)
    } catch (err) {
      console.error('Error cargando proveedor:', err)
      Swal.fire('Error', 'No se pudo cargar el proveedor', 'error')
    } finally {
      setLoading(false)
    }
  }

  const eliminarProveedor = async () => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea eliminar el proveedor <strong>${proveedor.empresa}</strong>?<br/><br/><span style="color: #ef4444; font-size: 0.875rem;">Esta acción no puede ser deshecha.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await Swal.fire({
          title: 'Eliminando...',
          html: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: async () => {
            Swal.showLoading()
            try {
              await proveedoresAPI.delete(proveedor.id)
              await Swal.fire({
                title: '¡Eliminado!',
                text: 'El proveedor ha sido eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#3b82f6'
              })
              navigate('/proveedores')
            } catch (err) {
              await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el proveedor: ' + (err.message || 'Error desconocido'),
                icon: 'error',
                confirmButtonColor: '#ef4444'
              })
            }
          }
        })
      } catch (err) {
        console.error('Error inesperado:', err)
      }
    }
  }

  const toggleServicio = (servicioId) => {
    setServiciosExpandidos(prev => ({
      ...prev,
      [servicioId]: !prev[servicioId]
    }))
  }

  const abrirModalNivel = (servicio, nivel = null) => {
    if (nivel) {
      setFormNivel({
        nivel: nivel.nivel,
        email: nivel.email,
        telefono: nivel.telefono || '',
        web: nivel.web || ''
      })
    } else {
      setFormNivel({ nivel: 1, email: '', telefono: '', web: '' })
    }
    setModalNivel({ abierto: true, servicio, nivel })
  }

  const cerrarModalNivel = () => {
    setModalNivel({ abierto: false, servicio: null, nivel: null })
    setFormNivel({ nivel: 1, email: '', telefono: '', web: '' })
  }

  const guardarNivel = async () => {
    try {
      if (!formNivel.email || !formNivel.nivel) {
        Swal.fire('Error', 'El nivel y el email son obligatorios', 'error')
        return
      }

      const nivelData = {
        servicio_id: modalNivel.servicio.id,
        nivel: parseInt(formNivel.nivel),
        email: formNivel.email.trim(),
        telefono: formNivel.telefono.trim() || null,
        web: formNivel.web.trim() || null,
        activo: true
      }

      if (modalNivel.nivel) {
        // Editar
        await nivelesServiciosAPI.update(modalNivel.nivel.id, nivelData)
        await Swal.fire('¡Actualizado!', 'Nivel de soporte actualizado correctamente', 'success')
      } else {
        // Crear
        await nivelesServiciosAPI.create(nivelData)
        await Swal.fire('¡Creado!', 'Nivel de soporte creado correctamente', 'success')
      }

      cerrarModalNivel()
      cargarProveedor()
    } catch (err) {
      console.error('Error guardando nivel:', err)
      Swal.fire('Error', err.message || 'No se pudo guardar el nivel de soporte', 'error')
    }
  }

  const eliminarNivel = async (nivel) => {
    const result = await Swal.fire({
      title: '¿Eliminar nivel de soporte?',
      text: `Nivel ${nivel.nivel} - ${nivel.email}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await nivelesServiciosAPI.delete(nivel.id)
        await Swal.fire('¡Eliminado!', 'Nivel de soporte eliminado correctamente', 'success')
        cargarProveedor()
      } catch (err) {
        console.error('Error eliminando nivel:', err)
        Swal.fire('Error', 'No se pudo eliminar el nivel de soporte', 'error')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!proveedor) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Proveedor no encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/proveedores')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Volver a Proveedores
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{proveedor.empresa}</h1>
            <p className="text-gray-600 mt-2">Información detallada del proveedor</p>
          </div>
          <div className="flex gap-3">
            <span className={`px-4 py-2 rounded-lg border-2 font-semibold ${
              proveedor.activo
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}>
              {proveedor.activo ? '✓ Activo' : '✗ Inactivo'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-medium text-gray-900">{proveedor.empresa}</p>
              </div>
              {proveedor.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{proveedor.email}</p>
                </div>
              )}
              {proveedor.telefono && (
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium text-gray-900">{proveedor.telefono}</p>
                </div>
              )}
              {proveedor.direccion && (
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="font-medium text-gray-900">{proveedor.direccion}</p>
                </div>
              )}
              {proveedor.web && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Sitio Web</p>
                  <a
                    href={proveedor.web.startsWith('http') ? proveedor.web : `https://${proveedor.web}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {proveedor.web}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Ejecutivos de Cuentas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Ejecutivos de Cuentas</h2>
              <span className="text-sm text-gray-500">
                {proveedor.ejecutivos?.length || 0} ejecutivo(s)
              </span>
            </div>
            {proveedor.ejecutivos && proveedor.ejecutivos.length > 0 ? (
              <div className="space-y-3">
                {proveedor.ejecutivos.map((ejecutivo) => (
                  <div
                    key={ejecutivo.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {ejecutivo.nombre} {ejecutivo.apellido}
                        </p>
                        {ejecutivo.email && (
                          <p className="text-sm text-gray-600">{ejecutivo.email}</p>
                        )}
                        {ejecutivo.telefono && (
                          <p className="text-sm text-gray-600">{ejecutivo.telefono}</p>
                        )}
                        {ejecutivo.tipoServicio && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {ejecutivo.tipoServicio.nombre}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        ejecutivo.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ejecutivo.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay ejecutivos asignados</p>
            )}
          </div>

          {/* Servicios y Niveles de Soporte */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Servicios y Niveles de Soporte</h2>
              <span className="text-sm text-gray-500">
                {proveedor.servicios?.length || 0} servicio(s)
              </span>
            </div>
            {proveedor.servicios && proveedor.servicios.length > 0 ? (
              <div className="space-y-3">
                {proveedor.servicios.map((servicio) => (
                  <div key={servicio.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header del Servicio */}
                    <div
                      className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleServicio(servicio.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{servicio.nombre}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {servicio.tipoServicio && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {servicio.tipoServicio.nombre}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            servicio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {servicio.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {servicio.nivelessoporte?.length || 0} nivel(es)
                          </span>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          serviciosExpandidos[servicio.id] ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Niveles de Soporte Expandibles */}
                    {serviciosExpandidos[servicio.id] && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">📞 Niveles de Soporte</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              abrirModalNivel(servicio)
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            + Agregar Nivel
                          </button>
                        </div>
                        {servicio.nivelessoporte && servicio.nivelessoporte.length > 0 ? (
                          <div className="space-y-2">
                            {servicio.nivelessoporte
                              .sort((a, b) => a.nivel - b.nivel)
                              .map((nivel) => (
                              <div key={nivel.id} className="bg-blue-50 border border-blue-200 rounded p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                                        Nivel {nivel.nivel}
                                      </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      <div>
                                        <span className="text-gray-600 font-medium">Email:</span>{' '}
                                        <a href={`mailto:${nivel.email}`} className="text-blue-600 hover:underline">
                                          {nivel.email}
                                        </a>
                                      </div>
                                      {nivel.telefono && (
                                        <div>
                                          <span className="text-gray-600 font-medium">Tel:</span> {nivel.telefono}
                                        </div>
                                      )}
                                      {nivel.web && (
                                        <div>
                                          <span className="text-gray-600 font-medium">Web:</span>{' '}
                                          <a
                                            href={nivel.web}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-all"
                                          >
                                            {nivel.web}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        abrirModalNivel(servicio, nivel)
                                      }}
                                      className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        eliminarNivel(nivel)
                                      }}
                                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded">
                            No hay niveles de soporte configurados
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay servicios registrados</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Acciones */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/proveedores/${proveedor.id}/editar`)}
                disabled={!canUpdate('proveedores')}
                className={`w-full px-4 py-2 rounded-lg transition-colors font-medium ${
                  canUpdate('proveedores')
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Editar Proveedor
              </button>
              <button
                onClick={eliminarProveedor}
                disabled={!canDelete('proveedores')}
                className={`w-full px-4 py-2 rounded-lg transition-colors font-medium ${
                  canDelete('proveedores')
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Eliminar Proveedor
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Estadísticas</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Servicios Activos</span>
                <span className="font-bold text-blue-600">
                  {proveedor.servicios?.filter(s => s.activo).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Ejecutivos Activos</span>
                <span className="font-bold text-green-600">
                  {proveedor.ejecutivos?.filter(e => e.activo).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Servicios</span>
                <span className="font-bold text-purple-600">
                  {proveedor.servicios?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Ejecutivos</span>
                <span className="font-bold text-orange-600">
                  {proveedor.ejecutivos?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Accesos Rápidos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/proveedores/servicios', { state: { proveedorId: proveedor.id } })}
                className="w-full px-4 py-2 text-left text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                Ver Todos los Servicios
              </button>
              <button
                onClick={() => navigate('/proveedores/ejecutivos', { state: { proveedorId: proveedor.id } })}
                className="w-full px-4 py-2 text-left text-sm bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors"
              >
                Ver Todos los Ejecutivos
              </button>
              <button
                onClick={() => navigate('/proveedores/equipos', { state: { proveedorId: proveedor.id } })}
                className="w-full px-4 py-2 text-left text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Ver Equipos del Proveedor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Agregar/Editar Nivel de Soporte */}
      {modalNivel.abierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {modalNivel.nivel ? 'Editar' : 'Agregar'} Nivel de Soporte
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Servicio: <span className="font-semibold">{modalNivel.servicio?.nombre}</span>
              </p>

              <div className="space-y-4">
                {/* Nivel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formNivel.nivel}
                    onChange={(e) => setFormNivel({ ...formNivel, nivel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1-10"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={formNivel.email}
                    onChange={(e) => setFormNivel({ ...formNivel, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="soporte@proveedor.com"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formNivel.telefono}
                    onChange={(e) => setFormNivel({ ...formNivel, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="(011) 1234-5678"
                  />
                </div>

                {/* Web */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={formNivel.web}
                    onChange={(e) => setFormNivel({ ...formNivel, web: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://soporte.proveedor.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={guardarNivel}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {modalNivel.nivel ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  onClick={cerrarModalNivel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
