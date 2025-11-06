import { useState } from 'react'
import './TablaArticulos.css'

/**
 * TablaArticulos - Tabla de artículos agregados al remito
 *
 * Props:
 * - articulos: array de artículos agregados
 * - onRemoveArticulo: función callback al eliminar un artículo
 * - onTogglePrestamo: función callback al cambiar es_prestamo
 * - onSetFechaDevolucion: función callback para establecer fecha de devolución
 * - onSelectFechaDevolucion: función callback al abrir modal de fecha
 */
function TablaArticulos({
  articulos = [],
  onRemoveArticulo,
  onTogglePrestamo,
  onSetFechaDevolucion,
  onSelectFechaDevolucion
}) {
  const [expandedRow, setExpandedRow] = useState(null)

  const handleTogglePrestamo = (index) => {
    onTogglePrestamo(index)
    // Si se desmarca como préstamo, limpiar fecha
    if (articulos[index]?.es_prestamo) {
      onSetFechaDevolucion(index, null)
    }
  }

  const toggleExpanded = (index) => {
    setExpandedRow(expandedRow === index ? null : index)
  }

  if (articulos.length === 0) {
    return (
      <div className="tabla-articulos-empty">
        <p>No hay artículos agregados aún</p>
      </div>
    )
  }

  return (
    <div className="tabla-articulos-container">
      <div className="overflow-x-auto">
        <table className="tabla-articulos">
        <thead>
          <tr>
            <th className="col-expand"></th>
            <th className="col-codigo">Código</th>
            <th className="col-tipo">Tipo</th>
            <th className="col-marca">Marca</th>
            <th className="col-modelo">Modelo</th>
            <th className="col-prestamo">Préstamo</th>
            <th className="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {articulos.map((articulo, index) => (
            <React.Fragment key={`${articulo.id}-${index}`}>
              <tr className={articulo.es_prestamo ? 'row-prestamo' : 'row-transferencia'}>
                <td className="col-expand">
                  <button
                    className="expand-btn"
                    onClick={() => toggleExpanded(index)}
                    title={expandedRow === index ? 'Contraer' : 'Expandir'}
                  >
                    {expandedRow === index ? '▼' : '▶'}
                  </button>
                </td>
                <td className="col-codigo mono">{articulo.codigo || '—'}</td>
                <td className="col-tipo">{articulo.tipoArticulo?.nombre || '—'}</td>
                <td className="col-marca">{articulo.marca || '—'}</td>
                <td className="col-modelo">{articulo.modelo || '—'}</td>
                <td className="col-prestamo">
                  <label className="checkbox-custom">
                    <input
                      type="checkbox"
                      checked={articulo.es_prestamo || false}
                      onChange={() => handleTogglePrestamo(index)}
                      aria-label={`Marcar ${articulo.codigo || 'artículo'} como préstamo`}
                    />
                    <span className="checkbox-label">
                      {articulo.es_prestamo ? 'Sí' : 'No'}
                    </span>
                  </label>
                </td>
                <td className="col-acciones">
                  <button
                    className="btn-remove"
                    onClick={() => onRemoveArticulo(index)}
                    title="Eliminar artículo"
                    aria-label={`Eliminar ${articulo.codigo || 'artículo'}`}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>

              {expandedRow === index && articulo.es_prestamo && (
                <tr className="row-details">
                  <td colSpan="7">
                    <div className="details-content">
                      <div className="detail-field">
                        <label>Fecha de Devolución Esperada</label>
                        <div className="fecha-devolucion-input">
                          <input
                            type="text"
                            value={
                              articulo.fecha_devolucion_esperada
                                ? new Date(articulo.fecha_devolucion_esperada)
                                    .toLocaleDateString('es-AR')
                                : 'Sin especificar'
                            }
                            readOnly
                            className="fecha-display"
                          />
                          <button
                            className="btn-set-fecha"
                            onClick={() => onSelectFechaDevolucion(index)}
                            title="Establecer fecha de devolución"
                          >
                            📅 Establecer fecha
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      </div>

      <div className="tabla-summary">
        <div className="summary-item">
          <strong>Total de artículos:</strong> {articulos.length}
        </div>
        <div className="summary-item">
          <strong>Transferencias:</strong> {articulos.filter(a => !a.es_prestamo).length}
        </div>
        <div className="summary-item">
          <strong>Préstamos:</strong> {articulos.filter(a => a.es_prestamo).length}
        </div>
      </div>
    </div>
  )
}

// Componente necesario para React.Fragment
import React from 'react'

export default TablaArticulos
