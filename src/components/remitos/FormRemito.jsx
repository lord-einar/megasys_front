import { useState, useEffect } from 'react'
import { personalAPI, sedesAPI } from '../../services/api'
import './FormRemito.css'

/**
 * FormRemito - Formulario principal para crear/editar remitos
 *
 * Campos:
 * - Número: Automático (readonly)
 * - Fecha: Fecha del día (readonly)
 * - Solicitante: Personal de cualquier sede
 * - Técnico: Solo personal con rol "Sistemas"
 * - Sede Origen: Default "Depósito"
 * - Sede Destino: Requerido
 */
function FormRemito({ formData, setFormData, onSubmit, loading, error }) {
  const [personal, setPersonal] = useState([])
  const [sistemasPersonal, setSistemasPersonal] = useState([])
  const [sedes, setSedes] = useState([])
  const [personalLoading, setPersonalLoading] = useState(true)

  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    try {
      setPersonalLoading(true)
      const [personalRes, sedesRes] = await Promise.all([
        personalAPI.list({ limit: 100 }),
        sedesAPI.list({ limit: 100 })
      ])

      const allPersonal = personalRes.data || []
      setPersonal(allPersonal)

      // Filtrar personal con rol "Sistemas"
      const sistemas = allPersonal.filter(p => p.rol?.nombre === 'Sistemas')
      setSistemasPersonal(sistemas)

      // Obtener sedes y buscar "Depósito"
      const allSedes = sedesRes.data || []
      setSedes(allSedes)

      // Set default sede origen as "Depósito" if not already set
      if (allSedes.length > 0) {
        // Buscar sede con nombre que incluya "depósito" (case-insensitive)
        const deposito = allSedes.find(s =>
          s.nombre_sede?.toLowerCase().includes('depósito') ||
          s.nombre?.toLowerCase().includes('depósito')
        )

        if (deposito && !formData.sede_origen_id) {
          setFormData(prev => ({
            ...prev,
            sede_origen_id: deposito.id
          }))
        }
      }
    } catch (err) {
      console.error('Error loading form data:', err)
    } finally {
      setPersonalLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const getSedeNombre = (sedeId) => {
    const sede = sedes.find(s => s.id === sedeId)
    return sede ? sede.nombre : ''
  }

  const getPersonalNombre = (personalId) => {
    const person = personal.find(p => p.id === personalId)
    return person ? `${person.nombre} ${person.apellido}` : ''
  }

  return (
    <div className="form-remito">
      <h2>Crear Nuevo Remito</h2>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="remito-form">
        {/* Primera fila: Número y Fecha (readonly) */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="numero_remito">Número de Remito</label>
            <input
              type="text"
              id="numero_remito"
              value={formData.numero_remito || 'Automático'}
              disabled
              className="input-readonly"
              placeholder="Se genera automáticamente"
            />
            <small className="help-text">Se genera automáticamente al crear</small>
          </div>

          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input
              type="date"
              id="fecha"
              value={formData.fecha || getCurrentDate()}
              disabled
              className="input-readonly"
            />
            <small className="help-text">Fecha del sistema</small>
          </div>
        </div>

        {/* Segunda fila: Solicitante y Técnico */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="solicitante_id">
              Solicitante <span className="required">*</span>
            </label>
            <select
              id="solicitante_id"
              name="solicitante_id"
              value={formData.solicitante_id || ''}
              onChange={handleInputChange}
              disabled={personalLoading}
              className="input-select"
            >
              <option value="">-- Selecciona un solicitante --</option>
              {personal.length > 0 && (
                <>
                  {personal.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido} {p.sede?.nombre ? `(${p.sede.nombre})` : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
            <small className="help-text">Mostrar nombre, apellido y sede</small>
            {formData.solicitante_id && (
              <p className="selected-info">
                ✓ {getPersonalNombre(formData.solicitante_id)}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tecnico_asignado_id">
              Técnico (Sistemas) <span className="required">*</span>
            </label>
            <select
              id="tecnico_asignado_id"
              name="tecnico_asignado_id"
              value={formData.tecnico_asignado_id || ''}
              onChange={handleInputChange}
              disabled={personalLoading || sistemasPersonal.length === 0}
              className="input-select"
            >
              <option value="">-- Selecciona un técnico --</option>
              {sistemasPersonal.length > 0 ? (
                sistemasPersonal.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido}
                  </option>
                ))
              ) : (
                <option disabled>No hay técnicos disponibles</option>
              )}
            </select>
            <small className="help-text">Solo personal con rol "Sistemas"</small>
            {formData.tecnico_asignado_id && (
              <p className="selected-info">
                ✓ {getPersonalNombre(formData.tecnico_asignado_id)}
              </p>
            )}
          </div>
        </div>

        {/* Tercera fila: Sedes */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sede_origen_id">
              Sede Origen <span className="required">*</span>
            </label>
            <select
              id="sede_origen_id"
              name="sede_origen_id"
              value={formData.sede_origen_id || ''}
              onChange={handleInputChange}
              disabled={personalLoading}
              className="input-select"
            >
              <option value="">-- Selecciona sede origen --</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <small className="help-text">Por defecto: Depósito</small>
            {formData.sede_origen_id && (
              <p className="selected-info">
                ✓ {getSedeNombre(formData.sede_origen_id)}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="sede_destino_id">
              Sede Destino <span className="required">*</span>
            </label>
            <select
              id="sede_destino_id"
              name="sede_destino_id"
              value={formData.sede_destino_id || ''}
              onChange={handleInputChange}
              disabled={personalLoading}
              className="input-select"
            >
              <option value="">-- Selecciona sede destino --</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <small className="help-text">Sede donde irán los artículos</small>
            {formData.sede_destino_id && (
              <p className="selected-info">
                ✓ {getSedeNombre(formData.sede_destino_id)}
              </p>
            )}
          </div>
        </div>

        {/* Observaciones */}
        <div className="form-row full-width">
          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones || ''}
              onChange={handleInputChange}
              rows="3"
              placeholder="Notas adicionales sobre el remito..."
              className="input-textarea"
            />
          </div>
        </div>

        {/* Información sobre artículos */}
        <div className="form-info">
          <p>
            <strong>Artículos agregados:</strong> {formData.articulos?.length || 0}
          </p>
          {formData.articulos?.length === 0 && (
            <p className="warning-text">⚠️ Debes agregar al menos un artículo</p>
          )}
        </div>

        {/* Submit button */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || personalLoading}
            className="btn btn-primary"
          >
            {loading ? 'Creando remito...' : 'Continuar con Artículos'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormRemito
