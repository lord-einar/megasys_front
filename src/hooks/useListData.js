import { useState, useEffect, useCallback } from 'react'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'

/**
 * Hook personalizado para manejar listados con paginación, búsqueda y estados
 *
 * @param {Function} apiFunction - Función de la API que obtiene los datos
 * @param {Object} options - Opciones de configuración
 * @param {number} options.initialLimit - Límite inicial de items por página (default: 10)
 * @param {Object} options.initialFilters - Filtros iniciales adicionales
 * @param {boolean} options.autoLoad - Si debe cargar automáticamente al montar (default: true)
 * @param {Array} options.dependencies - Dependencias adicionales para recargar datos
 *
 * @returns {Object} Estado y funciones para manejar el listado
 */
export const useListData = (apiFunction, options = {}) => {
  const {
    initialLimit = 10,
    initialFilters = {},
    autoLoad = true,
    dependencies = []
  } = options

  // Estados principales
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Paginación
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  // Filtros
  const [filters, setFilters] = useState(initialFilters)

  /**
   * Función principal para cargar datos
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Preparar parámetros para la API
      const params = {
        page,
        limit,
        ...filters
      }

      // Llamar a la API
      const response = await apiFunction(params)

      // Normalizar respuesta
      const normalized = normalizeApiResponse(response, limit)

      // Actualizar estados
      setData(normalized.data)
      setTotalRecords(normalized.total)
      setTotalPages(normalized.totalPages)

    } catch (err) {
      setError(err.message || 'Error al cargar datos')
      console.error('Error cargando datos:', err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [apiFunction, page, limit, filters, ...dependencies])

  /**
   * Cargar datos automáticamente cuando cambien las dependencias
   */
  useEffect(() => {
    if (autoLoad) {
      loadData()
    }
  }, [loadData, autoLoad])

  /**
   * Actualizar filtros y resetear a página 1
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }))
    setPage(1)
  }, [])

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFilters)
    setPage(1)
  }, [initialFilters])

  /**
   * Cambiar de página
   */
  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages])

  /**
   * Página anterior
   */
  const previousPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1))
  }, [])

  /**
   * Página siguiente
   */
  const nextPage = useCallback(() => {
    setPage(prev => Math.min(totalPages, prev + 1))
  }, [totalPages])

  /**
   * Recargar datos (útil después de crear/editar/eliminar)
   */
  const reload = useCallback(() => {
    loadData()
  }, [loadData])

  return {
    // Datos
    data,
    loading,
    error,

    // Paginación
    page,
    limit,
    totalPages,
    totalRecords,

    // Filtros
    filters,
    updateFilters,
    clearFilters,

    // Acciones
    goToPage,
    previousPage,
    nextPage,
    reload,

    // Para casos especiales donde se necesite control manual
    setData,
    setError,
    setPage
  }
}
