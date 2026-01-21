import { useState, useEffect } from 'react'
import { checklistItemsAPI } from '../../services/api'
import ModalChecklistItem from './ModalChecklistItem'
import Swal from 'sweetalert2'

export default function TablaChecklistItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [mostrarInactivos, setMostrarInactivos] = useState(false)

  useEffect(() => {
    cargarItems()
  }, [mostrarInactivos])

  const cargarItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = mostrarInactivos ? {} : { activo: true }
      const response = await checklistItemsAPI.list(params)
      const datos = response?.data || response || []
      setItems(Array.isArray(datos) ? datos : [])
    } catch (err) {
      setError(err.message)
      console.error('Error cargando items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNuevo = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const handleEditar = (item) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleGuardar = async (datos) => {
    try {
      if (editingItem) {
        await checklistItemsAPI.update(editingItem.id, datos)
        Swal.fire({
          title: 'Actualizado',
          text: 'El item ha sido actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        })
      } else {
        await checklistItemsAPI.create(datos)
        Swal.fire({
          title: 'Creado',
          text: 'El item ha sido creado correctamente.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        })
      }
      setModalOpen(false)
      cargarItems()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al guardar el item',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const handleEliminar = async (item) => {
    const result = await Swal.fire({
      title: 'Confirmar desactivacion',
      html: `¿Desea desactivar el item <strong>${item.nombre}</strong>?<br/><br/><span style="color: #f59e0b; font-size: 0.875rem;">El item no sera visible en nuevas visitas.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Si, desactivar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await checklistItemsAPI.delete(item.id)
        Swal.fire({
          title: 'Desactivado',
          text: 'El item ha sido desactivado correctamente.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        })
        cargarItems()
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'Error al desactivar el item',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        })
      }
    }
  }

  const handleReactivar = async (item) => {
    try {
      await checklistItemsAPI.update(item.id, { activo: true })
      Swal.fire({
        title: 'Reactivado',
        text: 'El item ha sido reactivado correctamente.',
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      })
      cargarItems()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al reactivar el item',
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
          <h2 className="text-xl font-semibold text-gray-900">Items de Checklist</h2>
          <p className="text-sm text-gray-600 mt-1">
            Estos items aparecen en el checklist al marcar una visita como realizada
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
            + Nuevo Item
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando items...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded">
          <p className="text-red-800 font-medium">Error al cargar items</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-2">No hay items de checklist configurados</p>
          <button
            onClick={handleNuevo}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Crear el primer item
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
                  Nombre
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
              {items.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.activo ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.orden}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {item.descripcion || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEditar(item)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Editar
                    </button>
                    {item.activo ? (
                      <button
                        onClick={() => handleEliminar(item)}
                        className="text-yellow-600 hover:text-yellow-800 font-medium"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivar(item)}
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
        <ModalChecklistItem
          item={editingItem}
          onClose={() => setModalOpen(false)}
          onSave={handleGuardar}
        />
      )}
    </div>
  )
}
