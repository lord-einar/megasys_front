import { useState, useEffect } from 'react'
import { remitosAPI } from '../../services/api'
import './ModalArticulos.css'

/**
 * ModalArticulos - Modal para seleccionar artículos disponibles
 *
 * Props:
 * - isOpen: boolean - controla visibilidad del modal
 * - onClose: función - cierra el modal
 * - onSelectArticulo: función - callback cuando se selecciona un artículo
 * - sedeOrigen: ID de la sede origen (para filtrar artículos)
 * - tipoArticulo: ID del tipo de artículo (para filtrar)
 * - articulosYaAgregados: array de IDs de artículos ya en la tabla
 */
function ModalArticulos({
  isOpen,
  onClose,
  onSelectArticulo,
  sedeOrigen,
  tipoArticulo,
  articulosYaAgregados = []
}) {
  const [articulos, setArticulos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const ITEMS_PER_PAGE = 50

  useEffect(() => {
    if (isOpen && sedeOrigen && tipoArticulo) {
      loadArticulos(1)
    }
  }, [isOpen, sedeOrigen, tipoArticulo])

  const loadArticulos = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await remitosAPI.getArticulosDisponibles({
        sede_id: sedeOrigen,
        tipo_articulo_id: tipoArticulo,
        page: page,
        limit: ITEMS_PER_PAGE
      })

      setArticulos(response.data || [])
      setTotalItems(response.total || 0)
      setTotalPages(Math.ceil((response.total || 0) / ITEMS_PER_PAGE))
      setCurrentPage(page)
    } catch (err) {
      console.error('Error loading articulos:', err)
      setError('Error al cargar los artículos disponibles')
      setArticulos([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectArticulo = (articulo) => {
    onSelectArticulo(articulo)
    onClose()
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      loadArticulos(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      loadArticulos(currentPage + 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-articulos" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Seleccionar Artículo</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="modal-content">
          {loading ? (
            <div className="loading-state">
              <p>Cargando artículos disponibles...</p>
            </div>
          ) : articulos.length > 0 ? (
            <>
              <table className="articulos-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {articulos.map((articulo) => {
                    const yaAgregado = articulosYaAgregados.includes(articulo.id)
                    return (
                      <tr key={articulo.id} className={yaAgregado ? 'disabled' : ''}>
                        <td className="mono">{articulo.id?.substring(0, 8)}...</td>
                        <td>{articulo.codigo || '—'}</td>
                        <td>{articulo.tipoArticulo?.nombre || '—'}</td>
                        <td>
                          <span className={`badge badge-${articulo.estado?.toLowerCase() || 'desconocido'}`}>
                            {articulo.estado || 'Desconocido'}
                          </span>
                        </td>
                        <td>{articulo.marca || '—'}</td>
                        <td>{articulo.modelo || '—'}</td>
                        <td>
                          <button
                            className="btn-select"
                            onClick={() => handleSelectArticulo(articulo)}
                            disabled={yaAgregado}
                            title={yaAgregado ? 'Este artículo ya está agregado' : 'Seleccionar artículo'}
                          >
                            {yaAgregado ? 'Agregado' : 'Seleccionar'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="modal-footer">
                <div className="pagination-info">
                  Mostrando {articulos.length} de {totalItems} artículos
                  (Página {currentPage} de {totalPages})
                </div>

                <div className="pagination-controls">
                  <button
                    className="btn-pagination"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || loading}
                  >
                    ← Anterior
                  </button>

                  <span className="page-indicator">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    className="btn-pagination"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || loading}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No hay artículos disponibles con los filtros seleccionados</p>
              {!sedeOrigen || !tipoArticulo ? (
                <small>Por favor, selecciona una sede origen y un tipo de artículo</small>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalArticulos
