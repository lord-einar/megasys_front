import { useState, useEffect } from 'react'
import { categoriasProblemasAPI } from '../../services/api'
import ModalCategoriaProblema from './ModalCategoriaProblema'
import Swal from 'sweetalert2'

export default function TablaCategoriaProblemas() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState(null)
  const [mostrarInactivos, setMostrarInactivos] = useState(false)

  useEffect(() => {
    cargarCategorias()
  }, [mostrarInactivos])

  const cargarCategorias = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = mostrarInactivos ? {} : { activo: true }
      const response = await categoriasProblemasAPI.list(params)
      const datos = response?.data || response || []
      setCategorias(Array.isArray(datos) ? datos : [])
    } catch (err) {
      setError(err.message)
      console.error('Error cargando categorias:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNuevo = () => {
    setEditingCategoria(null)
    setModalOpen(true)
  }

  const handleEditar = (categoria) => {
    setEditingCategoria(categoria)
    setModalOpen(true)
  }

  const handleGuardar = async (datos) => {
    try {
      if (editingCategoria) {
        await categoriasProblemasAPI.update(editingCategoria.id, datos)
        Swal.fire({
          title: 'Actualizado',
          text: 'La categoria ha sido actualizada correctamente.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        })
      } else {
        await categoriasProblemasAPI.create(datos)
        Swal.fire({
          title: 'Creado',
          text: 'La categoria ha sido creada correctamente.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        })
      }
      setModalOpen(false)
      cargarCategorias()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al guardar la categoria',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const handleEliminar = async (categoria) => {
    const result = await Swal.fire({
      title: 'Confirmar desactivacion',
      html: `¿Desea desactivar la categoria <strong>${categoria.nombre}</strong>?<br/><br/><span style="color: #f59e0b; font-size: 0.875rem;">La categoria no sera visible en nuevas visitas.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Si, desactivar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await categoriasProblemasAPI.delete(categoria.id)
        Swal.fire({
          title: 'Desactivado',
          text: 'La categoria ha sido desactivada correctamente.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        })
        cargarCategorias()
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'Error al desactivar la categoria',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        })
      }
    }
  }

  const handleReactivar = async (categoria) => {
    try {
      await categoriasProblemasAPI.update(categoria.id, { activo: true })
      Swal.fire({
        title: 'Reactivado',
        text: 'La categoria ha sido reactivada correctamente.',
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      })
      cargarCategorias()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al reactivar la categoria',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Categorias de Problemas</h2>
          <p className="text-sm text-gray-600 mt-1">
            Estas categorias se usan para clasificar los problemas resueltos en las visitas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={mostrarInactivos}
              onChange={(e) => setMostrarInactivos(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mostrar inactivos
          </label>
          <button
            onClick={handleNuevo}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Nueva Categoria
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando categorias...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded">
          <p className="text-red-800 font-medium">Error al cargar categorias</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : categorias.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="mt-2">No hay categorias de problemas configuradas</p>
          <button
            onClick={handleNuevo}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Crear la primera categoria
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codigo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripcion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorias.map((categoria) => (
                <tr key={categoria.id} className={`hover:bg-gray-50 transition-colors ${!categoria.activo ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {categoria.orden}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: categoria.color || '#6b7280' }}
                      >
                        <span className="text-white text-xs font-bold">
                          {categoria.nombre?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{categoria.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {categoria.codigo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {categoria.descripcion || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      categoria.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {categoria.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEditar(categoria)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Editar
                    </button>
                    {categoria.activo ? (
                      <button
                        onClick={() => handleEliminar(categoria)}
                        className="text-yellow-600 hover:text-yellow-800 font-medium"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivar(categoria)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ModalCategoriaProblema
          categoria={editingCategoria}
          onClose={() => setModalOpen(false)}
          onSave={handleGuardar}
        />
      )}
    </div>
  )
}
